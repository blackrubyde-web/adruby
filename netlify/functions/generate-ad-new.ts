/**
 * UNIVERSAL AD CREATIVE ENGINE - MAIN PIPELINE
 * 
 * NEW 7-STAGE PIPELINE:
 * 1. Business Context Extraction
 * 2. CreativeSpec Generation (LLM)
 * 3. Deterministic Asset Rendering
 * 4. Template Capability Scoring
 * 5. Assembly + Injection
 * 6. Quality Validation + Retry
 * 7. Candidate Ranking
 */

import type { Handler, HandlerEvent } from '@netlify/functions';
import OpenAI from 'openai';

// New imports
import { generateCreativeSpecs, inferBusinessModel } from '../../src/app/lib/ai/creative';
import type { CreativeSpecRequest, CreativeSpec } from '../../src/app/lib/ai/creative';
import { renderAssets } from '../../src/app/lib/render/asset-registry';
import { TEMPLATE_REGISTRY, scoreTemplates, measureCopy } from '../../src/app/lib/templates';
import type { TemplateScoringContext } from '../../src/app/lib/templates';
import { assembleWithRetry } from '../../src/app/lib/quality';
import type { AssemblyContext, AssemblyResult } from '../../src/app/lib/quality';
import { createEmptyTelemetry, addStageTelemetry } from '../../src/app/lib/telemetry';
import type { PipelineTelemetry } from '../../src/app/lib/telemetry';

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

interface GenerateAdRequest {
    productName: string;
    brandName?: string;
    userPrompt: string;
    tone: 'professional' | 'playful' | 'bold' | 'luxury' | 'minimal';
    platform?: 'meta_feed' | 'meta_story' | 'google_display';
    ratio?: '1:1' | '4:5' | '9:16';
    imageBase64?: string;
    groundedFacts?: {
        offer?: string;
        proof?: string;
        painPoints?: string[];
        features?: string[];
    };
    language?: string;

    // Advanced options
    variantCount?: number;
    debug?: boolean;
}

interface GenerateAdResponse {
    success: boolean;
    adDocuments?: any[];  // Array of AdDocuments (breaking change!)
    telemetry?: PipelineTelemetry;
    debug?: {
        specs?: any[];
        scoredTemplates?: any[];
        retryAttempts?: number;
    };
    error?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse JSON response, handling markdown code fences
 */
function parseAIResponse(content: string): any {
    if (!content) return {};

    let cleaned = content.trim();
    if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    return JSON.parse(cleaned);
}

const VISION_IMAGE_DATA_URL = /^data:image\/(png|jpeg|jpg|webp|gif);base64,(.+)$/i;
const BASE64_BODY = /^[A-Za-z0-9+/]+={0,2}$/;
const HTTP_URL = /^https?:\/\//i;

function detectImageMime(base64: string): 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif' | undefined {
    if (base64.startsWith('/9j/')) return 'image/jpeg';
    if (base64.startsWith('iVBORw0KGgo')) return 'image/png';
    if (base64.startsWith('R0lGOD')) return 'image/gif';
    if (base64.startsWith('UklGR')) return 'image/webp';
    return undefined;
}

function normalizeDataUrl(input: string): string | undefined {
    const match = VISION_IMAGE_DATA_URL.exec(input.trim());
    if (!match) return undefined;
    const rawMime = match[1].toLowerCase();
    const mime = rawMime === 'jpg' ? 'jpeg' : rawMime;
    const body = match[2].replace(/\s/g, '');
    if (!BASE64_BODY.test(body)) return undefined;
    return `data:image/${mime};base64,${body}`;
}

function normalizeRawBase64(input: string): string | undefined {
    const compact = input.trim().replace(/\s/g, '');
    if (!compact || !BASE64_BODY.test(compact)) return undefined;
    const mime = detectImageMime(compact) ?? 'image/jpeg';
    return `data:${mime};base64,${compact}`;
}

function normalizeImageForAssets(input?: string): string | undefined {
    if (!input) return undefined;
    const trimmed = input.trim();
    if (!trimmed) return undefined;
    if (HTTP_URL.test(trimmed)) return trimmed;
    if (trimmed.startsWith('data:')) {
        return normalizeDataUrl(trimmed);
    }
    return normalizeRawBase64(trimmed);
}

