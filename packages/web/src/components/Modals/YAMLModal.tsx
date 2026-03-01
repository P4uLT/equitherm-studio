// src/components/Modals/YAMLModal.tsx
import { useState, useEffect, useMemo } from 'react';
import hljs from 'highlight.js/lib/core';
import yaml from 'highlight.js/lib/languages/yaml';
import { useStore } from '../../store/useStore';
import { generateYAML } from '../../config/yaml';
import { showToast } from '@/lib/toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Register YAML language
hljs.registerLanguage('yaml', yaml);

// SVG Icons
const LayersIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
  </svg>
);

const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

interface YAMLModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function YAMLModal({ isOpen, onClose }: YAMLModalProps) {
  const curve = useStore(s => s.curve);
  const pid = useStore(s => s.pid);
  const [includeSensors, setIncludeSensors] = useState(false);
  const [includeNumbers, setIncludeNumbers] = useState(false);
  const [copied, setCopied] = useState(false);

  // Map store state to YAML generator params
  const yamlParams = useMemo(() => ({
    t: curve.tTarget,
    hc: curve.hc,
    n: curve.n,
    s: curve.shift,
    min: curve.minFlow,
    max: curve.maxFlow,
    pid: pid.enabled,
    kp: pid.kp,
    ki: pid.ki,
    kd: pid.kd,
    db: pid.deadbandEnabled,
    tl: pid.deadbandThresholdLow,
    th: pid.deadbandThresholdHigh,
    kpm: pid.deadbandKpMultiplier,
    kim: pid.deadbandKiMultiplier,
    kdm: pid.deadbandKdMultiplier,
  }), [curve, pid]);

  const rawYaml = useMemo(() => generateYAML(yamlParams, { includeSensors, includeNumbers }), [yamlParams, includeSensors, includeNumbers]);

  // Syntax highlighted YAML using highlight.js
  const highlightedYaml = useMemo(() => {
    return hljs.highlight(rawYaml, { language: 'yaml' }).value;
  }, [rawYaml]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawYaml);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  useEffect(() => {
    if (isOpen) setCopied(false);
  }, [isOpen]);

  const lineCount = rawYaml.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] p-0 gap-0 overflow-hidden">
        {/* Header with Tab Style */}
        <DialogHeader className="flex flex-row items-center justify-between p-3 bg-card border-b border-border space-y-0">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-t-md border border-border border-b-0 -mb-3">
            <LayersIcon />
            <DialogTitle className="text-sm font-medium">equitherm.yaml</DialogTitle>
          </div>
        </DialogHeader>

        {/* Options Bar */}
        <div className="flex gap-4 px-4 py-2 bg-secondary border-b border-border">
          <label className="flex items-center gap-1.5 text-xs text-secondary-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={includeSensors}
              onChange={e => setIncludeSensors(e.target.checked)}
              className="w-3.5 h-3.5 accent-primary cursor-pointer"
            />
            <span>Diagnostic sensors</span>
          </label>
          <label className="flex items-center gap-1.5 text-xs text-secondary-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={e => setIncludeNumbers(e.target.checked)}
              className="w-3.5 h-3.5 accent-primary cursor-pointer"
            />
            <span>Runtime tuning</span>
          </label>
        </div>

        {/* Code Area */}
        <div className="flex flex-1 min-h-0 overflow-auto max-h-[60vh] bg-[var(--hljs-bg)]">
          <div className="p-4 text-right font-mono text-[13px] leading-relaxed select-none whitespace-pre min-w-[40px] flex-shrink-0 bg-[var(--hljs-bg-gutter)] text-[var(--hljs-gutter-color)]">
            {lineNumbers}
          </div>
          <pre className="flex-1 m-0 p-4 bg-transparent font-mono text-[13px] leading-relaxed whitespace-pre overflow-visible">
            <code className="language-yaml hljs !bg-transparent !p-0" dangerouslySetInnerHTML={{ __html: highlightedYaml }} />
          </pre>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-card border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <a
              href="https://esphome.io/components/climate/equitherm.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:opacity-80 transition-opacity"
            >
              <BookIcon />
              Docs
            </a>
            <span className="text-border">|</span>
            <span>YAML</span>
            <span className="text-border">|</span>
            <span>{lineCount} lines</span>
          </div>
          <Button
            size="sm"
            className={`h-7 px-4 text-xs font-semibold ${copied ? 'bg-green-600 hover:bg-green-600' : ''}`}
            onClick={handleCopy}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
