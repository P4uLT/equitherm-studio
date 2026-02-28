// src/core/constants.ts
import type { CurveLimits, DefaultPIDParams } from '../types';

// Curve parameter limits
export const CURVE_LIMITS: CurveLimits = {
  t_target: { min: 16, max: 26, default: 21 },
  hc: { min: 0.5, max: 3.0, default: 0.9 },
  n: { min: 1.0, max: 2.0, default: 1.25 },
  shift: { min: -15, max: 15, default: 0 },
  minFlow: { min: 15, max: 35, default: 20 },
  maxFlow: { min: 50, max: 90, default: 70 },
  t_out_min: { min: -30, max: 5, default: -20 },
  t_out_max: { min: 0, max: 30, default: 20 },
};

// Default PID parameters
export const DEFAULT_PID_PARAMS: DefaultPIDParams = {
  enabled: true,
  mode: 'offset',
  roomTemp: 0,
  kp: 1.0,
  ki: 0.0,
  kd: 0.0,
  deadband: {
    enabled: true,
    thresholdHigh: 0.3,
    thresholdLow: -0.3,
    kpMultiplier: 0.1,
  },
};
