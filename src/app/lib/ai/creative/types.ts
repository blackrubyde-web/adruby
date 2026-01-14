/**
 * CREATIVE SPEC SYSTEM - TYPE DEFINITIONS
 * 
 * Core types for the CreativeSpec blueprint system.
 * CreativeSpec is the "brain" output from LLM that drives deterministic assembly.
 */

import { z } from 'zod';

// ============================================================================
// BUSINESS MODEL & CREATIVE TAXONOMY
// ============================================================================

export const BUSINESS_MODELS = [
    'ecommerce',
    'saas',
    'local',
    'coach',
    'agency',
    'info'
] as const;

export type BusinessModel = typeof BUSINESS_MODELS[number];

export const CREATIVE_ANGLES = [
    'pain_relief',
    'desire',
    'social_proof',
    'urgency',
    'authority',
    'gift',
    'demo',
    'before_after',
    'comparison',
    'price_anchor',
    'offer'  // HOTFIX: AI was generating this, add to valid enums
] as const;

export type CreativeAngle = typeof CREATIVE_ANGLES[number];

export const CREATIVE_PATTERNS = [
    // E-Commerce patterns
    'ecommerce_product_focus',
    'ecommerce_offer_burst',
    'ecommerce_ugc_frame',
    'ecommerce_before_after',
    'ecommerce_benefit_stack',
    'ecommerce_giftable',
    'ecommerce_comparison',
    'ecommerce_feature_stack', // NEW: For Scatter/Exploded templates

    // SaaS patterns
    'saas_ui_proof',
    'saas_whatsapp_flow',
    'saas_time_saving',
    'saas_lead_capture',
    'saas_workflow_steps',
    'saas_feature_grid', // NEW: For 4-Step Grid templates

    // Local/Gastro patterns
    'local_menu_feature',
    'local_map_hours',
    'local_offer_coupon',
    'local_social_proof',

    // Coach/Expert patterns
    'coach_authority_slide',
    'coach_transformation',
    'coach_testimonial',

    // Agency/B2B Services patterns
    'agency_results_card',
    'agency_case_study',
    'agency_offer_audit',

    // Info/Education patterns
    'info_curriculum',
    'info_outcomes',
    'info_webinar'
] as const;

export type CreativePattern = typeof CREATIVE_PATTERNS[number];

export const PLATFORMS = [
    'meta_feed',
    'meta_story',
    'tiktok_feed',
    'google_display'
] as const;

export type Platform = typeof PLATFORMS[number];

export const RATIOS = ['1:1', '4:5', '9:16'] as const;
export type Ratio = typeof RATIOS[number];

export const SOPHISTICATION_LEVELS = [
    'unaware',
    'problem_aware',
    'solution_aware',
    'product_aware'
] as const;

export type SophisticationLevel = typeof SOPHISTICATION_LEVELS[number];

// ============================================================================
// ASSET REQUIREMENTS
// ============================================================================

export const ASSET_TYPES = [
    // Product assets
    'productCutout',

    // SaaS proof assets
    'messengerMock',
    'dashboardCard',
    'invoicePreview',

    // Social proof assets
    'testimonialCard',
    'reviewCard',

    // Offer assets
    'offerBadge',
    'discountBadge',
    'urgencyBadge',

    // Local/Gastro assets
    'menuCard',
    'mapCard',
    'hoursCard',
    'dishPhoto',

    // Coach/Agency assets
    'portraitFrame',
    'resultsCard',
    'authoritySlide',
    'calendarCard',

    // Universal assets
    'comparisonTable',
    'benefitStack',
    'featureChips',
    'statsCard',

    // Core assets
    'background'
] as const;

export type AssetType = typeof ASSET_TYPES[number];

export interface AssetRequirement {
    type: AssetType;
    params?: Record<string, any>;
    optional?: boolean;
}

// Zod schema for AssetRequirement
export const AssetRequirementSchema = z.object({
    type: z.enum(ASSET_TYPES),
    params: z.record(z.any()).optional(),
    optional: z.boolean().optional()
});

// ============================================================================
// CREATIVE SPEC - BLUEPRINT
// ============================================================================

export interface AudienceProfile {
    persona: string;
    sophistication: SophisticationLevel;
    objections: string[];
}

export interface CopyContent {
    headline: string;
    subheadline?: string;
    body?: string;
    cta: string;
    bullets?: string[];  // max 3
    chips?: string[];    // max 3
    proofLine?: string;
    disclaimers?: string[];
}

