# Equitherm Heating Curve Calculator

Interactive calculator for HVAC professionals to compute flow temperature based on outdoor temperature using the equitherm curve formula.

## Features

- Real-time Chart.js visualization of heating curves
- PID control simulation with deadband support
- Gain scheduling for adaptive control
- Theme support (dark/light)
- Configuration save/load with localStorage
- YAML export for ESPHome integration

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Opens at http://localhost:3000

## Build Commands

| Command | Output | Description |
|---------|--------|-------------|
| `npm run dev` | localhost:3000 | Development server with hot reload |
| `npm run build` | `dist/app/` | Production web app |
| `npm run build:lib` | `dist/core/equitherm-core.js` | ES module library |
| `npm run build:single` | `dist/single-file/index.html` | Standalone HTML file |
| `npm run preview` | localhost:4173 | Preview production build |

## Testing

```bash
npm test        # Run tests once
npm test:watch  # Run tests in watch mode
```

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

```javascript
import { computeFlowTemperature, computePID, createPIDState } from './dist/core/equitherm-core.js';

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

- **Build**: Vite 5.x
- **Charts**: Chart.js 4.x
- **Styling**: CSS3 with CSS Custom Properties
- **Fonts**: Google Fonts (Figtree)

## License

MIT
