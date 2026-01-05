import type { AdDocument, StudioLayer, TextLayer, CtaLayer, ImageLayer, ShapeLayer } from '../../types/studio';

/**
 * ENTERPRISE TEMPLATE GENERATOR V3
 * Industry-Specific, Conversion-Optimized Template System
 * 
 * Industries Supported:
 * - Dropshipping (Sales)
 * - E-Commerce (Product Features)
 * - Real Estate (Lead Generation)
 * - Lead Generation (Form Conversion)
 * - SaaS (Trial/Demo)
 * - Coaching (Transformation)
 * - Events (Ticket Sales)
 * - Services (Trust Building)
 * - Finance (Authority)
 * - Health/Fitness (Before/After)
 * 
 * Conversion Patterns:
 * - UGC Testimonial
 * - Hook-PAS (Problem-Agitate-Solve)
 * - Before/After Transformation
 * - Feature Grid
 * - Social Proof Max
 * - Scarcity/FOMO
 * - Question Hook
 * - Bold Statement
 * - Benefit Stack
 * - Pain Point Focus
 * - Dream Outcome
 * - Authority Proof
 */

export type Industry =
    | 'dropshipping'
    | 'ecommerce'
    | 'real_estate'
    | 'lead_generation'
    | 'saas'
    | 'coaching'
    | 'events'
    | 'services'
    | 'finance'
    | 'health_fitness';

export type ConversionPattern =
    | 'ugc_testimonial'
    | 'hook_pas'
    | 'before_after'
    | 'feature_grid'
    | 'social_proof_max'
    | 'scarcity_fomo'
    | 'question_hook'
    | 'bold_statement'
    | 'benefit_stack'
    | 'pain_point'
    | 'dream_outcome'
    | 'authority_proof';

export type ConversionGoal =
    | 'sales'           // Direct purchase
    | 'leads'           // Form submission
    | 'signups'         // Free trial/account
    | 'bookings'        // Appointment/demo
    | 'downloads'       // Lead magnet
    | 'registrations';  // Event/webinar

export interface IndustryTemplate {
    industry: Industry;
    conversionGoal: ConversionGoal;
    pattern: ConversionPattern;
    microComponents: MicroComponent[];
    psychologyProfile: PsychologyProfile;
}

export interface MicroComponent {
    type: 'discount_badge' | 'trust_badge' | 'countdown_timer' | 'review_stars' | 'guarantee_seal' | 'social_proof_count' | 'price_strikethrough' | 'urgency_label' | 'free_shipping_badge' | 'limited_stock_label';
    position: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'center_top' | 'above_cta' | 'below_headline';
    priority: number; // 1-10, determines visual prominence
}

export interface PsychologyProfile {
    readingPattern: 'F_pattern' | 'Z_pattern' | 'layer_cake' | 'spotted_pattern';
    attentionHotspots: Array<{ x: number; y: number; radius: number; importance: number }>;
    conversionPath: Array<'headline' | 'product' | 'benefit' | 'proof' | 'urgency' | 'cta'>;
    colorPsychology: 'trust' | 'urgency' | 'luxury' | 'energy' | 'calm';
}

/**
 * MAIN: Generate enterprise-grade template based on industry & goal
 */
export function generateEnterpriseTemplate(params: {
    industry: Industry;
    conversionGoal: ConversionGoal;
    brandColor: string;
    productName: string;
    tone?: string;
}): AdDocument {
    // Select best conversion pattern for industry + goal combination
    const pattern = selectOptimalPattern(params.industry, params.conversionGoal);

    // Get industry-specific configuration
    const industryConfig = getIndustryConfig(params.industry);

    // Build micro-components
    const microComponents = buildMicroComponents(params.industry, params.conversionGoal, pattern);

    // Generate psychology-optimized layout
    const psychologyProfile = getPsychologyProfile(pattern, params.conversionGoal);

    // Create base document
    const template = createBaseTemplate(params, pattern, industryConfig, microComponents, psychologyProfile);

    return template;
}

/**
 * Select optimal conversion pattern based on industry + goal
 */
