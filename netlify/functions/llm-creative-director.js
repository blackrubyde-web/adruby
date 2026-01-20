/**
 * LLM Creative Director - OpenAI GPT-4 powered Scene Graph Generator
 * 
 * This function uses GPT-4 to analyze user prompts and uploaded images,
 * then generates a structured Scene Graph JSON that can be rendered
 * deterministically using a constraint solver and canvas renderer.
 * 
 * Architecture:
 * 1. User Input (prompt + images) → OpenAI API
 * 2. GPT-4 → Scene Graph JSON (composition, elements, relations, copy, style)
 * 3. Scene Graph → Constraint Solver (kiwi.js) → Layout coordinates
 * 4. Layout → Canvas Renderer → Final image
 */

import OpenAI from 'openai';

// ============================================================
// SCENE GRAPH SCHEMA
// ============================================================

/**
 * @typedef {Object} SceneElement
 * @property {string} id - Unique identifier for this element
 * @property {'image'|'text'|'arrow'|'badge'|'shape'|'table'|'cta'} type
 * @property {string} role - Semantic role (e.g., 'hero_product', 'before_state', 'headline')
 * @property {number} priority - Rendering priority (1 = highest)
 * @property {Object} [props] - Type-specific properties
 */

/**
 * @typedef {Object} SceneRelation
 * @property {string} from - Source element ID
 * @property {string} to - Target element ID
 * @property {'left_of'|'right_of'|'above'|'below'|'leads_to'|'near'|'overlay'|'inside'} type
 * @property {number} [gap] - Optional gap in pixels
 */

/**
 * @typedef {Object} CreativePlan
 * @property {string} composition - Layout type
 * @property {SceneElement[]} elements
 * @property {SceneRelation[]} relations
 * @property {Object} copy
 * @property {Object} style
 * @property {Object} [background]
 */

// ============================================================
// SYSTEM PROMPT - GPT-4 as Creative Director
// ============================================================

const CREATIVE_DIRECTOR_SYSTEM_PROMPT = `You are an expert advertising creative director AI.

Your job is to:
1. Analyze the user's prompt and any uploaded images
2. Decide the optimal ad composition for maximum conversion
3. Define which visual elements are needed and their semantic roles
4. Generate compelling ad copy (headline, subheadline, CTA)
5. Output a structured Scene Graph JSON

CRITICAL RULES:
- Do NOT generate pixel coordinates or sizes
- Do NOT describe colors in hex (use semantic names like "primary", "accent", "dark", "light")
- Do NOT hallucinate - only reference elements that will actually exist
- Focus on STRUCTURE and MEANING, not visual details

COMPOSITION TYPES:
- product_focus: Single product hero shot, centered
- before_after: Split layout showing transformation
- saas_dashboard: Device mockup with UI screenshot
- comparison: Side-by-side or table comparison
- feature_callout: Product with arrows pointing to features
- testimonial: Quote with avatar and product
- grid: Multiple products in grid layout
- lifestyle: Product in context/lifestyle setting

OUTPUT ONLY VALID JSON matching this schema:
{
  "composition": "string",
  "elements": [
    {
      "id": "unique_string",
      "type": "image|text|arrow|badge|shape|table|cta",
      "role": "semantic_role_description",
      "priority": 1,
      "props": {}
    }
  ],
  "relations": [
    {
      "from": "element_id",
      "to": "element_id", 
      "type": "left_of|right_of|above|below|leads_to|near|overlay|inside",
      "gap": 20
    }
  ],
  "copy": {
    "headline": "Compelling headline with emotional hook",
    "subheadline": "Supporting benefit statement",
    "cta": "Action phrase"
  },
  "style": {
    "industry": "ecommerce|saas|local|coach|agency|dropshipping",
    "tone": "modern|luxury|aggressive|minimal|playful|professional",
    "platform": "meta|tiktok|linkedin|google"
  },
  "background": {
    "type": "solid|gradient|image|generated",
    "prompt": "If type is 'generated', describe the background scene"
  }
}

ELEMENT TYPES EXPLAINED:
- image: User-uploaded image or referenced asset
- text: Any text block (headline, body, label)
- arrow: Directional indicator (for callouts, before/after)
- badge: Small overlay (discount, "NEW", "BESTSELLER")
- shape: Decorative shapes (circles, rectangles, lines)
- table: Comparison tables
- cta: Call-to-action button

RELATION TYPES EXPLAINED:
- left_of/right_of/above/below: Spatial positioning
- leads_to: Directional flow (arrows, progression)
- near: Loose proximity without strict positioning
- overlay: Element overlaps another
- inside: Element contained within another (e.g., screenshot inside device)

Be creative but realistic. Generate copy that converts.`;

