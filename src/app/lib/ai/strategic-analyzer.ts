import { supabase } from '../supabaseClient';

/**
 * STAGE 1: STRATEGIC ANALYZER
 * Analyzes product/brand to determine optimal ad strategy
 */

export interface StrategicProfile {
    productCategory: 'electronics' | 'fashion' | 'food' | 'beauty' | 'home' | 'sports' | 'tech' | 'services' | 'other';
    targetAudience: 'young_professionals' | 'parents' | 'students' | 'seniors' | 'entrepreneurs' | 'general';
    primaryPainPoint: string;
    desiredEmotion: 'excitement' | 'trust' | 'desire' | 'urgency' | 'exclusivity' | 'curiosity';
    conversionGoal: 'purchase' | 'signup' | 'download' | 'learn_more' | 'contact';
    recommendedTemplate: string;
    keyBenefits: string[];
    competitiveAdvantage: string;
    visualIdentity: {
        primaryColor: string;
        accentColor: string;
        backgroundColor: string;
        textColor: string;
        fontStyle: 'modern' | 'bold' | 'elegant' | 'handwritten' | 'minimal';
    };
}

export async function analyzeStrategy(params: {
    productName: string;
    brandName?: string;
    userPrompt: string;
    tone: 'professional' | 'playful' | 'bold' | 'luxury' | 'minimal';
}): Promise<StrategicProfile> {
    console.log('📊 Stage 1: Strategic Analysis...');

    const analysisPrompt = `You are an elite Meta ads strategist with 10+ years experience.

PRODUCT ANALYSIS:
- Product: ${params.productName}
${params.brandName ? `- Brand: ${params.brandName}` : ''}
- Tone: ${params.tone}
- User Goal: "${params.userPrompt}"

YOUR MISSION: Analyze this product and create a strategic ad profile.

ANALYZE:
1. Product Category (electronics, fashion, food, beauty, home, sports, tech, services, other)
2. Target Audience (young_professionals, parents, students, seniors, entrepreneurs, general)
3. Primary Pain Point (what problem does this solve?)
4. Desired Emotion to evoke (excitement, trust, desire, urgency, exclusivity, curiosity)
5. Conversion Goal (purchase, signup, download, learn_more, contact)
6. Recommended Template from these options:
   - "ugc_testimonial" (social proof heavy, testimonials)
   - "hook_pas" (problem-agitate-solve framework)
   - "ugly_postit" (raw authenticity, pattern interrupt)
   - "before_after" (transformation proof)
   - "social_proof_max" (reviews, trust badges, urgency)
   - "feature_spotlight" (benefit-focused, SaaS/product features)
   - "fomo_scarcity" (urgency, limited time/stock)
   - "question_hook" (curiosity gap)
   - "benefit_stack" (multiple benefits list)
   - "influencer_ugc" (UGC creator style)
   - "pain_point" (relatable problem → solution)
   - "bold_statement" (strong claims, guarantees)

7. Key Benefits (3-5 bullet points)
8. Competitive Advantage (1 sentence unique selling point)
9. Visual Identity (CRITICAL for aesthetic):
    - primaryColor: Hex code matching brand/emotion
    - accentColor: High contrast hex code for CTAs
    - backgroundColor: Hex code (can be dark or light depending on tone)
    - textColor: Readable hex code on background
    - fontStyle: 'modern' (Inter), 'bold' (Oswald), 'elegant' (Playfair), 'handwritten' (Caveat), or 'minimal'

CRITICAL: Choose template based on:
- Use "ugc_testimonial" or "social_proof_max" for products needing trust
- Use "hook_pas" or "pain_point" for problem-solving products
- Use "fomo_scarcity" for time-sensitive offers
- Use "feature_spotlight" or "benefit_stack" for SaaS/tech
- Use "bold_statement" for ${params.tone === 'bold' ? 'BOLD tone ✓' : 'confident claims'}
- Use "ugly_postit" for authentic, raw feel

Return ONLY valid JSON:
{
  "productCategory": "category",
  "targetAudience": "audience",
  "primaryPainPoint": "specific problem",
  "desiredEmotion": "emotion",
  "conversionGoal": "goal",
  "recommendedTemplate": "template_id",
  "keyBenefits": ["benefit 1", "benefit 2", "benefit 3"],
  "competitiveAdvantage": "why this is better than competitors",
  "visualIdentity": {
    "primaryColor": "#hex",
    "accentColor": "#hex",
    "backgroundColor": "#hex",
    "textColor": "#hex",
    "fontStyle": "modern"
  }
}`;

    const { data, error } = await supabase.functions.invoke('openai-proxy', {
        body: {
            endpoint: 'chat/completions',
            model: 'gpt-4o',
            messages: [{ role: 'user', content: analysisPrompt }],
            temperature: 0.7,
            response_format: { type: 'json_object' }
        }
    });

    if (error) {
        console.error('Strategic analysis failed:', error);
        throw new Error(`Strategic analysis failed: ${error.message}`);
    }

    const profile: StrategicProfile = JSON.parse(data.choices[0].message.content);
    console.log('✅ Strategic profile:', profile.recommendedTemplate);

    return profile;
}
