/**
 * AI Ad Builder - Type Definitions
 */

export type Language = 'de' | 'en';
export type InputMode = 'form' | 'free';

export interface FormInputData {
    industry: string;
    targetAudience: string;
    productName: string;
    usp: string;
    tone: string;
    goal: string;
    template: string;
}

export interface FreeTextInputData {
    text: string;
    template: string;
}

export interface AdGenerationParams {
    mode: InputMode;
    language: Language;
    // Form mode fields
    industry?: string;
    targetAudience?: string;
    productName?: string;
    usp?: string;
    tone?: string;
    goal?: string;
    template?: string;
    // Free mode fields
    text?: string;
    // Optional product image
    productImageUrl?: string;
    productImageBase64?: string;  // Direct base64 for compositing
    // Multi-variant generation
    variantCount?: number;
    // Railway v3.0 AI Design System
    useAIDesignSystem?: boolean;
    // Railway v6.0 Composite Pipeline (100% screenshot preservation)
    useCompositePipeline?: boolean;
    format?: string;
    funnelStage?: 'tof' | 'mof' | 'bof';
    stats?: Array<{ label: string; value: string }>;
}

// Single ad variant
export interface AdVariant {
    id: string;
    headline: string;
    slogan: string;
    description: string;
    cta: string;
    hook: string;
    imageUrl: string;
    imagePrompt: string;
    template: string;
    qualityScore?: number;
    engagementScore?: number;
}

export interface AdGenerationResult {
    id?: string;
    headline: string;
    slogan: string;
    description: string;
    cta: string;
    imageUrl: string;
    imagePrompt: string;
    template: string;
    creditsUsed: number;
    qualityScore?: number;
    engagementScore?: number;
    // Multi-variant support
    variants?: AdVariant[];
}

export interface AdGenerationResponse {
    success: boolean;
    jobId?: string;
    status?: 'processing' | 'complete' | 'error';
    data: AdGenerationResult;
    metadata: {
        model?: string;
        timestamp?: number;
        generationTime?: number;
        savedToLibrary?: boolean;
        engine?: string;
        parentJobId?: string;
        [key: string]: any;
    };
}

export interface TranscriptionResponse {
    success: boolean;
    data: {
        text: string;
    };
}

export interface AIAdBuilderComponentProps {
    language: Language;
    onGenerate: (data: FormInputData | FreeTextInputData) => void;
    loading: boolean;
}

export interface PreviewAreaProps {
    language: Language;
    result: AdGenerationResult | null;
    loading: boolean;
    error: string | null;
    selectedVariantIndex?: number;
    onSelectVariant?: (index: number) => void;
    mediaType?: OutputType;
    videoResult?: VideoGenerationResult | null;
}

// ============================================================
// VIDEO AD TYPES
// ============================================================

export type OutputType = 'image' | 'video';

export type VideoArchetype = 'product_reveal' | 'before_after' | 'dynamic_showcase' | 'lifestyle_scene' | 'social_proof';

export type VideoQuality = 'fast' | 'premium';

export interface VideoSettings {
    archetype: VideoArchetype;
    durationSeconds: 4 | 5 | 6 | 8;
    includeAudio: boolean;
    quality: VideoQuality;
    aspectRatio: '16:9' | '9:16';
    resolution: '720p' | '1080p' | '4k';
    personGeneration: 'allow_all' | 'allow_adult' | 'dont_allow';
}

export interface VideoGenerationResult {
    id: string;
    videoUrl: string;
    mediaType: 'video';
    durationMs: number;
    aspectRatio: string;
    resolution: string;
    hasAudio: boolean;
    archetype: VideoArchetype;
    script?: Record<string, unknown>;
    headline?: string;
    slogan?: string;
    description?: string;
    cta?: string;
    creditsUsed: number;
    qualityScore?: number;
    engagementScore?: number;
}

export interface VideoAdParams extends AdGenerationParams {
    outputType: 'video';
    archetypeId: VideoArchetype;
    durationSeconds: number;
    quality: VideoQuality;
    aspectRatio: string;
    resolution: string;
    includeAudio: boolean;
    personGeneration?: string;
}

export interface VideoStatusResponse {
    success: boolean;
    status: 'processing' | 'complete' | 'error';
    data?: VideoGenerationResult;
    progress?: number;
    step?: string;
    message?: string;
    error?: string;
    metadata?: {
        generationTime?: number;
        engine?: string;
        savedToLibrary?: boolean;
    };
}
