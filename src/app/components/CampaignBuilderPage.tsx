import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Plus,
  Sparkles,
  Trash2,
  AlertTriangle,
  Brain,
  Rocket,
  Target,
  PenTool,
  Coins,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { memo } from 'react';
import { PageShell, HeroHeader } from './layout';
import { supabase } from '../lib/supabaseClient';
import { env } from '../lib/env';
import { StrategySelector } from './studio/StrategySelector';
import { StrategyWizard } from './studio/StrategyWizard';
import { useStrategies } from '../hooks/useStrategies';
import { createCampaign } from '../lib/api/meta';

const STATUS_OPTIONS = ['draft', 'ready'] as const;

type CampaignStatus = typeof STATUS_OPTIONS[number];

// ... (Types kept same as original)
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

// ... (Helper functions kept same)
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

  const headline = creative?.copy?.hook || (inputs as { headline?: string; title?: string } | null)?.headline || (inputs as { title?: string } | null)?.title || 'Untitled Ad';
  const description = creative?.copy?.primary_text || (inputs as { description?: string } | null)?.description || '';
  const cta = creative?.copy?.cta || (inputs as { cta?: string } | null)?.cta || 'Learn More';
  const productName = brief?.product?.name || (inputs as { productName?: string; brandName?: string } | null)?.productName || (inputs as { brandName?: string } | null)?.brandName || 'Produkt';
  const targetAudience = brief?.audience?.summary || (inputs as { targetAudience?: string } | null)?.targetAudience || 'Zielgruppe';
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

