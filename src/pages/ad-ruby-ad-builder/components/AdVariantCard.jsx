import React from 'react';
import { UI } from '../../../components/ui/uiPrimitives';

const AdVariantCard = ({ ad, index, active, onSelect, onDuplicate, onCopy }) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-xl border p-4 transition focus:outline-none focus:ring-2 focus:ring-primary/40 ${
        active ? 'bg-accent/40 border-border' : 'bg-card border-border/60 hover:bg-accent/30'
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Variante {index + 1}</p>
        {ad?.tone && (
          <span className="text-[11px] px-2 py-1 rounded-full border border-border/60 bg-card text-muted-foreground">
            {ad.tone}
          </span>
        )}
      </div>
      <h4 className="text-sm font-semibold text-foreground mt-2 line-clamp-2">{ad.headline || 'Headline'}</h4>
      <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{ad.primaryText || ad.text || '—'}</p>
      <div className="flex items-center gap-2 mt-3">
        <button className={UI.btnQuiet + ' h-8 w-auto px-2 text-xs'} onClick={onDuplicate} type="button">
          Duplizieren
        </button>
        <button className={UI.btnQuiet + ' h-8 w-auto px-2 text-xs'} onClick={onCopy} type="button">
          Copy
        </button>
      </div>
    </button>
  );
};

export default AdVariantCard;
