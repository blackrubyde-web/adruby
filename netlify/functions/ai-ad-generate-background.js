/**
 * AI Ad Builder - Background Function
 * Netlify automatically handles this as background due to -background suffix
 * The entire handler runs with 15min timeout, returns 202 on completion
 */

import { getOpenAiClient, getOpenAiModel, generateHeroImage } from './_shared/openai.js';
import { enhanceImagePrompt } from './_shared/aiAdPromptBuilder.js';
import { buildCreativeBrief, buildPromptFromBrief, qualityGate } from './_shared/creativeBriefBuilder.js';
import { autoComposeAdPrompt, getLayoutOptions } from './_shared/compositionEngine.js';
import { masterCreativeEngine, getAllLayouts } from './_shared/masterCreativeEngine.js';
// Phase 8: Ultimate Master Engine with 30+ vertical modules
import { ultimateMasterEngine, AVAILABLE_VERTICALS, SYSTEM_STATS } from './_shared/verticals/index.js';
// Product Preservation & Dynamic Text
import { buildHardenedProductPrompt, buildBackgroundOnlyPrompt } from './_shared/productPreservationEngine.js';
import { generateProductCopy, generateFallbackHeadline } from './_shared/dynamicProductTextGenerator.js';
// 2026 Elite Creative System (100% Professional)
import {
    createEliteAd,
    detectOptimalConfig,
    generateEliteBackgroundPrompt,
    generateCustomBackgroundPrompt,
    isDetailedCreativePrompt,
    PALETTES,
    LAYOUTS,
    CANVAS,
} from './_shared/eliteCreativeSystem.js';
import { getUserProfile } from './_shared/auth.js';
import { assertAndConsumeCredits, refundCredits, CREDIT_COSTS } from './_shared/credits.js';
import { supabaseAdmin } from './_shared/clients.js';
import { withRetry } from './_shared/aiAd/retry.js';
import { scoreAdQuality, validateAdContent, predictEngagement } from './_shared/aiAd/quality-scorer.js';
// Full Creative Engine for complete ad generation from detailed prompts
import {
    buildFullCreativePrompt,
    createFullCreativeAd,
    detectTextPosition,
} from './_shared/fullCreativeEngine.js';
// Product Integration Engine - integrates products INTO AI scenes
import {
    analyzeProductImage,
    buildIntegratedPrompt,
    compositeIntoDevice,
    compositeIntoScene,
    applyGlowEffect,
    applyTextOverlay as applyIntegratedTextOverlay,
} from './_shared/productIntegrationEngine.js';
// AI Creative Director - Chain-of-Thought reasoning for ANY product
// Now with GEMINI support for 100% product preservation!
import { createAdWithCreativeDirector, createAdWithGeminiDirector } from './_shared/aiCreativeDirector.js';

// Check if Gemini is available
const USE_GEMINI = !!process.env.GEMINI_API_KEY;
// Rate Limiting & Error Handling
import { checkRateLimit } from './_shared/rateLimiter.js';
import { categorizeError, getUserMessage } from './_shared/errorCategorizer.js';

const MAX_QUALITY_RETRIES = 2;

