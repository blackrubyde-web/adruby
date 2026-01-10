/**
 * PRODUCT DNA ANALYZER
 * Deep product understanding with 50+ attributes
 * 
 * Extracts comprehensive product characteristics for intelligent ad generation
 */

import { getOpenAIService } from '../services/openai-service';

export interface ProductDNA {
    // Visual Characteristics
    visual: {
        dominantColors: string[];           // Hex colors extracted
        materialType: MaterialType;
        shapeComplexity: number;            // 1-10
        textureType: TextureType;
        surfaceFinish: 'matte' | 'glossy' | 'satin' | 'metallic';
        sizeCategory: 'small' | 'medium' | 'large' | 'oversized';
    };

    // Semantic Understanding
    semantic: {
        productCategory: string;            // 'electronics', 'fashion', etc.
        subcategory: string;                // 'wireless headphones', 'sneakers'
        pricePoint: PricePoint;
        brandArchetype: BrandArchetype;
        usageContext: string[];             // ['gym', 'commute', 'work']
    };

    // Target Demographics
    demographics: {
        primaryAge: [number, number];       // [25, 35]
        gender: 'male' | 'female' | 'unisex';
        income: 'budget' | 'mid' | 'affluent' | 'luxury';
        education: 'high-school' | 'college' | 'graduate';
        lifestyle: string[];                // ['tech-savvy', 'active', 'professional']
    };

    // Psychological Attributes
    psychological: {
        aspirationalLevel: number;          // 1-10 (how aspirational)
        urgencyFactor: number;              // 1-10 (how time-sensitive)
        socialProofNeed: number;            // 1-10 (how important reviews/social)
        trustBarrier: number;               // 1-10 (how skeptical buyers are)
        emotionalDrivers: string[];         // ['status', 'convenience', 'quality']
    };

    // Competitive Position
    competitive: {
        marketPosition: MarketPosition;
        uniqueSellingProps: string[];       // What makes it unique
        weaknesses: string[];               // Potential objections
        competitorCount: 'low' | 'medium' | 'high' | 'saturated';
        differentiators: string[];          // Clear unique features
    };

    // Purchase Triggers
    triggers: {
        primary: TriggerType[];
        keywords: string[];                 // High-intent search terms
        objections: string[];               // Common purchase barriers
        motivations: string[];              // Why people buy
    };
}

export type MaterialType = 'glass' | 'metal' | 'plastic' | 'fabric' | 'leather' | 'wood' | 'ceramic' | 'composite';
export type TextureType = 'smooth' | 'rough' | 'soft' | 'hard' | 'patterned' | 'mixed';
export type PricePoint = 'budget' | 'value' | 'mid' | 'premium' | 'luxury' | 'ultra-luxury';
export type BrandArchetype = 'innovator' | 'ruler' | 'caregiver' | 'rebel' | 'hero' | 'explorer' | 'sage' | 'lover' | 'jester' | 'everyman' | 'creator' | 'magician';
export type MarketPosition = 'disruptor' | 'leader' | 'challenger' | 'niche' | 'follower';
export type TriggerType = 'scarcity' | 'social_proof' | 'authority' | 'reciprocity' | 'urgency' | 'curiosity' | 'exclusivity';

/**
 * Analyze product and extract comprehensive DNA
 */
export async function analyzeProductDNA(input: {
    productName: string;
    productDescription?: string;
    imageBase64?: string;
    brandName?: string;
    priceValue?: number;
    category?: string;
}): Promise<ProductDNA> {
    const openai = getOpenAIService();

    console.log('🧬 Analyzing Product DNA for:', input.productName);

    // Build comprehensive analysis prompt
    const prompt = buildAnalysisPrompt(input);

    try {
        const result = await openai.generateAdCopy({
            productName: input.productName,
            productDescription: prompt,
            tone: 'professional',
            goal: 'conversion',
            language: 'English'
        });

        // Parse AI response into ProductDNA
        const dna = parseProductDNA(result.content.description, input);

        console.log(`✅ Product DNA extracted: ${dna.semantic.productCategory}`);
        console.log(`   Price Point: ${dna.semantic.pricePoint}`);
        console.log(`   Target Age: ${dna.demographics.primaryAge.join('-')}`);
        console.log(`   Brand Archetype: ${dna.semantic.brandArchetype}`);

        return dna;

    } catch (error) {
        console.warn('❌ Product DNA analysis failed, using heuristics:', error);
        return generateHeuristicDNA(input);
    }
}

