import { Brain, CheckCircle2, Layers, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type CampaignStrategyDetails = {
  name: string;
  summary?: string;
  confidence?: number;
  recommendations?: string[];
  meta_setup?: {
    campaign?: {
      name?: string;
      objective?: string;
      budget_type?: string;
      daily_budget?: string;
      bid_strategy?: string;
      optimization_goal?: string;
      attribution?: string;
    };
    ad_sets?: Array<{ name?: string }>; 
    ads?: Array<{ name?: string }>; 
  };
};

type CampaignStrategyAd = {
  id: string;
  name: string;
  headline: string;
  cta: string;
};

interface CampaignStrategyViewModalProps {
  strategy: CampaignStrategyDetails;
  title?: string | null;
  ads: CampaignStrategyAd[];
  createdAt?: string | null;
  onOpenBuilder?: () => void;
  onClose: () => void;
}

export function CampaignStrategyViewModal({
  strategy,
  title,
  ads,
  createdAt,
  onOpenBuilder,
  onClose,
}: CampaignStrategyViewModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'meta'>('summary');

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      onClose();
      return;
    }

    if (event.key !== 'Tab' || !modalRef.current) return;
    const focusable = Array.from(
      modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const metaSetup = strategy.meta_setup;
  const adSetCount = metaSetup?.ad_sets?.length ?? 0;
  const adCount = metaSetup?.ads?.length ?? 0;
  const createdLabel = useMemo(() => {
    if (!createdAt) return null;
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
  }, [createdAt]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="campaign-strategy-modal-title"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="bg-card rounded-2xl border border-border/50 shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden my-4"
      >
        <div className="p-6 border-b border-border/30 sticky top-0 bg-card z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 id="campaign-strategy-modal-title" className="text-2xl font-bold text-foreground">
                  {title || strategy.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Kampagnen-Strategie für {ads.length} Ads
                  {createdLabel ? ` - ${createdLabel}` : ''}
                </p>
              </div>
            </div>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'summary'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted/40 text-muted-foreground hover:text-foreground'
              }`}
            >
              Uebersicht
            </button>
            <button
              onClick={() => setActiveTab('meta')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'meta'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted/40 text-muted-foreground hover:text-foreground'
              }`}
            >
              Meta Setup
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          {activeTab === 'summary' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                  <div className="text-sm text-muted-foreground mb-1">Confidence</div>
                  <div className="text-2xl font-bold text-foreground">
                    {strategy.confidence != null ? `${strategy.confidence}%` : '—'}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                  <div className="text-sm text-muted-foreground mb-1">Ad Sets</div>
                  <div className="text-2xl font-bold text-foreground">{adSetCount}</div>
                </div>
                <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                  <div className="text-sm text-muted-foreground mb-1">Ads</div>
                  <div className="text-2xl font-bold text-foreground">{adCount}</div>
                </div>
              </div>

              {strategy.summary && (
                <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                  <div className="text-sm text-muted-foreground mb-2">Summary</div>
                  <div className="text-foreground">{strategy.summary}</div>
                </div>
              )}

              <div>
                <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Top Empfehlungen
                </h3>
                {(strategy.recommendations || []).length ? (
                  <div className="space-y-2">
                    {strategy.recommendations?.map((rec, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-muted/20 border border-border/30">
                        {rec}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Keine Empfehlungen verfügbar.</div>
                )}
              </div>

              <div>
                <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  Enthaltene Ads
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ads.map((ad) => (
                    <div key={ad.id} className="p-3 rounded-lg bg-muted/20 border border-border/30">
                      <div className="font-semibold text-foreground">{ad.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{ad.headline}</div>
                      <div className="text-xs text-primary mt-1">{ad.cta}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-muted/20 border border-border/30">
                <div className="text-sm text-muted-foreground mb-2">Campaign Objective</div>
                <div className="text-lg font-semibold text-foreground">
                  {metaSetup?.campaign?.objective || '—'}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Budget: {metaSetup?.campaign?.daily_budget || '—'} · Bid: {metaSetup?.campaign?.bid_strategy || '—'}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                  <div className="text-sm text-muted-foreground mb-2">Ad Sets</div>
                  <div className="text-2xl font-bold text-foreground">{adSetCount}</div>
                </div>
                <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                  <div className="text-sm text-muted-foreground mb-2">Ads</div>
                  <div className="text-2xl font-bold text-foreground">{adCount}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border/30 flex items-center justify-end gap-3">
          {onOpenBuilder && (
            <button
              onClick={onOpenBuilder}
              className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:scale-105 transition-all"
            >
              Im Kampagnen-Builder öffnen
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-muted hover:bg-muted/80 rounded-xl text-sm font-semibold"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}
