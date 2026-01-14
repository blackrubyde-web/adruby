/**
 * RETRY ENGINE
 * 
 * Bounded retry loop with automatic fixes (tightenCopy, template swap, etc.)
 */

import type { AdDocument, ImageLayer } from '../../types/studio';
import type { TemplateCapsule } from '../templates/types';
import type { CreativeSpec } from '../ai/creative/types';
import type { TemplateScoringResult } from '../templates/scoring';
import type { RetryContext, RetryAttempt, ValidationIssue } from './types';
import { validateAdDocument } from './validators';
import { calculateQualityScore } from './scoring';
import { hasErrors } from './types';
import { tightenCopy, needsTightening } from '../ai/creative/tighten-copy';

// ============================================================================
// ASSEMBLY CONTEXT
// ============================================================================

export interface AssemblyContext {
    spec: CreativeSpec;
    scoredTemplates: TemplateScoringResult[];
    availableAssets: Record<string, string>;
    apiKey: string;
    maxRetries?: number;
    minQualityScore?: number;
}

export interface AssemblyResult {
    document: AdDocument | null;
    success: boolean;
    retryContext: RetryContext;
    finalValidation?: {
        issues: ValidationIssue[];
        score: number;
    };
}

// ============================================================================
// RETRY ENGINE
// ============================================================================

/**
 * Assemble ad document with retry logic
 * 
 * Tries multiple templates and applies fixes until a valid document is produced
 * or max retries is reached.
 */
export async function assembleWithRetry(
    context: AssemblyContext
): Promise<AssemblyResult> {
    const {
        spec,
        scoredTemplates,
        availableAssets,
        apiKey,
        maxRetries = 3,
        minQualityScore = 70
    } = context;

    const retryContext: RetryContext = {
        maxRetries,
        currentRetry: 0,
        attempts: []
    };

    let currentSpec = { ...spec };

    // Try each template in order of score
    for (let templateIndex = 0; templateIndex < Math.min(scoredTemplates.length, maxRetries); templateIndex++) {
        const scoredTemplate = scoredTemplates[templateIndex];
        if (!scoredTemplate) break;

        const template = scoredTemplate.template;
        let attemptCount = 0;

        // Try this template with fixes
        while (attemptCount < 2) { // Max 2 attempts per template
            retryContext.currentRetry++;
            attemptCount++;

            try {
                // Assemble document (placeholder - would call actual assembly function)
                const document = await assembleDocument(template, currentSpec, availableAssets);

                // Validate
                const issues = validateAdDocument(document, template, currentSpec);
                const score = calculateQualityScore(issues);

                // Record attempt
                const attempt: RetryAttempt = {
                    attemptNumber: retryContext.currentRetry,
                    templateId: template.id,
                    issues,
                    fixAttempted: attemptCount > 1 ? 'tighten_copy' : undefined,
                    success: !hasErrors(issues) && score.overall >= minQualityScore
                };

                retryContext.attempts.push(attempt);

                // Check if successful
                if (attempt.success) {
                    return {
                        document,
                        success: true,
                        retryContext,
                        finalValidation: {
                            issues,
                            score: score.overall
                        }
                    };
                }

                // Try fixes for first attempt with this template
                if (attemptCount === 1) {
                    // Check if text overflow is the issue
                    const hasOverflow = issues.some(iss => iss.code === 'TEXT_OVERFLOW');

                    if (hasOverflow && needsTightening(currentSpec.copy, {
                        headline_max_chars: template.copyConstraints.maxChars.headline,
                        subheadline_max_chars: template.copyConstraints.maxChars.subheadline,
                        cta_max_chars: template.copyConstraints.maxChars.cta
                    })) {
                        const result = await tightenCopy(
                            currentSpec.copy,
                            {
                                headline_max_chars: template.copyConstraints.maxChars.headline,
                                subheadline_max_chars: template.copyConstraints.maxChars.subheadline || 100,
                                cta_max_chars: template.copyConstraints.maxChars.cta
                            },
                            spec.language,
                            'professional', // tone fallback
                            { apiKey }
                        );

                        currentSpec = {
                            ...currentSpec,
                            copy: result.copy
                        };

                        // Retry with tightened copy
                        continue;
                    }
                }

                // No fix available or fix didn't work, try next template
                break;

            } catch (error) {
                retryContext.lastError = error instanceof Error ? error.message : String(error);
                break;
            }
        }
    }

    // All retries exhausted
    return {
        document: null,
        success: false,
        retryContext
    };
}