function selectOptimalPattern(industry: Industry, goal: ConversionGoal): ConversionPattern {
    const patternMatrix: Record<Industry, Record<ConversionGoal, ConversionPattern>> = {
        dropshipping: {
            sales: 'scarcity_fomo',
            leads: 'benefit_stack',
            signups: 'social_proof_max',
            bookings: 'question_hook',
            downloads: 'hook_pas',
            registrations: 'benefit_stack'
        },
        ecommerce: {
            sales: 'feature_grid',
            leads: 'benefit_stack',
            signups: 'social_proof_max',
            bookings: 'question_hook',
            downloads: 'before_after',
            registrations: 'feature_grid'
        },
        real_estate: {
            sales: 'feature_grid',
            leads: 'dream_outcome',
            signups: 'question_hook',
            bookings: 'dream_outcome',
            downloads: 'benefit_stack',
            registrations: 'question_hook'
        },
        lead_generation: {
            sales: 'hook_pas',
            leads: 'benefit_stack',
            signups: 'social_proof_max',
            bookings: 'question_hook',
            downloads: 'hook_pas',
            registrations: 'benefit_stack'
        },
        saas: {
            sales: 'feature_grid',
            leads: 'hook_pas',
            signups: 'before_after',
            bookings: 'question_hook',
            downloads: 'benefit_stack',
            registrations: 'social_proof_max'
        },
        coaching: {
            sales: 'before_after',
            leads: 'dream_outcome',
            signups: 'ugc_testimonial',
            bookings: 'question_hook',
            downloads: 'pain_point',
            registrations: 'before_after'
        },
        events: {
            sales: 'scarcity_fomo',
            leads: 'benefit_stack',
            signups: 'social_proof_max',
            bookings: 'scarcity_fomo',
            downloads: 'hook_pas',
            registrations: 'scarcity_fomo'
        },
        services: {
            sales: 'authority_proof',
            leads: 'benefit_stack',
            signups: 'social_proof_max',
            bookings: 'authority_proof',
            downloads: 'hook_pas',
            registrations: 'benefit_stack'
        },
        finance: {
            sales: 'authority_proof',
            leads: 'benefit_stack',
            signups: 'social_proof_max',
            bookings: 'authority_proof',
            downloads: 'hook_pas',
            registrations: 'authority_proof'
        },
        health_fitness: {
            sales: 'before_after',
            leads: 'dream_outcome',
            signups: 'ugc_testimonial',
            bookings: 'question_hook',
            downloads: 'pain_point',
            registrations: 'before_after'
        }
    };

    return patternMatrix[industry][goal];
}

/**
 * Get industry-specific configuration
 */
function getIndustryConfig(industry: Industry) {
    const configs = {
        dropshipping: {
            emphasize: ['discount', 'social_proof', 'scarcity'],
            colorBias: 'urgency', // Red/Orange tones
            trustSignals: ['reviews', 'shipping', 'guarantee'],
            avgPrice: 'low',  // $10-50
            decisionSpeed: 'fast' // Impulse buy
        },
        ecommerce: {
            emphasize: ['features', 'quality', 'reviews'],
            colorBias: 'trust',
            trustSignals: ['reviews', 'badges', 'return_policy'],
            avgPrice: 'medium', // $50-200
            decisionSpeed: 'medium'
        },
        real_estate: {
            emphasize: ['location', 'features', 'value'],
            colorBias: 'luxury',
            trustSignals: ['agent_photo', 'certifications', 'testimonials'],
            avgPrice: 'high', // $100k+
            decisionSpeed: 'slow'
        },
        lead_generation: {
            emphasize: ['benefit', 'free', 'easy'],
            colorBias: 'trust',
            trustSignals: ['testimonials', 'case_studies', 'badges'],
            avgPrice: 'free', // Lead magnet
            decisionSpeed: 'fast'
        },
        saas: {
            emphasize: ['features', 'roi', 'trial'],
            colorBias: 'trust',
            trustSignals: ['integrations', 'uptime', 'support'],
            avgPrice: 'medium', // $50-500/mo
            decisionSpeed: 'medium'
        },
        coaching: {
            emphasize: ['transformation', 'credibility', 'results'],
            colorBias: 'energy',
            trustSignals: ['testimonials', 'before_after', 'certifications'],
            avgPrice: 'high', // $500-5000
            decisionSpeed: 'slow'
        },
        events: {
            emphasize: ['scarcity', 'lineup', 'experience'],
            colorBias: 'energy',
            trustSignals: ['speaker_logos', 'attendee_count', 'venue'],
            avgPrice: 'medium', // $50-500
            decisionSpeed: 'fast'
        },
        services: {
            emphasize: ['expertise', 'results', 'process'],
            colorBias: 'trust',
            trustSignals: ['certifications', 'portfolio', 'testimonials'],
            avgPrice: 'high', // $1000+
            decisionSpeed: 'slow'
        },
        finance: {
            emphasize: ['security', 'returns', 'credentials'],
            colorBias: 'trust',
            trustSignals: ['certifications', 'awards', 'track_record'],
            avgPrice: 'high', // $5000+
            decisionSpeed: 'slow'
        },
        health_fitness: {
            emphasize: ['transformation', 'proof', 'guarantee'],
            colorBias: 'energy',
            trustSignals: ['before_after', 'testimonials', 'certifications'],
            avgPrice: 'medium', // $50-300
            decisionSpeed: 'medium'
        }
    };

    return configs[industry];
}

/**
 * Build micro-components based on industry, goal, and pattern
 */
