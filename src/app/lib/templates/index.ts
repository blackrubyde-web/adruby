/**
 * TEMPLATE CAPABILITY SYSTEM - INDEX
 * 
 * Re-exports all types from the template capability module
 */

export * from './types';
export * from './scoring';
export * from './registry';

// Re-export commonly used types for convenience
export type {
    ZoneId,
    ContentType,
    ZoneRules,
    ZoneDynamicBehavior,
    ZoneSpec,
    CopyConstraints,
    LayoutConstraints,
    StylingTokens,
    PerformanceMetadata,
    TemplateCapsule,
    ValidatedTemplateCapsule
} from './types';

// Re-export validation functions
export {
    validateTemplateCapsule,
    isValidTemplateCapsule,
    TemplateCapsuleSchema,
    ZoneSpecSchema,
    CopyConstraintsSchema,
    LayoutConstraintsSchema,
    StylingTokensSchema,
    PerformanceMetadataSchema
} from './types';

// Re-export constants
export {
    ZONE_IDS,
    CONTENT_TYPES
} from './types';

// Re-export scoring functions
export {
    scoreTemplates,
    scoreTemplate,
    measureCopy,
    filterByMinScore,
    getTopN,
    getAssemblableTemplates
} from './scoring';

export type {
    MeasuredCopy,
    TemplateScoringContext,
    TemplateScoringResult
} from './scoring';

// Re-export registry
export {
    TEMPLATE_REGISTRY,
    getTemplateById,
    getTemplatesByBusinessModel,
    getTemplatesByPattern,
    getTemplatesByRatio
} from './registry';
