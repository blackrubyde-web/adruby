/**
 * MASTER COMPOSITE AD GENERATOR v10.0
 * 
 * The most advanced ad generation system integrating:
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │  PHASE 1: INTELLIGENCE GATHERING                            │
 * │  - Deep Foreplay analysis (5+ reference ads)                │
 * │  - AI content generation (headlines, features, CTAs)        │
 * │  - Pattern library matching                                 │
 * │  - Brand color extraction                                   │
 * └─────────────────────────────────────────────────────────────┘
 *                            ↓
 * ┌─────────────────────────────────────────────────────────────┐
 * │  PHASE 2: LAYOUT COMPOSITION                                │
 * │  - Optimal layout selection                                 │
 * │  - Golden ratio / rule of thirds                            │
 * │  - Visual hierarchy calculation                             │
 * │  - Position calculations                                    │
 * └─────────────────────────────────────────────────────────────┘
 *                            ↓
 * ┌─────────────────────────────────────────────────────────────┐
 * │  PHASE 3: BACKGROUND GENERATION                             │
 * │  - Premium Gemini prompts (1000+ words)                     │
 * │  - Gradient mesh backgrounds                                │
 * │  - Effect layer generation                                  │
 * └─────────────────────────────────────────────────────────────┘
 *                            ↓
 * ┌─────────────────────────────────────────────────────────────┐
 * │  PHASE 4: ADVANCED MOCKUP CREATION                          │
 * │  - Device frame rendering                                   │
 * │  - Multi-layer shadows                                      │
 * │  - Screen glow effects                                      │
 * │  - 3D perspective transforms                                │
 * └─────────────────────────────────────────────────────────────┘
 *                            ↓
 * ┌─────────────────────────────────────────────────────────────┐
 * │  PHASE 5: VISUAL ELEMENTS                                   │
 * │  - Glassmorphic cards                                       │
 * │  - Feature callouts                                         │
 * │  - Trust badges                                             │
 * │  - Decorative elements                                      │
 * └─────────────────────────────────────────────────────────────┘
 *                            ↓
 * ┌─────────────────────────────────────────────────────────────┐
 * │  PHASE 6: PREMIUM TYPOGRAPHY                                │
 * │  - Gradient headlines                                       │
 * │  - 3D text shadows                                          │
 * │  - Glowing CTAs                                             │
 * │  - Social proof rendering                                   │
 * └─────────────────────────────────────────────────────────────┘
 *                            ↓
 * ┌─────────────────────────────────────────────────────────────┐
 * │  PHASE 7: FINAL EFFECTS & COMPOSITING                       │
 * │  - Noise texture                                            │
 * │  - Vignette                                                 │
 * │  - Color grading                                            │
 * │  - Layer ordering                                           │
 * └─────────────────────────────────────────────────────────────┘
 *                            ↓
 * ┌─────────────────────────────────────────────────────────────┐
 * │  PHASE 8: QUALITY VERIFICATION                              │
 * │  - GPT-4V quality scoring                                   │
 * │  - Improvement suggestions                                  │
 * │  - Regeneration if needed                                   │
 * └─────────────────────────────────────────────────────────────┘
 */

import sharp from 'sharp';
import { GoogleGenerativeAI } from '@google/generative-ai';

// AI Modules
import { matchProduct } from '../ai/productMatcher.js';
import { analyzeReferenceAds, getDefaultDesignSpecs, planAdComposition } from '../ai/foreplayDesignAnalyzer.js';
import { generateAdContent, generateFeatureCallouts, generateSocialProof } from '../ai/aiContentGenerator.js';

// Effects Modules
import {
    createGradientMesh,
    createParticleField,
    createSparkles,
    createLightRays,
    createLensFlare,
    createNoiseTexture,
    createVignette,
    createColorGrading,
    buildEffectsLayer,
    createGlassmorphismPanel,
    createGlassCard,
    createAdvancedShadow
} from '../effects/advancedEffectsEngine.js';

// Typography Modules
import {
    createPremiumHeadline,
    createPremiumTagline,
    createPremiumCTA,
    createFeatureText,
    createSocialProof as renderSocialProof,
    createTrustBadge,
    buildTypographyLayer
} from '../typography/advancedTypographyEngine.js';

// Layout Modules
import {
    LAYOUT_PRESETS,
    selectOptimalLayout,
    calculatePositions,
    calculateVisualHierarchy,
    calculateMargins,
    validateComposition,
    autoFixComposition,
    getLayerOrder,
    createLayerManifest
} from '../layout/layoutCompositionEngine.js';

// Pattern Library
import {
    selectColorPalette,
    selectTypographyPreset,
    selectEffectPattern,
    selectCTAPattern,
    buildPatternSet
} from '../patterns/foreplayPatternLibrary.js';

