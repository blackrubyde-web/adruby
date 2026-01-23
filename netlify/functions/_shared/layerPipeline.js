/**
 * LAYER PIPELINE ORCHESTRATOR
 * 
 * Coordinates the 4-layer ad generation pipeline:
 * 1. Creative Strategist → Layout JSON
 * 2. Clean Canvas → Product photo (no text)
 * 3. Art Director → X/Y coordinates
 * 4. Compositor → Sharp text overlay
 * 
 * This produces professional ads with SHARP text.
 */

import { createLayoutStrategy } from './strategist.js';
import { generateCleanCanvas } from './cleanCanvas.js';
import { getOverlayCoordinates } from './artDirector.js';
import { compositeAd } from './compositor.js';
import { polishCreativePrompt } from './promptPolisher.js';

/**
 * Execute the full 4-layer pipeline
 * @returns {Object} { success, buffer, metadata }
 */
export async function executeLayerPipeline({
    productImageBuffer,
    productAnalysis,
    userPrompt,
    headline,
    tagline,
    cta,
    industry,
    openai
}) {
    console.log('[Pipeline] 🚀 Starting 4-layer ad generation pipeline...');
    const startTime = Date.now();

    try {
        // ═══════════════════════════════════════
        // LAYER 1: Creative Strategist
        // ═══════════════════════════════════════
        console.log('[Pipeline] Layer 1/4: Creative Strategist...');

        const layoutPlan = await createLayoutStrategy({
            productAnalysis,
            userPrompt,
            industry,
            headline,
            tagline,
            cta
        });

        console.log('[Pipeline] ✓ Layout strategy:', layoutPlan.layoutType);

        // ═══════════════════════════════════════
        // LAYER 1.5: Marketing Copy (if needed)
        // Layer 1.5 is now handled by Layer 1.75 (Creative Prompt Polisher)
        // Marketing copy uses headline/tagline/cta passed from caller
        const marketingCopy = { headline, tagline, cta };

        // ═══════════════════════════════════════
        // LAYER 1.75: Polish User's Creative Vision (Meta 2026)
        // ═══════════════════════════════════════
        let enhancedPrompt = userPrompt;

        if (userPrompt && openai) {
            console.log('[Pipeline] Layer 1.75: Polishing creative vision to Meta 2026...');
            try {
                const polished = await polishCreativePrompt(openai, {
                    userPrompt,
                    productAnalysis,
                    industry
                });
                if (polished?.enhancedPrompt) {
                    enhancedPrompt = polished.enhancedPrompt;
                    console.log('[Pipeline] ✓ Enhanced:', polished.keyEnhancements?.join(', '));
                }
            } catch (e) {
                console.warn('[Pipeline] Creative polish failed, using raw prompt');
            }
        }

        // ═══════════════════════════════════════
        // LAYER 2: Generate Ad with Gemini
        // ═══════════════════════════════════════
        console.log('[Pipeline] Layer 2/4: Generating ad with Gemini...');

        const canvasResult = await generateCleanCanvas({
            productImageBuffer,
            layoutPlan,
            productAnalysis,
            copy: marketingCopy,
            userPrompt: enhancedPrompt  // POLISHED prompt, not raw
        });

        if (!canvasResult.success) {
            throw new Error('Ad generation failed: ' + canvasResult.error);
        }

        console.log('[Pipeline] ✓ Ad generated', canvasResult.includesText ? '(with text)' : '(no text)');

        // If Gemini already rendered text, skip Art Director and Compositor
        if (canvasResult.includesText) {
            const duration = Date.now() - startTime;
            console.log(`[Pipeline] ✅ Pipeline complete in ${duration}ms (Gemini rendered text)`);

            return {
                success: true,
                buffer: canvasResult.buffer,
                metadata: {
                    layoutPlan,
                    copy: marketingCopy,
                    duration,
                    source: 'gemini_direct'
                }
            };
        }

        // Fallback: If no text, continue with Art Director + Compositor
        // ═══════════════════════════════════════
        // LAYER 3: Art Director (fallback only)
        // ═══════════════════════════════════════
        console.log('[Pipeline] Layer 3/4: Art Director (fallback)...');

        const coordinates = await getOverlayCoordinates({
            cleanCanvasBuffer: canvasResult.buffer,
            layoutPlan,
            copy: marketingCopy
        });

        console.log('[Pipeline] ✓ Coordinates extracted');

        // ═══════════════════════════════════════
        // LAYER 4: Vector Compositor (fallback only)
        // ═══════════════════════════════════════
        console.log('[Pipeline] Layer 4/4: Vector Compositor (fallback)...');

        const finalResult = await compositeAd({
            cleanCanvasBuffer: canvasResult.buffer,
            coordinates,
            copy: marketingCopy,
            layoutPlan
        });

        if (!finalResult.success) {
            throw new Error('Composition failed: ' + finalResult.error);
        }

        const duration = Date.now() - startTime;
        console.log(`[Pipeline] ✅ Pipeline complete in ${duration}ms`);

        return {
            success: true,
            buffer: finalResult.buffer,
            metadata: {
                layoutPlan,
                coordinates,
                copy: marketingCopy,
                duration,
                source: 'layer_pipeline'
            }
        };

    } catch (error) {
        console.error('[Pipeline] ❌ Pipeline failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Quick version - skips Art Director, uses layout defaults
 */
export async function executeQuickPipeline({
    productImageBuffer,
    productAnalysis,
    headline,
    tagline,
    cta,
    industry
}) {
    console.log('[Pipeline] ⚡ Quick pipeline (skipping coordinate analysis)...');

    try {
        // Simplified layout
        const layoutPlan = {
            layoutType: 'hero_product',
            composition: {
                productPosition: 'center',
                negativeSpaceZone: 'top'
            },
            style: {
                mood: 'premium',
                backgroundType: 'dark_gradient',
                backgroundColor: '#1a1a2e',
                accentColor: '#FF4757'
            }
        };

        // Generate clean canvas
        const canvasResult = await generateCleanCanvas({
            productImageBuffer,
            layoutPlan,
            productAnalysis
        });

        if (!canvasResult.success) {
            throw new Error('Canvas failed');
        }

        // Use default coordinates
        const coordinates = {
            headline: { x: 540, y: 100, fontSize: 64, color: '#FFFFFF' },
            tagline: tagline ? { x: 540, y: 175, fontSize: 24, color: '#CCCCCC' } : null,
            cta: { x: 440, y: 960, width: 200, height: 56, borderRadius: 28, backgroundColor: '#FF4757', textColor: '#FFFFFF', fontSize: 18 }
        };

        // Composite
        const result = await compositeAd({
            cleanCanvasBuffer: canvasResult.buffer,
            coordinates,
            copy: { headline, tagline, cta },
            layoutPlan
        });

        return result;
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export default { executeLayerPipeline, executeQuickPipeline };
