/**
 * MARKETING EXPERT PROMPT POLISHER
 * 
 * Takes the user's simple prompt and transforms it into a 
 * professional Meta Ads creative brief based on:
 * - Product analysis
 * - Industry best practices
 * - What converts best on Meta
 */

/**
 * Polish user prompt with Marketing Expert AI
 * Takes raw user input and product analysis, returns optimized prompt for Gemini
 */
export async function polishPromptWithExpert(openai, {
    userPrompt,
    productAnalysis,
    industry,
    headline,
    subheadline,
    cta
}) {
    console.log('[MarketingExpert] 🎯 Polishing user prompt...');

    const systemPrompt = `You are a Senior Meta Ads Creative Director with 10+ years experience creating viral dropshipping ads.

Your job: Take the user's basic product description and transform it into a PROFESSIONAL creative brief for an AI image generator.

You understand:
- What makes people stop scrolling on Instagram/Facebook
- Product photography best practices for each industry
- Emotional triggers that drive purchases
- 2026 Meta Ads visual trends

Output ONLY the enhanced prompt - no explanations.`;

    const userMessage = `PRODUCT ANALYSIS:
${JSON.stringify(productAnalysis, null, 2)}

INDUSTRY: ${industry || 'e-commerce'}

USER'S ORIGINAL REQUEST:
"${userPrompt || 'Create a premium ad for this product'}"

COPY ELEMENTS:
- Headline: "${headline || 'Product Name'}"
- Tagline: "${subheadline || ''}"
- CTA: "${cta || 'Shop Now'}"

---

Transform this into a professional creative brief for generating a 1080x1080 Meta ad.

Focus on:
1. SPECIFIC visual direction (lighting, mood, atmosphere)
2. What makes THIS product category sell (based on industry)
3. Emotional triggers for the target audience
4. Premium styling that matches ${productAnalysis?.pricePoint || 'mid-range'} positioning

Keep it concise but specific. Output the enhanced prompt only.`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ],
            max_tokens: 500,
            temperature: 0.7
        });

        const polishedPrompt = response.choices[0].message.content.trim();

        console.log('[MarketingExpert] ✅ Prompt polished');
        console.log('[MarketingExpert] Enhanced prompt preview:', polishedPrompt.substring(0, 150) + '...');

        return polishedPrompt;
    } catch (error) {
        console.error('[MarketingExpert] Failed to polish prompt:', error.message);
        // Return original prompt if polishing fails
        return userPrompt || `Premium advertisement for ${productAnalysis?.productName || 'this product'}`;
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
