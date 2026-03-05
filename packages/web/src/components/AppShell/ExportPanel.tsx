// src/components/AppShell/ExportPanel.tsx
import { useStore } from '../../store/useStore';
import { SliderControl } from '../ControlsCard/SliderControl';
import { InfoTooltip } from '../ControlsCard/InfoTooltip';
import { useState } from 'react';
import { YAMLModal } from '../Modals/YAMLModal';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export function ExportPanel() {
  const ki = useStore(s => s.pid.ki);
  const kd = useStore(s => s.pid.kd);
  const setPidParam = useStore(s => s.setPidParam);
  const [showYamlPreview, setShowYamlPreview] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10 border border-accent/20">
          <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-ui font-semibold text-foreground">ESPHome Export</h3>
          <p className="text-xs text-muted-foreground">YAML configuration</p>
        </div>
      </div>

      {/* Time-Domain PID Parameters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-ui font-medium text-muted-foreground uppercase tracking-wider">
            Time-Domain PID
          </span>
          <InfoTooltip>
            These parameters (Ki, Kd) control the integral and derivative terms. They don&apos;t affect the live curve visualization, but are included in the ESPHome YAML export.
          </InfoTooltip>
        </div>

        <p className="text-xs text-muted-foreground italic">
          YAML export only
        </p>

        <div className="space-y-3">
          <SliderControl
            id="ki"
            label="Ki (Integral)"
            min={0}
            max={0.5}
            step={0.001}
            value={ki}
            unit=""
            onChange={(v) => setPidParam('ki', v)}
          />
          <SliderControl
            id="kd"
            label="Kd (Derivative)"
            min={0}
            max={2}
            step={0.01}
            value={kd}
            unit=""
            onChange={(v) => setPidParam('kd', v)}
          />
        </div>
      </div>

      <Separator className="my-4" />

      {/* Export Options */}
      <div className="space-y-4">
        <h4 className="text-xs font-ui font-medium text-muted-foreground uppercase tracking-wider">
          Export Options
        </h4>

        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <span className="text-sm font-ui text-foreground">Diagnostic Sensors</span>
            <span className="text-xs text-muted-foreground">Additional sensors in YAML</span>
          </div>
          <Switch checked={false} onCheckedChange={() => {}} />
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <span className="text-sm font-ui text-foreground">Runtime Tuning</span>
            <span className="text-xs text-muted-foreground">Number inputs for live adjustment</span>
          </div>
          <Switch checked={false} onCheckedChange={() => {}} />
        </div>
      </div>

      <Separator className="my-4" />

      {/* YAML Preview Button */}
      <Button className="w-full gap-2" onClick={() => setShowYamlPreview(true)}>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        Preview YAML
      </Button>

      {/* YAML Modal */}
      <YAMLModal isOpen={showYamlPreview} onClose={() => setShowYamlPreview(false)} />
    </div>
  );
}
