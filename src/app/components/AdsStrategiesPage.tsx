import { Brain, Trash2, Edit, Plus, TrendingUp, Shield, Zap, Activity, Globe, Sparkles, Target } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PageShell, HeroHeader, Card, Chip, Badge } from './layout';
import { supabase } from '../lib/supabaseClient';
import { useAnalyticsData } from '../hooks/useAnalyticsData';

import { StrategyWizard } from './studio/StrategyWizard';
import { useStrategies, StrategyBlueprint } from '../hooks/useStrategies';
import { StrategySimulationPreview } from './studio/StrategySimulationPreview';

type RiskTolerance = 'low' | 'medium' | 'high';
type ScaleSpeed = 'slow' | 'medium' | 'fast' | 'aggressive';

type AutopilotConfig = {
  target_roas?: number;
  max_daily_budget?: number;
  scale_speed?: ScaleSpeed;
  risk_tolerance?: RiskTolerance;
};

const RISK_TOLERANCE_VALUES: RiskTolerance[] = ['low', 'medium', 'high'];
const SCALE_SPEED_VALUES: ScaleSpeed[] = ['slow', 'medium', 'fast', 'aggressive'];

const toRiskTolerance = (value: unknown): RiskTolerance | undefined => (
  typeof value === 'string' && RISK_TOLERANCE_VALUES.includes(value as RiskTolerance)
    ? (value as RiskTolerance)
    : undefined
);

const toScaleSpeed = (value: unknown): ScaleSpeed | undefined => {
  if (typeof value !== 'string') return undefined;
  if (value === 'standard') return 'medium';
  if (value === 'conservative') return 'slow';
  return SCALE_SPEED_VALUES.includes(value as ScaleSpeed) ? (value as ScaleSpeed) : undefined;
};

const toAutopilotConfig = (
  config: StrategyBlueprint['autopilot_config']
): AutopilotConfig => {
  if (!config || typeof config !== 'object') return {};
  const record = config as Record<string, unknown>;
  return {
    target_roas: typeof record.target_roas === 'number' ? record.target_roas : undefined,
    max_daily_budget: typeof record.max_daily_budget === 'number' ? record.max_daily_budget : undefined,
    scale_speed: toScaleSpeed(record.scale_speed),
    risk_tolerance: toRiskTolerance(record.risk_tolerance)
  };
};

