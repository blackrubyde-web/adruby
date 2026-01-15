/**
 * QUALITY SCORING
 * 
 * Calculate quality scores from validation results.
 */

import type { ValidationResult, ValidationIssue, QualityScore } from './types';
import { getErrorCount, scoreToGrade } from './types';

// ============================================================================
// QUALITY SCORING
// ============================================================================

/**
 * Calculate quality score from validation issues
 */
export function calculateQualityScore(issues: ValidationIssue[]): QualityScore {
    const errorCount = getErrorCount(issues);
    // Start with perfect score
    let textQuality = 100;
    let layoutQuality = 100;
    let visualQuality = 100;
    let contentMatch = 100;

    // Deduct points for each issue
    for (const issue of issues) {
        const deduction = issue.severity === 'error' ? 20 : 5;

        switch (issue.code) {
            // Text issues
            case 'TEXT_OVERFLOW':
            case 'FONT_TOO_SMALL':
            case 'LINE_COUNT_EXCEEDED':
                textQuality -= deduction;
                break;

            // Layout issues
            case 'COLLISION_DETECTED':
            case 'SAFE_MARGIN_VIOLATION':
            case 'DENSITY_TOO_HIGH':
            case 'ELEMENT_OUT_OF_BOUNDS':
                layoutQuality -= deduction;
                break;

            // Visual issues
            case 'CONTRAST_TOO_LOW':
            case 'CTA_TOO_SMALL':
            case 'CTA_LOW_CONTRAST':
            case 'HIERARCHY_VIOLATED':
                visualQuality -= deduction;
                break;

            // Content issues
            case 'MISSING_REQUIRED_ASSET':
            case 'PATTERN_MISMATCH':
            case 'BUSINESSMODEL_MISMATCH':
                contentMatch -= deduction;
                break;

            default:
                // Generic deduction
                textQuality -= deduction / 2;
                layoutQuality -= deduction / 2;
        }
    }

    // Ensure non-negative scores
    textQuality = Math.max(0, textQuality);
    layoutQuality = Math.max(0, layoutQuality);
    visualQuality = Math.max(0, visualQuality);
    contentMatch = Math.max(0, contentMatch);

    // Calculate overall score (weighted average)
    const overall = (
        textQuality * 0.35 +
        layoutQuality * 0.25 +
        visualQuality * 0.25 +
        contentMatch * 0.15
    );

    const grade = scoreToGrade(overall);
    const passesMinimum = overall >= 70 && errorCount === 0;

    return {
        overall,
        breakdown: {
            textQuality,
            layoutQuality,
            visualQuality,
            contentMatch
        },
        grade,
        passesMinimum
    };
}

/**
 * Create a validation result from issues
 */
export function createValidationResult(
    issues: ValidationIssue[],
    validationTime?: number,
    checksRun?: number
): ValidationResult {
    const score = calculateQualityScore(issues);
    const isValid = score.passesMinimum;

    return {
        isValid,
        issues,
        score,
        timestamp: new Date().toISOString(),
        meta: {
            validationTime,
            checksRun
        }
    };
}
