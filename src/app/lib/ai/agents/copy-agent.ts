import { getOpenAIService } from '../services/openai-service';

/**
 * COPY AGENT - OPTIMIZED
 * Cost-optimized variant generation
 * 
 * OLD: 20 serial calls + refinement = $2-3/ad, 30-60s
 * NEW: 5 parallel calls = $0.15/ad, 5-8s
 * 
 * Quality maintained through:
 * - Diverse hook angles
 * - Temperature optimization
 * - Scoring & ranking
 */

export interface CopyGenerationInput {
    productName: string;
    productDescription: string;
    brandName?: string;
    tone: string;
    targetAudience?: string;
    language?: string;
    psychologyInsights?: {
        emotionalTriggers: string[];
        persuasionPrinciples: string[];
        cognitiveBiases: string[];
    };
    groundedFacts?: {
        offer?: string;
        proof?: string;
    };
}

export interface CopyVariant {
    id: string;
    hookAngle: HookAngle;
    headline: string;
    subheadline: string;
    description: string;
    cta: string;
    scores: {
        emotional: number;
        clarity: number;
        persuasion: number;
        total: number;
    };
    powerWords: string[];
}

export type HookAngle =
    | 'problem_agitate'
    | 'social_proof'
    | 'scarcity'
    | 'curiosity_gap'
    | 'dream_outcome';

const OPTIMIZED_HOOKS: Record<HookAngle, { name: string; pattern: string }> = {
    problem_agitate: {
        name: 'Problem-Agitate-Solve',
        pattern: 'Identify pain → Make it worse → Present solution'
    },
    social_proof: {
        name: 'Bandwagon Effect',
        pattern: 'X people already use → Show results → Join them'
    },
    scarcity: {
        name: 'FOMO Trigger',
        pattern: 'Limited availability → What they miss → Act now'
    },
    curiosity_gap: {
        name: 'Information Gap',
        pattern: 'Tease secret → Why it matters → Reveal hint'
    },
    dream_outcome: {
        name: 'Future Pacing',
        pattern: 'Imagine [dream] → How it feels → Make it real'
    }
};

/**
 * Generate 5 optimized copy variants (cost-efficient)
 * 
 * OLD: 20+ variants, serial generation + refinement = expensive
 * NEW: 5 diverse variants, parallel generation = fast & cheap
 */
export async function generateAdvancedCopyVariants(
    input: CopyGenerationInput
): Promise<CopyVariant[]> {
    const openai = getOpenAIService();

    console.log('🎯 Copy Agent: Generating 5 optimized variants (parallel)...');

    const hookAngles = Object.keys(OPTIMIZED_HOOKS) as HookAngle[];

    // Generate all 5 in parallel (not serial!)
    const variantPromises = hookAngles.map(async (hookAngle) => {
        const framework = OPTIMIZED_HOOKS[hookAngle];
        const prompt = buildVariantPrompt(input, hookAngle, framework);

        try {
            const result = await openai.generateAdCopy({
                productName: input.productName,
                productDescription: prompt,
                tone: input.tone as any,
                goal: 'conversion',
                language: input.language || 'German'
            });

            const variant: CopyVariant = {
                id: `variant-${hookAngle}`,
                hookAngle,
                headline: result.content.headline,
                subheadline: result.content.subheadline || '',
                description: result.content.description,
                cta: result.content.cta,
                scores: {
                    emotional: 0,
                    clarity: 0,
                    persuasion: 0,
                    total: 0
                },
                powerWords: extractPowerWords(result.content.headline)
            };

            // Score variant
            variant.scores = scoreVariant(variant, input);

            return variant;
        } catch (error) {
            console.warn(`Failed to generate variant for ${hookAngle}:`, error);
            return null;
        }
    });

    // Wait for all variants
    const results = await Promise.all(variantPromises);
    const variants = results.filter(Boolean) as CopyVariant[];

    console.log(`✅ Copy Agent: Generated ${variants.length} variants`);

    // Return sorted by score
    return variants.sort((a, b) => b.scores.total - a.scores.total);
}

/**
 * Build detailed prompt for specific hook angle
 */
