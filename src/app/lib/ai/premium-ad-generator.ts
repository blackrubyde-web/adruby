import { analyzeStrategy, type StrategicProfile } from './strategic-analyzer';
import { selectTemplate } from './template-selector';
import { generatePremiumCopy, type PremiumCopy } from './copy-generator';
import { getBestCopyVariant, type CopyVariant } from './copy-generator-v2'; // NEW: 10x variant engine
import { generateDynamicTemplate, generateVisualStyle, type VisualStyle } from './template-generator-v2'; // NEW: Dynamic templates
import { composeLayout } from './layout-composer';
import { processImage } from './image-processor';
import { scoreAdQuality } from './vision-qa';
import type { AdDocument } from '../../types/studio';
import { removeBackground, blobToBase64 } from './bg-removal';

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
    groundedFacts?: {
        offer?: string;
        proof?: string;
        painPoints?: string[];
    };
    language?: string;
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
    console.log('🚀 Starting Premium AI Ad Generation Pipeline 2.0 (Compositing Mode)...');

    try {
        // STAGE 1: Strategic Analysis 2.0 (Design Tokens)
        onProgress?.(1, 'Analyzing brand strategy & design tokens...');
        const strategicProfile = await analyzeStrategy({
            productName: params.productName,
            brandName: params.brandName,
            userPrompt: params.userPrompt,
            tone: params.tone,
            imageBase64: params.imageBase64
        });

        // STAGE 2: Dynamic Template Generation (NEW: Algorithmic Layouts)
        onProgress?.(2, 'Generating unique template with color harmonies...');

        // Determine visual style based on tone
        const visualStyleMap: Record<string, VisualStyle['name']> = {
            'professional': 'minimal',
            'playful': 'playful',
            'bold': 'bold',
            'luxury': 'luxury',
            'minimal': 'minimal'
        };
        const visualStyle = visualStyleMap[params.tone] || 'minimal';

        // Extract brand color from strategic profile (safe access with fallback)
        const brandColor = strategicProfile.designSystem?.colorPalette?.primary || '#000000';

        // Generate completely unique template
        const dynamicTemplate = generateDynamicTemplate({
            tone: params.tone,
            visualStyle,
            brandColor,
            productCategory: 'general' // strategicProfile doesn't have niche
        });

        // For compatibility with existing flow, wrap dynamic template
        const template = {
            id: dynamicTemplate.id,
            name: dynamicTemplate.name,
            document: dynamicTemplate // layout-composer expects template.document
        };

        // STAGE 3: Premium Copy Explosion (NEW: 10 Hook Angles → Best Variant)
        onProgress?.(3, 'Generating 10 copy variants with scientific hook angles...');
        const bestVariant = await getBestCopyVariant({
            productName: params.productName,
            brandName: params.brandName,
            profile: strategicProfile,
            tone: params.tone,
            groundedFacts: params.groundedFacts || {
                offer: "Get 50% Off Today",
                proof: "Trusted by 10,000+ Customers"
            }
        });

        // Convert CopyVariant to PremiumCopy format for compatibility
        const premiumCopy: PremiumCopy = {
            headline: bestVariant.headline,
            subheadline: bestVariant.subheadline,
            description: bestVariant.description,
            cta: bestVariant.cta,
            socialProof: bestVariant.socialProof,
            urgencyText: bestVariant.urgencyText,
            score: bestVariant.score.total,
            reasoning: `${bestVariant.hookAngle} hook: ${bestVariant.reasoning}`
        };

        // STAGE 4: Compositing Engine (Parallel)
        onProgress?.(4, 'Compositing authentic product scene...');

        let processedAssets: { originalProduct: string; generatedBackground?: string } | undefined;

        try {
            // Give generation 120s max
            const timeoutPromise = new Promise<{ originalProduct: string; generatedBackground?: string } | undefined>((resolve) => {
                setTimeout(() => {
                    console.warn('⚠️ Compositing timeout > 120s');
                    resolve({ originalProduct: params.imageBase64 || '' });
                }, 120000);
            });

            // NEW: Automatic Background Removal (Cutout)
            onProgress?.(4, 'Removing background (Precision Cutout)...');
            let cutoutBase64 = params.imageBase64;

            if (params.imageBase64 && params.enhanceImage !== false) {
                try {
                    const blob = await removeBackground(params.imageBase64);
                    cutoutBase64 = await blobToBase64(blob);
                    console.log('✂️ Cutout generated successfully');
                } catch (e) {
                    console.warn('⚠️ Background removal failed, using original:', e);
                }
            }

            const processingPromise = processImage({
                imageBase64: params.imageBase64, // Original for context (legacy/reference)
                cutoutBase64: cutoutBase64,      // NEW: Explicit Cutout
                productName: params.productName,
                tone: params.tone,
                designVibe: strategicProfile.designSystem.vibe,
                shouldEnhance: params.enhanceImage !== false
            });

            // Race it
            processedAssets = await Promise.race([processingPromise, timeoutPromise]);

            // STAGE 6: Vision QA (Safety & Quality Check)
            if (processedAssets?.generatedBackground) {
                onProgress?.(6, 'Performing Vision QA on Assets...');
                const qaScore = await scoreAdQuality(processedAssets.generatedBackground, {
                    product: params.productName,
                    tone: params.tone
                });

                // If QA fails critical safety/quality, fallback to original or specific fix
                if (qaScore.totalScore < 60 || !qaScore.breakdown.safetyCheck) {
                    console.warn('⚠️ Vision QA Failed! Reverting to simple product cutout.', qaScore.feedback);
                    processedAssets.generatedBackground = undefined; // Fallback to solid color/cutout
                }
            }

        } catch (imageError: any) {
            console.error('❌ Compositing Failed:', imageError);
            processedAssets = { originalProduct: params.imageBase64 || '' };
        }

        // STAGE 5: Final Layout Assembly
        onProgress?.(5, 'Assembling final studio assets...');
        const adDocument = composeLayout({
            template,
            copy: premiumCopy,
            productImage: processedAssets?.originalProduct,
            backgroundImage: processedAssets?.generatedBackground,
            brandName: params.brandName,
            productName: params.productName,
            visualIdentity: {
                primaryColor: strategicProfile.designSystem.colorPalette.primary,
                accentColor: strategicProfile.designSystem.colorPalette.highlight,
                backgroundColor: strategicProfile.designSystem.colorPalette.primary,
                textColor: strategicProfile.designSystem.colorPalette.text,
                fontStyle: 'modern' // fallback or map from fontPairing
            },
            groundedFacts: {
                offer: params.groundedFacts?.offer || 'Special Offer',
                proof: params.groundedFacts?.proof
            }
        });

        console.log('✅ Premium ad pipeline complete!');

        return {
            adDocument,
            strategicProfile,
            premiumCopy,
            template,
            processedImages: {
                original: processedAssets?.originalProduct || '',
                background: processedAssets?.generatedBackground
            }
        };

    } catch (error) {
        console.error('Premium pipeline failed:', error);
        throw error;
    }
}
