import { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabaseClient';
import { useStrategies, type StrategyBlueprint } from '../../hooks/useStrategies';
import { createCampaign, getMetaAudiences, type MetaTargetingInput, type MetaAdSetInput, type MetaCampaignInput, type MetaAudience } from '../../lib/api/meta';

// --- TYPES ---
export type CampaignStatus = 'draft' | 'ready' | 'published';

export type TargetingConfig = {
    locations: string[];
    ageMin: number;
    ageMax: number;
    gender: 'all' | 'male' | 'female';
    interests: string[];
    customAudiences: Array<{ id: string; name?: string }>;
    lookalikeAudiences: Array<{ id: string; name?: string }>;
    exclusions: string[];
    placements: Array<'feed' | 'stories' | 'reels' | 'explore' | 'audience_network'>;
    advantagePlus: boolean;
};

export type CampaignSetup = {
    name: string;
    objective: 'OUTCOME_SALES' | 'OUTCOME_LEADS' | 'OUTCOME_TRAFFIC' | 'OUTCOME_AWARENESS';
    budgetType: 'daily' | 'lifetime';
    dailyBudget: number;
    lifetimeBudget: number;
    bidStrategy: 'LOWEST_COST' | 'COST_CAP' | 'BID_CAP' | 'ROAS_GOAL';
    costCap?: number;
    roasGoal?: number;
    attribution: '7d_click' | '7d_click_1d_view' | '1d_click';
    publishMode: 'publish' | 'draft';
};

export type StrategyConfig = {
    blueprintId: string | null;
    targetRoas: number;
    riskTolerance: 'low' | 'medium' | 'high';
    scaleSpeed: 'slow' | 'medium' | 'aggressive';
    testingBudgetPct: number;
    scalingBudgetPct: number;
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
    // Real metrics from database
    metrics?: {
        impressions?: number;
        clicks?: number;
        ctr?: number;
        conversions?: number;
        roas?: number;
        spend?: number;
    };
};

type CreativeRow = {
    id: string;
    outputs?: Record<string, unknown> | null;
    inputs?: Record<string, unknown> | null;
    created_at?: string | null;
    saved?: boolean | null;
    thumbnail?: string | null;
    metrics?: Record<string, number> | null;
};

// --- CONTEXT STATE ---
interface CampaignBuilderState {
    // Data
    campaignSetup: CampaignSetup;
    targeting: TargetingConfig;
    strategyConfig: StrategyConfig;
    selectedCreativeIds: string[];
    creatives: SavedAd[];
    strategies: StrategyBlueprint[];
    audiences: MetaAudience[];

    // UI State
    currentStep: number;
    totalSteps: number;
    isLoading: boolean;
    isSaving: boolean;
    isPublishing: boolean;
    error: string | null;

    // Actions
    setCampaignSetup: (setup: CampaignSetup | ((prev: CampaignSetup) => CampaignSetup)) => void;
    setTargeting: (targeting: TargetingConfig | ((prev: TargetingConfig) => TargetingConfig)) => void;
    setStrategyConfig: (config: StrategyConfig | ((prev: StrategyConfig) => StrategyConfig)) => void;
    setSelectedCreativeIds: (ids: string[] | ((prev: string[]) => string[])) => void;
    setCurrentStep: (step: number | ((prev: number) => number)) => void;
    setError: (err: string | null) => void;

    // Computed
    selectedCreatives: SavedAd[];
    selectedStrategy: StrategyBlueprint | null;
    creativeMap: Map<string, SavedAd>;
    canContinue: boolean;

    // Methods
    handleNext: () => void;
    handleBack: () => void;
    previewCampaign: () => Promise<unknown>;
    publishToMeta: () => Promise<{ success: boolean; campaignId?: string; message?: string }>;
    refreshAudiences: () => Promise<void>;
}

const CampaignBuilderContext = createContext<CampaignBuilderState | null>(null);

// Default values
const defaultSetup: CampaignSetup = {
    name: '',
    objective: 'OUTCOME_SALES',
    budgetType: 'daily',
    dailyBudget: 50,
    lifetimeBudget: 500,
    bidStrategy: 'LOWEST_COST',
    attribution: '7d_click_1d_view',
    publishMode: 'publish',
};

const defaultTargeting: TargetingConfig = {
    locations: ['DE'],
    ageMin: 18,
    ageMax: 65,
    gender: 'all',
    interests: [],
    customAudiences: [],
    lookalikeAudiences: [],
    exclusions: [],
    placements: ['feed', 'stories', 'reels'],
    advantagePlus: false,
};

const defaultStrategy: StrategyConfig = {
    blueprintId: null,
    targetRoas: 3.0,
    riskTolerance: 'medium',
    scaleSpeed: 'medium',
    testingBudgetPct: 50,
    scalingBudgetPct: 50,
};

export const useCampaignBuilder = () => {
    const context = useContext(CampaignBuilderContext);
    if (!context) throw new Error('useCampaignBuilder must be used within a CampaignBuilderProvider');
    return context;
};

// --- HELPER MAPPERS ---
const mapCreativeRow = (row: CreativeRow): SavedAd | null => {
    if (!row) return null;
    const inputs = row.inputs || null;
    const output = row.outputs || null;
    const brief = (output as { brief?: { product?: { name?: string }; audience?: { summary?: string } } } | null)?.brief;

    type CreativeVariant = { copy?: { hook?: string; primary_text?: string; cta?: string } };
    const creative =
        Array.isArray((output as { creatives?: CreativeVariant[] } | null)?.creatives)
            ? (output as { creatives?: CreativeVariant[] }).creatives?.[0]
            : Array.isArray((output as { variants?: CreativeVariant[] } | null)?.variants)
                ? (output as { variants?: CreativeVariant[] }).variants?.[0]
                : null;

    const headline =
        creative?.copy?.hook ||
        (inputs as { headline?: string; title?: string; creativeName?: string } | null)?.headline ||
        (inputs as { title?: string } | null)?.title ||
        (inputs as { creativeName?: string } | null)?.creativeName ||
        'AI Creative';
    const description =
        creative?.copy?.primary_text ||
        (inputs as { description?: string } | null)?.description ||
        '';
    const cta =
        creative?.copy?.cta ||
        (inputs as { cta?: string } | null)?.cta ||
        'Learn More';
    const productName =
        brief?.product?.name ||
        (inputs as { productName?: string; brandName?: string } | null)?.productName ||
        (inputs as { brandName?: string } | null)?.brandName ||
        'Produkt';
    const targetAudience =
        brief?.audience?.summary ||
        (inputs as { targetAudience?: string } | null)?.targetAudience ||
        'Zielgruppe';
    const lifecycle = (inputs as { lifecycle?: { status?: SavedAd['status'] } } | null)?.lifecycle;
    const status = lifecycle?.status || (row.saved ? 'active' : 'draft');
    const thumbnail = row.thumbnail ?? null;

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
        thumbnail,
        metrics: row.metrics ? {
            impressions: row.metrics.impressions || 0,
            clicks: row.metrics.clicks || 0,
            ctr: row.metrics.ctr || 0,
            conversions: row.metrics.conversions || 0,
            roas: row.metrics.roas || 0,
            spend: row.metrics.spend || 0,
        } : undefined,
    };
};

