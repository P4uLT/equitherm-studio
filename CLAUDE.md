# CLAUDE.md

Guidance for Claude Code when working with this project.

## Project Overview

Interactive Equitherm Heating Curve Calculator for HVAC professionals. Calculates flow temperature based on outdoor temperature using the equitherm curve formula with real-time Chart.js visualization. Outputs ESPHome-compatible YAML.

## Commands

```bash
npm run dev          # Start dev server (localhost:5173)
npm run build        # Production build to dist/app/
npm run build:lib    # Build core library to dist/core/equitherm-core.js
npm run build:single # Build standalone HTML to dist/single-file/index.html
npm run preview      # Preview production build
npm run test         # Run tests once (Vitest)
npm run test:watch   # Run tests in watch mode
npm run typecheck    # TypeScript type check (strict mode)
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Build | Vite 5.x (3 configs: main, lib, single) |
| UI | React 19 |
| State | Zustand |
| Charts | Chart.js (auto-import) |
| Styling | CSS Modules + CSS Custom Properties |
| Testing | Vitest |

## File Structure

```
src/
├── core/                    # Pure calculation logic (no DOM deps)
│   ├── index.ts             # Public exports
│   ├── constants.ts         # CURVE_LIMITS, DEFAULT_PID_PARAMS
│   ├── curve.ts             # computeFlowTemperature()
│   ├── pid.ts               # computePID(), createPIDState()
│   ├── curve.test.ts        # Curve unit tests
│   └── pid.test.ts          # PID unit tests
│
├── types/                   # TypeScript type definitions
│   ├── index.ts             # Re-exports all types
│   ├── core.ts              # CurveParams, PIDState, PIDResult
│   └── store.ts             # StoreState, CurveState, PIDStoreSlice
│
├── store/
│   └── useStore.ts          # Zustand store with typed setters
│
├── config/
│   ├── storage.ts           # localStorage, URL param handling
│   └── yaml.ts              # ESPHome YAML generator
│
├── contexts/
│   └── ThemeContext.tsx     # Theme provider (esphome/esphome-light)
│
├── components/
│   ├── Chart/               # Heating curve visualization
│   ├── ControlsCard/        # Curve parameter controls
│   ├── PIDPanel/            # PID configuration panel
│   ├── Header/              # App header + presets dropdown
│   ├── ResultDisplay/       # Current flow temp display
│   ├── Toast/               # Toast notifications
│   └── Modals/              # Save/YAML modal dialogs
│
├── styles/
│   ├── tokens.css           # Design tokens (colors, spacing)
│   ├── themes.css           # Theme variables
│   ├── base.css             # Reset, typography
│   └── responsive.css       # Media queries
│
├── App.tsx                  # Root component
├── main.tsx                 # Entry point
└── index.css                # Global styles import
```

## TypeScript

### Type Definitions

Types are organized in `src/types/`:

| File | Purpose |
|------|---------|
| `core.ts` | Domain types: `CurveParams`, `PIDState`, `PIDResult`, `DeadbandConfig` |
| `store.ts` | Store types: `StoreState`, `CurveState`, `PIDStoreSlice`, `ComputedState` |

### Type-Safe Zustand Setters

```typescript
// Generic setters with union key types
setCurveParam: <K extends keyof CurveState>(k: K, v: CurveState[K]) => void
setPidParam: <K extends keyof PIDStoreSlice>(k: K, v: PIDStoreSlice[K]) => void

