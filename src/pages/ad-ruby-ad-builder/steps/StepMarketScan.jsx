import React from 'react';
import { UI } from '../../../components/ui/uiPrimitives';
import { Sparkles, Clock } from 'lucide-react';

const StepMarketScan = ({ phase, scrapedAds = [] }) => {
  const isAnalyzing = phase === 'analyzing';
  return (
    <div className={`${UI.card} p-4 border border-border/60`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className={UI.meta}>{isAnalyzing ? 'Analyse läuft' : 'Scraping läuft'}</p>
          <h4 className={UI.h2}>{isAnalyzing ? 'KI bewertet Hooks' : 'Ads Library wird gelesen'}</h4>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock size={14} />
          <span>ca. 15s</span>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card/60 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
            <Sparkles size={16} className="text-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Gefundene Ads</p>
            <p className={UI.meta}>{scrapedAds.length || 0} Items</p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          Letzter Hook: {(scrapedAds[0]?.headline || scrapedAds[0]?.primaryText || '…').slice(0, 38)}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 rounded-lg bg-accent/40 animate-pulse" />
        ))}
      </div>
    </div>
  );
};

export default StepMarketScan;
