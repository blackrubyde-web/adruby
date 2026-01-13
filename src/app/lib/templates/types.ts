/**
 * TEMPLATE CAPABILITY SYSTEM - TYPE DEFINITIONS
 * 
 * Defines TemplateCapsule structure with capability metadata,
 * zone grammar, and constraints for intelligent template selection.
 */

import { z } from 'zod';
import type { AdDocument } from '../../types/studio';
import type { BusinessModel, CreativePattern, Ratio } from '../ai/creative/types';

// ============================================================================
// ZONE SPECIFICATIONS
// ============================================================================

export const ZONE_IDS = [
    'headline',
    'subheadline',
    'body',
    'cta',
    'badges',
    'chips',
    'proof',
    'hero',
    'secondary',
    'logo',
    'background',
    'overlay'
] as const;

export type ZoneId = typeof ZONE_IDS[number];

export const CONTENT_TYPES = [
    'text',
    'image',
    'chip',
    'icon',
    'stack',
    'table',
    'badge'
] as const;

export type ContentType = typeof CONTENT_TYPES[number];

export interface ZoneRules {
    maxLines?: number;
    maxChars?: number;
    minFontSize?: number;
    allowWrap?: boolean;
    align?: 'left' | 'center' | 'right';
    priority?: number;  // 1-10, higher = more important
}

export interface ZoneDynamicBehavior {
    scaleDown?: boolean;    // Can reduce font size
    truncate?: boolean;     // Can truncate text
    swap?: boolean;         // Can swap with alternative zone
}

/**
 * Zone specification - defines a content zone within a template
 */
export interface ZoneSpec {
    id: ZoneId;

    // Positioning (relative to base dimensions)
    bbox: {
        x: number;
        y: number;
        width: number;
        height: number;
    };

    // Content rules
    rules: ZoneRules;

    contentType: ContentType;

    // Dynamic behavior for overflow handling
    dynamic?: ZoneDynamicBehavior;

    // Optional layer ID mapping (maps to AdDocument layer)
    layerId?: string;
}

// Zod schema for ZoneSpec
export const ZoneSpecSchema = z.object({
    id: z.enum(ZONE_IDS),
    bbox: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number().positive(),
        height: z.number().positive()
    }),
    rules: z.object({
        maxLines: z.number().positive().optional(),
        maxChars: z.number().positive().optional(),
        minFontSize: z.number().positive().optional(),
        allowWrap: z.boolean().optional(),
        align: z.enum(['left', 'center', 'right']).optional(),
        priority: z.number().min(1).max(10).optional()
    }),
    contentType: z.enum(CONTENT_TYPES),
    dynamic: z.object({
        scaleDown: z.boolean().optional(),
        truncate: z.boolean().optional(),
        swap: z.boolean().optional()
    }).optional(),
    layerId: z.string().optional()
});

// ============================================================================
// CONSTRAINTS
// ============================================================================

export interface CopyConstraints {
    maxChars: {
        headline: number;
        subheadline?: number;
        body?: number;
        cta: number;
    };
    maxLines: {
        headline: number;
        subheadline?: number;
    };
    minFontSize: number;
    hierarchyRules?: {
        headlineShouldDominate: boolean;
        ctaShouldStandOut: boolean;
    };
}

export interface LayoutConstraints {
    safeMargins: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    minCTAWidth: number;
    minCTAHeight?: number;
    minLogoSize?: number;
    maxDensity: number;  // max elements per 1000px²
    minContrast?: number; // min contrast ratio for readability
}

export const CopyConstraintsSchema = z.object({
    maxChars: z.object({
        headline: z.number().positive(),
        subheadline: z.number().positive().optional(),
        body: z.number().positive().optional(),
        cta: z.number().positive()
    }),
    maxLines: z.object({
        headline: z.number().positive(),
        subheadline: z.number().positive().optional()
    }),
    minFontSize: z.number().positive(),
    hierarchyRules: z.object({
        headlineShouldDominate: z.boolean().optional(),
        ctaShouldStandOut: z.boolean().optional()
    }).optional()
});

export const LayoutConstraintsSchema = z.object({
    safeMargins: z.object({
        top: z.number().min(0),
        right: z.number().min(0),
        bottom: z.number().min(0),
        left: z.number().min(0)
    }),
    minCTAWidth: z.number().positive(),
    minCTAHeight: z.number().positive().optional(),
    minLogoSize: z.number().positive().optional(),
    maxDensity: z.number().positive(),
    minContrast: z.number().min(1).max(21).optional()
});

