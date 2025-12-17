import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  Undo2,
  Redo2,
  ArrowDownToLine,
  FileSpreadsheet,
  ChevronDown,
  MoreHorizontal,
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import { UI } from '../../../components/ui/uiPrimitives';
import ActionMenu from '../../../components/ui/ActionMenu';

const QuickButton = ({ label, icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`${UI.btnQuiet} h-9 px-3 flex items-center gap-2 text-xs bg-card hover:bg-accent/40`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const ResultsToolbar = ({
  onCopyPack,
  onCopySheet,
  onDownloadJson,
  onDownloadCsv,
  onSave,
  saving,
  saveMessage,
  saveError,
  copied,
  onDuplicate,
  onHookShorter,
  onHookStronger,
  onToneChange,
  onCtaChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  const [open, setOpen] = useState(true);
  return (
    <div className={`${UI.card} ${UI.cardHover} p-4 space-y-3`}>
      <div className="flex items-center justify-between gap-2">
        <p className={UI.meta}>Quick Optimierungen</p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`${UI.btnQuiet} h-9 w-9 flex items-center justify-center`}
          aria-label="Optimierungen ein-/ausklappen"
        >
          <ChevronDown className={`transition-transform ${open ? 'rotate-180' : ''}`} size={16} />
        </button>
      </div>

      {open && (
        <div className="flex flex-wrap items-center gap-2">
          <QuickButton label="Hook kürzer" icon={<Wand2 size={14} />} onClick={onHookShorter} />
          <QuickButton label="Hook stärker" icon={<Sparkles size={14} />} onClick={onHookStronger} />
          <QuickButton label="Ton: seriös" icon={<Sparkles size={14} />} onClick={() => onToneChange('serious')} />
          <QuickButton label="Ton: locker" icon={<Sparkles size={14} />} onClick={() => onToneChange('casual')} />
          <QuickButton label="Ton: aggressiv" icon={<Sparkles size={14} />} onClick={() => onToneChange('aggressive')} />
          <QuickButton label="CTA wechseln" icon={<ArrowDownToLine size={14} />} onClick={onCtaChange} />
          <QuickButton label="Duplizieren" icon={<FileSpreadsheet size={14} />} onClick={onDuplicate} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="quiet" size="sm" iconName="Undo2" onClick={onUndo} disabled={!canUndo}>
          <Undo2 size={14} />
        </Button>
        <Button variant="quiet" size="sm" iconName="Redo2" onClick={onRedo} disabled={!canRedo}>
          <Redo2 size={14} />
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ActionMenu
          trigger={
            <Button variant="secondary" size="sm" iconName="MoreHorizontal">
              Copy / Export
            </Button>
          }
          items={[
            { label: 'Meta Pack kopieren', onClick: onCopyPack },
            { label: 'Sheet Row (TSV)', onClick: onCopySheet },
            { label: 'JSON (Variante)', onClick: onDownloadJson },
            { label: 'CSV (alle Varianten)', onClick: onDownloadCsv },
          ]}
        />
        <Button variant="default" size="sm" iconName="Save" onClick={onSave} disabled={saving}>
          {saving ? 'Speichert...' : 'Speichern'}
        </Button>
      </div>

      {(saveMessage || saveError || copied) && (
        <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
          {saveMessage && (
            <>
              <span className="text-foreground">{saveMessage}</span>
              <a className="underline text-foreground" href="/ad-strategy">
                Zur Bibliothek
              </a>
            </>
          )}
          {saveError && <span className="text-muted-foreground">{saveError}</span>}
          {copied && <span className="text-muted-foreground">Kopiert</span>}
        </div>
      )}
    </div>
  );
};

export default ResultsToolbar;