// Quality Scoring
import {
    scoreAdQuality,
    quickQualityCheck,
    generateRegenerationGuidance
} from '../quality/qualityScoringEngine.js';

// NEW: Industry Database (1000+ industries)
import { getIndustryConfig, getVisualStyleForProduct } from '../data/industryDatabase.js';

// NEW: Creative Variant Engine (A/B variants, batch generation)
import { generateCreativeVariants, generateVariantBatch, predictVariantPerformance } from '../variants/creativeVariantEngine.js';

// NEW: Emotion & Mood System (10 emotions, seasonal trends)
import { getEmotionsForProduct, mapEmotionToDesign, generateEmotionBasedDesign, getCurrentSeasonalTrend, applySeasonalTrend } from '../data/emotionMoodSystem.js';

// NEW: Product Visual Rules (detailed mockup/effect/typography rules per product type)
import { getProductVisualRules, applyVisualRules, getMockupRecommendation, getEffectRecommendations } from '../rules/productVisualRules.js';

// NEW: Copy Template Library (headlines, taglines, CTAs by strategy)
import { generateHeadlineFromTemplate, generateTaglineFromTemplate, getCTAOptions, generateCopyPackage } from '../copy/copyTemplateLibrary.js';

// NEW: Deep Foreplay Pattern Matcher (GPT-4V analysis, pattern synthesis)
import { deepAnalyzeForeplayPatterns } from '../patterns/deepForeplayMatcher.js';

// NEW v12-v13: Design Intelligence Integration
import { generateDesignIntelligence, quickForeplayAnalysis } from '../integration/designIntelligenceIntegrator.js';

// NEW: Multi-Format Export (Story, Reel, Portrait, etc.)
import { exportToFormat, exportToAllFormats, getFormatLayout, AD_FORMATS } from '../export/multiFormatExporter.js';

// NEW: Animation Layer (CSS animations for web ads)
import { generateAdAnimationCSS, getAnimationPreset, generateAnimatedSparkleSVG } from '../animation/animationLayer.js';

// NEW v13: Element Generators
import { generateAtmosphereLayer } from '../elements/decorativeOverlays.js';
import { generateGlassCard as generateGlassCardV2, generateGlassButton } from '../elements/glassmorphicComponents.js';
import { createGradientText, createGlowText, create3DText } from '../elements/enhancedTextEffects.js';
import { generateDiscountBadge, generateTrustBadge, generateFeatureBadge } from '../elements/badgeGenerator.js';
import { generateProgressBar, generateStarRating, generateStatCounter } from '../elements/dataVisualization.js';
import { generateFeatureCallout, generateIconCallout } from '../elements/calloutGenerator.js';

// Premium Prompt Builder
import { buildBackgroundPrompt, buildTypographySpecs, buildProductSpecs } from './premiumPromptBuilder.js';

// Visual Elements Generator
import { generateVisualElements, compositeVisualElements } from './visualElementsGenerator.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Canvas
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1080;

// Quality settings
const QUALITY_THRESHOLD = 7.0;
const MAX_REGENERATION_ATTEMPTS = 2;

/**
 * MASTER AD GENERATION FUNCTION
 */