export interface CopyConstraints {
    maxChars: {
        headline: number;
        subheadline?: number;
        body?: number;
        cta: number;
    };
    maxLines?: {
        headline: number;
        subheadline?: number;
        body?: number;
    };
    minFontSize?: number;
}

export interface StylePreferences {
    palette?: string[];        // Hex colors
    textSafe?: string[];       // Text colors that work on palette
    forbiddenStyles?: ('gradients' | 'illustrations' | 'patterns')[];
    mustAvoidClaims?: string[]; // e.g. "no fabricated metrics"
    readabilityMin?: number;    // min contrast ratio (e.g. 4.5)
}

export interface TemplateHints {
    preferTextPlacement?: 'top' | 'bottom' | 'left' | 'right';
    preferHeroSize?: 'small' | 'medium' | 'large';
    preferHeroPosition?: 'left' | 'center' | 'right';
}

/**
 * CreativeSpec - The complete blueprint for ad generation
 * Generated by LLM, validated against schema, drives deterministic assembly
 */
export interface CreativeSpec {
    // Context
    businessModel: BusinessModel;
    niche: string;
    platform: Platform;
    ratio: Ratio;
    language: string;

    // Audience
    audience: AudienceProfile;

    // Creative strategy
    angle: CreativeAngle;
    creativePattern: CreativePattern;

    // Content
    copy: CopyContent;

    // Assets needed
    assets: {
        required: AssetRequirement[];
    };

    // Grounded facts (optional, for safe claims)
    groundedFacts?: {
        offer?: string;
        proof?: string;
        painPoints?: string[];
        features?: string[];
    };

    // Constraints
    constraints: CopyConstraints & {
        forbiddenStyles?: StylePreferences['forbiddenStyles'];
        mustAvoidClaims?: string[];
        readabilityMin?: number;
    };

    // Style guidance
    style: StylePreferences;

    // Template selection hints
    templateHints: TemplateHints;

    // PREMIUM: Visual Fidelity & Layout Control
    visualIntent?: VisualIntent;
    layoutGeometry?: LayoutGeometry;
    hierarchyRules?: HierarchyRules;
    calloutRules?: CalloutRules;
    densityAndSpacing?: DensityAndSpacing;
    renderGuards?: RenderGuards;

    // Metadata
    meta?: {
        generatedAt?: string;
        seed?: number;
        variant?: number;
    };
}

// PREMIUM INTERFACES
export interface VisualIntent {
    composition: 'centered' | 'left-heavy' | 'right-heavy' | 'grid' | 'radial' | 'stacked';
    heroRole: 'packshot' | 'lifestyle' | 'handheld' | 'ui_mock' | 'environment';
    attentionAnchor: 'headline' | 'product' | 'badge' | 'price' | 'visual';
    supportingElements: string[];
    visualMood: 'clean' | 'playful' | 'premium' | 'bold' | 'minimal';
    inspirationClass?: string;
}

export interface LayoutGeometry {
    heroZone: {
        position: 'center' | 'left' | 'right' | 'top';
        widthPct: number;
        heightPct: number;
    };
    textZones: string[];
    forbiddenZones?: string[];
    overlapPolicy?: 'never' | 'allowed_for_badges_only' | 'allowed';
}

export interface HierarchyRules {
    primaryElement: string;
    secondaryElement: string;
    tertiaryElements?: string[];
    scaleRatios?: Record<string, number>;
    readingOrder: string[];
}

export interface CalloutRules {
    maxCallouts: number;
    connectorType: 'curved_arrow' | 'dotted_line' | 'straight' | 'none';
    markerStyle: 'dot' | 'ring' | 'none';
    labelMaxChars?: number;
    labelMaxLines?: number;
    placementLogic?: 'radial' | 'column' | 'free' | 'stacked';
}

export interface DensityAndSpacing {
    densityLevel: 'low' | 'medium' | 'high';
    maxTextElements?: number;
    minWhitespacePct?: number;
    safeMarginEnforced?: boolean;
}

export interface RenderGuards {
    minContrastRatio: number;
    noTextOverflow?: boolean;
    noElementCollision?: boolean;
    noGenericBackgroundOnly?: boolean;
    killIfMissingHero?: boolean;
}

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

