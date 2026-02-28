// src/types/core.ts

// Single curve parameter limit
export interface ParamLimit {
  min: number;
  max: number;
  default: number;
}

// Curve parameter limits (matches CURVE_LIMITS structure)
export interface CurveLimits {
  t_target: ParamLimit;
  hc: ParamLimit;
  n: ParamLimit;
  shift: ParamLimit;
  minFlow: ParamLimit;
  maxFlow: ParamLimit;
  t_out_min: ParamLimit;
  t_out_max: ParamLimit;
}

// Curve calculation parameters
export interface CurveParams {
  tTarget: number;
  tOutdoor: number;
  hc: number;
  n: number;
  shift: number;
  minFlow?: number;
  maxFlow?: number;
}

// Deadband configuration (nested in DEFAULT_PID_PARAMS)
export interface DeadbandConfig {
  enabled: boolean;
  thresholdHigh: number;
  thresholdLow: number;
  kpMultiplier: number;
}

// Default PID parameters structure (matches DEFAULT_PID_PARAMS)
export interface DefaultPIDParams {
  enabled: boolean;
  mode: 'offset' | 'absolute';
  roomTemp: number;
  kp: number;
  ki: number;
  kd: number;
  deadband: DeadbandConfig;
}

// PID computation result
export interface PIDResult {
  total: number;
  p: number;
  i: number;
  d: number;
}

// PID state for computation (accepts either nested or flat structure)
export interface PIDState {
  kp: number;
  ki: number;
  kd: number;
  deadband?: DeadbandConfig;
}
