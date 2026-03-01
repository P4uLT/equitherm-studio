// src/components/Header/PresetsDropdown.tsx
import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { loadAllConfigs, loadConfig, saveConfig, deleteConfig } from '../../config/storage';
import type { SavedConfig } from '../../types';
import { showToast } from '@/lib/toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Save, ChevronDown, Trash2, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import styles from './PresetsDropdown.module.css';

export function PresetsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [configs, setConfigs] = useState<SavedConfig[]>([]);
  const [saveName, setSaveName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [overwriteDialogOpen, setOverwriteDialogOpen] = useState(false);
  const [pendingOverwriteName, setPendingOverwriteName] = useState<string | null>(null);

  const curve = useStore(s => s.curve);
  const pid = useStore(s => s.pid);
  const ui = useStore(s => s.ui);
  const loadConfigToStore = useStore(s => s.loadConfig);

  // Load configs on open
  useEffect(() => {
    if (isOpen) {
      setConfigs(loadAllConfigs());
      setSaveName('');
      setConfirmDelete(null);
    }
  }, [isOpen]);

  const doSave = (name: string) => {
    saveConfig(name, { curve, pid, ui });
    setConfigs(loadAllConfigs());
    setSaveName('');
    setOverwriteDialogOpen(false);
    setPendingOverwriteName(null);
    showToast(`Saved: ${name}`, 'success');
  };

  const handleSave = () => {
    const name = saveName.trim();
    if (!name) return;

    const exists = configs.some(c => c.name === name);
    if (exists) {
      setPendingOverwriteName(name);
      setOverwriteDialogOpen(true);
    } else {
      doSave(name);
    }
  };

  const handleConfirmOverwrite = () => {
    if (pendingOverwriteName) doSave(pendingOverwriteName);
  };

  const handleLoad = (configName: string) => {
    const data = loadConfig(configName);
    if (data) {
      loadConfigToStore(data);
      showToast(`Loaded: ${configName}`, 'success');
      setIsOpen(false);
    }
  };

  const handleDelete = (configName: string) => {
    deleteConfig(configName);
    setConfigs(loadAllConfigs());
    setConfirmDelete(null);
    showToast('Deleted', 'success');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSave();
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(styles.trigger, isOpen && styles.triggerOpen)}
            data-state={isOpen ? 'open' : 'closed'}
          >
            <Save className="h-3 w-3" />
            <span>Presets</span>
            <ChevronDown className={cn('h-2.5 w-2.5 transition-transform duration-150', isOpen && 'rotate-180')} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className={styles.dropdownContent}>
          {/* Save section */}
          <div className={styles.saveSection}>
            <Input
              placeholder="New preset name..."
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              onKeyDown={handleKeyDown}
              className={styles.saveInput}
              autoFocus
            />
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!saveName.trim()}
              className={styles.saveButton}
            >
              Save
            </Button>
          </div>

          {/* Saved configs */}
          {configs.length > 0 && (
            <>
              <DropdownMenuSeparator className="my-1.5" />
              <div className={styles.configList}>
                {configs.map(c => (
                  <div
                    key={c.name}
                    className={cn(
                      styles.configItem,
                      confirmDelete === c.name && styles.configItemConfirming
                    )}
                  >
                    <DropdownMenuItem
                      className={cn(
                        styles.configMenuItem,
                        confirmDelete === c.name && styles.configMenuItemConfirming
                      )}
                      onClick={() => handleLoad(c.name)}
                    >
                      <FolderOpen className="h-3 w-3 shrink-0 opacity-50" />
                      <span className={styles.configName}>{c.name}</span>
                      <span className={styles.configDate}>
                        {new Date(c.timestamp).toLocaleDateString()}
                      </span>
                    </DropdownMenuItem>
                    {confirmDelete === c.name ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        className={styles.confirmDeleteButton}
                        onClick={() => handleDelete(c.name)}
                        title="Confirm delete"
                      >
                        <span className="text-xs">✓</span>
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={styles.deleteButton}
                        onClick={() => setConfirmDelete(c.name)}
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Empty state */}
          {configs.length === 0 && (
            <div className={styles.emptyState}>No saved presets</div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Overwrite confirmation dialog */}
      <Dialog open={overwriteDialogOpen} onOpenChange={setOverwriteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Overwrite Preset?</DialogTitle>
            <DialogDescription>
              A preset named "<strong className="text-foreground">{pendingOverwriteName}</strong>" already exists.
              Do you want to overwrite it?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setOverwriteDialogOpen(false);
                setPendingOverwriteName(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmOverwrite}>
              Overwrite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
