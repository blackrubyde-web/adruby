import { X, Brain, Target, DollarSign, Zap, TrendingUp, MousePointerClick, Eye, Layers, Settings, CheckCircle2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type StrategyDetails = {
  name: string;
  confidence: number;
  recommendations: string[];
  performance: {
    expectedCTR: number;
    expectedROAS: number;
    expectedCPA?: number;
  };
  targeting?: {
    age?: string;
    placements?: string[];
    interests?: string[];
  };
  budget?: {
    daily?: string;
    monthly?: string;
    scaling?: string;
    allocation?: {
      testing?: number;
      scaling?: number;
    };
  };
  creatives?: {
    format?: string;
    hook?: string;
    cta?: string;
  };
  timeline?: {
    duration?: string;
    optimization?: string;
  };
};

type StrategyAd = {
  name: string;
  headline: string;
  description: string;
  cta: string;
  objective: string;
};

interface StrategyViewModalProps {
  strategy: StrategyDetails;
  ad: StrategyAd;
  onClose: () => void;
}

export function StrategyViewModal({ strategy, ad, onClose }: StrategyViewModalProps) {
  const [activeTab, setActiveTab] = useState<'strategy' | 'meta'>('strategy');
  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

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

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="strategy-modal-title"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="bg-card rounded-2xl border border-border/50 shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden my-4"
      >
        {/* Header */}
        <div className="p-6 border-b border-border/30 sticky top-0 bg-card z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 id="strategy-modal-title" className="text-2xl font-bold text-foreground">
                    {strategy.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">AI-Generated Performance Strategy</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3">
                <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                  <span className="text-sm font-medium text-primary">Ad: {ad.name}</span>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                  <span className="text-sm font-medium text-purple-500">Confidence: {strategy.confidence}%</span>
                </div>
              </div>
            </div>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-6 h-6 text-muted-foreground" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-border/30 -mb-px">
            <button
              onClick={() => setActiveTab('strategy')}
              className={`px-6 py-3 font-medium transition-all relative ${
                activeTab === 'strategy'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Strategie-Details
              </div>
            </button>
            <button
              onClick={() => setActiveTab('meta')}
              className={`px-6 py-3 font-medium transition-all relative ${
                activeTab === 'meta'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Meta-Struktur
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          {activeTab === 'strategy' ? (
            <div className="space-y-6">
              {/* Performance Metrics */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Performance-Prognosen
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <MousePointerClick className="w-6 h-6 text-green-500" />
                      <span className="text-sm text-muted-foreground">Click-Through Rate</span>
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-1">{strategy.performance.expectedCTR}%</div>
                    <div className="text-xs text-green-500 font-medium">+68% vs. Benchmark</div>
                  </div>
                  <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <TrendingUp className="w-6 h-6 text-blue-500" />
                      <span className="text-sm text-muted-foreground">Return on Ad Spend</span>
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-1">{strategy.performance.expectedROAS}x</div>
                    <div className="text-xs text-blue-500 font-medium">Excellent ROI</div>
                  </div>
                  <div className="p-6 rounded-xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <DollarSign className="w-6 h-6 text-orange-500" />
                      <span className="text-sm text-muted-foreground">Cost per Acquisition</span>
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-1">€{strategy.performance.expectedCPA}</div>
                    <div className="text-xs text-orange-500 font-medium">Optimiert</div>
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  AI-Empfehlungen
                </h3>
                <div className="space-y-3">
                  {strategy.recommendations.map((rec: string, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-transparent border border-border/30 hover:border-primary/30 transition-all">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-foreground font-medium">{rec}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Targeting Strategy */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Targeting-Strategie
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/5 border border-border/20">
                    <div className="text-sm text-muted-foreground mb-2">Alter</div>
                    <div className="text-lg font-bold text-foreground">{strategy.targeting?.age || '25-45'}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/5 border border-border/20">
                    <div className="text-sm text-muted-foreground mb-2">Placements</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(strategy.targeting?.placements || ['Facebook Feed', 'Instagram Stories']).map((placement: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20">
                          {placement}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/5 border border-border/20 col-span-2">
                    <div className="text-sm text-muted-foreground mb-2">Interessen</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(strategy.targeting?.interests || ['E-Commerce', 'Online Shopping']).map((interest: string, idx: number) => (
                        <span key={idx} className="px-3 py-1.5 text-sm rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget Allocation */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Budget-Allokation
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                    <div className="text-sm text-muted-foreground mb-2">Daily Budget</div>
                    <div className="text-2xl font-bold text-foreground">{strategy.budget?.daily || '€150'}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                    <div className="text-sm text-muted-foreground mb-2">Monthly Budget</div>
                    <div className="text-2xl font-bold text-foreground">{strategy.budget?.monthly || '€4,500'}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                    <div className="text-sm text-muted-foreground mb-2">Testing vs Scaling</div>
                    <div className="text-lg font-bold text-foreground">
                      {strategy.budget?.allocation?.testing || '30'}% / {strategy.budget?.allocation?.scaling || '70'}%
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-muted/5 border border-border/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Testing Phase</span>
                    <span className="text-sm font-medium text-foreground">{strategy.budget?.allocation?.testing || 30}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400" style={{ width: `${strategy.budget?.allocation?.testing || 30}%` }} />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Scaling Phase</span>
                    <span className="text-sm font-medium text-foreground">{strategy.budget?.allocation?.scaling || 70}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-green-400" style={{ width: `${strategy.budget?.allocation?.scaling || 70}%` }} />
                  </div>
                </div>
              </div>

              {/* Ad Preview */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Ad Preview
                </h3>
                <div className="p-6 rounded-xl bg-gradient-to-br from-muted/10 to-transparent border border-border/20">
                  <div className="text-xl font-bold text-foreground mb-3">{ad.headline}</div>
                  <div className="text-foreground/80 mb-4">{ad.description}</div>
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/20 border border-primary/30 text-primary rounded-xl font-semibold">
                    {ad.cta}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Campaign Settings */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  Campaign Settings
                </h3>
                <div className="p-6 rounded-xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/20 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Campaign Objective</div>
                      <div className="text-foreground font-medium capitalize">{ad.objective}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Buying Type</div>
                      <div className="text-foreground font-medium">Auction</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Campaign Budget</div>
                      <div className="text-foreground font-medium">{strategy.budget?.daily || '€150/day'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Bid Strategy</div>
                      <div className="text-foreground font-medium">Lowest Cost</div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border/20">
                    <div className="text-sm text-muted-foreground mb-2">Special Ad Categories</div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1.5 rounded-lg bg-muted/20 text-foreground text-sm">None</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ad Set Settings */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Ad Set Settings
                </h3>
                <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/20 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Traffic Type</div>
                      <div className="text-foreground font-medium">Website</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Dynamic Creative</div>
                      <div className="text-foreground font-medium">Enabled</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Budget & Schedule</div>
                      <div className="text-foreground font-medium">Daily Budget: {strategy.budget?.daily || '€150'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Optimization Goal</div>
                      <div className="text-foreground font-medium">Conversions</div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border/20">
                    <div className="text-sm text-muted-foreground mb-3">Audience</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/10">
                        <span className="text-foreground">Location</span>
                        <span className="text-muted-foreground">Deutschland, Österreich, Schweiz</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/10">
                        <span className="text-foreground">Age</span>
                        <span className="text-muted-foreground">{strategy.targeting?.age || '25-45'}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/10">
                        <span className="text-foreground">Gender</span>
                        <span className="text-muted-foreground">All</span>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/10">
                        <div className="text-foreground mb-2">Detailed Targeting</div>
                        <div className="flex flex-wrap gap-2">
                          {(strategy.targeting?.interests || ['E-Commerce', 'Online Shopping']).map((interest: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 text-xs rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border/20">
                    <div className="text-sm text-muted-foreground mb-3">Placements</div>
                    <div className="grid grid-cols-2 gap-2">
                      {(strategy.targeting?.placements || ['Facebook Feed', 'Instagram Stories', 'Reels']).map((placement: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/10">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-foreground text-sm">{placement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ad Settings */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Ad Creative Settings
                </h3>
                <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/5 to-transparent border border-purple-500/20 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Ad Format</div>
                      <div className="text-foreground font-medium">Single Image / Video</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Destination</div>
                      <div className="text-foreground font-medium">Website URL</div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border/20">
                    <div className="text-sm text-muted-foreground mb-3">Ad Creative</div>
                    <div className="p-4 rounded-lg bg-muted/10 space-y-3">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Primary Text</div>
                        <div className="text-foreground">{ad.description}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Headline</div>
                        <div className="text-foreground font-medium">{ad.headline}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Call-to-Action</div>
                        <div className="inline-flex items-center px-4 py-2 bg-primary/20 border border-primary/30 text-primary rounded-lg font-medium text-sm">
                          {ad.cta}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border/20">
                    <div className="text-sm text-muted-foreground mb-3">Tracking & Pixels</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/10">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-foreground">Facebook Pixel</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/10">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-foreground">Conversion API</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/10">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-foreground">UTM Parameters</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border/30 sticky bottom-0 bg-card flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-border/50 rounded-xl text-foreground hover:bg-muted transition-colors"
          >
            Schließen
          </button>
          <div className="flex items-center gap-3">
            <button className="px-6 py-2.5 bg-muted/50 border border-border/50 rounded-xl text-foreground hover:bg-muted transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Export PDF
            </button>
            <button className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/30 font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              In Meta Ads Manager öffnen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