const AdSelectionCard = memo(({ ad, isSelected, onToggle }: { ad: SavedAd; isSelected: boolean; onToggle: (id: string) => void }) => (
  <div
    onClick={() => onToggle(ad.id)}
    className={`
      relative group p-4 rounded-3xl border-2 transition-all duration-300 cursor-pointer overflow-hidden
      ${isSelected
        ? 'border-primary bg-primary/10 shadow-[0_0_30px_rgba(167,139,250,0.15)]'
        : 'border-transparent bg-muted/40 hover:bg-muted/60 hover:border-border'}
    `}
  >
    <div className="flex gap-5 items-center">
      {ad.thumbnail ? (
        <img src={ad.thumbnail} className="w-20 h-20 rounded-2xl object-cover shadow-lg" alt="" />
      ) : (
        <div className="w-20 h-20 rounded-2xl bg-muted border border-border flex items-center justify-center">
          <Sparkles className="w-6 h-6 opacity-40" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-foreground truncate">{ad.name}</h3>
        <p className="text-xs text-muted-foreground mt-1 truncate">{ad.productName}</p>
      </div>
      <div className={`
          w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300
          ${isSelected ? 'bg-primary border-primary scale-110' : 'border-border group-hover:border-primary/50'}
      `}>
        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
      </div>
    </div>
  </div>
));
AdSelectionCard.displayName = 'AdSelectionCard';

export function CampaignBuilderPage() {
  const [draft, setDraft] = useState<CampaignDraftRow | null>(null);
  const [campaignSpec, setCampaignSpec] = useState<CampaignSpec>(emptySpec);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [ads, setAds] = useState<SavedAd[]>([]);
  const [showStrategyWizard, setShowStrategyWizard] = useState(false);

  // Unified Strategy Data
  const { strategies } = useStrategies();

  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wizard State
  const [currentStep, setCurrentStep] = useState(1);

  const STEPS = [
    { id: 1, label: 'Campaign Setup', description: 'Objective & Budget', icon: Target },
    { id: 2, label: 'Creative Selection', description: 'Choose your Ads', icon: PenTool },
    { id: 3, label: 'Strategy', description: 'Targeting & AI Blueprints', icon: Coins }, // Changed icon to verify
    { id: 4, label: 'Review & Launch', description: 'Final Check', icon: Rocket },
  ];

  const [draftId, setDraftId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  });

  const selectedStrategy = useMemo(
    () => strategies.find((s) => s.id === selectedStrategyId) || null,
    [strategies, selectedStrategyId]
  );

  // Adapter to convert StrategyBlueprint to the old GeneratedStrategy shape for preview if needed
  // In a full refactor, we would update the preview component to handle Blueprint directly.
  const strategyPreview = useMemo(() => {
    if (!selectedStrategy) return campaignSpec.strategy_snapshot ?? null;
    // Basic mapping for preview - in production this would be more robust
    return {
      name: selectedStrategy.title,
      summary: selectedStrategy.raw_content_markdown,
      recommendations: ["Autopilot Enabled", `Target ROAS: ${selectedStrategy.autopilot_config?.target_roas}x`, `Risk: ${selectedStrategy.autopilot_config?.risk_tolerance}`],
      budget: { daily: `${selectedStrategy.autopilot_config?.max_daily_budget || 50}` },
      // Mock targeting for now as it's not fully in blueprint yet
      targeting: { locations: ['Germany', 'Austria', 'Switzerland'], interests: ['Marketing', 'SaaS'] }
    } as GeneratedStrategy;
  }, [selectedStrategy, campaignSpec.strategy_snapshot]);

  const adMap = useMemo(() => {
    const map = new Map<string, SavedAd>();
    ads.forEach((ad) => map.set(ad.id, ad));
    return map;
  }, [ads]);

  // Effects (Loading logic - kept same)
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
        if (!cancelled) setError(err instanceof Error ? err.message : 'Draft konnte nicht geladen werden.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    loadDraft();
    return () => { cancelled = true; };
  }, [draftId]);

  useEffect(() => {
    let cancelled = false;
    const loadAds = async () => {
      try {
        const { data, error } = await supabase.from('generated_creatives').select('id,inputs,outputs,created_at,saved,thumbnail').order('created_at', { ascending: false }).limit(50);
        if (error) throw error;
        const mapped = (data || []).map(mapCreativeRow).filter((item): item is SavedAd => Boolean(item));
        if (!cancelled) setAds(mapped);
      } catch (err) { if (!cancelled) setAds([]); }
    };
    loadAds();
    return () => { cancelled = true; };
  }, []);

  // Removed manual loadStrategies effect as we use useStrategies hook now

  // Removed expensive useEffect that synced selectedIds to campaignSpec on every render.
  // Now we sync only when needed (navigation or save).

  // Handlers (kept same)
  const handleToggleAd = (id: string) => setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  const handleApplyStrategy = (mode: 'structure' | 'targeting' | 'budget') => {
    if (!strategyPreview) { toast.error('Bitte zuerst eine Strategie auswählen.'); return; }
    if (!selectedIds.length) { toast.error('Bitte zuerst Ads auswählen.'); return; }
    setCampaignSpec((prev) => applyStrategyToSpec(strategyPreview, prev, selectedIds, mode));
    toast.success('Strategie angewendet');
  };
  const handleAddAdSet = () => setCampaignSpec((prev) => ({ ...prev, ad_sets: [...prev.ad_sets, { id: `adset-${prev.ad_sets.length + 1}`, name: `Ad Set ${prev.ad_sets.length + 1}`, budget: '', schedule: '', placements: [], targeting: {}, ad_ids: [] }] }));
  const handleRemoveAdSet = (id: string) => setCampaignSpec((prev) => ({ ...prev, ad_sets: prev.ad_sets.filter((set) => set.id !== id) }));
  const handleSaveDraft = async (status?: CampaignStatus) => {
    if (!draft?.id) return;
    setIsSaving(true);
    try {
      // 1. Save locally first
      const { error } = await supabase.from('campaign_drafts').update({ name: campaignSpec.campaign.name || draft.name || 'Kampagne', creative_ids: selectedIds, strategy_blueprint_id: selectedStrategyId, campaign_spec: campaignSpec, status: status || draft.status }).eq('id', draft.id);
      if (error) throw error;
      setDraft((prev) => (prev ? { ...prev, status: status || prev.status } : prev));

      // 2. If Launching ('ready'), call Meta API
      if (status === 'ready') {
        const payload = {
          name: campaignSpec.campaign.name || 'New Campaign',
          objective: campaignSpec.campaign.objective || 'OUTCOME_SALES',
          status: 'ACTIVE',
          daily_budget: parseFloat(campaignSpec.campaign.daily_budget || '0') * 100, // cents
          bid_strategy: campaignSpec.campaign.bid_strategy,
          ad_sets: campaignSpec.ad_sets.map(set => ({
            name: set.name || 'Ad Set',
            daily_budget: set.budget ? parseFloat(set.budget.replace(/[^0-9.]/g, '')) * 100 : undefined,
            status: 'ACTIVE',
            targeting: {
              geo_locations: { countries: ['DE'] }, // Default for MVP
              age_min: 18,
              age_max: 65,
            },
            ads: set.ad_ids.map(adId => {
              const adSpec = campaignSpec.ads.find(a => a.creative_id === adId);
              const savedAd = adMap.get(adId);
              return {
                name: adSpec?.name || 'Ad',
                creative_id: adId,
                status: 'ACTIVE',
                creative: {
                  headline: adSpec?.headline || savedAd?.headline || '',
                  primary_text: adSpec?.primary_text || savedAd?.description || '',
                  call_to_action: adSpec?.cta || savedAd?.cta || 'LEARN_MORE',
                  image_url: savedAd?.thumbnail || undefined
                }
              };
            })
          }))
        };

        toast.loading("Deploying to Meta...");
        // @ts-expect-error - Payload type match relies on backend leniency for MVP
        await createCampaign(payload);
        toast.dismiss();
        toast.success("Kampagne erfolgreich auf Meta gestartet! 🚀");
        // Redirect or show success modal here
      } else {
        toast.success('Draft gespeichert');
      }
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Draft konnte nicht gespeichert werden.'); } finally { setIsSaving(false); }
  };
  const checks = [
    { label: 'Mindestens eine Ad ausgewählt', ok: selectedIds.length > 0 },
    { label: 'Objective gesetzt', ok: Boolean(campaignSpec.campaign.objective) },
    { label: 'Budget gesetzt', ok: Boolean(campaignSpec.campaign.daily_budget) },
    { label: 'Ad Sets vorhanden', ok: campaignSpec.ad_sets.length > 0 },
    { label: 'Ad Sets haben Ads zugewiesen', ok: campaignSpec.ad_sets.length > 0 && campaignSpec.ad_sets.every((set) => set.ad_ids.length > 0) },
  ];
  const syncAdsToSpec = () => {
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
      const validIds = new Set(selectedIds);
      return {
        ...prev,
        ads: nextAds,
        ad_sets: prev.ad_sets.map((set) => ({ ...set, ad_ids: set.ad_ids.filter((id) => validIds.has(id)) })),
      };
    });
  };

  const handleNext = () => {
    if (currentStep === 2) {
      syncAdsToSpec();
    }
    if (currentStep < 4) setCurrentStep(c => c + 1);
  };
  const handleBack = () => { if (currentStep > 1) setCurrentStep(c => c - 1); };

  const handleCreateMasterStrategy = async (rawStrategy: Record<string, unknown>) => {
    // Cast to expected type - validation handled by Wizard
    const data = rawStrategy as unknown as {
      name: string;
      industry_type: string;
      target_roas: number;
      max_daily_budget: number;
      scale_speed: string;
      risk_tolerance: string
    };
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
          created_via: 'campaign_builder_wizard'
        }
      });

      if (error) throw error;
      toast.success("Master Strategy Created!");
      // useStrategies hook updates automatically on re-render or we can force refresh if needed
      // Ideally we would call refreshStrategies() but it's not exposed here directly
      // Quick fix: reload page or rely on SWR-like behavior if implemented
      window.location.reload();
      setShowStrategyWizard(false);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      toast.error("Failed to create strategy: " + errorMessage);
    }
  };

  // --- UI RENDER (Premium Overhaul) ---
  return (
    <PageShell>
      <div className="relative min-h-screen pb-10">
        {/* Background Gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-fuchsia-500/10 rounded-full blur-[100px] mix-blend-screen" />
        </div>

        <HeroHeader
          title="Kampagnen-Builder"
          subtitle="Bau deine Kampagne Schritt für Schritt, starte aus Strategien oder Drafts."
        />

        {/* SIMULATION MODE BANNER */}
        {env.demoMode && (
          <div className="max-w-5xl mx-auto px-4 mb-4">
            <div className="bg-orange-500/10 border border-orange-500/20 text-orange-200 p-2 rounded-xl flex items-center justify-center gap-3 backdrop-blur-sm shadow-[0_0_20px_rgba(249,115,22,0.1)]">
              <AlertTriangle className="w-4 h-4 text-orange-500 animate-pulse" />
              <span className="font-semibold text-xs">
                <strong className="text-orange-500">DEMO MODE:</strong> Campaigns are simulated.
              </span>
            </div>
          </div>
        )}

        {/* Stepper UI - Premium */}
        <div className="mb-8 max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between relative bg-card/40 backdrop-blur-xl p-4 rounded-3xl border border-border shadow-xl">
            {/* Progress Bar Background */}
            <div className="absolute left-16 right-16 top-1/2 -translate-y-1/2 h-1 bg-white/5 rounded-full -z-10" />

            {/* Active Progress Bar */}
            <div
              className="absolute left-16 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500 ease-out -z-10 rounded-full shadow-[0_0_20px_rgba(167,139,250,0.5)]"
              style={{ width: `calc(${((currentStep - 1) / (STEPS.length - 1)) * 100}% - 8rem)` }}
            />

            {STEPS.map((step) => {
              const isActive = currentStep >= step.id;
              const isCurrent = currentStep === step.id;
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex flex-col items-center gap-3 relative z-10">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isActive
                      ? 'bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-[0_0_30px_rgba(167,139,250,0.4)] scale-110'
                      : 'bg-muted border border-border text-muted-foreground'
                      }`}
                  >
                    {isActive && !isCurrent ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className={`text-xs font-bold uppercase tracking-widest text-center transition-colors duration-300 ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="max-w-5xl mx-auto px-4 mb-8">
            <div className="p-4 border border-red-500/30 bg-red-500/10 text-red-400 rounded-2xl flex items-center gap-3">
              <AlertTriangle className="w-5 h-5" />
              {error}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="max-w-5xl mx-auto px-4 text-center py-20">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground font-medium animate-pulse">Lade Kampagnen-Draft…</p>
          </div>
        )}

        {!isLoading && draft && (
          <div className="max-w-5xl mx-auto px-4 space-y-8">

            {/* Content Card */}
            <div className="bg-card/60 backdrop-blur-2xl border border-border rounded-[40px] shadow-2xl overflow-hidden min-h-[500px] flex flex-col relative">

              {/* Step Content */}
              <div className="p-8 md:p-12 flex-1">
                {/* STEP 1: CAMPAIGN DETAILS */}
                {currentStep === 1 && (
                  <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <h2 className="text-3xl font-black tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">Kampagne starten</h2>
                        <p className="text-muted-foreground mt-2 text-lg">Lege die Basis-Daten für deine Kampagne fest.</p>
                      </div>
                      <select
                        value={draft.status}
                        onChange={(e) => setDraft((prev) => (prev ? { ...prev, status: e.target.value as CampaignStatus } : prev))}
                        className="px-4 py-2 bg-muted/50 border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none hover:bg-muted transition-colors text-foreground"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option} className="bg-popover text-popover-foreground">{option.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Campaign Name</label>
                          <input
                            value={campaignSpec.campaign.name || ''}
                            onChange={(e) => setCampaignSpec((prev) => ({ ...prev, campaign: { ...prev.campaign, name: e.target.value } }))}
                            className="w-full px-5 py-4 bg-muted/30 border border-border rounded-2xl text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/50 outline-none transition-all focus:bg-muted/50"
                            placeholder="z.B. Sommer Sale 2025"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Daily Budget</label>
                          <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">€</span>
                            <input
                              value={campaignSpec.campaign.daily_budget || ''}
                              onChange={(e) => setCampaignSpec((prev) => ({ ...prev, campaign: { ...prev.campaign, daily_budget: e.target.value } }))}
                              className="w-full pl-10 pr-5 py-4 bg-muted/30 border border-border rounded-2xl text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/50 outline-none transition-all focus:bg-muted/50"
                              placeholder="50.00"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Objective</label>
                          <select
                            value={campaignSpec.campaign.objective || 'OUTCOME_SALES'}
                            onChange={(e) => setCampaignSpec((prev) => ({ ...prev, campaign: { ...prev.campaign, objective: e.target.value } }))}
                            className="w-full px-5 py-4 bg-muted/30 border border-border rounded-2xl text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all hover:bg-muted/50 appearance-none"
                          >
                            <option value="OUTCOME_SALES" className="bg-popover text-popover-foreground">Sales</option>
                            <option value="OUTCOME_LEADS" className="bg-popover text-popover-foreground">Leads</option>
                            <option value="OUTCOME_TRAFFIC" className="bg-popover text-popover-foreground">Traffic</option>
                            <option value="OUTCOME_AWARENESS" className="bg-popover text-popover-foreground">Awareness</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Bid Strategy</label>
                          <select
                            value={campaignSpec.campaign.bid_strategy || 'LOWEST_COST_WITHOUT_CAP'}
                            onChange={(e) => setCampaignSpec((prev) => ({ ...prev, campaign: { ...prev.campaign, bid_strategy: e.target.value } }))}
                            className="w-full px-5 py-4 bg-muted/30 border border-border rounded-2xl text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all hover:bg-muted/50 appearance-none"
                          >
                            <option value="LOWEST_COST_WITHOUT_CAP" className="bg-popover text-popover-foreground">Lowest Cost (Auto)</option>
                            <option value="COST_CAP" className="bg-popover text-popover-foreground">Cost Cap</option>
                            <option value="BID_CAP" className="bg-popover text-popover-foreground">Bid Cap</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: SELECT ADS */}
                {currentStep === 2 && (
                  <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-3xl font-black tracking-tight text-foreground bg-clip-text">Ads auswählen</h2>
                        <p className="text-muted-foreground mt-2 text-lg">Wähle die High-Performer aus deiner Library.</p>
                      </div>
                      <div className="px-4 py-2 bg-primary/20 border border-primary/30 rounded-xl text-primary font-bold shadow-[0_0_20px_rgba(167,139,250,0.2)]">
                        {selectedIds.length} ausgewählt
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {ads.length === 0 ? (
                        <div className="col-span-2 py-20 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-3xl bg-muted/20">
                          <Sparkles className="w-12 h-12 mb-4 opacity-50" />
                          <p className="font-medium">Keine gespeicherten Ads gefunden.</p>
                        </div>
                      ) : (
                        ads.map((ad) => (
                          <AdSelectionCard
                            key={ad.id}
                            ad={ad}
                            isSelected={selectedIds.includes(ad.id)}
                            onToggle={handleToggleAd}
                          />
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 3: STRATEGY */}
                {currentStep === 3 && (
                  <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="mb-8">
                      <h2 className="text-3xl font-black tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">Strategie anwenden</h2>
                      <p className="text-muted-foreground mt-2 text-lg">Nutze eine KI-generierte Strategie für Targeting & Struktur.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Left: Blueprints List */}
                      <div className="lg:col-span-4 space-y-4">
                        <StrategySelector
                          strategies={strategies}
                          selectedId={selectedStrategyId}
                          onSelect={(id) => setSelectedStrategyId(id)}
                          onCreateNew={() => setShowStrategyWizard(true)}
                          recommendedGoal="scaling"
                        />
                      </div>

                      {/* Right: Preview */}
                      <div className="lg:col-span-8">
                        <div className="h-full bg-card/60 border border-border rounded-3xl p-8 relative overflow-hidden group">
                          {strategyPreview ? (
                            <div className="space-y-6 relative z-10">
                              <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-500">
                                  <Sparkles className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground">Strategie-Details</h3>
                              </div>

                              <div className="prose prose-invert dark:prose-invert prose-stone">
                                <p className="text-muted-foreground leading-relaxed">{strategyPreview.summary || 'Keine Zusammenfassung verfügbar.'}</p>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {(strategyPreview.recommendations || []).map((rec, idx) => (
                                  <span key={idx} className="px-3 py-1.5 bg-muted border border-border rounded-lg text-xs font-medium text-emerald-500">
                                    {rec}
                                  </span>
                                ))}
                              </div>

                              <button
                                onClick={() => handleApplyStrategy('structure')}
                                className="col-span-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                              >
                                Komplette Struktur übernehmen
                              </button>
                              <button onClick={() => handleApplyStrategy('targeting')} className="py-3 bg-muted hover:bg-muted/80 border border-border rounded-xl text-sm font-bold transition-all text-foreground">
                                Nur Targeting
                              </button>
                              <button onClick={() => handleApplyStrategy('budget')} className="py-3 bg-muted hover:bg-muted/80 border border-border rounded-xl text-sm font-bold transition-all text-foreground">
                                Nur Budget
                              </button>
                            </div>

                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50">
                              <Brain className="w-16 h-16 mb-4 opacity-10" />
                              <p>Wähle links eine Strategie aus.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: REVIEW */}
                {currentStep === 4 && (
                  <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-3xl font-black tracking-tight text-foreground bg-clip-text">Ready to Launch?</h2>
                        <p className="text-muted-foreground mt-2 text-lg">Final Review deiner Kampagnen-Struktur.</p>
                      </div>
                      <button onClick={handleAddAdSet} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Ad Set
                      </button>
                    </div>

                    <div className="space-y-4 mb-8">
                      {campaignSpec.ad_sets.map((set, idx) => (
                        <div key={set.id} className="p-6 rounded-3xl border border-white/5 bg-black/20 hover:bg-black/30 transition-all group">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">{idx + 1}</span>
                              <input
                                value={set.name || ''}
                                onChange={(e) => setCampaignSpec(prev => ({ ...prev, ad_sets: prev.ad_sets.map(s => s.id === set.id ? { ...s, name: e.target.value } : s) }))}
                                className="bg-transparent border-none text-lg font-bold text-white focus:ring-0 p-0 w-64"
                              />
                            </div>
                            <button onClick={() => handleRemoveAdSet(set.id)} className="p-2 hover:bg-red-500/20 rounded-full text-muted-foreground hover:text-red-500 transition-colors">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-6 pl-12">
                            <div>
                              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Budget</label>
                              <input
                                value={set.budget || ''}
                                onChange={(e) => setCampaignSpec(prev => ({ ...prev, ad_sets: prev.ad_sets.map(s => s.id === set.id ? { ...s, budget: e.target.value } : s) }))}
                                className="bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 text-sm w-full"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Assigned Ads</label>
                              <div className="flex flex-wrap gap-2">
                                {set.ad_ids.map(id => (
                                  <span key={id} className="px-2 py-1 bg-white/5 rounded text-xs text-muted-foreground border border-white/5">
                                    {adMap.get(id)?.name || 'Ad'}
                                  </span>
                                ))}
                                {set.ad_ids.length === 0 && <span className="text-xs text-red-400">Keine Ads!</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Preflight Checklist</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {checks.map((check, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className={`p-1 rounded-full ${check.ok ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                              {check.ok ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                            </div>
                            <span className={`text-sm ${check.ok ? 'text-white' : 'text-muted-foreground'}`}>{check.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Controls */}
              <div className="p-6 md:p-8 border-t border-white/10 bg-black/20 flex items-center justify-between">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="px-6 py-3 rounded-2xl font-bold text-sm transition-all hover:bg-white/5 disabled:opacity-0 flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Zurück
                </button>

                <div className="flex gap-4">
                  <button
                    onClick={() => handleSaveDraft()}
                    disabled={isSaving}
                    className="px-6 py-3 rounded-2xl border-2 border-white/10 hover:bg-white/5 font-bold text-sm transition-all text-muted-foreground hover:text-white"
                  >
                    {isSaving ? 'Speichere...' : 'Als Draft speichern'}
                  </button>

                  {currentStep < 4 ? (
                    <button
                      onClick={handleNext}
                      className="px-8 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm hover:scale-[1.02] shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all flex items-center gap-2"
                    >
                      Weiter <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSaveDraft('ready')}
                      className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm hover:scale-[1.02] shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2"
                    >
                      <Rocket className="w-4 h-4" />
                      Kampagne Starten
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </PageShell >
  );
}