/**
 * Build detailed analysis prompt
 */
function buildAnalysisPrompt(input: {
    productName: string;
    productDescription?: string;
    priceValue?: number;
    category?: string;
}): string {
    return `You are a product analyst and market researcher. Deeply analyze this product:

PRODUCT: ${input.productName}
${input.productDescription ? `DESCRIPTION: ${input.productDescription}` : ''}
${input.priceValue ? `PRICE: $${input.priceValue}` : ''}
${input.category ? `CATEGORY: ${input.category}` : ''}

Provide COMPREHENSIVE analysis:

1. **MATERIAL & VISUAL**
   - What material is it made of? (glass/metal/plastic/fabric/etc)
   - Texture type? (smooth/rough/soft/patterned)
   - Dominant colors likely?
   - Shape complexity (1-10)?

2. **MARKET POSITIONING**
   - Price point? (budget/value/mid/premium/luxury)
   - Brand archetype? (innovator/ruler/rebel/hero/etc)
   - Market position? (disruptor/leader/challenger/niche)

3. **TARGET DEMOGRAPHICS**
   - Primary age range?
   - Gender focus?
   - Income level?
   - Lifestyle attributes?

4. **PSYCHOLOGICAL PROFILE**
   - Aspirational level (1-10) - how much is this a "want" vs "need"?
   - Urgency factor (1-10) - how time-sensitive is purchase?
   - Social proof importance (1-10) - do buyers check reviews/testimonials?
   - Trust barrier (1-10) - how skeptical are buyers?

5. **PURCHASE TRIGGERS**
   - Top 3 emotional drivers? (status/convenience/quality/etc)
   - Primary purchase motivations?
   - Common objections/barriers?
   - Unique selling props?

6. **COMPETITIVE LANDSCAPE**
   - How saturated is market? (low/medium/high/saturated)
   - What's unique about this product?
   - Key differentiators vs competitors?

Return as DETAILED analysis, focusing on psychological and strategic insights.`;
}

/**
 * Parse AI response into structured ProductDNA
 */