function buildMicroComponents(
    industry: Industry,
    goal: ConversionGoal,
    pattern: ConversionPattern
): MicroComponent[] {
    const components: MicroComponent[] = [];

    // Industry-specific components
    if (industry === 'dropshipping' || industry === 'ecommerce') {
        if (goal === 'sales') {
            components.push(
                { type: 'discount_badge', position: 'top_left', priority: 10 },
                { type: 'free_shipping_badge', position: 'above_cta', priority: 7 },
                { type: 'review_stars', position: 'below_headline', priority: 8 },
                { type: 'limited_stock_label', position: 'bottom_right', priority: 9 }
            );
        }
    }

    if (industry === 'real_estate') {
        components.push(
            { type: 'trust_badge', position: 'bottom_left', priority: 6 },
            { type: 'social_proof_count', position: 'below_headline', priority: 7 }
        );

        if (goal === 'bookings') {
            components.push(
                { type: 'urgency_label', position: 'above_cta', priority: 8 }
            );
        }
    }

    if (industry === 'saas' || industry === 'lead_generation') {
        if (goal === 'signups' || goal === 'leads') {
            components.push(
                { type: 'trust_badge', position: 'bottom_left', priority: 6 },
                { type: 'social_proof_count', position: 'below_headline', priority: 8 }
            );
        }
    }

    if (industry === 'events') {
        if (goal === 'sales' || goal === 'registrations') {
            components.push(
                { type: 'countdown_timer', position: 'above_cta', priority: 10 },
                { type: 'limited_stock_label', position: 'top_right', priority: 9 }
            );
        }
    }

    if (industry === 'coaching' || industry === 'health_fitness') {
        components.push(
            { type: 'guarantee_seal', position: 'bottom_right', priority: 7 },
            { type: 'review_stars', position: 'below_headline', priority: 8 }
        );
    }

    // Pattern-specific components
    if (pattern === 'scarcity_fomo') {
        components.push(
            { type: 'countdown_timer', position: 'above_cta', priority: 10 },
            { type: 'limited_stock_label', position: 'top_right', priority: 9 }
        );
    }

    if (pattern === 'social_proof_max') {
        components.push(
            { type: 'review_stars', position: 'below_headline', priority: 9 },
            { type: 'social_proof_count', position: 'below_headline', priority: 8 }
        );
    }

    return components;
}

/**
 * Get psychology profile for pattern and goal
 */
function getPsychologyProfile(pattern: ConversionPattern, _goal: ConversionGoal): PsychologyProfile {
    const profiles: Record<ConversionPattern, PsychologyProfile> = {
        ugc_testimonial: {
            readingPattern: 'F_pattern',
            attentionHotspots: [
                { x: 200, y: 300, radius: 150, importance: 10 }, // Face
                { x: 540, y: 800, radius: 100, importance: 8 },  // Quote
                { x: 540, y: 1200, radius: 120, importance: 9 }  // CTA
            ],
            conversionPath: ['headline', 'proof', 'benefit', 'cta'],
            colorPsychology: 'trust'
        },
        hook_pas: {
            readingPattern: 'Z_pattern',
            attentionHotspots: [
                { x: 540, y: 200, radius: 200, importance: 10 }, // Hook
                { x: 300, y: 600, radius: 150, importance: 8 },  // Problem
                { x: 700, y: 900, radius: 150, importance: 7 },  // Solution
                { x: 540, y: 1200, radius: 120, importance: 9 }  // CTA
            ],
            conversionPath: ['headline', 'product', 'benefit', 'urgency', 'cta'],
            colorPsychology: 'urgency'
        },
        before_after: {
            readingPattern: 'layer_cake',
            attentionHotspots: [
                { x: 270, y: 600, radius: 180, importance: 9 },  // Before
                { x: 810, y: 600, radius: 180, importance: 10 }, // After
                { x: 540, y: 1100, radius: 120, importance: 8 }  // CTA
            ],
            conversionPath: ['headline', 'product', 'proof', 'cta'],
            colorPsychology: 'energy'
        },
        feature_grid: {
            readingPattern: 'spotted_pattern',
            attentionHotspots: [
                { x: 300, y: 400, radius: 100, importance: 7 },
                { x: 780, y: 400, radius: 100, importance: 7 },
                { x: 300, y: 750, radius: 100, importance: 7 },
                { x: 780, y: 750, radius: 100, importance: 7 },
                { x: 540, y: 1150, radius: 120, importance: 9 }  // CTA
            ],
            conversionPath: ['headline', 'benefit', 'benefit', 'benefit', 'cta'],
            colorPsychology: 'trust'
        },
        social_proof_max: {
            readingPattern: 'F_pattern',
            attentionHotspots: [
                { x: 540, y: 250, radius: 150, importance: 8 },  // Stats
                { x: 540, y: 600, radius: 200, importance: 10 }, // Testimonials
                { x: 540, y: 1100, radius: 120, importance: 9 }  // CTA
            ],
            conversionPath: ['proof', 'headline', 'product', 'cta'],
            colorPsychology: 'trust'
        },
        scarcity_fomo: {
            readingPattern: 'Z_pattern',
            attentionHotspots: [
                { x: 200, y: 150, radius: 100, importance: 9 },  // Timer/Badge
                { x: 540, y: 400, radius: 180, importance: 8 },  // Product
                { x: 540, y: 950, radius: 150, importance: 7 },  // Urgency text
                { x: 540, y: 1200, radius: 120, importance: 10 } // CTA
            ],
            conversionPath: ['urgency', 'product', 'headline', 'cta'],
            colorPsychology: 'urgency'
        },
        question_hook: {
            readingPattern: 'F_pattern',
            attentionHotspots: [
                { x: 540, y: 200, radius: 200, importance: 10 }, // Question
                { x: 540, y: 600, radius: 180, importance: 8 },  // Answer/Product
                { x: 540, y: 1100, radius: 120, importance: 9 }  // CTA
            ],
            conversionPath: ['headline', 'product', 'benefit', 'cta'],
            colorPsychology: 'trust'
        },
        bold_statement: {
            readingPattern: 'layer_cake',
            attentionHotspots: [
                { x: 540, y: 300, radius: 250, importance: 10 }, // Bold headline
                { x: 540, y: 750, radius: 180, importance: 7 },  // Product
                { x: 540, y: 1150, radius: 120, importance: 9 }  // CTA
            ],
            conversionPath: ['headline', 'product', 'cta'],
            colorPsychology: 'energy'
        },
        benefit_stack: {
            readingPattern: 'F_pattern',
            attentionHotspots: [
                { x: 200, y: 400, radius: 100, importance: 7 },
                { x: 200, y: 600, radius: 100, importance: 7 },
                { x: 200, y: 800, radius: 100, importance: 7 },
                { x: 540, y: 1150, radius: 120, importance: 9 }
            ],
            conversionPath: ['headline', 'benefit', 'benefit', 'benefit', 'cta'],
            colorPsychology: 'trust'
        },
        pain_point: {
            readingPattern: 'Z_pattern',
            attentionHotspots: [
                { x: 540, y: 250, radius: 180, importance: 9 },  // Pain
                { x: 540, y: 700, radius: 200, importance: 10 }, // Solution
                { x: 540, y: 1150, radius: 120, importance: 9 }  // CTA
            ],
            conversionPath: ['headline', 'product', 'benefit', 'cta'],
            colorPsychology: 'urgency'
        },
        dream_outcome: {
            readingPattern: 'layer_cake',
            attentionHotspots: [
                { x: 540, y: 350, radius: 220, importance: 10 }, // Dream visual
                { x: 540, y: 850, radius: 150, importance: 8 },  // Path
                { x: 540, y: 1150, radius: 120, importance: 9 }  // CTA
            ],
            conversionPath: ['product', 'headline', 'benefit', 'cta'],
            colorPsychology: 'luxury'
        },
        authority_proof: {
            readingPattern: 'F_pattern',
            attentionHotspots: [
                { x: 540, y: 200, radius: 150, importance: 8 },  // Credentials
                { x: 540, y: 550, radius: 180, importance: 9 },  // Expertise
                { x: 540, y: 900, radius: 150, importance: 7 },  // Social proof
                { x: 540, y: 1150, radius: 120, importance: 9 }  // CTA
            ],
            conversionPath: ['proof', 'headline', 'benefit', 'cta'],
            colorPsychology: 'trust'
        }
    };

    return profiles[pattern];
}

