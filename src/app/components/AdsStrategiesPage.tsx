import { Target, Search, Filter, Sparkles, Brain, DollarSign, Users, Zap, CheckCircle2, Play, Pause, Copy, Trash2, Eye } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { StrategyViewModal } from './StrategyViewModal';
import { PageShell, HeroHeader, Card } from './layout';
import { supabase } from '../lib/supabaseClient';
import { generateStrategyPlan } from '../lib/api/creative';

type GeneratedStrategy = {
  schema_version?: string;
  name: string;
  summary?: string;
  confidence?: number;
  blueprint?: { id?: string | null; title?: string | null };
  recommendations?: string[];
  performance?: {
    expectedCTR?: number;
    expectedROAS?: number;
    expectedCPA?: number;
  };
  product_focus?: {
    positioning?: string;
    usp?: string;
    offer?: string;
    proof_points?: string[];
    objections?: string[];
    voice?: string;
    value_props?: string[];
  };
  audience?: {
    core?: string;
    segments?: string[];
    pains?: string[];
    desires?: string[];
    objections?: string[];
    language?: string;
    region?: string | null;
  };
  messaging?: {
    key_messages?: string[];
    angles?: string[];
    hooks?: string[];
    cta_guidance?: string[];
    compliance_notes?: string[];
  };
  creative_system?: {
    formats?: string[];
    visual_style?: {
      mood?: string;
      palette?: string[];
      photography_style?: string;
      do?: string[];
      dont?: string[];
    };
    ad_examples?: Array<{ hook?: string; primary_text?: string; cta?: string; render_intent?: string }>;
  };
  funnel?: { stages?: Array<{ stage?: string; goal?: string; message?: string; kpi?: string }> };
  testing_plan?: {
    hypotheses?: string[];
    experiments?: string[];
    timeline?: string;
    success_metrics?: string[];
  };
  budget?: {
    daily?: string;
    monthly?: string;
    scaling?: string;
    allocation?: {
      testing?: number;
      scaling?: number;
    };
    guardrails?: string[];
  };
  targeting?: {
    age?: string;
    gender?: string;
    locations?: string[];
    interests?: string[];
    behaviors?: string[];
    lookalikes?: string[];
    exclusions?: string[];
    placements?: string[];
  };
  meta_setup?: {
    campaign?: {
      name?: string;
      objective?: string;
      budget_type?: string;
      daily_budget?: string;
      bid_strategy?: string;
      optimization_goal?: string;
      attribution?: string;
      special_ad_categories?: string[];
    };
    ad_sets?: Array<{
      name?: string;
      budget?: string;
      schedule?: string;
      optimization_goal?: string;
      audience?: {
        locations?: string[];
        age?: string;
        gender?: string;
        interests?: string[];
        lookalikes?: string[];
        exclusions?: string[];
      };
      placements?: string[];
    }>;
    ads?: Array<{
      name?: string;
      primary_text?: string;
      headline?: string;
      description?: string;
      cta?: string;
      format?: string;
      creative_notes?: string;
    }>;
    tracking?: { pixel?: string; conversion_api?: string; utm_template?: string };
  };
  execution_checklist?: string[];
  long_form?: string;
};

interface SavedAd {
  id: string;
  name: string;
  headline: string;
  description: string;
  cta: string;
  productName: string;
  targetAudience: string;
  objective: string;
  budget: string;
  status: 'active' | 'paused' | 'draft';
  createdAt: string;
  strategy?: GeneratedStrategy;
  performance?: {
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
    roas: number;
    spent: number;
  };
  rawInputs?: Record<string, unknown> | null;
  rawOutputs?: Record<string, unknown> | null;
  blueprintTitle?: string | null;
}


