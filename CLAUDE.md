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
│   │   │   ├── pid.ts           # computePID(), isInDeadband()
│   │   │   ├── types.ts         # Core type definitions
│   │   │   ├── index.ts         # Public exports
│   │   │   └── *.test.ts        # Unit tests
│   │   └── package.json
│   │
│   └── web/                     # @equitherm-studio/web
│       ├── src/
│       │   ├── components/      # React UI components
│       │   │   ├── AppShell/    # Header, Sidebar, OutputDisplay, StatusIndicator, MobileBottomSheet, ExportSheet
│       │   │   ├── Chart/       # Chart, useChartData, useComputedFlow
│       │   │   ├── ControlsCard/# ControlsCard, SliderControl, SliderPair, InfoTooltip
│       │   │   ├── SidePanel/   # SidePanel (Curve/PID/Presets tabs), PresetsPanel
│       │   │   └── ui/          # shadcn/ui primitives
│       │   ├── store/           # Zustand state management
│       │   ├── config/          # storage.ts, yaml.ts, URL parsing
│       │   ├── contexts/        # ThemeContext
│       │   ├── lib/             # Utilities (cn, toast, pid helpers)
│       │   ├── styles/          # Tailwind base, themes
│       │   └── types/           # Web-specific types
│       └── package.json
│
├── pnpm-workspace.yaml
└── package.json                 # Root scripts
```

## Tech Stack

| Layer           | Technology                                      |
| --------------- | ----------------------------------------------- |
| Package Manager | pnpm 9 (workspaces)                             |
| Build           | Vite 5.x                                        |
| UI              | React 19 + shadcn/ui (Radix primitives)         |
| State           | Zustand                                         |
| Charts          | Recharts                                        |
| Styling         | Tailwind CSS 3.x + CSS Custom Properties        |
| Responsive      | @tailwindcss/container-queries + fluid-tailwind |
| Icons           | Lucide React                                    |
| Testing         | Vitest                                          |

## Package Details

### @equitherm-studio/core

Pure calculation library with zero DOM/framework dependencies. Can be used in any JavaScript environment.

**Exports:**
```typescript
import {
  computeFlowTemperature,  // Main curve calculation
  computePID,              // PID output calculation
  isInDeadband,            // Check if error in deadband
} from '@equitherm-studio/core';
```

**Types:**
```typescript
import type {
  CurveParams,
  PIDState,
  PIDResult,
  DeadbandConfig,
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
┌─────────────────────────────────────────────────────────────┐
│                    UI Components (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ Header   │  │Controls  │  │  Chart   │  │  PID Panel   │ │
│  │          │  │  Card    │  │          │  │              │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘ │
│       │             │             │               │         │
│       └─────────────┴──────┬──────┴───────────────┘         │
│                            │                                 │
│                   ┌────────▼────────┐                       │
│                   │  Zustand Store  │                       │
│                   │  - curve state  │                       │
│                   │  - pid state    │                       │
│                   │  - ui state     │                       │
│                   │  - computed     │                       │
│                   └────────┬────────┘                       │
└────────────────────────────┼────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                  @equitherm-studio/core                      │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │computeFlowTemp() │  │   computePID()   │                 │
│  │   Pure function  │  │   Pure function  │                 │
│  └──────────────────┘  └──────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

## State Management

### Store Structure

```typescript
interface StoreState {
  // Heating curve parameters
  curve: {
    tTarget: number;      // 21
    hc: number;           // 0.9
    n: number;            // 1.25
    shift: number;        // 0
    minFlow: number;      // 20
    maxFlow: number;      // 70
    tOutMin: number;      // -20
    tOutMax: number;      // 20
  };

  // PID parameters (flat structure)
  pid: {
    enabled: boolean;
    mode: 'offset' | 'absolute';
    roomTemp: number;
    kp: number;
    ki: number;
    kd: number;
    deadbandEnabled: boolean;
    deadbandThresholdHigh: number;
    deadbandThresholdLow: number;
    deadbandKpMultiplier: number;
    deadbandKiMultiplier: number;
    deadbandKdMultiplier: number;
  };

  // UI state
  ui: {
    tCurrent: number;     // Current outdoor temp slider
  };

  // Computed values
  computed: {
    flowTemp: number | null;
    pidRawOutput: number | null;
    pidScaledOutput: number | null;
    status: 'heating' | 'standby' | 'cooling' | 'high-load';
  };
}
```

### Actions

- `setCurveParam<K>(key, value)` - Typed curve parameter setter
- `setPidParam<K>(key, value)` - Typed PID parameter setter
- `setTCurrent(value)` - Set current outdoor temp
- `setComputed(partial)` - Update computed values
- `loadConfig(config)` - Load partial config

## Key Conventions

1. **Workspace imports**: Web package imports core via `@equitherm-studio/core`
2. **Selector pattern**: Use Zustand selectors to minimize re-renders
3. **Tailwind CSS**: Use Tailwind utility classes; `cn()` for conditional merging
4. **shadcn/ui**: UI primitives in `components/ui/`; use Radix-based components
5. **Co-located tests**: Test files live next to source (`*.test.ts`)
6. **Index re-exports**: Each component folder has `index.ts`
7. **Custom hooks**: Complex computations in hooks (useComputedFlow, useChartData)
8. **Path alias**: Use `@/` for imports (e.g., `@/components/ui/button`)

## Input Validation

Defense-in-depth approach for curve parameters:

**UI Layer** (`ControlsCard.tsx`):
- Slider ranges designed to prevent overlap (e.g., `tOutMin: -30 to -1`, `tOutMax: 1 to 30`)

**Store Layer** (`validation.ts`):
- `validateCurveParam()` - Clamps values when setting individual params
- `validateCurveState()` - Fixes inverted pairs when loading configs
- Invariants: `minFlow < maxFlow`, `tOutMin < tOutMax`

**Core Layer** (`curve.ts`):
- Handles inverted min/max gracefully with `Math.min/max` swap

## Testing

Tests are co-located with source files in `packages/core/src/*.test.ts`.

```bash
pnpm test              # Run all tests
pnpm --filter @equitherm-studio/core test:watch  # Watch mode
```

## Core Features

### Heating Curve Calculator

| Parameter | Range        | Default | Description                        |
| --------- | ------------ | ------- | ---------------------------------- |
| `tTarget` | 16-26°C      | 21°C    | Room setpoint temperature          |
| `hc`      | 0.5-3.0      | 0.9     | Heat curve coefficient (steepness) |
| `n`       | 1.0-2.0      | 1.25    | Curve exponent (non-linearity)     |
| `shift`   | -15 to +15°C | 0°C     | Constant temperature offset        |
| `minFlow` | 15-35°C      | 20°C    | Minimum flow temperature           |
| `maxFlow` | 50-90°C      | 70°C    | Maximum flow temperature           |
| `tOutMin` | -30 to 5°C   | -20°C   | Outdoor temp range minimum         |
| `tOutMax` | 0-30°C       | 20°C    | Outdoor temp range maximum         |

### PID Control System

**Modes**:
- **Offset Mode**: `roomTemp` is an offset from setpoint (-5 to +5°C)
- **Absolute Mode**: `roomTemp` is actual room temperature (10-30°C)

| Parameter | Range | Default | Affects Curve      |
| --------- | ----- | ------- | ------------------ |
| `kp`      | 0-5   | 1.0     | ✅ Instantaneous    |
| `ki`      | 0-0.5 | 0.0     | ❌ YAML export only |
| `kd`      | 0-2   | 0.0     | ❌ YAML export only |

**Deadband Configuration**:
- `thresholdHigh`: 0-2°C (upper bound)
- `thresholdLow`: -2-0°C (lower bound)
- `kpMultiplier`: 0-1 (Kp reduction factor)

### ESPHome YAML Generator

`packages/web/src/config/yaml.ts` generates ESPHome climate component YAML:

- Only non-zero values included
- Smart formatting (trailing zeros stripped)
- Optional diagnostic sensors
- Optional runtime tuning numbers

### URL Parameter Sharing

```
?t=21&hc=0.9&n=1.25&s=0&min=20&max=70&tmin=-20&tmax=20&tcur=5&pid=1&kp=1&ki=0&kd=0&db=1&th=0.3&tl=-0.3&kpm=0.1
```

| Param          | Maps To           | Description            |
| -------------- | ----------------- | ---------------------- |
| `t`            | tTarget           | Room setpoint          |
| `hc`           | hc                | Heat curve coefficient |
| `n`            | n                 | Exponent               |
| `s`            | shift             | Temperature offset     |
| `min`/`max`    | minFlow/maxFlow   | Flow temp limits       |
| `tmin`/`tmax`  | tOutMin/tOutMax   | Outdoor temp range     |
| `tcur`         | tCurrent          | Current outdoor temp   |
| `pid`          | enabled           | PID enabled (1/0)      |
| `kp`/`ki`/`kd` | kp/ki/kd          | PID gains              |
| `db`           | deadbandEnabled   | Deadband (1/0)         |
| `th`/`tl`      | thresholdHigh/Low | Deadband thresholds    |
| `kpm`          | kpMultiplier      | Deadband Kp factor     |

### Presets System

**Storage**: LocalStorage (`equitherm-config-*` keys, max 10 configs)

**Features**:
- Save/Load/Delete named configurations
- Overwrite confirmation dialog
- Timestamp display for each preset

### Theme System

**Themes**:
- **Dark**: ESPHome-inspired dark theme (default)
- **Light**: ESPHome-inspired light theme

**Implementation**:
- CSS Custom Properties for theming
- Tailwind CSS with semantic color tokens
- Persisted in LocalStorage