/**
 * Create base template with all layers
 */
function createBaseTemplate(
    params: {
        industry: Industry;
        conversionGoal: ConversionGoal;
        brandColor: string;
        productName: string;
    },
    pattern: ConversionPattern,
    industryConfig: unknown,
    microComponents: MicroComponent[],
    psychologyProfile: PsychologyProfile
): AdDocument {
    const layers: StudioLayer[] = [];

    // Background layer
    layers.push(createBackgroundLayer(params.brandColor, psychologyProfile.colorPsychology));

    // Pattern-specific layers
    const patternLayers = createPatternLayers(pattern, params, psychologyProfile);
    layers.push(...patternLayers);

    // Micro-components
    const microLayers = createMicroComponentLayers(microComponents, params);
    layers.push(...microLayers);

    // CTA button (always last, highest z-index)
    const ctaLayer = createCTALayer(params, psychologyProfile, industryConfig);
    layers.push(ctaLayer);

    return {
        id: `enterprise_${params.industry}_${pattern}_${Date.now()}`,
        name: `${params.industry} - ${pattern} - ${params.conversionGoal}`,
        width: 1080,
        height: 1080,
        backgroundColor: getBackgroundColor(params.brandColor, psychologyProfile.colorPsychology),
        layers
    };
}

/**
 * Create background layer with psychology-optimized color
 */
function createBackgroundLayer(_brandColor: string, _colorPsych: PsychologyProfile['colorPsychology']): ImageLayer {
    // const bgColors = {
    //     trust: '#F9FAFB',    // Off-white (safe, clean)
    //     urgency: '#FEF2F2',  // Light red tint (action)
    //     luxury: '#FAFAF9',   // Warm white (elegant)
    //     energy: '#FFFBEB',   // Light yellow tint (exciting)
    //     calm: '#F0F9FF'      // Light blue tint (peaceful)
    // };

    return {
        id: 'bg_enterprise',
        type: 'background',
        name: 'Background',
        x: 0,
        y: 0,
        width: 1080,
        height: 1080,
        zIndex: 0,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        src: '' // Solid color via fill or gradient
    };
}

/**
 * Create pattern-specific layers
 */
function createPatternLayers(
    pattern: ConversionPattern,
    params: unknown,
    psychologyProfile: PsychologyProfile
): StudioLayer[] {
    const generators: Record<ConversionPattern, () => StudioLayer[]> = {
        ugc_testimonial: () => createUGCTestimonialLayers(params, psychologyProfile),
        hook_pas: () => createHookPASLayers(params, psychologyProfile),
        before_after: () => createBeforeAfterLayers(params, psychologyProfile),
        feature_grid: () => createFeatureGridLayers(params, psychologyProfile),
        social_proof_max: () => createSocialProofMaxLayers(params, psychologyProfile),
        scarcity_fomo: () => createScarcityFOMOLayers(params, psychologyProfile),
        question_hook: () => createQuestionHookLayers(params, psychologyProfile),
        bold_statement: () => createBoldStatementLayers(params, psychologyProfile),
        benefit_stack: () => createBenefitStackLayers(params, psychologyProfile),
        pain_point: () => createPainPointLayers(params, psychologyProfile),
        dream_outcome: () => createDreamOutcomeLayers(params, psychologyProfile),
        authority_proof: () => createAuthorityProofLayers(params, psychologyProfile)
    };

    return generators[pattern]();
}

