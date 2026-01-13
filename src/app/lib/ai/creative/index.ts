/**
 * CREATIVE SPEC SYSTEM - INDEX
 * 
 * Re-exports all modules from creative spec system
 */

export * from './types';
export * from './prompts';
export * from './spec-generator';
export * from './tighten-copy';

// Main functions
export {
    generateCreativeSpecs,
    generateSingleSpec,
    inferBusinessModel
} from './spec-generator';

export {
    tightenCopy,
    needsTightening
} from './tighten-copy';

export {
    buildCreativeSpecPrompt,
    buildMasterPrompt,
    getBusinessModelAddendum,
    buildTightenCopyPrompt
} from './prompts';

// Types
export type {
    BusinessModel,
    CreativeAngle,
    CreativePattern,
    Platform,
    Ratio,
    CreativeSpec,
    CreativeSpecRequest
} from './types';

// Validation
export {
    validateCreativeSpec,
    isValidCreativeSpec,
    CreativeSpecSchema
} from './types';

// Constants
export {
    BUSINESS_MODELS,
    CREATIVE_ANGLES,
    CREATIVE_PATTERNS,
    PLATFORMS,
    RATIOS
} from './types';
