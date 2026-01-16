/**
 * Ultimate Master Integration Engine
 * Unifies ALL 30+ intelligence modules into one cohesive system
 * This is the BRAIN that orchestrates the entire ad creation system
 */

// Core Intelligence Modules
import { getIndustryPack, detectIndustry, applyIndustryToPrompt } from '../industryIntelligence.js';
import { buildOptimalPalette, describePaletteForPrompt } from '../colorHarmonyEngine.js';
import { getAdLayout, recommendLayouts, AD_LAYOUTS } from '../adLayoutTemplates.js';
import { getExtendedLayout, EXTENDED_LAYOUTS, generateVariations, calculateCreativeScore } from '../extendedLayouts.js';
import { recommendFontPairing, buildTypographyPrompt } from '../typographyPairings.js';

// Phase 7 Modules
import { getFramework, recommendFramework, generateCopyStructure } from '../conversionPsychology.js';
import { getPersona, detectPersona, buildAudiencePrompt } from '../audiencePersonas.js';
import { getPlatform, buildPlatformPrompt, getSafeZones } from '../platformOptimization.js';
import { predictPerformance, compareToIndustry } from '../performancePrediction.js';
import { generateHeadline, generateCTA, generateHook, generateCopyKit } from '../dynamicContentGenerator.js';
import { getCurrentSeason, recommendTrends, buildSeasonalPrompt } from '../seasonalIntelligence.js';
import { recommendArchetype, buildBrandVoicePrompt } from '../brandVoiceEngine.js';
import { buildVisualHierarchyPrompt, recommendPattern } from '../visualHierarchy.js';

// Phase 8 Vertical Modules
import { getEcommerceCategory, buildEcommercePrompt } from './ecommerceIntelligence.js';
import { getSaaSModel, buildSaaSPrompt } from './saasIntelligence.js';
import { getInsuranceProduct, buildInsurancePrompt } from './insuranceFinanceIntelligence.js';
import { getCoachingNiche, buildCoachingPrompt } from './coachingIntelligence.js';
import { getCourseType, buildCoursePrompt } from './courseSellerIntelligence.js';
import { buildDropshippingPrompt } from './dropshippingIntelligence.js';
import { getAgencyService, buildAgencyPrompt } from './agencyIntelligence.js';
import { buildRealEstatePrompt, buildLocalBusinessPrompt, REAL_ESTATE, HEALTHCARE, B2B_ENTERPRISE, LOCAL_BUSINESS } from './additionalVerticals1.js';
import { buildEventPrompt, buildLeadMagnetPrompt, EVENTS_TICKETS, SUBSCRIPTION_BOX, APP_DOWNLOAD, LEAD_MAGNET, WEBINAR_VSL } from './additionalVerticals2.js';
import { buildPricingPrompt, PRICING_TACTICS } from './pricePsychology.js';
import { buildObjectionPrompt, getObjectionHandlers, GUARANTEE_TYPES } from './objectionHandler.js';
import { buildRetargetingPrompt, getRetargetingSegment } from './retargetingIntelligence.js';

/**
 * Vertical Type Detection
 */
const VERTICAL_KEYWORDS = {
    ecommerce: ['shop', 'product', 'buy', 'store', 'selling', 'inventory', 'cart'],
    saas: ['software', 'app', 'platform', 'tool', 'subscription', 'trial', 'demo'],
    insurance: ['insurance', 'coverage', 'policy', 'broker', 'versicherung'],
    coaching: ['coach', 'consulting', 'mentor', 'transformation', 'program'],
    course: ['course', 'training', 'learn', 'education', 'certification', 'kurs'],
    dropshipping: ['dropship', 'trending', 'viral product', 'import'],
    agency: ['agency', 'design', 'marketing', 'web development', 'agentur'],
    realestate: ['real estate', 'property', 'home', 'listing', 'immobilien'],
    healthcare: ['health', 'medical', 'clinic', 'doctor', 'dental', 'therapy'],
    b2b: ['enterprise', 'b2b', 'business', 'corporate', 'solution'],
    local: ['local', 'restaurant', 'store', 'near me', 'lokal'],
    event: ['event', 'conference', 'workshop', 'webinar', 'live'],
    subscription: ['subscription', 'box', 'monthly', 'delivered'],
    app: ['app', 'download', 'mobile', 'install'],
    leadmagnet: ['free', 'guide', 'ebook', 'checklist', 'template'],
};

