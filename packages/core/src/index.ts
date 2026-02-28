// packages/core/src/index.ts
// Public API for @equitherm-studio/core

// Types
export type {
  CurveParams,
  CurveLimits,
  ParamLimit,
  PIDState,
  PIDResult,
  DeadbandConfig,
  DefaultPIDParams,
} from './types';

// Main calculations
export { computeFlowTemperature } from './curve';
export { computePID, createPIDState, isInDeadband, getRoomTempActual } from './pid';

// Constants
export { CURVE_LIMITS, DEFAULT_PID_PARAMS } from './constants';
