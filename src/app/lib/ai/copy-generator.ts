// import { supabase } from '../supabaseClient';
import { invokeOpenAIProxy } from '../api/proxyClient';
import type { StrategicProfile } from './strategic-analyzer';

/**
 * STAGE 3: PREMIUM COPY GENERATOR
 * Uses PAS (Problem-Agitate-Solve) framework + Meta best practices
 */



export interface PremiumCopy {
    headline: string;
    subheadline?: string;
    description: string;
    cta: string;
    socialProof?: string;
    urgencyText?: string;
    score?: number; // Internal ranking score
    reasoning?: string; // Why this variant was chosen
}

export async function generatePremiumCopy(params: {
    productName: string;
    brandName?: string;
    profile: StrategicProfile;
    template: unknown;
    tone: string;
    groundedFacts?: {
        offer?: string;
        proof?: string;
        painPoints?: string[];
    };
}): Promise<PremiumCopy> {
    // console.log('✍️ Stage 3: Premium Copy Generation (Ranking Mode)...');

    const copyPrompt = `You are an elite Direct Response Copywriter.
    
CONTEXT:
- Product: ${params.productName}
- Audience: ${params.profile.targetAudience}
- Pain Point: ${params.profile.primaryPainPoint}
- Goal: ${params.profile.conversionGoal}
- Angle: ${params.profile.angle}
- Hook Type: ${params.profile.hookType}

GROUNDED FACTS (You MUST use these, DO NOT Hallucinate):
- Offer: ${params.groundedFacts?.offer || 'N/A'}
- Social Proof: ${params.groundedFacts?.proof || 'N/A'}
- Pain Points: ${params.groundedFacts?.painPoints?.join(', ') || 'N/A'}

YOUR TASK:
Generate 3 distinct copy variants.
Rank them from 1-3 based on "Punchiness" and "Clarity".
Return the BEST variant (Rank 1).

FRAMEWORK (Rank 1):
1. HEADLINE: Max 40 chars. MUST be a ${params.profile.hookType} hook.
2. SUBHEAD: Agitate the user's pain: "${params.profile.primaryPainPoint}".
3. BODY: Present the solution using the "Offer" fact.
4. PROOF: Use the "Social Proof" fact exactly as written.
5. CTA: High-contrast action verb.

OUTPUT FORMAT:
JSON Only.
{
  "variants": [
    {
      "headline": "...",
      "subheadline": "...",
      "description": "...",
      "cta": "...",
      "socialProof": "...",
      "urgencyText": "...",
      "score": 95,
      "reasoning": "Uses strong pattern interrupt..."
    },
    ...
  ],
  "bestVariantIndex": 0
}`;

    const { data, error } = await invokeOpenAIProxy({
        endpoint: 'chat/completions',
        model: 'gpt-4o',
        messages: [{ role: 'user', content: copyPrompt }],
        temperature: 0.85, // Slightly higher for variety
        response_format: { type: 'json_object' }
    });

    if (error) {
        throw new Error(`Copy generation failed: ${error.message}`);
    }

    let response;
    try {
        response = JSON.parse(data.choices[0].message.content);
    } catch (e) {
        throw new Error('Failed to parse AI response: Invalid JSON');
    }

    if (!response.variants || !Array.isArray(response.variants) || response.variants.length === 0) {
        throw new Error('AI returned no valid copy variants');
    }

    const idx = response.bestVariantIndex;
    const safeIdx = (typeof idx === 'number' && idx >= 0 && idx < response.variants.length) ? idx : 0;

    const bestVariant = response.variants[safeIdx];

    // console.log(`✅ Best Copy Score: ${bestVariant.score}/100 | ${bestVariant.headline}`);

    return bestVariant;
}
