import { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabaseClient';
import { useStrategies, type StrategyBlueprint } from '../../hooks/useStrategies';

// --- TYPES ---
export type CampaignStatus = 'draft' | 'ready';

export type GeneratedStrategy = {
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

export type CampaignSpec = {
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

export type CampaignDraftRow = {
    id: string;
    name: string | null;
    creative_ids: string[];
    strategy_blueprint_id: string | null;
    campaign_spec: CampaignSpec | null;
    status: CampaignStatus;
    created_at?: string | null;
};

export type SavedAd = {
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

// --- CONTEXT STATE ---
interface CampaignBuilderState {
    // Data
    draft: CampaignDraftRow | null;
    campaignSpec: CampaignSpec;
    selectedIds: string[];
    ads: SavedAd[];
    strategies: StrategyBlueprint[];
    selectedStrategyId: string | null;

    // UI State
    currentStep: number;
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;

    // Actions
    setDraft: (draft: CampaignDraftRow | null) => void;
    setCampaignSpec: (spec: CampaignSpec | ((prev: CampaignSpec) => CampaignSpec)) => void;
    setSelectedIds: (ids: string[] | ((prev: string[]) => string[])) => void;
    setSelectedStrategyId: (id: string | null) => void;
    setCurrentStep: (step: number | ((prev: number) => number)) => void;
    setError: (err: string | null) => void;

    // Computed
    selectedStrategy: StrategyBlueprint | null;
    strategyPreview: GeneratedStrategy | null;
    adMap: Map<string, SavedAd>;

    // Methods
    loadDraft: (id: string | null) => Promise<void>;
    saveDraft: (status?: CampaignStatus) => Promise<void>;
    handleNext: () => void;
    handleBack: () => void;
}

const CampaignBuilderContext = createContext<CampaignBuilderState | null>(null);

export const emptySpec: CampaignSpec = {
    campaign: {},
    ad_sets: [],
    ads: [],
};

export const useCampaignBuilder = () => {
    const context = useContext(CampaignBuilderContext);
    if (!context) throw new Error('useCampaignBuilder must be used within a CampaignBuilderProvider');
    return context;
};

// --- HELPER MAPPERS (Moved from Page) ---
const mapCreativeRow = (row: any): SavedAd | null => {
    if (!row) return null;
    const inputs = row.inputs || null;
    const output = row.outputs || null;
    // ... Simplified mapping logic to avoid huge bloat, assume typical structure
    const creative =
        Array.isArray((output as any)?.creatives)
            ? (output as any).creatives?.[0]
            : Array.isArray((output as any)?.variants)
                ? (output as any).variants?.[0]
                : null;

    const headline = creative?.copy?.hook || inputs?.headline || inputs?.title || 'Untitled Ad';
    const description = creative?.copy?.primary_text || inputs?.description || '';
    const cta = creative?.copy?.cta || inputs?.cta || 'Learn More';
    const thumbnail = row.thumbnail ?? null;

    return {
        id: row.id,
        name: headline,
        headline,
        description,
        cta,
        productName: inputs?.productName || 'Product',
        targetAudience: inputs?.targetAudience || 'Audience',
        status: row.saved ? 'active' : 'draft',
        createdAt: row.created_at || new Date().toISOString(),
        thumbnail,
    };
};

export function CampaignBuilderProvider({ children }: { children: ReactNode }) {
    const [draft, setDraft] = useState<CampaignDraftRow | null>(null);
    const [campaignSpec, setCampaignSpec] = useState<CampaignSpec>(emptySpec);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [ads, setAds] = useState<SavedAd[]>([]);
    const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);

    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { strategies } = useStrategies();

    // Load Ads
    useEffect(() => {
        const loadAds = async () => {
            try {
                const { data, error } = await supabase.from('generated_creatives').select('id,inputs,outputs,created_at,saved,thumbnail').order('created_at', { ascending: false }).limit(50);
                if (error) throw error;
                const mapped = (data || []).map(mapCreativeRow).filter((item): item is SavedAd => Boolean(item));
                setAds(mapped);
            } catch (err) { console.error(err); }
        };
        loadAds();
    }, []);

    const loadDraft = async (id: string | null) => {
        setIsLoading(true);
        setError(null);
        try {
            const { data: session } = await supabase.auth.getSession();
            const userId = session.session?.user?.id;
            if (!userId) throw new Error('Bitte zuerst anmelden.');

            if (!id) {
                // CREATE NEW
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
                if (data) {
                    const url = `/campaign-builder?id=${encodeURIComponent(data.id)}`;
                    window.history.replaceState({}, document.title, url);
                    setDraft(data as CampaignDraftRow);
                    setCampaignSpec(data.campaign_spec || emptySpec);
                    setSelectedIds(data.creative_ids || []);
                    setSelectedStrategyId(data.strategy_blueprint_id || null);
                }
            } else {
                // LOAD EXISTING
                const { data, error } = await supabase
                    .from('campaign_drafts')
                    .select('id,name,creative_ids,strategy_blueprint_id,campaign_spec,status,created_at')
                    .eq('id', id)
                    .single();
                if (error) throw error;
                if (data) {
                    setDraft(data as CampaignDraftRow);
                    setCampaignSpec(data.campaign_spec || emptySpec);
                    setSelectedIds(data.creative_ids || []);
                    setSelectedStrategyId(data.strategy_blueprint_id || null);
                }
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Draft konnte nicht geladen werden.');
        } finally {
            setIsLoading(false);
        }
    };

    const saveDraft = async (status?: CampaignStatus) => {
        if (!draft?.id) return;
        setIsSaving(true);
        try {
            // Demo Mode check handled in Step 4 mostly, but we can do local save here
            // For real save:
            const { error } = await supabase.from('campaign_drafts').update({
                name: campaignSpec.campaign.name || draft.name || 'Kampagne',
                creative_ids: selectedIds,
                strategy_blueprint_id: selectedStrategyId,
                campaign_spec: campaignSpec,
                status: status || draft.status
            }).eq('id', draft.id);

            if (error) throw error;
            setDraft((prev) => (prev ? { ...prev, status: status || prev.status } : prev));
            toast.success('Entwurf gespeichert');
        } catch (err: unknown) {
            toast.error('Fehler beim Speichern');
        } finally {
            setIsSaving(false);
        }
    };

    // Computed
    const selectedStrategy = useMemo(
        () => strategies.find((s) => s.id === selectedStrategyId) || null,
        [strategies, selectedStrategyId]
    );

    const strategyPreview = useMemo(() => {
        if (!selectedStrategy) return campaignSpec.strategy_snapshot ?? null;
        return {
            name: selectedStrategy.title,
            summary: selectedStrategy.raw_content_markdown,
            recommendations: ["Autopilot Enabled", `Target ROAS: ${selectedStrategy.autopilot_config?.target_roas}x`, `Risk: ${selectedStrategy.autopilot_config?.risk_tolerance}`],
            budget: { daily: `${selectedStrategy.autopilot_config?.max_daily_budget || 50}` },
            targeting: { locations: ['Germany'], interests: ['Marketing'] } // Mock for now
        } as GeneratedStrategy;
    }, [selectedStrategy, campaignSpec.strategy_snapshot]);

    const adMap = useMemo(() => {
        const map = new Map<string, SavedAd>();
        ads.forEach((ad) => map.set(ad.id, ad));
        return map;
    }, [ads]);

    const handleNext = () => {
        // Validation logic can go here or in components
        if (currentStep < 4) setCurrentStep((c) => c + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep((c) => c - 1);
    };

    return (
        <CampaignBuilderContext.Provider value={{
            draft, campaignSpec, selectedIds, ads, strategies, selectedStrategyId,
            currentStep, isLoading, isSaving, error,
            setDraft, setCampaignSpec, setSelectedIds, setSelectedStrategyId,
            setCurrentStep, setError,
            selectedStrategy, strategyPreview, adMap,
            loadDraft, saveDraft, handleNext, handleBack
        }}>
            {children}
        </CampaignBuilderContext.Provider>
    );
}