/**
 * Detect vertical from description
 */
function detectVertical(description) {
    const desc = (description || '').toLowerCase();

    for (const [vertical, keywords] of Object.entries(VERTICAL_KEYWORDS)) {
        for (const keyword of keywords) {
            if (desc.includes(keyword)) {
                return vertical;
            }
        }
    }

    return 'ecommerce'; // Default
}

/**
 * ULTIMATE MASTER ENGINE
 * The one function that orchestrates everything
 */
export function ultimateMasterEngine(inputs) {
    console.log('[Ultimate Engine] Starting comprehensive ad generation...');

    const {
        // Product/Service info
        productName,
        productDescription,
        productImageUrl,
        visionDescription,

        // Business context
        industry: userIndustry,
        vertical: userVertical,
        businessModel,

        // Target audience
        targetAudience,
        persona: userPersona,

        // Goals
        goal = 'conversion',
        objective = 'purchase', // purchase, lead, awareness, engagement

        // Preferences
        tone = 'professional',
        language = 'de',
        platform = 'instagram_feed',

        // Content overrides
        headline: userHeadline,
        subheadline,
        features = [],
        cta: userCta,
        badge,
        testimonial,
        price,
        originalPrice,

        // Special modes
        isRetargeting = false,
        retargetingSegment,
        isSeasonalCampaign = false,

        // Specific overrides
        layoutId: userLayoutId,
        colorOverride,
        fontPairingId,
        conversionFramework: userFramework,
        archetypeId: userArchetype,
        visualPattern: userPattern,
    } = inputs;

    // ========================================
    // STEP 1: DETECT VERTICAL & INDUSTRY
    // ========================================
    const vertical = userVertical || detectVertical(productDescription);
    const industry = userIndustry || detectIndustry(productDescription || productName);
    const industryPack = getIndustryPack(industry);

    console.log(`[Ultimate Engine] Vertical: ${vertical}, Industry: ${industry}`);

    // ========================================
    // STEP 2: AUDIENCE INTELLIGENCE
    // ========================================
    const persona = userPersona
        ? getPersona(userPersona)
        : detectPersona(targetAudience);
    const audiencePrompt = persona ? buildAudiencePrompt(persona) : '';

    console.log(`[Ultimate Engine] Persona: ${persona?.name || 'Generic'}`);

    // ========================================
    // STEP 3: CONVERSION FRAMEWORK
    // ========================================
    const framework = userFramework
        ? getFramework(userFramework)
        : recommendFramework({
            goal: goal,
            industry: industry,
            isPainPoint: productDescription?.toLowerCase().includes('problem') ||
                productDescription?.toLowerCase().includes('struggle'),
            hasTestimonial: !!testimonial,
        });

    const copyStructure = generateCopyStructure(framework.id, {
        product: productName,
        benefit: features[0] || 'amazing results',
        audience: targetAudience || persona?.name,
        pain: productDescription,
    });

    console.log(`[Ultimate Engine] Framework: ${framework.name}`);

    // ========================================
    // STEP 4: BRAND VOICE
    // ========================================
    const archetype = userArchetype
        ? { id: userArchetype }
        : recommendArchetype(industry, tone);
    const brandVoicePrompt = buildBrandVoicePrompt(archetype.id, tone);

    console.log(`[Ultimate Engine] Brand Archetype: ${archetype.id}`);

    // ========================================
    // STEP 5: COLOR INTELLIGENCE
    // ========================================
    const colorPalette = buildOptimalPalette({
        industry: industry,
        goal: goal,
        brandColor: colorOverride,
        mood: tone === 'playful' ? 'energetic' : tone === 'premium' ? 'elegant' : 'balanced',
    });

    console.log(`[Ultimate Engine] Colors: ${colorPalette.primary} (${colorPalette.harmonyType})`);

    // ========================================
    // STEP 6: LAYOUT SELECTION
    // ========================================
    let selectedLayout;
    if (userLayoutId) {
        selectedLayout = getAdLayout(userLayoutId) || getExtendedLayout(userLayoutId);
    } else {
        // Smart selection based on content
        const allLayouts = { ...AD_LAYOUTS, ...EXTENDED_LAYOUTS };
        const scoredLayouts = [];

        for (const [id, layout] of Object.entries(allLayouts)) {
            let score = 0;

            // Feature-based matching
            if (features.length >= 4 && (id.includes('callout') || id.includes('grid'))) score += 25;
            if (features.length === 3 && (id.includes('checklist') || id.includes('steps'))) score += 25;
            if (features.length <= 2 && (id.includes('hero') || id.includes('minimal'))) score += 25;

            // Goal-based matching
            if (goal === 'sale' && (id.includes('sale') || id.includes('urgency'))) score += 30;
            if (goal === 'trust' && (id.includes('testimonial') || id.includes('review'))) score += 25;
            if (goal === 'awareness' && (id.includes('lifestyle') || id.includes('editorial'))) score += 20;

            // Vertical-based matching
            if (vertical === 'coaching' && (id.includes('testimonial') || id.includes('expert'))) score += 20;
            if (vertical === 'ecommerce' && (id.includes('product') || id.includes('feature'))) score += 20;
            if (vertical === 'saas' && (id.includes('stats') || id.includes('minimal'))) score += 20;

            scoredLayouts.push({ id, layout, score });
        }

        scoredLayouts.sort((a, b) => b.score - a.score);
        selectedLayout = scoredLayouts[0]?.layout || AD_LAYOUTS.feature_callout_arrows;
    }

    console.log(`[Ultimate Engine] Layout: ${selectedLayout?.id}`);

    // ========================================
    // STEP 7: TYPOGRAPHY
    // ========================================
    const fontPairing = fontPairingId
        ? { id: fontPairingId }
        : recommendFontPairing(industry);
    const typographyPrompt = buildTypographyPrompt(fontPairing.id);

    console.log(`[Ultimate Engine] Typography: ${fontPairing.id}`);

    // ========================================
    // STEP 8: PLATFORM OPTIMIZATION
    // ========================================
    const platformSpec = getPlatform(platform);
    const platformPrompt = buildPlatformPrompt(platform);
    const safeZones = getSafeZones(platform);

    console.log(`[Ultimate Engine] Platform: ${platformSpec.name}`);

    // ========================================
    // STEP 9: VISUAL HIERARCHY
    // ========================================
    const visualPattern = userPattern
        ? { id: userPattern }
        : recommendPattern(features.length >= 3 ? 'feature-callout' : 'product-hero');
    const visualHierarchyPrompt = buildVisualHierarchyPrompt(visualPattern.id, {
        primaryElement: productName,
        secondaryElements: features.slice(0, 3),
        cta: userCta,
    });

    console.log(`[Ultimate Engine] Visual Pattern: ${visualPattern.id}`);

    // ========================================
    // STEP 10: SEASONAL/TREND CONTEXT
    // ========================================
    let seasonalPrompt = '';
    if (isSeasonalCampaign) {
        const currentSeason = getCurrentSeason();
        seasonalPrompt = buildSeasonalPrompt(currentSeason.id);
        console.log(`[Ultimate Engine] Season: ${currentSeason.name}`);
    }

    // ========================================
    // STEP 11: VERTICAL-SPECIFIC INTELLIGENCE
    // ========================================
    let verticalPrompt = '';
    switch (vertical) {
        case 'ecommerce':
            verticalPrompt = buildEcommercePrompt(industry, { showUrgency: goal === 'sale' });
            break;
        case 'saas':
            verticalPrompt = buildSaaSPrompt(businessModel || 'free_trial');
            break;
        case 'insurance':
            verticalPrompt = buildInsurancePrompt(businessModel || 'life_insurance');
            break;
        case 'coaching':
            verticalPrompt = buildCoachingPrompt(businessModel || 'business_coach');
            break;
        case 'course':
            verticalPrompt = buildCoursePrompt(businessModel || 'signature_course');
            break;
        case 'dropshipping':
            verticalPrompt = buildDropshippingPrompt(industry);
            break;
        case 'agency':
            verticalPrompt = buildAgencyPrompt(businessModel || 'web_design');
            break;
        case 'realestate':
            verticalPrompt = buildRealEstatePrompt(businessModel || 'residential');
            break;
        case 'local':
            verticalPrompt = buildLocalBusinessPrompt(businessModel || 'service');
            break;
        case 'event':
            verticalPrompt = buildEventPrompt(businessModel || 'conference');
            break;
        case 'leadmagnet':
            verticalPrompt = buildLeadMagnetPrompt(businessModel || 'ebook');
            break;
    }

    console.log(`[Ultimate Engine] Vertical prompt applied: ${vertical}`);

    // ========================================
    // STEP 12: RETARGETING MODE
    // ========================================
    let retargetingPrompt = '';
    if (isRetargeting && retargetingSegment) {
        retargetingPrompt = buildRetargetingPrompt(retargetingSegment);
        console.log(`[Ultimate Engine] Retargeting: ${retargetingSegment}`);
    }

    // ========================================
    // STEP 13: PRICE PSYCHOLOGY
    // ========================================
    let pricingPrompt = '';
    if (price) {
        const pricingTactic = originalPrice ? 'anchoring' : 'charm_pricing';
        pricingPrompt = buildPricingPrompt(pricingTactic, { originalPrice, salePrice: price });
    }

    // ========================================
    // STEP 14: DYNAMIC CONTENT GENERATION
    // ========================================
    const dynamicContent = generateCopyKit({
        product: productName,
        benefit: features[0],
        audience: targetAudience || persona?.name,
        goal: goal,
        tone: tone,
        isUrgent: goal === 'sale',
        hasSocialProof: !!testimonial || !!badge,
        language: language,
    });

    const finalHeadline = userHeadline || dynamicContent.headline.generated;
    const finalCta = userCta || dynamicContent.cta.primary;

    // ========================================
    // STEP 15: BUILD ULTIMATE PROMPT
    // ========================================
    const ultimatePrompt = buildUltimatePrompt({
        // Layout template
        layoutTemplate: selectedLayout?.promptTemplate || '',

        // Product
        product: {
            name: productName,
            description: productDescription,
            visionDescription: visionDescription,
        },

        // Content
        content: {
            headline: finalHeadline,
            subheadline: subheadline,
            features: features,
            cta: finalCta,
            badge: badge,
        },

        // Intelligence prompts
        intelligencePrompts: {
            industry: industryPack.promptEnhancement,
            audience: audiencePrompt,
            brandVoice: brandVoicePrompt,
            typography: typographyPrompt,
            colors: describePaletteForPrompt(colorPalette),
            visualHierarchy: visualHierarchyPrompt,
            platform: platformPrompt,
            vertical: verticalPrompt,
            seasonal: seasonalPrompt,
            retargeting: retargetingPrompt,
            pricing: pricingPrompt,
            framework: copyStructure.copyInstructions,
        },
    });

    // ========================================
    // STEP 16: GENERATE VARIATIONS
    // ========================================
    const variations = generateVariations({
        layoutId: selectedLayout?.id,
        industry: industry,
        goal: goal,
    }, 3);

    // ========================================
    // STEP 17: PREDICT PERFORMANCE
    // ========================================
    const performancePrediction = predictPerformance({
        headline: finalHeadline,
        features: features,
        badge: badge,
        cta: finalCta,
        productImageUrl: productImageUrl,
        visionDescription: visionDescription,
        industry: industry,
        targetAudience: targetAudience,
        personaMatch: !!persona,
        platformOptimized: true,
    });

    const industryComparison = compareToIndustry(performancePrediction, industry);

    console.log(`[Ultimate Engine] Performance prediction: ${performancePrediction.score}/100 (${performancePrediction.grade})`);

    // ========================================
    // RETURN COMPLETE CREATIVE SPECIFICATION
    // ========================================
    return {
        // Primary output
        imagePrompt: ultimatePrompt,

        // Metadata
        metadata: {
            vertical: vertical,
            industry: industry,
            industryPack: industryPack.name,
            persona: persona?.name,
            framework: framework.name,
            archetype: archetype.id,
            layout: selectedLayout?.id,
            layoutName: selectedLayout?.name,
            colorPalette: {
                primary: colorPalette.primary,
                secondary: colorPalette.secondary,
                accent: colorPalette.accent,
                harmony: colorPalette.harmonyType,
            },
            typography: fontPairing.id,
            platform: platformSpec.name,
            visualPattern: visualPattern.id,
        },

        // Generated content
        content: {
            headline: finalHeadline,
            subheadline: subheadline || dynamicContent.hook.generated,
            cta: finalCta,
            hook: dynamicContent.hook.generated,
        },

        // Variations for A/B testing
        variations: variations,

        // Performance prediction
        performance: {
            ...performancePrediction,
            industryComparison: industryComparison,
        },

        // Copy framework
        copyFramework: {
            name: framework.name,
            structure: copyStructure,
        },

        // Recommendations
        recommendations: {
            improvements: performancePrediction.improvements,
            layouts: recommendLayouts(industry, goal, features.length),
            triggers: industryPack.triggers,
            objections: getObjectionHandlers('too_expensive').handlers.slice(0, 2),
            guarantees: [GUARANTEE_TYPES.money_back, GUARANTEE_TYPES.satisfaction_guarantee],
        },
    };
}

