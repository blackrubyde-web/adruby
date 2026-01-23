/**
 * MARKETING EXPERT PROMPT POLISHER
 * 
 * Takes the user's simple prompt and transforms it into:
 * 1. Professional marketing HEADLINE (not user's raw prompt!)
 * 2. Compelling TAGLINE
 * 3. CTA text
 * 4. Visual direction for Gemini
 */

/**
 * Polish user prompt with Marketing Expert AI
 * Returns: { headline, tagline, cta, visualDirection }
 */
export async function polishPromptWithExpert(openai, {
    userPrompt,
    productAnalysis,
    industry,
    headline,
    subheadline,
    cta
}) {
    console.log('[MarketingExpert] 🎯 Generating professional marketing copy...');

    const systemPrompt = `You are a Senior Meta Ads Copywriter creating viral 2026 dropshipping ads.

CRITICAL: Generate MARKETING COPY, not the user's prompt as headline!

The user describes what they WANT. You create:
1. A CATCHY HEADLINE that sells (3-5 words max)
2. A benefit-focused TAGLINE (1 sentence)
3. A CTA (2-3 words)
4. Visual direction for the image

Output ONLY valid JSON, no markdown, no explanations.`;

    const userMessage = `PRODUCT: ${productAnalysis?.productName || 'Product'}
TYPE: ${productAnalysis?.productType || 'Unknown'}
INDUSTRY: ${industry || 'e-commerce'}

USER'S WISH: "${userPrompt || 'Premium ad'}"

USER PROVIDED (use if good, improve if generic):
- Headline: "${headline || ''}"
- Tagline: "${subheadline || ''}"
- CTA: "${cta || ''}"

---

Generate professional marketing copy. The headline should SELL, not describe the user's request.

Examples of GOOD headlines:
- "Level Up Your Setup" (for gaming products)
- "Glow Different" (for lamps)
- "Sleep Like Never Before" (for pillows)

Examples of BAD headlines (DO NOT DO THIS):
- "Gaming background, bring the fox to glow" (user's raw prompt)
- "Create a premium ad" (instruction, not headline)

Return JSON:
{
  "headline": "Catchy 3-5 word headline that SELLS",
  "tagline": "One sentence benefit",
  "cta": "Shop Now",
  "visualDirection": "Specific visual instructions for image generation"
}`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ],
            max_tokens: 400,
            temperature: 0.8,
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(response.choices[0].message.content);

        console.log('[MarketingExpert] ✅ Generated copy:', {
            headline: result.headline,
            tagline: result.tagline?.substring(0, 50) + '...',
            cta: result.cta
        });

        return {
            headline: result.headline || headline || productAnalysis?.productName || 'Premium Quality',
            tagline: result.tagline || subheadline || '',
            cta: result.cta || cta || 'Shop Now',
            visualDirection: result.visualDirection || ''
        };
    } catch (error) {
        console.error('[MarketingExpert] Failed:', error.message);
        // Fallback to provided or default values
        return {
            headline: headline || productAnalysis?.productName || 'Premium Quality',
            tagline: subheadline || 'Discover the difference',
            cta: cta || 'Shop Now',
            visualDirection: ''
        };
    }
}

/**
 * Get industry-specific prompt enhancements
 */
export function getIndustryEnhancements(industry) {
    const enhancements = {
        'electronics': 'Tech-forward aesthetic, clean lines, subtle RGB/neon accents, dark mode friendly',
        'fashion': 'Lifestyle context, aspirational mood, model hands or styled flat lay',
        'beauty': 'Soft lighting, skin-friendly tones, dewey/fresh aesthetic, luxury feel',
        'food': 'Appetite appeal, warm lighting, steam/freshness cues, lifestyle context',
        'home': 'Cozy atmosphere, lifestyle integration, warm ambient lighting',
        'toys': 'Fun, vibrant, playful lighting, kid-friendly but parent-approved aesthetic',
        'fitness': 'Dynamic, energetic, motivational, action-oriented',
        'default': 'Premium e-commerce aesthetic, clean composition, professional lighting'
    };

    return enhancements[industry] || enhancements.default;
}

export default {
    polishPromptWithExpert,
    getIndustryEnhancements
};
