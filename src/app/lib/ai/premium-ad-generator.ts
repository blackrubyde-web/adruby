import { analyzeStrategy, type StrategicProfile } from './strategic-analyzer';
import { selectTemplate } from './template-selector';
import { generatePremiumCopy, type PremiumCopy } from './copy-generator';
import { composeLayout } from './layout-composer';
import { processImage } from './image-processor';
import type { AdDocument } from '../../types/studio';

/**
 * PREMIUM AD GENERATOR
 * Orchestrates 5-stage AI pipeline for Photoshop-level Meta ads
 */

export interface PremiumAdParams {
    productName: string;
    brandName?: string;
    userPrompt: string;
    tone: 'professional' | 'playful' | 'bold' | 'luxury' | 'minimal';
    imageBase64?: string;
    enhanceImage?: boolean;
}

export interface PremiumAdResult {
    adDocument: AdDocument;
    strategicProfile: StrategicProfile;
    premiumCopy: PremiumCopy;
    template: any;
    processedImages?: { original: string; background?: string };
}

export async function generatePremiumAd(
    params: PremiumAdParams,
    onProgress?: (stage: number, message: string) => void
): Promise<PremiumAdResult> {
    console.log('🚀 Starting Premium AI Ad Generation Pipeline...');

    try {
        // STAGE 1: Strategic Analysis
        onProgress?.(1, 'Analyzing product strategy...');
        const strategicProfile = await analyzeStrategy({
            productName: params.productName,
            brandName: params.brandName,
            userPrompt: params.userPrompt,
            tone: params.tone
        });

        // STAGE 2: Template Selection
        onProgress?.(2, 'Selecting optimal template...');
        const template = selectTemplate(strategicProfile, params.tone);

        // STAGE 3: Premium Copy Generation
        onProgress?.(3, 'Generating conversion-optimized copy...');
        const premiumCopy = await generatePremiumCopy({
            productName: params.productName,
            brandName: params.brandName,
            profile: strategicProfile,
            template,
            tone: params.tone
        });

        // STAGE 5: Intelligent Image Processing (via Backend Edge Function)
        onProgress?.(5, 'Processing image (Generating Scene)...');

        let processedImages: { original: string; background?: string } | undefined;

        try {
            // Safe Race: Give DALL-E 3 generous time (120s)
            const timeoutPromise = new Promise<{ original: string; background?: string } | undefined>((resolve) => {
                setTimeout(() => {
                    console.warn('⚠️ Image processing pending > 120s');
                    resolve({ original: params.imageBase64 || '' });
                }, 120000);
            });

            const processingPromise = processImage({
                imageBase64: params.imageBase64,
                productName: params.productName,
                tone: params.tone,
                shouldEnhance: params.enhanceImage !== false
            });

            // Race the real process against the timeout
            processedImages = await Promise.race([processingPromise, timeoutPromise]);

        } catch (imageError: any) {
            console.error('❌ Premium Image Failed:', imageError);
            processedImages = { original: params.imageBase64 || '' };
        }

        // STAGE 4: Layout Composition (after image processing)
        onProgress?.(4, 'Composing premium layout...');
        const adDocument = composeLayout({
            template,
            copy: premiumCopy,
            productImage: processedImages?.original,
            backgroundImage: processedImages?.background,
            brandName: params.brandName,
            productName: params.productName,
            visualIdentity: strategicProfile.visualIdentity
        });

        console.log('✅ Premium ad generation complete!');

        return {
            adDocument,
            strategicProfile,
            premiumCopy,
            template,
            processedImages
        };

    } catch (error) {
        console.error('Premium ad generation failed:', error);
        throw error;
    }
}
