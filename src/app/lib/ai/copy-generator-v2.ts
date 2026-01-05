// import { supabase } from '../supabaseClient';
import { invokeOpenAIProxy } from '../api/proxyClient';
import type { StrategicProfile } from './strategic-analyzer';

/**
 * COPY EXPLOSION ENGINE V2
 * Generates 10+ hook-based variants then selects the best one
 * 
 * Flow: Input → 10 Hook Angles → Parallel Generation → Scoring → Best Variant
 */

export interface CopyVariant {
    id: string;
    hookAngle: HookAngle;
    headline: string;
    subheadline: string;
    description: string;
    cta: string;
    socialProof?: string;
    urgencyText?: string;
    score: {
        clarity: number;      // 0-100
        punchiness: number;   // 0-100
        emotional: number;    // 0-100
        total: number;        // Average
    };
    reasoning: string;
}

export type HookAngle =
    | 'problem_agitate'      // "Tired of X? Here's why it's worse than you think..."
    | 'social_proof'         // "10,000+ people already switched..."
    | 'scarcity'             // "Only 3 left. Don't miss out..."
    | 'curiosity_gap'        // "The secret nobody tells you about..."
    | 'before_after'         // "From X to Y in Z days..."
    | 'dream_outcome'        // "Imagine waking up with..."
    | 'enemy_reveal'         // "Big brands don't want you to know..."
    | 'status_symbol'        // "Join the elite who..."
    | 'time_collapse'        // "Get results in 1/10th the time..."
    | 'authority';           // "As seen in Forbes, trusted by..."

const HOOK_ANGLE_CONFIGS: Record<HookAngle, {
    name: string;
    description: string;
    framework: string;
}> = {
    problem_agitate: {
        name: 'Problem-Agitate-Solve',
        description: 'Identify pain, make it worse, then provide solution',
        framework: 'HEADLINE: State the problem. SUBHEAD: Agitate (why it hurts). BODY: Solve it.'
    },
    social_proof: {
        name: 'Bandwagon Effect',
        description: 'Show that others are already winning',
        framework: 'HEADLINE: "X people already use this". SUBHEAD: Why they switched. BODY: Join them.'
    },
    scarcity: {
        name: 'FOMO Trigger',
        description: 'Limited availability creates urgency',
        framework: 'HEADLINE: Limited quantity/time. SUBHEAD: What they\'ll miss. BODY: Act now.'
    },
    curiosity_gap: {
        name: 'Information Gap',
        description: 'Tease valuable secret to create intrigue',
        framework: 'HEADLINE: "The secret X...". SUBHEAD: Why it matters. BODY: Reveal hint.'
    },
    before_after: {
        name: 'Transformation Story',
        description: 'Show dramatic change in specific timeframe',
        framework: 'HEADLINE: From [bad] to [good] in [time]. SUBHEAD: The journey. BODY: How.'
    },
    dream_outcome: {
        name: 'Future Pacing',
        description: 'Paint vivid picture of desired future',
        framework: 'HEADLINE: "Imagine [dream scenario]...". SUBHEAD: How it feels. BODY: Make it real.'
    },
    enemy_reveal: {
        name: 'Us vs Them',
        description: 'Position against common enemy',
        framework: 'HEADLINE: "[Enemy] doesn\'t want you to know...". SUBHEAD: The truth. BODY: Fight back.'
    },
    status_symbol: {
        name: 'Exclusivity Play',
        description: 'Appeal to desire for elite status',
        framework: 'HEADLINE: "For the select few...". SUBHEAD: What makes them special. BODY: Join elite.'
    },
    time_collapse: {
        name: 'Efficiency Hack',
        description: 'Promise same results in fraction of time',
        framework: 'HEADLINE: "Get X in 1/10th the time". SUBHEAD: The shortcut. BODY: How it works.'
    },
    authority: {
        name: 'Expert Endorsement',
        description: 'Leverage credibility and trust',
        framework: 'HEADLINE: "As featured in...". SUBHEAD: Why experts trust it. BODY: You should too.'
    }
};

/**
 * Generate multiple copy variants using different hook angles
 */
export async function generateCopyExplosion(params: {
    productName: string;
    brandName?: string;
    profile: StrategicProfile;
    tone: string;
    groundedFacts?: {
        offer?: string;
        proof?: string;
        painPoints?: string[];
    };
    language?: string;
}): Promise<CopyVariant[]> {


    const hookAngles: HookAngle[] = [
        'problem_agitate',
        'social_proof',
        'scarcity',
        'curiosity_gap',
        'before_after',
        'dream_outcome',
        'enemy_reveal',
        'status_symbol',
        'time_collapse',
        'authority'
    ];

    // Generate variants in BATCHES to avoid rate limits (5 at a time)
    const batchSize = 5;
    const batches: HookAngle[][] = [];
    for (let i = 0; i < hookAngles.length; i += batchSize) {
        batches.push(hookAngles.slice(i, i + batchSize));
    }

    const variants: CopyVariant[] = [];

    for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];


        const batchPromises = batch.map(angle =>
            generateSingleVariant(angle, params)
        );

        const batchResults = await Promise.all(batchPromises);
        variants.push(...batchResults);

        // Delay between batches to respect rate limits (500ms)
        if (i < batches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    // Score and rank
    const scoredVariants = variants
        .map(v => ({
            ...v,
            score: calculateVariantScore(v)
        }))
        .sort((a, b) => b.score.total - a.score.total);

    // console.log('✅ Generated 10 variants. Top 3 scores:',
    //    scoredVariants.slice(0, 3).map(v => `${v.hookAngle}: ${v.score.total.toFixed(1)}`).join(', ')
    // );

    return scoredVariants;
}