export function AdsStrategiesPage() {
  const [savedAds, setSavedAds] = useState<SavedAd[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  type StatusFilter = 'all' | 'active' | 'paused' | 'draft';
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [showStrategyViewModal, setShowStrategyViewModal] = useState(false);
  const [selectedAdForStrategy, setSelectedAdForStrategy] = useState<SavedAd | null>(null);
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [generatedStrategy, setGeneratedStrategy] = useState<GeneratedStrategy | null>(null);
  const [isLoadingAds, setIsLoadingAds] = useState(false);
  const [adsError, setAdsError] = useState<string | null>(null);


  type CreativeOutput = {
    schema_version?: string;
    brief?: {
      product?: { name?: string };
      audience?: { summary?: string };
      goal?: string;
    };
    creatives?: Array<{ copy?: { hook?: string; primary_text?: string; cta?: string } }>;
    variants?: Array<{
      copy?: { hook?: string; primary_text?: string; cta?: string };
    }>;
  };

  type CreativeRow = {
    id: string;
    outputs?: Record<string, unknown> | null;
    inputs?: Record<string, unknown> | null;
    created_at?: string | null;
    saved?: boolean | null;
    strategy_blueprints?: { title?: string | null } | Array<{ title?: string | null }> | null;
  };

  const mapCreativeRow = useCallback((row: CreativeRow): SavedAd | null => {
    if (!row) return null;
    const inputs = row.inputs || null;
    const hasBrief = Boolean((inputs as { brief?: unknown } | null)?.brief);
    const output = row.outputs || hasBrief ? (row.outputs ?? { brief: (inputs as { brief?: unknown } | null)?.brief, creatives: [] }) : null;
    const brief = (output as CreativeOutput | null)?.brief || (inputs as { brief?: CreativeOutput['brief'] } | null)?.brief || null;
    const creative =
      Array.isArray((output as CreativeOutput | null)?.creatives) && (output as CreativeOutput).creatives?.length
        ? (output as CreativeOutput).creatives?.[0]
        : Array.isArray((output as CreativeOutput | null)?.variants)
          ? (output as CreativeOutput).variants?.[0]
          : null;
    const headline =
      creative?.copy?.hook ||
      (inputs as { headline?: string; title?: string } | null)?.headline ||
      (inputs as { title?: string } | null)?.title ||
      'Untitled Ad';
    const description =
      creative?.copy?.primary_text ||
      (inputs as { description?: string } | null)?.description ||
      '';
    const cta =
      creative?.copy?.cta ||
      (inputs as { cta?: string } | null)?.cta ||
      'Learn More';
    const productName = brief?.product?.name || (inputs as { productName?: string; brandName?: string } | null)?.productName || (inputs as { brandName?: string } | null)?.brandName || 'Produkt';
    const targetAudience = brief?.audience?.summary || (inputs as { targetAudience?: string } | null)?.targetAudience || 'Zielgruppe';
    const objective = brief?.goal || (inputs as { objective?: string } | null)?.objective || 'sales';
    const lifecycle = (inputs as { lifecycle?: { status?: SavedAd['status'] } } | null)?.lifecycle;
    const status = lifecycle?.status || (row.saved ? 'active' : 'draft');
    const strategy = (inputs as { ai_strategy?: GeneratedStrategy } | null)?.ai_strategy ?? undefined;
    const blueprintTitle = Array.isArray(row.strategy_blueprints)
      ? row.strategy_blueprints[0]?.title ?? null
      : row.strategy_blueprints?.title ?? null;

    return {
      id: row.id,
      name: headline,
      headline,
      description,
      cta,
      productName,
      targetAudience,
      objective,
      budget: (inputs as { budget?: string | number } | null)?.budget != null
        ? String((inputs as { budget?: string | number }).budget)
        : '—',
      status,
      createdAt: row.created_at || new Date().toISOString(),
      strategy,
      rawInputs: inputs || null,
      rawOutputs: row.outputs || null,
      blueprintTitle,
    };
  }, []);

  const loadAds = useCallback(async () => {
    setIsLoadingAds(true);
    setAdsError(null);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        setSavedAds([]);
        return;
      }

      const { data, error } = await supabase
        .from('generated_creatives')
        .select(
          'id,inputs,outputs,created_at,saved,blueprint_id,strategy_blueprints(id,title,category)'
        )
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      const mapped = (data || [])
        .map(mapCreativeRow)
        .filter((item): item is SavedAd => Boolean(item));

      setSavedAds(mapped);
    } catch (err: unknown) {
      setAdsError(err instanceof Error ? err.message : 'Failed to load ads');
      setSavedAds([]);
    } finally {
      setIsLoadingAds(false);
    }
  }, [mapCreativeRow]);

  useEffect(() => {
    loadAds().catch(() => undefined);
  }, [loadAds]);

  // Filter ads
  const filteredAds = savedAds.filter(ad => {
    const matchesSearch = 
      ad.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ad.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    totalAds: savedAds.length,
    activeAds: savedAds.filter(a => a.status === 'active').length,
    withStrategy: savedAds.filter(a => a.strategy).length,
    avgRoas: savedAds
      .filter(a => a.strategy)
      .reduce((sum, a) => sum + (a.strategy?.performance?.expectedROAS || 0), 0) /
      (savedAds.filter(a => a.strategy).length || 1)
  };

  // Open strategy modal
  const handleCreateStrategy = async (ad: SavedAd) => {
    setSelectedAdForStrategy(ad);
    setShowStrategyModal(true);
    setGeneratedStrategy(null);
    await generateStrategy(ad);
  };

  // Generate AI Strategy (server-side)
  const generateStrategy = async (ad?: SavedAd | null) => {
    const targetAd = ad ?? selectedAdForStrategy;
    if (!targetAd) return;
    setIsGeneratingStrategy(true);
    try {
      const result = await generateStrategyPlan({ creativeId: targetAd.id });
      const strategy = result?.strategy as GeneratedStrategy;
      if (!strategy) {
        throw new Error('Strategy generation failed');
      }
      setGeneratedStrategy(strategy);

      const updatedAds = savedAds.map((row) =>
        row.id === targetAd.id ? { ...row, strategy } : row,
      );
      setSavedAds(updatedAds);

      if (targetAd.rawInputs) {
        const mergedInputs = {
          ...targetAd.rawInputs,
          ai_strategy: strategy,
        };
        const { error } = await supabase
          .from('generated_creatives')
          .update({ inputs: mergedInputs })
          .eq('id', targetAd.id);
        if (error) {
          console.warn('Failed to persist strategy:', error.message);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Strategie konnte nicht erstellt werden.';
      toast.error(message);
    } finally {
      setIsGeneratingStrategy(false);
    }
  };

  // Actions
  const handleDuplicate = (ad: SavedAd) => {
    const newAd: SavedAd = {
      ...ad,
      id: Date.now().toString(),
      name: `${ad.name} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString()
    };
    
    (async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        const userId = session.session?.user?.id;
        if (!userId) {
          throw new Error('Bitte zuerst anmelden.');
        }

        const { data, error } = await supabase
          .from('generated_creatives')
          .insert({
            user_id: userId,
            inputs: newAd.rawInputs || null,
            outputs: newAd.rawOutputs || null,
            saved: false,
          })
          .select('id,inputs,outputs,created_at,saved,strategy_blueprints(id,title,category)')
          .single();

        if (error) throw error;
        const mapped = mapCreativeRow(data);
        if (mapped) {
          setSavedAds((prev) => [mapped, ...prev]);
        }
        toast.success('Ad duplicated successfully');
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Duplicate failed');
      }
    })();
  };

  const handleDelete = (adId: string) => {
    (async () => {
      try {
        const { error } = await supabase.from('generated_creatives').delete().eq('id', adId);
        if (error) throw error;
        const updatedAds = savedAds.filter(a => a.id !== adId);
        setSavedAds(updatedAds);
        toast.success('Ad deleted');
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Delete failed');
      }
    })();
  };

  const handleStatusChange = (adId: string, newStatus: 'active' | 'paused') => {
    const updatedAds = savedAds.map(ad => 
      ad.id === adId ? { ...ad, status: newStatus } : ad
    );
    setSavedAds(updatedAds);
    const selected = updatedAds.find(ad => ad.id === adId);
    if (selected) {
      supabase
        .from('generated_creatives')
        .update({
          inputs: {
            ...(selected.rawInputs || {}),
            lifecycle: {
              ...(selected.rawInputs?.lifecycle || {}),
              status: newStatus,
            },
          },
        })
        .eq('id', adId)
        .then(({ error }) => {
          if (error) console.warn('Failed to persist status', error.message);
        });
    }
    toast.success(`Ad ${newStatus === 'active' ? 'activated' : 'paused'}`);
  };

  return (
    <PageShell>
      <HeroHeader
        title="Saved Ads & Strategien"
        subtitle="Verwalte deine Ads und erstelle AI-powered Performance-Strategien"
      />

      {adsError && (
        <Card className="p-4 border border-red-500/30 bg-red-500/5 text-red-600">
          {adsError}
        </Card>
      )}

      {isLoadingAds && (
        <Card className="p-4 text-sm text-muted-foreground">Lade gespeicherte Ads…</Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-border/30">
          <div className="text-2xl text-foreground font-bold mb-1">{stats.totalAds}</div>
          <div className="text-sm text-muted-foreground">Total Ads</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-transparent border border-border/30">
          <div className="text-2xl text-foreground font-bold mb-1">{stats.activeAds}</div>
          <div className="text-sm text-muted-foreground">Active</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-border/30">
          <div className="text-2xl text-foreground font-bold mb-1">{stats.withStrategy}</div>
          <div className="text-sm text-muted-foreground">With Strategy</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-border/30">
          <div className="text-2xl text-foreground font-bold mb-1">{stats.avgRoas.toFixed(1)}x</div>
          <div className="text-sm text-muted-foreground">Avg. ROAS</div>
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-border/50 rounded-xl focus:outline-none focus:border-primary/50 transition-colors text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-4 py-2.5 bg-background/50 border border-border/50 rounded-xl focus:outline-none focus:border-primary/50 transition-colors text-foreground cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Ads Grid */}
      {filteredAds.length === 0 ? (
        <Card className="p-16 text-center">
          <Target className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-foreground font-semibold mb-2">Keine Ads gefunden</h3>
          <p className="text-muted-foreground mb-6">
            Erstelle deine erste Ad im Ad Builder!
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredAds.map((ad) => (
            <Card
              key={ad.id}
              className="hover:shadow-2xl transition-all duration-300 overflow-hidden group"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px]">
                {/* Left: Ad Content */}
                <div className="p-6 lg:border-r border-border/30">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-foreground">{ad.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          ad.status === 'active' ? 'bg-green-500/20 text-green-500' :
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
                          <span className="text-lg font-bold text-purple-500">{ad.strategy.confidence}%</span>
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
          ))}
        </div>
      )}

      {/* Strategy Modal */}
      {showStrategyModal && selectedAdForStrategy && (
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
      )}

      {/* Strategy View Modal */}
      {showStrategyViewModal && selectedAdForStrategy && generatedStrategy && (
        <StrategyViewModal
          strategy={generatedStrategy}
          ad={selectedAdForStrategy}
          onClose={() => setShowStrategyViewModal(false)}
        />
      )}
    </PageShell>
  );
}
