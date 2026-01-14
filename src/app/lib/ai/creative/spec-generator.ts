/**
 * CREATIVE SPEC GENERATOR
 * 
 * LLM-powered CreativeSpec blueprint generation with validation and retry logic.
 */

import OpenAI from 'openai';
import {
    ASSET_TYPES,
    CREATIVE_ANGLES,
    CREATIVE_PATTERNS,
    PLATFORMS,
    validateCreativeSpec
} from './types';
import type {
    AssetRequirement,
    AssetType,
    BusinessModel,
    CalloutRules,
    CreativeAngle,
    CreativePattern,
    CreativeSpec,
    CreativeSpecRequest,
    DensityAndSpacing,
    HierarchyRules,
    LayoutGeometry,
    Platform,
    Ratio,
    RenderGuards,
    ValidatedCreativeSpec,
    VisualIntent
} from './types';
import { buildCreativeSpecPrompt, buildPremiumFixPrompt } from './prompts';

// ============================================================================
// BUSINESS MODEL INFERENCE
// ============================================================================

/**
 * Infer business model from product name and user prompt
 */
export function inferBusinessModel(
    productName: string,
    userPrompt: string
): BusinessModel {
    const combined = `${productName} ${userPrompt}`.toLowerCase();

    // SaaS indicators
    if (/\b(software|app|saas|platform|tool|automation|api|dashboard|crm|erp)\b/.test(combined)) {
        return 'saas';
    }

    // Local/Gastro indicators
    if (/\b(restaurant|café|cafe|bar|bistro|pizzeria|bakery|food|dish|menu|local|stadt|öffnungszeiten|reservierung)\b/.test(combined)) {
        return 'local';
    }

    // Coach/Expert indicators
    if (/\b(coach|coaching|training|kurs|webinar|seminar|beratung|mentor|trainer|experte|1:1|gruppe)\b/.test(combined)) {
        return 'coach';
    }

    // Agency/B2B indicators
    if (/\b(agentur|agency|beratung|consulting|b2b|marketing|seo|ads|kampagne|strategie|dienstleistung)\b/.test(combined)) {
        return 'agency';
    }

    // Info/Education indicators
    if (/\b(kurs|course|online-kurs|lernen|bildung|wissen|videokurs|tutorial|ausbildung|zertifikat)\b/.test(combined)) {
        return 'info';
    }

    // E-commerce (default fallback)
    // Also matches: shop, store, produkt, kaufen, versand, lieferung, etc.
    return 'ecommerce';
}

// ============================================================================
// SPEC GENERATION
// ============================================================================

export interface SpecGenerationOptions {
    apiKey: string;
    variantCount?: number;        // How many spec variants to generate (default: 5)
    model?: string;                // OpenAI model (default: from env or gpt-4o)
    temperature?: number;          // LLM temperature (default: 0.8)
    maxRetries?: number;           // Max validation retries (default: 3)
    businessModel?: BusinessModel; // Override automatic inference
    maxBudgetUSD?: number;         // Max budget per request (default: 0.50) - BLOCKER FIX
}

export interface SpecGenerationResult {
    specs: CreativeSpec[];
    validSpecs: CreativeSpec[];
    invalidSpecs: Array<{ spec: unknown; errors: unknown }>;
    telemetry: {
        totalCost: number;
        totalTime: number;
        apiCalls: number;
        validationAttempts: number;
    };
}

type UserContent =
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string; detail?: "low" | "high" | "auto" } }
    >;

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

const DEFAULT_CONSTRAINTS_BY_RATIO: Record<Ratio, {
    maxChars: { headline: number; subheadline?: number; body?: number; cta: number };
    maxLines?: { headline: number; subheadline?: number; body?: number };
    minFontSize?: number;
}> = {
    '1:1': {
        maxChars: { headline: 60, subheadline: 110, body: 160, cta: 24 },
        maxLines: { headline: 2, subheadline: 2, body: 3 },
        minFontSize: 18
    },
    '4:5': {
        maxChars: { headline: 65, subheadline: 120, body: 180, cta: 26 },
        maxLines: { headline: 2, subheadline: 3, body: 4 },
        minFontSize: 18
    },
    '9:16': {
        maxChars: { headline: 70, subheadline: 140, body: 220, cta: 28 },
        maxLines: { headline: 3, subheadline: 3, body: 5 },
        minFontSize: 18
    }
};

const DEFAULT_STYLE_BY_TONE: Record<CreativeSpecRequest['tone'], { palette: string[]; textSafe: string[] }> = {
    professional: { palette: ['#0B2545', '#13315C', '#EEF2F6'], textSafe: ['#0B2545', '#FFFFFF'] },
    playful: { palette: ['#FF6B6B', '#FFD93D', '#4D96FF'], textSafe: ['#1E1E1E', '#FFFFFF'] },
    bold: { palette: ['#111111', '#FF3B30', '#F5F5F5'], textSafe: ['#111111', '#FFFFFF'] },
    luxury: { palette: ['#0B0B0B', '#C9A227', '#F5F0E6'], textSafe: ['#0B0B0B', '#FFFFFF'] },
    minimal: { palette: ['#111111', '#F2F2F2', '#CFCFCF'], textSafe: ['#111111', '#FFFFFF'] }
};