// ============================================================================
// ASSEMBLY PLACEHOLDER
// ============================================================================

/**
 * Assemble ad document from template and spec
 * 
 * This is a placeholder - would be replaced with actual assembly logic
 * that uses TemplateEngine.injectContentIntoTemplate or similar
 */
async function assembleDocument(
    template: TemplateCapsule,
    spec: CreativeSpec,
    availableAssets: Record<string, string>
): Promise<AdDocument> {
    // Clone template document
    const document: AdDocument = JSON.parse(JSON.stringify(template.document));

    // Set basic properties
    document.id = `ad_${Date.now()}`;
    document.name = `${spec.businessModel}_${spec.creativePattern}`;

    // 1. APPLY THEME & COLORS (From Spec)
    const palette = spec.style.palette || ['#000000', '#FFFFFF', '#FF0000'];
    const textSafe = spec.style.textSafe || ['#000000', '#FFFFFF'];

    // Background Color
    const bgLayer = document.layers.find((layer): layer is ImageLayer => layer.type === 'background');
    if (bgLayer && !bgLayer.src && palette[0]) {
        bgLayer.fill = palette[0];
        // If palette has a specific background color intended, use that. 
        // Usually palette[0] is primary, palette[1] secondary. 
        // Let's look for a light/dark mode preference or just default to white/off-white if not specified, 
        // but here we want to use the AI's suggestion.
        document.backgroundColor = palette[0];
    }

    // 2. INJECT CONTENT & APPLY TYPOGRAPHY
    for (const layer of document.layers) {
        // Text Layers
        if (layer.type === 'text') {
            if (layer.role === 'headline') {
                layer.text = spec.copy.headline;
                layer.color = textSafe[0]; // Primary text color
            } else if (layer.role === 'subheadline') {
                layer.text = spec.copy.subheadline || '';
                layer.color = textSafe.length > 1 ? textSafe[1] : textSafe[0];
            } else if (layer.role === 'description' || layer.role === 'body') {
                // If it's a list (benefits), format it
                if (spec.copy.bullets && spec.copy.bullets.length > 0) {
                    layer.text = spec.copy.bullets.map(b => `✓ ${b}`).join('\n');
                } else {
                    layer.text = spec.copy.body || '';
                }
                layer.color = textSafe.length > 1 ? textSafe[1] : textSafe[0];
            } else if (layer.role === 'social_proof') {
                layer.text = spec.copy.proofLine || '';
                layer.color = textSafe.length > 1 ? textSafe[1] : textSafe[0];
            } else if (layer.role === 'badge' || layer.role === 'offer') {
                if (spec.groundedFacts?.offer) {
                    layer.text = spec.groundedFacts.offer;
                }
                layer.color = '#FFFFFF'; // Badges usually white text
            }
        }

        // CTA Layer
        else if (layer.type === 'cta') {
            layer.text = spec.copy.cta;
            if (palette.length > 2) {
                layer.bgColor = palette[2] || '#000000'; // Accent color for CTA
            }
            layer.color = '#FFFFFF'; // White text on colored button
        }

        // Shape Layers (e.g. Badges)
        else if (layer.type === 'shape') {
            if (layer.role === 'badge' || layer.name.toLowerCase().includes('badge')) {
                if (palette.length > 2) {
                    layer.fill = palette[2] || '#FF0000'; // Accent color
                }
            }
        }
    }

    // 3. INJECT ASSETS
    for (const layer of document.layers) {
        if (layer.type === 'product' || layer.type === 'image' || layer.type === 'background') {
            // Map layer role to asset type
            const assetType = layer.role === 'product_image' ? 'productCutout' :
                layer.role === 'bg_image' ? 'background' :
                    layer.type;

            if (availableAssets[assetType]) {
                layer.src = availableAssets[assetType];
            }
        }
    }

    return document;
}

/**
 * Simple assembly without retry (for testing)
 */
export async function assembleSimple(
    template: TemplateCapsule,
    spec: CreativeSpec,
    availableAssets: Record<string, string>
): Promise<AdDocument> {
    return assembleDocument(template, spec, availableAssets);
}
