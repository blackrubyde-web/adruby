import React, { useEffect, useState } from 'react';
import { UI } from '../../../components/ui/uiPrimitives';
import { Sparkles, Clock, List } from 'lucide-react';
import Drawer from '../../../components/ui/Drawer';
import EmptyState from '../../../components/ui/EmptyState';

const mapEvidenceItem = (ad = {}) => ({
  brand: ad.page_name || ad.pageName || ad.brand || ad.advertiser || ad.page || ad.account || 'Unbekannt',
  hook: ad.headline || ad.primaryText || ad.primary_text || ad.text || ad.description || '—',
  format: ad.format || ad.type || ad.placement || '',
  url: ad.url || ad.link || ad.permalink || '',
});

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

  const evidence = scrapedAds.slice(0, 15).map(mapEvidenceItem);
  const lastHook = evidence[0]?.hook?.slice(0, 60);

  return (
    <div className={`${UI.card} p-6 space-y-4`}>
      <div className="flex items-center justify-between gap-3">
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Gefundene Ads', value: scrapedAds.length || 0 },
          { label: 'Marken', value: '—' },
          { label: 'Hooks', value: scrapedAds.length ? `~${scrapedAds.length}` : '—' },
          { label: 'Formate', value: '—' },
        ].map((item, idx) => (
          <div key={idx} className="rounded-xl border border-border bg-card/60 p-3">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="text-lg font-semibold text-foreground">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card/60 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
            <Sparkles size={16} className="text-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Letzter Hook</p>
            <p className="text-xs text-muted-foreground">Aktualisiert live</p>
          </div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card px-3 py-2 text-sm text-foreground line-clamp-2">
          {lastHook || '—'}
        </div>
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
