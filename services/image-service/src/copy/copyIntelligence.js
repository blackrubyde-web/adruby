/**
 * COPY INTELLIGENCE - Reference-Driven Headlines & CTAs
 * 
 * Generates high-converting ad copy based on:
 * 1. Foreplay reference ad copy patterns
 * 2. Industry-specific copywriting formulas
 * 3. Psychological triggers and frameworks
 * 4. A/B tested copy structures
 */

import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Proven headline formulas
const HEADLINE_FORMULAS = {
    // Number-based (high CTR)
    number: [
        '{number} Gründe warum {product} dein Leben verändert',
        '{number}x mehr {benefit} mit {product}',
        'In nur {number} Tagen zu {result}',
        '{number}% sparen auf {product}'
    ],
    // Question-based (engagement)
    question: [
        'Bereit für {benefit}?',
        'Warum zahlen alle mehr für {product}?',
        'Kennst du schon {product}?',
        'Was wäre wenn {desire}?'
    ],
    // Benefit-focused
    benefit: [
        '{benefit}. Garantiert.',
        'Endlich {benefit}',
        '{benefit} war noch nie so einfach',
        'Dein Weg zu {benefit}'
    ],
    // Curiosity/intrigue
    curiosity: [
        'Das Geheimnis hinter {result}',
        'Warum Experten auf {product} schwören',
        'Die Wahrheit über {topic}',
        'Was {audience} nicht wissen sollen'
    ],
    // Social proof
    social_proof: [
        'Über {number} zufriedene Kunden',
        'Von {audience} empfohlen',
        '{number}★ Bewertung auf {platform}',
        'Bestseller in {category}'
    ],
    // Urgency
    urgency: [
        'Nur noch heute: {offer}',
        'Letzte Chance auf {benefit}',
        'Nur noch {number} verfügbar',
        'Aktion endet bald'
    ],
    // Direct benefit
    direct: [
        '{product} - {benefit}',
        '{benefit}. {product}.',
        'Mehr {benefit}. Weniger {pain}.',
        '{result} mit {product}'
    ]
};

// CTA patterns by goal
const CTA_PATTERNS = {
    purchase: [
        'Jetzt kaufen',
        'Jetzt bestellen',
        'Jetzt sichern',
        'Zum Shop',
        'In den Warenkorb'
    ],
    learn_more: [
        'Mehr erfahren',
        'Jetzt entdecken',
        'Details ansehen',
        'Mehr dazu'
    ],
    trial: [
        'Kostenlos testen',
        'Gratis starten',
        'Jetzt ausprobieren',
        'Free Trial'
    ],
    urgency: [
        'Jetzt zuschlagen',
        'Nicht verpassen',
        'Sofort sichern',
        'Letzte Chance'
    ],
    exclusive: [
        'Exklusiv sichern',
        'VIP-Zugang',
        'Nur für dich',
        'Insider werden'
    ],
    value: [
        'Sparen starten',
        '{percent}% Rabatt sichern',
        'Deal aktivieren',
        'Angebot nutzen'
    ]
};

// Industry-specific copy tones
const INDUSTRY_TONES = {
    tech: { style: 'innovative', words: ['revolutionär', 'smart', 'effizient', 'next-gen'] },
    beauty: { style: 'aspirational', words: ['strahlend', 'natürlich', 'luxuriös', 'verwöhnend'] },
    fitness: { style: 'motivational', words: ['stark', 'fit', 'Power', 'Transformation'] },
    food: { style: 'sensory', words: ['frisch', 'köstlich', 'natürlich', 'genießen'] },
    fashion: { style: 'trendy', words: ['stilvoll', 'trendy', 'elegant', 'einzigartig'] },
    finance: { style: 'trustworthy', words: ['sicher', 'zuverlässig', 'profitabel', 'transparent'] },
    health: { style: 'caring', words: ['gesund', 'natürlich', 'wirksam', 'sanft'] },
    luxury: { style: 'exclusive', words: ['exklusiv', 'premium', 'einzigartig', 'zeitlos'] }
};

/**
 * Analyze copy patterns from Foreplay reference ads via GPT-4V
 */