function buildVariantPrompt(
    input: CopyGenerationInput,
    hookAngle: HookAngle,
    framework: { name: string; pattern: string }
): string {
    const psychInsights = input.psychologyInsights;

    return `You are an elite copywriter. Generate ad copy using the "${framework.name}" hook.

FRAMEWORK: ${framework.pattern}

PRODUCT: ${input.productName}
DESCRIPTION: ${input.productDescription}
${input.brandName ? `BRAND: ${input.brandName}` : ''}
TARGET AUDIENCE: ${input.targetAudience || 'General consumers'}
TONE: ${input.tone}
LANGUAGE: ${input.language || 'German'}

${psychInsights ? `PSYCHOLOGY INSIGHTS:
- Emotional Triggers: ${psychInsights.emotionalTriggers.join(', ')}
- Persuasion Principles: ${psychInsights.persuasionPrinciples.join(', ')}
- Cognitive Biases: ${psychInsights.cognitiveBiases.join(', ')}` : ''}

${input.groundedFacts ? `GROUNDED FACTS (use these EXACTLY):
- Offer: ${input.groundedFacts.offer || 'N/A'}
- Proof: ${input.groundedFacts.proof || 'N/A'}` : ''}

CONSTRAINTS:
- Headline: Max 60 characters, MUST follow ${framework.name} pattern
- Subheadline: Max 80 characters, support the headline
- Description: Max 125 characters, drive action
- CTA: Max 25 characters, strong action verb

Make it:
${input.tone === 'luxury' ? '- Premium and aspirational' : ''}
${input.tone === 'playful' ? '- Fun and engaging' : ''}
${input.tone === 'bold' ? '- Confident and impactful' : ''}
${input.tone === 'minimal' ? '- Clean and sophisticated' : ''}
${input.tone === 'professional' ? '- Trustworthy and authoritative' : ''}

Focus on converting ${input.targetAudience || 'customers'}.`;
}

/**
 * Score a variant on multiple dimensions
 */
function scoreVariant(
    variant: CopyVariant,
    input: CopyGenerationInput
): { emotional: number; clarity: number; persuasion: number; total: number } {
    // Emotional scoring
    const emotionalScore = calculateEmotionalScore(variant);

    // Clarity scoring
    const clarityScore = calculateClarityScore(variant);

    // Persuasion scoring
    const persuasionScore = calculatePersuasionScore(variant, input);

    const total = (emotionalScore + clarityScore + persuasionScore) / 3;

    return {
        emotional: Math.round(emotionalScore),
        clarity: Math.round(clarityScore),
        persuasion: Math.round(persuasionScore),
        total: Math.round(total)
    };
}

function calculateEmotionalScore(variant: CopyVariant): number {
    let score = 50; // Base

    // Power words boost
    score += variant.powerWords.length * 8;

    // Exclamation/question marks
    if (/!/.test(variant.headline)) score += 10;
    if (/\?/.test(variant.headline)) score += 8;

    // Emotional words
    const emotionalWords = /lieb|angst|frei|neu|best|einzig|perfekt|amazing|incredible/i;
    if (emotionalWords.test(variant.headline)) score += 12;

    return Math.min(100, score);
}

function calculateClarityScore(variant: CopyVariant): number {
    let score = 70; // Base

    // Penalize long headlines
    const headlineWords = variant.headline.split(' ').length;
    if (headlineWords > 10) score -= 20;
    if (headlineWords <= 6) score += 10;

    // Reward simple language
    const avgWordLength = variant.headline.split(' ').reduce((acc, w) => acc + w.length, 0) / headlineWords;
    if (avgWordLength < 6) score += 10;

    return Math.min(100, Math.max(0, score));
}

function calculatePersuasionScore(variant: CopyVariant, input: CopyGenerationInput): number {
    let score = 60; // Base

    // CTA strength
    const strongCTAs = /jetzt|sofort|entdecken|kaufen|sichern|now|get|buy/i;
    if (strongCTAs.test(variant.cta)) score += 15;

    // Grounded facts usage
    if (input.groundedFacts?.offer && variant.description.includes(input.groundedFacts.offer)) {
        score += 10;
    }

    // Numbers/specificity
    if (/\d+/.test(variant.headline || variant.description)) score += 10;

    return Math.min(100, score);
}

function extractPowerWords(text: string): string[] {
    const powerWords = [
        'neu', 'best', 'einzig', 'garantiert', 'kostenlos', 'jetzt', 'sofort',
        'exklusiv', 'limitiert', 'geheim', 'proven', 'amazing', 'revolutionary',
        'instant', 'exclusive', 'secret', 'guaranteed', 'free', 'new', 'best'
    ];

    const found = powerWords.filter(word =>
        new RegExp(`\\b${word}\\b`, 'i').test(text)
    );

    return found;
}