/**
 * Build the ultimate combined prompt
 */
function buildUltimatePrompt(config) {
    const { layoutTemplate, product, content, intelligencePrompts } = config;

    // Start with layout template
    let prompt = layoutTemplate || 'Professional advertisement creative';

    // Replace product placeholders
    const productDesc = product.visionDescription || product.description || product.name;
    prompt = prompt.replace(/\{PRODUCT\}/g, productDesc);
    prompt = prompt.replace(/\{PRODUCT_DESCRIPTION\}/g, productDesc);
    prompt = prompt.replace(/\{HEADLINE\}/g, content.headline || product.name);
    prompt = prompt.replace(/\{CTA\}/g, content.cta);
    prompt = prompt.replace(/\{BADGE_TEXT\}/g, content.badge || '');

    // Replace features
    content.features.forEach((feature, index) => {
        prompt = prompt.replace(`{FEATURE_${index + 1}}`, feature);
        prompt = prompt.replace(`{BENEFIT_${index + 1}}`, feature);
    });

    // Clean unreplaced placeholders
    prompt = prompt.replace(/\{[A-Z_0-9]+\}/g, '');

    // Add all intelligence layers
    prompt += '\n\n' + [
        intelligencePrompts.industry,
        intelligencePrompts.audience,
        intelligencePrompts.brandVoice,
        intelligencePrompts.vertical,
        intelligencePrompts.visualHierarchy,
        intelligencePrompts.typography,
        intelligencePrompts.colors,
        intelligencePrompts.platform,
        intelligencePrompts.seasonal,
        intelligencePrompts.retargeting,
        intelligencePrompts.pricing,
    ].filter(Boolean).join('\n\n');

    // Add universal quality standards
    prompt += `

## ULTIMATE QUALITY STANDARDS (Non-Negotiable)

### This MUST look like a $100,000 agency production:
- Magazine-grade visual quality
- Perfect typography (ZERO errors)
- Professional lighting and composition
- Every element intentional
- Mobile-first (looks perfect on phone)

### Product Integrity:
${product.visionDescription ? `PRESERVE EXACTLY: ${product.visionDescription}` : 'Show product prominently'}

### Conversion Optimization:
- Clear visual hierarchy guiding to CTA
- Headline readable in under 1 second
- CTA button/text unmistakably clear
- Scroll-stopping within 0.5 seconds
`;

    return prompt.trim();
}

/**
 * Quick engine for simple requests
 */
export function quickEngine(productName, productDescription, options = {}) {
    return ultimateMasterEngine({
        productName,
        productDescription,
        ...options,
    });
}

/**
 * Export all modules for direct access
 */
export { detectVertical, VERTICAL_KEYWORDS };
