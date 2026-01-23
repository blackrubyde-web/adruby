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

/**
 * NEW: Polish User's Creative Prompt to Meta 2026 Standard
 * 
 * Takes user's raw creative vision and enhances it with:
 * - Professional design techniques
 * - Meta 2026 best practices
 * - Conversion optimization
 * - Premium visual elements
 */
export async function polishCreativePrompt(openai, {
    userPrompt,
    productAnalysis,
    industry
}) {
    console.log('[CreativePolisher] 🎨 Enhancing user vision to Meta 2026 standard...');

    if (!userPrompt || userPrompt.length < 10) {
        console.log('[CreativePolisher] No user prompt, using defaults');
        return null;
    }

    const systemPrompt = `You are an ELITE Creative Director at a top Meta Ads agency (2026 standard).

Your job: Take the user's basic creative idea and TRANSFORM it into a PREMIUM Meta ad concept.

Add:
1. Professional lighting techniques (studio, dramatic, soft gradients)
2. Premium mockup concepts (3D renders, device mockups, lifestyle contexts)
3. Modern design trends (glassmorphism, neon accents, depth/layers)
4. Conversion-optimized layouts
5. Specific visual effects that make ads POP

NEVER just repeat the user's prompt. ENHANCE it with professional details.

Example:
- User says: "put my screenshot in a macbook"
- You output: "Place the screenshot inside a sleek MacBook Pro mockup with a 45-degree angle. Add soft ambient lighting from the left, subtle screen glow reflecting off the surface. Background: deep navy gradient with subtle purple light flares. Add 3D floating UI elements extracted from the screenshot to create depth. Include subtle particle effects and a glass-morphic overlay element."

Return JSON with ONLY this structure:
{
  "enhancedPrompt": "The complete, professional creative direction",
  "keyEnhancements": ["list of 3-5 specific premium elements added"],
  "styleNotes": "Brief note on the overall aesthetic direction"
}`;

    const userMessage = `PRODUCT CONTEXT:
- Type: ${productAnalysis?.productType || 'Product/Service'}
- Industry: ${industry || 'technology'}
- Product Name: ${productAnalysis?.productName || 'Unknown'}

USER'S RAW CREATIVE VISION:
"${userPrompt}"

Transform this into a META 2026 PREMIUM ad concept. Be SPECIFIC about:
- Exact lighting (direction, color, intensity)
- Background (gradients, effects, colors)
- Mockup/presentation style (3D, device frame, floating elements)
- Premium effects (glow, particles, reflections, glassmorphism)
- Layout and composition`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ],
            max_tokens: 800,
            temperature: 0.9,
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(response.choices[0].message.content);

        console.log('[CreativePolisher] ✅ Enhanced to Meta 2026 standard');
        console.log('[CreativePolisher] Key enhancements:', result.keyEnhancements);

        return {
            enhancedPrompt: result.enhancedPrompt,
            keyEnhancements: result.keyEnhancements || [],
            styleNotes: result.styleNotes || ''
        };
    } catch (error) {
        console.error('[CreativePolisher] Failed:', error.message);
        return null;
    }
}

export default {
    polishPromptWithExpert,
    getIndustryEnhancements,
    polishCreativePrompt
};