export const handler = async (event) => {
    const startTime = Date.now();

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const { mode, language = 'de' } = body;

        // Authenticate
        const authHeader = event.headers.authorization || event.headers.Authorization;
        const user = await getUserProfile(authHeader);

        if (!user) {
            return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }

        // Validate
        if (mode !== 'form' && mode !== 'free') {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid mode' }) };
        }
        if (mode === 'free' && !body.text) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing text' }) };
        }

        console.log('[AI Ad Generate] User:', user.id, 'Mode:', mode);

        // Rate Limiting Check
        const rateLimitResult = await checkRateLimit(user.id, 'ai_ad_generate');
        if (!rateLimitResult.allowed) {
            console.log('[AI Ad Generate] Rate limit exceeded for user:', user.id);
            return {
                statusCode: 429,
                headers: {
                    ...headers,
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString()
                },
                body: JSON.stringify({
                    error: 'Rate limit exceeded',
                    message: 'Zu viele Anfragen. Bitte warte einen Moment.',
                    resetAt: rateLimitResult.resetAt.toISOString()
                }),
            };
        }

        // Deduct credits
        try {
            await assertAndConsumeCredits(user.id, 'ai_ad_generate');
        } catch (creditError) {
            return {
                statusCode: 402,
                headers,
                body: JSON.stringify({ error: 'Insufficient credits', message: creditError.message }),
            };
        }

        // Create job record using client-provided jobId or generate new one
        const jobId = body.jobId || crypto.randomUUID();
        await supabaseAdmin.from('generated_creatives').insert({
            id: jobId,
            user_id: user.id,
            saved: false,
            inputs: { mode, language, ...body },
            outputs: null,
            metrics: { status: 'processing', started_at: new Date().toISOString() }
        });

        console.log('[AI Ad Generate] Job created:', jobId);

        // Progress Update Helper
        const updateProgress = async (step, progress, details = {}) => {
            try {
                await supabaseAdmin.from('generated_creatives').update({
                    metrics: {
                        status: 'processing',
                        step,
                        progress,
                        ...details,
                        last_update: new Date().toISOString()
                    }
                }).eq('id', jobId);
            } catch (err) {
                console.warn('[AI Ad Generate] Progress update failed:', err.message);
            }
        };

        const openai = getOpenAiClient();

        // ========================================
        // STEP 1: VISION ANALYSIS - Product Preservation (CRITICAL)
        // Analyzes the EXACT product to ensure 1:1 preservation
        // ========================================
        let visionDescription = '';
        if (body.productImageUrl) {
            console.log('[AI Ad Generate] 🔍 Analyzing product image for EXACT preservation...');
            try {
                const visionResponse = await openai.chat.completions.create({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: `Du bist ein forensischer Produktanalyst. Deine Aufgabe ist es, das Produkt im Bild mit 100% Genauigkeit zu beschreiben.

EXTREM WICHTIG: Die Beschreibung muss so präzise sein, dass das Produkt EXAKT rekonstruiert werden kann.

Beschreibe in dieser Reihenfolge:
1. FORM: Exakte geometrische Form, Proportionen, Dimensionen
2. FARBEN: Exakte Farben mit HEX-Codes wenn möglich
3. MATERIAL: Oberfläche (matt/glänzend), Textur, Material-Look
4. DETAILS: Alle sichtbaren Details - Augen, Ohren, Muster, Logos, Text
5. STIL: Design-Stil (z.B. "Minecraft-Pixel-Style", "Cartoon", "Realistisch")
6. BESONDERHEITEN: Was macht dieses Produkt einzigartig?

Beginne mit: "PRÄZISE PRODUKTBESCHREIBUNG:"`
                        },
                        {
                            role: 'user',
                            content: [
                                { type: 'text', text: 'Analysiere dieses Produkt mit forensischer Präzision. Jedes Detail zählt für die exakte Reproduktion.' },
                                { type: 'image_url', image_url: { url: body.productImageUrl, detail: 'high' } }
                            ]
                        }
                    ],
                    max_tokens: 500
                });
                visionDescription = visionResponse.choices[0].message.content;
                console.log('[AI Ad Generate] ✓ Vision description:', visionDescription.substring(0, 100) + '...');
                await updateProgress('vision_analysis', 20, { visionComplete: true });
            } catch (err) {
                console.error('[AI Ad Generate] ✗ Vision analysis failed:', err);
                await updateProgress('vision_analysis', 20, { visionComplete: false, visionError: err.message });
            }
        }

        // ========================================
        // STEP 2: DYNAMIC TEXT GENERATION
        // Generate product-specific headlines, CTAs, features
        // ========================================
        let dynamicText = {
            headline: body.headline,
            subheadline: body.subheadline,
            cta: body.cta || 'Jetzt entdecken',
            badge: body.badge,
            features: body.features || [],
        };

        // Only generate if not provided by user
        if (!body.headline || !body.cta || (body.features || []).length === 0) {
            console.log('[AI Ad Generate] 📝 Generating product-specific ad copy...');
            try {
                const generatedCopy = await generateProductCopy(openai, {
                    productName: body.productName,
                    productDescription: body.text || body.usp,
                    visionDescription: visionDescription,
                    targetAudience: body.targetAudience,
                    tone: body.tone || 'professional',
                    language: language,
                    goal: body.goal || 'conversion',
                    industry: body.industry,
                });

                // Merge generated with user-provided (user-provided takes priority)
                dynamicText = {
                    headline: body.headline || generatedCopy.headline,
                    subheadline: body.subheadline || generatedCopy.subheadline,
                    cta: body.cta || generatedCopy.cta,
                    badge: body.badge || generatedCopy.badge,
                    features: (body.features && body.features.length > 0) ? body.features : generatedCopy.features,
                    hook: generatedCopy.hook,
                };

                console.log('[AI Ad Generate] ✓ Generated dynamic text:', {
                    headline: dynamicText.headline,
                    cta: dynamicText.cta,
                    featureCount: dynamicText.features.length,
                });
            } catch (err) {
                console.error('[AI Ad Generate] ✗ Dynamic text generation failed:', err);
                // Fallback
                dynamicText.headline = dynamicText.headline || generateFallbackHeadline(body.productName, body.text, language);
            }
            await updateProgress('copy_generation', 35, { copyComplete: true });
        }

        // ========================================
        // STEP 3: BUILD HARDENED PRODUCT PROMPT
        // Ensures product is NEVER modified
        // ========================================
        const hardenedProductPrompt = visionDescription
            ? buildHardenedProductPrompt(visionDescription, body.productName)
            : '';

        console.log('[AI Ad Generate] 🔒 Product preservation:', visionDescription ? 'ACTIVE' : 'No image provided');

        // Build Creative Brief (Enterprise Creative Engine v2)
        console.log('[AI Ad Generate] Building Creative Brief...');
        const creativeBrief = buildCreativeBrief({
            mode,
            language,
            productName: body.productName,
            productDescription: body.text || body.usp,
            industry: body.industry,
            targetAudience: body.targetAudience,
            usp: body.usp,
            tone: body.tone,
            goal: body.goal,
            template: body.template,
            text: body.text,
            productImageUrl: body.productImageUrl,
            visionDescription: visionDescription,
        });

        const promptData = buildPromptFromBrief(creativeBrief);
        console.log('[AI Ad Generate] Using style:', promptData.style?.name);

        // ========================================
        // ULTIMATE MASTER ENGINE (Enterprise Phase 8)
        // Complete 30+ module system with vertical intelligence
        // ========================================
        let ultimateOutput = null;
        try {
            ultimateOutput = ultimateMasterEngine({
                // Product info
                productName: body.productName || 'Product',
                productDescription: body.text || body.usp,
                productImageUrl: body.productImageUrl,
                visionDescription: visionDescription,

                // Business context
                industry: body.industry,
                vertical: body.vertical, // e-commerce, saas, coaching, course, dropshipping, agency, etc.
                businessModel: body.businessModel, // freemium, free_trial, signature_course, etc.

                // Target audience
                targetAudience: body.targetAudience,
                persona: body.persona, // busy_professional, health_conscious, gen_z_trendy, etc.

                // Goals
                goal: body.goal || 'conversion',
                objective: body.objective || 'purchase',

                // Preferences
                tone: body.tone || 'professional',
                language: language,
                platform: body.platform || 'instagram_feed',

                // Content - USE DYNAMICALLY GENERATED TEXT
                headline: dynamicText.headline,
                subheadline: dynamicText.subheadline,
                features: dynamicText.features,
                cta: dynamicText.cta,
                badge: body.badge,
                testimonial: body.testimonial,
                price: body.price,
                originalPrice: body.originalPrice,

                // Special modes
                isRetargeting: body.isRetargeting || false,
                retargetingSegment: body.retargetingSegment, // cart_abandon, product_view, etc.
                isSeasonalCampaign: body.isSeasonalCampaign || false,

                // Overrides
                layoutId: body.layoutId,
                colorOverride: body.brandColor,
                fontPairingId: body.fontPairingId,
                conversionFramework: body.conversionFramework,
                archetypeId: body.archetypeId,
                visualPattern: body.visualPattern,
            });

            console.log('[AI Ad Generate] Ultimate Engine output:', {
                vertical: ultimateOutput.metadata?.vertical,
                industry: ultimateOutput.metadata?.industry,
                persona: ultimateOutput.metadata?.persona,
                layout: ultimateOutput.metadata?.layout,
                performanceScore: ultimateOutput.performance?.overallScore,
                performanceGrade: ultimateOutput.performance?.grade,
            });
        } catch (ultimateErr) {
            console.warn('[AI Ad Generate] Ultimate Engine failed, falling back:', ultimateErr.message);
        }

        // ========================================
        // MASTER CREATIVE ENGINE v2 (Fallback)
        // ========================================
        const masterOutput = masterCreativeEngine({
            // Product info
            productName: body.productName || 'Product',
            productDescription: body.text || body.usp,
            productImageUrl: body.productImageUrl,
            visionDescription: visionDescription,

            // User preferences
            industry: body.industry,
            targetAudience: body.targetAudience,
            goal: body.goal || 'conversion',
            tone: body.tone || 'professional',
            language: language,

            // Optional overrides
            layoutId: body.layoutId,
            colorOverride: body.brandColor,
            fontPairingId: body.fontPairingId,

            // Content
            headline: body.headline,
            subheadline: body.subheadline,
            features: body.features || [],
            cta: body.cta,
            badge: body.badge,
            testimonial: body.testimonial,
        });

        console.log('[AI Ad Generate] Master Engine output:', {
            industry: masterOutput.metadata?.industry,
            layout: masterOutput.metadata?.layout,
            colorPalette: masterOutput.metadata?.colorPalette?.primary,
            creativeScore: masterOutput.creativeScore?.score,
            variationsCount: masterOutput.variations?.length,
        });

        // Build layout-based composition for designer-level graphics (fallback/hybrid)
        const layoutComposition = autoComposeAdPrompt({
            layoutId: body.layoutId, // Optional: user-selected layout
            product: {
                name: body.productName || 'Product',
                description: body.text || body.usp,
            },
            features: body.features || [], // Array of feature strings
            headline: body.headline,
            subheadline: body.subheadline,
            cta: body.cta || 'Jetzt entdecken',
            badge: body.badge,
            visionDescription: visionDescription,
            brandColor: body.brandColor,
            language: language,
            tone: body.tone,
            // Auto-detect layout type based on content
            hasMultipleFeatures: (body.features?.length || 0) >= 3,
            isSale: body.goal === 'sale' || body.template === 'urgency_sale',
            isAnnouncement: body.goal === 'announcement',
            isMinimal: body.template === 'minimalist_elegant',
        });

        console.log('[AI Ad Generate] Using layout:', masterOutput.metadata?.layoutName || layoutComposition.metadata?.layoutName || 'auto-selected');

        // openai already declared at top of function (line 89)
        const model = getOpenAiModel();

        // Quality loop for copy generation
        let adCopy;
        let qualityScore;
        let attempt = 0;

        while (attempt < MAX_QUALITY_RETRIES) {
            attempt++;
            console.log(`[AI Ad Generate] Quality attempt ${attempt}/${MAX_QUALITY_RETRIES}`);

            const copyResponse = await withRetry(
                async () => openai.chat.completions.create({
                    model,
                    messages: [
                        { role: 'system', content: promptData.system },
                        { role: 'user', content: promptData.user },
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.7 + (attempt * 0.1),
                    max_tokens: 2500, // Increased from 1000 to prevent truncated JSON
                }),
                { maxRetries: 3, initialDelay: 1000 }
            );

            // Safely parse JSON response (OpenAI sometimes returns truncated JSON)
            const rawContent = copyResponse.choices[0].message.content;
            try {
                adCopy = JSON.parse(rawContent);
            } catch (parseErr) {
                console.error('[AI Ad Generate] JSON parse failed, attempting recovery:', parseErr.message);
                console.error('[AI Ad Generate] Raw content length:', rawContent?.length);

                // Try to extract usable JSON by finding complete object
                const jsonMatch = rawContent?.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        adCopy = JSON.parse(jsonMatch[0]);
                        console.log('[AI Ad Generate] ✓ Recovered JSON from partial response');
                    } catch (retryErr) {
                        // Complete fallback with dynamic text
                        console.log('[AI Ad Generate] Using fallback copy from dynamic text');
                        adCopy = {
                            headline: dynamicText.headline || body.productName || 'Entdecke jetzt',
                            slogan: dynamicText.subheadline || body.text?.substring(0, 100) || '',
                            description: body.text || dynamicText.hook || '',
                            cta: dynamicText.cta || 'Jetzt entdecken',
                            imagePrompt: `Premium product ad for ${body.productName || 'product'}, professional studio lighting, clean background`,
                            variants: [],
                        };
                    }
                } else {
                    // Complete fallback
                    adCopy = {
                        headline: dynamicText.headline || body.productName || 'Entdecke jetzt',
                        slogan: dynamicText.subheadline || '',
                        description: body.text || '',
                        cta: dynamicText.cta || 'Jetzt entdecken',
                        imagePrompt: `Premium product ad for ${body.productName || 'product'}, professional studio lighting, clean background`,
                        variants: [],
                    };
                }
            }

            try {
                validateAdContent(adCopy);
            } catch (err) {
                if (attempt === MAX_QUALITY_RETRIES) throw err;
                continue;
            }

            const quality = scoreAdQuality(adCopy);
            qualityScore = quality.score;
            console.log('[AI Ad Generate] Quality:', qualityScore, quality.grade);

            if (quality.passed || attempt === MAX_QUALITY_RETRIES) break;
        }

        // Generate image with intelligent prompt selection
        // Priority: 1) Ultimate Engine (full verticals), 2) Master Engine, 3) Layout composition, 4) Enhanced AI prompt
        let imagePrompt;
        let promptSource;

        if (ultimateOutput?.imagePrompt) {
            // Use Ultimate Master Engine output (full vertical intelligence)
            imagePrompt = ultimateOutput.imagePrompt;
            promptSource = 'ultimate-engine';
            console.log('[AI Ad Generate] Using Ultimate Engine prompt (vertical:', ultimateOutput.metadata?.vertical, ', score:', ultimateOutput.performance?.overallScore, ')');
        } else if (masterOutput?.imagePrompt) {
            // Use Master Creative Engine output (full intelligence: industry, color, typography)
            imagePrompt = masterOutput.imagePrompt;
            promptSource = 'master-engine';
            console.log('[AI Ad Generate] Using Master Engine prompt (industry:', masterOutput.metadata?.industry, ')');
        } else if (layoutComposition?.prompt && (body.features?.length > 0 || body.layoutId)) {
            // Use layout composition for structured ads with features
            imagePrompt = layoutComposition.prompt;
            promptSource = 'layout-composition';
            console.log('[AI Ad Generate] Using layout-based prompt');
        } else {
            // Fall back to enhanced AI-generated prompt
            imagePrompt = enhanceImagePrompt(
                adCopy.imagePrompt || promptData.user,
                promptData.template
            );
            promptSource = 'enhanced-ai';
            console.log('[AI Ad Generate] Using enhanced AI prompt');
        }

        // ========================================
        // CRITICAL: APPEND HARDENED PRODUCT PRESERVATION
        // This ensures the product is NEVER altered by AI
        // ========================================
        if (hardenedProductPrompt) {
            imagePrompt = imagePrompt + '\n\n' + hardenedProductPrompt;
            console.log('[AI Ad Generate] 🔒 Hardened product preservation appended to prompt');
        }

        // ========================================
        // IMAGE GENERATION WITH REAL COMPOSITING
        // If product image exists: Generate background only, composite exact product
        // ========================================
        let finalImageBuffer;
        let imageUrl;
        const timestamp = Date.now();
        const filename = `ai-ad-${user.id}-${timestamp}.png`;
        const storagePath = `ai-ads/${filename}`;

        // DEBUG: Log incoming product image URL
        console.log('[AI Ad Generate] 📦 Request body keys:', Object.keys(body));
        console.log('[AI Ad Generate] 📦 productImageUrl:', body.productImageUrl ? 'PRESENT' : 'MISSING');
        if (body.productImageUrl) {
            console.log('[AI Ad Generate] 📦 URL preview:', body.productImageUrl.substring(0, 80) + '...');
        }

        if (body.productImageUrl) {
            // ===== AI CREATIVE DIRECTOR MODE =====
            // ALWAYS use intelligent product integration when product image is provided
            // This ensures products are properly composited INTO AI-generated backgrounds
            console.log('[AI Ad Generate] 🧠 AI CREATIVE DIRECTOR MODE: Intelligent ad creation');

            const userCreativeText = body.text || body.productDescription || '';
            await updateProgress('creative_director', 50, { mode: USE_GEMINI ? 'gemini_creative_director' : 'ai_creative_director' });

            try {
                let creativeResult;

                // Use Gemini when available for 100% product preservation
                if (USE_GEMINI) {
                    console.log('[AI Ad Generate] 🚀 Starting GEMINI Creative Director (Image-to-Image)...');

                    creativeResult = await createAdWithGeminiDirector(openai, {
                        productImageUrl: body.productImageUrl,
                        userPrompt: userCreativeText || `Premium advertisement for ${body.productName || 'this product'}. Professional quality, Meta 2026 level.`,
                        headline: dynamicText.headline,
                        subheadline: dynamicText.subheadline,
                        cta: dynamicText.cta,
                        generateHeroImage: (params) => withRetry(
                            async () => generateHeroImage(params),
                            { maxRetries: 2, initialDelay: 2000 }
                        )
                    });

                    console.log(`[AI Ad Generate] ✅ GEMINI AD COMPLETE (source: ${creativeResult.source})`);
                } else {
                    // Fallback to OpenAI-based Creative Director
                    console.log('[AI Ad Generate] 🎯 Starting AI Creative Director with Chain-of-Thought...');

                    creativeResult = await createAdWithCreativeDirector(openai, {
                        productImageUrl: body.productImageUrl,
                        userPrompt: userCreativeText || `Premium advertisement for ${body.productName || 'this product'}. Professional quality, Meta 2026 level.`,
                        headline: dynamicText.headline,
                        subheadline: dynamicText.subheadline,
                        cta: dynamicText.cta,
                        generateHeroImage: (params) => withRetry(
                            async () => generateHeroImage(params),
                            { maxRetries: 2, initialDelay: 2000 }
                        )
                    });

                    console.log('[AI Ad Generate] ✅ AI CREATIVE DIRECTOR COMPLETE');
                }

                finalImageBuffer = creativeResult.buffer;

                // Log strategy reasoning for debugging
                if (creativeResult.strategy?.reasoning) {
                    console.log('[AI Ad Generate] Creative Strategy Reasoning:',
                        creativeResult.strategy.reasoning.substring(0, 300) + '...');
                }
                if (creativeResult.strategy?.productBounds) {
                    console.log('[AI Ad Generate] Product Bounds:', creativeResult.strategy.productBounds);
                }
                await updateProgress('creative_director_done', 75, {
                    mode: 'ai_creative_director',
                    hasProductBounds: !!creativeResult.strategy?.productBounds
                });

            } catch (error) {
                console.error('[AI Ad Generate] Creative Director failed, using elite fallback:', error.message);
                await updateProgress('creative_director_fallback', 60, { error: error.message });

                // Fallback to Elite Creative System (still better than simple overlay)
                try {
                    const { palette, layout } = detectOptimalConfig({
                        industry: body.industry,
                        tone: body.tone,
                        features: dynamicText.features,
                        isMinimal: body.template === 'minimalist_elegant' || body.template === 'ai_automatic',
                    });

                    const backgroundPrompt = generateEliteBackgroundPrompt(palette, layout, {
                        industry: body.industry,
                    });

                    const backgroundResult = await withRetry(
                        async () => generateHeroImage({
                            prompt: backgroundPrompt,
                            size: '1024x1024',
                            quality: 'hd',
                        }),
                        { maxRetries: 2, initialDelay: 2000 }
                    );

                    const backgroundBuffer = Buffer.from(backgroundResult.b64, 'base64');
                    const badgeText = (dynamicText.badge || body.badge || '').trim();

                    const eliteAd = await createEliteAd({
                        backgroundBuffer: backgroundBuffer,
                        productImageUrl: body.productImageUrl,
                        palette: palette,
                        layout: layout,
                        headline: dynamicText.headline,
                        subheadline: dynamicText.subheadline,
                        features: dynamicText.features.slice(0, 4),
                        cta: dynamicText.cta,
                        badge: badgeText.length > 0 ? badgeText : null,
                    });

                    finalImageBuffer = eliteAd.buffer;
                    console.log('[AI Ad Generate] ✅ Elite fallback ad complete');

                } catch (fallbackError) {
                    console.error('[AI Ad Generate] Elite fallback also failed:', fallbackError.message);

                    // Ultimate fallback - generate basic background with product overlay text
                    const basicResult = await withRetry(
                        async () => generateHeroImage({
                            prompt: `Premium advertisement image. Dark sophisticated background. Product showcase with ${dynamicText.headline ? `text \"${dynamicText.headline}\" at bottom` : 'elegant composition'}. Ultra-premium quality.`,
                            size: '1024x1024',
                            quality: 'high',
                        }),
                        { maxRetries: 2, initialDelay: 2000 }
                    );

                    finalImageBuffer = Buffer.from(basicResult.b64, 'base64');
                }
            }

            console.log('[AI Ad Generate] ✅ PRODUCT INTEGRATION COMPLETE');

        } else {
            // ===== FULL CREATIVE MODE (no product image → generate COMPLETE ad) =====
            // User's detailed prompt creates the ENTIRE scene including products/mockups
            const userCreativeText = body.text || '';
            const isDetailedPrompt = isDetailedCreativePrompt(userCreativeText);

            if (isDetailedPrompt) {
                console.log('[AI Ad Generate] 🎨 FULL CREATIVE MODE: Generating complete ad from user vision');

                // Detect where to position text
                const textPosition = detectTextPosition(userCreativeText);

                // Build optimized prompt from user's vision
                const fullCreativePrompt = buildFullCreativePrompt(userCreativeText, {
                    headline: dynamicText.headline,
                    subheadline: dynamicText.subheadline,
                    cta: dynamicText.cta,
                    textPosition,
                });

                console.log('[AI Ad Generate] Full Creative Prompt length:', fullCreativePrompt.length);

                // Generate complete ad image with DALL-E
                const imageResult = await withRetry(
                    async () => generateHeroImage({
                        prompt: fullCreativePrompt,
                        size: '1024x1024',
                        quality: 'hd',
                    }),
                    { maxRetries: 2, initialDelay: 2000 }
                );

                const rawImageBuffer = Buffer.from(imageResult.b64, 'base64');
                console.log('[AI Ad Generate] ✓ Full creative image generated');

                // Apply text overlay (headline, subheadline, CTA)
                const fullCreativeAd = await createFullCreativeAd({
                    imageBuffer: rawImageBuffer,
                    headline: dynamicText.headline,
                    subheadline: dynamicText.subheadline,
                    cta: dynamicText.cta,
                    textPosition,
                });

                finalImageBuffer = fullCreativeAd.buffer;
                console.log('[AI Ad Generate] ✅ FULL CREATIVE AD COMPLETE');

            } else {
                // Simple mode - basic prompt, use standard generation
                console.log('[AI Ad Generate] 📷 SIMPLE MODE: Generating from basic prompt');

                const imageResult = await withRetry(
                    async () => generateHeroImage({
                        prompt: imagePrompt,
                        size: '1024x1024',
                        quality: 'hd',
                    }),
                    { maxRetries: 2, initialDelay: 2000 }
                );

                finalImageBuffer = Buffer.from(imageResult.b64, 'base64');
            }
        }

        // Upload to Storage
        const { error: uploadError } = await supabaseAdmin.storage
            .from('creative-images')
            .upload(storagePath, finalImageBuffer, {
                contentType: 'image/png',
                upsert: false,
            });

        if (uploadError) {
            throw new Error('Image upload failed: ' + uploadError.message);
        }

        const { data: urlData } = supabaseAdmin.storage
            .from('creative-images')
            .getPublicUrl(storagePath);

        imageUrl = urlData?.publicUrl;
        console.log('[AI Ad Generate] Image uploaded:', imageUrl);

        // Engagement prediction
        const engagement = predictEngagement(adCopy, body.targetAudience);

        // Build variants array with shared imageUrl
        const variants = (adCopy.variants || []).map((v, i) => ({
            id: v.id || `variant_${i + 1}`,
            hook: v.hook || '',
            headline: v.headline || adCopy.headline,
            slogan: v.slogan || adCopy.slogan,
            description: v.description || adCopy.description,
            cta: v.cta || adCopy.cta,
            imageUrl: imageUrl, // All variants share the same image
            imagePrompt: adCopy.imagePrompt,
            template: adCopy.styleUsed || 'default',
            qualityScore: qualityScore,
            engagementScore: engagement.score,
        }));

        // Update job with results
        await supabaseAdmin.from('generated_creatives').update({
            thumbnail: imageUrl,
            outputs: {
                headline: adCopy.headline,
                slogan: adCopy.slogan,
                description: adCopy.description,
                cta: adCopy.cta,
                imageUrl,
                imagePrompt: adCopy.imagePrompt,
                qualityScore,
                engagementScore: engagement.score,
                variants: variants,
                source: 'ai_ad_builder'
            },
            saved: true,
            metrics: {
                status: 'complete',
                qualityScore,
                engagementScore: engagement.score,
                generationTime: Date.now() - startTime,
                completed_at: new Date().toISOString()
            }
        }).eq('id', jobId);

        const generationTime = Date.now() - startTime;
        console.log('[AI Ad Generate] SUCCESS in', generationTime, 'ms');

        // Background functions return 202 automatically
        // But we still return the result for the status endpoint
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                jobId,
                status: 'complete',
                data: {
                    id: jobId,
                    headline: adCopy.headline,
                    slogan: adCopy.slogan,
                    description: adCopy.description,
                    cta: adCopy.cta,
                    imageUrl,
                    imagePrompt: adCopy.imagePrompt,
                    template: adCopy.styleUsed || 'default',
                    creditsUsed: 1,
                    qualityScore,
                    engagementScore: engagement.score,
                    variants: variants.length > 0 ? variants : undefined,
                },
                metadata: {
                    model,
                    timestamp,
                    generationTime,
                    savedToLibrary: true,
                }
            }),
        };

    } catch (error) {
        console.error('[AI Ad Generate] Error:', error);

        // Categorize the error for better user messaging
        const categorized = categorizeError(error);
        console.error('[AI Ad Generate] Error category:', categorized.code);

        // Get user ID and jobId for refund and status update
        let userId = null;
        let jobId = null;
        try {
            const body = JSON.parse(event.body || '{}');
            jobId = body.jobId;

            // Get user for refund
            const authHeader = event.headers.authorization || event.headers.Authorization;
            const user = await getUserProfile(authHeader);
            userId = user?.id;
        } catch (parseErr) {
            console.error('[AI Ad Generate] Failed to parse request for refund:', parseErr.message);
        }

        // CRITICAL: Refund credits on failure
        if (userId) {
            console.log('[AI Ad Generate] 💰 Refunding credits due to generation failure...');
            const refundResult = await refundCredits(userId, 'ai_ad_generate');
            if (refundResult.ok) {
                console.log(`[AI Ad Generate] ✅ Credits refunded successfully. New balance: ${refundResult.newBalance}`);
            } else {
                console.error('[AI Ad Generate] ⚠️ Credit refund failed:', refundResult.error);
                // Log for manual intervention - this is a critical issue
            }
        }

        // Update job status in database if jobId exists
        try {
            if (jobId) {
                await supabaseAdmin.from('generated_creatives').update({
                    metrics: {
                        status: 'error',
                        errorCode: categorized.code,
                        errorMessage: categorized.originalMessage,
                        creditsRefunded: userId ? true : false,
                        failed_at: new Date().toISOString()
                    }
                }).eq('id', jobId);
            }
        } catch (dbErr) {
            console.error('[AI Ad Generate] Failed to update error status in DB:', dbErr.message);
        }

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Ad generation failed',
                code: categorized.code,
                message: categorized.userMessage,
                recoverable: categorized.recoverable
            }),
        };
    }
};