const AudienceProfileSchema = z.object({
    persona: z.string().min(1),
    sophistication: z.enum(SOPHISTICATION_LEVELS),
    objections: z.array(z.string()).max(5)
});

const CopyContentSchema = z.object({
    headline: z.string().min(1).max(120),
    subheadline: z.string().max(150).optional(),
    body: z.string().max(300).optional(),
    cta: z.string().min(1).max(40),
    bullets: z.array(z.string()).max(3).optional(),
    chips: z.array(z.string()).max(3).optional(),
    proofLine: z.string().max(100).optional(),
    disclaimers: z.array(z.string()).max(2).optional()
});

const CopyConstraintsSchema = z.object({
    maxChars: z.object({
        headline: z.number().positive(),
        subheadline: z.number().positive().optional(),
        body: z.number().positive().optional(),
        cta: z.number().positive()
    }),
    maxLines: z.object({
        headline: z.number().positive(),
        subheadline: z.number().positive().optional(),
        body: z.number().positive().optional()
    }).optional(),
    minFontSize: z.number().positive().optional()
});

const StylePreferencesSchema = z.object({
    palette: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).optional(),
    textSafe: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).optional(),
    forbiddenStyles: z.array(z.enum(['gradients', 'illustrations', 'patterns'])).optional(),
    mustAvoidClaims: z.array(z.string()).optional(),
    readabilityMin: z.number().min(1).max(21).optional()
});

const TemplateHintsSchema = z.object({
    preferTextPlacement: z.enum(['top', 'bottom', 'left', 'right']).optional(),
    preferHeroSize: z.enum(['small', 'medium', 'large']).optional(),
    preferHeroPosition: z.enum(['left', 'center', 'right']).optional()
});

/**
 * Main CreativeSpec validation schema
 */
export const CreativeSpecSchema = z.object({
    businessModel: z.enum(BUSINESS_MODELS),
    niche: z.string().min(1),
    platform: z.enum(PLATFORMS),
    ratio: z.enum(RATIOS),
    language: z.string().min(2).max(5),

    audience: AudienceProfileSchema,

    angle: z.enum(CREATIVE_ANGLES),
    creativePattern: z.enum(CREATIVE_PATTERNS),

    copy: CopyContentSchema,

    assets: z.object({
        required: z.array(AssetRequirementSchema)
    }),

    groundedFacts: z.object({
        offer: z.string().optional(),
        proof: z.string().optional(),
        painPoints: z.array(z.string()).optional(),
        features: z.array(z.string()).optional()
    }).optional(),

    constraints: CopyConstraintsSchema.extend({
        forbiddenStyles: z.array(z.enum(['gradients', 'illustrations', 'patterns'])).optional(),
        mustAvoidClaims: z.array(z.string()).optional(),
        readabilityMin: z.number().min(1).max(21).optional()
    }),

    style: StylePreferencesSchema,

    templateHints: TemplateHintsSchema,

    meta: z.object({
        generatedAt: z.string().optional(),
        seed: z.number().optional(),
        variant: z.number().optional()
    }).optional()
});

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Request context for CreativeSpec generation
 */
export interface CreativeSpecRequest {
    productName: string;
    brandName?: string;
    userPrompt: string;
    tone: 'professional' | 'playful' | 'bold' | 'luxury' | 'minimal';
    language?: string;
    platform?: Platform;
    ratio?: Ratio;

    groundedFacts?: {
        offer?: string;
        proof?: string;
        painPoints?: string[];
        features?: string[];
    };

    constraints?: {
        mustAvoid?: string[];
        mustInclude?: string[];
    };

    // Optional: Vision Input
    imageBase64?: string;
}

/**
 * Validated CreativeSpec result
 */
export interface ValidatedCreativeSpec {
    spec: CreativeSpec;
    isValid: boolean;
    errors?: z.ZodError;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate a CreativeSpec object against the schema
 */
export function validateCreativeSpec(spec: unknown): ValidatedCreativeSpec {
    try {
        const validated = CreativeSpecSchema.parse(spec);
        return {
            spec: validated,
            isValid: true
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                spec: spec as CreativeSpec,
                isValid: false,
                errors: error
            };
        }
        throw error;
    }
}

/**
 * Check if a CreativeSpec is valid (type guard)
 */
export function isValidCreativeSpec(spec: unknown): spec is CreativeSpec {
    return validateCreativeSpec(spec).isValid;
}