export async function generateCompositeAd({
    productImageBuffer,
    headline,
    tagline,
    cta,
    accentColor,
    industry,
    userPrompt,
    enableQualityCheck = true,
    enableAIContent = true,
    enableAdvancedEffects = true
}) {
    console.log('[MasterGen] 🎨 ═══════════════════════════════════════════════');
    console.log('[MasterGen] 🎨 MASTER COMPOSITE GENERATOR v10.0');
    console.log('[MasterGen] 🎨 ═══════════════════════════════════════════════');
    const startTime = Date.now();

    let regenerationAttempt = 0;
    let finalBuffer = null;
    let qualityResult = null;
    let finalAccentColor = accentColor || '#FF4757';  // Declare outside loop for proper scope

    while (regenerationAttempt <= MAX_REGENERATION_ATTEMPTS) {
        try {
            // ════════════════════════════════════════════════════════════
            // PHASE 1: INTELLIGENCE GATHERING
            // ════════════════════════════════════════════════════════════
            console.log('[MasterGen] ▶ PHASE 1: Intelligence Gathering...');

            // Product Analysis & Foreplay Matching
            let productAnalysis = null;
            let referenceAds = [];
            let extractedColors = { primary: '#0A0A1A', accent: accentColor || '#FF4757' };
            let deepAnalysis = null;  // NEW: Deep analysis for smart element placement

            if (productImageBuffer) {
                try {
                    const matchResult = await matchProduct(productImageBuffer);
                    productAnalysis = matchResult.analysis;
                    deepAnalysis = matchResult.deepAnalysis;  // NEW: Contains visual anchors, content zones
                    referenceAds = matchResult.referenceAds || [];
                    extractedColors = await extractBrandColors(productImageBuffer, productAnalysis);

                    console.log(`[MasterGen]   Product: ${productAnalysis?.productName || 'Unknown'}`);
                    console.log(`[MasterGen]   Type: ${productAnalysis?.productType || 'unknown'}`);
                    console.log(`[MasterGen]   References: ${referenceAds.length} Foreplay ads`);

                    // NEW: Log deep analysis insights
                    if (deepAnalysis) {
                        console.log(`[MasterGen] 🔬 Deep Analysis Results:`);
                        console.log(`[MasterGen]   Visual Anchors: ${deepAnalysis.visualAnchors?.length || 0}`);
                        console.log(`[MasterGen]   Empty Spaces: ${deepAnalysis.contentZones?.emptySpaces?.length || 0}`);
                        console.log(`[MasterGen]   Max Callouts: ${deepAnalysis.designRecommendations?.maxCallouts || 2}`);
                        console.log(`[MasterGen]   Suggested Headline: ${deepAnalysis.designRecommendations?.suggestedHeadline || 'N/A'}`);
                        console.log(`[MasterGen]   Exclude: ${deepAnalysis.excludeElements?.join(', ') || 'none'}`);
                    }
                } catch (e) {
                    console.warn('[MasterGen]   Product analysis fallback:', e.message);
                }
            }

            finalAccentColor = accentColor || extractedColors.accent || '#FF4757';  // Update with extracted colors

            // Deep Foreplay Design Analysis
            const designSpecs = await analyzeReferenceAds(referenceAds, productAnalysis);
            console.log(`[MasterGen]   Design Specs: ${designSpecs.layout?.gridType || 'centered'} layout`);
            console.log(`[MasterGen]   Mood: ${designSpecs.mood?.primary || 'premium'}`);

            // NEW: AI Creative Director - Plan final composition
            let compositionPlan = null;
            if (deepAnalysis && designSpecs) {
                compositionPlan = await planAdComposition(designSpecs, deepAnalysis, productAnalysis);
                console.log(`[MasterGen] 🧠 AI Composition Plan:`);
                console.log(`[MasterGen]   Headline: "${compositionPlan?.headline?.text?.substring(0, 25) || 'N/A'}..."`);
                console.log(`[MasterGen]   Callouts: ${compositionPlan?.callouts?.length || 0}`);
                console.log(`[MasterGen]   Badges: ${compositionPlan?.badges?.length || 0}`);
            }

            // AI Content Generation
            let contentPackage = null;
            if (enableAIContent) {
                contentPackage = await generateAdContent({
                    productAnalysis,
                    referenceAds,
                    userPrompt,
                    industry
                });
                console.log(`[MasterGen]   Content: ${Object.keys(contentPackage?.headlines || {}).length} headlines generated`);
            }

            // Pattern Set Building
            const patternSet = buildPatternSet(designSpecs, productAnalysis, contentPackage);
            console.log(`[MasterGen]   Patterns: ${patternSet.typography.name} typography`);

            // Apply regeneration guidance if this is a retry
            if (regenerationAttempt > 0 && qualityResult) {
                const guidance = generateRegenerationGuidance(qualityResult);
                applyRegenerationGuidance(designSpecs, patternSet, guidance);
                console.log(`[MasterGen]   Applied ${guidance.adjustments.length} regeneration adjustments`);
            }

            // ════════════════════════════════════════════════════════════
            // PHASE 2: LAYOUT COMPOSITION
            // ════════════════════════════════════════════════════════════
            console.log('[MasterGen] ▶ PHASE 2: Layout Composition...');

            const layout = selectOptimalLayout({
                productAnalysis,
                designSpecs,
                contentPackage,
                referenceAds
            });
            console.log(`[MasterGen]   Selected: ${layout.name}`);

            const positions = calculatePositions(layout, {});
            const hierarchy = calculateVisualHierarchy(contentPackage);
            const margins = calculateMargins(layout.whitespace);

            // Validate composition
            const validation = validateComposition(positions);
            const finalPositions = validation.valid ? positions : autoFixComposition(positions, validation.issues);
            if (!validation.valid) {
                console.log(`[MasterGen]   Fixed ${validation.issues.length} composition issues`);
            }

            // Layer manifest
            const layerManifest = createLayerManifest(designSpecs, contentPackage);
            console.log(`[MasterGen]   Layers: ${Object.values(layerManifest).filter(Boolean).length} active`);

            // ════════════════════════════════════════════════════════════
            // PHASE 3: BACKGROUND GENERATION
            // ════════════════════════════════════════════════════════════
            console.log('[MasterGen] ▶ PHASE 3: Background Generation...');

            const backgroundPrompt = buildBackgroundPrompt(designSpecs, productAnalysis, finalAccentColor);
            console.log(`[MasterGen]   Prompt: ${backgroundPrompt.length} characters`);

            let backgroundBuffer = await generatePremiumBackground(backgroundPrompt, finalAccentColor, designSpecs);
            console.log('[MasterGen]   Background: ✓');

            // ════════════════════════════════════════════════════════════
            // PHASE 4: ADVANCED EFFECTS LAYER
            // ════════════════════════════════════════════════════════════
            console.log('[MasterGen] ▶ PHASE 4: Advanced Effects...');

            if (enableAdvancedEffects && layerManifest.gradient_mesh) {
                const effectsBuffer = await buildEffectsLayer(designSpecs, finalAccentColor);
                backgroundBuffer = await compositeBuffers(backgroundBuffer, effectsBuffer);
                console.log('[MasterGen]   Effects layer: ✓');
            }

            // ════════════════════════════════════════════════════════════
            // PHASE 5: DEVICE MOCKUP
            // ════════════════════════════════════════════════════════════
            console.log('[MasterGen] ▶ PHASE 5: Device Mockup...');

            const productSpecs = buildProductSpecs(designSpecs);
            let mockupBuffer = null;

            if (productImageBuffer) {
                mockupBuffer = await createAdvancedMockup({
                    screenshotBuffer: productImageBuffer,
                    deviceType: productSpecs.device.type,
                    hasFrame: productSpecs.device.hasFrame,
                    shadow: productSpecs.shadow,
                    reflection: productSpecs.reflection,
                    screenGlow: productSpecs.screenGlow,
                    accentColor: finalAccentColor
                });
                console.log(`[MasterGen]   Mockup: ${productSpecs.device.type} ✓`);
            }

            // ════════════════════════════════════════════════════════════
            // PHASE 6: COMPOSITE PRODUCT
            // ════════════════════════════════════════════════════════════
            console.log('[MasterGen] ▶ PHASE 6: Precision Compositing...');

            let compositeBuffer = await applyPrecisionComposite({
                backgroundBuffer,
                mockupBuffer,
                productSpecs,
                positions: finalPositions
            });
            console.log('[MasterGen]   Composite: ✓');

            // ════════════════════════════════════════════════════════════
            // PHASE 7: VISUAL ELEMENTS
            // ════════════════════════════════════════════════════════════
            console.log('[MasterGen] ▶ PHASE 7: Visual Elements...');

            // Generate and composite visual elements (now with smart filtering from deepAnalysis)
            const visualElements = await generateVisualElements(
                designSpecs,
                productAnalysis,
                finalAccentColor,
                deepAnalysis  // NEW: Contains excludeElements, maxCallouts, visualAnchors
            );
            compositeBuffer = await compositeVisualElements(compositeBuffer, visualElements);
            console.log(`[MasterGen]   Elements: ${visualElements.length} layers ✓`);

            // Add glass cards for floating_ui layout
            if (layout.name === 'Floating UI' && contentPackage?.features) {
                compositeBuffer = await addGlassCards(compositeBuffer, contentPackage.features, finalPositions.floatingCards);
                console.log('[MasterGen]   Glass cards: ✓');
            }

            // ════════════════════════════════════════════════════════════
            // PHASE 8: PREMIUM TYPOGRAPHY
            // ════════════════════════════════════════════════════════════
            console.log('[MasterGen] ▶ PHASE 8: Premium Typography...');

            const typographySpecs = buildTypographySpecs(designSpecs);

            // Use AI-generated content if available
            const finalHeadline = headline ||
                contentPackage?.headlines?.primary ||
                productAnalysis?.suggestedHeadlines?.[0] ||
                'Premium Quality';
            const finalTagline = tagline || contentPackage?.taglines?.primary;
            const finalCTA = cta || contentPackage?.ctas?.primary || 'Shop Now';

            // Build complete typography layer
            const typographySvg = buildTypographyLayer({
                headline: finalHeadline,
                tagline: finalTagline,
                cta: finalCTA,
                features: contentPackage?.features?.slice(0, 4) || [],
                socialProof: contentPackage?.trustIndicators?.rating ? {
                    show: true,
                    type: 'rating',
                    rating: contentPackage.trustIndicators.rating.score,
                    count: contentPackage.trustIndicators.reviews?.count
                } : designSpecs.visualElements?.socialProof,
                badges: designSpecs.visualElements?.badges || [],
                designSpecs,
                accentColor: finalAccentColor
            });

            const typographyBuffer = await sharp(Buffer.from(typographySvg)).png().toBuffer();
            compositeBuffer = await compositeBuffers(compositeBuffer, typographyBuffer);
            console.log('[MasterGen]   Typography: ✓');

            // ════════════════════════════════════════════════════════════
            // PHASE 9: FINAL EFFECTS
            // ════════════════════════════════════════════════════════════
            console.log('[MasterGen] ▶ PHASE 9: Final Effects...');

            // Add noise texture
            if (layerManifest.noise_texture) {
                const noiseSvg = `<svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
                    ${createNoiseTexture({ opacity: 0.018, type: 'grain' })}
                </svg>`;
                const noiseBuffer = await sharp(Buffer.from(noiseSvg)).png().toBuffer();
                compositeBuffer = await compositeBuffers(compositeBuffer, noiseBuffer);
            }

            // Add vignette
            if (layerManifest.vignette) {
                const vignetteSvg = `<svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
                    ${createVignette({ type: 'classic', intensity: 0.3 })}
                </svg>`;
                const vignetteBuffer = await sharp(Buffer.from(vignetteSvg)).png().toBuffer();
                compositeBuffer = await compositeBuffers(compositeBuffer, vignetteBuffer);
            }

            console.log('[MasterGen]   Final effects: ✓');

            finalBuffer = compositeBuffer;

            // ════════════════════════════════════════════════════════════
            // PHASE 10: QUALITY VERIFICATION
            // ════════════════════════════════════════════════════════════
            if (enableQualityCheck) {
                console.log('[MasterGen] ▶ PHASE 10: Quality Verification...');

                qualityResult = await scoreAdQuality({
                    imageBuffer: finalBuffer,
                    designSpecs,
                    contentPackage,
                    productAnalysis,
                    referenceAds
                });

                console.log(`[MasterGen]   Score: ${qualityResult.overallScore}/10 (${qualityResult.tier})`);
                console.log(`[MasterGen]   Strengths: ${qualityResult.strengths?.slice(0, 2).join(', ') || 'N/A'}`);

                if (qualityResult.needsRegeneration && regenerationAttempt < MAX_REGENERATION_ATTEMPTS) {
                    console.log(`[MasterGen]   ⚠ Quality below threshold, regenerating (attempt ${regenerationAttempt + 2})...`);
                    regenerationAttempt++;
                    continue;
                }
            }

            // Success - break out of regeneration loop
            break;

        } catch (error) {
            console.error(`[MasterGen] ❌ Generation error (attempt ${regenerationAttempt + 1}):`, error.message);
            if (regenerationAttempt >= MAX_REGENERATION_ATTEMPTS) {
                throw error;
            }
            regenerationAttempt++;
        }
    }

    const duration = Date.now() - startTime;
    console.log('[MasterGen] ═══════════════════════════════════════════════');
    console.log(`[MasterGen] ✅ COMPLETE in ${duration}ms`);
    console.log(`[MasterGen]   Quality: ${qualityResult?.overallScore || 'N/A'}/10`);
    console.log('[MasterGen] ═══════════════════════════════════════════════');

    return {
        buffer: finalBuffer,
        duration,
        qualityScore: qualityResult?.overallScore || 0,
        qualityTier: qualityResult?.tier || 'unknown',
        qualityDetails: qualityResult,
        regenerationAttempts: regenerationAttempt,
        referenceCount: 0, // This would come from matchProduct
        metadata: {
            version: '11.0',
            mode: 'foreplay_driven_designer'
        },

        // NEW: Animation CSS for web ads
        animationCSS: generateAdAnimationCSS({
            glowColor: finalAccentColor,
            featureCount: 4
        }),

        // NEW: Multi-format export helper
        exportFormats: async (formats = ['square', 'story', 'landscape']) => {
            return await exportToAllFormats({
                sourceBuffer: finalBuffer,
                formats
            });
        },

        // Quick export to single format
        exportTo: async (format) => {
            return await exportToFormat({
                sourceBuffer: finalBuffer,
                format
            });
        }
    };
}