export function CampaignBuilderProvider({ children }: { children: ReactNode }) {
    // State
    const [campaignSetup, setCampaignSetup] = useState<CampaignSetup>(defaultSetup);
    const [targeting, setTargeting] = useState<TargetingConfig>(defaultTargeting);
    const [strategyConfig, setStrategyConfig] = useState<StrategyConfig>(defaultStrategy);
    const [selectedCreativeIds, setSelectedCreativeIds] = useState<string[]>([]);
    const [creatives, setCreatives] = useState<SavedAd[]>([]);
    const [audiences, setAudiences] = useState<MetaAudience[]>([]);

    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const totalSteps = 5;
    const { strategies } = useStrategies();

    // Load Creatives from Creative Library
    useEffect(() => {
        const loadCreatives = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('generated_creatives')
                    .select('id,inputs,outputs,created_at,saved,thumbnail,metrics')
                    .eq('saved', true)
                    .order('created_at', { ascending: false })
                    .limit(100);

                if (error) throw error;
                const mapped = (data || []).map(mapCreativeRow).filter((item): item is SavedAd => Boolean(item));
                setCreatives(mapped);
            } catch (err) {
                console.error('Load creatives error:', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadCreatives();
    }, []);

    // Load Meta Audiences
    const refreshAudiences = useCallback(async () => {
        try {
            const res = await getMetaAudiences();
            if (res?.audiences) {
                setAudiences(res.audiences);
            }
        } catch (err) {
            console.error('Load audiences error:', err);
        }
    }, []);

    useEffect(() => {
        refreshAudiences();
    }, [refreshAudiences]);

    // Computed
    const selectedCreatives = useMemo(
        () => creatives.filter(c => selectedCreativeIds.includes(c.id)),
        [creatives, selectedCreativeIds]
    );

    const selectedStrategy = useMemo(
        () => strategies.find(s => s.id === strategyConfig.blueprintId) || null,
        [strategies, strategyConfig.blueprintId]
    );

    const creativeMap = useMemo(() => {
        const map = new Map<string, SavedAd>();
        creatives.forEach(c => map.set(c.id, c));
        return map;
    }, [creatives]);

    // Validation per step
    const canContinue = useMemo(() => {
        switch (currentStep) {
            case 1: // Setup
                return campaignSetup.name.trim().length > 0 && campaignSetup.dailyBudget > 0;
            case 2: // Creatives
                return selectedCreativeIds.length > 0;
            case 3: // Targeting
                return targeting.locations.length > 0;
            case 4: // Strategy
                return true; // Strategy is optional
            case 5: // Review
                return true;
            default:
                return true;
        }
    }, [currentStep, campaignSetup, selectedCreativeIds, targeting]);

    // Navigation
    const handleNext = useCallback(() => {
        if (currentStep < totalSteps && canContinue) {
            setCurrentStep(c => c + 1);
        }
    }, [currentStep, totalSteps, canContinue]);

    const handleBack = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep(c => c - 1);
        }
    }, [currentStep]);

    // Build Meta API payload
    const buildMetaPayload = useCallback(() => {
        const campaign: MetaCampaignInput = {
            name: campaignSetup.name,
            objective: campaignSetup.objective,
            budgetType: campaignSetup.budgetType,
            dailyBudget: campaignSetup.budgetType === 'daily' ? campaignSetup.dailyBudget * 100 : undefined, // Convert to cents
            lifetimeBudget: campaignSetup.budgetType === 'lifetime' ? campaignSetup.lifetimeBudget * 100 : undefined,
            bidStrategy: campaignSetup.bidStrategy,
        };

        const targetingInput: MetaTargetingInput = {
            locations: targeting.locations,
            ageMin: targeting.ageMin,
            ageMax: targeting.ageMax,
            gender: targeting.gender,
            interests: targeting.interests,
            customAudiences: targeting.customAudiences,
            lookalikeAudiences: targeting.lookalikeAudiences,
            exclusions: targeting.exclusions,
            placements: targeting.placements,
        };

        // Create one ad set with all selected creatives as ads
        const adSets: MetaAdSetInput[] = [{
            name: `${campaignSetup.name} - Ad Set 1`,
            targeting: targetingInput,
            optimizationGoal: campaignSetup.objective === 'OUTCOME_SALES' ? 'OFFSITE_CONVERSIONS' : 'LINK_CLICKS',
            dailyBudget: campaignSetup.dailyBudget * 100,
            ads: selectedCreatives.map(creative => ({
                name: creative.name,
                headline: creative.headline,
                primaryText: creative.description,
                cta: creative.cta,
                creativeId: creative.id,
                imageUrl: creative.thumbnail || undefined,
            })),
        }];

        return { campaign, adSets };
    }, [campaignSetup, targeting, selectedCreatives]);

    // Preview Campaign (dry run)
    const previewCampaign = useCallback(async () => {
        const { campaign, adSets } = buildMetaPayload();
        try {
            const result = await createCampaign({
                mode: 'preview',
                campaign,
                adSets,
            });
            return result;
        } catch (err) {
            console.error('Preview error:', err);
            throw err;
        }
    }, [buildMetaPayload]);

    // Publish to Meta
    const publishToMeta = useCallback(async () => {
        setIsPublishing(true);
        setError(null);

        try {
            const { campaign, adSets } = buildMetaPayload();

            const result = await createCampaign({
                mode: 'create',
                campaign,
                adSets,
            });

            if (result?.success) {
                toast.success('🚀 Kampagne erfolgreich zu Meta gepusht!');
                return { success: true, campaignId: result.campaignId };
            } else {
                const msg = result?.message || 'Kampagne konnte nicht erstellt werden.';
                toast.error(msg);
                return { success: false, message: msg };
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Publishing failed';
            setError(msg);
            toast.error(msg);
            return { success: false, message: msg };
        } finally {
            setIsPublishing(false);
        }
    }, [buildMetaPayload]);

    return (
        <CampaignBuilderContext.Provider value={{
            // Data
            campaignSetup,
            targeting,
            strategyConfig,
            selectedCreativeIds,
            creatives,
            strategies,
            audiences,

            // UI State
            currentStep,
            totalSteps,
            isLoading,
            isSaving,
            isPublishing,
            error,

            // Actions
            setCampaignSetup,
            setTargeting,
            setStrategyConfig,
            setSelectedCreativeIds,
            setCurrentStep,
            setError,

            // Computed
            selectedCreatives,
            selectedStrategy,
            creativeMap,
            canContinue,

            // Methods
            handleNext,
            handleBack,
            previewCampaign,
            publishToMeta,
            refreshAudiences,
        }}>
            {children}
        </CampaignBuilderContext.Provider>
    );
}

// Re-export for backwards compatibility
export type { StrategyBlueprint };
