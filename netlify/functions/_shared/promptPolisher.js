/**
 * ELITE CREATIVE PROMPT POLISHER - META 2026 STANDARD
 * 
 * Takes user's basic idea and transforms it into PIXEL-PRECISE
 * premium ad direction for 1080x1080 canvas.
 */

/**
 * Polish user's creative prompt to Meta 2026 elite standard
 * Returns pixel-precise layout + premium design direction
 */
export async function polishCreativePrompt(openai, {
    userPrompt,
    productAnalysis,
    industry
}) {
    console.log('[CreativePolisher] 🎯 Enhancing to Meta 2026 ELITE standard...');

    if (!userPrompt || userPrompt.length < 5) {
        console.log('[CreativePolisher] No user prompt, using premium defaults');
        return getEliteDefaultPrompt(industry, productAnalysis);
    }

    const systemPrompt = `You are an ELITE Creative Director at the world's top Meta Ads agency.
Your ads generate 10x ROAS. You create PIXEL-PRECISE creative direction for 1080x1080 ads.

CANVAS: 1080 x 1080 pixels (Instagram/Facebook Square)

YOUR JOB: Take the user's basic idea and output SPECIFIC, DETAILED creative direction.

ALWAYS INCLUDE:
1. EXACT PIXEL POSITIONS for every element
2. SPECIFIC COLORS with hex codes
3. EXACT SIZES for mockups/products
4. LIGHTING with direction, color, intensity
5. BACKGROUND with gradients, effects, colors
6. PREMIUM EFFECTS (glow, particles, shadows, glassmorphism)
7. TEXT STYLING (font style, size, shadow, position)

EXAMPLE OUTPUT:
"Create a 1080x1080 Meta ad. 

BACKGROUND: 
- Deep navy gradient (#0a0a1f to #1a1a3a) from top to bottom
- Subtle red/purple light flare at top-right (800,100), radius 200px, opacity 40%
- Subtle particle dust effect, 20-30 small dots, white, opacity 20%

MOCKUP/PRODUCT:
- MacBook Pro 16" at 30° angle, centered
- Position: center of canvas (540, 540)
- Size: 700px wide
- Screen showing user's screenshot
- Subtle screen glow (#4a90d9, opacity 60%)
- Reflection on surface below, opacity 30%

3D FLOATING ELEMENTS:
- Extract 2-3 UI cards from screenshot
- Float them at angles around MacBook
- Card 1: top-left (200, 300), rotated 15°, scale 0.8
- Card 2: top-right (850, 350), rotated -10°, scale 0.7
- Add glassmorphism (blur 10px, white border, 20% opacity)
- Add drop shadow (0 8px 32px rgba(0,0,0,0.3))

HEADLINE: 
- Position: top center (540, 100)
- Font: Bold, modern sans-serif
- Size: 64-72px
- Color: White (#FFFFFF)
- Text shadow: 0 4px 8px rgba(0,0,0,0.5)

CTA BUTTON:
- Position: bottom center (540, 980)
- Size: 240px x 56px
- Background: Gradient (#FF4757 to #FF6B81)
- Border-radius: 28px (pill shape)
- Glow: 0 0 20px rgba(255,71,87,0.5)
- Text: Bold, 18px, white

OVERALL STYLE: Premium SaaS, futuristic but elegant, high-end tech"

Return JSON:
{
  "enhancedPrompt": "The complete, PIXEL-PRECISE creative direction (like above)",
  "keyEnhancements": ["list of 5+ specific premium elements"],
  "layoutType": "mockup|product_hero|lifestyle|minimal",
  "primaryColor": "#hexcode",
  "mood": "premium|futuristic|elegant|bold"
}`;

    const userMessage = `PRODUCT INFO:
- Type: ${productAnalysis?.productType || 'SaaS/Product'}
- Industry: ${industry || 'technology'}
- Name: ${productAnalysis?.productName || 'Product'}

USER'S RAW CREATIVE VISION:
"${userPrompt}"

Transform this into ELITE Meta 2026 creative direction with PIXEL-PRECISE specifications.
Be EXTREMELY SPECIFIC about positions, sizes, colors, effects.
The output should be so detailed that anyone could recreate it exactly.`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ],
            max_tokens: 1500,
            temperature: 0.85,
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(response.choices[0].message.content);

        console.log('[CreativePolisher] ✅ ELITE prompt generated');
        console.log('[CreativePolisher] Layout:', result.layoutType);
        console.log('[CreativePolisher] Mood:', result.mood);
        console.log('[CreativePolisher] Enhancements:', result.keyEnhancements?.slice(0, 3).join(', '));

        return {
            enhancedPrompt: result.enhancedPrompt,
            keyEnhancements: result.keyEnhancements || [],
            layoutType: result.layoutType || 'premium',
            primaryColor: result.primaryColor || '#FF4757',
            mood: result.mood || 'premium'
        };
    } catch (error) {
        console.error('[CreativePolisher] Failed:', error.message);
        return getEliteDefaultPrompt(industry, productAnalysis);
    }
}

/**
 * Elite default prompt when no user input or API fails
 */
function getEliteDefaultPrompt(industry, productAnalysis) {
    const industryStyles = {
        technology: {
            bg: '#0a0a1f to #1a1a3a',
            accent: '#6366f1',
            effects: 'subtle blue glow, tech grid pattern',
            mood: 'futuristic'
        },
        gaming: {
            bg: '#0a0a0a to #1a0a1a',
            accent: '#00ff88',
            effects: 'RGB accents, neon glow, particle effects',
            mood: 'aggressive'
        },
        beauty: {
            bg: '#fef5f0 to #fff0f5',
            accent: '#e91e63',
            effects: 'soft glow, bokeh, dreamy lighting',
            mood: 'luxurious'
        },
        ecommerce: {
            bg: '#1a1a2e to #16213e',
            accent: '#FF4757',
            effects: 'product highlight, subtle reflections',
            mood: 'premium'
        }
    };

    const style = industryStyles[industry] || industryStyles.ecommerce;
    const productName = productAnalysis?.productName || 'Product';

    return {
        enhancedPrompt: `Create a 1080x1080 Meta ad.

BACKGROUND:
- Gradient: ${style.bg} (top to bottom)
- Add ${style.effects}
- Subtle vignette at edges

PRODUCT:
- Center the product (540, 480)
- Size: 550-600px
- Add studio lighting from top-left
- Subtle reflection below, opacity 25%
- Add subtle glow around product (${style.accent}, opacity 30%)

HEADLINE:
- Position: top center (540, 100)
- Text: "${productName}"
- Font: Bold, 64px, white
- Drop shadow for depth

CTA BUTTON:
- Position: bottom center (540, 970)
- Size: 220px x 56px
- Color: ${style.accent}
- Pill shape (28px radius)
- Add glow effect

STYLE: ${style.mood}, professional, high-converting`,
        keyEnhancements: ['studio lighting', 'product glow', 'gradient background', 'premium CTA', 'text shadows'],
        layoutType: 'product_hero',
        primaryColor: style.accent,
        mood: style.mood
    };
}

export default { polishCreativePrompt };
