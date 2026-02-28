// src/core/pid.ts
import { DEFAULT_PID_PARAMS } from './constants';
import type { DefaultPIDParams, DeadbandConfig, PIDResult } from '../types';

// PID state for computation
interface PIDComputeState {
  mode: string;
  roomTemp: number;
  kp: number;
  ki: number;
  kd: number;
  deadband?: DeadbandConfig;
}

/**
 * Create a fresh PID state object
 */
export function createPIDState(overrides: Partial<DefaultPIDParams> = {}): DefaultPIDParams {
  return {
    ...DEFAULT_PID_PARAMS,
    ...overrides,
  };
}

/**
 * Check if error is within deadband
 */
export function isInDeadband(error: number, deadband: DeadbandConfig | undefined): boolean {
  if (!deadband?.enabled) return false;
  const err = -error;
  return (deadband.thresholdLow < err && err < deadband.thresholdHigh);
}

/**
 * Compute PID output
 */
export function computePID(
  state: PIDComputeState,
  setpoint: number,
  processValue: number
): PIDResult {
  const error = setpoint - processValue;

  let pTerm: number;

  if (state.deadband?.enabled) {
    if (isInDeadband(error, state.deadband)) {
      // In deadband: shallow the proportional term
      pTerm = state.kp * error * state.deadband.kpMultiplier;
    } else {
      // Outside deadband: add pdm_offset to prevent jump at boundary
      pTerm = state.kp * error;
      const threshold = (error < 0) ? state.deadband.thresholdHigh : state.deadband.thresholdLow;
      const pdmOffset = (threshold - (state.deadband.kpMultiplier * threshold)) * state.kp;
      pTerm += pdmOffset;
    }
  } else {
    pTerm = state.kp * error;
  }

  const iTerm = state.ki * error;

  // D-term based on error change (requires previous error tracking)
  // Currently disabled as state doesn't track previous error
  const dTerm = state.kd * 0;

  return {
    total: pTerm + iTerm + dTerm,
    p: pTerm,
    i: iTerm,
    d: dTerm
  };
}

/**
 * Get actual room temperature based on mode
 */
export function getRoomTempActual(state: { mode: string; roomTemp: number }, tTarget: number): number {
  if (state.mode === 'offset') {
    return tTarget + state.roomTemp;
  }
  return state.roomTemp;
}
