import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseAdmin } from "./clients.js";

let cachedClient = null;

// Gemini quota limits (approximate for free tier)
const QUOTA_LIMITS = {
    requestsPerMinute: 15,
    requestsPerDay: 1500,
    errorThreshold: 3  // Switch to fallback after 3 consecutive errors
};

// In-memory cache with short TTL (for same-instance optimization)
let quotaCache = {
    data: null,
    fetchedAt: 0
};
const CACHE_TTL_MS = 5000; // 5 second cache

/**
 * Get or initialize quota state from Supabase
 * Falls back to in-memory if DB unavailable
 */
async function getQuotaState() {
    const now = Date.now();

    // Use cache if fresh
    if (quotaCache.data && (now - quotaCache.fetchedAt) < CACHE_TTL_MS) {
        return quotaCache.data;
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('gemini_quota')
            .select('*')
            .eq('id', 'global')
            .single();

        if (error && error.code === 'PGRST116') {
            // Row doesn't exist, create it
            const newState = {
                id: 'global',
                requests_this_minute: 0,
                requests_this_day: 0,
                last_minute_reset: new Date().toISOString(),
                last_day_reset: new Date().toISOString(),
                quota_exhausted: false,
                quota_reset_at: null,
                consecutive_errors: 0
            };

            await supabaseAdmin.from('gemini_quota').insert(newState);
            quotaCache = { data: newState, fetchedAt: now };
            return newState;
        }

        if (error) {
            console.warn('[Gemini] Failed to get quota state:', error.message);
            // Return permissive fallback
            return {
                requests_this_minute: 0,
                requests_this_day: 0,
                quota_exhausted: false,
                consecutive_errors: 0
            };
        }

        quotaCache = { data, fetchedAt: now };
        return data;

    } catch (err) {
        console.warn('[Gemini] Quota DB error, using permissive fallback:', err.message);
        return {
            requests_this_minute: 0,
            requests_this_day: 0,
            quota_exhausted: false,
            consecutive_errors: 0
        };
    }
}

/**
 * Check if Gemini quota is likely available (persistent version)
 */
export async function checkGeminiQuota() {
    const state = await getQuotaState();
    const now = Date.now();

    // Check minute reset
    const lastMinuteReset = new Date(state.last_minute_reset || 0).getTime();
    if (now - lastMinuteReset > 60000) {
        state.requests_this_minute = 0;
    }

    // Check day reset
    const lastDayReset = new Date(state.last_day_reset || 0).getTime();
    if (now - lastDayReset > 86400000) {
        state.requests_this_day = 0;
        state.quota_exhausted = false;
        state.consecutive_errors = 0;
    }

    // Check if quota was exhausted
    if (state.quota_exhausted && state.quota_reset_at) {
        const resetTime = new Date(state.quota_reset_at).getTime();
        if (now < resetTime) {
            return {
                available: false,
                reason: 'quota_exhausted',
                resetAt: state.quota_reset_at
            };
        }
    }

    // Check consecutive errors
    if (state.consecutive_errors >= QUOTA_LIMITS.errorThreshold) {
        return {
            available: false,
            reason: 'too_many_errors',
            consecutiveErrors: state.consecutive_errors
        };
    }

    // Check rate limits
    if (state.requests_this_minute >= QUOTA_LIMITS.requestsPerMinute) {
        return {
            available: false,
            reason: 'rate_limit_minute',
            resetIn: 60000 - (now - lastMinuteReset)
        };
    }

    if (state.requests_this_day >= QUOTA_LIMITS.requestsPerDay) {
        return {
            available: false,
            reason: 'rate_limit_day'
        };
    }

    return {
        available: true,
        requestsRemaining: {
            minute: QUOTA_LIMITS.requestsPerMinute - (state.requests_this_minute || 0),
            day: QUOTA_LIMITS.requestsPerDay - (state.requests_this_day || 0)
        }
    };
}

/**
 * Record a successful Gemini request (persistent)
 */
