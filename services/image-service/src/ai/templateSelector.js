/**
 * Template Selector
 * 
 * GPT-4 powered intelligent template selection based on:
 * - Product type and features
 * - Copy content (headline, features, stats)
 * - Industry context
 * - User prompt hints
 */

import { callOpenAI } from '../utils/openaiClient.js';
import { listTemplates, getTemplatesForIndustry } from '../templates/index.js';
import { detectIndustry } from '../config/industries.js';


/**
 * Select optimal template using AI analysis
 */
export async function selectTemplate({
    productDescription,
    headline,
    tagline,
    features = [],
    stats = [],
    userPrompt,
    industry
}) {
    console.log('[TemplateSelector] Analyzing content for optimal template...');

    // Detect industry if not provided
    const detectedIndustry = industry || detectIndustry(userPrompt, productDescription);
    const recommendedTemplates = getTemplatesForIndustry(detectedIndustry);

    // If user explicitly mentions a template style, use that
    const explicitTemplate = detectExplicitTemplate(userPrompt);
    if (explicitTemplate) {
        console.log('[TemplateSelector] Using explicit template from prompt:', explicitTemplate);
        return {
            template: explicitTemplate,
            industry: detectedIndustry,
            reasoning: 'User explicitly requested this template style'
        };
    }

    // Use heuristics for simple cases
    const heuristicResult = selectByHeuristics({
        headline,
        features,
        stats,
        userPrompt,
        recommendedTemplates
    });

    if (heuristicResult.confidence > 0.8) {
        console.log('[TemplateSelector] Using heuristic selection:', heuristicResult.template);
        return {
            template: heuristicResult.template,
            industry: detectedIndustry,
            reasoning: heuristicResult.reasoning
        };
    }

    // Use GPT-4 for complex decisions
    try {
        const aiResult = await selectWithAI({
            productDescription,
            headline,
            tagline,
            features,
            stats,
            userPrompt,
            industry: detectedIndustry,
            recommendedTemplates
        });

        return {
            template: aiResult.template,
            industry: detectedIndustry,
            reasoning: aiResult.reasoning
        };
    } catch (error) {
        console.error('[TemplateSelector] AI selection failed, using fallback:', error.message);
        return {
            template: recommendedTemplates[0] || 'hero_product',
            industry: detectedIndustry,
            reasoning: 'Fallback to industry default'
        };
    }
}

/**
 * Detect if user explicitly mentioned a template style
 */
function detectExplicitTemplate(prompt) {
    if (!prompt) return null;
    const lower = prompt.toLowerCase();

    const templateHints = {
        feature_callout: ['callout', 'feature diagram', 'feature labels', 'dotted lines', 'feature points'],
        hero_product: ['hero', 'bold', 'dramatic', 'simple', 'clean', 'minimal'],
        stats_grid: ['stats', 'statistics', 'numbers', 'metrics', 'data points', 'customers'],
        comparison_split: ['comparison', 'before after', 'vs', 'versus', 'compare', 'before/after'],
        lifestyle_context: ['lifestyle', 'in use', 'action', 'person using', 'real world', 'context']
    };

    for (const [template, hints] of Object.entries(templateHints)) {
        if (hints.some(hint => lower.includes(hint))) {
            return template;
        }
    }

    return null;
}

/**
 * Select template using heuristics
 */
function selectByHeuristics({ headline, features, stats, userPrompt, recommendedTemplates }) {
    let template = recommendedTemplates[0] || 'hero_product';
    let confidence = 0.5;
    let reasoning = 'Default selection';

    // If we have 3+ features, use feature callout
    if (features && features.length >= 3) {
        template = 'feature_callout';
        confidence = 0.9;
        reasoning = 'Multiple features detected - feature callout is optimal';
    }
    // If we have 3+ stats, use stats grid
    else if (stats && stats.length >= 3) {
        template = 'stats_grid';
        confidence = 0.9;
        reasoning = 'Multiple statistics detected - stats grid is optimal';
    }
    // If prompt mentions comparison
    else if (userPrompt && /before|after|vs|versus|compare/.test(userPrompt.toLowerCase())) {
        template = 'comparison_split';
        confidence = 0.85;
        reasoning = 'Comparison language detected in prompt';
    }
    // If prompt mentions lifestyle/action
    else if (userPrompt && /lifestyle|action|use|person|wearing/.test(userPrompt.toLowerCase())) {
        template = 'lifestyle_context';
        confidence = 0.85;
        reasoning = 'Lifestyle/action language detected';
    }
    // Short headline, no features = hero product
    else if (headline && headline.length < 30 && (!features || features.length < 2)) {
        template = 'hero_product';
        confidence = 0.8;
        reasoning = 'Short headline with minimal features - hero product is clean';
    }

    return { template, confidence, reasoning };
}

/**
 * Select template using GPT-4
 */
async function selectWithAI({
    productDescription,
    headline,
    tagline,
    features,
    stats,
    userPrompt,
    industry,
    recommendedTemplates
}) {
    const availableTemplates = listTemplates();

    const prompt = `You are an expert Meta ad creative director. Select the best template for this ad.

PRODUCT: ${productDescription || 'Not specified'}
INDUSTRY: ${industry}
HEADLINE: ${headline || 'Not specified'}
TAGLINE: ${tagline || 'None'}
FEATURES: ${features.length > 0 ? features.join(', ') : 'None'}
STATS: ${stats.length > 0 ? JSON.stringify(stats) : 'None'}
USER REQUEST: ${userPrompt || 'None'}

AVAILABLE TEMPLATES:
1. feature_callout - Product with dotted lines pointing to feature labels (best for multi-feature products)
2. hero_product - Bold, dramatic product shot with prominent headline (versatile, always works)
3. stats_grid - Product surrounded by impressive statistics (best for social proof)
4. comparison_split - Before/After or Us vs. Them side-by-side (best for competitive positioning)
5. lifestyle_context - Product in real-world use (best for aspirational/emotional appeal)

INDUSTRY RECOMMENDATIONS: ${recommendedTemplates.join(', ')}

Respond with JSON:
{
    "template": "template_name",
    "reasoning": "Brief explanation of why this template is optimal"
}`;

    const response = await callOpenAI({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 200
    });

    const result = JSON.parse(response.choices[0].message.content);

    // Validate template exists
    if (!availableTemplates.includes(result.template)) {
        result.template = recommendedTemplates[0] || 'hero_product';
    }

    return result;
}

export default { selectTemplate };