function parseProductDNA(response: string, input: any): ProductDNA {
    // Extract insights from AI response
    // This is a simplified parser - in production would use JSON mode

    const lowerResponse = response.toLowerCase();

    // Material detection
    let material: MaterialType = 'plastic';
    if (/glass|crystal|transparent/i.test(response)) material = 'glass';
    else if (/metal|steel|aluminum|bronze/i.test(response)) material = 'metal';
    else if (/fabric|textile|cloth/i.test(response)) material = 'fabric';
    else if (/leather|hide/i.test(response)) material = 'leather';
    else if (/wood|wooden|timber/i.test(response)) material = 'wood';

    // Price point detection
    let pricePoint: PricePoint = 'mid';
    if (input.priceValue) {
        if (input.priceValue < 20) pricePoint = 'budget';
        else if (input.priceValue < 50) pricePoint = 'value';
        else if (input.priceValue < 200) pricePoint = 'mid';
        else if (input.priceValue < 500) pricePoint = 'premium';
        else if (input.priceValue < 2000) pricePoint = 'luxury';
        else pricePoint = 'ultra-luxury';
    } else if (/budget|cheap|affordable/i.test(response)) pricePoint = 'budget';
    else if (/premium|high-end/i.test(response)) pricePoint = 'premium';
    else if (/luxury|exclusive/i.test(response)) pricePoint = 'luxury';

    // Brand archetype detection
    let archetype: BrandArchetype = 'everyman';
    if (/innovat|disrupt|revolutionary/i.test(response)) archetype = 'innovator';
    else if (/premium|luxury|exclusive/i.test(response)) archetype = 'ruler';
    else if (/rebel|edgy|different/i.test(response)) archetype = 'rebel';
    else if (/hero|empowering|achieve/i.test(response)) archetype = 'hero';
    else if (/adventure|explore/i.test(response)) archetype = 'explorer';
    else if (/care|nurture|support/i.test(response)) archetype = 'caregiver';

    return {
        visual: {
            dominantColors: extractColors(response),
            materialType: material,
            shapeComplexity: 5, // Default mid-complexity
            textureType: material === 'glass' || material === 'metal' ? 'smooth' : 'mixed',
            surfaceFinish: material === 'glass' || material === 'metal' ? 'glossy' : 'matte',
            sizeCategory: 'medium'
        },
        semantic: {
            productCategory: input.category || detectCategory(input.productName),
            subcategory: input.productName,
            pricePoint,
            brandArchetype: archetype,
            usageContext: extractUsageContext(response)
        },
        demographics: {
            primaryAge: detectAgeRange(response),
            gender: detectGender(response),
            income: pricePoint === 'luxury' ? 'luxury' : pricePoint === 'premium' ? 'affluent' : 'mid',
            education: pricePoint === 'luxury' ? 'graduate' : 'college',
            lifestyle: extractLifestyle(response)
        },
        psychological: {
            aspirationalLevel: pricePoint === 'luxury' ? 9 : pricePoint === 'premium' ? 7 : 5,
            urgencyFactor: /limited|hurry|now|today/i.test(response) ? 8 : 5,
            socialProofNeed: /review|rating|testimonial/i.test(response) ? 8 : 6,
            trustBarrier: pricePoint === 'luxury' ? 8 : 6,
            emotionalDrivers: extractEmotionalDrivers(response)
        },
        competitive: {
            marketPosition: archetype === 'innovator' ? 'disruptor' : 'challenger',
            uniqueSellingProps: extractUSPs(response),
            weaknesses: [],
            competitorCount: 'medium',
            differentiators: extractDifferentiators(response)
        },
        triggers: {
            primary: extractTriggers(response),
            keywords: extractKeywords(input.productName),
            objections: ['price', 'quality', 'durability'],
            motivations: extractMotivations(response)
        }
    };
}

// Helper functions
function extractColors(text: string): string[] {
    const colors = ['#000000', '#FFFFFF', '#333333']; // Default
    if (/black|dark/i.test(text)) return ['#000000', '#1A1A1A', '#333333'];
    if (/white|light/i.test(text)) return ['#FFFFFF', '#F5F5F5', '#E0E0E0'];
    if (/blue/i.test(text)) return ['#0066CC', '#3399FF', '#99CCFF'];
    if (/red/i.test(text)) return ['#CC0000', '#FF3333', '#FF9999'];
    return colors;
}

function detectCategory(productName: string): string {
    const name = productName.toLowerCase();
    if (/phone|headphone|earbuds|speaker|tech/i.test(name)) return 'electronics';
    if (/shirt|shoe|bag|watch|fashion/i.test(name)) return 'fashion';
    if (/food|drink|snack|coffee/i.test(name)) return 'food';
    if (/beauty|skincare|makeup/i.test(name)) return 'beauty';
    if (/home|furniture|decor/i.test(name)) return 'home';
    return 'general';
}

function detectAgeRange(text: string): [number, number] {
    if (/young|teen|student/i.test(text)) return [18, 25];
    if (/professional|adult/i.test(text)) return [25, 40];
    if (/mature|senior/i.test(text)) return [40, 60];
    return [25, 45]; // Default
}