const ASSET_TYPE_ALIASES: Record<string, AssetType> = {
    product: 'productCutout',
    productcutout: 'productCutout',
    productimage: 'productCutout',
    productphoto: 'productCutout',
    productpicture: 'productCutout',
    productimg: 'productCutout',
    backgroundimage: 'background',
    bg: 'background',
    offer: 'offerBadge',
    discount: 'discountBadge',
    urgency: 'urgencyBadge',
    testimonial: 'testimonialCard',
    review: 'reviewCard',
    socialproof: 'testimonialCard',
    stats: 'statsCard',
    comparison: 'comparisonTable',
    benefits: 'benefitStack',
    benefitstack: 'benefitStack',
    features: 'featureChips',
    featurechips: 'featureChips',
    steps: 'featureChips',
    chat: 'messengerMock',
    whatsapp: 'messengerMock',
    dashboard: 'dashboardCard',
    invoice: 'invoicePreview',
    menu: 'menuCard',
    map: 'mapCard',
    hours: 'hoursCard',
    dish: 'dishPhoto',
    portrait: 'portraitFrame',
    authority: 'authoritySlide',
    results: 'resultsCard',
    calendar: 'calendarCard',
    curriculum: 'benefitStack',
    curriculumcard: 'benefitStack',
    outcomes: 'benefitStack',
    outcomescard: 'benefitStack',
    webinar: 'calendarCard',
    webinarcard: 'calendarCard',
    processsteps: 'benefitStack'
};

const PLATFORM_ALIASES: Record<string, Platform> = {
    instagramstory: 'meta_story',
    igstory: 'meta_story',
    story: 'meta_story',
    facebookfeed: 'meta_feed',
    instagramfeed: 'meta_feed',
    metafeed: 'meta_feed',
    display: 'google_display',
    tiktok: 'tiktok_feed'
};

const DEFAULT_ASSETS_BY_PATTERN: Record<CreativePattern, AssetType[]> = {
    ecommerce_product_focus: ['productCutout', 'background'],
    ecommerce_offer_burst: ['productCutout', 'offerBadge', 'background'],
    ecommerce_ugc_frame: ['productCutout', 'background'],
    ecommerce_before_after: ['comparisonTable', 'productCutout', 'background'],
    ecommerce_benefit_stack: ['productCutout', 'benefitStack', 'background'],
    ecommerce_giftable: ['productCutout', 'background'],
    ecommerce_comparison: ['comparisonTable', 'productCutout', 'background'],
    ecommerce_feature_stack: ['productCutout', 'featureChips', 'background'],
    saas_ui_proof: ['dashboardCard', 'background'],
    saas_whatsapp_flow: ['messengerMock', 'background'],
    saas_time_saving: ['dashboardCard', 'statsCard', 'background'],
    saas_lead_capture: ['dashboardCard', 'background'],
    saas_workflow_steps: ['messengerMock', 'featureChips', 'background'],
    saas_feature_grid: ['featureChips', 'dashboardCard', 'background'],
    local_menu_feature: ['menuCard', 'background'],
    local_map_hours: ['mapCard', 'hoursCard', 'background'],
    local_offer_coupon: ['menuCard', 'offerBadge', 'background'],
    local_social_proof: ['testimonialCard', 'background'],
    coach_authority_slide: ['authoritySlide', 'portraitFrame', 'background'],
    coach_transformation: ['comparisonTable', 'background'],
    coach_testimonial: ['testimonialCard', 'portraitFrame', 'background'],
    agency_results_card: ['resultsCard', 'background'],
    agency_case_study: ['resultsCard', 'background'],
    agency_offer_audit: ['calendarCard', 'background'],
    info_curriculum: ['benefitStack', 'featureChips', 'background'],
    info_outcomes: ['benefitStack', 'background'],
    info_webinar: ['calendarCard', 'background']
};

function normalizeKey(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}

function getString(value: unknown, fallback: string): string {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed) {
            return trimmed;
        }
    }
    return fallback;
}

function getOptionalString(value: unknown): string | undefined {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed) {
            return trimmed;
        }
    }
    return undefined;
}

function toStringArray(value: unknown, fallback: string[] = []): string[] {
    if (!Array.isArray(value)) return fallback;
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function toNumber(value: unknown, fallback: number): number {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
        return value;
    }
    return fallback;
}

function toOptionalNumber(value: unknown): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
        return value;
    }
    return undefined;
}

function clampText(value: string, maxLength: number): string {
    if (value.length <= maxLength) return value;
    return value.slice(0, maxLength).trim();
}

function normalizeLanguage(value: unknown, fallback: string): string {
    if (typeof value !== 'string') return fallback;
    const normalized = value.trim().toLowerCase();
    if (normalized === 'deutsch' || normalized === 'german') return 'de';
    if (normalized === 'english' || normalized === 'en-us' || normalized === 'en_gb') return 'en';
    if (normalized.length >= 2 && normalized.length <= 5) {
        return normalized;
    }
    return fallback;
}

function normalizePlatform(value: unknown, fallback: Platform): Platform {
    if (typeof value !== 'string') return fallback;
    const key = normalizeKey(value);
    const alias = PLATFORM_ALIASES[key];
    if (alias) return alias;
    const direct = PLATFORMS.find((platform) => normalizeKey(platform) === key);
    return direct ?? fallback;
}

function normalizeRatio(value: unknown, fallback: Ratio): Ratio {
    if (typeof value === 'string') {
        const normalized = value.toLowerCase().replace(/\s+/g, '');
        if (normalized.includes('9:16') || normalized.includes('9x16') || normalized.includes('vertical') || normalized.includes('story')) {
            return '9:16';
        }
        if (normalized.includes('4:5') || normalized.includes('4x5') || normalized.includes('portrait')) {
            return '4:5';
        }
        if (normalized.includes('1:1') || normalized.includes('1x1') || normalized.includes('square')) {
            return '1:1';
        }
    }
    return fallback;
}

function getDefaultAngle(
    request: CreativeSpecRequest,
    groundedFacts?: CreativeSpec['groundedFacts']
): CreativeAngle {
    if (groundedFacts?.offer) return 'offer';
    if (groundedFacts?.proof) return 'social_proof';
    if (request.userPrompt.toLowerCase().includes('vorher') && request.userPrompt.toLowerCase().includes('nachher')) {
        return 'before_after';
    }
    return 'pain_relief';
}

