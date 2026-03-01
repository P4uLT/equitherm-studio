// src/components/Modals/SaveModal.tsx
import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { saveConfig, loadAllConfigs, loadConfig, deleteConfig } from '../../config/storage';
import type { SavedConfig } from '../../types';
import { showToast } from '@/lib/toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import styles from './SaveModal.module.css';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SaveModal({ isOpen, onClose }: SaveModalProps) {
  const [name, setName] = useState('');
  const [configs, setConfigs] = useState<SavedConfig[]>([]);
  const [confirmOverwrite, setConfirmOverwrite] = useState<string | null>(null);
  const curve = useStore(s => s.curve);
  const pid = useStore(s => s.pid);
  const ui = useStore(s => s.ui);
  const loadConfigToStore = useStore(s => s.loadConfig);

  // Refresh configs list when modal opens
  useEffect(() => {
    if (isOpen) {
      setConfigs(loadAllConfigs());
      setConfirmOverwrite(null);
    }
  }, [isOpen]);

  const doSave = (configName: string) => {
    saveConfig(configName, { curve, pid, ui });
    setConfigs(loadAllConfigs());
    showToast(`Config saved: ${configName}`, 'success');
    setName('');
    setConfirmOverwrite(null);
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const exists = configs.some(c => c.name === trimmedName);
    if (exists) {
      setConfirmOverwrite(trimmedName);
    } else {
      doSave(trimmedName);
    }
  };

  const handleConfirmOverwrite = () => {
    if (confirmOverwrite) doSave(confirmOverwrite);
  };

  const handleLoad = (configName: string) => {
    const data = loadConfig(configName);
    if (data) {
      loadConfigToStore(data);
      showToast(`Config loaded: ${configName}`, 'success');
      onClose();
    }
  };

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>, configName: string) => {
    e.stopPropagation();
    deleteConfig(configName);
    setConfigs(loadAllConfigs());
    showToast('Config deleted', 'success');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSave();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Save Configuration</DialogTitle>
        </DialogHeader>

        {confirmOverwrite ? (
          <>
            <p className="text-sm text-muted-foreground text-center">
              Overwrite "<strong className="text-foreground">{confirmOverwrite}</strong>"?
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmOverwrite(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmOverwrite}>
                Overwrite
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <Input
              placeholder="Configuration name..."
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </>
        )}

        {/* Saved configs list */}
        {configs.length > 0 && (
          <div className={styles.sectionDivider}>
            <div className={styles.sectionLabel}>Saved Configs</div>
            <div className="space-y-1">
              {configs.map(c => (
                <div
                  key={c.name}
                  className={styles.configItem}
                  onClick={() => handleLoad(c.name)}
                >
                  <span className={styles.configName}>{c.name}</span>
                  <span className={styles.configDate}>
                    {new Date(c.timestamp).toLocaleDateString()}
                  </span>
                  <button
                    className={styles.deleteButton}
                    onClick={e => handleDelete(e, c.name)}
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
