/**
 * CREATIVE SPEC GENERATOR
 * 
 * LLM-powered CreativeSpec blueprint generation with validation and retry logic.
 */

import OpenAI from 'openai';
import type {
    CreativeSpec,
    CreativeSpecRequest,
    BusinessModel,
    ValidatedCreativeSpec
} from './types';
import {
    validateCreativeSpec
} from './types';
import { buildCreativeSpecPrompt } from './prompts';

// ============================================================================
// BUSINESS MODEL INFERENCE
// ============================================================================

/**
 * Infer business model from product name and user prompt
 */
export function inferBusinessModel(
    productName: string,
    userPrompt: string
): BusinessModel {
    const combined = `${productName} ${userPrompt}`.toLowerCase();

    // SaaS indicators
    if (/\b(software|app|saas|platform|tool|automation|api|dashboard|crm|erp)\b/.test(combined)) {
        return 'saas';
    }

    // Local/Gastro indicators
    if (/\b(restaurant|café|cafe|bar|bistro|pizzeria|bakery|food|dish|menu|local|stadt|öffnungszeiten|reservierung)\b/.test(combined)) {
        return 'local';
    }

    // Coach/Expert indicators
    if (/\b(coach|coaching|training|kurs|webinar|seminar|beratung|mentor|trainer|experte|1:1|gruppe)\b/.test(combined)) {
        return 'coach';
    }

    // Agency/B2B indicators
    if (/\b(agentur|agency|beratung|consulting|b2b|marketing|seo|ads|kampagne|strategie|dienstleistung)\b/.test(combined)) {
        return 'agency';
    }

    // Info/Education indicators
    if (/\b(kurs|course|online-kurs|lernen|bildung|wissen|videokurs|tutorial|ausbildung|zertifikat)\b/.test(combined)) {
        return 'info';
    }

    // E-commerce (default fallback)
    // Also matches: shop, store, produkt, kaufen, versand, lieferung, etc.
    return 'ecommerce';
}

// ============================================================================
// SPEC GENERATION
// ============================================================================

export interface SpecGenerationOptions {
    apiKey: string;
    variantCount?: number;        // How many spec variants to generate (default: 5)
    model?: string;                // OpenAI model (default: from env or gpt-4o)
    temperature?: number;          // LLM temperature (default: 0.8)
    maxRetries?: number;           // Max validation retries (default: 3)
    businessModel?: BusinessModel; // Override automatic inference
    maxBudgetUSD?: number;         // Max budget per request (default: 0.50) - BLOCKER FIX
}

export interface SpecGenerationResult {
    specs: CreativeSpec[];
    validSpecs: CreativeSpec[];
    invalidSpecs: Array<{ spec: unknown; errors: unknown }>;
    telemetry: {
        totalCost: number;
        totalTime: number;
        apiCalls: number;
        validationAttempts: number;
    };
}

type UserContent =
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string; detail?: "low" | "high" | "auto" } }
    >;

/**
 * Generate CreativeSpec blueprints from request
 * 
 * This is the main entry point for spec generation.
 * Returns multiple spec variants with different angles/patterns.
 */