function normalizeAngle(value: unknown, fallback: CreativeAngle): CreativeAngle {
    if (typeof value !== 'string') return fallback;
    const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, '_');
    if ((CREATIVE_ANGLES as readonly string[]).includes(normalized)) {
        return normalized as CreativeAngle;
    }
    const simplified = normalizeKey(normalized);
    if (simplified.includes('offer') || simplified.includes('discount') || simplified.includes('deal')) {
        return 'offer';
    }
    if (simplified.includes('price') || simplified.includes('cost')) {
        return 'price_anchor';
    }
    if (simplified.includes('social') || simplified.includes('proof') || simplified.includes('testimonial') || simplified.includes('review')) {
        return 'social_proof';
    }
    if (simplified.includes('urgent') || simplified.includes('limited') || simplified.includes('last')) {
        return 'urgency';
    }
    if (simplified.includes('before') && simplified.includes('after')) {
        return 'before_after';
    }
    if (simplified.includes('compare') || simplified.includes('versus') || simplified.includes('vs')) {
        return 'comparison';
    }
    if (simplified.includes('gift')) {
        return 'gift';
    }
    if (simplified.includes('authority') || simplified.includes('expert')) {
        return 'authority';
    }
    if (simplified.includes('demo') || simplified.includes('how')) {
        return 'demo';
    }
    return fallback;
}

function getDefaultPattern(
    request: CreativeSpecRequest,
    businessModel: BusinessModel,
    groundedFacts?: CreativeSpec['groundedFacts']
): CreativePattern {
    const prompt = request.userPrompt.toLowerCase();
    switch (businessModel) {
        case 'ecommerce':
            if (groundedFacts?.offer) return 'ecommerce_offer_burst';
            if (prompt.includes('vorher') && prompt.includes('nachher')) return 'ecommerce_before_after';
            if (prompt.includes('vergleich') || prompt.includes('vs')) return 'ecommerce_comparison';
            if (prompt.includes('geschenk') || prompt.includes('gift')) return 'ecommerce_giftable';
            if (prompt.includes('feature') || prompt.includes('funktion')) return 'ecommerce_feature_stack';
            return 'ecommerce_product_focus';
        case 'saas':
            if (prompt.includes('whatsapp') || prompt.includes('chat')) return 'saas_whatsapp_flow';
            if (prompt.includes('workflow') || prompt.includes('step') || prompt.includes('schritt')) return 'saas_workflow_steps';
            if (prompt.includes('grid') || prompt.includes('matrix')) return 'saas_feature_grid';
            if (prompt.includes('lead') || prompt.includes('trial') || prompt.includes('demo')) return 'saas_lead_capture';
            if (prompt.includes('zeit') || prompt.includes('time')) return 'saas_time_saving';
            return 'saas_ui_proof';
        case 'local':
            if (groundedFacts?.offer) return 'local_offer_coupon';
            if (prompt.includes('öffnungs') || prompt.includes('hours') || prompt.includes('map')) return 'local_map_hours';
            return 'local_menu_feature';
        case 'coach':
            if (groundedFacts?.proof) return 'coach_testimonial';
            return 'coach_authority_slide';
        case 'agency':
            if (groundedFacts?.proof) return 'agency_results_card';
            return 'agency_offer_audit';
        case 'info':
            if (prompt.includes('webinar')) return 'info_webinar';
            if (prompt.includes('outcome') || prompt.includes('ergebnis')) return 'info_outcomes';
            return 'info_curriculum';
        default:
            return 'ecommerce_product_focus';
    }
}

function normalizePattern(
    value: unknown,
    fallback: CreativePattern,
    businessModel: BusinessModel
): CreativePattern {
    if (typeof value !== 'string') return fallback;
    const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, '_');
    if ((CREATIVE_PATTERNS as readonly string[]).includes(normalized)) {
        const pattern = normalized as CreativePattern;
        if (pattern.startsWith(`${businessModel}_`)) {
            return pattern;
        }
    }
    const simplified = normalizeKey(normalized);
    if (businessModel === 'ecommerce') {
        if (simplified.includes('offer') || simplified.includes('discount')) return 'ecommerce_offer_burst';
        if (simplified.includes('ugc')) return 'ecommerce_ugc_frame';
        if (simplified.includes('beforeafter')) return 'ecommerce_before_after';
        if (simplified.includes('benefit')) return 'ecommerce_benefit_stack';
        if (simplified.includes('gift')) return 'ecommerce_giftable';
        if (simplified.includes('compare') || simplified.includes('comparison')) return 'ecommerce_comparison';
        if (simplified.includes('feature') || simplified.includes('scatter')) return 'ecommerce_feature_stack';
        return 'ecommerce_product_focus';
    }
    if (businessModel === 'saas') {
        if (simplified.includes('whatsapp') || simplified.includes('chat')) return 'saas_whatsapp_flow';
        if (simplified.includes('workflow') || simplified.includes('steps')) return 'saas_workflow_steps';
        if (simplified.includes('feature') || simplified.includes('grid')) return 'saas_feature_grid';
        if (simplified.includes('lead') || simplified.includes('ebook') || simplified.includes('trial')) return 'saas_lead_capture';
        if (simplified.includes('time') || simplified.includes('saving')) return 'saas_time_saving';
        return 'saas_ui_proof';
    }
    if (businessModel === 'local') {
        if (simplified.includes('map') || simplified.includes('hours')) return 'local_map_hours';
        if (simplified.includes('offer') || simplified.includes('coupon')) return 'local_offer_coupon';
        if (simplified.includes('proof') || simplified.includes('review')) return 'local_social_proof';
        return 'local_menu_feature';
    }
    if (businessModel === 'coach') {
        if (simplified.includes('testimonial') || simplified.includes('proof')) return 'coach_testimonial';
        if (simplified.includes('transform') || simplified.includes('beforeafter')) return 'coach_transformation';
        return 'coach_authority_slide';
    }
    if (businessModel === 'agency') {
        if (simplified.includes('case')) return 'agency_case_study';
        if (simplified.includes('result')) return 'agency_results_card';
        return 'agency_offer_audit';
    }
    if (businessModel === 'info') {
        if (simplified.includes('webinar')) return 'info_webinar';
        if (simplified.includes('outcome')) return 'info_outcomes';
        return 'info_curriculum';
    }
    return fallback;
}