async function recordGeminiSuccess() {
    try {
        // Invalidate cache
        quotaCache.data = null;

        const { data, error } = await supabaseAdmin.rpc('increment_gemini_quota_success');
        // If RPC doesn't exist, try raw update (consecutive_errors reset)
        if (error) {
            await supabaseAdmin
                .from('gemini_quota')
                .update({
                    consecutive_errors: 0,
                    updated_at: new Date().toISOString()
                })
                .eq('id', 'global');
        }



        console.log(`[Gemini] 📊 Request recorded successfully`);
    } catch (err) {
        console.warn('[Gemini] Failed to record success:', err.message);
    }
}

/**
 * Record a Gemini error (persistent)
 */
async function recordGeminiError(error) {
    try {
        // Invalidate cache
        quotaCache.data = null;

        const errorMessage = error.message?.toLowerCase() || '';
        const isQuotaError =
            errorMessage.includes('quota') ||
            errorMessage.includes('rate limit') ||
            errorMessage.includes('resource_exhausted') ||
            errorMessage.includes('429');

        // Fetch current state to increment
        const currentState = await getQuotaState();
        const updates = {
            consecutive_errors: (currentState.consecutive_errors || 0) + 1,
            updated_at: new Date().toISOString()
        };

        if (isQuotaError) {
            const resetAt = new Date(Date.now() + (errorMessage.includes('quota') ? 3600000 : 60000));
            updates.quota_exhausted = true;
            updates.quota_reset_at = resetAt.toISOString();
            console.warn(`[Gemini] ⚠️ Quota exhausted. Will retry after: ${resetAt.toISOString()}`);
        }

        await supabaseAdmin
            .from('gemini_quota')
            .update(updates)
            .eq('id', 'global');

        console.warn(`[Gemini] ⚠️ Error recorded`);
    } catch (err) {
        console.warn('[Gemini] Failed to record error:', err.message);
    }
}

/**
 * Get or create Gemini client
 */
export function getGeminiClient() {
    if (cachedClient) return cachedClient;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("[Gemini] Missing GEMINI_API_KEY env var");
        throw new Error("GEMINI_API_KEY not set");
    }

    cachedClient = new GoogleGenerativeAI(apiKey);
    return cachedClient;
}

/**
 * Analyze product image using Gemini Vision
 * Returns detailed product analysis for ad creation
 */
export async function analyzeProductWithGemini(productImageBuffer) {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    console.log("[Gemini] 🔍 Analyzing product image with elite prompt...");

    // Import the elite analysis prompt dynamically to avoid circular deps
    let analysisPrompt;
    try {
        const { PRODUCT_ANALYSIS_PROMPT } = await import('./elitePrompts.js');
        analysisPrompt = PRODUCT_ANALYSIS_PROMPT;
    } catch {
        // Fallback to inline prompt if import fails
        analysisPrompt = `Du bist ein Elite Creative Director. Analysiere dieses Produktbild.
Antworte mit JSON: { "productName", "productType", "industry", "targetAudience", "emotionalAppeal", "keyVisualElements", "colorPalette", "suggestedMood", "productDescription" }`;
    }

    const result = await model.generateContent([
        {
            inlineData: {
                mimeType: "image/png",
                data: productImageBuffer.toString("base64")
            }
        },
        { text: analysisPrompt }
    ]);

    const responseText = result.response.text();

    // Parse JSON from response
    try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            console.log("[Gemini] ✓ Product analyzed:", analysis.productName);
            console.log("[Gemini] 📊 Recommended style:", analysis.recommendedStyle || 'auto');
            return analysis;
        }
    } catch (e) {
        console.warn("[Gemini] JSON parse failed, using fallback analysis");
    }

    // Fallback
    return {
        productName: "Product",
        productType: "general",
        industry: "retail",
        targetAudience: "general consumers",
        emotionalAppeal: "quality and value",
        keyVisualElements: [],
        colorPalette: [],
        suggestedMood: "premium",
        suggestedScene: "premium studio setting",
        productDescription: "Premium product",
        recommendedStyle: "lifestyle_action"
    };
}

