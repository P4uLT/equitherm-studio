// src/components/ControlsCard/SliderControl.tsx
import type { ReactNode } from 'react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface SliderControlProps {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  unit: string;
  onChange: (value: number) => void;
  tooltip?: ReactNode;
}

export function SliderControl({ id, label, min, max, step, value, unit, onChange, tooltip }: SliderControlProps) {
  // Format anchor values
  const formatAnchor = (val: number) => {
    if (val < 0) return `${val}°`;
    if (unit === '°C') return `${val}°`;
    if (unit === '') return val.toString();
    return `${val}${unit}`;
  };

  const handleValueChange = (values: number[]) => {
    onChange(values[0]);
  };

  return (
    <div className="flex flex-col gap-[0.3rem] mb-4 last:mb-0">
      {/* Row 1: Label + Tooltip */}
      <div className="flex items-center justify-between">
        <span className="text-[0.65rem] font-semibold text-[var(--text-muted)] uppercase tracking-widest">
          {label}
        </span>
        {tooltip as React.ReactNode}
      </div>

      {/* Row 2: Value (hero) */}
      <span className="font-['IBM_Plex_Mono',monospace] text-2xl font-bold text-[var(--accent-primary)] leading-none tracking-[-0.02em]">
        {value}{unit}
      </span>

      {/* Row 3: Slider with anchors */}
      <div className="flex items-center gap-2">
        <span className="font-['IBM_Plex_Mono',monospace] text-[0.6rem] font-medium text-[var(--text-muted)] whitespace-nowrap shrink-0 min-w-[1.75rem]">
          {formatAnchor(min)}
        </span>
        <Slider
          id={id}
          min={min}
          max={max}
          step={step}
          value={[value]}
          onValueChange={handleValueChange}
          className={cn(
            'flex-1 cursor-pointer',
            // Track overrides - target the Track component
            '[&>span]:h-[6px] [&>span]:rounded-[3px] [&>span]:bg-[var(--bg-secondary)]',
            // Range (filled portion) overrides
            '[&>span>span]:bg-[var(--accent-primary)]',
            // Thumb overrides - target the Thumb component directly
            '[&>button]:w-[18px] [&>button]:h-[18px] [&>button]:rounded-full',
            '[&>button]:bg-[var(--accent-primary)] [&>button]:border-0',
            '[&>button]:shadow-[0_2px_8px_rgba(0,0,0,0.4)]',
            '[&>button]:cursor-pointer [&>button]:transition-none',
            '[&>button]:hover:bg-[var(--accent-primary)]',
            '[&>button]:focus:ring-0 [&>button]:focus:ring-offset-0',
            '[&>button]:focus-visible:ring-2 [&>button]:focus-visible:ring-[var(--accent-primary)]'
          )}
        />
        <span className="font-['IBM_Plex_Mono',monospace] text-[0.6rem] font-medium text-[var(--text-muted)] whitespace-nowrap shrink-0 min-w-[1.75rem] text-right">
          {formatAnchor(max)}
        </span>
      </div>
    </div>
  );
}
