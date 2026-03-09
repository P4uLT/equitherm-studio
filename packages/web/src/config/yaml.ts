// src/config/yaml.ts
// ESPHome YAML configuration generator using Mustache templates

import Mustache from 'mustache';
import template from './equitherm.template.mustache?raw';

interface YAMLParams {
  t: number;
  hc: number;
  n: number;
  s: number;
  min: number;
  max: number;
  pid: boolean;
  kp: number;
  ki: number;
  kd: number;
  db: boolean;
  th: number;
  tl: number;
  kpm: number;
  kim?: number;
  kdm?: number;
  // New PID integral limits
  minIntegral?: number;
  maxIntegral?: number;
  // New output parameters
  rateLimitRising?: number;
  rateLimitFalling?: number;
  actionHysteresis?: number;
  writeDeadband?: number;
}

interface YAMLOptions {
  includeSensors?: boolean;
  includeNumbers?: boolean;
}

/**
 * Build view model for Mustache template rendering
 */
function buildViewModel(p: YAMLParams, options: YAMLOptions) {
  return {
    // Header
    date: new Date().toISOString().split('T')[0],

    // Climate base parameters
    t: p.t,

    // Control parameters section (always present)
    controlParams: true,
    hc: p.hc,
    n: p.n,
    shift: p.s !== 0 ? p.s : null,

    // PID within control_parameters
    kp: p.pid && p.kp !== 0 ? p.kp : null,
    ki: p.pid && p.ki !== 0 ? p.ki : null,
    kd: p.pid && p.kd !== 0 ? p.kd : null,
    minIntegral: p.pid && p.minIntegral !== undefined && p.minIntegral !== 0 ? p.minIntegral : null,
    maxIntegral: p.pid && p.maxIntegral !== undefined && p.maxIntegral !== 0 ? p.maxIntegral : null,

    // Output parameters section (always present)
    outputParams: true,
    minFlow: p.min,
    maxFlow: p.max,
    rateLimitRising: p.rateLimitRising !== undefined && p.rateLimitRising !== 0 ? p.rateLimitRising : null,
    rateLimitFalling: p.rateLimitFalling !== undefined && p.rateLimitFalling !== 0 ? p.rateLimitFalling : null,
    actionHysteresis: p.actionHysteresis !== undefined && p.actionHysteresis !== 0 ? p.actionHysteresis : null,
    writeDeadband: p.writeDeadband !== undefined && p.writeDeadband !== 0 ? p.writeDeadband : null,

    // Deadband within output_parameters (requires PID enabled)
    deadbandParams: p.pid && p.db ? true : null,
    thresholdHigh: p.pid && p.db ? p.th : null,
    thresholdLow: p.pid && p.db ? p.tl : null,
    kpMultiplier: p.pid && p.db && p.kpm !== undefined && p.kpm !== 0 ? p.kpm : null,
    kiMultiplier: p.pid && p.db && p.kim !== undefined && p.kim !== 0 ? p.kim : null,
    kdMultiplier: p.pid && p.db && p.kdm !== undefined && p.kdm !== 0 ? p.kdm : null,

    // Diagnostic sensors (conditional)
    includeSensors: options.includeSensors ?? false,
    pid: p.pid,

    // Runtime tuning numbers (conditional)
    includeNumbers: options.includeNumbers ?? false,
    hasShift: p.s !== 0,
    hasRateLimits: p.rateLimitRising !== undefined || p.rateLimitFalling !== undefined,
  };
}

/**
 * Generate ESPHome YAML configuration from config data
 */
export function generateYAML(p: YAMLParams, options: YAMLOptions = {}): string {
  const view = buildViewModel(p, options);
  return Mustache.render(template, view);
}
