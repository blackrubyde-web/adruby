/**
 * QUALITY ENGINE - TYPE DEFINITIONS
 * 
 * Types for validation issues, quality scoring, and retry mechanisms.
 */

import { z } from 'zod';

// ============================================================================
// VALIDATION ISSUES
// ============================================================================

export const VALIDATION_SEVERITIES = ['error', 'warning', 'info'] as const;
export type ValidationSeverity = typeof VALIDATION_SEVERITIES[number];

export const VALIDATION_CODES = [
    // Text issues
    'TEXT_OVERFLOW',
    'TEXT_TRUNCATED',
    'FONT_TOO_SMALL',
    'LINE_COUNT_EXCEEDED',

    // Layout issues
    'COLLISION_DETECTED',
    'SAFE_MARGIN_VIOLATION',
    'DENSITY_TOO_HIGH',
    'ELEMENT_OUT_OF_BOUNDS',

    // Visual issues
    'CONTRAST_TOO_LOW',
    'CTA_TOO_SMALL',
    'CTA_LOW_CONTRAST',
    'HIERARCHY_VIOLATED',

    // Content issues
    'MISSING_REQUIRED_ASSET',
    'PATTERN_MISMATCH',
    'BUSINESSMODEL_MISMATCH',

    // Quality issues
    'GENERIC_BACKGROUND',
    'NO_MEANINGFUL_HERO',
    'CLUTTERED_LAYOUT'
] as const;

export type ValidationCode = typeof VALIDATION_CODES[number];

/**
 * Validation issue - describes a problem found during validation
 */
export interface ValidationIssue {
    severity: ValidationSeverity;
    code: ValidationCode;
    message: string;
    affectedLayer?: string;
    affectedZone?: string;
    suggestedFix?: string;
    details?: Record<string, any>;
}

export const ValidationIssueSchema = z.object({
    severity: z.enum(VALIDATION_SEVERITIES),
    code: z.enum(VALIDATION_CODES),
    message: z.string().min(1),
    affectedLayer: z.string().optional(),
    affectedZone: z.string().optional(),
    suggestedFix: z.string().optional(),
    details: z.record(z.any()).optional()
});

// ============================================================================
// QUALITY SCORING
// ============================================================================

export interface QualityScore {
    overall: number;           // 0-100
    breakdown: {
        textQuality: number;     // 0-100
        layoutQuality: number;   // 0-100
        visualQuality: number;   // 0-100
        contentMatch: number;    // 0-100
    };
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    passesMinimum: boolean;
}

export const QualityScoreSchema = z.object({
    overall: z.number().min(0).max(100),
    breakdown: z.object({
        textQuality: z.number().min(0).max(100),
        layoutQuality: z.number().min(0).max(100),
        visualQuality: z.number().min(0).max(100),
        contentMatch: z.number().min(0).max(100)
    }),
    grade: z.enum(['A', 'B', 'C', 'D', 'F']),
    passesMinimum: z.boolean()
});

// ============================================================================
// VALIDATION RESULT
// ============================================================================

export interface ValidationResult {
    isValid: boolean;
    issues: ValidationIssue[];
    score: QualityScore;
    timestamp: string;
    meta?: {
        validationTime?: number;  // ms
        checksRun?: number;
    };
}

export const ValidationResultSchema = z.object({
    isValid: z.boolean(),
    issues: z.array(ValidationIssueSchema),
    score: QualityScoreSchema,
    timestamp: z.string(),
    meta: z.object({
        validationTime: z.number().optional(),
        checksRun: z.number().optional()
    }).optional()
});

// ============================================================================
// RETRY CONTEXT
// ============================================================================

export interface RetryAttempt {
    attemptNumber: number;
    templateId: string;
    issues: ValidationIssue[];
    fixAttempted?: 'tighten_copy' | 'swap_template' | 'adjust_zones';
    success: boolean;
}

export interface RetryContext {
    maxRetries: number;
    currentRetry: number;
    attempts: RetryAttempt[];
    lastError?: string;
}

export const RetryContextSchema = z.object({
    maxRetries: z.number().positive(),
    currentRetry: z.number().min(0),
    attempts: z.array(z.object({
        attemptNumber: z.number().positive(),
        templateId: z.string(),
        issues: z.array(ValidationIssueSchema),
        fixAttempted: z.enum(['tighten_copy', 'swap_template', 'adjust_zones']).optional(),
        success: z.boolean()
    })),
    lastError: z.string().optional()
});

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Check if issues contain any errors (as opposed to just warnings)
 */
export function hasErrors(issues: ValidationIssue[]): boolean {
    return issues.some(issue => issue.severity === 'error');
}

/**
 * Filter issues by severity
 */
export function filterBySeverity(
    issues: ValidationIssue[],
    severity: ValidationSeverity
): ValidationIssue[] {
    return issues.filter(issue => issue.severity === severity);
}

/**
 * Get error count
 */
export function getErrorCount(issues: ValidationIssue[]): number {
    return filterBySeverity(issues, 'error').length;
}

/**
 * Get warning count
 */
export function getWarningCount(issues: ValidationIssue[]): number {
    return filterBySeverity(issues, 'warning').length;
}

/**
 * Check if validation result passes minimum quality threshold
 */
export function meetsMinimumQuality(
    result: ValidationResult,
    minScore: number = 70
): boolean {
    return result.score.overall >= minScore && !hasErrors(result.issues);
}

/**
 * Convert quality score to letter grade
 */
export function scoreToGrade(score: number): QualityScore['grade'] {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
}
