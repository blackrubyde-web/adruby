import { Brain, Trash2, Edit } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageShell, HeroHeader, Card } from './layout';
import { supabase } from '../lib/supabaseClient';

import { StrategyWizard } from './studio/StrategyWizard';
import { useStrategies, StrategyBlueprint } from '../hooks/useStrategies';

export function AdsStrategiesPage() {
  const { strategies, loading: strategiesLoading, refreshStrategies } = useStrategies();
  const [showStrategyWizard, setShowStrategyWizard] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<StrategyBlueprint | null>(null);

  const handleCreateOrUpdateStrategy = async (rawStrategy: Record<string, unknown>) => {
    // Cast to expected type
    const data = rawStrategy as unknown as {
      name: string;
      industry_type: string;
      target_roas: number;
      max_daily_budget: number;
      scale_speed: string;
      risk_tolerance: string
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
      <HeroHeader
        title="Master Strategy Control Center"
        subtitle="Manage the global blueprints that drive your autopilot decisions."
      />

      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl border border-primary/10">
          <div>
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              Your Blueprints
            </h2>
            <p className="text-muted-foreground max-w-lg">
              These strategies define how your campaigns scale, test, and optimize. Edit them to adjust global behavior.
            </p>
          </div>
          <button
            onClick={() => { setEditingStrategy(null); setShowStrategyWizard(true); }}
            className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
          >
            <Brain className="w-4 h-4" />
            New Strategy
          </button>
        </div>

        {/* Strategy List */}
        {strategiesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-muted animate-pulse rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {/* Reusing StrategySelector layout but custom logic for management card */}
            {strategies.map(s => {
              const config = s.autopilot_config as any || {};
              return (
                <Card key={s.id} className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-primary/30 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="p-4 bg-primary/10 rounded-xl text-primary">
                      <Brain className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-foreground">{s.title}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs text-muted-foreground uppercase tracking-wider font-medium">
                          {s.industry_type}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <span className="text-foreground font-medium">{config.target_roas}x</span> ROAS
                        </div>
                        <div className="w-1 h-1 bg-white/20 rounded-full" />
                        <div className="flex items-center gap-1">
                          <span className="text-foreground font-medium capitalize">{config.scale_speed}</span> Scaling
                        </div>
                        <div className="w-1 h-1 bg-white/20 rounded-full" />
                        <div className="flex items-center gap-1">
                          €<span className="text-foreground font-medium">{config.max_daily_budget}</span>/day
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                      onClick={() => handleEditClick(s)}
                      className="flex-1 md:flex-none px-4 py-2 border border-white/10 hover:bg-white/5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteStrategy(s.id)}
                      className="px-4 py-2 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              );
            })}

            {strategies.length === 0 && (
              <div className="text-center py-20 text-muted-foreground bg-muted/20 rounded-3xl border-2 border-dashed border-border">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No strategies found. Create your first blueprint to get started.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showStrategyWizard && (
        <StrategyWizard
          onComplete={handleCreateOrUpdateStrategy}
          onCancel={() => { setShowStrategyWizard(false); setEditingStrategy(null); }}
          initialData={editingStrategy ? {
            name: editingStrategy.title,
            industry_type: editingStrategy.industry_type || '',
            target_roas: (editingStrategy.autopilot_config as any)?.target_roas || 3.0,
            risk_tolerance: (editingStrategy.autopilot_config as any)?.risk_tolerance || 'medium',
            scale_speed: (editingStrategy.autopilot_config as any)?.scale_speed || 'standard',
            max_daily_budget: (editingStrategy.autopilot_config as any)?.max_daily_budget || 100
          } : null}
        />
      )}
    </PageShell>
  );
}
