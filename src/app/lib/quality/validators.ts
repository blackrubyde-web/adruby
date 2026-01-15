/**
 * QUALITY VALIDATORS
 * 
 * Comprehensive validation rules for ad document quality assurance.
 * Detects text overflow, collisions, contrast issues, and more.
 */

import type { AdDocument, StudioLayer } from '../../types/studio';
import type { TemplateCapsule } from '../templates/types';
import type { CreativeSpec } from '../ai/creative/types';
import type { ValidationIssue } from './types';

// ============================================================================
// TEXT OVERFLOW VALIDATION
// ============================================================================

/**
 * Check for text overflow in text layers
 */
export function validateTextOverflow(
    document: AdDocument,
    template: TemplateCapsule
): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    const textLayers = document.layers.filter(
        layer => layer.type === 'text' || layer.type === 'cta'
    );

    for (const layer of textLayers) {
        if (layer.type !== 'text' && layer.type !== 'cta') continue;

        const text = layer.text || '';
        const chars = text.length;

        // Find corresponding zone in template
        const zone = template.zones.find(z => z.layerId === layer.id);
        if (!zone || !zone.rules.maxChars) continue;

        // Check character limit
        if (chars > zone.rules.maxChars) {
            issues.push({
                severity: 'error',
                code: 'TEXT_OVERFLOW',
                message: `Text exceeds maximum characters: ${chars}/${zone.rules.maxChars}`,
                affectedLayer: layer.id,
                affectedZone: zone.id,
                suggestedFix: 'Use tightenCopy to compress text',
                details: {
                    currentChars: chars,
                    maxChars: zone.rules.maxChars,
                    overflow: chars - zone.rules.maxChars
                }
            });
        }

        // Check line count (estimated)
        if (zone.rules.maxLines) {
            const estimatedLines = estimateLineCount(text, layer.fontSize || 16, layer.width);
            if (estimatedLines > zone.rules.maxLines) {
                issues.push({
                    severity: 'warning',
                    code: 'LINE_COUNT_EXCEEDED',
                    message: `Text may wrap to ${estimatedLines} lines (max ${zone.rules.maxLines})`,
                    affectedLayer: layer.id,
                    affectedZone: zone.id,
                    details: {
                        estimatedLines,
                        maxLines: zone.rules.maxLines
                    }
                });
            }
        }

        // Check minimum font size
        if (zone.rules.minFontSize && layer.fontSize && layer.fontSize < zone.rules.minFontSize) {
            issues.push({
                severity: 'error',
                code: 'FONT_TOO_SMALL',
                message: `Font size ${layer.fontSize}px is below minimum ${zone.rules.minFontSize}px`,
                affectedLayer: layer.id,
                suggestedFix: 'Increase font size or reduce text length'
            });
        }
    }

    return issues;
}

function estimateLineCount(text: string, fontSize: number, width: number): number {
    const avgCharWidth = fontSize * 0.6;
    const charsPerLine = Math.max(1, Math.floor(width / avgCharWidth));
    const lines = text.split('\n');
    return lines.reduce((sum, line) => sum + Math.ceil(line.length / charsPerLine), 0);
}

// ============================================================================
// COLLISION DETECTION
// ============================================================================

interface BBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Check for layer collisions
 */
export function validateCollisions(
    document: AdDocument,
    _template: TemplateCapsule
): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    const layers = document.layers.filter(
        layer => layer.visible && (layer.type === 'text' || layer.type === 'cta' || layer.type === 'logo')
    );

    for (let i = 0; i < layers.length; i++) {
        for (let j = i + 1; j < layers.length; j++) {
            const layer1 = layers[i];
            const layer2 = layers[j];

            if (checkCollision(layer1, layer2)) {
                issues.push({
                    severity: 'warning',
                    code: 'COLLISION_DETECTED',
                    message: `Layers "${layer1.name}" and "${layer2.name}" overlap`,
                    affectedLayer: layer1.id,
                    details: {
                        layer1: layer1.id,
                        layer2: layer2.id
                    }
                });
            }
        }
    }

    return issues;
}

function checkCollision(layer1: StudioLayer, layer2: StudioLayer): boolean {
    const bbox1: BBox = {
        x: layer1.x,
        y: layer1.y,
        width: layer1.width,
        height: layer1.height
    };

    const bbox2: BBox = {
        x: layer2.x,
        y: layer2.y,
        width: layer2.width,
        height: layer2.height
    };

    return !(
        bbox1.x + bbox1.width < bbox2.x ||
        bbox2.x + bbox2.width < bbox1.x ||
        bbox1.y + bbox1.height < bbox2.y ||
        bbox2.y + bbox2.height < bbox1.y
    );
}