function normalizeConstraints(raw: unknown, ratio: Ratio) {
    const defaults = DEFAULT_CONSTRAINTS_BY_RATIO[ratio];
    const rawConstraints = isRecord(raw) ? raw : {};
    const rawMaxChars = isRecord(rawConstraints.maxChars) ? rawConstraints.maxChars : {};
    const rawMaxLines = isRecord(rawConstraints.maxLines) ? rawConstraints.maxLines : {};

    const maxChars = {
        headline: toNumber(rawMaxChars.headline, defaults.maxChars.headline),
        subheadline: toOptionalNumber(rawMaxChars.subheadline) ?? defaults.maxChars.subheadline,
        body: toOptionalNumber(rawMaxChars.body) ?? defaults.maxChars.body,
        cta: toNumber(rawMaxChars.cta, defaults.maxChars.cta)
    };

    const maxLines = defaults.maxLines ? {
        headline: toNumber(rawMaxLines.headline, defaults.maxLines.headline),
        subheadline: toOptionalNumber(rawMaxLines.subheadline) ?? defaults.maxLines.subheadline,
        body: toOptionalNumber(rawMaxLines.body) ?? defaults.maxLines.body
    } : undefined;

    const forbiddenStyles = toStringArray(rawConstraints.forbiddenStyles).filter(
        (style): style is 'gradients' | 'illustrations' | 'patterns' =>
            style === 'gradients' || style === 'illustrations' || style === 'patterns'
    );

    const mustAvoidClaims = toStringArray(rawConstraints.mustAvoidClaims);

    return {
        maxChars,
        maxLines,
        minFontSize: toOptionalNumber(rawConstraints.minFontSize) ?? defaults.minFontSize,
        forbiddenStyles: forbiddenStyles.length ? forbiddenStyles : undefined,
        mustAvoidClaims: mustAvoidClaims.length ? mustAvoidClaims : undefined,
        readabilityMin: toOptionalNumber(rawConstraints.readabilityMin)
    };
}

function buildFallbackCopy(
    request: CreativeSpecRequest,
    constraints: ReturnType<typeof normalizeConstraints>,
    groundedFacts?: CreativeSpec['groundedFacts']
): CreativeSpec['copy'] {
    const toneCtaMap: Record<CreativeSpecRequest['tone'], string> = {
        professional: 'Jetzt ansehen',
        playful: 'Jetzt testen',
        bold: 'Jetzt holen',
        luxury: 'Mehr erfahren',
        minimal: 'Mehr dazu'
    };

    const headlineBase = groundedFacts?.offer
        ? `Jetzt ${groundedFacts.offer}`
        : groundedFacts?.features?.[0]
            ? `${request.productName}: ${groundedFacts.features[0]}`
            : `${request.productName} entdecken`;

    const subheadlineBase = groundedFacts?.proof || request.userPrompt;

    const headlineLimit = Math.min(constraints.maxChars.headline, 120);
    const subheadlineLimit = Math.min(constraints.maxChars.subheadline ?? 150, 150);
    const ctaLimit = Math.min(constraints.maxChars.cta, 40);

    const copy: CreativeSpec['copy'] = {
        headline: clampText(headlineBase, headlineLimit),
        cta: clampText(toneCtaMap[request.tone], ctaLimit)
    };

    const subheadline = clampText(subheadlineBase, subheadlineLimit);
    if (subheadline) {
        copy.subheadline = subheadline;
    }

    const bullets = groundedFacts?.features ? groundedFacts.features.slice(0, 3) : [];
    if (bullets.length) {
        copy.bullets = bullets;
    }

    const chips = groundedFacts?.painPoints ? groundedFacts.painPoints.slice(0, 3) : [];
    if (chips.length) {
        copy.chips = chips;
    }

    if (groundedFacts?.proof) {
        copy.proofLine = groundedFacts.proof;
    }

    return copy;
}

function normalizeCopy(
    raw: unknown,
    request: CreativeSpecRequest,
    constraints: ReturnType<typeof normalizeConstraints>,
    groundedFacts?: CreativeSpec['groundedFacts']
): CreativeSpec['copy'] {
    const fallback = buildFallbackCopy(request, constraints, groundedFacts);
    const rawCopy = isRecord(raw) ? raw : {};

    const headlineLimit = Math.min(constraints.maxChars.headline, 120);
    const subheadlineLimit = Math.min(constraints.maxChars.subheadline ?? 150, 150);
    const bodyLimit = Math.min(constraints.maxChars.body ?? 300, 300);
    const ctaLimit = Math.min(constraints.maxChars.cta, 40);

    const headline = clampText(getString(rawCopy.headline, fallback.headline), headlineLimit);
    const cta = clampText(getString(rawCopy.cta, fallback.cta), ctaLimit);
    const subheadline = getOptionalString(rawCopy.subheadline) ?? fallback.subheadline;
    const body = getOptionalString(rawCopy.body) ?? fallback.body;

    const copy: CreativeSpec['copy'] = {
        headline,
        cta
    };

    if (subheadline) {
        copy.subheadline = clampText(subheadline, subheadlineLimit);
    }
    if (body) {
        copy.body = clampText(body, bodyLimit);
    }

    const bullets = toStringArray(rawCopy.bullets, fallback.bullets ?? []).slice(0, 3);
    if (bullets.length) {
        copy.bullets = bullets;
    }

    const chips = toStringArray(rawCopy.chips, fallback.chips ?? []).slice(0, 3);
    if (chips.length) {
        copy.chips = chips;
    }

    const proofLine = getOptionalString(rawCopy.proofLine) ?? fallback.proofLine;
    if (proofLine) {
        copy.proofLine = clampText(proofLine, 100);
    }

    const disclaimers = toStringArray(rawCopy.disclaimers, fallback.disclaimers ?? []).slice(0, 2);
    if (disclaimers.length) {
        copy.disclaimers = disclaimers;
    }

    return copy;
}

