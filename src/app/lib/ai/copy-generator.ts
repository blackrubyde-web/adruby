import { supabase } from '../supabaseClient';
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
}

export async function generatePremiumCopy(params: {
    productName: string;
    brandName?: string;
    profile: StrategicProfile;
    template: any;
    tone: string;
}): Promise<PremiumCopy> {
    console.log('✍️ Stage 3: Premium Copy Generation...');

    const copyPrompt = `You are an elite Meta ad copywriter with 10+ years experience writing ads that convert at 4x industry average.

PRODUCT CONTEXT:
- Product: ${params.productName}
${params.brandName ? `- Brand: ${params.brandName}` : ''}
- Category: ${params.profile.productCategory}
- Pain Point: ${params.profile.primaryPainPoint}
- Target: ${params.profile.targetAudience}
- Goal: ${params.profile.conversionGoal}
- Emotion: ${params.profile.desiredEmotion}
- Tone: ${params.tone}
- Template: ${params.template.name}

YOUR MISSION: Write CONVERSION-OPTIMIZED copy using the PAS (Problem-Agitate-Solve) framework.

COPY FRAMEWORK:
1. HEADLINE (Hook): 
   - Pattern interrupt or bold statement
   - Max 40 characters
   - Use power words: STOP, FINALLY, SECRET, PROVEN, etc.
   - Question hooks work best: "Still Wasting Money on X?"

2. SUBHEADLINE (Agitate):
   - Amplify the pain
   - Max 90 characters
   - Make it relatable

3. DESCRIPTION (Solve + Proof):
   - Show the solution (product)
   - Add social proof
   - Max 125 characters
   - Include numbers/stats if possible

4. SOCIAL PROOF:
   - Star ratings: "⭐⭐⭐⭐⭐ 4.9/5"
   - Review counts: "12,847 Happy Customers"
   - Trust signals: "Trusted by 50k+"
   
5. URGENCY (if applicable):
   - "70% OFF - Ends Tonight"
   - "Only 7 Left in Stock"
   - Limited time offers

6. CTA (Call to Action):
   - Action verb + benefit
   - Examples: "CLAIM OFFER NOW →", "GET STARTED FREE", "TRY RISK-FREE"
   - Max 25 characters

RULES:
- Write in ${params.tone === 'professional' ? 'professional, trustworthy' : params.tone === 'bold' ? 'BOLD, POWERFUL' : params.tone === 'playful' ? 'fun, energetic' : params.tone} tone
- Focus on ${params.profile.desiredEmotion}
- Optimize for ${params.profile.conversionGoal}
- NO generic phrases like "Discover" or "Explore"
- YES to specifics, numbers, and bold claims
- USE emojis strategically (⭐🔥💰✅❌)

Return ONLY valid JSON:
{
  "headline": "Pattern-interrupt headline",
  "subheadline": "Agitate the pain (optional)",
  "description": "Solution + proof",
  "cta": "ACTION VERB →",
  "socialProof": "⭐⭐⭐⭐⭐ social proof text",
  "urgencyText": "Limited time offer text (optional)"
}`;

    const { data, error } = await supabase.functions.invoke('openai-proxy', {
        body: {
            endpoint: 'chat/completions',
            model: 'gpt-4o',
            messages: [{ role: 'user', content: copyPrompt }],
            temperature: 0.8,
            response_format: { type: 'json_object' }
        }
    });

    if (error) {
        console.error('Copy generation failed:', error);
        throw new Error(`Copy generation failed: ${error.message}`);
    }

    const copy: PremiumCopy = JSON.parse(data.choices[0].message.content);
    console.log('✅ Premium copy generated:', copy.headline);

    return copy;
}