// ============================================================================
// SAFE MARGIN VALIDATION
// ============================================================================

/**
 * Check if elements violate safe margins
 */
export function validateSafeMargins(
    document: AdDocument,
    template: TemplateCapsule
): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    const { safeMargins } = template.layoutConstraints;
    const docWidth = document.width || 1080;
    const docHeight = document.height || 1080;

    const importantLayers = document.layers.filter(
        layer => layer.visible && (layer.type === 'text' || layer.type === 'cta')
    );

    for (const layer of importantLayers) {
        // Check top margin
        if (layer.y < safeMargins.top) {
            issues.push({
                severity: 'warning',
                code: 'SAFE_MARGIN_VIOLATION',
                message: `Layer "${layer.name}" violates top safe margin`,
                affectedLayer: layer.id,
                details: { margin: 'top', violation: safeMargins.top - layer.y }
            });
        }

        // Check left margin
        if (layer.x < safeMargins.left) {
            issues.push({
                severity: 'warning',
                code: 'SAFE_MARGIN_VIOLATION',
                message: `Layer "${layer.name}" violates left safe margin`,
                affectedLayer: layer.id,
                details: { margin: 'left', violation: safeMargins.left - layer.x }
            });
        }

        // Check right margin
        if (layer.x + layer.width > docWidth - safeMargins.right) {
            issues.push({
                severity: 'warning',
                code: 'SAFE_MARGIN_VIOLATION',
                message: `Layer "${layer.name}" violates right safe margin`,
                affectedLayer: layer.id,
                details: { margin: 'right' }
            });
        }

        // Check bottom margin
        if (layer.y + layer.height > docHeight - safeMargins.bottom) {
            issues.push({
                severity: 'warning',
                code: 'SAFE_MARGIN_VIOLATION',
                message: `Layer "${layer.name}" violates bottom safe margin`,
                affectedLayer: layer.id,
                details: { margin: 'bottom' }
            });
        }
    }

    return issues;
}

// ============================================================================
// CONTRAST VALIDATION
// ============================================================================

/**
 * Check contrast ratios (simplified approximation)
 */
export function validateContrast(
    document: AdDocument,
    template: TemplateCapsule
): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    const minContrast = template.layoutConstraints.minContrast || 4.5;

    const textLayers = document.layers.filter(
        layer => (layer.type === 'text' || layer.type === 'cta') && layer.visible
    );

    for (const layer of textLayers) {
        if (layer.type !== 'text' && layer.type !== 'cta') continue;

        const textColor = layer.type === 'text' ? layer.color || layer.fill : layer.color;
        const bgColor = layer.type === 'cta' ? layer.bgColor : document.backgroundColor;

        if (!textColor || !bgColor) continue;

        const contrast = approximateContrast(textColor, bgColor);

        if (contrast < minContrast) {
            issues.push({
                severity: 'error',
                code: 'CONTRAST_TOO_LOW',
                message: `Contrast ratio ${contrast.toFixed(1)}:1 is below minimum ${minContrast}:1`,
                affectedLayer: layer.id,
                suggestedFix: 'Adjust text or background color',
                details: {
                    contrast: contrast.toFixed(1),
                    minContrast,
                    textColor,
                    bgColor
                }
            });
        }
    }

    return issues;
}

/**
 * Approximate contrast ratio using relative luminance
 * HIGH-002 FIX: Added error handling and hex normalization
 */
function approximateContrast(color1: string, color2: string): number {
    try {
        const lum1 = getLuminance(color1);
        const lum2 = getLuminance(color2);

        const lighter = Math.max(lum1, lum2);
        const darker = Math.min(lum1, lum2);

        return (lighter + 0.05) / (darker + 0.05);
    } catch (error) {
        console.warn(`Contrast calculation failed for ${color1} vs ${color2}:`, error);
        return 4.5; // Fallback to passing contrast
    }
}

/**
 * Normalize hex color to 6-char format (#FFF -> #FFFFFF)
 */
function normalizeHex(color: string): string {
    let hex = color.replace('#', '');
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error(`Invalid hex color: ${color}`);
    }
    return hex;
    return hex;
}

