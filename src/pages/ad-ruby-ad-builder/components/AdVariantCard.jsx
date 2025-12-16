import React from 'react';
import { UI } from '../../../components/ui/uiPrimitives';

const AdVariantCard = ({ ad, index, active, onSelect, onDuplicate, onCopy }) => {
  return (
    <div
      className={`rounded-xl border p-3 cursor-pointer transition ${
        active ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-accent/30'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Variante {index + 1}</p>
        <span className="text-[11px] px-2 py-1 rounded-full bg-accent text-foreground border border-border/60">
          {ad.ctr || '+200% CTR'}
        </span>
      </div>
      <h4 className="text-sm font-semibold text-foreground mt-1">{ad.headline || 'Headline'}</h4>
      <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{ad.primaryText || ad.text}</p>
      <div className="flex items-center gap-2 mt-3">
        <button className={UI.btnQuiet + ' h-8 w-auto px-2 text-xs'} onClick={onDuplicate} type="button">
          Duplizieren
        </button>
        <button className={UI.btnQuiet + ' h-8 w-auto px-2 text-xs'} onClick={onCopy} type="button">
          Copy
        </button>
      </div>
    </div>
  );
};

export default AdVariantCard;