function coerceAssetType(value: unknown): AssetType | null {
    if (typeof value !== 'string') return null;
    const key = normalizeKey(value);
    const direct = ASSET_TYPES.find((type) => normalizeKey(type) === key);
    if (direct) return direct;
    const alias = ASSET_TYPE_ALIASES[key];
    return alias ?? null;
}

function normalizeAssets(
    raw: unknown,
    creativePattern: CreativePattern,
    businessModel: BusinessModel,
    groundedFacts?: CreativeSpec['groundedFacts']
): AssetRequirement[] {
    const requirements: AssetRequirement[] = [];
    const seen = new Set<AssetType>();
    const rawAssets = isRecord(raw) ? raw : {};

    const rawRequired = Array.isArray(rawAssets.required) ? rawAssets.required : [];
    for (const entry of rawRequired) {
        if (!isRecord(entry)) continue;
        const type = coerceAssetType(entry.type);
        if (!type || seen.has(type)) continue;
        const params = isRecord(entry.params) ? entry.params : undefined;
        const optional = typeof entry.optional === 'boolean' ? entry.optional : undefined;
        const requirement: AssetRequirement = { type };
        if (params) {
            requirement.params = params;
        }
        if (optional !== undefined) {
            requirement.optional = optional;
        }
        requirements.push(requirement);
        seen.add(type);
    }

    const defaults = DEFAULT_ASSETS_BY_PATTERN[creativePattern] ?? [];
    for (const type of defaults) {
        if (!seen.has(type)) {
            requirements.push({ type });
            seen.add(type);
        }
    }

    if (groundedFacts?.offer && !seen.has('offerBadge')) {
        requirements.push({ type: 'offerBadge' });
        seen.add('offerBadge');
    }

    if (groundedFacts?.proof && !seen.has('testimonialCard')) {
        requirements.push({ type: 'testimonialCard' });
        seen.add('testimonialCard');
    }

    if (businessModel === 'ecommerce' && !seen.has('productCutout')) {
        requirements.push({ type: 'productCutout' });
        seen.add('productCutout');
    }

    if (requirements.length === 0) {
        requirements.push({ type: 'background' });
    }

    return requirements;
}

function normalizeStyle(raw: unknown, tone: CreativeSpecRequest['tone']) {
    const rawStyle = isRecord(raw) ? raw : {};
    const defaultStyle = DEFAULT_STYLE_BY_TONE[tone];

    const palette = toStringArray(rawStyle.palette, defaultStyle.palette).filter((color) => HEX_COLOR_REGEX.test(color));
    const textSafe = toStringArray(rawStyle.textSafe, defaultStyle.textSafe).filter((color) => HEX_COLOR_REGEX.test(color));
    const forbiddenStyles = toStringArray(rawStyle.forbiddenStyles).filter(
        (style): style is 'gradients' | 'illustrations' | 'patterns' =>
            style === 'gradients' || style === 'illustrations' || style === 'patterns'
    );
    const mustAvoidClaims = toStringArray(rawStyle.mustAvoidClaims);
    const readabilityMin = toOptionalNumber(rawStyle.readabilityMin);

    return {
        palette: palette.length ? palette : defaultStyle.palette,
        textSafe: textSafe.length ? textSafe : defaultStyle.textSafe,
        forbiddenStyles: forbiddenStyles.length ? forbiddenStyles : undefined,
        mustAvoidClaims: mustAvoidClaims.length ? mustAvoidClaims : undefined,
        readabilityMin
    };
}

function normalizeTemplateHints(raw: unknown) {
    const hints = isRecord(raw) ? raw : {};

    const preferTextPlacement = getOptionalString(hints.preferTextPlacement);
    const preferHeroSize = getOptionalString(hints.preferHeroSize);
    const preferHeroPosition = getOptionalString(hints.preferHeroPosition);

    const templateHints: CreativeSpec['templateHints'] = {};
    if (preferTextPlacement === 'top' || preferTextPlacement === 'bottom' || preferTextPlacement === 'left' || preferTextPlacement === 'right') {
        templateHints.preferTextPlacement = preferTextPlacement;
    }
    if (preferHeroSize === 'small' || preferHeroSize === 'medium' || preferHeroSize === 'large') {
        templateHints.preferHeroSize = preferHeroSize;
    }
    if (preferHeroPosition === 'left' || preferHeroPosition === 'center' || preferHeroPosition === 'right') {
        templateHints.preferHeroPosition = preferHeroPosition;
    }

    return templateHints;
}

function normalizeAudience(
    raw: unknown,
    request: CreativeSpecRequest,
    language: string,
    groundedFacts?: CreativeSpec['groundedFacts']
): CreativeSpec['audience'] {
    const rawAudience = isRecord(raw) ? raw : {};

    const defaultPersona = language.startsWith('de')
        ? `Menschen, die ${request.productName} suchen`
        : `People looking for ${request.productName}`;

    const persona = getString(rawAudience.persona, defaultPersona);
    const sophistication = getOptionalString(rawAudience.sophistication);
    const objections = toStringArray(rawAudience.objections, groundedFacts?.painPoints ?? []).slice(0, 5);

    const audience: CreativeSpec['audience'] = {
        persona,
        sophistication: (sophistication === 'unaware' || sophistication === 'problem_aware' || sophistication === 'solution_aware' || sophistication === 'product_aware')
            ? sophistication
            : 'problem_aware',
        objections
    };

    return audience;
}

