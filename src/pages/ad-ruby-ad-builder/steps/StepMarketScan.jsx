import React, { useEffect, useState } from 'react';
import { UI } from '../../../components/ui/uiPrimitives';
import { Sparkles, Clock, List } from 'lucide-react';
import Drawer from '../../../components/ui/Drawer';
import EmptyState from '../../../components/ui/EmptyState';

const StepMarketScan = ({ phase, scrapedAds = [] }) => {
  const isAnalyzing = phase === 'analyzing';
  const [eta, setEta] = useState(15);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setEta(15);
    const timer = setInterval(() => {
      setEta((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  const mapEvidenceItem = (ad = {}) => ({
    brand:
      ad.page_name ||
      ad.pageName ||
      ad.brand ||
      ad.advertiser ||
      ad.page ||
      ad.account ||
      'Unbekannt',
    hook: ad.headline || ad.primaryText || ad.primary_text || ad.text || ad.description || '—',
    format: ad.format || ad.type || ad.placement || '',
    url: ad.url || ad.link || ad.permalink || '',
  });

  const evidence = scrapedAds.slice(0, 15).map(mapEvidenceItem);
  const lastHook = evidence[0]?.hook?.slice(0, 60);

  return (
    <div className={`${UI.card} p-4 border border-border/60`}>
      <div className="flex items-center justify-between mb-3 gap-3">
        <div>
          <p className={UI.meta}>{isAnalyzing ? 'Analyse läuft' : 'Scraping läuft'}</p>
          <h4 className={UI.h2}>{isAnalyzing ? 'KI bewertet Hooks' : 'Ads Library wird gelesen'}</h4>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className={`${UI.btnQuiet} h-9 px-3 flex items-center gap-2 text-xs bg-card hover:bg-accent/40`}
          >
            <List size={14} />
            Beispiele
          </button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock size={14} />
            <span>ETA ~{eta}s</span>
          </div>
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
        <span className="text-xs text-muted-foreground line-clamp-1">
          Letzter Hook: {lastHook || '—'}
        </span>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="text-xs text-muted-foreground">Top 15 Beispiele</div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 rounded-lg bg-accent/40 animate-pulse" />
        ))}
      </div>
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Beispiel-Ads aus dem Market Scan"
        subtitle={`Stichprobe aus ${scrapedAds.length || 0} gefundenen Ads`}
      >
        {evidence?.length ? (
          <div className="space-y-3">
            {evidence.map((ad, idx) => (
              <div key={idx} className={`${UI.card} p-3`}>
                <p className="text-sm font-semibold text-foreground">{ad.brand}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{ad.hook}</p>
                {ad.format && <p className="text-xs text-muted-foreground">Format: {ad.format}</p>}
                {ad.url && (
                  <a className="text-xs text-primary underline" href={ad.url} target="_blank" rel="noreferrer">
                    Quelle öffnen
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Noch keine Ads gefunden" description="Starte zuerst den Scan." />
        )}
      </Drawer>
    </div>
  );
};

export default StepMarketScan;