export async function analyzeReferenceCopy(referenceAds) {
    console.log(`[CopyIntel] 📝 Analyzing copy in ${referenceAds.length} references...`);

    if (!referenceAds || referenceAds.length === 0) {
        throw new Error('Reference ads required for copy analysis');
    }

    const referenceImages = referenceAds
        .map(ad => ad.image || ad.thumbnail)
        .filter(Boolean)
        .slice(0, 4);

    if (referenceImages.length === 0) {
        throw new Error('Reference ads have no images for copy analysis');
    }

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'system',
                content: 'You are an elite copywriter analyzing high-performing ad copy. Extract patterns precisely.'
            }, {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: `Analyze the copy (text) in these high-performing ads.

Extract:

1. HEADLINE PATTERNS
   - Formula type: number, question, benefit, curiosity, social_proof, urgency, direct
   - Length: short (1-3 words), medium (4-8 words), long (9+ words)
   - Case: uppercase, titlecase, lowercase
   - Has emoji: true/false

2. SUBHEADLINE PATTERNS
   - Relationship to headline: elaborates, contrasts, adds proof, adds urgency
   - Length: short/medium/long
   - Tone: informative, emotional, factual

3. CTA PATTERNS
   - Type: purchase, learn_more, trial, urgency, exclusive, value
   - Length: 1-2 words, 2-3 words, 3+ words
   - Tone: commanding, inviting, urgent

4. COPY TONE
   - Overall: professional, casual, playful, luxurious, urgent
   - Emotional triggers: fear, desire, curiosity, trust, urgency

5. EXTRACTED EXAMPLES
   - Best headline you can read
   - Best CTA you can read

Return JSON:
{
  "headlinePattern": {
    "formula": "number|question|benefit|curiosity|social_proof|urgency|direct",
    "length": "short|medium|long",
    "case": "uppercase|titlecase|lowercase",
    "hasEmoji": true/false
  },
  "subheadlinePattern": {
    "relationship": "elaborates|contrasts|adds_proof|adds_urgency",
    "length": "short|medium|long"
  },
  "ctaPattern": {
    "type": "purchase|learn_more|trial|urgency|exclusive|value",
    "length": "short|medium",
    "tone": "commanding|inviting|urgent"
  },
  "copyTone": "professional|casual|playful|luxurious|urgent",
  "emotionalTriggers": ["desire", "curiosity", "trust"],
  "extractedExamples": {
    "headline": "actual headline text from reference",
    "cta": "actual CTA text from reference"
  }
}`
                    },
                    ...referenceImages.map(url => ({
                        type: 'image_url',
                        image_url: { url, detail: 'high' }
                    }))
                ]
            }],
            max_tokens: 600,
            response_format: { type: 'json_object' }
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');

        console.log(`[CopyIntel]   Formula: ${result.headlinePattern?.formula || 'unknown'}`);
        console.log(`[CopyIntel]   CTA Type: ${result.ctaPattern?.type || 'unknown'}`);
        console.log(`[CopyIntel]   Tone: ${result.copyTone || 'unknown'}`);
        if (result.extractedExamples?.headline) {
            console.log(`[CopyIntel]   Example: "${result.extractedExamples.headline}"`);
        }

        return result;
    } catch (error) {
        console.error('[CopyIntel] Analysis failed:', error.message);
        throw error;
    }
}

/**
 * Generate headline based on reference patterns and product
 */
export async function generateHeadline(productAnalysis, referencePatterns, industry, options = {}) {
    console.log('[CopyIntel] ✍️ Generating headline...');

    const formula = referencePatterns?.headlinePattern?.formula || 'benefit';
    const tone = referencePatterns?.copyTone || 'professional';
    const triggers = referencePatterns?.emotionalTriggers || ['desire'];
    const industryTone = INDUSTRY_TONES[industry] || INDUSTRY_TONES.tech;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'system',
                content: `You are an elite German copywriter for Meta/Facebook ads.
Write headlines that stop the scroll and drive clicks.
Style: ${tone}, ${industryTone.style}
Emotional triggers: ${triggers.join(', ')}`
            }, {
                role: 'user',
                content: `Generate 3 German headlines for this product:

Product: ${productAnalysis?.productName || 'Premium Product'}
Type: ${productAnalysis?.productType || 'general'}
Key Benefits: ${productAnalysis?.keyFeatures?.slice(0, 3).join(', ') || 'quality, value'}
Target Audience: ${productAnalysis?.targetAudience || 'general consumers'}

Formula to follow: ${formula}
Reference example: "${referencePatterns?.extractedExamples?.headline || 'N/A'}"
Max length: ${referencePatterns?.headlinePattern?.length === 'short' ? '4 words' : referencePatterns?.headlinePattern?.length === 'long' ? '12 words' : '8 words'}
Case: ${referencePatterns?.headlinePattern?.case || 'titlecase'}
${referencePatterns?.headlinePattern?.hasEmoji ? 'Include 1 relevant emoji' : 'No emojis'}

Return JSON:
{
  "headlines": ["headline1", "headline2", "headline3"],
  "recommended": 0
}`
            }],
            max_tokens: 200,
            response_format: { type: 'json_object' }
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');
        const headlines = result.headlines || ['Premium Qualität'];
        const recommended = headlines[result.recommended || 0];

        console.log(`[CopyIntel]   Generated: "${recommended}"`);
        return { headlines, recommended };
    } catch (error) {
        console.error('[CopyIntel] Headline generation failed:', error.message);
        return { headlines: ['Premium Qualität'], recommended: 'Premium Qualität' };
    }
}

