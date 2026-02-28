# CLAUDE.md

Guidance for Claude Code when working with this project.

## Project Overview

**equitherm-studio** - Companion tools for the ESPHome `equitherm` climate component. Monorepo containing a pure calculation library (`@equitherm-studio/core`) and React web application (`@equitherm-studio/web`).

## Commands

```bash
pnpm dev          # Start web dev server (localhost:5173)
pnpm dev:core     # Start core package in watch mode
pnpm build        # Build all packages
pnpm test         # Run all tests (Vitest)
pnpm typecheck    # TypeScript type check (strict mode)
```

For local development, [Taskfile.yml](Taskfile.yml) provides the same commands via `task`:
```bash
task dev          # Start web dev server
task build        # Build all packages
task test         # Run tests
task ci           # Run full CI locally
```

## Monorepo Structure

```
equitherm-studio/
├── packages/
│   ├── core/                    # @equitherm-studio/core
│   │   ├── src/
│   │   │   ├── curve.ts         # computeFlowTemperature()
│   │   │   ├── pid.ts           # computePID(), createPIDState()
│   │   │   ├── constants.ts     # CURVE_LIMITS, DEFAULT_PID_PARAMS
│   │   │   ├── types.ts         # Core type definitions
│   │   │   ├── index.ts         # Public exports
│   │   │   └── *.test.ts        # Unit tests
│   │   └── package.json
│   │
│   └── web/                     # @equitherm-studio/web
│       ├── src/
│       │   ├── components/      # React UI components
│       │   ├── store/           # Zustand state management
│       │   ├── config/          # Storage, YAML generator
│       │   ├── contexts/        # ThemeContext
│       │   ├── styles/          # CSS modules, themes
│       │   └── types/           # Web-specific types
│       └── package.json
│
├── pnpm-workspace.yaml
└── package.json                 # Root scripts
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Package Manager | pnpm 9 (workspaces) |
| Build | Vite 5.x |
| UI | React 19 |
| State | Zustand |
| Charts | Chart.js |
| Styling | CSS Modules + CSS Custom Properties |
| Testing | Vitest |

## Package Details

### @equitherm-studio/core

Pure calculation library with zero DOM/framework dependencies. Can be used in any JavaScript environment.

**Exports:**
```typescript
import {
  computeFlowTemperature,  // Main curve calculation
  computePID,              // PID output calculation
  createPIDState,          // Create PID state object
  isInDeadband,            // Check if error in deadband
  getRoomTempActual,       // Resolve room temp from mode
  CURVE_LIMITS,            // Parameter constraints
  DEFAULT_PID_PARAMS       // Default PID configuration
} from '@equitherm-studio/core';
```

**Types:**
```typescript
import type {
  CurveParams,
  PIDState,
  PIDResult,
  DeadbandConfig,
  DefaultPIDParams,
  CurveLimits,
  ParamLimit
} from '@equitherm-studio/core';
```

### @equitherm-studio/web

React web application that consumes `@equitherm-studio/core`. Imports via workspace protocol.

## Heating Curve Formula

```
t_flow = t_target + shift + hc × (t_target - t_outdoor)^(1/n)
```

- Clamped to `[minFlow, maxFlow]`
- Returns `minFlow` for invalid inputs (NaN, n ≤ 0)

## Architecture

```
┌─────────────────────────────────────────────────────┐
│               Web Components (React)                │
│         Subscribes to store via selectors           │
├─────────────────────────────────────────────────────┤
│                 Zustand Store                       │
│           Typed state + generic setters             │
├─────────────────────────────────────────────────────┤
│           @equitherm-studio/core                    │
│        Pure functions (no DOM dependencies)         │
└─────────────────────────────────────────────────────┘
```

## Key Conventions

1. **Workspace imports**: Web package imports core via `@equitherm-studio/core`
2. **Selector pattern**: Use Zustand selectors to minimize re-renders
3. **CSS Modules**: All component styles use `.module.css`
4. **Co-located tests**: Test files live next to source (`*.test.ts`)
5. **Index re-exports**: Each component folder has `index.ts`

## Testing

Tests are co-located with source files in `packages/core/src/*.test.ts`.

```bash
pnpm test              # Run all tests
pnpm --filter @equitherm-studio/core test:watch  # Watch mode
```

## ESPHome Integration

`packages/web/src/config/yaml.ts` generates ESPHome climate component YAML:

- Only non-zero values included
- Smart formatting (trailing zeros stripped)
- Optional diagnostic sensors

## URL Parameter Scheme

Configs can be shared via URL query params:

```
?t=21&hc=0.9&n=1.25&s=0&min=20&max=70&tmin=-20&tmax=20&tcur=5&pid=1&kp=1&ki=0&kd=0&db=1&th=0.3&tl=-0.3
```

| Param | Maps To | Description |
|-------|---------|-------------|
| `t` | tTarget | Room setpoint |
| `hc` | hc | Heat curve coefficient |
| `n` | n | Exponent |
| `s` | shift | Temperature offset |
| `min`/`max` | minFlow/maxFlow | Flow temp limits |
| `pid` | enabled | PID enabled (1/0) |
| `kp`/`ki`/`kd` | kp/ki/kd | PID gains |
