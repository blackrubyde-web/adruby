import { Target, Search, Sparkles, Brain, DollarSign, Users, Zap, CheckCircle2, Play, Pause, Copy, Trash2, Eye, CheckSquare, Layers } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { StrategyViewModal } from './StrategyViewModal';
import { CampaignStrategyViewModal } from './CampaignStrategyViewModal';
import { PageShell, HeroHeader, Card } from './layout';
import { supabase } from '../lib/supabaseClient';
import { generateStrategyPlan } from '../lib/api/creative';
import { generateCampaignStrategyPlan } from '../lib/api/strategy';
import { StrategySelector } from './studio/StrategySelector';
import { StrategyWizard } from './studio/StrategyWizard';
import { useStrategies } from '../hooks/useStrategies';

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

type CampaignStrategyBlueprint = {
  id: string;
  name: string | null;
  creative_ids: string[];
  strategy: GeneratedStrategy;
  created_at?: string | null;
};

type CampaignStrategyModalState = {
  strategy: GeneratedStrategy;
  title?: string | null;
  ads: SavedAd[];
  createdAt?: string | null;
  strategyId?: string | null;
};


export function AdsStrategiesPage() {
  const [savedAds, setSavedAds] = useState<SavedAd[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  type StatusFilter = 'all' | 'active' | 'paused' | 'draft';
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [showStrategyViewModal, setShowStrategyViewModal] = useState(false);
  const [selectedAdForStrategy, setSelectedAdForStrategy] = useState<SavedAd | null>(null);
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [generatedStrategy, setGeneratedStrategy] = useState<GeneratedStrategy | null>(null);
  const [isGeneratingCampaignStrategy, setIsGeneratingCampaignStrategy] = useState(false);
  const [campaignStrategies, setCampaignStrategies] = useState<CampaignStrategyBlueprint[]>([]);
  const [campaignStrategyModal, setCampaignStrategyModal] = useState<CampaignStrategyModalState | null>(null);
  const [isLoadingAds, setIsLoadingAds] = useState(false);
  const [adsError, setAdsError] = useState<string | null>(null);
  const [campaignError, setCampaignError] = useState<string | null>(null);

  // Strategy Management State
  const [activeTab, setActiveTab] = useState<'ads' | 'strategies' | 'campaigns'>('ads');
  const { strategies, loading: strategiesLoading, refreshStrategies } = useStrategies();
  const [showStrategyWizard, setShowStrategyWizard] = useState(false);


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

  const loadCampaignStrategies = useCallback(async () => {
    setCampaignError(null);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        setCampaignStrategies([]);
        return;
      }

      const { data, error } = await supabase
        .from('campaign_strategy_blueprints')
        .select('id,name,creative_ids,strategy,created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setCampaignStrategies((data || []) as CampaignStrategyBlueprint[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load campaign strategies';
      setCampaignError(message);
      setCampaignStrategies([]);
    }
  }, []);

  useEffect(() => {
    loadAds().catch(() => undefined);
    loadCampaignStrategies().catch(() => undefined);
  }, [loadAds, loadCampaignStrategies]);

  // Filter ads
  const filteredAds = savedAds.filter(ad => {
    const matchesSearch =
      ad.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ad.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedAds = useMemo(
    () => savedAds.filter(ad => selectedIds.includes(ad.id)),
    [savedAds, selectedIds]
  );
  const visibleIds = useMemo(() => filteredAds.map(ad => ad.id), [filteredAds]);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => savedAds.some((ad) => ad.id === id)));
  }, [savedAds]);

  const toggleSelected = (id: string) => {
    setSelectionMode(true);
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setSelectionMode(false);
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
      return;
    }
    setSelectionMode(true);
    setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
  };

  // Stats
  const stats = {
    totalAds: savedAds.length,
    withStrategy: savedAds.filter(a => a.strategy).length,
    campaignStrategies: campaignStrategies.length,
    avgRoas: savedAds
      .filter(a => a.strategy)
      .reduce((sum, a) => sum + (a.strategy?.performance?.expectedROAS || 0), 0) /
      (savedAds.filter(a => a.strategy).length || 1)
  };

  const campaignMap = useMemo(() => {
    const map: Record<string, CampaignStrategyBlueprint[]> = {};
    campaignStrategies.forEach((strategy) => {
      if (!Array.isArray(strategy.creative_ids)) return;
      strategy.creative_ids.forEach((id) => {
        if (!map[id]) map[id] = [];
        map[id].push(strategy);
      });
    });
    return map;
  }, [campaignStrategies]);

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

  const handleGenerateCampaignStrategy = async () => {
    if (!selectedIds.length) {
      toast.error('Bitte wähle mindestens eine Ad aus.');
      return;
    }
    if (isGeneratingCampaignStrategy) return;
    setIsGeneratingCampaignStrategy(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user?.id;
      if (!userId) {
        throw new Error('Bitte zuerst anmelden.');
      }

      const result = await generateCampaignStrategyPlan({ creativeIds: selectedIds });
      const strategy = (result?.strategy || result?.campaignStrategy || result?.plan) as GeneratedStrategy;
      if (!strategy) {
        throw new Error('Kampagnen-Strategie konnte nicht erstellt werden.');
      }

      const fallbackTitle = `Kampagnen-Strategie ${new Date().toLocaleDateString('de-DE')}`;
      const title = result?.name || strategy.name || fallbackTitle;
      const adsForModal = selectedAds;
      let savedEntry: CampaignStrategyBlueprint | null = null;

      try {
        const { data, error } = await supabase
          .from('campaign_strategy_blueprints')
          .insert({
            user_id: userId,
            name: title,
            creative_ids: selectedIds,
            strategy,
          })
          .select('id,name,creative_ids,strategy,created_at')
          .single();
        if (error) throw error;
        savedEntry = data as CampaignStrategyBlueprint;
        setCampaignStrategies((prev) => [savedEntry as CampaignStrategyBlueprint, ...prev]);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Kampagnen-Strategie konnte nicht gespeichert werden.';
        console.warn('[campaign-strategy] persist failed', message);
        toast.info('Strategie erstellt, aber nicht gespeichert. Migration fehlt?');
      }

      setCampaignStrategyModal({
        strategy,
        title: savedEntry?.name ?? title,
        ads: adsForModal,
        createdAt: savedEntry?.created_at ?? null,
        strategyId: savedEntry?.id ?? null,
      });
      setSelectedIds([]);
      setSelectionMode(false);
      toast.success('Kampagnen-Strategie erstellt');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Kampagnen-Strategie fehlgeschlagen.';
      toast.error(message);
    } finally {
      setIsGeneratingCampaignStrategy(false);
    }
  };

  const handleOpenCampaignStrategy = (strategy: CampaignStrategyBlueprint) => {
    const adsForModal = savedAds.filter((ad) => strategy.creative_ids.includes(ad.id));
    setCampaignStrategyModal({
      strategy: strategy.strategy,
      title: strategy.name,
      ads: adsForModal,
      createdAt: strategy.created_at ?? null,
      strategyId: strategy.id,
    });
  };

  const navigateToCampaignBuilder = (draftId: string) => {
    const url = `/campaign-builder?id=${encodeURIComponent(draftId)}`;
    window.history.pushState({}, document.title, url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const createCampaignDraft = async (params: {
    name: string;
    creativeIds: string[];
    strategyId?: string | null;
    strategy?: GeneratedStrategy | null;
  }) => {
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user?.id;
    if (!userId) throw new Error('Bitte zuerst anmelden.');

    const campaignSpec = {
      campaign: {
        name: params.name,
        objective: params.strategy?.meta_setup?.campaign?.objective ?? '',
        budget_type: params.strategy?.meta_setup?.campaign?.budget_type ?? '',
        bid_strategy: params.strategy?.meta_setup?.campaign?.bid_strategy ?? '',
        attribution: params.strategy?.meta_setup?.campaign?.attribution ?? '',
        daily_budget: params.strategy?.meta_setup?.campaign?.daily_budget ?? '',
      },
      ad_sets: [],
      ads: params.creativeIds.map((id) => ({ creative_id: id })),
      strategy_snapshot: params.strategy ?? null,
    };

    const { data, error } = await supabase
      .from('campaign_drafts')
      .insert({
        user_id: userId,
        name: params.name,
        creative_ids: params.creativeIds,
        strategy_blueprint_id: params.strategyId ?? null,
        campaign_spec: campaignSpec,
        status: 'draft',
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id as string;
  };

  const handleOpenBuilderFromCampaignStrategy = async () => {
    if (!campaignStrategyModal) return;
    try {
      const draftId = await createCampaignDraft({
        name: campaignStrategyModal.title || 'Neue Kampagne',
        creativeIds: campaignStrategyModal.ads.map((ad) => ad.id),
        strategyId: campaignStrategyModal.strategyId ?? null,
        strategy: campaignStrategyModal.strategy,
      });
      navigateToCampaignBuilder(draftId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Kampagne konnte nicht erstellt werden.';
      toast.error(message);
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

  const handleCreateMasterStrategy = async (data: {
    name: string;
    industry_type: string;
    target_roas: number;
    max_daily_budget: number;
    scale_speed: string;
    risk_tolerance: string
  }) => {
    try {
      const { error } = await supabase.from('strategy_blueprints').insert({
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
          created_via: 'dashboard_wizard'
        }
      });

      if (error) throw error;
      toast.success("Master Strategy Created!");
      refreshStrategies();
      setShowStrategyWizard(false);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      toast.error("Failed to create strategy: " + errorMessage);
    }
  };

  const renderStrategiesView = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-primary/10 to-transparent p-6 rounded-2xl border border-primary/10 gap-4">
        <div>
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            My Strategy Blueprints
          </h2>
          <p className="text-muted-foreground">
            Create and manage your reusable Ad Strategies. These blueprints drive the Autopilot's decisions.
          </p>
        </div>
      </div>

      {strategiesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-muted animate-pulse rounded-2xl" />)}
        </div>
      ) : (
        <StrategySelector
          strategies={strategies}
          selectedId={null}
          onSelect={() => { }}
          onCreateNew={() => setShowStrategyWizard(true)}
          recommendedGoal="scaling"
        />
      )}
    </div>
  );

  return (
    <PageShell>
      <HeroHeader
        title="Strategie & Kampagnenplanung"
        subtitle="Wähle mehrere Ads aus und erstelle AI-Kampagnenstrategien als Blueprint."
      />

      {/* Tabs */}
      <div className="flex items-center gap-6 mb-8 border-b border-border">
        <button
          onClick={() => setActiveTab('ads')}
          className={`pb-3 px-2 text-sm font-medium transition-all relative ${activeTab === 'ads'
            ? 'text-primary'
            : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          Ads Library
          {activeTab === 'ads' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('strategies')}
          className={`pb-3 px-2 text-sm font-medium transition-all relative ${activeTab === 'strategies'
            ? 'text-primary'
            : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          Master Strategies
          {activeTab === 'strategies' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
      </div>

      {activeTab === 'ads' && (
        <>

          {adsError && (
            <Card className="p-4 border border-red-500/30 bg-red-500/5 text-red-600">
              {adsError}
            </Card>
          )}

          {campaignError && (
            <Card className="p-4 border border-amber-500/30 bg-amber-500/5 text-amber-600">
              {campaignError}
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
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-border/30">
              <div className="text-2xl text-foreground font-bold mb-1">{stats.withStrategy}</div>
              <div className="text-sm text-muted-foreground">With Strategy</div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-transparent border border-border/30">
              <div className="text-2xl text-foreground font-bold mb-1">{stats.campaignStrategies}</div>
              <div className="text-sm text-muted-foreground">Campaign Strategien</div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-border/30">
              <div className="text-2xl text-foreground font-bold mb-1">{stats.avgRoas.toFixed(1)}x</div>
              <div className="text-sm text-muted-foreground">Avg. ROAS</div>
            </div>
          </div>

          {/* Filters & Search */}
          {/* Filters & Search - Premium Design */}
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

          {selectedIds.length > 0 && (
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
          )}

          {/* Ads Grid */}
          {filteredAds.length === 0 ? (
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
          )}
        </>
      )}

      {activeTab === 'strategies' && renderStrategiesView()}

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

      {campaignStrategyModal && (
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
      )}

      {showStrategyWizard && (
        <StrategyWizard
          onComplete={handleCreateMasterStrategy}
          onCancel={() => setShowStrategyWizard(false)}
        />
      )}
    </PageShell>
  );
}
