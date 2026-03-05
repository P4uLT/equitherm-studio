# equitherm-studio

[![CI](https://github.com/P4uLT/equitherm-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/P4uLT/equitherm-studio/actions/workflows/ci.yml)

Companion tools for the [ESPHome](https://esphome.io) `equitherm` climate component. Visualize heating curves, configure PID parameters, and generate ESPHome YAML configurations.

## Features

- Real-time Recharts visualization of heating curves
- PID control simulation with deadband support
- ESPHome YAML configuration generator (includes Ki/Kd multipliers)
- Dark/light theme (ESPHome style)
- URL parameter sharing for configurations
- Mobile-first responsive design with container queries
- Input validation for curve parameters
- shadcn/ui components with Tailwind CSS

## Packages

This is a pnpm monorepo:

| Package | Description |
|---------|-------------|
| `@equitherm-studio/core` | Pure calculation library (no framework dependencies) |
| `@equitherm-studio/web` | React web application |

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Opens at http://localhost:5173

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start web dev server |
| `pnpm build` | Build all packages |
| `pnpm test` | Run all tests |
| `pnpm typecheck` | TypeScript type check |

## Heating Curve Formula

```
t_flow = t_target + shift + hc × (t_target - t_outdoor)^(1/n)
```

| Parameter | Description | Range |
|-----------|-------------|-------|
| `t_target` | Room setpoint | 16-26°C |
| `hc` | Heat curve coefficient | 0.5-3.0 |
| `n` | Exponent | 1.0-2.0 |
| `shift` | Temperature offset | -15 to +15°C |
| `minFlow` | Minimum flow temp | 15-35°C |
| `maxFlow` | Maximum flow temp | 50-90°C |

## Core Library Usage

```typescript
import {
  computeFlowTemperature,
  computePID,
  createPIDState
} from '@equitherm-studio/core';

// Calculate flow temperature
const flowTemp = computeFlowTemperature({
  tTarget: 21,      // Room setpoint (°C)
  tOutdoor: 5,      // Outdoor temperature (°C)
  hc: 0.9,          // Heat curve coefficient
  n: 1.25,          // Exponent
  shift: 0,         // Offset (°C)
  minFlow: 20,      // Minimum flow (°C)
  maxFlow: 70,      // Maximum flow (°C)
});

// PID control
const pidState = createPIDState({ kp: 2.0, ki: 0.1 });
const correction = computePID(pidState, 22, 20); // setpoint, actual
```

## Tech Stack

- **Build**: Vite 5.x, pnpm workspaces
- **UI**: React 19, shadcn/ui (Radix primitives)
- **State**: Zustand
- **Styling**: Tailwind CSS 3.x, @tailwindcss/container-queries, fluid-tailwind
- **Charts**: Recharts
- **Testing**: Vitest

## Related

- [ESPHome equitherm component](https://github.com/P4uLT/esphome) - The climate component this tool supports

## License

MIT