// ════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Generate premium background with Gemini
 */
async function generatePremiumBackground(prompt, accentColor, designSpecs) {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            generationConfig: { responseModalities: ['image', 'text'] }
        });

        const result = await model.generateContent([{ text: prompt }]);
        const candidates = result.response?.candidates;

        if (candidates?.[0]?.content?.parts) {
            for (const part of candidates[0].content.parts) {
                if (part.inlineData?.data) {
                    const buffer = Buffer.from(part.inlineData.data, 'base64');
                    return await sharp(buffer).resize(CANVAS_WIDTH, CANVAS_HEIGHT).png().toBuffer();
                }
            }
        }
        throw new Error('No image generated');
    } catch (error) {
        console.warn('[MasterGen] Gemini fallback:', error.message);
        return await createFallbackBackground(accentColor, designSpecs);
    }
}

/**
 * Create fallback background
 */
async function createFallbackBackground(accentColor, designSpecs) {
    const colors = designSpecs?.colors || {};
    const bgPrimary = colors.backgroundPrimary || '#0A0A1A';
    const bgSecondary = colors.backgroundSecondary || '#1A1A3A';

    // Build gradient mesh
    const mesh = createGradientMesh({
        colors: [accentColor, '#6C5CE7', '#00D2D3', accentColor],
        complexity: 5,
        softness: 0.35
    });

    // Build particles
    const particles = createParticleField({
        count: 30,
        sizeRange: [1, 3],
        opacityRange: [0.1, 0.25],
        distribution: 'radial'
    });

    // Build bokeh
    let bokeh = '';
    for (let i = 0; i < 5; i++) {
        const x = 100 + Math.random() * (CANVAS_WIDTH - 200);
        const y = 100 + Math.random() * (CANVAS_HEIGHT - 200);
        const r = 40 + Math.random() * 80;
        bokeh += `<circle cx="${x}" cy="${y}" r="${r}" fill="${accentColor}" fill-opacity="0.04"/>`;
    }

    const svg = `
    <svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="mainBg" cx="50%" cy="45%" r="90%">
                <stop offset="0%" style="stop-color:${bgSecondary}"/>
                <stop offset="100%" style="stop-color:${bgPrimary}"/>
            </radialGradient>
            ${mesh.defs}
        </defs>
        <rect width="100%" height="100%" fill="url(#mainBg)"/>
        ${mesh.content}
        ${bokeh}
        ${particles}
        ${createVignette({ intensity: 0.35 })}
    </svg>`;

    return await sharp(Buffer.from(svg)).png().toBuffer();
}

