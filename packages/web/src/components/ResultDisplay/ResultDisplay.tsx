// src/components/ResultDisplay/ResultDisplay.tsx
import { useStore } from '../../store/useStore';
import { SliderVariant } from '@/components/ui/slider-variants';
import { cn } from '@/lib/utils';

export function ResultDisplay() {
  const tCurrent = useStore(s => s.ui.tCurrent);
  const setTCurrent = useStore(s => s.setTCurrent);
  const computed = useStore(s => s.computed);
  const pidEnabled = useStore(s => s.pid.enabled);
  const pidOutput = computed.pidRawOutput ?? 0;
  const pidSign = pidOutput >= 0 ? '+' : '';

  return (
    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
      {/* Outdoor temperature input */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <div className="flex justify-between px-1">
          <span className="text-[0.65rem] md:text-xs font-medium text-muted-foreground uppercase tracking-widest">Outdoor</span>
          <span className="font-figtree text-base md:text-xl font-bold text-foreground">{tCurrent}°C</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xs min-w-[2.5rem] text-center text-primary">-30°</span>
          <SliderVariant
            variant="temp"
            min={-30}
            max={25}
            step={1}
            value={[tCurrent]}
            onValueChange={(vals) => setTCurrent(vals[0])}
            className="flex-1 cursor-grab min-h-touch"
          />
          <span className="text-2xs min-w-[2.5rem] text-center text-hot">25°</span>
        </div>
      </div>

      {/* Arrow transform */}
      <div className="w-6 shrink-0 hidden md:block">
        <svg className="w-6 h-6 lg:w-7 lg:h-7 text-muted-foreground opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>

      {/* PID correction display - hidden on mobile to save space */}
      {pidEnabled && (
        <div className="hidden md:flex flex-col items-center gap-1 min-w-[60px] shrink-0">
          <span className="text-[0.65rem] font-medium text-muted-foreground uppercase tracking-widest">PID</span>
          <span className={cn(
            'font-figtree text-lg lg:text-xl font-semibold',
            pidOutput >= 0 ? 'text-success' : 'text-destructive'
          )}>
            {pidSign}{pidOutput.toFixed(1)}°
          </span>
        </div>
      )}

      {/* Arrow transform (when PID enabled) */}
      {pidEnabled && (
        <div className="w-6 shrink-0 hidden md:block">
          <svg className="w-6 h-6 lg:w-7 lg:h-7 text-muted-foreground opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      )}

      {/* Flow output */}
      <div className="flex flex-col items-center gap-1 min-w-[80px] lg:min-w-[100px] shrink-0">
        <span className="text-[0.65rem] md:text-xs font-medium text-muted-foreground uppercase tracking-widest">Flow</span>
        <span className="relative font-figtree text-2xl md:text-4xl lg:text-5xl font-bold text-primary pr-[0.7em]">
          {computed.flowTemp?.toFixed(1) ?? '--'}
          <span className="absolute right-0 top-[0.1em] text-[0.4em] opacity-70">°C</span>
        </span>
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-secondary rounded border border-border">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span className="text-2xs text-muted-foreground uppercase">{computed.status}</span>
        </div>
      </div>
    </div>
  );
}