// ========== PATTERN LAYER GENERATORS ==========
// Each function creates optimized layout for specific pattern

function createUGCTestimonialLayers(_params: any, _psych: PsychologyProfile): StudioLayer[] {
    return [
        // User photo/avatar (top-left, builds trust)
        {
            id: 'ugc_avatar',
            type: 'overlay',
            name: 'User Avatar',
            x: 80,
            y: 150,
            width: 180,
            height: 180,
            zIndex: 2,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            src: '' // User photo placeholder
        } as ImageLayer,

        // Testimonial quote (F-pattern: left-aligned)
        {
            id: 'testimonial_quote',
            type: 'text',
            name: 'Testimonial',
            x: 90,
            y: 370,
            width: 900,
            height: 350,
            zIndex: 3,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            text: '"This product changed my life. I saw results in just 7 days!"',
            fontSize: 38,
            fontFamily: 'Inter',
            fontWeight: 600,
            color: '#1F2937',
            fill: '#1F2937',
            align: 'left',
            lineHeight: 1.4
        } as TextLayer,

        // User name + verification
        {
            id: 'user_name',
            type: 'text',
            name: 'User Name',
            x: 90,
            y: 760,
            width: 600,
            height: 60,
            zIndex: 3,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            text: '— Sarah M., Verified Buyer ✓',
            fontSize: 22,
            fontFamily: 'Inter',
            fontWeight: 500,
            color: '#6B7280',
            fill: '#6B7280',
            align: 'left',
            lineHeight: 1.3
        } as TextLayer,

        // Product image (supporting visual)
        {
            id: 'product_ugc',
            type: 'product',
            name: 'Product',
            x: 200,
            y: 870,
            width: 680,
            height: 350,
            zIndex: 2,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            src: ''
        } as ImageLayer
    ];
}

function createHookPASLayers(_params: any, _psych: PsychologyProfile): StudioLayer[] {
    return [
        // Hook headline (Z-pattern: top)
        {
            id: 'hook_headline',
            type: 'text',
            name: 'Hook',
            x: 60,
            y: 120,
            width: 960,
            height: 180,
            zIndex: 4,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            text: 'STOP! Are You Making This Mistake?',
            fontSize: 56,
            fontFamily: 'Inter',
            fontWeight: 900,
            color: '#DC2626',
            fill: '#DC2626',
            align: 'center',
            lineHeight: 1.1
        } as TextLayer,

        // Problem (agitate)
        {
            id: 'problem_text',
            type: 'text',
            name: 'Problem',
            x: 80,
            y: 340,
            width: 920,
            height: 200,
            zIndex: 3,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            text: '97% of people waste money on solutions that don\'t work...',
            fontSize: 32,
            fontFamily: 'Inter',
            fontWeight: 600,
            color: '#374151',
            fill: '#374151',
            align: 'center',
            lineHeight: 1.3
        } as TextLayer,

        // Product (solution)
        {
            id: 'product_solution',
            type: 'product',
            name: 'Product Solution',
            x: 190,
            y: 600,
            width: 700,
            height: 450,
            zIndex: 2,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            src: ''
        } as ImageLayer
    ];
}

function createBeforeAfterLayers(_params: any, _psych: PsychologyProfile): StudioLayer[] {
    return [
        // "Before/After" label
        {
            id: 'ba_label',
            type: 'text',
            name: 'Before/After Label',
            x: 60,
            y: 100,
            width: 960,
            height: 100,
            zIndex: 4,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            text: 'REAL RESULTS IN 30 DAYS',
            fontSize: 44,
            fontFamily: 'Inter',
            fontWeight: 800,
            color: '#059669',
            fill: '#059669',
            align: 'center',
            lineHeight: 1.2
        } as TextLayer,

        // Before image (left)
        {
            id: 'before_image',
            type: 'overlay',
            name: 'Before',
            x: 60,
            y: 250,
            width: 460,
            height: 600,
            zIndex: 2,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            src: '' // Before photo
        } as ImageLayer,

        // "Before" text overlay
        {
            id: 'before_label',
            type: 'text',
            name: 'Before Label',
            x: 80,
            y: 780,
            width: 420,
            height: 50,
            zIndex: 5,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            text: 'BEFORE',
            fontSize: 28,
            fontFamily: 'Inter',
            fontWeight: 800,
            color: '#FFFFFF',
            fill: '#FFFFFF',
            align: 'center',
            lineHeight: 1.2
        } as TextLayer,

        // After image (right)
        {
            id: 'after_image',
            type: 'product',
            name: 'After',
            x: 560,
            y: 250,
            width: 460,
            height: 600,
            zIndex: 2,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            src: '', // After photo
            shadowColor: '#000000',
            shadowBlur: 30,
            shadowOffsetX: 0,
            shadowOffsetY: 10,
            shadowOpacity: 0.3
        } as ImageLayer,

        // "After" text overlay
        {
            id: 'after_label',
            type: 'text',
            name: 'After Label',
            x: 580,
            y: 780,
            width: 420,
            height: 50,
            zIndex: 5,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            text: 'AFTER',
            fontSize: 28,
            fontFamily: 'Inter',
            fontWeight: 800,
            color: '#FFFFFF',
            fill: '#FFFFFF',
            align: 'center',
            lineHeight: 1.2
        } as TextLayer
    ];
}

