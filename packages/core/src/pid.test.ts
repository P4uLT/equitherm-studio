import { describe, it, expect } from 'vitest';
import { computePID, createPIDState, isInDeadband, getRoomTempActual } from './pid';

describe('createPIDState', () => {
  it('should create state with default values', () => {
    const state = createPIDState();
    expect(state).toHaveProperty('kp');
    expect(state).toHaveProperty('ki');
    expect(state).toHaveProperty('kd');
    expect(state).toHaveProperty('enabled');
    expect(state).toHaveProperty('mode');
  });

  it('should override default values', () => {
    const state = createPIDState({ kp: 5.0, ki: 0.3 });
    expect(state.kp).toBe(5.0);
    expect(state.ki).toBe(0.3);
  });
});

describe('isInDeadband', () => {
  it('should return false when deadband is disabled', () => {
    expect(isInDeadband(1, { enabled: false, thresholdHigh: 0.5, thresholdLow: -0.5, kpMultiplier: 0.1 })).toBe(false);
  });

  it('should return false when deadband is undefined', () => {
    expect(isInDeadband(1, undefined)).toBe(false);
  });

  it('should return true when error is within thresholds', () => {
    const deadband = {
      enabled: true,
      thresholdLow: -0.5,
      thresholdHigh: 0.5,
      kpMultiplier: 0.1,
    };
    // isInDeadband uses -error, so error=0.3 -> -0.3 which is in range
    expect(isInDeadband(-0.3, deadband)).toBe(true);
    expect(isInDeadband(0.3, deadband)).toBe(true);
  });

  it('should return false when error is outside thresholds', () => {
    const deadband = {
      enabled: true,
      thresholdLow: -0.5,
      thresholdHigh: 0.5,
      kpMultiplier: 0.1,
    };
    expect(isInDeadband(-1.0, deadband)).toBe(false);
    expect(isInDeadband(1.0, deadband)).toBe(false);
  });
});

describe('computePID', () => {
  it('should compute basic PID output without deadband', () => {
    const state = createPIDState({
      kp: 2.0,
      ki: 0.1,
      kd: 0,
      deadband: { enabled: false, thresholdHigh: 0.5, thresholdLow: -0.5, kpMultiplier: 0.1 }
    });
    const result = computePID(state, 22, 20); // setpoint=22, actual=20, error=2

    expect(result.p).toBe(4.0); // 2.0 * 2
    expect(result.i).toBeCloseTo(0.2); // 0.1 * 2
    expect(result.d).toBe(0);
    expect(result.total).toBeCloseTo(4.2);
  });

  it('should return zero for zero error', () => {
    const state = createPIDState({
      kp: 2.0,
      ki: 0.1,
      kd: 0,
      deadband: { enabled: false, thresholdHigh: 0.5, thresholdLow: -0.5, kpMultiplier: 0.1 }
    });
    const result = computePID(state, 21, 21);

    expect(result.p).toBe(0);
    expect(result.i).toBe(0);
    expect(result.d).toBe(0);
    expect(result.total).toBe(0);
  });

  it('should handle negative error without deadband', () => {
    const state = createPIDState({
      kp: 2.0,
      ki: 0.1,
      kd: 0,
      deadband: { enabled: false, thresholdHigh: 0.5, thresholdLow: -0.5, kpMultiplier: 0.1 }
    });
    const result = computePID(state, 20, 22); // error = -2

    expect(result.p).toBe(-4.0);
    expect(result.i).toBeCloseTo(-0.2);
    expect(result.total).toBeCloseTo(-4.2);
  });

  it('should apply deadband kpMultiplier when in deadband', () => {
    const state = createPIDState({
      kp: 2.0,
      ki: 0.1,
      kd: 0,
      deadband: {
        enabled: true,
        thresholdLow: -0.5,
        thresholdHigh: 0.5,
        kpMultiplier: 0.5,
      },
    });
    // error = 0.3, -error = -0.3 which is in deadband
    const result = computePID(state, 21.3, 21);

    // P should be reduced by multiplier: 2.0 * 0.3 * 0.5 = 0.3
    expect(result.p).toBeCloseTo(0.3, 5);
  });

  it('should apply pdmOffset when outside deadband', () => {
    const state = createPIDState({
      kp: 2.0,
      ki: 0.0,
      kd: 0,
      deadband: {
        enabled: true,
        thresholdLow: -0.5,
        thresholdHigh: 0.5,
        kpMultiplier: 0.1,
      },
    });
    const result = computePID(state, 22, 20); // error = 2, outside deadband

    // P = kp * error + pdmOffset
    // pdmOffset = (threshold - (multiplier * threshold)) * kp
    //           = (-0.5 - (0.1 * -0.5)) * 2.0 = (-0.5 + 0.05) * 2.0 = -0.9
    // P = 2.0 * 2 + (-0.9) = 4 - 0.9 = 3.1
    expect(result.p).toBeCloseTo(3.1, 5);
  });
});

describe('getRoomTempActual', () => {
  it('should return roomTemp directly in absolute mode', () => {
    const state = { mode: 'absolute', roomTemp: 22 };
    expect(getRoomTempActual(state, 21)).toBe(22);
  });

  it('should return target + offset in offset mode', () => {
    const state = { mode: 'offset', roomTemp: 2 };
    expect(getRoomTempActual(state, 21)).toBe(23);
  });

  it('should handle negative offset', () => {
    const state = { mode: 'offset', roomTemp: -1.5 };
    expect(getRoomTempActual(state, 21)).toBe(19.5);
  });
});