/**
 * Generate Meta Ad with Gemini Image-to-Image
 * 
 * This is the CORE function - takes a product image and generates
 * a complete ad AROUND it while preserving the product 100%.
 * Now with quota tracking for proactive fallback to OpenAI.
 */
export async function generateAdWithGemini({
    productImageBuffer,
    headline,
    subheadline,
    cta,
    productAnalysis,
    style = "premium_dark",
    referencePattern = null,
    enhancedPrompt = null  // Marketing-expert-polished prompt
}) {
    // Check quota before making request
    const quotaStatus = await checkGeminiQuota();
    if (!quotaStatus.available) {
        console.warn(`[Gemini] ⚠️ Quota unavailable: ${quotaStatus.reason}. Using fallback.`);
        return {
            success: false,
            error: `Quota unavailable: ${quotaStatus.reason}`,
            quotaExhausted: true,
            fallbackRecommended: true
        };
    }

    const genAI = getGeminiClient();

    // Use the image generation model
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            responseModalities: ["image", "text"]
        }
    });

    console.log("[Gemini] 🎨 Generating Meta Ad with image-to-image...");
    console.log(`[Gemini] 📊 Quota remaining: ${quotaStatus.requestsRemaining?.minute || '?'}/min, ${quotaStatus.requestsRemaining?.day || '?'}/day`);
    if (referencePattern) {
        console.log(`[Gemini] 🎯 Using reference pattern: ${referencePattern.name}`);
    }

    // Build the ad generation prompt with optional reference pattern and enhanced prompt
    const adPrompt = buildAdPrompt({
        headline,
        subheadline,
        cta,
        productAnalysis,
        style,
        referencePattern,
        enhancedPrompt  // Marketing-expert-polished prompt
    });

    try {
        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: "image/png",
                    data: productImageBuffer.toString("base64")
                }
            },
            { text: adPrompt }
        ]);

        // Extract generated image from response
        const response = result.response;

        if (response.candidates && response.candidates[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    console.log("[Gemini] ✓ Ad image generated successfully");
                    recordGeminiSuccess();
                    return {
                        success: true,
                        buffer: Buffer.from(part.inlineData.data, "base64"),
                        model: "gemini-2.5-flash"
                    };
                }
            }
        }

        // Check for text response (might contain error or instructions)
        const textResponse = response.text();
        console.warn("[Gemini] No image in response, text:", textResponse?.substring(0, 200));
        recordGeminiError(new Error("No image in response"));

        return {
            success: false,
            error: "No image generated",
            textResponse
        };

    } catch (error) {
        console.error("[Gemini] Image generation failed:", error.message);
        recordGeminiError(error);
        return {
            success: false,
            error: error.message,
            quotaExhausted: error.message?.toLowerCase().includes('quota') || error.message?.toLowerCase().includes('429'),
            fallbackRecommended: true
        };
    }
}

/**
 * Build the ad generation prompt with reference pattern support.
 * Industry-adaptive: uses product analysis to drive visual decisions.
 */
function buildAdPrompt({ headline, subheadline, cta, productAnalysis, style, referencePattern, enhancedPrompt }) {
    const productDesc = productAnalysis?.productDescription || "premium product";
    const productName = productAnalysis?.productName || "Product";
    const mood = productAnalysis?.suggestedMood || "premium";
    const colors = productAnalysis?.colorPalette?.join(", ") || "elegant colors";
    const industry = productAnalysis?.industry || "retail";
    const isSaaS = productAnalysis?.isSaaSProduct || false;

    const headlineText = headline || productName;
    const ctaText = cta || 'Shop Now';

    // Industry-adaptive visual settings
    const visualStyle = getIndustryVisualStyle(industry, productAnalysis);

    // Use enhanced prompt from Marketing Expert if available
    const creativeDirection = enhancedPrompt
        ? `\nMARKETING EXPERT DIRECTION:\n${enhancedPrompt}\n`
        : '';

    return `A professional Meta ad (1080×1080) featuring this product image.

TASK: Transform this product photo into a scroll-stopping Meta advertisement.
Keep the product 100% unchanged — only enhance the environment around it.

SCENE:
1. The product stays exactly as it appears: same angle, pose, proportions
2. Background: ${visualStyle.background}
3. Surface: ${visualStyle.surface}

CAMERA:
- ${visualStyle.camera}
- 1:1 square composition, product as hero element
- Product occupies 40-60% of the frame

LIGHTING:
- ${visualStyle.lighting}
- ${visualStyle.colorTemp}
- The product must look natural in this lighting, not composited
${creativeDirection}
TEXT IN IMAGE (render sharply):
- HEADLINE at top: "${headlineText}"
  Typography: Bold modern sans-serif, high contrast against background
  Size: Large, instantly readable on mobile

${subheadline ? `- SUBHEADLINE: "${subheadline}"
  Typography: Regular weight, 60% of headline size, below headline` : ''}

- CTA BUTTON at bottom center: "${ctaText}"
  Style: Rounded pill button, ${visualStyle.ctaColor}
  Typography: White bold text, tappable-looking

MOOD: ${visualStyle.mood}

QUALITY: This must look like a $10,000 agency production.
Professional, polished, and indistinguishable from a real commercial ad.
The product in the input image must appear IDENTICAL in the output.`;
}