// ============================================================
// HANDLER
// ============================================================

export async function handler(event) {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const { prompt, images, composition, industry, tone, platform, variants = 1 } = body;

        if (!prompt && (!images || images.length === 0)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Please provide a prompt or upload images' })
            };
        }

        // Check for API key
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    error: 'OPENAI_API_KEY not configured',
                    hint: 'Add OPENAI_API_KEY to your Netlify environment variables'
                })
            };
        }

        // Initialize OpenAI client
        const client = new OpenAI({ apiKey });

        // Build user message
        let userMessage = '';

        if (prompt) {
            userMessage += `User Request: ${prompt}\n\n`;
        }

        if (composition) {
            userMessage += `Preferred Composition: ${composition}\n`;
        }
        if (industry) {
            userMessage += `Industry: ${industry}\n`;
        }
        if (tone) {
            userMessage += `Tone: ${tone}\n`;
        }
        if (platform) {
            userMessage += `Platform: ${platform}\n`;
        }

        if (images && images.length > 0) {
            userMessage += `\nUploaded Images:\n`;
            images.forEach((img, i) => {
                userMessage += `- Image ${i + 1}: ${img.description || img.name || 'Product image'}\n`;
            });
        }

        userMessage += `\nGenerate a Scene Graph JSON for this ad. Return ONLY the JSON, no explanation.`;

        console.log('[LLM-CreativeDirector] Calling GPT-4 with prompt:', userMessage.substring(0, 200));

        // Call OpenAI API with JSON mode
        const response = await client.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            response_format: { type: 'json_object' },
            max_tokens: 2000,
            temperature: 0.7,
            messages: [
                { role: 'system', content: CREATIVE_DIRECTOR_SYSTEM_PROMPT },
                { role: 'user', content: userMessage }
            ]
        });

        // Extract content
        const textContent = response.choices[0]?.message?.content;
        if (!textContent) {
            throw new Error('No response from GPT-4');
        }

        // Parse JSON from response
        let creativePlan;
        try {
            creativePlan = JSON.parse(textContent);
        } catch (parseError) {
            console.error('[LLM-CreativeDirector] Failed to parse GPT-4 response:', textContent);
            throw new Error('Failed to parse Scene Graph JSON from GPT-4 response');
        }

        // Validate required fields
        if (!creativePlan.composition || !creativePlan.elements || !creativePlan.copy) {
            throw new Error('Invalid Scene Graph: missing required fields');
        }

        console.log('[LLM-CreativeDirector] ✓ Generated Scene Graph:', creativePlan.composition);

        // Generate variants if requested
        const plans = [creativePlan];

        if (variants > 1) {
            // For now, we'll generate variations by slightly modifying the prompt
            for (let i = 1; i < variants; i++) {
                const variantPlan = JSON.parse(JSON.stringify(creativePlan));
                variantPlan.id = `variant_${i + 1}`;
                plans.push(variantPlan);
            }
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                plans,
                usage: {
                    prompt_tokens: response.usage?.prompt_tokens,
                    completion_tokens: response.usage?.completion_tokens,
                    total_tokens: response.usage?.total_tokens,
                    model: response.model
                }
            })
        };

    } catch (error) {
        console.error('[LLM-CreativeDirector] Error:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: error.message || 'Failed to generate creative plan',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
}
