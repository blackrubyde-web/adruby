/**
 * ELITE CREATIVE PROMPT POLISHER - TEMPLATE-BASED
 * 
 * Now uses 7 reference-level ad templates.
 * Auto-selects optimal template and generates pixel-precise prompts.
 */

import { AD_TEMPLATES, selectOptimalTemplate, getTemplatePrompt } from './adTemplates.js';

/**
 * Polish user's creative prompt using reference-level templates
 */
export async function polishCreativePrompt(openai, {
    userPrompt,
    productAnalysis,
    industry
}) {
    console.log('[CreativePolisher] 🎯 Selecting optimal template...');

    // Auto-select template based on product, industry, and user prompt
    const templateKey = selectOptimalTemplate(productAnalysis, userPrompt, industry);
    const template = AD_TEMPLATES[templateKey];

    console.log('[CreativePolisher] ✓ Selected template:', template.name);
    console.log('[CreativePolisher] Best for:', template.bestFor.slice(0, 3).join(', '));

    // If user provided a detailed prompt, enhance it with GPT-4o
    if (userPrompt && userPrompt.length > 20 && openai) {
        console.log('[CreativePolisher] 🎨 Enhancing with GPT-4o...');

        try {
            const enhanced = await enhanceWithGPT4(openai, userPrompt, template, productAnalysis, industry);
            if (enhanced) {
                return {
                    enhancedPrompt: enhanced.enhancedPrompt,
                    templateKey,
                    templateName: template.name,
                    keyEnhancements: enhanced.keyEnhancements || [],
                    mood: enhanced.mood || 'premium'
                };
            }
        } catch (e) {
            console.warn('[CreativePolisher] GPT-4o enhancement failed, using template default');
        }
    }

    // Use template's default prompt
    return {
        enhancedPrompt: template.prompt,
        templateKey,
        templateName: template.name,
        keyEnhancements: ['template-based layout', 'pixel-precise positioning', 'reference-level quality'],
        mood: 'premium'
    };
}

/**
 * Enhance user prompt with GPT-4o while respecting template structure
 */
async function enhanceWithGPT4(openai, userPrompt, template, productAnalysis, industry) {
    const systemPrompt = `You are an ELITE Creative Director at a top Meta Ads agency.

The user has provided creative direction. Your job is to ENHANCE it while following this specific template:

TEMPLATE: ${template.name}
DESCRIPTION: ${template.description}
BEST FOR: ${template.bestFor.join(', ')}

TEMPLATE LAYOUT (follow this structure):
${template.prompt.substring(0, 1500)}

Take the user's creative vision and enhance it with:
1. Professional lighting techniques
2. Specific pixel positions (x, y coordinates)
3. Exact colors (hex codes)
4. Premium effects (glow, shadows, gradients)
5. Agency-level details that make ads CONVERT

IMPORTANT: Keep the template structure but enhance with the user's creative direction.

Return JSON:
{
  "enhancedPrompt": "The complete pixel-precise creative direction (combining template + user vision)",
  "keyEnhancements": ["list of 3-5 specific premium elements"],
  "mood": "premium|futuristic|elegant|bold|clean"
}`;

    const userMessage = `PRODUCT: ${productAnalysis?.productName || 'Product'}
INDUSTRY: ${industry || 'general'}
PRODUCT TYPE: ${productAnalysis?.productType || 'product'}

USER'S CREATIVE VISION:
"${userPrompt}"

Enhance this following the ${template.name} template structure with pixel-precise specifications for a 1080x1080 canvas.`;

    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ],
        max_tokens: 1200,
        temperature: 0.85,
        response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    console.log('[CreativePolisher] ✅ GPT-4o enhanced with', result.keyEnhancements?.length || 0, 'enhancements');

    return result;
}

export default { polishCreativePrompt };