/**
 * Create advanced device mockup
 */
async function createAdvancedMockup({ screenshotBuffer, deviceType, hasFrame, shadow, reflection, screenGlow, accentColor }) {
    if (!hasFrame || deviceType === 'none') {
        return await createFloatingCard(screenshotBuffer, shadow);
    }

    // Device dimensions
    const devices = {
        macbook: { screen: [680, 425], frame: [730, 510], offset: [25, 25] },
        macbook_pro: { screen: [680, 425], frame: [730, 510], offset: [25, 25] },
        ipad: { screen: [600, 450], frame: [640, 490], offset: [20, 20] },
        browser: { screen: [720, 480], frame: [736, 532], offset: [8, 44] },
        phone: { screen: [280, 600], frame: [308, 656], offset: [14, 28] }
    };

    const device = devices[deviceType] || devices.macbook;
    const [screenW, screenH] = device.screen;
    const [frameW, frameH] = device.frame;
    const [offsetX, offsetY] = device.offset;

    // Create shadow filter
    const shadowFilter = shadow?.show ? createAdvancedShadow({
        id: 'mockupShadow',
        type: shadow.type || 'layered',
        intensity: shadow.opacity || 0.5,
        elevation: shadow.blur || 25
    }) : '';

    // Device-specific frame SVG
    let frameSvg = '';

    if (deviceType === 'macbook' || deviceType === 'macbook_pro') {
        const glowColor = screenGlow?.show ? accentColor : 'transparent';
        frameSvg = `
        <svg width="${frameW}" height="${frameH}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="lid" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#4a4a4c"/>
                    <stop offset="30%" style="stop-color:#3a3a3c"/>
                    <stop offset="70%" style="stop-color:#2c2c2e"/>
                    <stop offset="100%" style="stop-color:#1c1c1e"/>
                </linearGradient>
                ${shadowFilter}
            </defs>
            <g ${shadow?.show ? 'filter="url(#mockupShadow)"' : ''}>
                <rect x="0" y="0" width="${frameW}" height="${frameH - 25}" rx="14" fill="url(#lid)"/>
            </g>
            <rect x="10" y="10" width="${screenW + 30}" height="${screenH + 30}" rx="8" fill="#0a0a0a"/>
            <rect x="${offsetX}" y="${offsetY}" width="${screenW}" height="${screenH}" rx="2" fill="#000"/>
            ${screenGlow?.show ? `<rect x="${offsetX}" y="${offsetY}" width="${screenW}" height="${screenH}" rx="2" fill="${glowColor}" fill-opacity="0.08"/>` : ''}
            <rect x="${frameW / 2 - 30}" y="15" width="60" height="20" rx="4" fill="#0a0a0a"/>
            <circle cx="${frameW / 2}" cy="22" r="3" fill="#1a1a1a"/>
            <rect x="0" y="${frameH - 25}" width="${frameW}" height="25" rx="3" fill="#2a2a2c"/>
        </svg>`;
    } else if (deviceType === 'browser') {
        frameSvg = `
        <svg width="${frameW}" height="${frameH}" xmlns="http://www.w3.org/2000/svg">
            <defs>${shadowFilter}</defs>
            <rect x="0" y="0" width="${frameW}" height="${frameH}" rx="12" fill="#1e1e1e" ${shadow?.show ? 'filter="url(#mockupShadow)"' : ''}/>
            <rect x="0" y="0" width="${frameW}" height="44" rx="12" fill="#2d2d2d"/>
            <rect x="0" y="32" width="${frameW}" height="12" fill="#2d2d2d"/>
            <circle cx="22" cy="22" r="7" fill="#ff5f57"/>
            <circle cx="46" cy="22" r="7" fill="#febc2e"/>
            <circle cx="70" cy="22" r="7" fill="#28c840"/>
            <rect x="100" y="12" width="${frameW - 120}" height="24" rx="6" fill="#1a1a1a"/>
        </svg>`;
    } else if (deviceType === 'phone') {
        frameSvg = `
        <svg width="${frameW}" height="${frameH}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="phoneBody" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#3a3a3c"/>
                    <stop offset="100%" style="stop-color:#1c1c1e"/>
                </linearGradient>
                ${shadowFilter}
            </defs>
            <rect x="0" y="0" width="${frameW}" height="${frameH}" rx="36" fill="url(#phoneBody)" ${shadow?.show ? 'filter="url(#mockupShadow)"' : ''}/>
            <rect x="${offsetX}" y="${offsetY}" width="${screenW}" height="${screenH}" rx="8" fill="#000"/>
            <rect x="${frameW / 2 - 45}" y="36" width="90" height="28" rx="14" fill="#1a1a1a"/>
        </svg>`;
    } else { // ipad
        frameSvg = `
        <svg width="${frameW}" height="${frameH}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="ipadBody" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#e8e8e8"/>
                    <stop offset="100%" style="stop-color:#c8c8c8"/>
                </linearGradient>
                ${shadowFilter}
            </defs>
            <rect x="0" y="0" width="${frameW}" height="${frameH}" rx="22" fill="url(#ipadBody)" ${shadow?.show ? 'filter="url(#mockupShadow)"' : ''}/>
            <rect x="${offsetX}" y="${offsetY}" width="${screenW}" height="${screenH}" rx="4" fill="#000"/>
            <circle cx="${frameW / 2}" cy="12" r="4" fill="#888"/>
        </svg>`;
    }

    const frameBuffer = await sharp(Buffer.from(frameSvg)).png().toBuffer();
    const screenshotResized = await sharp(screenshotBuffer)
        .resize(screenW, screenH, { fit: 'cover' })
        .png()
        .toBuffer();

    return await sharp(frameBuffer)
        .composite([{ input: screenshotResized, left: offsetX, top: offsetY }])
        .png()
        .toBuffer();
}

