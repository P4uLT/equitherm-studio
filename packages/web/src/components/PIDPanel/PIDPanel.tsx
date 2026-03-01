// src/components/PIDPanel/PIDPanel.tsx
import { useStore } from '../../store/useStore';
import { GainControls } from './GainControls';
import { DeadbandControls } from './DeadbandControls';
import { InfoTooltip } from '../ControlsCard/InfoTooltip';
import { Card } from '@/components/ui/card';

const PIDIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);

export function PIDPanel() {
  const pid = useStore(s => s.pid);
  const setPidParam = useStore(s => s.setPidParam);

  return (
    <Card className={`flex min-w-0 h-full flex-col ${!pid.enabled ? 'opacity-50' : ''}`}>
      {/* Enable Header */}
      <div className="flex items-center gap-2 flex-wrap px-4 py-3 border-b border-[var(--border-color)]">
        <label className="relative inline-block w-9 h-5 flex-shrink-0 cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={pid.enabled}
            onChange={e => setPidParam('enabled', (e.target as HTMLInputElement).checked)}
          />
          <span className="toggle-switch" />
        </label>
        <span className="text-sm font-semibold text-[var(--text-primary)]">PID Control</span>
        <InfoTooltip title="PID Control" icon={<PIDIcon />} position="sideLeft">
          <p><strong>Proportional-Integral-Derivative</strong> control adjusts flow temperature based on room temperature error.</p>
          <p>Room temp can be an offset from setpoint or absolute value.</p>
        </InfoTooltip>
      </div>

      {/* Mode Toggle Row */}
      <div className={`px-4 py-2 border-b border-[var(--border-color)] ${!pid.enabled ? 'pointer-events-none' : ''}`}>
        <div className="flex gap-1 bg-[var(--bg-secondary)] p-0.5 rounded-md border border-[var(--border-color)] w-full">
          <button
            className={`flex-1 py-1 px-2 bg-transparent border-none rounded text-xs cursor-pointer transition-all duration-150 whitespace-nowrap ${pid.mode === 'offset' ? 'bg-[var(--bg-card)] text-[var(--accent-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
            onClick={() => {
              setPidParam('mode', 'offset');
              setPidParam('roomTemp', 0);
            }}
          >
            Offset
          </button>
          <button
            className={`flex-1 py-1 px-2 bg-transparent border-none rounded text-xs cursor-pointer transition-all duration-150 whitespace-nowrap ${pid.mode === 'absolute' ? 'bg-[var(--bg-card)] text-[var(--accent-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
            onClick={() => {
              setPidParam('mode', 'absolute');
              setPidParam('roomTemp', 21);
            }}
          >
            Absolute
          </button>
        </div>
      </div>

      {/* Gains Section */}
      <div className={!pid.enabled ? 'pointer-events-none' : ''}>
        <GainControls />
      </div>

      {/* Deadband Section (collapsible) */}
      <div className={!pid.enabled ? 'pointer-events-none' : ''}>
        <DeadbandControls />
      </div>
    </Card>
  );
}