function createFeatureGridLayers(_params: any, _psych: PsychologyProfile): StudioLayer[] {
    return [
        // Main headline
        {
            id: 'feature_headline',
            type: 'text',
            name: 'Headline',
            x: 60,
            y: 100,
            width: 960,
            height: 120,
            zIndex: 4,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            text: 'Everything You Need',
            fontSize: 52,
            fontFamily: 'Inter',
            fontWeight: 800,
            color: '#111827',
            fill: '#111827',
            align: 'center',
            lineHeight: 1.2
        } as TextLayer,

        // Product image (center-top)
        {
            id: 'product_grid',
            type: 'product',
            name: 'Product',
            x: 240,
            y: 260,
            width: 600,
            height: 400,
            zIndex: 2,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            src: ''
        } as ImageLayer,

        // Feature 1 (checkmark + text)
        {
            id: 'feature_1',
            type: 'text',
            name: 'Feature 1',
            x: 100,
            y: 720,
            width: 880,
            height: 60,
            zIndex: 3,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            text: '✓ Premium Quality Materials',
            fontSize: 28,
            fontFamily: 'Inter',
            fontWeight: 600,
            color: '#059669',
            fill: '#059669',
            align: 'left',
            lineHeight: 1.3
        } as TextLayer,

        // Feature 2
        {
            id: 'feature_2',
            type: 'text',
            name: 'Feature 2',
            x: 100,
            y: 810,
            width: 880,
            height: 60,
            zIndex: 3,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            text: '✓ 30-Day Money Back Guarantee',
            fontSize: 28,
            fontFamily: 'Inter',
            fontWeight: 600,
            color: '#059669',
            fill: '#059669',
            align: 'left',
            lineHeight: 1.3
        } as TextLayer,

        // Feature 3
        {
            id: 'feature_3',
            type: 'text',
            name: 'Feature 3',
            x: 100,
            y: 900,
            width: 880,
            height: 60,
            zIndex: 3,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            text: '✓ Free Shipping Worldwide',
            fontSize: 28,
            fontFamily: 'Inter',
            fontWeight: 600,
            color: '#059669',
            fill: '#059669',
            align: 'left',
            lineHeight: 1.3
        } as TextLayer
    ];
}

function createSocialProofMaxLayers(_params: any, _psych: PsychologyProfile): StudioLayer[] {
    return [
        // Big stat (trust builder)
        {
            id: 'stat_headline',
            type: 'text',
            name: 'Social Proof Stat',
            x: 60,
            y: 120,
            width: 960,
            height: 200,
            zIndex: 4,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            text: '50,000+ Happy Customers',
            fontSize: 58,
            fontFamily: 'Inter',
            fontWeight: 900,
            color: '#1F2937',
            fill: '#1F2937',
            align: 'center',
            lineHeight: 1.1
        } as TextLayer,

        // Review stars
        {
            id: 'review_stars',
            type: 'text',
            name: 'Stars',
            x: 60,
            y: 350,
            width: 960,
            height: 80,
            zIndex: 3,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            text: '⭐⭐⭐⭐⭐ 4.9/5.0 (12,450 Reviews)',
            fontSize: 42,
            fontFamily: 'Inter',
            fontWeight: 700,
            color: '#F59E0B',
            fill: '#F59E0B',
            align: 'center',
            lineHeight: 1.2
        } as TextLayer,

        // Product
        {
            id: 'product_social',
            type: 'product',
            name: 'Product',
            x: 240,
            y: 490,
            width: 600,
            height: 450,
            zIndex: 2,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            src: ''
        } as ImageLayer,

        // Mini testimonial
        {
            id: 'mini_testimonial',
            type: 'text',
            name: 'Testimonial',
            x: 100,
            y: 990,
            width: 880,
            height: 100,
            zIndex: 3,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            text: '"Best purchase I\'ve made this year!" - Jennifer K.',
            fontSize: 24,
            fontFamily: 'Inter',
            fontWeight: 500,
            fontStyle: 'italic',
            color: '#6B7280',
            fill: '#6B7280',
            align: 'center',
            lineHeight: 1.4
        } as TextLayer
    ];
}

function createScarcityFOMOLayers(_params: any, _psych: PsychologyProfile): StudioLayer[] {
    return [
        // Urgency headline
        {
            id: 'urgency_headline',
            type: 'text',
            name: 'Urgency',
            x: 60,
            y: 180,
            width: 960,
            height: 150,
            zIndex: 5,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            text: 'SALE ENDS IN 3 HOURS!',
            fontSize: 62,
            fontFamily: 'Inter',
            fontWeight: 900,
            color: '#DC2626',
            fill: '#DC2626',
            align: 'center',
            lineHeight: 1.1
        } as TextLayer,

        // Product
        {
            id: 'product_fomo',
            type: 'product',
            name: 'Product',
            x: 190,
            y: 400,
            width: 700,
            height: 550,
            zIndex: 2,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            src: ''
        } as ImageLayer,

        // Stock warning
        {
            id: 'stock_warning',
            type: 'text',
            name: 'Stock Warning',
            x: 100,
            y: 1000,
            width: 880,
            height: 80,
            zIndex: 4,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            text: '⚠️ Only 7 Left in Stock',
            fontSize: 36,
            fontFamily: 'Inter',
            fontWeight: 800,
            color: '#EA580C',
            fill: '#EA580C',
            align: 'center',
            lineHeight: 1.2
        } as TextLayer
    ];
}

