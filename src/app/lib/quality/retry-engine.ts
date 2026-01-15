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
import { autoAdjustContrast, getAccessibleTextColor } from '../ai/color/contrast-validator';

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
    let bestCandidate: { document: AdDocument; issues: ValidationIssue[]; score: number } | null = null;

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

                if (!hasErrors(issues) && (!bestCandidate || score.overall > bestCandidate.score)) {
                    bestCandidate = {
                        document,
                        issues,
                        score: score.overall
                    };
                }

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
    if (bestCandidate) {
        return {
            document: bestCandidate.document,
            success: true,
            retryContext,
            finalValidation: {
                issues: bestCandidate.issues,
                score: bestCandidate.score
            }
        };
    }

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

    const applyZoneTextLimits = (layerId: string, text: string): string => {
        const zone = template.zones.find(z => z.layerId === layerId);
        if (!zone || !zone.rules) return text;

        let result = text;
        if (zone.rules.maxLines && result.includes('\n')) {
            const lines = result.split('\n');
            if (lines.length > zone.rules.maxLines) {
                result = lines.slice(0, zone.rules.maxLines).join('\n');
            }
        }
        if (zone.rules.maxChars && result.length > zone.rules.maxChars) {
            result = result.slice(0, zone.rules.maxChars).trim();
        }

        return result;
    };

    const minContrast = template.layoutConstraints?.minContrast ?? 4.5;
    const isHexColor = (value: string): boolean =>
        /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
    const resolveBackground = (value?: string): string => {
        if (value && isHexColor(value)) return value;
        const currentBackground = document.backgroundColor || palette[0];
        if (currentBackground && isHexColor(currentBackground)) return currentBackground;
        return '#FFFFFF';
    };
    const ensureContrast = (color: string | undefined, background: string | undefined): string => {
        const bg = resolveBackground(background);
        const base = color && isHexColor(color) ? color : getAccessibleTextColor(bg);
        return autoAdjustContrast(base, bg, minContrast);
    };

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
                layer.text = applyZoneTextLimits(layer.id, spec.copy.headline);
                layer.color = textSafe[0]; // Primary text color
            } else if (layer.role === 'subheadline') {
                layer.text = applyZoneTextLimits(layer.id, spec.copy.subheadline || '');
                layer.color = textSafe.length > 1 ? textSafe[1] : textSafe[0];
            } else if (layer.role === 'cta') {
                layer.text = applyZoneTextLimits(layer.id, spec.copy.cta);
                if (!layer.color && layer.fill) {
                    layer.color = layer.fill;
                } else if (!layer.color) {
                    layer.color = '#FFFFFF';
                }
                if (!layer.fill && layer.color) {
                    layer.fill = layer.color;
                }
            } else if (layer.role === 'description' || layer.role === 'body') {
                // If it's a list (benefits), format it
                if (spec.copy.bullets && spec.copy.bullets.length > 0) {
                    layer.text = applyZoneTextLimits(layer.id, spec.copy.bullets.map(b => `✓ ${b}`).join('\n'));
                } else {
                    layer.text = applyZoneTextLimits(layer.id, spec.copy.body || '');
                }
                layer.color = textSafe.length > 1 ? textSafe[1] : textSafe[0];
            } else if (layer.role === 'social_proof') {
                layer.text = applyZoneTextLimits(layer.id, spec.copy.proofLine || '');
                layer.color = textSafe.length > 1 ? textSafe[1] : textSafe[0];
            } else if (layer.role === 'badge' || layer.role === 'offer') {
                if (spec.groundedFacts?.offer) {
                    layer.text = applyZoneTextLimits(layer.id, spec.groundedFacts.offer);
                }
                layer.color = '#FFFFFF'; // Badges usually white text
            }

            const adjusted = ensureContrast(layer.color || layer.fill, baseBackground);
            layer.color = adjusted;
            layer.fill = adjusted;
        }

        // CTA Layer
        else if (layer.type === 'cta') {
            layer.text = applyZoneTextLimits(layer.id, spec.copy.cta);
            if (palette.length > 2) {
                layer.bgColor = palette[2] || '#000000'; // Accent color for CTA
            }
            layer.color = ensureContrast(layer.color || '#FFFFFF', layer.bgColor || baseBackground);
            layer.fill = layer.color;
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

    const hasCtaLayer = document.layers.some(layer =>
        layer.visible && (layer.type === 'cta' || (layer.type === 'text' && layer.role === 'cta'))
    );

    if (!hasCtaLayer && spec.copy.cta) {
        const docWidth = document.width || 1080;
        const docHeight = document.height || 1080;
        const safeMargins = template.layoutConstraints?.safeMargins || { top: 40, right: 40, bottom: 40, left: 40 };
        const minCtaWidth = template.layoutConstraints?.minCTAWidth || 200;
        const minCtaHeight = template.layoutConstraints?.minCTAHeight || 60;
        const ctaWidth = Math.max(minCtaWidth, Math.round(docWidth * 0.4));
        const ctaHeight = Math.max(minCtaHeight, 60);
        const ctaX = Math.round((docWidth - ctaWidth) / 2);
        const ctaY = Math.max(safeMargins.top, Math.round(docHeight - safeMargins.bottom - ctaHeight));
        const ctaBg = palette.length > 2 ? palette[2] || '#000000' : '#000000';

        document.layers.push({
            id: `cta_${Date.now()}`,
            type: 'cta',
            name: 'CTA',
            x: ctaX,
            y: ctaY,
            width: ctaWidth,
            height: ctaHeight,
            zIndex: 50,
            visible: true,
            locked: false,
            rotation: 0,
            opacity: 1,
            text: spec.copy.cta,
            fontFamily: 'Inter',
            fontWeight: 700,
            fontSize: Math.max(24, Math.round(ctaHeight * 0.45)),
            color: '#FFFFFF',
            fill: '#FFFFFF',
            align: 'center',
            bgColor: ctaBg,
            radius: Math.round(ctaHeight / 2),
            role: 'cta'
        });
    }

    // 3. INJECT ASSETS
    // ✅ FIX 3: Map ALL asset types, not just product_image and bg_image
    for (const layer of document.layers) {
        if (layer.type === 'product' || layer.type === 'image' || layer.type === 'background') {
            // Expanded asset role mapping
            const roleToAssetMap: Record<string, string> = {
                'product_image': 'productCutout',
                'hero': 'productCutout',
                'cutout': 'productCutout',
                'bg_image': 'background',
                'background': 'background',
                // ✅ NEW: Non-product asset roles
                'messenger_mock': 'messengerMock',
                'chat_proof': 'messengerMock',
                'whatsapp_mock': 'messengerMock',
                'dashboard_card': 'dashboardCard',
                'ui_proof': 'dashboardCard',
                'saas_mock': 'dashboardCard',
                'invoice_preview': 'invoicePreview',
                'document_proof': 'invoicePreview',
                'testimonial_card': 'testimonialCard',
                'social_proof_card': 'testimonialCard',
                'review_card': 'reviewCard',
                'rating_proof': 'reviewCard',
                'offer_badge': 'offerBadge',
                'discount_badge': 'discountBadge',
                'sale_badge': 'discountBadge',
                'urgency_badge': 'urgencyBadge',
                'limited_badge': 'urgencyBadge',
                'menu_card': 'menuCard',
                'dish_menu': 'menuCard',
                'map_card': 'mapCard',
                'location_proof': 'mapCard',
                'hours_card': 'hoursCard',
                'opening_hours': 'hoursCard',
                'dish_photo': 'dishPhoto',
                'food_image': 'dishPhoto',
                'portrait_frame': 'portraitFrame',
                'founder_image': 'portraitFrame',
                'results_card': 'resultsCard',
                'stats_proof': 'resultsCard',
                'authority_slide': 'authoritySlide',
                'credentials': 'authoritySlide',
                'calendar_card': 'calendarCard',
                'webinar_date': 'calendarCard',
                'comparison_table': 'comparisonTable',
                'vs_table': 'comparisonTable',
                'benefit_stack': 'benefitStack',
                'feature_list': 'benefitStack',
                'feature_chips': 'featureChips',
                'tags': 'featureChips',
                'stats_card': 'statsCard',
                'metrics': 'statsCard'
            };

            const assetType = layer.role ? roleToAssetMap[layer.role] : layer.type;

            if (assetType && availableAssets[assetType]) {
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
