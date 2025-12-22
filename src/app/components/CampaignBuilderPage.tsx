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

  return (
    <PageShell>
      <HeroHeader
        title="Kampagnen-Builder"
        subtitle="Bau deine Kampagne Schritt für Schritt, starte aus Strategien oder Drafts."
      />

      {error && <Card className="p-4 border border-red-500/30 bg-red-500/5 text-red-600">{error}</Card>}
      {isLoading && <Card className="p-4 text-sm text-muted-foreground">Lade Kampagnen-Draft…</Card>}

      {!isLoading && draft && (
        <div className="space-y-6">
          <Card className="p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase text-muted-foreground">Step 1</div>
                <div className="text-lg font-semibold text-foreground">Kampagne starten</div>
                <div className="text-sm text-muted-foreground">Draft-ID: {draft.id}</div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${draft.status === 'ready' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                  {draft.status}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="w-full px-4 py-2.5 bg-muted/40 border border-border/50 rounded-xl text-foreground"
                  placeholder="Sommer Kampagne 2025"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Status</label>
                <select
                  value={draft.status}
                  onChange={(e) => setDraft((prev) => (prev ? { ...prev, status: e.target.value as CampaignStatus } : prev))}
                  className="w-full px-4 py-2.5 bg-muted/40 border border-border/50 rounded-xl text-foreground"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-xs uppercase text-muted-foreground">Step 2</div>
                <div className="text-lg font-semibold text-foreground">Ads auswählen</div>
                <div className="text-sm text-muted-foreground">Wähle Ads für diese Kampagne.</div>
              </div>
              <div className="text-sm text-muted-foreground">{selectedIds.length} ausgewählt</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ads.map((ad) => (
                <label
                  key={ad.id}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedIds.includes(ad.id)
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-border/30 bg-muted/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-foreground">{ad.name}</div>
                      <div className="text-xs text-muted-foreground">{ad.productName}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(ad.id)}
                      onChange={() => handleToggleAd(ad.id)}
                      className="h-4 w-4 text-primary"
                    />
                  </div>
                  {selectedStrategy?.creative_ids?.includes(ad.id) && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 mb-2 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold">
                      Passt zur Strategie
                    </span>
                  )}
                  <div className="text-sm text-foreground line-clamp-2 mb-2">{ad.description}</div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-primary rounded-full text-xs">
                    {ad.cta}
                  </div>
                </label>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-xs uppercase text-muted-foreground">Step 3</div>
                <div className="text-lg font-semibold text-foreground">Strategie anhängen</div>
                <div className="text-sm text-muted-foreground">Blueprint wählen und Empfehlungen übernehmen.</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Campaign Strategy Blueprint</label>
                <select
                  value={selectedStrategyId || ''}
                  onChange={(e) => setSelectedStrategyId(e.target.value || null)}
                  className="w-full px-4 py-2.5 bg-muted/40 border border-border/50 rounded-xl text-foreground"
                >
                  <option value="">Keine Strategie</option>
                  {strategies.map((strategy) => (
                    <option key={strategy.id} value={strategy.id}>
                      {strategy.name || 'Kampagnen-Strategie'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleApplyStrategy('structure')}
                  className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg text-primary text-sm font-semibold"
                >
                  Struktur übernehmen
                </button>
                <button
                  onClick={() => handleApplyStrategy('targeting')}
                  className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg text-primary text-sm font-semibold"
                >
                  Targeting übernehmen
                </button>
                <button
                  onClick={() => handleApplyStrategy('budget')}
                  className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg text-primary text-sm font-semibold"
                >
                  Budget übernehmen
                </button>
              </div>
            </div>
            {strategyPreview && (
              <div className="mt-4 p-4 rounded-xl bg-muted/20 border border-border/30">
                <div className="flex items-center gap-2 text-foreground font-semibold mb-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                  {selectedStrategy?.name || strategyPreview.name || 'Strategie'}
                </div>
                <div className="text-sm text-muted-foreground mb-3">
                  {strategyPreview.summary || 'Strategie-Blueprint geladen.'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(strategyPreview.recommendations || []).slice(0, 3).map((rec, idx) => (
                    <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">
                      {rec}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-xs uppercase text-muted-foreground">Step 4</div>
                <div className="text-lg font-semibold text-foreground">Kampagnen-Struktur bauen</div>
                <div className="text-sm text-muted-foreground">Campaign Settings & Ad Sets.</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Objective</label>
                <input
                  value={campaignSpec.campaign.objective || ''}
                  onChange={(e) =>
                    setCampaignSpec((prev) => ({
                      ...prev,
                      campaign: { ...prev.campaign, objective: e.target.value },
                    }))
                  }
                  className="w-full px-4 py-2.5 bg-muted/40 border border-border/50 rounded-xl text-foreground"
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
                  className="w-full px-4 py-2.5 bg-muted/40 border border-border/50 rounded-xl text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Bid Strategy</label>
                <input
                  value={campaignSpec.campaign.bid_strategy || ''}
                  onChange={(e) =>
                    setCampaignSpec((prev) => ({
                      ...prev,
                      campaign: { ...prev.campaign, bid_strategy: e.target.value },
                    }))
                  }
                  className="w-full px-4 py-2.5 bg-muted/40 border border-border/50 rounded-xl text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Attribution</label>
                <input
                  value={campaignSpec.campaign.attribution || ''}
                  onChange={(e) =>
                    setCampaignSpec((prev) => ({
                      ...prev,
                      campaign: { ...prev.campaign, attribution: e.target.value },
                    }))
                  }
                  className="w-full px-4 py-2.5 bg-muted/40 border border-border/50 rounded-xl text-foreground"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-foreground">Ad Sets</div>
                <button
                  onClick={handleAddAdSet}
                  className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-xs font-semibold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Ad Set
                </button>
              </div>

              {campaignSpec.ad_sets.length === 0 ? (
                <div className="p-4 rounded-xl bg-muted/20 border border-border/30 text-sm text-muted-foreground">
                  Noch keine Ad Sets. Nutze Struktur übernehmen oder Add Ad Set.
                </div>
              ) : (
                campaignSpec.ad_sets.map((set, idx) => (
                  <div key={set.id} className="p-4 rounded-xl border border-border/30 bg-muted/10">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Ad Set {idx + 1}</div>
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
                          className="w-full px-3 py-2 mt-1 bg-muted/40 border border-border/50 rounded-lg text-foreground"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveAdSet(set.id)}
                        className="p-2 hover:bg-muted rounded-lg text-muted-foreground"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                        className="w-full px-3 py-2 bg-muted/40 border border-border/50 rounded-lg text-foreground"
                        placeholder="Budget"
                      />
                      <input
                        value={(set.placements || []).join(', ')}
                        onChange={(e) =>
                          setCampaignSpec((prev) => ({
                            ...prev,
                            ad_sets: prev.ad_sets.map((item) =>
                              item.id === set.id
                                ? { ...item, placements: e.target.value.split(',').map((val) => val.trim()).filter(Boolean) }
                                : item
                            ),
                          }))
                        }
                        className="w-full px-3 py-2 bg-muted/40 border border-border/50 rounded-lg text-foreground"
                        placeholder="Placements"
                      />
                    </div>

                    <div className="mt-4">
                      <div className="text-xs text-muted-foreground mb-2">Ads zuweisen</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedIds.map((id) => {
                          const ad = adMap.get(id);
                          const checked = set.ad_ids.includes(id);
                          return (
                            <label key={id} className="flex items-center gap-2 text-xs text-foreground">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  setCampaignSpec((prev) => ({
                                    ...prev,
                                    ad_sets: prev.ad_sets.map((item) => {
                                      if (item.id !== set.id) return item;
                                      const nextIds = checked
                                        ? item.ad_ids.filter((adId) => adId !== id)
                                        : [...item.ad_ids, id];
                                      return { ...item, ad_ids: nextIds };
                                    }),
                                  }))
                                }
                              />
                              <span>{ad?.name || 'Ad'}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-xs uppercase text-muted-foreground">Step 5</div>
                <div className="text-lg font-semibold text-foreground">Review & Preflight</div>
                <div className="text-sm text-muted-foreground">Checkliste vor dem Publish.</div>
              </div>
            </div>
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
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleSaveDraft('draft')}
                disabled={isSaving}
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-semibold"
              >
                Draft speichern
              </button>
              <button
                onClick={() => handleSaveDraft('ready')}
                disabled={isSaving}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:scale-105 transition-all"
              >
                Ready markieren
              </button>
            </div>
          </Card>
        </div>
      )}
    </PageShell>
  );
}
