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
    validateCreativeSpec,
    BUSINESS_MODELS
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
    invalidSpecs: Array<{ spec: any; errors: any }>;
    telemetry: {
        totalCost: number;
        totalTime: number;
        apiCalls: number;
        validationAttempts: number;
    };
}

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

    console.log(`🧠 Generating ${variantCount} CreativeSpec variants for businessModel: ${businessModel}`);

    const openai = new OpenAI({ apiKey });
    const specs: CreativeSpec[] = [];
    const invalidSpecs: Array<{ spec: any; errors: any }> = [];
    let totalCost = 0;
    let apiCalls = 0;
    let validationAttempts = 0;

    // Build prompt
    const prompt = buildCreativeSpecPrompt(request, businessModel);

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
                            content: prompt
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
                        console.warn(`⚠️ Budget exceeded: $${totalCost.toFixed(4)} > $${maxBudgetUSD.toFixed(4)}`);
                        console.warn(`   Stopping after ${specs.length} valid specs (requested ${variantCount})`);
                        break; // Exit variant generation loop
                    }
                }

                const content = response.choices[0].message.content;
                if (!content) {
                    throw new Error('Empty response from OpenAI');
                }

                // Parse JSON
                const parsed = JSON.parse(content);

                // Validate against schema
                validated = validateCreativeSpec(parsed);
                validationAttempts++;

                if (!validated.isValid) {
                    console.warn(`⚠️ Spec variant ${i + 1} validation failed (attempt ${attemptCount + 1}):`, validated.errors);
                    attemptCount++;
                } else {
                    // Add metadata
                    parsed.meta = {
                        generatedAt: new Date().toISOString(),
                        seed: 1000 + i,
                        variant: i + 1
                    };
                    specs.push(parsed);
                    console.log(`✅ Spec variant ${i + 1} validated successfully`);
                }

            } catch (error) {
                console.error(`❌ Error generating spec variant ${i + 1}:`, error);
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

    console.log(`✨ Generated ${specs.length}/${variantCount} valid CreativeSpecs in ${totalTime}ms`);
    console.log(`💰 Total cost: $${totalCost.toFixed(4)} (${apiCalls} API calls)`);

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