// Simpler implementations for remaining patterns...
function createQuestionHookLayers(_params: any, _psych: PsychologyProfile): StudioLayer[] {
    return [
        {
            id: 'question',
            type: 'text',
            name: 'Question Hook',
            x: 60,
            y: 150,
            width: 960,
            height: 200,
            zIndex: 4,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            text: 'Tired of Products That Don\'t Deliver?',
            fontSize: 52,
            fontFamily: 'Inter',
            fontWeight: 800,
            color: '#1F2937',
            fill: '#1F2937',
            align: 'center',
            lineHeight: 1.2
        } as TextLayer,
        {
            id: 'product_answer',
            type: 'product',
            name: 'Product',
            x: 190,
            y: 420,
            width: 700,
            height: 550,
            zIndex: 2,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            src: '',
            shadowColor: '#000000',
            shadowBlur: 30,
            shadowOffsetX: 0,
            shadowOffsetY: 10,
            shadowOpacity: 0.3
        } as ImageLayer
    ];
}

function createBoldStatementLayers(_params: any, _psych: PsychologyProfile): StudioLayer[] {
    return [
        {
            id: 'bold_headline',
            type: 'text',
            name: 'Bold Statement',
            x: 40,
            y: 180,
            width: 1000,
            height: 250,
            zIndex: 5,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            text: 'The ONLY Product You\'ll Ever Need',
            fontSize: 68,
            fontFamily: 'Inter',
            fontWeight: 900,
            color: '#111827',
            fill: '#111827',
            align: 'center',
            lineHeight: 1.05
        } as TextLayer,
        {
            id: 'product_bold',
            type: 'product',
            name: 'Product',
            x: 190,
            y: 500,
            width: 700,
            height: 550,
            zIndex: 2,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            src: '',
            shadowColor: '#000000',
            shadowBlur: 30,
            shadowOffsetX: 0,
            shadowOffsetY: 10,
            shadowOpacity: 0.3
        } as ImageLayer
    ];
}

function createBenefitStackLayers(_params: any, _psych: PsychologyProfile): StudioLayer[] {
    const benefits = [
        '✓ Save 3 Hours Every Day',
        '✓ Increase Productivity 10x',
        '✓ Get Results in 7 Days'
    ];

    return benefits.map((benefit, i) => ({
        id: `benefit_${i}`,
        type: 'text',
        name: `Benefit ${i + 1}`,
        x: 100,
        y: 350 + (i * 120),
        width: 880,
        height: 90,
        zIndex: 3,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        text: benefit,
        fontSize: 36,
        fontFamily: 'Inter',
        fontWeight: 700,
        color: '#059669',
        fill: '#059669',
        align: 'left',
        lineHeight: 1.3
    } as TextLayer));
}

function createPainPointLayers(params: any, psych: PsychologyProfile): StudioLayer[] {
    return createHookPASLayers(params, psych); // Similar pattern
}

function createDreamOutcomeLayers(_params: any, _psych: PsychologyProfile): StudioLayer[] {
    return [
        {
            id: 'dream_visual',
            type: 'product',
            name: 'Dream Outcome',
            x: 140,
            y: 200,
            width: 800,
            height: 650,
            zIndex: 2,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            src: '',
            shadowColor: '#000000',
            shadowBlur: 30,
            shadowOffsetX: 0,
            shadowOffsetY: 10,
            shadowOpacity: 0.3
        } as ImageLayer,
        {
            id: 'dream_text',
            type: 'text',
            name: 'Dream Description',
            x: 80,
            y: 920,
            width: 920,
            height: 150,
            zIndex: 3,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            text: 'Imagine Living Your Best Life',
            fontSize: 48,
            fontFamily: 'Inter',
            fontWeight: 800,
            color: '#1F2937',
            fill: '#1F2937',
            align: 'center',
            lineHeight: 1.2
        } as TextLayer
    ];
}

function createAuthorityProofLayers(_params: any, _psych: PsychologyProfile): StudioLayer[] {
    return [
        {
            id: 'authority_badge',
            type: 'text',
            name: 'Authority',
            x: 60,
            y: 120,
            width: 960,
            height: 100,
            zIndex: 4,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            text: 'As Featured In Forbes, TechCrunch & WSJ',
            fontSize: 28,
            fontFamily: 'Inter',
            fontWeight: 600,
            color: '#6B7280',
            fill: '#6B7280',
            align: 'center',
            lineHeight: 1.3
        } as TextLayer,
        {
            id: 'expert_photo',
            type: 'overlay',
            name: 'Expert',
            x: 340,
            y: 280,
            width: 400,
            height: 400,
            zIndex: 2,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            src: '',
            shadowColor: '#000000',
            shadowBlur: 30,
            shadowOffsetX: 0,
            shadowOffsetY: 10,
            shadowOpacity: 0.3
        } as ImageLayer,
        {
            id: 'credentials',
            type: 'text',
            name: 'Credentials',
            x: 100,
            y: 740,
            width: 880,
            height: 120,
            zIndex: 3,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            text: 'Dr. John Smith, PhD\n20 Years Experience | 500+ Success Stories',
            fontSize: 24,
            fontFamily: 'Inter',
            fontWeight: 600,
            color: '#374151',
            fill: '#374151',
            align: 'center',
            lineHeight: 1.4
        } as TextLayer
    ];
}

