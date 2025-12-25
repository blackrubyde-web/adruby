import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Plus,
  Sparkles,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageShell, HeroHeader, Card } from './layout';
import { supabase } from '../lib/supabaseClient';

const STATUS_OPTIONS = ['draft', 'ready'] as const;

type CampaignStatus = typeof STATUS_OPTIONS[number];

type GeneratedStrategy = {
  name: string;
  summary?: string;
  confidence?: number;
  recommendations?: string[];
  budget?: {
    daily?: string;
    monthly?: string;
    allocation?: { testing?: number; scaling?: number };
  };
  targeting?: {
    age?: string;
    gender?: string;
    locations?: string[];
    interests?: string[];
    placements?: string[];
  };
  meta_setup?: {
    campaign?: {
      name?: string;
      objective?: string;
      budget_type?: string;
      daily_budget?: string;
      bid_strategy?: string;
      attribution?: string;
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
    ads?: Array<{ name?: string; primary_text?: string; headline?: string; cta?: string }>;
  };
};

type CampaignSpec = {
  campaign: {
    name?: string;
    objective?: string;
    budget_type?: string;
    bid_strategy?: string;
    attribution?: string;
    daily_budget?: string;
  };
  ad_sets: Array<{
    id: string;
    name?: string;
    budget?: string;
    schedule?: string;
    placements?: string[];
    targeting?: {
      age?: string;
      gender?: string;
      locations?: string[];
      interests?: string[];
    };
    ad_ids: string[];
  }>;
  ads: Array<{
    creative_id: string;
    name?: string;
    headline?: string;
    primary_text?: string;
    cta?: string;
  }>;
  strategy_snapshot?: GeneratedStrategy | null;
};

type CampaignDraftRow = {
  id: string;
  name: string | null;
  creative_ids: string[];
  strategy_blueprint_id: string | null;
  campaign_spec: CampaignSpec | null;
  status: CampaignStatus;
  created_at?: string | null;
};

type CampaignStrategyBlueprint = {
  id: string;
  name: string | null;
  creative_ids: string[];
  strategy: GeneratedStrategy;
};

type CreativeRow = {
  id: string;
  outputs?: Record<string, unknown> | null;
  inputs?: Record<string, unknown> | null;
  created_at?: string | null;
  saved?: boolean | null;
  thumbnail?: string | null;
};

type SavedAd = {
  id: string;
  name: string;
  headline: string;
  description: string;
  cta: string;
  productName: string;
  targetAudience: string;
  status: 'active' | 'paused' | 'draft';
  createdAt: string;
  thumbnail?: string | null;
};

const emptySpec: CampaignSpec = {
  campaign: {},
  ad_sets: [],
  ads: [],
};

const mapCreativeRow = (row: CreativeRow): SavedAd | null => {
  if (!row) return null;
  const inputs = row.inputs || null;
  const output = row.outputs || null;
  const brief = (output as { brief?: { product?: { name?: string }; audience?: { summary?: string } } } | null)?.brief;
  const creative =
    Array.isArray((output as { creatives?: Array<{ copy?: { hook?: string; primary_text?: string; cta?: string } }> } | null)?.creatives)
      ? (output as { creatives?: Array<{ copy?: { hook?: string; primary_text?: string; cta?: string } }> }).creatives?.[0]
      : Array.isArray((output as { variants?: Array<{ copy?: { hook?: string; primary_text?: string; cta?: string } }> } | null)?.variants)
        ? (output as { variants?: Array<{ copy?: { hook?: string; primary_text?: string; cta?: string } }> }).variants?.[0]
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
  const cta = creative?.copy?.cta || (inputs as { cta?: string } | null)?.cta || 'Learn More';
  const productName =
    brief?.product?.name ||
    (inputs as { productName?: string; brandName?: string } | null)?.productName ||
    (inputs as { brandName?: string } | null)?.brandName ||
    'Produkt';
  const targetAudience =
    brief?.audience?.summary || (inputs as { targetAudience?: string } | null)?.targetAudience || 'Zielgruppe';
  const lifecycle = (inputs as { lifecycle?: { status?: SavedAd['status'] } } | null)?.lifecycle;
  const status = lifecycle?.status || (row.saved ? 'active' : 'draft');

  return {
    id: row.id,
    name: headline,
    headline,
    description,
    cta,
    productName,
    targetAudience,
    status,
    createdAt: row.created_at || new Date().toISOString(),
    thumbnail: row.thumbnail ?? null,
  };
};

const assignAdsToSets = (adIds: string[], setCount: number) => {
  const buckets = Array.from({ length: setCount }, () => [] as string[]);
  if (!setCount) return buckets;
  adIds.forEach((id, index) => {
    buckets[index % setCount].push(id);
  });
  return buckets;
};

const applyStrategyToSpec = (
  strategy: GeneratedStrategy,
  spec: CampaignSpec,
  selectedIds: string[],
  mode: 'structure' | 'targeting' | 'budget'
) => {
  const next: CampaignSpec = {
    campaign: { ...spec.campaign },
    ad_sets: spec.ad_sets.map((set) => ({ ...set, targeting: { ...set.targeting } })),
    ads: [...spec.ads],
    strategy_snapshot: spec.strategy_snapshot ?? strategy,
  };
  const meta = strategy.meta_setup;

  if (mode === 'structure') {
    if (!next.campaign.name && meta?.campaign?.name) next.campaign.name = meta.campaign.name;
    if (!next.campaign.objective && meta?.campaign?.objective) next.campaign.objective = meta.campaign.objective;
    if (!next.campaign.budget_type && meta?.campaign?.budget_type) next.campaign.budget_type = meta.campaign.budget_type;
    if (!next.campaign.bid_strategy && meta?.campaign?.bid_strategy) next.campaign.bid_strategy = meta.campaign.bid_strategy;
    if (!next.campaign.attribution && meta?.campaign?.attribution) next.campaign.attribution = meta.campaign.attribution;

    if (!next.ad_sets.length) {
      const baseSets = meta?.ad_sets?.length ? meta.ad_sets : [{ name: 'Ad Set 1' }];
      const assignments = assignAdsToSets(selectedIds, baseSets.length || 1);
      next.ad_sets = baseSets.map((set, idx) => ({
        id: `adset-${idx + 1}`,
        name: set.name || `Ad Set ${idx + 1}`,
        budget: set.budget || '',
        schedule: set.schedule || '',
        placements: set.placements || [],
        targeting: {
          age: set.audience?.age,
          gender: set.audience?.gender,
          locations: set.audience?.locations,
          interests: set.audience?.interests,
        },
        ad_ids: assignments[idx] || [],
      }));
    }
  }

  if (mode === 'targeting') {
    next.ad_sets = next.ad_sets.map((set) => ({
      ...set,
      placements: set.placements?.length ? set.placements : strategy.targeting?.placements || set.placements,
      targeting: {
        age: set.targeting?.age || strategy.targeting?.age,
        gender: set.targeting?.gender || strategy.targeting?.gender,
        locations: set.targeting?.locations || strategy.targeting?.locations,
        interests: set.targeting?.interests || strategy.targeting?.interests,
      },
    }));
  }

  if (mode === 'budget') {
    const daily = strategy.budget?.daily || meta?.campaign?.daily_budget;
    if (!next.campaign.daily_budget && daily) next.campaign.daily_budget = daily;
    if (strategy.budget?.allocation && next.ad_sets.length) {
      const total = Number(String(daily || '').replace(/[^0-9.,]/g, '').replace(',', '.'));
      const testingPct = strategy.budget.allocation.testing ?? 50;
      const scalingPct = strategy.budget.allocation.scaling ?? 50;
      if (Number.isFinite(total)) {
        next.ad_sets = next.ad_sets.map((set, idx) => {
          if (set.budget) return set;
          const pct = idx === 0 ? testingPct : scalingPct;
          const value = Math.round((total * pct) / 100);
          return { ...set, budget: value ? `€${value}` : set.budget };
        });
      }
    }
  }

  return next;
};

export function CampaignBuilderPage() {
  const [draft, setDraft] = useState<CampaignDraftRow | null>(null);
  const [campaignSpec, setCampaignSpec] = useState<CampaignSpec>(emptySpec);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [ads, setAds] = useState<SavedAd[]>([]);
  const [strategies, setStrategies] = useState<CampaignStrategyBlueprint[]>([]);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wizard State
  const [currentStep, setCurrentStep] = useState(1);

  const STEPS = [
    { id: 1, label: 'Campaign Setup', description: 'Objective & Budget' },
    { id: 2, label: 'Creative Selection', description: 'Choose your Ads' },
    { id: 3, label: 'Strategy', description: 'Targeting & AI Blueprints' },
    { id: 4, label: 'Review & Launch', description: 'Final Check' },
  ];

  const [draftId, setDraftId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  });

  const selectedStrategy = useMemo(
    () => strategies.find((s) => s.id === selectedStrategyId) || null,
    [strategies, selectedStrategyId]
  );
  const strategyPreview = selectedStrategy?.strategy ?? campaignSpec.strategy_snapshot ?? null;

  const adMap = useMemo(() => {
    const map = new Map<string, SavedAd>();
    ads.forEach((ad) => map.set(ad.id, ad));
    return map;
  }, [ads]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setDraftId(params.get('id'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadDraft = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: session } = await supabase.auth.getSession();
        const userId = session.session?.user?.id;
        if (!userId) throw new Error('Bitte zuerst anmelden.');

        if (!draftId) {
          const { data, error } = await supabase
            .from('campaign_drafts')
            .insert({
              user_id: userId,
              name: 'Neue Kampagne',
              creative_ids: [],
              campaign_spec: emptySpec,
              status: 'draft',
            })
            .select('id,name,creative_ids,strategy_blueprint_id,campaign_spec,status,created_at')
            .single();
          if (error) throw error;
          if (!cancelled && data) {
            const url = `/campaign-builder?id=${encodeURIComponent(data.id)}`;
            window.history.replaceState({}, document.title, url);
            setDraft(data as CampaignDraftRow);
            setCampaignSpec(data.campaign_spec || emptySpec);
            setSelectedIds(data.creative_ids || []);
            setSelectedStrategyId(data.strategy_blueprint_id || null);
          }
        } else {
          const { data, error } = await supabase
            .from('campaign_drafts')
            .select('id,name,creative_ids,strategy_blueprint_id,campaign_spec,status,created_at')
            .eq('id', draftId)
            .single();
          if (error) throw error;
          if (!cancelled && data) {
            setDraft(data as CampaignDraftRow);
            setCampaignSpec(data.campaign_spec || emptySpec);
            setSelectedIds(data.creative_ids || []);
            setSelectedStrategyId(data.strategy_blueprint_id || null);
          }
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Draft konnte nicht geladen werden.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadDraft();
    return () => {
      cancelled = true;
    };
  }, [draftId]);

  useEffect(() => {
    let cancelled = false;
    const loadAds = async () => {
      try {
        const { data, error } = await supabase
          .from('generated_creatives')
          .select('id,inputs,outputs,created_at,saved,thumbnail')
          .order('created_at', { ascending: false })
          .limit(50);
        if (error) throw error;
        const mapped = (data || [])
          .map(mapCreativeRow)
          .filter((item): item is SavedAd => Boolean(item));
        if (!cancelled) setAds(mapped);
      } catch (err) {
        if (!cancelled) setAds([]);
      }
    };
    loadAds();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadStrategies = async () => {
      try {
        const { data, error } = await supabase
          .from('campaign_strategy_blueprints')
          .select('id,name,creative_ids,strategy')
          .order('created_at', { ascending: false })
          .limit(20);
        if (error) throw error;
        if (!cancelled) setStrategies(data as CampaignStrategyBlueprint[]);
      } catch (err) {
        if (!cancelled) setStrategies([]);
      }
    };
    loadStrategies();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setCampaignSpec((prev) => {
      const nextAds = selectedIds.map((id) => {
        const ad = adMap.get(id);
        return {
          creative_id: id,
          name: ad?.name || 'Ad',
          headline: ad?.headline || '',
          primary_text: ad?.description || '',
          cta: ad?.cta || '',
        };
      });
      return {
        ...prev,
        ads: nextAds,
        ad_sets: prev.ad_sets.map((set) => ({
          ...set,
          ad_ids: set.ad_ids.filter((id) => selectedIds.includes(id)),
        })),
      };
    });
  }, [selectedIds, adMap]);

  const handleToggleAd = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleApplyStrategy = (mode: 'structure' | 'targeting' | 'budget') => {
    if (!strategyPreview) {
      toast.error('Bitte zuerst eine Strategie auswählen.');
      return;
    }
    if (!selectedIds.length) {
      toast.error('Bitte zuerst Ads auswählen.');
      return;
    }
    setCampaignSpec((prev) => applyStrategyToSpec(strategyPreview, prev, selectedIds, mode));
    toast.success('Strategie angewendet');
  };

  const handleAddAdSet = () => {
    setCampaignSpec((prev) => ({
      ...prev,
      ad_sets: [
        ...prev.ad_sets,
        {
          id: `adset-${prev.ad_sets.length + 1}`,
          name: `Ad Set ${prev.ad_sets.length + 1}`,
          budget: '',
          schedule: '',
          placements: [],
          targeting: {},
          ad_ids: [],
        },
      ],
    }));
  };

  const handleRemoveAdSet = (id: string) => {
    setCampaignSpec((prev) => ({
      ...prev,
      ad_sets: prev.ad_sets.filter((set) => set.id !== id),
    }));
  };

  const handleSaveDraft = async (status?: CampaignStatus) => {
    if (!draft?.id) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('campaign_drafts')
        .update({
          name: campaignSpec.campaign.name || draft.name || 'Kampagne',
          creative_ids: selectedIds,
          strategy_blueprint_id: selectedStrategyId,
          campaign_spec: campaignSpec,
          status: status || draft.status,
        })
        .eq('id', draft.id);
      if (error) throw error;
      setDraft((prev) => (prev ? { ...prev, status: status || prev.status } : prev));
      toast.success(status === 'ready' ? 'Kampagne als Ready markiert' : 'Draft gespeichert');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Draft konnte nicht gespeichert werden.';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const checks = [
    { label: 'Mindestens eine Ad ausgewählt', ok: selectedIds.length > 0 },
    { label: 'Objective gesetzt', ok: Boolean(campaignSpec.campaign.objective) },
    { label: 'Budget gesetzt', ok: Boolean(campaignSpec.campaign.daily_budget) },
    { label: 'Ad Sets vorhanden', ok: campaignSpec.ad_sets.length > 0 },
    {
      label: 'Ad Sets haben Ads zugewiesen',
      ok: campaignSpec.ad_sets.length > 0 && campaignSpec.ad_sets.every((set) => set.ad_ids.length > 0),
    },
  ];


  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(c => c + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(c => c - 1);
  };



  return (
    <PageShell>
      <HeroHeader
        title="Kampagnen-Builder"
        subtitle="Bau deine Kampagne Schritt für Schritt, starte aus Strategien oder Drafts."
      />

      {/* Stepper UI */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10 rounded-full" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary transition-all duration-300 -z-10 rounded-full"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          />

          {STEPS.map((step) => {
            const isActive = currentStep >= step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${isActive
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-muted border-muted-foreground/30 text-muted-foreground'
                    }`}
                >
                  {isActive ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                </div>
                <div className={`text-xs font-medium text-center ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {error && <Card className="p-4 border border-red-500/30 bg-red-500/5 text-red-600">{error}</Card>}
      {isLoading && <Card className="p-4 text-sm text-muted-foreground">Lade Kampagnen-Draft…</Card>}

      {!isLoading && draft && (
        <div className="space-y-6">

          {/* STEP 1: CAMPAIGN DETAILS */}
          {currentStep === 1 && (
            <Card className="p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-foreground">Kampagne starten</div>
                  <div className="text-sm text-muted-foreground">Lege die Basis-Daten für deine Kampagne fest.</div>
                </div>
                <select
                  value={draft.status}
                  onChange={(e) => setDraft((prev) => (prev ? { ...prev, status: e.target.value as CampaignStatus } : prev))}
                  className="w-40 px-3 py-1.5 bg-muted/40 border border-border/50 rounded-lg text-sm"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Campaign Name</label>
                  <input
                    value={campaignSpec.campaign.name || ''}
                    onChange={(e) =>
                      setCampaignSpec((prev) => ({
                        ...prev,
                        campaign: { ...prev.campaign, name: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-2.5 bg-muted/40 border border-border/50 rounded-xl text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none"
                    placeholder="z.B. Sommer Sale 2025"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Daily Budget</label>
                  <input
                    value={campaignSpec.campaign.daily_budget || ''}
                    onChange={(e) =>
                      setCampaignSpec((prev) => ({
                        ...prev,
                        campaign: { ...prev.campaign, daily_budget: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-2.5 bg-muted/40 border border-border/50 rounded-xl text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none"
                    placeholder="z.B. €50.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Objective</label>
                  <select
                    value={campaignSpec.campaign.objective || 'OUTCOME_SALES'}
                    onChange={(e) =>
                      setCampaignSpec((prev) => ({
                        ...prev,
                        campaign: { ...prev.campaign, objective: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-2.5 bg-muted/40 border border-border/50 rounded-xl text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none"
                  >
                    <option value="OUTCOME_SALES">Sales</option>
                    <option value="OUTCOME_LEADS">Leads</option>
                    <option value="OUTCOME_TRAFFIC">Traffic</option>
                    <option value="OUTCOME_AWARENESS">Awareness</option>
                    <option value="OUTCOME_ENGAGEMENT">Engagement</option>
                    <option value="OUTCOME_APP_PROMOTION">App Promotion</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Bid Strategy</label>
                  <select
                    value={campaignSpec.campaign.bid_strategy || 'LOWEST_COST_WITHOUT_CAP'}
                    onChange={(e) =>
                      setCampaignSpec((prev) => ({
                        ...prev,
                        campaign: { ...prev.campaign, bid_strategy: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-2.5 bg-muted/40 border border-border/50 rounded-xl text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none"
                  >
                    <option value="LOWEST_COST_WITHOUT_CAP">Lowest Cost (Auto)</option>
                    <option value="COST_CAP">Cost Cap</option>
                    <option value="BID_CAP">Bid Cap</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {/* STEP 2: SELECT ADS */}
          {currentStep === 2 && (
            <Card className="p-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-lg font-semibold text-foreground">Ads auswählen</div>
                  <div className="text-sm text-muted-foreground">Wähle die Creatives für deine Kampagne.</div>
                </div>
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                  {selectedIds.length} ausgewählt
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                {ads.length === 0 ? (
                  <div className="col-span-2 text-center py-12 text-muted-foreground border-2 border-dashed border-border/50 rounded-xl">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p>Keine gespeicherten Ads gefunden.</p>
                    <p className="text-xs">Erstelle zuerst Creatives im Studio oder Generator.</p>
                  </div>
                ) : (
                  ads.map((ad) => (
                    <div
                      key={ad.id}
                      onClick={() => handleToggleAd(ad.id)}
                      className={`
                        relative group p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md
                        ${selectedIds.includes(ad.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-transparent bg-muted/30 hover:bg-muted/50 hover:border-border'}
                      `}
                    >
                      <div className="absolute top-4 right-4">
                        <div className={`
                          w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                          ${selectedIds.includes(ad.id) ? 'bg-primary border-primary' : 'border-muted-foreground/30'}
                        `}>
                          {selectedIds.includes(ad.id) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </div>

                      <div className="flex gap-4">
                        {ad.thumbnail ? (
                          <img src={ad.thumbnail} className="w-20 h-20 rounded-lg object-cover bg-muted" alt="" />
                        ) : (
                          <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
                            No Img
                          </div>
                        )}
                        <div className="flex-1 pr-6">
                          <div className="font-semibold text-foreground line-clamp-1">{ad.name}</div>
                          <div className="text-xs text-muted-foreground mb-2">{ad.productName}</div>
                          <div className="text-xs text-foreground/80 line-clamp-2 mb-2">{ad.description}</div>

                          {selectedStrategy?.creative_ids?.includes(ad.id) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-wide">
                              <Sparkles className="w-3 h-3" /> Strategie Match
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}

          {/* STEP 3: STRATEGY */}
          {currentStep === 3 && (
            <Card className="p-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-lg font-semibold text-foreground">Strategie anwenden</div>
                  <div className="text-sm text-muted-foreground">Nutze eine KI-Strategie für Targeting & Struktur.</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Wähle einen Blueprint</label>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {strategies.length === 0 && (
                      <div className="text-sm text-muted-foreground italic">Keine Strategien verfügbar.</div>
                    )}
                    {strategies.map((strategy) => (
                      <div
                        key={strategy.id}
                        onClick={() => setSelectedStrategyId(strategy.id)}
                        className={`
                          p-3 rounded-xl border cursor-pointer transition-all
                          ${selectedStrategyId === strategy.id
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                            : 'border-border/40 bg-muted/20 hover:bg-muted/40'}
                        `}
                      >
                        <div className="flex items-center gap-2 font-medium text-sm">
                          <Brain className={`w-4 h-4 ${selectedStrategyId === strategy.id ? 'text-primary' : 'text-muted-foreground'}`} />
                          {strategy.name || 'Unbenannte Strategie'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Strategy Preview Panel */}
                  <div className="p-5 rounded-2xl bg-muted/30 border border-border/50 h-full">
                    {strategyPreview ? (
                      <>
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold">Strategie-Details</h3>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="text-xs uppercase text-muted-foreground font-bold mb-1">Zusammenfassung</div>
                            <p className="text-sm text-foreground/80 leading-relaxed">{strategyPreview.summary || 'Keine Zusammenfassung verfügbar.'}</p>
                          </div>

                          <div>
                            <div className="text-xs uppercase text-muted-foreground font-bold mb-2">Empfehlungen</div>
                            <div className="flex flex-wrap gap-2">
                              {(strategyPreview.recommendations || []).map((rec, idx) => (
                                <span key={idx} className="px-2.5 py-1 bg-background border border-border rounded-md text-xs text-muted-foreground">
                                  {rec}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="pt-4 mt-4 border-t border-border/50 grid grid-cols-1 gap-3">
                            <button
                              onClick={() => handleApplyStrategy('structure')}
                              className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                            >
                              Struktur übernehmen (AdSets)
                            </button>
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() => handleApplyStrategy('targeting')}
                                className="py-2 bg-muted hover:bg-muted/80 text-foreground border border-border/50 rounded-lg text-sm font-medium transition-colors"
                              >
                                Targeting
                              </button>
                              <button
                                onClick={() => handleApplyStrategy('budget')}
                                className="py-2 bg-muted hover:bg-muted/80 text-foreground border border-border/50 rounded-lg text-sm font-medium transition-colors"
                              >
                                Budget
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center p-4">
                        <Brain className="w-10 h-10 mb-3 opacity-20" />
                        <p className="text-sm">Wähle links eine Strategie aus, um Details zu sehen.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* STEP 4: REVIEW & LAUNCH */}
          {currentStep === 4 && (
            <Card className="p-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-lg font-semibold text-foreground">Review & Launch</div>
                  <div className="text-sm text-muted-foreground">Überprüfe deine Kampagnen-Struktur und veröffentliche sie.</div>
                </div>
                <button
                  onClick={handleAddAdSet}
                  className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-xs font-semibold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Ad Set
                </button>
              </div>

              <div className="space-y-4 mb-8">
                {campaignSpec.ad_sets.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-border/50 rounded-xl text-muted-foreground">
                    Noch keine Ad Sets angelegt. Gehe zurück zu Schritt 3.
                  </div>
                ) : (
                  campaignSpec.ad_sets.map((set, idx) => (
                    <div key={set.id} className="p-4 rounded-xl border border-border/30 bg-muted/10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold text-sm flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">{idx + 1}</span>
                          <span className="text-foreground">{set.name}</span>
                        </div>
                        <button onClick={() => handleRemoveAdSet(set.id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm pl-8">
                        <div>
                          <span className="text-muted-foreground text-xs block mb-1">Budget</span>
                          <div className="font-medium">{set.budget || '-'}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs block mb-1">Targeting</span>
                          <div className="font-medium text-xs text-foreground/80 truncate">
                            {Object.values(set.targeting || {}).filter(Boolean).join(', ') || 'Auto'}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground text-xs block mb-1">Ads ({set.ad_ids.length})</span>
                          <div className="flex gap-2 flex-wrap">
                            {set.ad_ids.map(id => {
                              const ad = adMap.get(id);
                              return ad ? (
                                <span key={id} className="px-2 py-0.5 rounded bg-background border border-border/50 text-[10px] text-muted-foreground">
                                  {ad.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Editing (AdSet Details) */}
                      <div className="mt-4 pt-4 border-t border-border/20 grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                          <input
                            value={set.name || ''}
                            onChange={(e) =>
                              setCampaignSpec((prev) => ({
                                ...prev,
                                ad_sets: prev.ad_sets.map((item) =>
                                  item.id === set.id ? { ...item, name: e.target.value } : item
                                ),
                              }))
                            }
                            className="w-full px-2 py-1 bg-muted/20 border border-border/50 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Budget</label>
                          <input
                            value={set.budget || ''}
                            onChange={(e) =>
                              setCampaignSpec((prev) => ({
                                ...prev,
                                ad_sets: prev.ad_sets.map((item) =>
                                  item.id === set.id ? { ...item, budget: e.target.value } : item
                                ),
                              }))
                            }
                            className="w-full px-2 py-1 bg-muted/20 border border-border/50 rounded text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 rounded-xl bg-muted/10 mb-4">
                <h3 className="text-sm font-semibold mb-3">Preflight Checks</h3>
                <div className="space-y-2">
                  {checks.map((check, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      {check.ok ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                      <span className={check.ok ? 'text-foreground' : 'text-muted-foreground'}>{check.label}</span>
                    </div>
                  ))}
                </div>
              </div>

            </Card>
          )}

          {/* Navigation Bar */}
          <div className="flex items-center justify-between pt-6 border-t border-border mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-6 py-2.5 rounded-xl font-medium text-sm transition-colors hover:bg-muted disabled:opacity-0"
            >
              Zurück
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => handleSaveDraft()}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl border border-border hover:bg-muted font-medium text-sm transition-all"
              >
                {isSaving ? 'Speichere...' : 'Als Draft speichern'}
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  className="px-8 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
                >
                  Weiter
                </button>
              ) : (
                <button
                  onClick={() => handleSaveDraft('ready')}
                  className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-sm hover:opacity-90 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Kampagne veröffentlichen
                </button>
              )}
            </div>
          </div>

        </div>
      )}
    </PageShell>
  );
}

