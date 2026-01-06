import { Brain, Trash2, Edit, Plus, TrendingUp, Shield, Zap, Activity, BarChart3, Globe, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageShell } from './layout';
import { supabase } from '../lib/supabaseClient';

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

  const handleCreateOrUpdateStrategy = async (rawStrategy: Record<string, unknown>) => {
    // Cast to expected type
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
        // UPDATE Existing
        const { error } = await supabase
          .from('strategy_blueprints')
          .update(commonData)
          .eq('id', editingStrategy.id);

        if (error) throw error;
        toast.success("Strategy Updated!");
      } else {
        // CREATE New
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
      {/* Header Section with Holographic Feel */}
      <div className="relative overflow-hidden rounded-3xl bg-[#080808] border border-white/5 p-8 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50 mb-4 tracking-tight">
              Strategy Command
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Orchestrate your autopilot logic. Define your risk tolerance, growth targets, and let the AI handle the daily optimizations.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-md">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">Market Volatility: Low</span>
            </div>
            <button
              onClick={() => { setEditingStrategy(null); setShowStrategyWizard(true); }}
              className="
                        group relative overflow-hidden px-8 py-4 rounded-2xl bg-white text-black font-bold text-lg 
                        shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] 
                        transition-all duration-300 hover:scale-[1.02] active:scale-95
                    "
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                New Strategy
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in slide-in-from-bottom-8 duration-700 delay-100">

        {/* Left Col: Strategy List */}
        <div className="md:col-span-8 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-400" />
              Active Blueprints
            </h2>
          </div>

          {strategiesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-[240px] bg-white/5 animate-pulse rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {strategies.map((s, i) => {
                const config = toAutopilotConfig(s.autopilot_config);
                return (
                  <div
                    key={s.id}
                    className="group relative flex flex-col justify-between p-6 rounded-3xl bg-[#0A0A0A] border border-white/5 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(79,70,229,0.1)] overflow-hidden"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    {/* Active Glow on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-indigo-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-500" />

                    <div>
                      <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-colors">
                          {s.industry_type === 'ecommerce' ? <Globe className="w-6 h-6" /> :
                            s.industry_type === 'saas' ? <Zap className="w-6 h-6" /> :
                              <Brain className="w-6 h-6" />}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(s)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStrategy(s.id)}
                            className="p-2 hover:bg-red-500/20 rounded-full transition-colors text-muted-foreground hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold mb-1 relative z-10 group-hover:text-indigo-200 transition-colors">{s.title}</h3>
                      <p className="text-sm text-muted-foreground mb-6 uppercase tracking-wider font-medium opacity-60">
                        {s.industry_type} • {config.risk_tolerance} Risk
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Target ROAS</div>
                          <div className="text-xl font-bold">{config.target_roas}x</div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                          <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Budget Cap</div>
                          <div className="text-xl font-bold">€{config.max_daily_budget}</div>
                        </div>
                      </div>
                    </div>

                    {/* Mini Chart Preview */}
                    <div className="w-full h-[60px] relative z-10 opacity-50 group-hover:opacity-100 transition-opacity">
                      <StrategySimulationPreview
                        targetRoas={config.target_roas ?? 3}
                        riskTolerance={config.risk_tolerance ?? 'medium'}
                        scaleSpeed={config.scale_speed ?? 'medium'}
                      />
                      {/* Overlay to block interaction with chart bits if needed, or just let it be visual */}
                      <div className="absolute inset-0" />
                    </div>
                  </div>
                );
              })}

              {/* Add New Card (Empty State) */}
              <button
                onClick={() => { setEditingStrategy(null); setShowStrategyWizard(true); }}
                className="group flex flex-col items-center justify-center p-6 rounded-3xl border-2 border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all min-h-[400px]"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8 text-muted-foreground group-hover:text-indigo-400" />
                </div>
                <span className="font-bold text-lg text-muted-foreground group-hover:text-indigo-300">Create New Strategy</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Col: Sidebar / Market Stats */}
        <div className="md:col-span-4 space-y-6">
          {/* Market Pulse Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#111] to-[#0A0A0A] border border-white/5 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Market Pulse</h3>
                <p className="text-xs text-muted-foreground">Real-time ad ecosystem data</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-sm text-muted-foreground">CPM (Global)</span>
                <span className="font-mono text-sm">€12.45 <span className="text-red-400 text-xs ml-1">▲ 2%</span></span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-sm text-muted-foreground">CTR Avg</span>
                <span className="font-mono text-sm">1.8% <span className="text-emerald-400 text-xs ml-1">▲ 0.1%</span></span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Volatility</span>
                <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-400 font-medium">Stable</span>
              </div>
            </div>

            {/* Decorative background element */}
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Recommended Templates */}
          <div className="p-6 rounded-3xl bg-[#0A0A0A] border border-white/5">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Top Templates
            </h3>
            <div className="space-y-3">
              {[
                {
                  name: 'E-com Blitz',
                  risk: 'High',
                  color: 'text-red-400',
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
                  color: 'text-emerald-400',
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
                  color: 'text-purple-400',
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
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group border border-transparent hover:border-white/5"
                >
                  <span className="font-medium group-hover:text-white transition-colors flex items-center gap-2">
                    <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
                    {t.name}
                  </span>
                  <span className={`text-xs font-bold ${t.color}`}>{t.risk}</span>
                </div>
              ))}
            </div>
          </div>
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
