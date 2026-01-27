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
import { analyzeReferenceAds, planAdComposition } from '../ai/foreplayDesignAnalyzer.js';
import { generateAdContent, generateFeatureCallouts, generateSocialProof } from '../ai/aiContentGenerator.js';

// NEW: Color & Typography Intelligence (Phase 1-2)
import { buildColorIntelligence } from '../ai/colorIntelligence.js';
import { buildTypographyIntelligence } from '../typography/fontMatcher.js';

// NEW: Effects Matcher (Phase 4)
import { buildEffectsIntelligence } from '../effects/effectsMatcher.js';

// NEW: Copy Intelligence (Phase 7)
import { buildCopyIntelligence } from '../copy/copyIntelligence.js';

// NEW: Premium Post-Processing (Phase 8)
import { applyAutoPolish } from '../post/premiumPostProcessor.js';

// Effects Modules
import {
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
    buildLayoutFromPlan,
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
    generateRegenerationGuidance,
    scoreReferenceSimilarity,
    detectCollisions,
    validateElementPlacements
} from '../quality/qualityScoringEngine.js';
import { solveCompositionPlan } from '../constraints/planSolver.js';

// NEW: Industry Database (1000+ industries)
import { getIndustryConfig, getVisualStyleForProduct } from '../data/industryDatabase.js';

// NEW: Creative Variant Engine (A/B variants, batch generation)
import { generateCreativeVariants, generateVariantBatch, predictVariantPerformance, generateABTestPairs, VARIANT_STRATEGIES } from '../variants/creativeVariantEngine.js';

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

// NEW: AI Design Critic (572 lines - professional design review)
import { critiqueDesign, quickQualityCheck } from '../design/aiDesignCritic.js';

// NEW: Brand DNA Extractor (483 lines - complete brand identity extraction)
import { extractBrandDNA, checkBrandConsistency } from '../design/brandDNAExtractor.js';

// NOTE: Multi-Format Export and Animation Layer are imported below with more complete exports

// NEW v13: Element Generators
import { generateAtmosphereLayer } from '../elements/decorativeOverlays.js';
import { generateGlassCard as generateGlassCardV2, generateGlassButton } from '../elements/glassmorphicComponents.js';
import { createGradientText, createGlowText, create3DText } from '../elements/enhancedTextEffects.js';
import { generateDiscountBadge, generateTrustBadge, generateFeatureBadge } from '../elements/badgeGenerator.js';
import { generateFeatureCallout, generateIconCallout } from '../elements/calloutGenerator.js';

// NEW: Master Element Orchestrator (367 lines - intelligent element selection + composition)
import {
    selectElementsForAd,
    composeElementLayers,
    generateQuickAtmosphere,
    generateQuickBadge,
    generateQuickDataViz,
    ELEMENT_PRESETS
} from '../elements/masterElementOrchestrator.js';

// NEW: Data Visualization (620 lines - charts, progress, stats, ratings)
import {
    generateProgressBar as generateDataProgressBar,
    generateCircularProgress,
    generateBarChart,
    generateDonutChart,
    generateStatCounter,
    generateStatComparison,
    generateComparisonTable,
    generateFeatureList,
    generateStarRating,
    generateTimeline
} from '../elements/dataVisualization.js';

// NEW: Shape Generator (702 lines - decorative shapes, patterns, frames)
import {
    generateCircle,
    generateRectangle,
    generatePolygon,
    generateBlob,
    generateWave,
    generateCloud,
    generateLinePattern,
    generateGrid,
    generateDotPattern,
    generateDivider,
    generateCornerAccent,
    generateFrame
} from '../elements/shapeGenerator.js';

// NEW: Animation Layer (560 lines - CSS animations for web ads)
import {
    generateAdAnimationCSS,
    createStaggeredAnimation,
    generateAnimatedSparkleSVG,
    generateFloatingParticlesSVG,
    getAnimationPreset,
    AD_ANIMATION_PRESETS
} from '../animation/animationLayer.js';

// NEW: Multi-Format Exporter (357 lines - Story/Reel/Pinterest export)
import {
    exportToFormat,
    exportToAllFormats,
    getFormatLayout,
    getFormatsForPlatform,
    AD_FORMATS as EXPORT_FORMATS
} from '../export/multiFormatExporter.js';

