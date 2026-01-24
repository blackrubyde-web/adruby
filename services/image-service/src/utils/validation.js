/**
 * REQUEST VALIDATION
 * 
 * Zod-basierte Validierung für alle API Requests
 */

import { z } from 'zod';
import { ValidationError } from './errors.js';

// ========================================
// SCHEMAS
// ========================================

// Base64 image pattern
const base64Pattern = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

// Industry enum
const IndustryEnum = z.enum([
    'technology', 'saas', 'fintech', 'crypto', 'ai', 'cybersecurity',
    'ecommerce', 'fashion', 'beauty', 'luxury', 'jewelry',
    'health', 'fitness', 'wellness', 'medical', 'pharma',
    'food', 'beverage', 'restaurant', 'delivery',
    'travel', 'hospitality', 'real_estate',
    'automotive', 'mobility',
    'education', 'edtech',
    'entertainment', 'gaming', 'media',
    'finance', 'insurance', 'banking',
    'b2b', 'enterprise', 'consulting',
    'nonprofit', 'government',
    'other'
]).optional();

// Format enum
const FormatEnum = z.enum([
    'square', 'story', 'portrait', 'landscape', 'linkedin', 'pinterest', 'youtube_thumb'
]).optional();

// ========================================
// GENERATE COMPOSITE REQUEST SCHEMA
// ========================================

export const GenerateCompositeSchema = z.object({
    // Product Image (one of these required)
    productImageUrl: z.string().url().optional(),
    productImageBase64: z.string()
        .refine(s => !s || s.length < 10_000_000, 'Image too large (max 10MB)')
        .optional(),

    // Text content
    headline: z.string().max(150).optional(),
    tagline: z.string().max(200).optional(),
    cta: z.string().max(50).optional(),

    // Colors
    accentColor: z.string()
        .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color')
        .optional(),

    // Context
    industry: IndustryEnum,
    userPrompt: z.string().max(1000).optional(),

    // Options
    enableQualityCheck: z.boolean().default(true),
    enableAIContent: z.boolean().default(true),
    enableAdvancedEffects: z.boolean().default(true),

    // Output format
    format: FormatEnum.default('square'),
    exportFormats: z.array(FormatEnum).optional()
}).refine(
    data => data.productImageUrl || data.productImageBase64,
    { message: 'Either productImageUrl or productImageBase64 is required' }
);

// ========================================
// FOREPLAY SEARCH SCHEMA
// ========================================

export const ForeplaySearchSchema = z.object({
    industry: z.string().min(1).max(100),
    keywords: z.array(z.string().max(50)).max(10).optional(),
    limit: z.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['relevance', 'longest_running', 'recent']).default('longest_running')
});

// ========================================
// BATCH GENERATE SCHEMA
// ========================================

export const BatchGenerateSchema = z.object({
    requests: z.array(GenerateCompositeSchema).min(1).max(10),
    priority: z.enum(['low', 'normal', 'high']).default('normal')
});

// ========================================
// EXPORT FORMAT SCHEMA
// ========================================

export const ExportFormatSchema = z.object({
    imageBase64: z.string().min(1),
    format: FormatEnum.default('square'),
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#0A0A1A')
});

// ========================================
// VALIDATION FUNCTION
// ========================================

/**
 * Validate request body against schema
 */
export function validateRequest(schema, data) {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const firstError = error.errors[0];
            throw new ValidationError(
                firstError.path.join('.'),
                firstError.message,
                data[firstError.path[0]]
            );
        }
        throw error;
    }
}

/**
 * Express middleware for validation
 */
export function validateMiddleware(schema) {
    return (req, res, next) => {
        try {
            req.validatedBody = validateRequest(schema, req.body);
            next();
        } catch (error) {
            if (error instanceof ValidationError) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    details: {
                        field: error.field,
                        message: error.message
                    }
                });
            }
            next(error);
        }
    };
}

// ========================================
// SANITIZE HELPERS
// ========================================

/**
 * Sanitize string input
 */
export function sanitizeString(str, maxLength = 1000) {
    if (!str || typeof str !== 'string') return '';
    return str
        .trim()
        .slice(0, maxLength)
        .replace(/[<>]/g, ''); // Basic XSS prevention
}

/**
 * Sanitize color input
 */
export function sanitizeColor(color) {
    if (!color || typeof color !== 'string') return null;
    const match = color.match(/^#?([0-9A-Fa-f]{6})$/);
    return match ? `#${match[1].toUpperCase()}` : null;
}

export default {
    GenerateCompositeSchema,
    ForeplaySearchSchema,
    BatchGenerateSchema,
    ExportFormatSchema,
    validateRequest,
    validateMiddleware,
    sanitizeString,
    sanitizeColor
};
