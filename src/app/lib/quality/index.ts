/**
 * QUALITY ENGINE - INDEX
 * 
 * Re-exports all types from the quality engine module
 */

export * from './types';
export * from './validators';
export * from './scoring';
export * from './retry-engine';

// Re-export commonly used types for convenience
export type {
    ValidationSeverity,
    ValidationCode,
    ValidationIssue,
    QualityScore,
    ValidationResult,
    RetryAttempt,
    RetryContext
} from './types';

// Re-export validation schemas
export {
    ValidationIssueSchema,
    QualityScoreSchema,
    ValidationResultSchema,
    RetryContextSchema
} from './types';

// Re-export helper functions
export {
    hasErrors,
    filterBySeverity,
    getErrorCount,
    getWarningCount,
    meetsMinimumQuality,
    scoreToGrade
} from './types';

// Re-export constants
export {
    VALIDATION_SEVERITIES,
    VALIDATION_CODES
} from './types';

// Re-export validators
export {
    validateAdDocument,
    validateTextOverflow,
    validateCollisions,
    validateSafeMargins,
    validateContrast,
    validateHierarchy,
    validateCTA,
    validateDensity
} from './validators';

// Re-export scoring
export {
    calculateQualityScore,
    createValidationResult
} from './scoring';

// Re-export retry engine
export {
    assembleWithRetry,
    assembleSimple
} from './retry-engine';

export type {
    AssemblyContext,
    AssemblyResult
} from './retry-engine';