/**
 * Get industry-specific visual settings for ad generation.
 */
function getIndustryVisualStyle(industry, productAnalysis) {
    const industryLower = (industry || '').toLowerCase();
    const pricePoint = productAnalysis?.pricePoint || 'midrange';

    // Food & Beverage
    if (['food', 'beverage', 'restaurant', 'cooking', 'drink'].some(k => industryLower.includes(k))) {
        return {
            background: 'Warm rustic wooden table or marble surface, soft natural textures',
            surface: 'Natural surface texture, no artificial reflections',
            camera: 'Shot with 50mm lens at f/2.8, 45-degree angle, food photography composition',
            lighting: 'Warm side-lighting from left (window light quality), golden fill from right. Visible warmth and depth.',
            colorTemp: 'Color temperature: 5800K warm, rich saturation, appetizing tones',
            ctaColor: 'warm terracotta (#E07A5F) or deep green (#2D6A4F)',
            mood: 'Appetizing, warm, inviting. The viewer should almost taste the product.',
        };
    }

    // Fashion & Beauty
    if (['fashion', 'beauty', 'cosmetic', 'jewelry', 'clothing', 'apparel'].some(k => industryLower.includes(k))) {
        return {
            background: pricePoint === 'luxury' ? 'Rich dark velvet or marble surface' : 'Clean white or soft blush gradient',
            surface: 'Elegant surface with subtle shadow play',
            camera: 'Shot with 85mm lens at f/1.8, editorial composition with generous negative space',
            lighting: 'Soft diffused beauty lighting from large overhead softbox, subtle fill from below',
            colorTemp: 'Color temperature: 5200K neutral-warm, flattering tones, subtle warmth',
            ctaColor: pricePoint === 'luxury' ? 'matte black (#1A1A1A) or gold (#B8860B)' : 'brand accent color or soft pink (#E91E8C)',
            mood: 'Aspirational, luxurious, desirable. The viewer wants this in their life.',
        };
    }

    // Tech & Electronics
    if (['tech', 'electronic', 'gadget', 'device', 'hardware', 'phone', 'computer'].some(k => industryLower.includes(k)) || productAnalysis?.isSaaSProduct) {
        return {
            background: 'Matte dark gradient (near-black to dark gray) with subtle blue-purple ambient glow',
            surface: 'Clean dark surface with subtle reflection underneath the product',
            camera: 'Shot with 85mm lens at f/2.0, eye-level, centered with product as hero',
            lighting: 'Dramatic rim-light from behind highlighting product edges, subtle cool fill from front',
            colorTemp: 'Color temperature: 4500K cool-neutral, slightly desaturated, premium tech feel',
            ctaColor: 'electric blue (#2563EB) or product accent color',
            mood: 'Premium, innovative, cutting-edge. This is the future.',
        };
    }

    // Fitness & Health
    if (['fitness', 'health', 'wellness', 'sport', 'supplement', 'gym', 'nutrition'].some(k => industryLower.includes(k))) {
        return {
            background: 'Clean, bright setting with natural light feel, or modern gym environment',
            surface: 'Clean surface with energetic, bright atmosphere',
            camera: 'Shot with 50mm lens at f/2.8, slightly dynamic angle suggesting energy and motion',
            lighting: 'Bright natural light (golden hour quality), high clarity, vibrant shadows',
            colorTemp: 'Color temperature: 5500K warm-neutral, high clarity, vibrant saturation',
            ctaColor: 'vibrant coral (#FF6B6B) or energetic green (#10B981)',
            mood: 'Motivating, empowering, energetic. The viewer feels "I can do this."',
        };
    }

    // Home & Interior
    if (['home', 'interior', 'furniture', 'decor', 'living', 'garden'].some(k => industryLower.includes(k))) {
        return {
            background: 'Styled living space with complementary decor, warm and inviting',
            surface: 'Natural wood or textile surface, cozy atmosphere',
            camera: 'Shot with 35mm lens at f/4.0, room context visible, product as focal point',
            lighting: 'Warm natural window light with golden hour feel, soft bounce from walls',
            colorTemp: 'Color temperature: 5800K warm, lifted shadows, cozy feel',
            ctaColor: 'warm sage (#6B8E6B) or neutral clay (#C4A882)',
            mood: 'Cozy, aspirational, serene. "I want my home to look like this."',
        };
    }

    // Default: Clean E-Commerce
    return {
        background: pricePoint === 'luxury' || pricePoint === 'premium'
            ? 'Clean dark gradient with elegant atmosphere'
            : 'Clean white-to-light-gray gradient, bright and trustworthy',
        surface: 'Subtle shadow or reflection that grounds the product naturally',
        camera: 'Shot with 50mm lens at f/3.5, clean product photography composition',
        lighting: 'Bright, even, professional studio lighting with soft shadows',
        colorTemp: 'Color temperature: 5000K neutral, balanced saturation, clean whites',
        ctaColor: 'warm orange (#F97316) or brand accent color',
        mood: 'Clean, trustworthy, shoppable. The viewer is ready to buy.',
    };
}

