// Campaign Canvas Types
export type CampaignObjective =
    | 'CONVERSIONS'
    | 'TRAFFIC'
    | 'AWARENESS'
    | 'ENGAGEMENT'
    | 'LEADS'
    | 'APP_INSTALLS';

export type BidStrategy =
    | 'LOWEST_COST'
    | 'COST_CAP'
    | 'BID_CAP'
    | 'MINIMUM_ROAS';

export interface CampaignConfig {
    name: string;
    objective: CampaignObjective;
    budgetType: 'daily' | 'lifetime';
    dailyBudget?: number;
    lifetimeBudget?: number;
    bidStrategy: BidStrategy;
    startDate?: string;
    endDate?: string;
}

export interface TargetingConfig {
    locations: string[];
    ageMin: number;
    ageMax: number;
    gender: 'all' | 'male' | 'female';
    interests: string[];
    behaviors: string[];
    customAudiences: CustomAudience[];      // Changed from string[] to full objects
    lookalikeAudiences: LookalikeAudience[]; // Changed from string[] to full objects
    exclusions: string[];
    placements: ('feed' | 'stories' | 'reels' | 'explore' | 'audience_network')[];
}

// New: Custom Audience Definition
export interface CustomAudience {
    id: string;
    name: string;
    type: 'website' | 'customer_list' | 'app_activity' | 'offline_activity' | 'engagement';
    size?: number;          // Estimated reach
    status?: 'ready' | 'populating' | 'too_small';
    description?: string;
    createdAt?: string;
}

// New: Lookalike Audience Definition
export interface LookalikeAudience {
    id: string;
    name: string;
    sourceAudienceId: string;  // References a Custom Audience
    sourceAudienceName?: string;
    country: string;
    ratio: number;             // 1-10 (1% - 10% similarity)
    size?: number;
    status?: 'ready' | 'calculating';
}

export interface AdSetConfig {
    name: string;
    budget?: number;
    schedule?: {
        startDate: string;
        endDate?: string;
    };
    targeting: TargetingConfig;
    optimizationGoal: 'CONVERSIONS' | 'LINK_CLICKS' | 'IMPRESSIONS' | 'REACH';
}

export interface AdConfig {
    name: string;
    creativeId?: string;
    hookId?: string;
    headline: string;
    primaryText: string;
    cta: string;
    destinationUrl?: string;
}

// Node Data Types
export interface CampaignNodeData {
    type: 'campaign';
    config: CampaignConfig;
    [key: string]: unknown;
}

export interface AdSetNodeData {
    type: 'adset';
    config: AdSetConfig;
    parentId: string;
    [key: string]: unknown;
}

export interface AdNodeData {
    type: 'ad';
    config: AdConfig;
    parentId: string;
    creative?: {
        id: string;
        thumbnail?: string;
        name?: string;
    };
    [key: string]: unknown;
}

export type CampaignCanvasNodeData = CampaignNodeData | AdSetNodeData | AdNodeData;

// Asset types for sidebar
export interface DraggableAsset {
    id: string;
    type: 'creative' | 'hook' | 'strategy' | 'template';
    name: string;
    thumbnail?: string;
    data: Record<string, unknown>;
}

// AI Analysis types
export interface AIAnalysisResult {
    score: number;
    suggestions: AISuggestion[];
    warnings: AIWarning[];
}

export interface AISuggestion {
    id: string;
    type: 'structure' | 'targeting' | 'budget' | 'creative';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    action?: {
        label: string;
        apply: () => void;
    };
}

export interface AIWarning {
    id: string;
    severity: 'error' | 'warning' | 'info';
    title: string;
    description: string;
    affectedNodes: string[];
}

// Default configs
export const DEFAULT_CAMPAIGN_CONFIG: CampaignConfig = {
    name: 'New Campaign',
    objective: 'CONVERSIONS',
    budgetType: 'daily',
    dailyBudget: 50,
    bidStrategy: 'LOWEST_COST',
};

export const DEFAULT_TARGETING: TargetingConfig = {
    locations: ['DE'],
    ageMin: 18,
    ageMax: 65,
    gender: 'all',
    interests: [],
    behaviors: [],
    customAudiences: [],
    lookalikeAudiences: [],
    exclusions: [],
    placements: ['feed', 'stories', 'reels'],
};

export const DEFAULT_ADSET_CONFIG: AdSetConfig = {
    name: 'New Ad Set',
    targeting: DEFAULT_TARGETING,
    optimizationGoal: 'CONVERSIONS',
};

export const DEFAULT_AD_CONFIG: AdConfig = {
    name: 'New Ad',
    headline: '',
    primaryText: '',
    cta: 'Learn More',
};