/**
 * Generate a single copy variant for specific hook angle
 */
async function generateSingleVariant(
    hookAngle: HookAngle,
    params: {
        productName: string;
        brandName?: string;
        profile: StrategicProfile;
        tone: string;
        groundedFacts?: {
            offer?: string;
            proof?: string;
            painPoints?: string[];
        };
        language?: string;
    }
): Promise<CopyVariant> {
    const config = HOOK_ANGLE_CONFIGS[hookAngle];

    const prompt = `You are an elite copywriter specializing in the "${config.name}" framework.

PRODUCT: ${params.productName}
BRAND: ${params.brandName || 'N/A'}
AUDIENCE: ${params.profile.targetAudience}
PAIN POINT: ${params.profile.primaryPainPoint}
TONE: ${params.tone}
LANGUAGE: ${params.language || 'German'} (Output must be in this language)

GROUNDED FACTS (USE THESE EXACTLY):
- Offer: ${params.groundedFacts?.offer || 'N/A'}
- Social Proof: ${params.groundedFacts?.proof || 'N/A'}
- Pain Points: ${params.groundedFacts?.painPoints?.join(', ') || 'N/A'}

FRAMEWORK: ${config.framework}

Generate copy using the "${config.name}" hook angle.

CONSTRAINTS:
- Headline: Max 40 characters, MUST use ${config.name} pattern
- Subheadline: Max 80 characters
- Description: Max 125 characters
- CTA: Max 25 characters, strong action verb
- Social Proof: Use the grounded fact EXACTLY if provided
- Urgency Text: Optional scarcity element

OUTPUT JSON:
{
  "headline": "...",
  "subheadline": "...",
  "description": "...",
  "cta": "...",
  "socialProof": "...",
  "urgencyText": "...",
  "reasoning": "Why this variant will convert (1 sentence)"
}`;

    const { data, error } = await invokeOpenAIProxy({
        endpoint: 'chat/completions',
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9, // Higher for creative variation
        response_format: { type: 'json_object' }
    });

    if (error) {
        console.warn(`⚠️ Variant generation failed for ${hookAngle}, using fallback`);
        return createFallbackVariant(hookAngle, params);
    }

    try {
        const response = JSON.parse(data.choices[0].message.content);
        return {
            id: `variant_${hookAngle}_${Date.now()}`,
            hookAngle,
            headline: response.headline || 'Premium Product',
            subheadline: response.subheadline || '',
            description: response.description || '',
            cta: response.cta || 'Learn More',
            socialProof: response.socialProof,
            urgencyText: response.urgencyText,
            score: { clarity: 0, punchiness: 0, emotional: 0, total: 0 }, // Will be scored later
            reasoning: response.reasoning || 'Generated variant'
        };
    } catch (e) {
        console.warn(`⚠️ Failed to parse response for ${hookAngle}, using fallback`);
        return createFallbackVariant(hookAngle, params);
    }
}

/**
 * Fallback variant if AI generation fails
 */
function createFallbackVariant(hookAngle: HookAngle, params: unknown): CopyVariant {
    const p = params as {
        productName: string;
        groundedFacts?: { offer?: string; proof?: string };
    };
    return {
        id: `fallback_${hookAngle}`,
        hookAngle,
        headline: `${p.productName} - Premium Quality`,
        subheadline: 'The solution you\'ve been looking for',
        description: p.groundedFacts?.offer || 'Get the best results today',
        cta: 'Shop Now',
        socialProof: p.groundedFacts?.proof,
        score: { clarity: 50, punchiness: 50, emotional: 50, total: 50 },
        reasoning: 'Fallback variant due to generation error'
    };
}

/**
 * Score a copy variant on multiple dimensions
 */
function calculateVariantScore(variant: CopyVariant): {
    clarity: number;
    punchiness: number;
    emotional: number;
    total: number;
} {
    // CLARITY: Word count and readability
    const wordCount = variant.headline.split(' ').length;
    const clarity = clampScore(100 - (wordCount - 5) * 10); // Penalize long headlines

    // PUNCHINESS: Short, impactful words
    const hasNumbers = /\d+/.test(variant.headline);
    const hasStrongVerbs = /get|discover|unlock|transform|boost|master/i.test(variant.headline);
    const punchiness = clampScore((hasNumbers ? 50 : 0) + (hasStrongVerbs ? 50 : 0));

    // EMOTIONAL: Question marks, exclamations, power words
    const hasQuestion = /\?/.test(variant.headline);
    const hasExclamation = /!/.test(variant.headline);
    const hasPowerWords = /secret|proven|guaranteed|exclusive|limited/i.test(variant.description);
    const emotional = clampScore((hasQuestion ? 30 : 0) + (hasExclamation ? 30 : 0) + (hasPowerWords ? 40 : 0));

    const total = clampScore((clarity + punchiness + emotional) / 3);

    return { clarity, punchiness, emotional, total };
}

function clampScore(value: number): number {
    return Math.max(0, Math.min(100, value));
}

/**
 * Get the BEST variant (highest scoring)
 */
export async function getBestCopyVariant(params: {
    productName: string;
    brandName?: string;
    profile: StrategicProfile;
    tone: string;
    groundedFacts?: {
        offer?: string;
        proof?: string;
        painPoints?: string[];
    };
    language?: string;
}): Promise<CopyVariant> {
    const variants = await generateCopyExplosion(params);
    const best = variants[0]; // Already sorted by score

    // console.log(`🏆 Best Variant: ${best.hookAngle} (Score: ${best.score.total.toFixed(1)}/100)`);
    // console.log(`   Headline: "${best.headline}"`);

    return best;
}
