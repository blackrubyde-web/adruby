import { Brain, Trash2, Edit } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageShell, HeroHeader, Card } from './layout';
import { supabase } from '../lib/supabaseClient';
import { StrategySelector } from './studio/StrategySelector';
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
<div className="text-sm text-muted-foreground">With Strategy</div>
            </div >
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-transparent border border-border/30">
              <div className="text-2xl text-foreground font-bold mb-1">{stats.campaignStrategies}</div>
              <div className="text-sm text-muted-foreground">Campaign Strategien</div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-border/30">
              <div className="text-2xl text-foreground font-bold mb-1">{stats.avgRoas.toFixed(1)}x</div>
              <div className="text-sm text-muted-foreground">Avg. ROAS</div>
            </div>
          </div >

  {/* Filters & Search */ }
{/* Filters & Search - Premium Design */ }
<div className="bg-card border border-border rounded-xl p-4 mb-6">
  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
    {/* Search */}
    <div className="flex-1 relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type="text"
        placeholder="Search ads by name, product or content..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
      />
    </div>

    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
      {/* Status Filter as Tabs */}
      <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
        {(['all', 'active', 'paused', 'draft'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${statusFilter === status
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Selection Toggle */}
      <button
        onClick={() => (selectionMode ? clearSelection() : setSelectionMode(true))}
        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${selectionMode
          ? 'bg-primary/10 text-primary border border-primary/30'
          : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
      >
        <CheckSquare className="w-4 h-4" />
        {selectionMode ? 'Auswahl aktiv' : 'Auswählen'}
      </button>
    </div>
  </div>
</div>

{
  selectedIds.length > 0 && (
    <Card className="sticky top-20 z-20 p-4 border border-primary/30 bg-primary/5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Layers className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">
            {selectedIds.length} Ads ausgewählt
          </div>
          <div className="text-xs text-muted-foreground">
            Erstelle eine Kampagnen-Strategie aus der Auswahl
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={toggleSelectAllVisible}
          className="px-3 py-2 bg-muted hover:bg-muted/80 border border-border rounded-lg text-xs font-semibold"
        >
          {allVisibleSelected ? 'Auswahl reduzieren' : 'Alle sichtbaren auswählen'}
        </button>
        <button
          onClick={clearSelection}
          className="px-3 py-2 bg-muted hover:bg-muted/80 border border-border rounded-lg text-xs font-semibold"
        >
          Auswahl löschen
        </button>
        <button
          onClick={handleGenerateCampaignStrategy}
          disabled={isGeneratingCampaignStrategy}
          className="px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg text-xs font-semibold shadow-lg shadow-primary/30 hover:scale-105 transition-all disabled:opacity-60"
        >
          {isGeneratingCampaignStrategy ? 'Strategie wird erstellt…' : 'Kampagnen-Strategie erstellen'}
        </button>
      </div>
    </Card>
  )
}

{/* Ads Grid */ }
{
  filteredAds.length === 0 ? (
    <Card className="p-16 text-center">
      <Target className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
      <h3 className="text-foreground font-semibold mb-2">Keine Ads gefunden</h3>
      <p className="text-muted-foreground mb-6">
        Erstelle deine erste Ad im Ad Builder und wähle mehrere für eine Kampagnenstrategie.
      </p>
    </Card>
  ) : (
  <div className="grid grid-cols-1 gap-6">
    {filteredAds.map((ad) => {
      const isSelected = selectedIds.includes(ad.id);
      const campaignLinks = campaignMap[ad.id] || [];
      return (
        <Card
          key={ad.id}
          className={`hover:shadow-2xl transition-all duration-300 overflow-hidden group ${isSelected ? 'ring-2 ring-primary/40' : ''}`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px]">
            {/* Left: Ad Content */}
            <div className="p-6 lg:border-r border-border/30">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {(selectionMode || selectedIds.length > 0) && (
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelected(ad.id)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary/40"
                        />
                      </label>
                    )}
                    <h3 className="text-xl font-bold text-foreground">{ad.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${ad.status === 'active' ? 'bg-green-500/20 text-green-500' :
                      ad.status === 'paused' ? 'bg-orange-500/20 text-orange-500' :
                        'bg-blue-500/20 text-blue-500'
                      }`}>
                      {ad.status}
                    </span>
                    {ad.strategy && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-500 flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        AI Strategie
                      </span>
                    )}
                    {ad.blueprintTitle && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                        Blueprint
                      </span>
                    )}
                    {campaignLinks.length > 0 && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        Kampagnenstrategie {campaignLinks.length}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {ad.productName}
                    {ad.blueprintTitle ? ` · ${ad.blueprintTitle}` : ''}
                  </p>
                </div>
              </div>

              {/* Ad Preview */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-muted/10 to-transparent border border-border/20 mb-4">
                <div className="text-lg font-bold text-foreground mb-3">{ad.headline}</div>
                <div className="text-foreground/80 mb-4 line-clamp-2">{ad.description}</div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/30 text-primary rounded-xl font-semibold">
                  {ad.cta}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-3 rounded-lg bg-muted/5">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Objective</span>
                  </div>
                  <div className="text-foreground font-medium capitalize">{ad.objective}</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/5">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Budget</span>
                  </div>
                  <div className="text-foreground font-medium">{ad.budget}</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/5">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Audience</span>
                  </div>
                  <div className="text-foreground font-medium text-sm">{ad.targetAudience}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {!ad.strategy ? (
                  <button
                    onClick={() => handleCreateStrategy(ad)}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/30 flex items-center justify-center gap-2 font-medium"
                  >
                    <Sparkles className="w-4 h-4" />
                    AI Strategie erstellen
                  </button>
                ) : (
                  <button
                    onClick={() => handleCreateStrategy(ad)}
                    className="flex-1 px-4 py-2.5 bg-purple-500/20 border border-purple-500/30 text-purple-500 rounded-xl hover:bg-purple-500/30 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                  >
                    <Brain className="w-4 h-4" />
                    Strategie bearbeiten
                  </button>
                )}
                <div className="flex items-center gap-1">
                  {ad.status === 'active' ? (
                    <button onClick={() => handleStatusChange(ad.id, 'paused')} className="p-2.5 hover:bg-muted rounded-lg transition-colors">
                      <Pause className="w-4 h-4 text-muted-foreground hover:text-primary" />
                    </button>
                  ) : ad.status === 'paused' ? (
                    <button onClick={() => handleStatusChange(ad.id, 'active')} className="p-2.5 hover:bg-muted rounded-lg transition-colors">
                      <Play className="w-4 h-4 text-muted-foreground hover:text-primary" />
                    </button>
                  ) : null}
                  <button onClick={() => handleDuplicate(ad)} className="p-2.5 hover:bg-muted rounded-lg transition-colors">
                    <Copy className="w-4 h-4 text-muted-foreground hover:text-primary" />
                  </button>
                  <button onClick={() => handleDelete(ad.id)} className="p-2.5 hover:bg-muted rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Strategy/Performance */}
            <div className="p-6 bg-gradient-to-br from-muted/5 to-transparent">
              {campaignLinks.length > 0 && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-xs text-emerald-700 mb-1">Kampagnenstrategie</div>
                  <div className="text-sm font-semibold text-foreground">
                    {campaignLinks[0].name || 'Kampagnenstrategie'}
                  </div>
                  {campaignLinks.length > 1 && (
                    <div className="text-xs text-muted-foreground">
                      + {campaignLinks.length - 1} weitere
                    </div>
                  )}
                  <button
                    onClick={() => handleOpenCampaignStrategy(campaignLinks[0])}
                    className="mt-2 text-xs text-emerald-700 hover:text-emerald-800 underline"
                  >
                    Strategie ansehen
                  </button>
                </div>
              )}
              {ad.strategy ? (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-5 h-5 text-purple-500" />
                    <h4 className="text-foreground font-semibold">{ad.strategy.name}</h4>
                  </div>

                  {/* Confidence */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">AI Confidence</span>
                      <span className="text-lg font-bold text-purple-500">
                        {ad.strategy.confidence != null ? `${ad.strategy.confidence}%` : '—'}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" style={{ width: `${ad.strategy.confidence}%` }} />
                    </div>
                  </div>

                  {/* Performance Predictions */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="text-xs text-green-500 mb-1">CTR</div>
                      <div className="text-foreground font-bold">
                        {ad.strategy.performance?.expectedCTR != null ? `${ad.strategy.performance.expectedCTR}%` : '—'}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="text-xs text-blue-500 mb-1">ROAS</div>
                      <div className="text-foreground font-bold">
                        {ad.strategy.performance?.expectedROAS != null ? `${ad.strategy.performance.expectedROAS}x` : '—'}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <div className="text-xs text-orange-500 mb-1">CPA</div>
                      <div className="text-foreground font-bold">
                        {ad.strategy.performance?.expectedCPA != null ? `€${ad.strategy.performance.expectedCPA}` : '—'}
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      Empfehlungen
                    </h5>
                    <div className="space-y-1.5">
                      {(ad.strategy.recommendations || []).slice(0, 3).map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* View Strategy Button */}
                  <button
                    onClick={() => {
                      setSelectedAdForStrategy(ad);
                      setGeneratedStrategy(ad.strategy ?? null);
                      setShowStrategyViewModal(true);
                    }}
                    className="w-full px-4 py-2.5 bg-purple-500/20 border border-purple-500/30 text-purple-500 rounded-xl hover:bg-purple-500/30 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Strategie anzeigen
                  </button>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="text-foreground font-semibold mb-2">Keine Strategie</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Erstelle eine AI-Strategie für optimale Performance
                  </p>
                  <button
                    onClick={() => handleCreateStrategy(ad)}
                    className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
                  >
                    Jetzt erstellen
                  </button>
                </div>
              )}
            </div>
          </div>
        </Card>
      );
    })}
  </div>
)
}
        </>
      )}

{ activeTab === 'strategies' && renderStrategiesView() }

{/* Strategy Modal */ }
{
  showStrategyModal && selectedAdForStrategy && (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border/50 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {isGeneratingStrategy ? (
          // Loading State
          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <Brain className="w-10 h-10 text-primary absolute inset-0 m-auto" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">AI analysiert deine Antworten...</h3>
            <p className="text-muted-foreground mb-6">
              Erstelle perfekte Performance-Strategie basierend auf deinen Angaben
            </p>
            <div className="max-w-md mx-auto space-y-2">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Analysiere Produkt, Markt und Zielgruppe...
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse animation-delay-200" />
                Erzeuge Strategie, Funnel und Messaging...
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse animation-delay-400" />
                Baue Meta Setup & Creative System...
              </div>
            </div>
          </div>
        ) : generatedStrategy ? (
          // Strategy Result
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Strategie erfolgreich erstellt!</h3>
              <p className="text-muted-foreground">Deine personalisierte Performance-Strategie ist bereit</p>
            </div>

            {/* Strategy Overview */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 mb-6">
              <h4 className="text-xl font-bold text-foreground mb-4">{generatedStrategy.name}</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Confidence</div>
                  <div className="text-2xl font-bold text-primary">
                    {generatedStrategy.confidence != null ? `${generatedStrategy.confidence}%` : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Expected ROAS</div>
                  <div className="text-2xl font-bold text-foreground">
                    {generatedStrategy.performance?.expectedROAS != null
                      ? `${generatedStrategy.performance.expectedROAS}x`
                      : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Expected CTR</div>
                  <div className="text-2xl font-bold text-foreground">
                    {generatedStrategy.performance?.expectedCTR != null
                      ? `${generatedStrategy.performance.expectedCTR}%`
                      : '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mb-6">
              <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Top Empfehlungen
              </h5>
              <div className="space-y-2">
                {(generatedStrategy.recommendations || []).map((rec: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/5">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setShowStrategyModal(false);
                toast.success('Strategie gespeichert!');
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/30 font-semibold"
            >
              Strategie übernehmen
            </button>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Strategie wird erstellt…</h3>
            <p className="text-muted-foreground mb-6">
              Wir erstellen eine individuelle, ausführliche Strategie basierend auf deinem Produkt.
            </p>
            <button
              onClick={() => generateStrategy(selectedAdForStrategy)}
              className="px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/30 font-semibold"
            >
              Jetzt generieren
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

{/* Strategy View Modal */ }
{
  showStrategyViewModal && selectedAdForStrategy && generatedStrategy && (
    <StrategyViewModal
      strategy={generatedStrategy}
      ad={selectedAdForStrategy}
      onClose={() => setShowStrategyViewModal(false)}
    />
  )
}

{
  campaignStrategyModal && (
    <CampaignStrategyViewModal
      strategy={campaignStrategyModal.strategy}
      title={campaignStrategyModal.title}
      ads={campaignStrategyModal.ads.map((ad) => ({
        id: ad.id,
        name: ad.name,
        headline: ad.headline,
        cta: ad.cta,
      }))}
      createdAt={campaignStrategyModal.createdAt}
      onOpenBuilder={handleOpenBuilderFromCampaignStrategy}
      onClose={() => setCampaignStrategyModal(null)}
    />
  )
}

{
  showStrategyWizard && (
    <StrategyWizard
      onComplete={handleCreateMasterStrategy}
      onCancel={() => setShowStrategyWizard(false)}
    />
  )
}
    </PageShell >
  );
}
