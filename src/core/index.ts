// src/core/index.ts
// Public API for equitherm-core library

// Main calculations
export { computeFlowTemperature } from './curve';
export { computePID, createPIDState, isInDeadband, getRoomTempActual } from './pid';

// Constants
export { CURVE_LIMITS, DEFAULT_PID_PARAMS } from './constants';