/**
 * Generate CTA based on reference patterns
 */
export async function generateCTA(referencePatterns, goal = 'purchase') {
    console.log('[CopyIntel] 🎯 Generating CTA...');

    const ctaType = referencePatterns?.ctaPattern?.type || goal;
    const ctaOptions = CTA_PATTERNS[ctaType] || CTA_PATTERNS.purchase;

    // Use reference example if available, otherwise pick from patterns
    const cta = referencePatterns?.extractedExamples?.cta || ctaOptions[0];

    console.log(`[CopyIntel]   CTA: "${cta}"`);
    return cta;
}

/**
 * Generate subheadline that complements the headline
 */
export async function generateSubheadline(headline, productAnalysis, referencePatterns) {
    console.log('[CopyIntel] 📝 Generating subheadline...');

    const relationship = referencePatterns?.subheadlinePattern?.relationship || 'elaborates';

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'system',
                content: 'You are an elite German copywriter. Write concise, compelling subheadlines.'
            }, {
                role: 'user',
                content: `Generate a German subheadline for this ad:

Headline: "${headline}"
Product: ${productAnalysis?.productName || 'Product'}
Key Feature: ${productAnalysis?.keyFeatures?.[0] || 'quality'}
Relationship to headline: ${relationship}
Max length: 10 words

Return JSON: { "subheadline": "your subheadline" }`
            }],
            max_tokens: 100,
            response_format: { type: 'json_object' }
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');
        const subheadline = result.subheadline || 'Entdecke den Unterschied';

        console.log(`[CopyIntel]   Subheadline: "${subheadline}"`);
        return subheadline;
    } catch (error) {
        console.error('[CopyIntel] Subheadline generation failed:', error.message);
        return 'Entdecke den Unterschied';
    }
}

/**
 * MASTER: Build complete copy package from reference ads
 */
export async function buildCopyIntelligence(productAnalysis, referenceAds, industry, options = {}) {
    console.log('[CopyIntel] ════════════════════════════════════');
    console.log('[CopyIntel] ✍️ BUILDING COPY INTELLIGENCE');
    console.log('[CopyIntel] ════════════════════════════════════');

    // 1. Analyze reference copy patterns
    const referencePatterns = await analyzeReferenceCopy(referenceAds);

    // 2. Generate headline
    const headlineResult = await generateHeadline(productAnalysis, referencePatterns, industry, options);

    // 3. Generate subheadline
    const subheadline = await generateSubheadline(headlineResult.recommended, productAnalysis, referencePatterns);

    // 4. Generate CTA
    const cta = await generateCTA(referencePatterns, options.goal || 'purchase');

    const copyPackage = {
        headline: headlineResult.recommended,
        headlineVariants: headlineResult.headlines,
        subheadline,
        cta,
        patterns: referencePatterns,
        metadata: {
            formula: referencePatterns.headlinePattern?.formula,
            tone: referencePatterns.copyTone,
            triggers: referencePatterns.emotionalTriggers
        }
    };

    console.log('[CopyIntel] ════════════════════════════════════');
    console.log(`[CopyIntel] ✅ Copy intelligence complete`);
    console.log(`[CopyIntel]    Headline: "${copyPackage.headline}"`);
    console.log(`[CopyIntel]    CTA: "${copyPackage.cta}"`);
    console.log('[CopyIntel] ════════════════════════════════════');

    return copyPackage;
}

export default {
    analyzeReferenceCopy,
    generateHeadline,
    generateSubheadline,
    generateCTA,
    buildCopyIntelligence,
    HEADLINE_FORMULAS,
    CTA_PATTERNS
};
