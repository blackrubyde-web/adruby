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

        const { data, error } = await supabaseAdmin
            .from('gemini_quota')
            .update({
                requests_this_minute: supabaseAdmin.sql`requests_this_minute + 1`,
                requests_this_day: supabaseAdmin.sql`requests_this_day + 1`,
                consecutive_errors: 0,
                updated_at: new Date().toISOString()
            })
            .eq('id', 'global');

        // Fallback: use RPC or direct increment
        if (error) {
            await supabaseAdmin.rpc('increment_gemini_quota');
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

        const updates = {
            consecutive_errors: supabaseAdmin.sql`consecutive_errors + 1`,
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

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
    referencePattern = null  // NEW: Reference pattern for style guidance
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
        model: "gemini-2.0-flash-exp",
        generationConfig: {
            responseModalities: ["image", "text"]
        }
    });

    console.log("[Gemini] 🎨 Generating Meta Ad with image-to-image...");
    console.log(`[Gemini] 📊 Quota remaining: ${quotaStatus.requestsRemaining?.minute || '?'}/min, ${quotaStatus.requestsRemaining?.day || '?'}/day`);
    if (referencePattern) {
        console.log(`[Gemini] 🎯 Using reference pattern: ${referencePattern.name}`);
    }

    // Build the ad generation prompt with optional reference pattern
    const adPrompt = buildAdPrompt({
        headline,
        subheadline,
        cta,
        productAnalysis,
        style,
        referencePattern  // Pass the pattern for style guidance
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
                        model: "gemini-2.0-flash-exp"
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
 * Build the ad generation prompt with reference pattern support
 */
function buildAdPrompt({ headline, subheadline, cta, productAnalysis, style, referencePattern }) {
    const productDesc = productAnalysis?.productDescription || "premium product";
    const productName = productAnalysis?.productName || "Product";
    const mood = productAnalysis?.suggestedMood || "premium";
    const colors = productAnalysis?.colorPalette?.join(", ") || "elegant colors";

    // Gemini generates the COMPLETE ad including text
    // No SVG overlay - everything in one generation
    // PHASE 1: Elite Prompt Engineering for 10/10 quality
    // PHASE 4: Layout variations for diverse outputs

    const headlineText = headline || productName;
    const ctaText = cta || 'Shop Now';

    // Phase 4: Random layout variation for diverse outputs
    const layouts = ['centered', 'hero-bottom', 'hero-top'];
    const selectedLayout = layouts[Math.floor(Math.random() * layouts.length)];
    console.log(`[Gemini] Using layout variation: ${selectedLayout}`);

    return `You are an elite advertising designer creating a viral Meta ad.

TASK: Create a stunning 1080x1080px advertisement image.

═══════════════════════════════════════
PRODUCT DETAILS
═══════════════════════════════════════
Name: ${productName}
Description: ${productDesc}
Mood: ${mood}
Brand Colors: ${colors}

═══════════════════════════════════════
VISUAL COMPOSITION
═══════════════════════════════════════
• Background: Rich dark gradient (#0a0a0a to #1a1a2e)
• Product: Centered, occupying 40-50% of frame
• Lighting: Premium 3-point studio setup with soft shadows
• Effects: Subtle bokeh, gentle glow around product

═══════════════════════════════════════
TYPOGRAPHY (CRITICAL)
═══════════════════════════════════════
Use ONLY clean, modern sans-serif fonts (Helvetica, Arial, SF Pro style).
All text must be CRISP, SHARP, and PERFECTLY READABLE.

TOP SECTION:
• Headline: "${headlineText}"
• Style: Bold, white (#FFFFFF), large (roughly 60-80pt equivalent)
• Position: Centered horizontally, top 15% of image
• Effect: Subtle drop shadow for depth

MIDDLE SECTION:
${subheadline ? `• Subheadline: "${subheadline}"
• Style: Regular weight, light gray (#CCCCCC), medium size
• Position: Below headline, centered` : '(no subheadline)'}

BOTTOM SECTION:
• CTA Button: "${ctaText}"
• Style: Pill-shaped button, vibrant red (#FF4444) background
• Text: White, bold, ALL CAPS
• Position: Centered horizontally, bottom 10% of image
• Size: Button should be roughly 200px wide, 50px tall

═══════════════════════════════════════
QUALITY REQUIREMENTS
═══════════════════════════════════════
✓ Text is 100% readable and sharp - no blur
✓ Product looks exactly like the input - unchanged
✓ Professional magazine-quality lighting
✓ Premium aesthetic like Apple/Nike ads
✓ Clean composition with breathing room

═══════════════════════════════════════
ABSOLUTELY DO NOT
═══════════════════════════════════════
✗ NO blurry or distorted text
✗ NO placeholder boxes or rectangles
✗ NO changing the product appearance
✗ NO cluttered or busy layouts
✗ NO watermarks or extra logos
✗ NO gibberish or corrupted characters

OUTPUT: A complete, professional advertisement ready for Meta/Instagram.`;

    // Fallback to original style-based prompt
    const styleConfigs = {
        premium_dark: {
            background: "Eleganter schwarzer/dunkler Hintergrund mit subtilen Lichteffekten",
            lighting: "Cinematische Drei-Punkt-Beleuchtung, Hauptlicht von links",
            effects: "Subtiler Glow, professionelle Schatten, Bokeh im Hintergrund"
        },
        minimal_light: {
            background: "Sauberer weißer/heller Hintergrund mit weichen Schatten",
            lighting: "Diffuses, gleichmäßiges Licht, keine harten Schatten",
            effects: "Minimalistisch, clean, luftig"
        },
        vibrant: {
            background: "Lebhafter farbiger Hintergrund mit Gradient",
            lighting: "Dynamische Beleuchtung mit farbigen Akzenten",
            effects: "Energetisch, modern, Gen-Z Appeal"
        }
    };

    const styleConfig = styleConfigs[style] || styleConfigs.premium_dark;

    return `GENERIERE EINE KOMPLETTE META-WERBEANZEIGE (1080x1080px):

Du siehst ein Produktbild. Erstelle eine KOMPLETT NEUE, PROFESSIONELLE Werbeanzeige.

🎯 WICHTIG - NAHTLOSE INTEGRATION:
- Das Produkt muss NATÜRLICH in die Szene eingebettet sein
- KEINE sichtbaren Ränder oder Rechteck-Rahmen um das Produkt!
- Das Produkt soll aussehen als wäre es FOTOGRAFIERT in der Szene
- Gleiche Beleuchtung, Schatten, Perspektive wie die Umgebung

📸 SZENE ERSTELLEN:
- ${styleConfig.background}
- ${styleConfig.lighting}
- ${styleConfig.effects}
- Das Produkt (${productDesc}) steht/liegt natürlich in der Szene
- Stimmung: ${mood}
- Farbpalette: ${colors}

🖼️ KOMPOSITION:
- Produkt im oberen/mittleren Bereich (ca. 40-60% der Bildhöhe)
- Natürliche Schatten UNTER dem Produkt (kein Rechteck-Schatten!)
- Professionelle Beleuchtung die zum Hintergrund passt
- Das Produkt sieht aus als gehöre es in diese Szene

✍️ TEXT IM BILD (unterer Bereich):
${headline ? `- HEADLINE: "${headline}" - Große, fette, weiße Schrift` : ''}
${subheadline ? `- SUBHEADLINE: "${subheadline}" - Kleinere weiße Schrift` : ''}
${cta ? `- CTA-BUTTON: Roter Pill-Button mit "${cta}"` : ''}

⭐ QUALITÄT:
- Professionelle Meta/Instagram Ad Qualität
- Keine sichtbaren Kanten oder Compositing-Artefakte
- Das finale Bild muss aussehen wie EIN zusammenhängendes Foto
- Magazin-Cover Niveau

KRITISCH: Das Produkt darf NICHT wie draufgeklebt aussehen!
Es muss NATÜRLICH in die Szene integriert sein.`;
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
        model: "gemini-2.0-flash-exp",
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
                        model: "gemini-2.0-flash-exp",
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
