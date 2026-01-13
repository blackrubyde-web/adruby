/**
 * RETRY ENGINE
 * 
 * Bounded retry loop with automatic fixes (tightenCopy, template swap, etc.)
 */

import type { AdDocument } from '../../types/studio';
import type { TemplateCapsule } from '../templates/types';
import type { CreativeSpec, CopyContent } from '../ai/creative/types';
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
                    console.log(`✅ Assembly successful on attempt ${retryContext.currentRetry}`);
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
                        console.log(`🔧 Attempting tightenCopy fix for template ${template.id}`);

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
                console.warn(`⚠️ Template ${template.id} failed validation, trying next template`);
                break;

            } catch (error) {
                console.error(`❌ Error assembling with template ${template.id}:`, error);
                retryContext.lastError = error instanceof Error ? error.message : String(error);
                break;
            }
        }
    }

    // All retries exhausted
    console.error(`❌ All ${retryContext.currentRetry} retry attempts failed`);

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
    document.width = template.ratio === '1:1' ? 1080 : template.ratio === '4:5' ? 1080 : 1080;
    document.height = template.ratio === '1:1' ? 1080 : template.ratio === '4:5' ? 1350 : 1920;

    // Inject copy into layers
    for (const layer of document.layers) {
        if (layer.type === 'text') {
            if (layer.role === 'headline') {
                layer.text = spec.copy.headline;
            } else if (layer.role === 'subheadline') {
                layer.text = spec.copy.subheadline || '';
            } else if (layer.role === 'description' || layer.role === 'body') {
                layer.text = spec.copy.body || '';
            } else if (layer.role === 'social_proof') {
                layer.text = spec.copy.proofLine || '';
            }
        } else if (layer.type === 'cta') {
            layer.text = spec.copy.cta;
        }
    }

    // Inject assets
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