function normalizeImageForVision(input?: string): string | undefined {
    if (!input) return undefined;
    const trimmed = input.trim();
    if (!trimmed) return undefined;
    if (HTTP_URL.test(trimmed)) return trimmed;
    if (trimmed.startsWith('data:')) {
        return normalizeDataUrl(trimmed);
    }
    return normalizeRawBase64(trimmed);
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

const handler: Handler = async (event: HandlerEvent) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ success: false, error: 'Method not allowed' }),
        };
    }

    const pipelineStartTime = Date.now();
    const telemetry = createEmptyTelemetry();
    telemetry.meta = {
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    try {
        // Parse request
        const request: GenerateAdRequest = JSON.parse(event.body || '{}');

        const {
            productName,
            brandName,
            userPrompt,
            tone: rawTone,
            platform = 'meta_feed',
            ratio = '1:1',
            language = 'de',
            groundedFacts,
            variantCount = 3,
            debug = false
        } = request;

        // Validate required fields
        if (!productName || !userPrompt) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Missing required fields: productName, userPrompt'
                }),
            };
        }

        // ✅ FIX 1: Validate and normalize tone with fallback
        const VALID_TONES = ['professional', 'playful', 'bold', 'luxury', 'minimal'] as const;
        const tone = (rawTone && VALID_TONES.includes(rawTone as any))
            ? rawTone as typeof VALID_TONES[number]
            : 'professional';

        if (rawTone && !VALID_TONES.includes(rawTone as any)) {
            console.warn(`⚠️ Invalid tone "${rawTone}", using fallback "professional"`);
        }

        const assetImageBase64 = normalizeImageForAssets(request.imageBase64);
        const visionImageBase64 = normalizeImageForVision(request.imageBase64);

        if (request.imageBase64 && !assetImageBase64) {
            console.warn('⚠️ imageBase64 was provided but could not be normalized for assets; skipping product image.');
        }

        if (request.imageBase64 && !visionImageBase64) {
            console.warn('⚠️ imageBase64 format is not supported for vision analysis; skipping image analysis.');
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY not configured');
        }

        console.log(`🚀 Starting Universal Ad Creative Engine pipeline`);
        console.log(`📦 Product: ${productName}`);
        console.log(`🎯 Variants requested: ${variantCount}`);

        // ========================================================================
        // STAGE 1: BUSINESS CONTEXT EXTRACTION
        // ========================================================================
        const stage1Start = Date.now();

        const businessModel = inferBusinessModel(productName, userPrompt);
        console.log(`📊 Inferred business model: ${businessModel}`);

        addStageTelemetry(telemetry, 'specGeneration', {
            time: Date.now() - stage1Start,
            count: 1
        });

        // ========================================================================
        // STAGE 2: CREATIVESPEC GENERATION
        // ========================================================================
        const stage2Start = Date.now();

        const specRequest: CreativeSpecRequest = {
            productName,
            brandName,
            userPrompt,
            tone,
            platform,
            ratio,
            language,
            groundedFacts,
            imageBase64: visionImageBase64 // Forward image for Vision Analysis
        };

        const specResult = await generateCreativeSpecs(specRequest, {
            apiKey,
            variantCount,
            businessModel,
            model: process.env.OPENAI_SPEC_MODEL || 'gpt-4o',
            temperature: 0.8
        });

        if (specResult.validSpecs.length === 0) {
            throw new Error('Failed to generate valid CreativeSpecs');
        }

        console.log(`✨ Generated ${specResult.validSpecs.length} valid CreativeSpecs`);

        addStageTelemetry(telemetry, 'specGeneration', {
            time: specResult.telemetry.totalTime,
            cost: specResult.telemetry.totalCost,
            count: specResult.validSpecs.length
        });
        telemetry.apiCalls += specResult.telemetry.apiCalls;

        // ========================================================================
        // STAGE 3-7: PROCESS EACH SPEC
        // ========================================================================
        const successfulDocuments: any[] = [];
        const debugInfo = {
            specs: debug ? specResult.validSpecs : [],
            scoredTemplates: [] as any[],
            retryAttempts: 0
        };

        const specsToProcess = specResult.validSpecs.slice(0, variantCount);

        for (let i = 0; i < specsToProcess.length; i++) {
            const spec = specsToProcess[i];

            try {
                const stage3Start = Date.now();
                const renderedAssets = await renderAssets(spec.assets.required);

                // ✅ FIX 2: Only add productCutout if actually present (not empty string)
                const availableAssets = {
                    ...renderedAssets,
                    ...(assetImageBase64 && { productCutout: assetImageBase64 })
                };

                // SMART ASSET PROCESSING
                // If it's a SaaS/App and we have a user image (screenshot), wrap it in a laptop mock
                if (businessModel === 'saas' && assetImageBase64) {
                    console.log('💻 Applying smart laptop mock wrapper for SaaS screenshot');
                    // We need to import renderDeviceMock dynamically or use what's available
                    // Since we can't easily import here without circular deps if not careful, 
                    // we'll rely on renderAssets doing it if we passed it as a requirement?
                    // actually we can just import it.
                    const { renderDeviceMock } = require('../../src/app/lib/render/asset-registry');
                    try {
                        const mockUrl = renderDeviceMock({
                            image: assetImageBase64,
                            type: 'laptop'
                        });
                        availableAssets.productCutout = mockUrl;
                    } catch (e) {
                        console.warn('Failed to wrap asset in device mock:', e);
                    }
                }

                // ✅ FIX 2: Filter out empty/null assets before scoring
                const filteredAssets = Object.fromEntries(
                    Object.entries(availableAssets).filter(([_, value]) => value && value.trim() !== '')
                );

                console.log(`🎨 Rendered ${Object.keys(filteredAssets).length} assets for spec:`, Object.keys(filteredAssets));

                addStageTelemetry(telemetry, 'assetRendering', {
                    time: Date.now() - stage3Start,
                    count: Object.keys(renderedAssets).length
                });

                // ====================================================================
                // STAGE 4: TEMPLATE SCORING
                // ====================================================================
                const stage4Start = Date.now();

                const measuredCopy = measureCopy(spec);
                const scoringContext: TemplateScoringContext = {
                    spec,
                    measuredCopy,
                    availableAssets: Object.keys(filteredAssets)  // ✅ FIX 2: Use filteredAssets!
                };

                const scoredTemplates = scoreTemplates(TEMPLATE_REGISTRY, scoringContext);

                // ✅ FIX 9: Filter by canBeAssembled - only select templates with all required assets
                const assemblableTemplates = scoredTemplates.filter(st => st.canBeAssembled);

                if (assemblableTemplates.length === 0) {
                    console.warn('⚠️ No assemblable templates found! All templates missing required assets.');
                    console.warn('Available assets:', Object.keys(filteredAssets));
                    console.warn('Top template requirements:', scoredTemplates[0]?.template.requiredAssets);
                }

                const topTemplates = assemblableTemplates.length > 0
                    ? assemblableTemplates.slice(0, 3)
                    : scoredTemplates.slice(0, 3);  // Fallback to best-effort if none assemblable

                console.log(`🏆 Top template: ${topTemplates[0]?.template.name} (score: ${topTemplates[0]?.score})`);

                if (debug) {
                    debugInfo.scoredTemplates.push(...topTemplates);
                }

                addStageTelemetry(telemetry, 'templateScoring', {
                    time: Date.now() - stage4Start,
                    count: scoredTemplates.length
                });

                // ====================================================================
                // STAGE 5-6: ASSEMBLY + QUALITY VALIDATION + RETRY
                // ====================================================================
                const stage5Start = Date.now();

                const assemblyContext: AssemblyContext = {
                    spec,
                    scoredTemplates: topTemplates,
                    availableAssets,
                    apiKey,
                    maxRetries: 3,
                    minQualityScore: 70
                };

                const assemblyResult: AssemblyResult = await assembleWithRetry(assemblyContext);

                addStageTelemetry(telemetry, 'assembly', {
                    time: Date.now() - stage5Start,
                    count: assemblyResult.success ? 1 : 0,
                    errors: assemblyResult.success ? 0 : 1
                });

                telemetry.retries += assemblyResult.retryContext.currentRetry;
                debugInfo.retryAttempts += assemblyResult.retryContext.currentRetry;

                if (assemblyResult.success && assemblyResult.document) {
                    // Add validation info to document
                    const adDocument = {
                        ...assemblyResult.document,
                        meta: {
                            ...assemblyResult.document.meta,
                            qualityScore: assemblyResult.finalValidation?.score,
                            businessModel: spec.businessModel,
                            pattern: spec.creativePattern,
                            angle: spec.angle,
                            retries: assemblyResult.retryContext.currentRetry
                        }
                    };

                    successfulDocuments.push(adDocument);
                    console.log(`✅ Successfully assembled document (quality: ${assemblyResult.finalValidation?.score})`);
                } else {
                    console.warn(`⚠️ Failed to assemble document after ${assemblyResult.retryContext.currentRetry} retries`);
                    console.warn(`Last error: ${assemblyResult.retryContext.lastError}`);
                    if (assemblyResult.retryContext.attempts.length > 0) {
                        const lastAttempt = assemblyResult.retryContext.attempts[assemblyResult.retryContext.attempts.length - 1];
                        console.warn(`Last attempt issues:`, lastAttempt.issues);
                    }
                }

            } catch (error) {
                console.error(`❌ Error processing spec:`, error);
                addStageTelemetry(telemetry, 'assembly', {
                    time: 0,
                    errors: 1
                });
            }
        }

        // ========================================================================
        // STAGE 7: CANDIDATE RANKING
        // ========================================================================
        // Sort by quality score (already done via retry engine)
        const rankedDocuments = successfulDocuments.sort((a, b) =>
            (b.meta?.qualityScore || 0) - (a.meta?.qualityScore || 0)
        );

        // ========================================================================
        // RESPONSE
        // ========================================================================
        telemetry.totalTime = Date.now() - pipelineStartTime;

        if (rankedDocuments.length === 0) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Failed to generate any valid ad documents',
                    telemetry,
                    debug: debug ? debugInfo : undefined
                } as GenerateAdResponse),
            };
        }

        console.log(`🎉 Pipeline complete! Generated ${rankedDocuments.length} documents in ${telemetry.totalTime}ms`);
        console.log(`💰 Total cost: $${telemetry.totalCost.toFixed(4)}`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                adDocuments: rankedDocuments,  // BREAKING CHANGE: now array!
                telemetry,
                debug: debug ? debugInfo : undefined
            } as GenerateAdResponse),
        };

    } catch (error: any) {
        console.error('❌ Pipeline error:', error);

        telemetry.totalTime = Date.now() - pipelineStartTime;

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message || 'Internal server error',
                stack: error.stack, // DEBUG: Expose stack trace
                telemetry
            } as GenerateAdResponse),
        };
    }
};

export { handler };