function getLuminance(color: string): number {
    // Normalize and parse hex color
    const hex = normalizeHex(color);
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    // Simplified luminance calculation
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// ============================================================================
// HIERARCHY VALIDATION
// ============================================================================

/**
 * Check visual hierarchy (headline should dominate)
 */
export function validateHierarchy(
    document: AdDocument,
    template: TemplateCapsule
): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (!template.copyConstraints.hierarchyRules?.headlineShouldDominate) {
        return issues;
    }

    const headlineLayer = document.layers.find(
        layer => (layer.type === 'text' && layer.role === 'headline')
    );

    const bodyLayers = document.layers.filter(
        layer => (layer.type === 'text' &&
            (layer.role === 'subheadline' || layer.role === 'description' || layer.role === 'body'))
    );

    if (!headlineLayer || headlineLayer.type !== 'text') return issues;

    for (const bodyLayer of bodyLayers) {
        if (bodyLayer.type !== 'text') continue;

        if (bodyLayer.fontSize && headlineLayer.fontSize && bodyLayer.fontSize >= headlineLayer.fontSize) {
            issues.push({
                severity: 'warning',
                code: 'HIERARCHY_VIOLATED',
                message: `Body text (${bodyLayer.fontSize}px) should be smaller than headline (${headlineLayer.fontSize}px)`,
                affectedLayer: bodyLayer.id,
                suggestedFix: 'Reduce body font size or increase headline size'
            });
        }
    }

    return issues;
}

// ============================================================================
// CTA VALIDATION
// ============================================================================

/**
 * Check CTA prominence and size
 */
export function validateCTA(
    document: AdDocument,
    template: TemplateCapsule
): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    const ctaLayers = document.layers.filter(layer =>
        layer.visible && (layer.type === 'cta' || (layer.type === 'text' && layer.role === 'cta'))
    );

    if (ctaLayers.length === 0) {
        issues.push({
            severity: 'error',
            code: 'MISSING_REQUIRED_ASSET',
            message: 'No CTA found in document',
            suggestedFix: 'Add a CTA layer'
        });
        return issues;
    }

    for (const cta of ctaLayers) {
        // Check minimum width
        if (cta.width < template.layoutConstraints.minCTAWidth) {
            issues.push({
                severity: 'warning',
                code: 'CTA_TOO_SMALL',
                message: `CTA width ${cta.width}px is below minimum ${template.layoutConstraints.minCTAWidth}px`,
                affectedLayer: cta.id,
                suggestedFix: 'Increase CTA width'
            });
        }

        // Check minimum height if specified
        if (template.layoutConstraints.minCTAHeight && cta.height < template.layoutConstraints.minCTAHeight) {
            issues.push({
                severity: 'warning',
                code: 'CTA_TOO_SMALL',
                message: `CTA height ${cta.height}px is below minimum ${template.layoutConstraints.minCTAHeight}px`,
                affectedLayer: cta.id
            });
        }
    }

    return issues;
}

// ============================================================================
// DENSITY VALIDATION
// ============================================================================

/**
 * Check element density
 */
export function validateDensity(
    document: AdDocument,
    template: TemplateCapsule
): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    const visibleLayers = document.layers.filter(layer => layer.visible);
    const area = (document.width || 1080) * (document.height || 1080);
    const density = visibleLayers.length / (area / 1000); // elements per 1000px²

    if (density > template.layoutConstraints.maxDensity) {
        issues.push({
            severity: 'warning',
            code: 'DENSITY_TOO_HIGH',
            message: `Element density ${density.toFixed(1)} exceeds maximum ${template.layoutConstraints.maxDensity}`,
            suggestedFix: 'Reduce number of elements or simplify layout',
            details: {
                density: density.toFixed(1),
                maxDensity: template.layoutConstraints.maxDensity,
                elementCount: visibleLayers.length
            }
        });
    }

    return issues;
}

// ============================================================================
// MASTER VALIDATOR
// ============================================================================

/**
 * Run all validations
 */
export function validateAdDocument(
    document: AdDocument,
    template: TemplateCapsule,
    spec: CreativeSpec
): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Run all validation checks
    issues.push(...validateTextOverflow(document, template));
    issues.push(...validateCollisions(document, template));
    issues.push(...validateSafeMargins(document, template));
    issues.push(...validateContrast(document, template));
    issues.push(...validateHierarchy(document, template));
    issues.push(...validateCTA(document, template));
    issues.push(...validateDensity(document, template));

    // Check pattern mismatch
    if (!template.supportedPatterns.includes(spec.creativePattern)) {
        issues.push({
            severity: 'warning',
            code: 'PATTERN_MISMATCH',
            message: `Template doesn't support pattern "${spec.creativePattern}"`,
            details: {
                requestedPattern: spec.creativePattern,
                supportedPatterns: template.supportedPatterns
            }
        });
    }

    // Check business model mismatch
    if (!template.supportedBusinessModels.includes(spec.businessModel)) {
        issues.push({
            severity: 'warning',
            code: 'BUSINESSMODEL_MISMATCH',
            message: `Template not optimized for business model "${spec.businessModel}"`,
            details: {
                requestedModel: spec.businessModel,
                supportedModels: template.supportedBusinessModels
            }
        });
    }

    return issues;
}