// Premium Prompt Builder
import { buildBackgroundPrompt, buildTypographySpecs, buildProductSpecs } from './premiumPromptBuilder.js';

// Visual Elements Generator - with new element renderers
import {
    generateVisualElements,
    compositeVisualElements,
    generatePriceTag,
    generateCountdown,
    generateProgressBar,
    generateTestimonial,
    generateHighlights,
    generateDecorations
} from './visualElementsGenerator.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Canvas
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1080;

// Quality settings - PREMIUM THRESHOLDS
const QUALITY_THRESHOLD = 8.0;         // Was 7.0 - Raised for world-class output
const MAX_REGENERATION_ATTEMPTS = 3;   // Was 2 - More attempts for perfection
const SIMILARITY_THRESHOLD = 6.0;      // Lowered from 8.5 - actual scores are 6.3-6.7, 8.5 caused infinite loops

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
    enableAdvancedEffects = true,
    strictReplica = true
}) {
    console.log('[MasterGen] 🎨 ═══════════════════════════════════════════════');
    console.log('[MasterGen] 🎨 MASTER COMPOSITE GENERATOR v10.0');
    console.log('[MasterGen] 🎨 ═══════════════════════════════════════════════');
    const startTime = Date.now();

    if (!productImageBuffer) {
        throw new Error('Product image is required for composite generation');
    }

    let regenerationAttempt = 0;
    let finalBuffer = null;
    let qualityResult = null;
    let finalAccentColor = accentColor || '#FF4757';  // Declare outside loop for proper scope
    let productAnalysis = null;
    let referenceAds = [];
    let extractedColors = { primary: '#0A0A1A', accent: accentColor || '#FF4757' };
    let deepAnalysis = null;
    let finalCompositionPlan = null;
    let similarityResult = null;
    const strictMode = strictReplica === true;
    const qualityCheckActive = strictMode ? true : enableQualityCheck;

    while (regenerationAttempt <= MAX_REGENERATION_ATTEMPTS) {
        try {
            // ════════════════════════════════════════════════════════════
            // PHASE 1: INTELLIGENCE GATHERING
            // ════════════════════════════════════════════════════════════
            console.log('[MasterGen] ▶ PHASE 1: Intelligence Gathering...');

            // Product Analysis & Foreplay Matching
            const matchResult = await matchProduct(productImageBuffer);
            productAnalysis = matchResult.analysis;
            deepAnalysis = matchResult.deepAnalysis;  // NEW: Contains visual anchors, content zones
            referenceAds = matchResult.referenceAds || [];

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

            // ════════════════════════════════════════════════════════════
            // PHASE 0: BRAND DNA EXTRACTION (483 lines of intelligence)
            // Extracts: colors, typography, personality, visual style
            // ════════════════════════════════════════════════════════════
            console.log('[MasterGen] 🧬 Extracting Brand DNA...');
            const brandDNA = await extractBrandDNA(productImageBuffer, {
                industry: industry || productAnalysis?.productType,
                productType: productAnalysis?.productType
            });

            console.log(`[MasterGen]   Brand Personality: ${brandDNA.personality?.primary || 'N/A'}`);
            console.log(`[MasterGen]   Typography Style: ${brandDNA.typography?.style || 'N/A'}`);
            console.log(`[MasterGen]   Visual Style: ${brandDNA.visualStyle?.aesthetic || 'N/A'}`);

            // ════════════════════════════════════════════════════════════
            // PHASE 1A: AI COLOR INTELLIGENCE (No hardcoded colors)
            // ════════════════════════════════════════════════════════════
            console.log('[MasterGen] 🎨 Building Color Intelligence...');
            const colorIntelligence = await buildColorIntelligence(
                productImageBuffer,
                referenceAds,
                industry || productAnalysis?.productType || 'tech'
            );
            extractedColors = colorIntelligence;
            finalAccentColor = accentColor || colorIntelligence.accent;

            console.log(`[MasterGen]   Palette Mood: ${colorIntelligence.mood}`);
            console.log(`[MasterGen]   Accent: ${colorIntelligence.accent}`);
            console.log(`[MasterGen]   Dominant: ${colorIntelligence.dominant}`);

            // Deep Foreplay Design Analysis
            const designSpecs = await analyzeReferenceAds(referenceAds, productAnalysis);
            console.log(`[MasterGen]   Design Specs: ${designSpecs.layout?.gridType || 'centered'} layout`);
            console.log(`[MasterGen]   Mood: ${designSpecs.mood?.primary || 'premium'}`);

            // ════════════════════════════════════════════════════════════
            // PHASE 1-MASTER: DESIGN INTELLIGENCE INTEGRATOR (13 STEPS!)
            // Unlocks ALL existing modules: colorScience, typography, 
            // composition, elements, overlays, animation, copy, prompts
            // ════════════════════════════════════════════════════════════
            console.log('[MasterGen] 🧠 Running Full Design Intelligence Pipeline...');
            const fullDesignIntelligence = await generateDesignIntelligence({
                foreplayAnalysis: designSpecs,
                productAnalysis: productAnalysis,
                userPrompt: userPrompt,
                industry: industry || productAnalysis?.productType,
                targetEmotion: designSpecs?.mood?.primary,
                format: 'square',
                enableVariants: false // Enable later for A/B
            });

            console.log(`[MasterGen]   ✅ 13-Step Pipeline Complete`);
            console.log(`[MasterGen]   Colors: ${fullDesignIntelligence.colors?.primary || 'N/A'}`);
            console.log(`[MasterGen]   Typography: ${fullDesignIntelligence.typography?.fontFamily || 'N/A'}`);
            console.log(`[MasterGen]   Elements: ${Object.keys(fullDesignIntelligence.elements || {}).length} types`);
            console.log(`[MasterGen]   Copy: "${fullDesignIntelligence.copy?.headline?.substring(0, 30) || 'N/A'}..."`);

            // Merge full intelligence into designSpecs
            designSpecs.fullIntelligence = fullDesignIntelligence;
            designSpecs.colors = fullDesignIntelligence.colors || designSpecs.colors;
            designSpecs.typography = {
                ...designSpecs.typography,
                ...fullDesignIntelligence.typography
            };
            designSpecs.composition = fullDesignIntelligence.composition || designSpecs.composition;
            designSpecs.overlays = fullDesignIntelligence.overlays;
            designSpecs.animation = fullDesignIntelligence.animation;
            designSpecs.prompts = fullDesignIntelligence.prompts;

            // ════════════════════════════════════════════════════════════
            // PHASE 1E: INTELLIGENT ELEMENT SELECTION (367 lines)
            // Auto-selects best elements based on industry, type, mood
            // ════════════════════════════════════════════════════════════
            console.log('[MasterGen] 🎨 Selecting Optimal Elements...');
            const selectedElements = selectElementsForAd({
                industry: industry || productAnalysis?.productType || 'tech',
                adType: productAnalysis?.productType || 'product_showcase',
                mood: designSpecs.mood?.primary || 'premium',
                // Note: compositionPlan is not yet available here - these will be refined after composition planning
                hasDiscount: false,
                hasSocialProof: false,
                hasFeatureList: false,
                hasComparison: false
            });

            console.log(`[MasterGen]   Background Elements: ${selectedElements.background?.overlays?.length || 0}`);
            console.log(`[MasterGen]   Decorative: ${selectedElements.decorative?.length || 0}`);
            console.log(`[MasterGen]   Data Viz: ${selectedElements.dataViz?.length || 0}`);
            console.log(`[MasterGen]   Badges: ${selectedElements.badges?.length || 0}`);

            // Merge selected elements into designSpecs
            designSpecs.selectedElements = selectedElements;
            designSpecs.elementPreset = ELEMENT_PRESETS[productAnalysis?.productType] || ELEMENT_PRESETS.product_showcase;


            // ════════════════════════════════════════════════════════════
            // PHASE 1B: AI TYPOGRAPHY INTELLIGENCE (No hardcoded fonts)
            // ════════════════════════════════════════════════════════════
            console.log('[MasterGen] 🔤 Building Typography Intelligence...');
            const texts = {
                headline: headline || deepAnalysis?.designRecommendations?.suggestedHeadline || 'Premium Quality',
                subheadline: tagline || '',
                cta: cta || 'Jetzt entdecken'
            };
            const typographyIntelligence = await buildTypographyIntelligence(
                texts,
                CANVAS_WIDTH,
                industry || productAnalysis?.productType || 'tech',
                referenceAds,
                colorIntelligence
            );

            console.log(`[MasterGen]   Font Style: ${typographyIntelligence.fonts.style}`);
            console.log(`[MasterGen]   Primary Font: ${typographyIntelligence.fonts.primary}`);
            console.log(`[MasterGen]   Headline Size: ${typographyIntelligence.headline.fontSize}px`);

            // Merge typography into designSpecs for downstream use
            designSpecs.typography = {
                ...designSpecs.typography,
                ...typographyIntelligence,
                colors: colorIntelligence
            };

            // ════════════════════════════════════════════════════════════
            // PHASE 1C: AI EFFECTS INTELLIGENCE (Reference-matched effects)
            // ════════════════════════════════════════════════════════════
            console.log('[MasterGen] ✨ Building Effects Intelligence...');
            const effectsIntelligence = await buildEffectsIntelligence(
                referenceAds,
                colorIntelligence
            );

            console.log(`[MasterGen]   Effect Style: ${effectsIntelligence.overallStyle}`);
            console.log(`[MasterGen]   Shadow: ${effectsIntelligence.shadow ? 'enabled' : 'none'}`);
            console.log(`[MasterGen]   Glow: ${effectsIntelligence.glow ? 'enabled' : 'none'}`);

            // Merge effects into designSpecs
            designSpecs.effects = effectsIntelligence;

            // ════════════════════════════════════════════════════════════
            // PHASE 1D: AI COPY INTELLIGENCE (Reference-matched copy)
            // ════════════════════════════════════════════════════════════
            console.log('[MasterGen] ✍️ Building Copy Intelligence...');
            const copyIntelligence = await buildCopyIntelligence(
                productAnalysis,
                referenceAds,
                industry || productAnalysis?.productType || 'tech'
            );

            console.log(`[MasterGen]   Headline: "${copyIntelligence.headline}"`);
            console.log(`[MasterGen]   CTA: "${copyIntelligence.cta}"`);

            // NOTE: Final copy (headline, tagline, CTA) is resolved in PHASE 8 with full priority chain
            // Update texts with AI-generated copy for now
            texts.headline = headline || copyIntelligence.headline;
            texts.subheadline = tagline || copyIntelligence.subheadline;
            texts.cta = cta || copyIntelligence.cta;

            // NEW: AI Creative Director - Plan final composition
            let compositionPlan = null;
            if (deepAnalysis && designSpecs) {
                compositionPlan = await planAdComposition(
                    designSpecs,
                    deepAnalysis,
                    productAnalysis,
                    userPrompt,
                    industry,
                    { strictReplica: strictMode }
                );
                if (strictMode) {
                    compositionPlan = solveCompositionPlan(compositionPlan, deepAnalysis);
                }
                finalCompositionPlan = compositionPlan;
                console.log(`[MasterGen] 🧠 AI Composition Plan:`);
                console.log(`[MasterGen]   Headline: "${compositionPlan?.headline?.text?.substring(0, 25) || 'N/A'}..."`);
                console.log(`[MasterGen]   Callouts: ${compositionPlan?.callouts?.length || 0}`);
                console.log(`[MasterGen]   Badges: ${compositionPlan?.badges?.length || 0}`);

                // NEW: Validate composition before rendering
                const collisions = detectCollisions(compositionPlan, { width: 1080, height: 1080 });
                const violations = validateElementPlacements(compositionPlan, deepAnalysis, { width: 1080, height: 1080 });

                if (collisions.length > 0 || violations.length > 0) {
                    console.log(`[MasterGen] ⚠️ VALIDATION ISSUES DETECTED:`);
                    collisions.forEach(c => console.log(`[MasterGen]   Collision: ${c.element1} ↔ ${c.element2} (${c.overlapPercent}%)`));
                    violations.forEach(v => console.log(`[MasterGen]   Violation: ${v.element} in ${v.zone} - ${v.reason}`));
                } else {
                    console.log(`[MasterGen] ✅ Composition validated - no collisions or violations`);
                }
            }
            if (strictMode && !compositionPlan) {
                throw new Error('Composition plan required for strict replica mode');
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

            const layout = strictMode && compositionPlan
                ? buildLayoutFromPlan(compositionPlan, designSpecs)
                : selectOptimalLayout({
                    productAnalysis,
                    designSpecs,
                    contentPackage,
                    referenceAds
                });
            if (!layout) {
                throw new Error('Failed to resolve layout');
            }
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

            // NEW: Use colors from AI analysis if available
            let enhancedAccentColor = finalAccentColor;
            if (deepAnalysis?.colorPalette?.accent) {
                enhancedAccentColor = deepAnalysis.colorPalette.accent;
                console.log(`[MasterGen]   Using screenshot accent: ${enhancedAccentColor}`);
            }
            if (compositionPlan?.background?.primaryColor) {
                console.log(`[MasterGen]   Background style: ${compositionPlan.background.style}`);
            }

            const backgroundPrompt = buildBackgroundPrompt(designSpecs, productAnalysis, enhancedAccentColor);
            console.log(`[MasterGen]   Prompt: ${backgroundPrompt.length} characters`);

            let backgroundBuffer = await generatePremiumBackground(backgroundPrompt, enhancedAccentColor, designSpecs);
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
            if (strictMode && compositionPlan?.product) {
                applyPlanToProductSpecs(productSpecs, compositionPlan.product);
            }
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

            // Generate and composite visual elements (now with smart filtering from AI plans)
            // Pass both deepAnalysis AND compositionPlan for maximum intelligence
            const visualElements = await generateVisualElements(
                designSpecs,
                productAnalysis,
                finalAccentColor,
                deepAnalysis,
                compositionPlan,  // NEW: AI-planned elements take priority
                strictMode
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

            // PRIORITY ORDER: User Input > AI compositionPlan > contentPackage > defaults
            // compositionPlan contains AI-driven decisions based on Foreplay + deepAnalysis
            const finalHeadline = headline ||  // 1. User provided
                compositionPlan?.headline?.text ||  // 2. AI planned (NEW!)
                contentPackage?.headlines?.primary ||  // 3. Content generator
                productAnalysis?.suggestedHeadlines?.[0] ||  // 4. Product analysis
                'Premium Quality';  // 5. Fallback

            const finalTagline = tagline ||
                compositionPlan?.subheadline?.text ||  // AI planned (NEW!)
                contentPackage?.taglines?.primary;

            const finalCTA = cta ||
                compositionPlan?.cta?.text ||  // AI planned (NEW!)
                contentPackage?.ctas?.primary ||
                'Shop Now';

            // Use AI-planned badges if available, otherwise smart filter from designSpecs
            // compositionPlan.badges is curated by AI to prevent clutter
            const finalBadges = compositionPlan?.badges?.length > 0
                ? compositionPlan.badges
                : [];  // Default to NO badges if AI didn't plan any

            // Use AI-planned callouts with specific positions
            const finalCallouts = compositionPlan?.callouts || [];

            // Social proof only if AI planned it or it makes sense
            const shouldShowSocialProof = compositionPlan?.badges?.some(b => b.type === 'rating') ||
                (contentPackage?.trustIndicators?.rating && !compositionPlan?.excludeFromDesign?.includes('social_proof'));

            console.log(`[MasterGen] 📋 Using AI Plan:`);
            console.log(`[MasterGen]   Headline: "${finalHeadline.substring(0, 30)}..."`);
            console.log(`[MasterGen]   CTA: "${finalCTA}"`);
            console.log(`[MasterGen]   Badges: ${finalBadges.length}`);
            console.log(`[MasterGen]   Callouts: ${finalCallouts.length}`);
            console.log(`[MasterGen]   Social Proof: ${shouldShowSocialProof}`);

            // Build complete typography layer with AI-planned elements
            const typographySvg = buildTypographyLayer({
                headline: finalHeadline,
                tagline: finalTagline,
                cta: finalCTA,
                features: finalCallouts.length > 0
                    ? finalCallouts.map(c => ({ text: c.text, position: c.position }))
                    : contentPackage?.features?.slice(0, compositionPlan?.designRecommendations?.maxCallouts || 6) || [],
                socialProof: shouldShowSocialProof ? {
                    show: true,
                    type: 'rating',
                    rating: contentPackage?.trustIndicators?.rating?.score || 4.9,
                    count: contentPackage?.trustIndicators?.reviews?.count || '2,500'
                } : { show: false },
                badges: finalBadges,
                designSpecs,
                accentColor: compositionPlan?.cta?.primaryColor || finalAccentColor,
                compositionPlan  // Pass full plan for advanced positioning
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
            // AI COMPOSITION SUMMARY
            // ════════════════════════════════════════════════════════════
            if (compositionPlan) {
                console.log('[MasterGen] ═══════════════════════════════════════');
                console.log('[MasterGen] 🧠 AI COMPOSITION SUMMARY:');
                console.log(`[MasterGen]   ├─ Headline: ${compositionPlan.headline?.text?.substring(0, 40) || 'N/A'}...`);
                console.log(`[MasterGen]   ├─ CTA: ${compositionPlan.cta?.text || 'N/A'} @ ${Math.round((compositionPlan.cta?.position?.yPercent || 0.88) * 100)}%`);
                console.log(`[MasterGen]   ├─ Callouts: ${compositionPlan.callouts?.length || 0}`);
                console.log(`[MasterGen]   ├─ Badges: ${compositionPlan.badges?.length || 0}`);
                console.log(`[MasterGen]   ├─ Excluded: ${compositionPlan.excludeFromDesign?.slice(0, 3).join(', ') || 'none'}`);
                console.log(`[MasterGen]   └─ Rationale: ${compositionPlan.designRationale?.substring(0, 50) || 'N/A'}...`);
                console.log('[MasterGen] ═══════════════════════════════════════');
            }

            // ════════════════════════════════════════════════════════════
            // PHASE 10: QUALITY VERIFICATION
            // ════════════════════════════════════════════════════════════
            if (qualityCheckActive) {
                console.log('[MasterGen] ▶ PHASE 10: Quality Verification...');

                qualityResult = await scoreAdQuality({
                    imageBuffer: finalBuffer,
                    designSpecs,
                    contentPackage,
                    productAnalysis,
                    referenceAds,
                    strictReplica: strictMode
                });

                console.log(`[MasterGen]   Score: ${qualityResult.overallScore}/10 (${qualityResult.tier})`);
                console.log(`[MasterGen]   Strengths: ${qualityResult.strengths?.slice(0, 2).join(', ') || 'N/A'}`);

                // ════════════════════════════════════════════════════════════
                // PHASE 10B: AI DESIGN CRITIQUE (572 lines - professional review)
                // Multi-dimensional: hierarchy, typography, color, composition
                // ════════════════════════════════════════════════════════════
                console.log('[MasterGen] 🎨 Running AI Design Critique...');
                const designCritique = await critiqueDesign(finalBuffer, designSpecs, brandDNA);

                console.log(`[MasterGen]   Critique Score: ${designCritique.overallScore}/10`);
                console.log(`[MasterGen]   Grade: ${designCritique.grade || 'N/A'}`);
                if (designCritique.improvements?.length > 0) {
                    console.log(`[MasterGen]   Top Fix: ${designCritique.improvements[0]?.suggestion || 'N/A'}`);
                }

                // Check brand consistency
                const brandCheck = checkBrandConsistency(designSpecs, brandDNA);
                console.log(`[MasterGen]   Brand Consistency: ${brandCheck.isConsistent ? '✅' : '⚠️'} ${Math.round(brandCheck.score * 100)}%`);

                // Merge critique into quality result
                qualityResult.critique = designCritique;
                qualityResult.brandConsistency = brandCheck;


                if (qualityResult.needsRegeneration && regenerationAttempt < MAX_REGENERATION_ATTEMPTS) {
                    console.log(`[MasterGen]   ⚠ Quality below threshold, regenerating (attempt ${regenerationAttempt + 2})...`);
                    regenerationAttempt++;
                    continue;
                }

                if (strictMode) {
                    similarityResult = await scoreReferenceSimilarity({
                        imageBuffer: finalBuffer,
                        referenceAds
                    });
                    console.log(`[MasterGen]   Similarity: ${similarityResult.score}/10`);

                    if (similarityResult.score < SIMILARITY_THRESHOLD && regenerationAttempt < MAX_REGENERATION_ATTEMPTS) {
                        console.log(`[MasterGen]   ⚠ Similarity below threshold, regenerating (attempt ${regenerationAttempt + 2})...`);
                        regenerationAttempt++;
                        continue;
                    }
                    if (similarityResult.score < SIMILARITY_THRESHOLD) {
                        throw new Error(`Reference similarity below threshold: ${similarityResult.score}`);
                    }
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

    // ════════════════════════════════════════════════════════════
    // FINAL PHASE: PREMIUM POST-PROCESSING (Agency-Quality Finish)
    // ════════════════════════════════════════════════════════════
    console.log('[MasterGen] ✨ Applying Premium Polish...');
    const polishedBuffer = await applyAutoPolish(
        finalBuffer,
        extractedColors,
        extractedColors?.mood || 'vibrant'
    );
    finalBuffer = polishedBuffer;
    console.log('[MasterGen]   Premium polish applied ✓');

    console.log('[MasterGen] ═══════════════════════════════════════════════');
    console.log(`[MasterGen] ✅ COMPLETE in ${duration}ms`);
    console.log(`[MasterGen]   Quality: ${qualityResult?.overallScore || 'N/A'}/10`);
    console.log(`[MasterGen]   Similarity: ${similarityResult?.score || 'N/A'}/10`);
    console.log('[MasterGen] ═══════════════════════════════════════════════');

    return {
        buffer: finalBuffer,
        duration,
        qualityScore: qualityResult?.overallScore || 0,
        qualityTier: qualityResult?.tier || 'unknown',
        qualityDetails: qualityResult,
        regenerationAttempts: regenerationAttempt,
        referenceCount: referenceAds.length,
        compositionPlan: finalCompositionPlan,
        similarityScore: similarityResult?.score || 0,
        similarityDetails: similarityResult,
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
    const fallbackPos = positions?.product || { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT * 0.48 };
    const xPercent = typeof productSpecs?.position?.xPercent === 'number'
        ? productSpecs.position.xPercent
        : fallbackPos.x / CANVAS_WIDTH;
    const yPercent = typeof productSpecs?.position?.yPercent === 'number'
        ? productSpecs.position.yPercent
        : fallbackPos.y / CANVAS_HEIGHT;

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
        throw new Error(`Failed to extract brand colors: ${e.message}`);
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

function applyPlanToProductSpecs(productSpecs, planProduct) {
    if (planProduct?.position) {
        if (Number.isFinite(planProduct.position.xPercent)) {
            productSpecs.position.xPercent = planProduct.position.xPercent;
        }
        if (Number.isFinite(planProduct.position.yPercent)) {
            productSpecs.position.yPercent = planProduct.position.yPercent;
        }
    }

    if (Number.isFinite(planProduct?.scale)) {
        productSpecs.scale = clamp(planProduct.scale, 0.2, 0.9);
    }

    if (Number.isFinite(planProduct?.rotation)) {
        productSpecs.rotation = clamp(planProduct.rotation, -25, 25);
    }

    if (typeof planProduct?.addShadow === 'boolean') {
        productSpecs.shadow.show = planProduct.addShadow;
    }
    if (typeof planProduct?.addReflection === 'boolean') {
        productSpecs.reflection.show = planProduct.addReflection;
    }
    if (typeof planProduct?.addGlow === 'boolean') {
        productSpecs.screenGlow.show = planProduct.addGlow;
    }

    if (planProduct?.mockupType) {
        const mockupType = String(planProduct.mockupType);
        const supported = new Set(['macbook_pro', 'macbook', 'phone', 'ipad', 'browser']);
        if (mockupType === 'floating' || mockupType === 'none') {
            productSpecs.device.type = 'none';
            productSpecs.device.hasFrame = false;
        } else if (supported.has(mockupType)) {
            productSpecs.device.type = mockupType;
            productSpecs.device.hasFrame = true;
        } else {
            throw new Error(`Unsupported mockupType in composition plan: ${mockupType}`);
        }
    }
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export default { generateCompositeAd };