/**
 * Generate ad with Gemini, with fallback to OpenAI if needed
 */
export async function generateAdWithGeminiFallback({
    productImageBuffer,
    productImageUrl,
    headline,
    subheadline,
    cta,
    productAnalysis,
    style,
    openAiFallback // Function to call OpenAI as fallback
}) {
    // Try Gemini first
    const geminiResult = await generateAdWithGemini({
        productImageBuffer,
        headline,
        subheadline,
        cta,
        productAnalysis,
        style
    });

    if (geminiResult.success && geminiResult.buffer) {
        console.log("[Gemini] ✅ Gemini ad generation successful");
        return {
            buffer: geminiResult.buffer,
            source: "gemini",
            model: geminiResult.model
        };
    }

    // Fallback to OpenAI
    if (openAiFallback) {
        console.log("[Gemini] ⚠️ Falling back to OpenAI...");
        try {
            const openAiResult = await openAiFallback();
            return {
                buffer: openAiResult.buffer,
                source: "openai_fallback",
                model: openAiResult.model
            };
        } catch (fallbackError) {
            console.error("[Gemini] OpenAI fallback also failed:", fallbackError.message);
            throw fallbackError;
        }
    }

    throw new Error(`Gemini ad generation failed: ${geminiResult.error} `);
}

/**
 * Generate ad with optional reference image for style transfer
 * 
 * When a reference image is provided, Gemini uses it as visual inspiration
 * to match the style, layout, and overall aesthetic of the reference ad.
 * 
 * @param {Buffer} productImageBuffer - The product image to feature in the ad
 * @param {Buffer|null} referenceImageBuffer - Optional reference ad image for style guidance
 * @param {string} headline - Ad headline text
 * @param {string} subheadline - Ad subheadline text
 * @param {string} cta - Call-to-action button text
 * @param {Object} productAnalysis - Product analysis from vision model
 */
