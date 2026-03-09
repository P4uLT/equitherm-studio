// src/config/yaml.ts
// ESPHome YAML configuration generator

import * as yaml from 'js-yaml';

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
}

interface YAMLOptions {
  includeSensors?: boolean;
  includeNumbers?: boolean;
}

/**
 * Build climate section configuration object
 */
function buildClimateSection(p: YAMLParams): object {
  const controlParams: Record<string, number> = {
    hc: p.hc,
    n: p.n,
  };
  if (p.s !== 0) {
    controlParams.shift = p.s;
  }

  // Add PID parameters if enabled (only non-zero values)
  if (p.pid) {
    if (p.kp !== 0) controlParams.kp = p.kp;
    if (p.ki !== 0) controlParams.ki = p.ki;
    if (p.kd !== 0) controlParams.kd = p.kd;
  }

  const outputParams: Record<string, number | object> = {
    min_flow_temp: p.min,
    max_flow_temp: p.max,
  };

  // Add deadband parameters if enabled
  if (p.db) {
    const deadbandParams: Record<string, number> = {
      threshold_high: p.th,
      threshold_low: p.tl,
    };
    if (p.kpm !== 0.1) deadbandParams.kp_multiplier = p.kpm;
    if (p.kim !== undefined && p.kim !== 0) deadbandParams.ki_multiplier = p.kim;
    if (p.kdm !== undefined && p.kdm !== 0) deadbandParams.kd_multiplier = p.kdm;
    outputParams.deadband_parameters = deadbandParams;
  }

  return {
    climate: [
      {
        platform: 'equitherm',
        id: 'heating_controller',
        name: 'Equitherm Climate',
        outdoor_sensor: 'outdoor_sensor',
        indoor_sensor: 'indoor_sensor',
        default_target_temperature: p.t,
        heat_output: 'heat_output',
        fallback_outdoor_temp: '0.0',
        control_parameters: controlParams,
        output_parameters: outputParams,
      },
    ],
  };
}

/**
 * Build sensors section configuration object
 * Returns null if no sensors should be included
 */
function buildSensorsSection(p: YAMLParams, includeSensors: boolean): object | null {
  if (!includeSensors) return null;

  const sensors: object[] = [
    {
      platform: 'equitherm',
      climate_id: 'heating_controller',
      type: 'curve_output_raw',
      name: 'Curve Output Raw',
    },
    {
      platform: 'equitherm',
      climate_id: 'heating_controller',
      type: 'final_flow_setpoint',
      name: 'Final Flow Setpoint',
    },
  ];

  if (p.pid) {
    sensors.push({
      platform: 'equitherm',
      climate_id: 'heating_controller',
      type: 'pid_correction',
      name: 'PID Correction',
    });
  }

  return {
    sensor: sensors,
    binary_sensor: [
      {
        platform: 'equitherm',
        climate_id: 'heating_controller',
        outdoor_fallback_active: {
          name: 'Outdoor Sensor Fallback',
        },
        rate_limiting_active: {
          name: 'Rate Limiting Active',
        },
      },
    ],
    text_sensor: [
      {
        platform: 'equitherm',
        climate_id: 'heating_controller',
        control_mode: {
          name: 'Control Mode',
        },
      },
    ],
  };
}

/**
 * Build numbers section configuration object
 * Returns null if no numbers should be included
 */
function buildNumbersSection(p: YAMLParams, includeNumbers: boolean): object | null {
  if (!includeNumbers) return null;

  const numbers: object[] = [
    {
      platform: 'equitherm',
      climate_id: 'heating_controller',
      heat_curve_coefficient: {
        name: 'Heating Curve Coefficient',
      },
    },
    {
      platform: 'equitherm',
      climate_id: 'heating_controller',
      heat_curve_exponent: {
        name: 'Heating Curve Exponent',
      },
    },
  ];

  if (p.s !== 0) {
    numbers.push({
      platform: 'equitherm',
      climate_id: 'heating_controller',
      heat_curve_shift: {
        name: 'Heating Curve Shift',
      },
    });
  }

  if (p.pid) {
    numbers.push(
      {
        platform: 'equitherm',
        climate_id: 'heating_controller',
        pid_proportional_gain: {
          name: 'PID Proportional Gain',
        },
      },
      {
        platform: 'equitherm',
        climate_id: 'heating_controller',
        pid_integral_gain: {
          name: 'PID Integral Gain',
        },
      },
      {
        platform: 'equitherm',
        climate_id: 'heating_controller',
        pid_derivative_gain: {
          name: 'PID Derivative Gain',
        },
      }
    );
  }

  return { number: numbers };
}

/**
 * Build complete YAML configuration object
 */
function buildYAMLConfig(p: YAMLParams, options: YAMLOptions): object {
  const config: Record<string, unknown> = {
    ...buildClimateSection(p),
  };

  const sensorsSection = buildSensorsSection(p, options.includeSensors ?? false);
  if (sensorsSection) {
    Object.assign(config, sensorsSection);
  }

  const numbersSection = buildNumbersSection(p, options.includeNumbers ?? false);
  if (numbersSection) {
    Object.assign(config, numbersSection);
  }

  return config;
}

/**
 * Generate ESPHome YAML configuration from config data
 */
export function generateYAML(p: YAMLParams, options: YAMLOptions = {}): string {
  const config = buildYAMLConfig(p, options);

  const yamlContent = yaml.dump(config, {
    noRefs: true,
    lineWidth: -1,
    quotingType: '"',
    forceQuotes: false,
  });

  // Prepend header comments
  const header = `# Generated by Equitherm Calculator
# ${new Date().toISOString().split('T')[0]}

`;

  return header + yamlContent;
}