function detectGender(text: string): 'male' | 'female' | 'unisex' {
    if (/women|female|her|she/i.test(text)) return 'female';
    if (/men|male|him|he/i.test(text)) return 'male';
    return 'unisex';
}

function extractUsageContext(text: string): string[] {
    const contexts: string[] = [];
    if (/work|office|professional/i.test(text)) contexts.push('work');
    if (/gym|fitness|sport/i.test(text)) contexts.push('gym');
    if (/travel|commute/i.test(text)) contexts.push('travel');
    if (/home|house/i.test(text)) contexts.push('home');
    return contexts.length > 0 ? contexts : ['everyday'];
}

function extractLifestyle(text: string): string[] {
    const lifestyles: string[] = [];
    if (/tech|digital|smart/i.test(text)) lifestyles.push('tech-savvy');
    if (/active|fitness|sport/i.test(text)) lifestyles.push('active');
    if (/professional|business/i.test(text)) lifestyles.push('professional');
    if (/creative|artistic/i.test(text)) lifestyles.push('creative');
    return lifestyles.length > 0 ? lifestyles : ['general'];
}

function extractEmotionalDrivers(text: string): string[] {
    const drivers: string[] = [];
    if (/status|prestige|luxury/i.test(text)) drivers.push('status');
    if (/convenient|easy|simple/i.test(text)) drivers.push('convenience');
    if (/quality|premium|best/i.test(text)) drivers.push('quality');
    if (/innovat|new|cutting-edge/i.test(text)) drivers.push('innovation');
    if (/save|affordable|value/i.test(text)) drivers.push('value');
    return drivers.length > 0 ? drivers : ['quality', 'value'];
}

function extractUSPs(text: string): string[] {
    return ['unique design', 'high quality', 'innovative features']; // Placeholder
}

function extractDifferentiators(text: string): string[] {
    return ['premium materials', 'advanced technology']; // Placeholder
}

function extractTriggers(text: string): TriggerType[] {
    const triggers: TriggerType[] = [];
    if (/limited|exclusive|rare/i.test(text)) triggers.push('scarcity');
    if (/review|rating|customer/i.test(text)) triggers.push('social_proof');
    if (/expert|professional|certified/i.test(text)) triggers.push('authority');
    if (/urgency|now|today/i.test(text)) triggers.push('urgency');
    return triggers.length > 0 ? triggers : ['social_proof', 'authority'];
}

function extractKeywords(productName: string): string[] {
    return productName.split(' ').filter(w => w.length > 3);
}

function extractMotivations(text: string): string[] {
    return ['solve problem', 'improve life', 'status upgrade'];
}

/**
 * Fallback heuristic DNA generation
 */
function generateHeuristicDNA(input: any): ProductDNA {
    return {
        visual: {
            dominantColors: ['#000000', '#FFFFFF'],
            materialType: 'plastic',
            shapeComplexity: 5,
            textureType: 'smooth',
            surfaceFinish: 'matte',
            sizeCategory: 'medium'
        },
        semantic: {
            productCategory: detectCategory(input.productName),
            subcategory: input.productName,
            pricePoint: 'mid',
            brandArchetype: 'everyman',
            usageContext: ['everyday']
        },
        demographics: {
            primaryAge: [25, 45],
            gender: 'unisex',
            income: 'mid',
            education: 'college',
            lifestyle: ['general']
        },
        psychological: {
            aspirationalLevel: 5,
            urgencyFactor: 5,
            socialProofNeed: 6,
            trustBarrier: 6,
            emotionalDrivers: ['quality', 'value']
        },
        competitive: {
            marketPosition: 'challenger',
            uniqueSellingProps: ['quality', 'value'],
            weaknesses: [],
            competitorCount: 'medium',
            differentiators: ['unique features']
        },
        triggers: {
            primary: ['social_proof', 'authority'],
            keywords: input.productName.split(' '),
            objections: ['price', 'quality'],
            motivations: ['solve problem', 'improve life']
        }
    };
}
