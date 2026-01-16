/**
 * AI Ad Builder - Zod Validation Schemas
 * Enterprise-grade input validation
 */

import { z } from 'zod';

// Template IDs
const TEMPLATE_IDS = [
    'product_launch',
    'limited_offer',
    'testimonial',
    'before_after',
    'seasonal',
    'b2b_solution',
    'lifestyle'
];

// Form Mode Schema
export const FormModeSchema = z.object({
    mode: z.literal('form'),
    language: z.enum(['de', 'en']).default('de'),
    productName: z.string().min(2, 'Product name must be at least 2 characters').max(100),
    industry: z.string().max(50).optional(),
    targetAudience: z.string().max(200).optional(),
    usp: z.string().max(500).optional(),
    tone: z.string().max(50).optional(),
    goal: z.string().max(200).optional(),
    template: z.enum(TEMPLATE_IDS).default('product_launch')
});

// Free Text Mode Schema
export const FreeModeSchema = z.object({
    mode: z.literal('free'),
    language: z.enum(['de', 'en']).default('de'),
    text: z.string().min(10, 'Text must be at least 10 characters').max(2000),
    template: z.enum(TEMPLATE_IDS).default('product_launch')
});

// Combined Request Schema - discriminated union
export const AdRequestSchema = z.discriminatedUnion('mode', [
    FormModeSchema,
    FreeModeSchema
]);

// Light mode request (simpler validation)
export const LightRequestSchema = z.object({
    mode: z.enum(['form', 'free']),
    language: z.enum(['de', 'en']).default('de'),
    productName: z.string().optional(),
    text: z.string().optional(),
    template: z.string().default('product_launch')
}).refine(
    (data) => {
        if (data.mode === 'form') return !!data.productName;
        if (data.mode === 'free') return !!data.text;
        return false;
    },
    { message: 'Form mode requires productName, free mode requires text' }
);

/**
 * Validate and parse request body
 * @param {Object} body - Raw request body
 * @returns {{ success: boolean, data?: Object, error?: Object }}
 */
export function validateAdRequest(body) {
    const result = AdRequestSchema.safeParse(body);
    if (!result.success) {
        return {
            success: false,
            error: {
                message: 'Validation failed',
                details: result.error.flatten()
            }
        };
    }
    return { success: true, data: result.data };
}
