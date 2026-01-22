/**
 * GEMINI IMAGE API CLIENT
 * 
 * Provides image-to-image generation for 100% product preservation.
 * Uses Gemini's multimodal capabilities to create ads AROUND the product
 * rather than regenerating the product itself.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

let cachedClient = null;

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

    console.log("[Gemini] Analyzing product image...");

    const result = await model.generateContent([
        {
            inlineData: {
                mimeType: "image/png",
                data: productImageBuffer.toString("base64")
            }
        },
        {
            text: `Du bist ein Elite Creative Director. Analysiere dieses Produktbild TIEFGEHEND.

Antworte mit JSON:
{
    "productName": "Was ist das Produkt genau?",
    "productType": "Produktkategorie (electronics, fashion, beauty, food, toy, etc)",
    "industry": "Branche",
    "targetAudience": "Wer würde das kaufen?",
    "emotionalAppeal": "Welche Emotionen soll es wecken?",
    "keyVisualElements": ["Wichtige visuelle Elemente im Produkt"],
    "colorPalette": ["Hauptfarben im Produkt als HEX"],
    "suggestedMood": "Welche Stimmung passt am besten?",
    "suggestedScene": "Welche Szene würde das Produkt am besten präsentieren?",
    "productDescription": "Detaillierte Beschreibung für die Ad-Generierung"
}`
        }
    ]);

    const responseText = result.response.text();

    // Parse JSON from response
    try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            console.log("[Gemini] ✓ Product analyzed:", analysis.productName);
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
        productDescription: "Premium product"
    };
}

/**
 * Generate Meta Ad with Gemini Image-to-Image
 * 
 * This is the CORE function - takes a product image and generates
 * a complete ad AROUND it while preserving the product 100%.
 */
export async function generateAdWithGemini({
    productImageBuffer,
    headline,
    subheadline,
    cta,
    productAnalysis,
    style = "premium_dark"
}) {
    const genAI = getGeminiClient();

    // Use the image generation model
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
            responseModalities: ["image", "text"]
        }
    });

    console.log("[Gemini] 🎨 Generating Meta Ad with image-to-image...");

    // Build the ad generation prompt
    const adPrompt = buildAdPrompt({
        headline,
        subheadline,
        cta,
        productAnalysis,
        style
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

        return {
            success: false,
            error: "No image generated",
            textResponse
        };

    } catch (error) {
        console.error("[Gemini] Image generation failed:", error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Build the ad generation prompt
 */
function buildAdPrompt({ headline, subheadline, cta, productAnalysis, style }) {
    const productDesc = productAnalysis?.productDescription || "premium product";
    const mood = productAnalysis?.suggestedMood || "premium";
    const colors = productAnalysis?.colorPalette?.join(", ") || "elegant colors";

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

    return `ULTRA-PREMIUM META AD CREATION (1080x1080px):

🔴 KRITISCHE REGEL - PRODUKTERHALTUNG:
Das Produktbild das du siehst MUSS 1:1 erhalten bleiben!
- KEINE Änderungen am Produkt selbst
- KEINE Verzerrung, Rotation oder Skalierung des Produkts
- Das Produkt ist der HERO - es muss prominent und unverändert bleiben

📸 DEINE AUFGABE:
Erstelle eine vollständige Meta-Werbeanzeige DRUMHERUM:

1. SZENE & HINTERGRUND:
   - ${styleConfig.background}
   - ${styleConfig.lighting}
   - ${styleConfig.effects}
   - Passend zum Produkt: ${productDesc}
   - Stimmung: ${mood}
   - Farbakzente passend zu: ${colors}

2. PRODUKT-PLATZIERUNG:
   - Das Produkt sollte zentral-oben positioniert sein (ca. 50-60% der Bildhöhe)
   - Professionelle Schatten und Reflexionen unter/hinter dem Produkt
   - Das Produkt muss EXAKT so aussehen wie im Input-Bild!

3. TEXT IM BILD (am unteren Rand):
${headline ? `   - HEADLINE: "${headline}" - Große, fette, weiße Schrift mit leichtem Schatten` : ''}
${subheadline ? `   - SUBHEADLINE: "${subheadline}" - Kleinere weiße Schrift` : ''}
${cta ? `   - CTA-BUTTON: Roter Pill-Button (#FF4444) mit weißem Text "${cta}"` : ''}
   - Text muss SCHARF und LESBAR sein

4. QUALITÄT:
   - $10,000 Creative Agency Level
   - Meta 2026 Ad Standards
   - Magazin-Cover Qualität
   - Perfekte Komposition

Das Produkt im Input-Bild ist heilig - es darf NICHT verändert werden!
Generiere die komplette Ad als ein 1080x1080 Bild.`;
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

    throw new Error(`Gemini ad generation failed: ${geminiResult.error}`);
}

export default {
    getGeminiClient,
    analyzeProductWithGemini,
    generateAdWithGemini,
    generateAdWithGeminiFallback
};