/**
 * Create floating card (no device frame)
 */
async function createFloatingCard(screenshotBuffer, shadow) {
    const width = 700;
    const height = 450;

    const rounded = await sharp(screenshotBuffer)
        .resize(width, height, { fit: 'cover' })
        .png()
        .toBuffer();

    if (!shadow?.show) return rounded;

    const paddedW = width + 60;
    const paddedH = height + 60;

    const shadowSvg = `
    <svg width="${paddedW}" height="${paddedH}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            ${createAdvancedShadow({ id: 'cardShadow', type: 'layered', intensity: shadow.opacity || 0.5 })}
        </defs>
        <rect x="30" y="20" width="${width}" height="${height}" rx="16" fill="#000" filter="url(#cardShadow)"/>
    </svg>`;

    const shadowBuffer = await sharp(Buffer.from(shadowSvg)).png().toBuffer();

    return await sharp(shadowBuffer)
        .composite([{ input: rounded, left: 30, top: 20 }])
        .png()
        .toBuffer();
}

/**
 * Apply precision compositing
 */
async function applyPrecisionComposite({ backgroundBuffer, mockupBuffer, productSpecs, positions }) {
    if (!mockupBuffer) {
        return await sharp(backgroundBuffer).resize(CANVAS_WIDTH, CANVAS_HEIGHT).png().toBuffer();
    }

    const mockupMeta = await sharp(mockupBuffer).metadata();
    const scale = productSpecs.scale || 0.55;

    const targetWidth = Math.round(CANVAS_WIDTH * scale);
    const targetHeight = Math.round(mockupMeta.height * (targetWidth / mockupMeta.width));

    let resizedMockup = await sharp(mockupBuffer)
        .resize(targetWidth, targetHeight, { fit: 'inside' })
        .png()
        .toBuffer();

    // Apply rotation if specified
    if (productSpecs.rotation && productSpecs.rotation !== 0) {
        resizedMockup = await sharp(resizedMockup)
            .rotate(productSpecs.rotation, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toBuffer();
    }

    const resizedMeta = await sharp(resizedMockup).metadata();

    // Use positions from layout
    const productPos = positions?.product || { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT * 0.48 };
    const xPercent = productPos.x / CANVAS_WIDTH;
    const yPercent = productPos.y / CANVAS_HEIGHT;

    let left = Math.round(CANVAS_WIDTH * xPercent - resizedMeta.width / 2);
    let top = Math.round(CANVAS_HEIGHT * yPercent - resizedMeta.height / 2);

    // Keep in bounds
    left = Math.max(0, Math.min(left, CANVAS_WIDTH - resizedMeta.width));
    top = Math.max(0, Math.min(top, CANVAS_HEIGHT - resizedMeta.height));

    return await sharp(backgroundBuffer)
        .resize(CANVAS_WIDTH, CANVAS_HEIGHT)
        .composite([{ input: resizedMockup, left, top }])
        .png()
        .toBuffer();
}

/**
 * Add glass cards for floating UI
 */
async function addGlassCards(baseBuffer, features, cardPositions) {
    if (!features || !cardPositions) return baseBuffer;

    let cardsSvg = `<svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">`;

    features.slice(0, Math.min(features.length, cardPositions.length)).forEach((feature, i) => {
        const pos = cardPositions[i];
        cardsSvg += createGlassCard({
            x: pos.x - (pos.width || 180) / 2,
            y: pos.y,
            width: pos.width || 180,
            height: 65,
            title: feature.title,
            subtitle: feature.description,
            icon: feature.icon
        });
    });

    cardsSvg += '</svg>';

    const cardsBuffer = await sharp(Buffer.from(cardsSvg)).png().toBuffer();
    return await compositeBuffers(baseBuffer, cardsBuffer);
}

/**
 * Composite two buffers
 */
async function compositeBuffers(baseBuffer, overlayBuffer) {
    return await sharp(baseBuffer)
        .composite([{ input: overlayBuffer, left: 0, top: 0 }])
        .png()
        .toBuffer();
}

/**
 * Extract brand colors from image
 */
async function extractBrandColors(imageBuffer, productAnalysis) {
    try {
        const { data, info } = await sharp(imageBuffer)
            .resize(100, 100, { fit: 'cover' })
            .raw()
            .toBuffer({ resolveWithObject: true });

        const colors = {};
        for (let i = 0; i < data.length; i += info.channels) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const key = `${Math.round(r / 32) * 32},${Math.round(g / 32) * 32},${Math.round(b / 32) * 32}`;
            colors[key] = (colors[key] || 0) + 1;
        }

        const sorted = Object.entries(colors).sort((a, b) => b[1] - a[1]);
        let accentColor = '#FF4757';

        for (const [colorKey] of sorted) {
            const [r, g, b] = colorKey.split(',').map(Number);
            const saturation = Math.max(r, g, b) - Math.min(r, g, b);
            const brightness = (r + g + b) / 3;

            if (saturation > 70 && brightness > 40 && brightness < 230) {
                accentColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                break;
            }
        }

        return { primary: '#0A0A1A', accent: accentColor, text: '#FFFFFF' };
    } catch (e) {
        return { primary: '#0A0A1A', accent: '#FF4757', text: '#FFFFFF' };
    }
}