function normalizeGroundedFacts(
    raw: unknown,
    request: CreativeSpecRequest
): CreativeSpec['groundedFacts'] | undefined {
    const rawFacts = isRecord(raw) ? raw : {};
    const requestFacts = request.groundedFacts;

    const offer = getOptionalString(rawFacts.offer) ?? requestFacts?.offer;
    const proof = getOptionalString(rawFacts.proof) ?? requestFacts?.proof;
    const painPoints = toStringArray(rawFacts.painPoints, requestFacts?.painPoints ?? []);
    const features = toStringArray(rawFacts.features, requestFacts?.features ?? []);

    if (!offer && !proof && painPoints.length === 0 && features.length === 0) {
        return undefined;
    }

    return {
        offer,
        proof,
        painPoints: painPoints.length ? painPoints : undefined,
        features: features.length ? features : undefined
    };
}

function normalizePremiumVisualIntent(raw: unknown): VisualIntent | undefined {
    if (!isRecord(raw)) return undefined;

    const compositionMap: Record<string, VisualIntent['composition']> = {
        centered: 'centered', center: 'centered',
        leftheavy: 'left-heavy', left: 'left-heavy',
        rightheavy: 'right-heavy', right: 'right-heavy',
        grid: 'grid', radial: 'radial', stacked: 'stacked'
    };

    const heroRoleMap: Record<string, VisualIntent['heroRole']> = {
        packshot: 'packshot', product: 'packshot',
        lifestyle: 'lifestyle',
        handheld: 'handheld',
        uimock: 'ui_mock', ui: 'ui_mock', dashboard: 'ui_mock',
        environment: 'environment'
    };

    const anchorMap: Record<string, VisualIntent['attentionAnchor']> = {
        headline: 'headline', text: 'headline',
        product: 'product', hero: 'product',
        badge: 'badge', price: 'price', visual: 'visual'
    };

    const moodMap: Record<string, VisualIntent['visualMood']> = {
        clean: 'clean', playful: 'playful',
        premium: 'premium', bold: 'bold', minimal: 'minimal'
    };

    const composition = compositionMap[normalizeKey(String(raw.composition || ''))] || 'centered';
    const heroRole = heroRoleMap[normalizeKey(String(raw.heroRole || ''))] || 'packshot';
    const attentionAnchor = anchorMap[normalizeKey(String(raw.attentionAnchor || ''))] || 'headline';
    const visualMood = moodMap[normalizeKey(String(raw.visualMood || ''))] || 'clean';
    const supportingElements = toStringArray(raw.supportingElements, []);
    const inspirationClass = getOptionalString(raw.inspirationClass);

    return {
        composition,
        heroRole,
        attentionAnchor,
        supportingElements,
        visualMood,
        inspirationClass
    };
}

function normalizePremiumLayoutGeometry(raw: unknown): LayoutGeometry | undefined {
    if (!isRecord(raw)) return undefined;

    const rawHero = isRecord(raw.heroZone) ? raw.heroZone : {};
    const positionMap: Record<string, 'center' | 'left' | 'right' | 'top'> = {
        center: 'center', centered: 'center',
        left: 'left', right: 'right', top: 'top'
    };

    const position = positionMap[normalizeKey(String(rawHero.position || ''))] || 'center';
    const widthPct = toNumber(rawHero.widthPct, 0.35);
    const heightPct = toNumber(rawHero.heightPct, 0.45);

    const textZones = toStringArray(raw.textZones, ['top_left', 'bottom']);
    const forbiddenZones = toStringArray(raw.forbiddenZones);

    const overlapPolicyMap: Record<string, 'never' | 'allowed_for_badges_only' | 'allowed'> = {
        never: 'never',
        'allowedfor badgesonly': 'allowed_for_badges_only',
        allowed: 'allowed'
    };
    const overlapPolicy = overlapPolicyMap[normalizeKey(String(raw.overlapPolicy || ''))] || 'never';

    return {
        heroZone: { position, widthPct, heightPct },
        textZones,
        forbiddenZones: forbiddenZones.length ? forbiddenZones : undefined,
        overlapPolicy
    };
}

function normalizePremiumHierarchyRules(raw: unknown): HierarchyRules | undefined {
    if (!isRecord(raw)) return undefined;

    const primaryElement = getString(raw.primaryElement, 'headline');
    const secondaryElement = getString(raw.secondaryElement, 'hero');
    const tertiaryElements = toStringArray(raw.tertiaryElements);
    const scaleRatios = isRecord(raw.scaleRatios) ? raw.scaleRatios as Record<string, number> : undefined;
    const readingOrder = toStringArray(raw.readingOrder, ['headline', 'hero', 'cta']);

    return {
        primaryElement,
        secondaryElement,
        tertiaryElements: tertiaryElements.length ? tertiaryElements : undefined,
        scaleRatios,
        readingOrder
    };
}

function normalizePremiumCalloutRules(raw: unknown): CalloutRules | undefined {
    if (!isRecord(raw)) return undefined;

    const connectorMap: Record<string, 'curved_arrow' | 'dotted_line' | 'straight' | 'none'> = {
        curvedarrow: 'curved_arrow', curved: 'curved_arrow', arrow: 'curved_arrow',
        dottedline: 'dotted_line', dotted: 'dotted_line',
        straight: 'straight', line: 'straight',
        none: 'none'
    };

    const markerMap: Record<string, 'dot' | 'ring' | 'none'> = {
        dot: 'dot', ring: 'ring', circle: 'ring', none: 'none'
    };

    const placementMap: Record<string, 'radial' | 'column' | 'free' | 'stacked'> = {
        radial: 'radial', column: 'column', free: 'free', stacked: 'stacked'
    };

    const maxCallouts = toNumber(raw.maxCallouts, 4);
    const connectorType = connectorMap[normalizeKey(String(raw.connectorType || ''))] || 'dotted_line';
    const markerStyle = markerMap[normalizeKey(String(raw.markerStyle || ''))] || 'ring';
    const labelMaxChars = toOptionalNumber(raw.labelMaxChars);
    const labelMaxLines = toOptionalNumber(raw.labelMaxLines);
    const placementLogic = placementMap[normalizeKey(String(raw.placementLogic || ''))];

    return {
        maxCallouts,
        connectorType,
        markerStyle,
        labelMaxChars,
        labelMaxLines,
        placementLogic
    };
}