export function AdsStrategiesPage() {
  const { strategies, loading: strategiesLoading, refreshStrategies } = useStrategies();
  const [showStrategyWizard, setShowStrategyWizard] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<StrategyBlueprint | null>(null);
  const editingConfig = editingStrategy ? toAutopilotConfig(editingStrategy.autopilot_config) : null;

  // Real Analytics Integration
  const { data: analytics } = useAnalyticsData('30d', false, 'meta');

  const marketPulse = useMemo(() => {
    // Default fallback if no data
    if (!analytics || !analytics.summary) {
      return { cpm: 12.45, ctr: 1.8, volatility: 'Stable', cpmDelta: 2, ctrDelta: 0.1 };
    }

    const s = analytics.summary;
    const cpm = s.impressions > 0 ? (s.spend / s.impressions) * 1000 : 12.45;
    const ctr = s.ctr || 1.8;

    // Determine volatility based on ROAS change
    const roasChange = s.deltas?.roas || 0;
    const volatility = Math.abs(roasChange) > 0.2 ? 'Volatile' : Math.abs(roasChange) > 0.1 ? 'Active' : 'Stable';

    return {
      cpm,
      ctr,
      volatility,
      cpmDelta: (s.deltas?.spend || 0) * 100, // spending as proxy for CPM shift
      ctrDelta: (s.deltas?.ctr || 0) * 100
    };
  }, [analytics]);

  const handleCreateOrUpdateStrategy = async (rawStrategy: Record<string, unknown>) => {
    const data = rawStrategy as unknown as {
      name: string;
      industry_type: string;
      target_roas: number;
      max_daily_budget: number;
      scale_speed: ScaleSpeed;
      risk_tolerance: RiskTolerance;
    };

    const commonData = {
      title: data.name,
      category: 'custom',
      industry_type: data.industry_type,
      autopilot_config: {
        enabled: true,
        target_roas: data.target_roas,
        max_daily_budget: data.max_daily_budget,
        scale_speed: data.scale_speed,
        risk_tolerance: data.risk_tolerance,
        pause_threshold_roas: 1.0,
        scale_threshold_roas: data.target_roas * 1.2,
        max_budget_increase_pct: 0.2,
        min_conversions_required: 10
      },
      raw_content_markdown: `Strategy: ${data.name}\nIndustry: ${data.industry_type}\nRisk: ${data.risk_tolerance}`,
      metadata: {
        created_via: 'strategy_manager_wizard'
      }
    };

    try {
      if (editingStrategy) {
        const { error } = await supabase
          .from('strategy_blueprints')
          .update(commonData)
          .eq('id', editingStrategy.id);

        if (error) throw error;
        toast.success("Strategy Updated!");
      } else {
        const { error } = await supabase
          .from('strategy_blueprints')
          .insert(commonData);

        if (error) throw error;
        toast.success("Master Strategy Created!");
      }

      refreshStrategies();
      setShowStrategyWizard(false);
      setEditingStrategy(null);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      toast.error("Failed to save strategy: " + errorMessage);
    }
  };

  const handleDeleteStrategy = async (id: string) => {
    if (!confirm('Are you sure you want to delete this strategy?')) return;
    try {
      const { error } = await supabase.from('strategy_blueprints').delete().eq('id', id);
      if (error) throw error;
      toast.success('Strategy deleted');
      refreshStrategies();
    } catch (e) {
      toast.error("Failed to delete strategy");
    }
  };

  const handleEditClick = (strategy: StrategyBlueprint) => {
    setEditingStrategy(strategy);
    setShowStrategyWizard(true);
  };

  return (
    <PageShell>
      <HeroHeader
        title="Strategy Command"
        subtitle="Orchestrate your autopilot logic. Define your risk tolerance, growth targets, and let the AI handle the daily optimizations."
        actions={
          <button
            onClick={() => { setEditingStrategy(null); setShowStrategyWizard(true); }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            New Strategy
          </button>
        }
        chips={
          <div className="flex flex-wrap gap-2">
            <Chip variant={marketPulse.volatility === 'Stable' ? 'success' : 'warning'} icon={<Activity className="w-3 h-3" />}>
              Market Volatility: {marketPulse.volatility}
            </Chip>
            <Chip variant="info" icon={<Globe className="w-3 h-3" />}>
              30-Day Outlook: Positive
            </Chip>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Col: Strategy List */}
        <div className="md:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Active Blueprints
            </h2>
          </div>

          {strategiesLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-[240px] bg-card/50 animate-pulse rounded-2xl border border-border/40" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {strategies.map((s) => {
                const config = toAutopilotConfig(s.autopilot_config);
                return (
                  <Card
                    key={s.id}
                    className="group relative flex flex-col justify-between p-6 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                          {s.industry_type === 'ecommerce' ? <Globe className="w-6 h-6" /> :
                            s.industry_type === 'saas' ? <Zap className="w-6 h-6" /> :
                              <Brain className="w-6 h-6" />}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditClick(s)}
                            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStrategy(s.id)}
                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-muted-foreground hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold mb-1 text-foreground">{s.title}</h3>
                      <p className="text-xs text-muted-foreground mb-6 uppercase tracking-wider font-semibold opacity-70">
                        {s.industry_type} • {config.risk_tolerance} Risk
                      </p>

                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                          <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Target ROAS</div>
                          <div className="text-xl font-bold text-foreground">{(config.target_roas || 0).toFixed(1)}x</div>
                        </div>
                        <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                          <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Budget Cap</div>
                          <div className="text-xl font-bold text-foreground">€{(config.max_daily_budget || 0).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full h-[70px] relative mt-auto border-t border-border/30 pt-4">
                      <StrategySimulationPreview
                        targetRoas={config.target_roas ?? 3}
                        riskTolerance={config.risk_tolerance ?? 'medium'}
                        scaleSpeed={config.scale_speed ?? 'medium'}
                      />
                    </div>
                  </Card>
                );
              })}

              <button
                onClick={() => { setEditingStrategy(null); setShowStrategyWizard(true); }}
                className="group flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 hover:border-primary/50 hover:bg-primary/5 transition-all min-h-[360px]"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8 text-primary" />
                </div>
                <span className="font-bold text-lg text-muted-foreground group-hover:text-primary transition-colors">Create New Strategy</span>
                <p className="text-xs text-muted-foreground mt-2 text-center max-w-[200px]">Define a custom blueprint for AI autopilot</p>
              </button>
            </div>
          )}
        </div>

        {/* Right Col: Sidebar / Market Stats */}
        <div className="md:col-span-4 space-y-6">
          {/* Market Pulse Card */}
          <Card className="p-6 relative overflow-hidden bg-gradient-to-b from-card to-card/50">
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Market Pulse</h3>
                <p className="text-xs text-muted-foreground">Real-time ad ecosystem data</p>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center py-2.5 border-b border-border/40">
                <span className="text-sm text-muted-foreground">CPM (Global)</span>
                <span className="font-semibold text-sm text-foreground">
                  €{marketPulse.cpm.toFixed(2)}
                  <span className={`text-[10px] ml-1.5 ${marketPulse.cpmDelta >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {marketPulse.cpmDelta >= 0 ? '▲' : '▼'} {Math.abs(marketPulse.cpmDelta).toFixed(1)}%
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-border/40">
                <span className="text-sm text-muted-foreground">CTR Avg</span>
                <span className="font-semibold text-sm text-foreground">
                  {marketPulse.ctr.toFixed(2)}%
                  <span className={`text-[10px] ml-1.5 ${marketPulse.ctrDelta >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {marketPulse.ctrDelta >= 0 ? '▲' : '▼'} {Math.abs(marketPulse.ctrDelta).toFixed(1)}%
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-sm text-muted-foreground">Volatility</span>
                <Badge variant={marketPulse.volatility === 'Stable' ? 'success' : 'warning'}>
                  {marketPulse.volatility}
                </Badge>
              </div>
            </div>

            <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          </Card>

          {/* Top Templates */}
          <Card className="p-6">
            <h3 className="font-bold text-base mb-4 flex items-center gap-2 text-foreground">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Top Templates
            </h3>
            <div className="space-y-2">
              {[
                {
                  name: 'E-com Blitz',
                  risk: 'High',
                  variant: 'warning' as const,
                  data: {
                    name: 'E-com Blitz Strategy',
                    industry_type: 'ecommerce',
                    target_roas: 2.5,
                    risk_tolerance: 'high',
                    scale_speed: 'aggressive',
                    max_daily_budget: 500
                  }
                },
                {
                  name: 'Lead Gen Steady',
                  risk: 'Low',
                  variant: 'success' as const,
                  data: {
                    name: 'Steady Leads 24/7',
                    industry_type: 'local',
                    target_roas: 4.0,
                    risk_tolerance: 'low',
                    scale_speed: 'slow',
                    max_daily_budget: 150
                  }
                },
                {
                  name: 'Brand Awareness',
                  risk: 'Medium',
                  variant: 'purple' as const,
                  data: {
                    name: 'Brand Visibility',
                    industry_type: 'saas',
                    target_roas: 1.5,
                    risk_tolerance: 'medium',
                    scale_speed: 'medium',
                    max_daily_budget: 300
                  }
                }
              ].map((t, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setEditingStrategy(t.data as any);
                    setShowStrategyWizard(true);
                  }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/60 cursor-pointer transition-all border border-transparent hover:border-border/60 group"
                >
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                    <Plus className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    {t.name}
                  </span>
                  <Badge variant={t.variant}>{t.risk}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {showStrategyWizard && (
        <StrategyWizard
          onComplete={handleCreateOrUpdateStrategy}
          onCancel={() => { setShowStrategyWizard(false); setEditingStrategy(null); }}
          initialData={editingStrategy ? {
            name: editingStrategy.title,
            industry_type: editingStrategy.industry_type || '',
            target_roas: editingConfig?.target_roas ?? 3.0,
            risk_tolerance: editingConfig?.risk_tolerance ?? 'medium',
            scale_speed: editingConfig?.scale_speed ?? 'medium',
            max_daily_budget: editingConfig?.max_daily_budget ?? 100
          } : null}
        />
      )}
    </PageShell>
  );
}