// Usage - TypeScript enforces correct key/value pairs
setCurveParam('tTarget', 22);     // ✅ Correct
setCurveParam('tTarget', '22');   // ❌ Type error
setCurveParam('invalid', 22);     // ❌ Type error
```

### Strict Mode

The project uses TypeScript strict mode. Key implications:
- No implicit `any` - all types must be explicit
- Strict null checks - handle `null` and `undefined` explicitly
- No unused locals/parameters - remove or prefix with `_`

## Architecture

### Three-Layer Structure

```
┌─────────────────────────────────────────────────────┐
│                   Components                        │
│  (React UI - subscribes to store via selectors)    │
├─────────────────────────────────────────────────────┤
│                    Store                            │
│  (Zustand - typed state + generic setters)         │
├─────────────────────────────────────────────────────┤
│                     Core                            │
│  (Pure functions - no DOM/framework dependencies)  │
└─────────────────────────────────────────────────────┘
```

**Data Flow:**
1. User interacts with Component
2. Component calls store setter (e.g., `setCurveParam`)
3. Store updates state
4. Components re-render via Zustand selectors
5. `computed` values updated in `App.tsx` useEffect

### State Slices

| Slice | Purpose | Example Values |
|-------|---------|----------------|
| `curve` | Heating curve params | `tTarget`, `hc`, `n`, `shift`, `minFlow`, `maxFlow` |
| `pid` | PID configuration | `enabled`, `kp`, `ki`, `kd`, deadband settings |
| `ui` | UI-only state | `tCurrent` (outdoor temp slider) |
| `computed` | Derived values | `flowTemp`, `pidRawOutput`, `status` |

### Core Library Exports

```typescript
import {
  computeFlowTemperature,  // Main curve calculation
  computePID,              // PID output calculation
  createPIDState,          // Create PID state object
  isInDeadband,            // Check if error in deadband
  getRoomTempActual,       // Resolve room temp from mode
  CURVE_LIMITS,            // Parameter constraints
  DEFAULT_PID_PARAMS       // Default PID configuration
} from './core';
```

### Heating Curve Formula

```
t_flow = t_target + shift + hc × (t_target - t_outdoor)^(1/n)
```

- Clamped to `[minFlow, maxFlow]`
- Returns `minFlow` for invalid inputs (NaN, n ≤ 0)

### PID Implementation

| Feature | Description |
|---------|-------------|
| **Offset mode** | Room temp tracked as offset from target |
| **Absolute mode** | Room temp is absolute value |
| **Deadband** | Reduces Kp when error within `[thresholdLow, thresholdHigh]` |
| **D-term** | Requires time-series data (not previewed in chart) |

## Theming

### Theme System

Two themes: `esphome` (dark) and `esphome-light`.

```typescript
// ThemeContext provides:
theme: 'esphome' | 'esphome-light'
setTheme: (theme) => void
toggleTheme: () => void
isDark: boolean
isLight: boolean
```

### CSS Custom Properties

Themes defined in `src/styles/themes.css`:

```css
[data-theme="esphome"] {
  --bg-primary: #1c2028;
  --text-primary: #e8eaed;
  /* ... */
}

[data-theme="esphome-light"] {
  --bg-primary: #ffffff;
  --text-primary: #1c2028;
  /* ... */
}
```

## Testing

### Test Location

Tests are co-located with source files: `*.test.ts`

### Test Structure

```typescript
import { describe, it, expect } from 'vitest';

describe('functionName', () => {
  describe('category', () => {
    it('should do something', () => {
      // Arrange
      const params = { ...defaultParams, key: value };
      // Act
      const result = functionUnderTest(params);
      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

### Testing Patterns

| Pattern | Usage |
|---------|-------|
| **Default params** | Create `defaultParams` object at describe level |
| **Category describes** | Group tests: `basic calculations`, `clamping`, `input validation` |
| **Edge cases** | Test NaN, inverted ranges, boundary values |
| **Clamp tests** | Verify min/max flow constraints |

## Key Conventions

1. **Selector pattern**: Use Zustand selectors to minimize re-renders
   ```typescript
   const tTarget = useStore(s => s.curve.tTarget);  // ✅
   const { curve } = useStore();                     // ❌ Re-renders on any change
   ```

2. **CSS Modules**: All component styles use `.module.css`
3. **Flat PID structure**: PID params are flat properties in store, not nested
4. **Theme via context**: Theme state in `ThemeContext`, not Zustand
5. **Co-located tests**: Test files live next to source (`*.test.ts`)
6. **Inline SVG icons**: Icons defined as JSX, not imported
7. **Index re-exports**: Each component folder has `index.ts` for clean imports

## Component Patterns

### SliderControl

```typescript
interface SliderControlProps {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  unit?: string;
  onChange: (value: number) => void;
  tooltip?: string;
}
```

### InfoTooltip

```typescript
interface InfoTooltipProps {
  title?: string;
  children: React.ReactNode;  // Tooltip content
  icon?: React.ReactNode;     // Custom icon (default: info circle)
  position?: 'sideLeft';
  size?: 'small';
}
```

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
| `tmin`/`tmax` | tOutMin/tOutMax | Outdoor temp range |
| `tcur` | tCurrent | Current outdoor temp |
| `pid` | enabled | PID enabled (1/0) |
| `kp`/`ki`/`kd` | kp/ki/kd | PID gains |
| `db` | deadbandEnabled | Deadband (1/0) |
| `th`/`tl` | deadbandThresholdHigh/Low | Deadband thresholds |

## ESPHome Integration

`src/config/yaml.ts` generates ESPHome climate component YAML:

- Only non-zero values included
- Smart formatting (trailing zeros stripped, min 1 decimal)
- Optional diagnostic sensors and runtime tuning numbers

## Chart Optimization

- Single `useEffect` handles mount, update, and cleanup
- `requestAnimationFrame` debouncing prevents excessive re-renders
- PID runtime state stored in `useRef` to avoid re-renders
- Chart instance persisted in `useRef`