export async function generateWithStyleReference({
    productImageBuffer,
    referenceImageBuffer = null,
    headline,
    subheadline,
    cta,
    productAnalysis,
    style = "premium_dark"
}) {
    // Check quota
    const quotaStatus = await checkGeminiQuota();
    if (!quotaStatus.available) {
        console.warn(`[Gemini] ⚠️ Quota unavailable for style transfer: ${quotaStatus.reason}`);
        return {
            success: false,
            error: `Quota unavailable: ${quotaStatus.reason}`,
            quotaExhausted: true,
            fallbackRecommended: true
        };
    }

    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            responseModalities: ["image", "text"]
        }
    });

    const productName = productAnalysis?.productName || "Product";
    const productDesc = productAnalysis?.productDescription || "premium product";

    // Build content array - reference image first (if provided), then product
    const content = [];

    if (referenceImageBuffer) {
        console.log("[Gemini] 🎨 Style Transfer Mode: Using reference image for visual guidance");

        // Add reference image first
        content.push({
            inlineData: {
                mimeType: "image/png",
                data: referenceImageBuffer.toString("base64")
            }
        });

        // Add product image
        content.push({
            inlineData: {
                mimeType: "image/png",
                data: productImageBuffer.toString("base64")
            }
        });

        // Style transfer prompt
        content.push({
            text: `STYLE TRANSFER AUFGABE:

Das ERSTE Bild ist eine REFERENZ-WERBEANZEIGE. Kopiere deren STIL:
- Layout und Komposition
- Farben und Stimmung
- Typografie-Stil
- Grafische Elemente (Pfeile, Icons, Rahmen)

Das ZWEITE Bild ist das PRODUKT das beworben werden soll.

ERSTELLE EINE NEUE META AD (1080x1080px):

1. STIL der Referenz übernehmen (Layout, Farben, Atmosphäre)
2. PRODUKT 100% erhalten und natürlich integrieren
3. TEXT im Bild:
   ${headline ? `- Headline: "${headline}"` : ''}
   ${subheadline ? `- Subheadline: "${subheadline}"` : ''}
   ${cta ? `- CTA-Button: "${cta}"` : ''}

WICHTIG:
- Kopiere den STIL, nicht den INHALT der Referenz
- Das Produkt darf NICHT verändert werden
- Professionelle Meta Ad Qualität
- Text muss LESBAR sein`
        });

    } else {
        // No reference image - use standard generation
        console.log("[Gemini] 📷 Standard Mode: No reference image provided");

        content.push({
            inlineData: {
                mimeType: "image/png",
                data: productImageBuffer.toString("base64")
            }
        });

        content.push({
            text: `ERSTELLE EINE META AD (1080x1080px) für: ${productName}

${productDesc}

TEXT:
${headline ? `Headline: "${headline}"` : ''}
${subheadline ? `Subheadline: "${subheadline}"` : ''}
${cta ? `CTA: "${cta}"` : ''}

Professionelle Qualität, Scroll-Stopper, viral-würdig.
Produkt natürlich integrieren, nicht aufgeklebt.`
        });
    }

    try {
        const result = await model.generateContent(content);
        const response = result.response;

        if (response.candidates && response.candidates[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    console.log("[Gemini] ✓ Style transfer ad generated successfully");
                    recordGeminiSuccess();
                    return {
                        success: true,
                        buffer: Buffer.from(part.inlineData.data, "base64"),
                        model: "gemini-2.5-flash",
                        usedReference: !!referenceImageBuffer
                    };
                }
            }
        }

        console.warn("[Gemini] No image in style transfer response");
        recordGeminiError(new Error("No image in response"));
        return {
            success: false,
            error: "No image generated"
        };

    } catch (error) {
        console.error("[Gemini] Style transfer failed:", error.message);
        recordGeminiError(error);
        return {
            success: false,
            error: error.message,
            fallbackRecommended: true
        };
    }
}

export default {
    getGeminiClient,
    checkGeminiQuota,
    analyzeProductWithGemini,
    generateAdWithGemini,
    generateAdWithGeminiFallback,
    generateWithStyleReference
};
