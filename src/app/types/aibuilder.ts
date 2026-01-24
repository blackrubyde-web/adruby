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
        model: string;
        timestamp: number;
        generationTime?: number;
        savedToLibrary?: boolean;
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
}