/**
 * Apply regeneration guidance adjustments
 */
function applyRegenerationGuidance(designSpecs, patternSet, guidance) {
    guidance.focusAreas.forEach(area => {
        switch (area) {
            case 'visual_effects':
                designSpecs.effects = designSpecs.effects || {};
                designSpecs.effects.backgroundEffects = designSpecs.effects.backgroundEffects || {};
                designSpecs.effects.backgroundEffects.hasBokeh = true;
                designSpecs.effects.backgroundEffects.bokehCount = 8;
                designSpecs.effects.backgroundEffects.hasParticles = true;
                break;
            case 'typography':
                designSpecs.typography = designSpecs.typography || {};
                designSpecs.typography.headline = designSpecs.typography.headline || {};
                designSpecs.typography.headline.sizePx = (designSpecs.typography.headline.sizePx || 56) * 1.1;
                designSpecs.typography.headline.hasShadow = true;
                break;
            case 'cta':
                designSpecs.typography = designSpecs.typography || {};
                designSpecs.typography.cta = designSpecs.typography.cta || {};
                designSpecs.typography.cta.hasGlow = true;
                designSpecs.typography.cta.glowIntensity = 0.6;
                break;
            case 'product':
                designSpecs.effects = designSpecs.effects || {};
                designSpecs.effects.screenGlow = { show: true, intensity: 0.15 };
                break;
        }
    });
}

export default { generateCompositeAd };