function normalizePremiumDensityAndSpacing(raw: unknown): DensityAndSpacing | undefined {
    if (!isRecord(raw)) return undefined;

    const densityMap: Record<string, 'low' | 'medium' | 'high'> = {
        low: 'low', medium: 'medium', high: 'high'
    };

    const densityLevel = densityMap[normalizeKey(String(raw.densityLevel || ''))] || 'medium';
    const maxTextElements = toOptionalNumber(raw.maxTextElements);
    const minWhitespacePct = toOptionalNumber(raw.minWhitespacePct);
    const safeMarginEnforced = typeof raw.safeMarginEnforced === 'boolean' ? raw.safeMarginEnforced : undefined;

    return {
        densityLevel,
        maxTextElements,
        minWhitespacePct,
        safeMarginEnforced
    };
}

function normalizePremiumRenderGuards(raw: unknown): RenderGuards | undefined {
    if (!isRecord(raw)) return undefined;

    const minContrastRatio = toNumber(raw.minContrastRatio, 4.5);
    const noTextOverflow = typeof raw.noTextOverflow === 'boolean' ? raw.noTextOverflow : undefined;
    const noElementCollision = typeof raw.noElementCollision === 'boolean' ? raw.noElementCollision : undefined;
    const noGenericBackgroundOnly = typeof raw.noGenericBackgroundOnly === 'boolean' ? raw.noGenericBackgroundOnly : undefined;
    const killIfMissingHero = typeof raw.killIfMissingHero === 'boolean' ? raw.killIfMissingHero : undefined;

    return {
        minContrastRatio,
        noTextOverflow,
        noElementCollision,
        noGenericBackgroundOnly,
        killIfMissingHero
    };
}

function normalizeCreativeSpec(
    raw: unknown,
    request: CreativeSpecRequest,
    businessModel: BusinessModel
): CreativeSpec {
    const rawSpec = isRecord(raw) ? raw : {};
    const groundedFacts = normalizeGroundedFacts(rawSpec.groundedFacts, request);

    const platform = normalizePlatform(rawSpec.platform, request.platform ?? 'meta_feed');
    const ratio = normalizeRatio(rawSpec.ratio, request.ratio ?? '1:1');
    const language = normalizeLanguage(rawSpec.language, request.language ?? 'de');

    const constraints = normalizeConstraints(rawSpec.constraints, ratio);
    const copy = normalizeCopy(rawSpec.copy, request, constraints, groundedFacts);
    const angle = normalizeAngle(rawSpec.angle, getDefaultAngle(request, groundedFacts));
    const creativePattern = normalizePattern(
        rawSpec.creativePattern,
        getDefaultPattern(request, businessModel, groundedFacts),
        businessModel
    );

    const assets = normalizeAssets(rawSpec.assets, creativePattern, businessModel, groundedFacts);
    const style = normalizeStyle(rawSpec.style, request.tone);
    const templateHints = normalizeTemplateHints(rawSpec.templateHints);
    const audience = normalizeAudience(rawSpec.audience, request, language, groundedFacts);

    // PREMIUM FIELDS
    const visualIntent = normalizePremiumVisualIntent(rawSpec.visualIntent);
    const layoutGeometry = normalizePremiumLayoutGeometry(rawSpec.layoutGeometry);
    const hierarchyRules = normalizePremiumHierarchyRules(rawSpec.hierarchyRules);
    const calloutRules = normalizePremiumCalloutRules(rawSpec.calloutRules);
    const densityAndSpacing = normalizePremiumDensityAndSpacing(rawSpec.densityAndSpacing);
    const renderGuards = normalizePremiumRenderGuards(rawSpec.renderGuards);

    return {
        businessModel,
        niche: getString(rawSpec.niche, request.productName),
        platform,
        ratio,
        language,
        audience,
        angle,
        creativePattern,
        copy,
        assets: { required: assets },
        groundedFacts,
        constraints,
        style,
        templateHints,
        visualIntent,
        layoutGeometry,
        hierarchyRules,
        calloutRules,
        densityAndSpacing,
        renderGuards
    };
}

/**
 * Generate CreativeSpec blueprints from request
 * 
 * This is the main entry point for spec generation.
 * Returns multiple spec variants with different angles/patterns.
 */
