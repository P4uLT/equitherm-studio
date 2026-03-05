// src/components/AppShell/OutputDisplay.tsx
import { useStore } from '../../store/useStore';
import { DigitalDisplay } from './DigitalDisplay';
import { StatusIndicator } from './StatusIndicator';
import { SliderVariant } from '@/components/ui/slider-variants';
import { cn } from '@/lib/utils';

export function OutdoorSlider({ className }: { className?: string }) {
  const tCurrent = useStore(s => s.ui.tCurrent);
  const setTCurrent = useStore(s => s.setTCurrent);

  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      <div className="flex items-center justify-between px-1">
        <span className="text-[0.65rem] font-ui font-medium text-muted-foreground uppercase tracking-wider">
          Outdoor Temperature
        </span>
        <DigitalDisplay
          value={tCurrent}
          unit="°C"
          size="sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[0.55rem] font-display text-cold w-7 text-center">-30°</span>
        <SliderVariant
          variant="temp"
          min={-30}
          max={25}
          step={1}
          value={[tCurrent]}
          onValueChange={(vals) => setTCurrent(vals[0])}
          className="flex-1 cursor-grab min-h-touch"
        />
        <span className="text-[0.55rem] font-display text-hot w-7 text-center">25°</span>
      </div>
    </div>
  );
}

export function OutputDisplay() {
  const tCurrent = useStore(s => s.ui.tCurrent);
  const setTCurrent = useStore(s => s.setTCurrent);
  const computed = useStore(s => s.computed);
  const pidEnabled = useStore(s => s.pid.enabled);
  const pidOutput = computed.pidRawOutput ?? 0;

  return (
    <div className="flex items-stretch gap-4">
      {/* Outdoor Slider - desktop only (inline) */}
      <div className="hidden sm:flex flex-col gap-2 flex-1 min-w-0">
        <div className="flex items-center justify-between px-1">
          <span className="text-[0.65rem] md:text-xs font-ui font-medium text-muted-foreground uppercase tracking-wider">
            Outdoor
          </span>
          <DigitalDisplay
            value={tCurrent}
            unit="°C"
            size="sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[0.6rem] font-display text-cold w-10 min-w-[2.5rem] text-center">-30°</span>
          <SliderVariant
            variant="temp"
            min={-30}
            max={25}
            step={1}
            value={[tCurrent]}
            onValueChange={(vals) => setTCurrent(vals[0])}
            className="flex-1 cursor-grab min-h-touch"
          />
          <span className="text-[0.6rem] font-display text-hot w-10 min-w-[2.5rem] text-center">25°</span>
        </div>
      </div>

      {/* Transform Arrow */}
      <div className="hidden md:flex items-center justify-center w-8 shrink-0">
        <svg className="w-5 h-5 text-muted-foreground/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>

      {/* PID Correction (if enabled) */}
      {pidEnabled && (
        <div className="hidden md:flex flex-col items-center justify-center gap-1 min-w-[70px] shrink-0">
          <span className="text-[0.6rem] font-ui font-medium text-muted-foreground uppercase tracking-wider">
            PID
          </span>
          <DigitalDisplay
            value={`${pidOutput >= 0 ? '+' : ''}${Math.abs(pidOutput).toFixed(1)}°`}
            size="lg"
            variant={pidOutput >= 0 ? 'success' : 'danger'}
            showGlow
          />
        </div>
      )}

      {/* Transform Arrow (when PID) */}
      {pidEnabled && (
        <div className="hidden md:flex items-center justify-center w-6 shrink-0">
          <svg className="w-5 h-5 text-muted-foreground/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      )}

      {/* Flow Output - Hero Element */}
      <div className="flex flex-col items-center justify-center gap-2 min-w-[100px] lg:min-w-[140px] shrink-0 bg-secondary/30 rounded-lg border border-border px-4 py-3">
        <span className="text-[0.65rem] md:text-xs font-ui font-medium text-muted-foreground uppercase tracking-wider">
          Flow Temperature
        </span>
        <div className="flex items-baseline gap-1">
          <DigitalDisplay
            value={computed.flowTemp?.toFixed(1) ?? '--'}
            size="4xl"
            variant="heating"
            showGlow
          />
          {/* Mobile PID indicator */}
          {pidEnabled && pidOutput !== 0 && (
            <sup className={cn(
              "md:hidden text-[0.4em] font-display font-bold",
              pidOutput >= 0 ? "text-success" : "text-destructive"
            )}>
              {pidOutput >= 0 ? '+' : '-'}{Math.abs(pidOutput).toFixed(1)}
            </sup>
          )}
        </div>
        <StatusIndicator status={computed.status} />
      </div>
    </div>
  );
}
