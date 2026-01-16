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
}