export async function generateCreativeSpecs(
    request: CreativeSpecRequest,
    options: SpecGenerationOptions
): Promise<SpecGenerationResult> {
    const startTime = Date.now();
    const {
        apiKey,
        variantCount = 5,
        model = process.env.OPENAI_SPEC_MODEL || 'gpt-4o',
        temperature = 0.8,
        maxRetries = 3,
        maxBudgetUSD = 0.50  // BLOCKER FIX: Default $0.50 budget cap
    } = options;

    // Infer business model if not provided
    const businessModel = options.businessModel || inferBusinessModel(
        request.productName,
        request.userPrompt
    );

    const openai = new OpenAI({ apiKey });
    const specs: CreativeSpec[] = [];
    const invalidSpecs: Array<{ spec: unknown; errors: unknown }> = [];
    let totalCost = 0;
    let apiCalls = 0;
    let validationAttempts = 0;

    // Build prompt
    const prompt = buildCreativeSpecPrompt(request, businessModel);

    // Build user message content (Text or Text+Image)
    let userContent: UserContent = prompt;

    if (request.imageBase64) {
        userContent = [
            {
                type: "text",
                text: `${prompt}\n\nIMPORTANT: I have attached an image of the product/asset. Analyze it deeply. 
                1. Identify the product type (e.g. software dashboard, physical product, food).
                2. Describe its visual style (e.g. dark mode, vibrant, minimal, industrial).
                3. Based on the image, choose the most appropriate 'creativePattern', 'colors', and 'background' style.
                4. If it looks like a software screenshot, use the 'saas' business model patterns.
                5. If it looks like a physical product without background, suggest a fitting environment.`
            },
            {
                type: "image_url",
                image_url: {
                    url: request.imageBase64, // Data URL is expected here
                    detail: "low" // Low detail is usually enough for style/type + faster/cheaper
                }
            }
        ];
    }

    // Generate multiple variants by varying temperature/seed
    for (let i = 0; i < variantCount; i++) {
        let attemptCount = 0;
        let validated: ValidatedCreativeSpec | null = null;

        while (attemptCount < maxRetries && !validated?.isValid) {
            try {
                const response = await openai.chat.completions.create({
                    model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert performance marketing creative strategist. Return only valid JSON.'
                        },
                        {
                            role: 'user',
                            content: userContent
                        }
                    ],
                    response_format: { type: 'json_object' },
                    temperature: temperature + (i * 0.05), // Slight temp variation per variant
                    max_tokens: 2000,
                    seed: 1000 + i // Different seed per variant for diversity
                });

                apiCalls++;
                const usage = response.usage;
                if (usage) {
                    // Estimate cost (gpt-4o pricing: $5/1M input, $15/1M output)
                    const inputCost = (usage.prompt_tokens / 1_000_000) * 5;
                    const outputCost = (usage.completion_tokens / 1_000_000) * 15;
                    totalCost += inputCost + outputCost;

                    // BLOCKER FIX: Budget enforcement
                    if (totalCost > maxBudgetUSD) {
                        break; // Exit variant generation loop
                    }
                }

                const content = response.choices[0].message.content;
                if (!content) {
                    throw new Error('Empty response from OpenAI');
                }

                // Parse and normalize initial draft
                let currentSpec = normalizeCreativeSpec(JSON.parse(content), request, businessModel);
                let premiumFixApplied = false;

                // =================================================================
                // PREMIUM FIX STEP (The "High-Fidelity" Pass)
                // =================================================================
                // We run this BEFORE final validation to upgrade the spec.
                // We only do this if we haven't exceeded budget (it costs ~1 call more).
                if (totalCost < maxBudgetUSD) {
                    try {
                        const fixPrompt = buildPremiumFixPrompt({
                            spec: currentSpec,
                            templateCapsule: null // No specific template forced yet
                        });

                        const fixResponse = await openai.chat.completions.create({
                            model, // Use same strong model
                            messages: [
                                { role: 'system', content: 'You are a targeted creative repair system. Output JSON only.' },
                                { role: 'user', content: fixPrompt }
                            ],
                            response_format: { type: 'json_object' },
                            temperature: 0.3, // Lower temp for strict fixing
                            seed: 2000 + i
                        });

                        apiCalls++;
                        if (fixResponse.usage) {
                            totalCost += (fixResponse.usage.prompt_tokens / 1_000_000 * 5) + (fixResponse.usage.completion_tokens / 1_000_000 * 15);
                        }

                        const fixedContent = fixResponse.choices[0].message.content;
                        if (fixedContent) {
                            const fixedSpec = JSON.parse(fixedContent) as Partial<CreativeSpec>;
                            // Merge relevant fields to keep any context the fixer might have dropped
                            const mergedSpec = { ...currentSpec, ...fixedSpec, businessModel: currentSpec.businessModel };
                            currentSpec = normalizeCreativeSpec(mergedSpec, request, businessModel);
                            premiumFixApplied = true;
                        }
                    } catch (fixError) {
                        // Fallback to currentSpec (Draft) if fix fails
                    }
                }

                // Validate against schema (Standard + Premium fields)
                validated = validateCreativeSpec(currentSpec);
                validationAttempts++;

                if (!validated.isValid) {
                    attemptCount++;
                } else {
                    // Add metadata
                    currentSpec.meta = {
                        generatedAt: new Date().toISOString(),
                        seed: 1000 + i,
                        variant: i + 1,
                        isPremiumFixed: premiumFixApplied
                    };
                    specs.push(currentSpec);
                }

            } catch (error) {
                attemptCount++;
            }
        }

        // If still invalid after retries, store for debugging
        if (validated && !validated.isValid) {
            invalidSpecs.push({
                spec: validated.spec,
                errors: validated.errors
            });
        }
    }

    if (specs.length === 0) {
        const fallbackSpec = normalizeCreativeSpec({}, request, businessModel);
        const fallbackValidation = validateCreativeSpec(fallbackSpec);
        if (fallbackValidation.isValid) {
            fallbackSpec.meta = {
                generatedAt: new Date().toISOString(),
                seed: 0,
                variant: 1,
                isPremiumFixed: false
            };
            specs.push(fallbackSpec);
        } else {
            invalidSpecs.push({
                spec: fallbackValidation.spec,
                errors: fallbackValidation.errors
            });
        }
    }

    const totalTime = Date.now() - startTime;

    return {
        specs,
        validSpecs: specs,
        invalidSpecs,
        telemetry: {
            totalCost,
            totalTime,
            apiCalls,
            validationAttempts
        }
    };
}

/**
 * Generate a single CreativeSpec (simplified API)
 */
export async function generateSingleSpec(
    request: CreativeSpecRequest,
    options: SpecGenerationOptions
): Promise<CreativeSpec | null> {
    const result = await generateCreativeSpecs(request, {
        ...options,
        variantCount: 1
    });

    return result.validSpecs[0] || null;
}
