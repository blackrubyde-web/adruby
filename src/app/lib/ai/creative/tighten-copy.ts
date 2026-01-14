/**
 * TIGHTEN COPY - OVERFLOW FIX UTILITY
 * 
 * LLM-powered copy compression for handling text overflow in templates.
 * Preserves meaning and tone while fitting strict character limits.
 */

import OpenAI from 'openai';
import type { CopyContent } from './types';
import { buildTightenCopyPrompt, type TightenCopyRequest } from './prompts';

// ============================================================================
// TIGHTEN COPY
// ============================================================================

export interface TightenCopyOptions {
    apiKey: string;
    model?: string;        // Default: gpt-4o-mini (cheap for micro-calls)
    maxRetries?: number;   // Default: 2
}

export interface TightenCopyResult {
    copy: CopyContent;
    compressed: boolean;
    originalChars: {
        headline: number;
        subheadline?: number;
        cta: number;
    };
    compressedChars: {
        headline: number;
        subheadline?: number;
        cta: number;
    };
    cost: number;
    time: number;
}

/**
 * Tighten copy to fit within character constraints
 * 
 * Used by retry engine when text overflow is detected.
 */
export async function tightenCopy(
    copy: CopyContent,
    constraints: {
        headline_max_chars: number;
        subheadline_max_chars?: number;
        cta_max_chars: number;
        max_bullets?: number;
    },
    language: string,
    tone: string,
    options: TightenCopyOptions
): Promise<TightenCopyResult> {
    const startTime = Date.now();
    const {
        apiKey,
        model = process.env.OPENAI_TIGHTEN_MODEL || 'gpt-4o-mini',
        maxRetries = 2
    } = options;

    const openai = new OpenAI({ apiKey });

    // Store original lengths
    const originalChars = {
        headline: copy.headline.length,
        subheadline: copy.subheadline?.length,
        cta: copy.cta.length
    };

    // Build request
    const request: TightenCopyRequest = {
        copy,
        constraints,
        language,
        tone
    };

    const prompt = buildTightenCopyPrompt(request);

    let attemptCount = 0;
    let result: CopyContent | null = null;
    let totalCost = 0;

    while (attemptCount < maxRetries && !result) {
        try {
            const response = await openai.chat.completions.create({
                model,
                messages: [
                    {
                        role: 'system',
                        content: 'You compress ad copy to fit strict character limits. Return only valid JSON.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.3, // Low temp for deterministic compression
                max_tokens: 1000
            });

            const usage = response.usage;
            if (usage) {
                // gpt-4o-mini pricing: $0.15/1M input, $0.60/1M output
                const inputCost = (usage.prompt_tokens / 1_000_000) * 0.15;
                const outputCost = (usage.completion_tokens / 1_000_000) * 0.60;
                totalCost += inputCost + outputCost;
            }

            const content = response.choices[0].message.content;
            if (!content) {
                throw new Error('Empty response from OpenAI');
            }

            const parsed = JSON.parse(content);

            // Validate lengths
            const headlineOk = parsed.headline.length <= constraints.headline_max_chars;
            const subheadlineOk = !constraints.subheadline_max_chars ||
                !parsed.subheadline ||
                parsed.subheadline.length <= constraints.subheadline_max_chars;
            const ctaOk = parsed.cta.length <= constraints.cta_max_chars;

            if (headlineOk && subheadlineOk && ctaOk) {
                result = parsed;
            } else {
                attemptCount++;
            }

        } catch (error) {
            attemptCount++;
        }
    }

    // If all retries failed, apply deterministic truncation as fallback
    if (!result) {
        result = {
            headline: copy.headline.substring(0, constraints.headline_max_chars),
            subheadline: copy.subheadline ?
                copy.subheadline.substring(0, constraints.subheadline_max_chars || copy.subheadline.length) :
                undefined,
            body: copy.body,
            cta: copy.cta.substring(0, constraints.cta_max_chars),
            bullets: copy.bullets?.slice(0, constraints.max_bullets || 3),
            chips: copy.chips?.slice(0, constraints.max_bullets || 3),
            proofLine: copy.proofLine,
            disclaimers: copy.disclaimers
        };
    }

    const compressedChars = {
        headline: result.headline.length,
        subheadline: result.subheadline?.length,
        cta: result.cta.length
    };

    const time = Date.now() - startTime;

    return {
        copy: result,
        compressed: true,
        originalChars,
        compressedChars,
        cost: totalCost,
        time
    };
}

/**
 * Check if copy needs tightening based on constraints
 */
export function needsTightening(
    copy: CopyContent,
    constraints: {
        headline_max_chars: number;
        subheadline_max_chars?: number;
        cta_max_chars: number;
    }
): boolean {
    if (copy.headline.length > constraints.headline_max_chars) return true;
    if (constraints.subheadline_max_chars &&
        copy.subheadline &&
        copy.subheadline.length > constraints.subheadline_max_chars) return true;
    if (copy.cta.length > constraints.cta_max_chars) return true;

    return false;
}
