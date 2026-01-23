/**
 * Ad Generator - Core generation logic (v2.0)
 * 
 * Template-based generation with intelligent selection:
 * 1. Analyze input and select optimal template
 * 2. Generate scene with Gemini (NO text)
 * 3. Apply template-specific overlays with Sharp/SVG
 * 4. Apply post-processing effects
 * 5. Quality check
 */

import sharp from 'sharp';
import { getTemplate } from '../templates/index.js';
import { selectTemplate } from '../ai/templateSelector.js';
import { getIndustryConfig, detectIndustry } from '../config/industries.js';
import { applyEffects } from '../effects/index.js';
import { quickCheck } from '../ai/qualityChecker.js';
import { fetchProductImage } from '../utils/imageLoader.js';

/**
 * Main ad generation function
 */
export async function generateAd({
    productImageUrl,
    productImageBase64,
    headline,
    tagline,
    cta,
    features = [],
    stats = [],
    comparisonData,
    userPrompt,
    industry,
    template,
    style,
    accentColor,
    enableQualityCheck = false,
    maxRetries = 2
}) {
    console.log('[AdGenerator] 🚀 Starting template-based generation...');
    const startTime = Date.now();

    // Step 1: Load product image
    let productBuffer = null;
    if (productImageBase64) {
        productBuffer = Buffer.from(productImageBase64, 'base64');
        console.log('[AdGenerator] Using base64 product image');
    } else if (productImageUrl) {
        productBuffer = await fetchProductImage(productImageUrl);
        console.log('[AdGenerator] Fetched product image from URL');
    }

    // Step 2: Detect industry if not provided
    const detectedIndustry = industry || detectIndustry(userPrompt || '', headline || '');
    const industryConfig = getIndustryConfig(detectedIndustry);
    console.log('[AdGenerator] Industry:', detectedIndustry);

    // Step 3: Select template if not provided
    let selectedTemplate = template;
    if (!selectedTemplate) {
        const selection = await selectTemplate({
            productDescription: userPrompt,
            headline,
            tagline,
            features,
            stats,
            userPrompt,
            industry: detectedIndustry
        });
        selectedTemplate = selection.template;
        console.log('[AdGenerator] Selected template:', selectedTemplate, '-', selection.reasoning);
    }

    // Step 4: Get template generator
    const templateDef = getTemplate(selectedTemplate);
    console.log('[AdGenerator] Using template:', templateDef.name);

    // Step 5: Determine style and colors
    const effectiveStyle = style || industryConfig.defaultStyle;
    const effectiveAccent = accentColor || industryConfig.colors.primary;

    // Step 6: Generate ad with template
    let result;
    let attempts = 0;

    while (attempts < maxRetries) {
        attempts++;
        console.log(`[AdGenerator] Generation attempt ${attempts}/${maxRetries}`);

        try {
            result = await templateDef.generator({
                productBuffer,
                headline,
                tagline,
                cta,
                features,
                stats,
                comparisonData,
                userPrompt,
                accentColor: effectiveAccent,
                industry: detectedIndustry,
                style: effectiveStyle
            });

            // Step 7: Apply industry-specific effects
            if (industryConfig.effects && industryConfig.effects.length > 0) {
                // Apply first 2 effects from industry config
                const effectsToApply = mapIndustryEffects(industryConfig.effects.slice(0, 2));
                if (effectsToApply.length > 0) {
                    result.buffer = await applyEffects(result.buffer, effectsToApply, {
                        color: effectiveAccent
                    });
                }
            }

            // Step 8: Quality check (optional)
            if (enableQualityCheck) {
                const qualityResult = await quickCheck(result.buffer);
                if (!qualityResult.passes) {
                    console.log('[AdGenerator] Quality check failed:', qualityResult.reason);
                    if (attempts < maxRetries) {
                        continue; // Retry
                    }
                }
            }

            break; // Success, exit loop

        } catch (error) {
            console.error(`[AdGenerator] Attempt ${attempts} failed:`, error.message);
            if (attempts >= maxRetries) {
                throw error;
            }
        }
    }

    const duration = Date.now() - startTime;
    console.log(`[AdGenerator] ✅ Complete in ${duration}ms`);

    return {
        buffer: result.buffer,
        template: selectedTemplate,
        industry: detectedIndustry,
        duration
    };
}

/**
 * Map industry effect names to actual effect functions
 */
function mapIndustryEffects(industryEffects) {
    const effectMap = {
        'neon_glow': 'neon_glow',
        'glass_reflection': 'soft_glow',
        'subtle_grid': 'vignette',
        'warm_glow': 'warm_tint',
        'soft_shadow': 'soft_shadow',
        'appetizing_tint': 'warm_tint',
        'editorial_shadow': 'soft_shadow',
        'grain': 'grain',
        'high_contrast': 'contrast_boost',
        'soft_glow': 'soft_glow',
        'bloom': 'soft_glow',
        'nature_overlay': 'soft_glow',
        'dynamic_blur': 'vignette',
        'energy_glow': 'neon_glow',
        'glass_card': 'soft_glow',
        'warm_ambient': 'warm_tint',
        'cozy_vignette': 'vignette'
    };

    return industryEffects
        .map(effect => effectMap[effect])
        .filter(Boolean);
}

/**
 * Generate ad with specific template (direct call)
 */
export async function generateWithTemplate(templateName, options) {
    const templateDef = getTemplate(templateName);
    return templateDef.generator(options);
}

export default { generateAd, generateWithTemplate };