// ============================================================================
// STYLING TOKENS
// ============================================================================

export interface StylingTokens {
    paletteSlots: string[];      // e.g. ['background', 'primary', 'accent']
    typographySlots: string[];   // e.g. ['headlineFont', 'bodyFont']
    effectSlots?: string[];      // e.g. ['shadow', 'glow', 'gradient']
}

export const StylingTokensSchema = z.object({
    paletteSlots: z.array(z.string()),
    typographySlots: z.array(z.string()),
    effectSlots: z.array(z.string()).optional()
});

// ============================================================================
// PERFORMANCE METADATA
// ============================================================================

export interface PerformanceMetadata {
    estimatedCTR: number;         // 0-10 scale
    conversionPotential: 'low' | 'medium' | 'high';
    knownGoodFor?: string[];      // niches where this template performs well
    knownBadFor?: string[];       // niches to avoid
    avgQualityScore?: number;     // historical quality scores
}

export const PerformanceMetadataSchema = z.object({
    estimatedCTR: z.number().min(0).max(10),
    conversionPotential: z.enum(['low', 'medium', 'high']),
    knownGoodFor: z.array(z.string()).optional(),
    knownBadFor: z.array(z.string()).optional(),
    avgQualityScore: z.number().min(0).max(100).optional()
});

// ============================================================================
// TEMPLATE CAPSULE
// ============================================================================

/**
 * TemplateCapsule - Complete template definition with capability metadata
 * 
 * Extends the basic template with structured capability information
 * for intelligent selection and validation.
 */
export interface TemplateCapsule {
    // Identity
    id: string;
    name: string;
    ratio: Ratio;
    version: number;

    // Capability tags
    supportedBusinessModels: BusinessModel[];
    supportedPatterns: CreativePattern[];

    // Zone grammar (structured layout definition)
    zones: ZoneSpec[];

    // Asset requirements
    requiredAssets: string[];     // e.g. ['productCutout', 'cta']
    optionalAssets?: string[];    // e.g. ['badge', 'testimonial']
    forbiddenAssets?: string[];   // e.g. ['people', 'uiMocks']

    // Constraints
    copyConstraints: CopyConstraints;
    layoutConstraints: LayoutConstraints;

    // Styling tokens
    stylingTokens: StylingTokens;

    // Template document (actual AdDocument structure)
    document: Partial<AdDocument>;

    // Performance metadata (optional)
    performance?: PerformanceMetadata;

    // Metadata
    meta?: {
        createdAt?: string;
        updatedAt?: string;
        author?: string;
        tags?: string[];
    };
}

// ============================================================================
// ZOD VALIDATION SCHEMA
// ============================================================================

export const TemplateCapsuleSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    ratio: z.enum(['1:1', '4:5', '9:16']),
    version: z.number().positive(),

    supportedBusinessModels: z.array(z.enum([
        'ecommerce',
        'saas',
        'local',
        'coach',
        'agency',
        'info'
    ])),
    supportedPatterns: z.array(z.string()),

    zones: z.array(ZoneSpecSchema),

    requiredAssets: z.array(z.string()),
    optionalAssets: z.array(z.string()).optional(),
    forbiddenAssets: z.array(z.string()).optional(),

    copyConstraints: CopyConstraintsSchema,
    layoutConstraints: LayoutConstraintsSchema,

    stylingTokens: StylingTokensSchema,

    document: z.any(), // AdDocument schema is complex, validate separately

    performance: PerformanceMetadataSchema.optional(),

    meta: z.object({
        createdAt: z.string().optional(),
        updatedAt: z.string().optional(),
        author: z.string().optional(),
        tags: z.array(z.string()).optional()
    }).optional()
});

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export interface ValidatedTemplateCapsule {
    capsule: TemplateCapsule;
    isValid: boolean;
    errors?: z.ZodError;
}

/**
 * Validate a TemplateCapsule against the schema
 */
export function validateTemplateCapsule(capsule: unknown): ValidatedTemplateCapsule {
    try {
        const validated = TemplateCapsuleSchema.parse(capsule);
        return {
            capsule: validated as TemplateCapsule,
            isValid: true
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                capsule: capsule as TemplateCapsule,
                isValid: false,
                errors: error
            };
        }
        throw error;
    }
}

/**
 * Check if a TemplateCapsule is valid (type guard)
 */
export function isValidTemplateCapsule(capsule: unknown): capsule is TemplateCapsule {
    return validateTemplateCapsule(capsule).isValid;
}