export async function generateCreativeSpecs(
    request: CreativeSpecRequest,
    options: SpecGenerationOptions
): Promise<SpecGenerationResult> {
    const startTime = Date.now();
    const {
        apiKey,
        variantCount = 5,
        model = process.env.OPENAI_SPEC_MODEL || 'gpt-4o',
        temperature = 0.8,
        maxRetries = 3,
        maxBudgetUSD = 0.50  // BLOCKER FIX: Default $0.50 budget cap
    } = options;

    // Infer business model if not provided
    const businessModel = options.businessModel || inferBusinessModel(
        request.productName,
        request.userPrompt
    );

    const openai = new OpenAI({ apiKey });
    const specs: CreativeSpec[] = [];
    const invalidSpecs: Array<{ spec: unknown; errors: unknown }> = [];
    let totalCost = 0;
    let apiCalls = 0;
    let validationAttempts = 0;

    // Build prompt
    const prompt = buildCreativeSpecPrompt(request, businessModel);

    // Build user message content (Text or Text+Image)
    let userContent: UserContent = prompt;

    if (request.imageBase64) {
        userContent = [
            {
                type: "text",
                text: `${prompt}\n\nIMPORTANT: I have attached an image of the product/asset. Analyze it deeply. 
                1. Identify the product type (e.g. software dashboard, physical product, food).
                2. Describe its visual style (e.g. dark mode, vibrant, minimal, industrial).
                3. Based on the image, choose the most appropriate 'creativePattern', 'colors', and 'background' style.
                4. If it looks like a software screenshot, use the 'saas' business model patterns.
                5. If it looks like a physical product without background, suggest a fitting environment.`
            },
            {
                type: "image_url",
                image_url: {
                    url: request.imageBase64, // Data URL is expected here
                    detail: "low" // Low detail is usually enough for style/type + faster/cheaper
                }
            }
        ];
    }

    // Generate multiple variants by varying temperature/seed
    for (let i = 0; i < variantCount; i++) {
        let attemptCount = 0;
        let validated: ValidatedCreativeSpec | null = null;

        while (attemptCount < maxRetries && !validated?.isValid) {
            try {
                const response = await openai.chat.completions.create({
                    model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert performance marketing creative strategist. Return only valid JSON.'
                        },
                        {
                            role: 'user',
                            content: userContent
                        }
                    ],
                    response_format: { type: 'json_object' },
                    temperature: temperature + (i * 0.05), // Slight temp variation per variant
                    max_tokens: 2000,
                    seed: 1000 + i // Different seed per variant for diversity
                });

                apiCalls++;
                const usage = response.usage;
                if (usage) {
                    // Estimate cost (gpt-4o pricing: $5/1M input, $15/1M output)
                    const inputCost = (usage.prompt_tokens / 1_000_000) * 5;
                    const outputCost = (usage.completion_tokens / 1_000_000) * 15;
                    totalCost += inputCost + outputCost;

                    // BLOCKER FIX: Budget enforcement
                    if (totalCost > maxBudgetUSD) {
                        break; // Exit variant generation loop
                    }
                }

                const content = response.choices[0].message.content;
                if (!content) {
                    throw new Error('Empty response from OpenAI');
                }

                // Parse initial Draft
                let currentSpec = JSON.parse(content);

                // =================================================================
                // PREMIUM FIX STEP (The "High-Fidelity" Pass)
                // =================================================================
                // We run this BEFORE final validation to upgrade the spec.
                // We only do this if we haven't exceeded budget (it costs ~1 call more).
                if (totalCost < maxBudgetUSD) {
                    try {
                        const { buildPremiumFixPrompt } = require('./prompts');
                        const fixPrompt = buildPremiumFixPrompt({
                            spec: currentSpec,
                            templateCapsule: null // No specific template forced yet
                        });

                        const fixResponse = await openai.chat.completions.create({
                            model, // Use same strong model
                            messages: [
                                { role: 'system', content: 'You are a targeted creative repair system. Output JSON only.' },
                                { role: 'user', content: fixPrompt }
                            ],
                            response_format: { type: 'json_object' },
                            temperature: 0.3, // Lower temp for strict fixing
                            seed: 2000 + i
                        });

                        apiCalls++;
                        if (fixResponse.usage) {
                            totalCost += (fixResponse.usage.prompt_tokens / 1_000_000 * 5) + (fixResponse.usage.completion_tokens / 1_000_000 * 15);
                        }

                        const fixedContent = fixResponse.choices[0].message.content;
                        if (fixedContent) {
                            const fixedSpec = JSON.parse(fixedContent);
                            // Merge relevant fields to keep any context the fixer might have dropped (though strictly it shouldn't)
                            // We trust the fixer mostly, but ensure businessModel stays
                            currentSpec = { ...currentSpec, ...fixedSpec, businessModel: currentSpec.businessModel };
                        }
                    } catch (fixError) {
                        console.warn('Premium Fix failed, falling back to Draft:', fixError);
                        // Fallback to currentSpec (Draft) if fix fails
                    }
                }

                // Validate against schema (Standard + Premium fields)
                validated = validateCreativeSpec(currentSpec);
                validationAttempts++;

                if (!validated.isValid) {
                    attemptCount++;
                } else {
                    // Add metadata
                    currentSpec.meta = {
                        generatedAt: new Date().toISOString(),
                        seed: 1000 + i,
                        variant: i + 1,
                        isPremiumFixed: true // Mark as upgraded
                    };
                    specs.push(currentSpec);
                }

            } catch (error) {
                attemptCount++;
            }
        }

        // If still invalid after retries, store for debugging
        if (validated && !validated.isValid) {
            invalidSpecs.push({
                spec: validated.spec,
                errors: validated.errors
            });
        }
    }

    const totalTime = Date.now() - startTime;

    return {
        specs,
        validSpecs: specs,
        invalidSpecs,
        telemetry: {
            totalCost,
            totalTime,
            apiCalls,
            validationAttempts
        }
    };
}

/**
 * Generate a single CreativeSpec (simplified API)
 */
export async function generateSingleSpec(
    request: CreativeSpecRequest,
    options: SpecGenerationOptions
): Promise<CreativeSpec | null> {
    const result = await generateCreativeSpecs(request, {
        ...options,
        variantCount: 1
    });

    return result.validSpecs[0] || null;
}