/**
 * Create micro-component layers (badges, timers, etc.)
 */
function createMicroComponentLayers(components: MicroComponent[], _params: any): StudioLayer[] {
    const layers: StudioLayer[] = [];

    components.forEach(comp => {
        const position = getMicroComponentPosition(comp.position);
        const layer = createMicroComponentLayer(comp.type, position, comp.priority);
        if (layer) layers.push(layer);
    });

    return layers;
}

function getMicroComponentPosition(pos: MicroComponent['position']): { x: number; y: number } {
    const positions = {
        top_left: { x: 40, y: 40 },
        top_right: { x: 820, y: 40 },
        bottom_left: { x: 40, y: 960 },
        bottom_right: { x: 820, y: 960 },
        center_top: { x: 390, y: 40 },
        above_cta: { x: 100, y: 880 },
        below_headline: { x: 100, y: 320 }
    };

    return positions[pos];
}

function createMicroComponentLayer(
    type: MicroComponent['type'],
    position: { x: number; y: number },
    priority: number
): StudioLayer | null {
    const baseLayer = {
        x: position.x,
        y: position.y,
        zIndex: 50 + priority, // Micro-components on top
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true
    };

    switch (type) {
        case 'discount_badge':
            return {
                ...baseLayer,
                id: 'badge_discount',
                type: 'shape',
                name: 'Discount Badge',
                width: 200,
                height: 200,
                fill: '#DC2626',
                cornerRadius: 100
            } as ShapeLayer;

        case 'review_stars':
            return {
                ...baseLayer,
                id: 'micro_stars',
                type: 'text',
                name: 'Review Stars',
                width: 300,
                height: 50,
                text: '⭐⭐⭐⭐⭐ 4.9/5.0',
                fontSize: 24,
                fontFamily: 'Inter',
                fontWeight: 700,
                color: '#F59E0B',
                fill: '#F59E0B',
                align: 'left',
                lineHeight: 1.2
            } as TextLayer;

        case 'countdown_timer':
            return {
                ...baseLayer,
                id: 'timer',
                type: 'text',
                name: 'Countdown',
                width: 400,
                height: 80,
                text: '⏰ 03:24:17 Remaining',
                fontSize: 32,
                fontFamily: 'Inter',
                fontWeight: 800,
                color: '#DC2626',
                fill: '#DC2626',
                align: 'center',
                lineHeight: 1.2
            } as TextLayer;

        case 'limited_stock_label':
            return {
                ...baseLayer,
                id: 'stock_label',
                type: 'text',
                name: 'Stock Warning',
                width: 220,
                height: 60,
                text: 'Only 3 Left!',
                fontSize: 20,
                fontFamily: 'Inter',
                fontWeight: 800,
                color: '#FFFFFF',
                fill: '#FFFFFF',
                align: 'center',
                lineHeight: 1.2
            } as TextLayer;

        default:
            return null;
    }
}

/**
 * Create CTA layer with conversion optimization
 */
function createCTALayer(params: any, psych: PsychologyProfile, _industryConfig: any): CtaLayer {
    const ctaTexts: Record<ConversionGoal, string> = {
        sales: 'BUY NOW',
        leads: 'GET FREE GUIDE',
        signups: 'START FREE TRIAL',
        bookings: 'BOOK NOW',
        downloads: 'DOWNLOAD FREE',
        registrations: 'REGISTER TODAY'
    };

    const ctaColors = {
        trust: '#2563EB',    // Blue
        urgency: '#DC2626',  // Red
        luxury: '#000000',   // Black
        energy: '#F59E0B',   // Orange
        calm: '#059669'      // Green
    };

    const goal = params.conversionGoal as ConversionGoal;

    return {
        id: 'cta_enterprise',
        type: 'cta',
        name: 'CTA Button',
        x: 140,
        y: 930,
        width: 800,
        height: 110,
        zIndex: 100, // Highest
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        text: ctaTexts[goal] || 'GET STARTED',
        fontSize: 36,
        fontFamily: 'Inter',
        fontWeight: 900,
        lineHeight: 1.2,
        color: '#FFFFFF',
        bgColor: ctaColors[psych.colorPsychology],
        radius: 12
    };
}

function getBackgroundColor(brandColor: string, colorPsych: PsychologyProfile['colorPsychology']): string {
    const bgColors = {
        trust: '#F9FAFB',
        urgency: '#FEF2F2',
        luxury: '#FAFAF9',
        energy: '#FFFBEB',
        calm: '#F0F9FF'
    };

    return bgColors[colorPsych];
}
