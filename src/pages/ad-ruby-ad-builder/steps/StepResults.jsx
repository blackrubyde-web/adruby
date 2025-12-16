import React, { useState } from 'react';
import { UI } from '../../../components/ui/uiPrimitives';
import { Copy, Save, Share, Download, TrendingUp } from 'lucide-react';
import Button from '../../../components/ui/Button';

const StepResults = ({ ads }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = ads?.[activeIndex] || {};

  const handleCopy = (ad) => {
    const text = `${ad.headline || ''}\n${ad.primaryText || ''}\nCTA: ${ad.cta || ''}`;
    navigator?.clipboard?.writeText?.(text);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-3">
        <p className={UI.meta}>Varianten</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ads.map((ad, idx) => (
            <div
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`rounded-xl border p-3 cursor-pointer transition ${
                activeIndex === idx ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-accent/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Variante {idx + 1}</p>
                <span className="text-[11px] px-2 py-1 rounded-full bg-accent text-foreground border border-border/60">
                  {ad.ctr || '+200% CTR'}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-foreground mt-1">{ad.headline || 'Headline'}</h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{ad.primaryText || ad.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={`${UI.card} p-4 space-y-3`}>
        <p className={UI.meta}>Live Preview</p>
        <div className="rounded-xl border border-border bg-popover p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-accent" />
            <div>
              <p className="text-sm font-semibold text-foreground">{active.brand || 'Brand'}</p>
              <p className="text-xs text-muted-foreground">Sponsored</p>
            </div>
          </div>
          <p className="text-sm font-semibold text-foreground">{active.headline || 'Headline'}</p>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{active.primaryText || 'Ad copy folgt...'}</p>
          {active.description && <p className="text-xs text-muted-foreground">{active.description}</p>}
          {active.cta && (
            <Button size="sm" className="mt-2 w-fit" variant="default">
              {active.cta}
            </Button>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp size={14} />
            <span>Basierend auf {active.source || 'Library'}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <Button variant="secondary" size="sm" onClick={() => handleCopy(active)} iconName="Copy">
            Copy
          </Button>
          <Button variant="secondary" size="sm" iconName="Save">
            Save
          </Button>
          <Button variant="secondary" size="sm" iconName="Share">
            Share
          </Button>
          <Button variant="secondary" size="sm" iconName="Download">
            Export
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StepResults;
