/**
 * AI CREATIVE DIRECTOR
 * 
 * An intelligent system that thinks like an elite Creative Director:
 * - Deep product analysis with GPT-4 Vision
 * - Chain-of-thought reasoning for creative strategy
 * - Automatic industry/product detection
 * - Individualized ad creation for ANY product
 * 
 * No hardcoded rules - pure AI decision making.
 */

import sharp from 'sharp';

const CANVAS = 1080;

/**
 * Main entry point - creates ad using AI Creative Director approach
 */
export async function createAdWithCreativeDirector(openai, config) {
    const {
        productImageUrl,
        userPrompt,
        headline,
        subheadline,
        cta,
        generateHeroImage
    } = config;

    console.log('[CreativeDirector] 🧠 Starting AI Creative Director...');

    // Phase 1: Deep Product Analysis
    console.log('[CreativeDirector] Phase 1: Deep Analysis...');
    const analysis = await deepAnalyzeProduct(openai, productImageUrl, userPrompt);

    // Phase 2: Develop Creative Strategy (Chain-of-Thought)
    console.log('[CreativeDirector] Phase 2: Developing Creative Strategy...');
    const strategy = await developCreativeStrategy(openai, {
        analysis,
        userPrompt,
        headline,
        subheadline,
        cta
    });

    console.log('[CreativeDirector] Strategy developed:', strategy.reasoning?.substring(0, 200) + '...');

    // Phase 3: Execute Strategy
    console.log('[CreativeDirector] Phase 3: Executing Strategy...');
    const adBuffer = await executeCreativeStrategy(openai, strategy, productImageUrl, generateHeroImage);

    console.log('[CreativeDirector] ✅ AI Creative Director Complete');

    return {
        buffer: adBuffer,
        strategy: strategy,
        analysis: analysis
    };
}

/**
 * Phase 1: Deep Product Analysis using GPT-4 Vision
 */
async function deepAnalyzeProduct(openai, imageUrl, userPrompt) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: `Du bist ein Elite Creative Director. Analysiere dieses Produktbild TIEFGEHEND.

User's Wunsch: "${userPrompt}"

Analysiere und antworte mit JSON:
{
    "productName": "Was ist das Produkt genau?",
    "productType": "Produktkategorie (electronics, fashion, beauty, food, toy, lamp, furniture, etc)",
    "industry": "Branche",
    "targetAudience": "Wer würde das kaufen?",
    "emotionalAppeal": "Welche Emotionen soll es wecken?",
    "keyVisualElements": ["Wichtige visuelle Elemente im Produkt"],
    "colorPalette": ["Hauptfarben im Produkt"],
    "suggestedMood": "Welche Stimmung passt am besten?",
    "isScreenContent": true/false,
    "isPhysicalProduct": true/false,
    "specialFeatures": ["Besondere Eigenschaften die hervorgehoben werden sollten"],
    "recommendedScene": "Welche Szene würde das Produkt am besten präsentieren?"
}`
                    },
                    {
                        type: 'image_url',
                        image_url: { url: imageUrl }
                    }
                ]
            }],
            max_tokens: 800,
            response_format: { type: "json_object" }
        });

        const analysis = JSON.parse(response.choices[0].message.content);
        console.log('[CreativeDirector] Product identified:', analysis.productName);
        return analysis;
    } catch (error) {
        console.error('[CreativeDirector] Analysis failed:', error.message);
        return {
            productName: 'Product',
            productType: 'general',
            industry: 'retail',
            targetAudience: 'general consumers',
            emotionalAppeal: 'quality and value',
            keyVisualElements: [],
            colorPalette: [],
            suggestedMood: 'premium',
            isScreenContent: false,
            isPhysicalProduct: true,
            specialFeatures: [],
            recommendedScene: 'premium studio setting'
        };
    }
}

/**
 * Phase 2: Develop Creative Strategy using Chain-of-Thought Reasoning
 */
async function developCreativeStrategy(openai, config) {
    const { analysis, userPrompt, headline, subheadline, cta } = config;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'system',
                content: `Du bist ein Elite Creative Director mit 15+ Jahren Erfahrung bei Top-Agenturen (Apple, Nike, Meta).

Deine Aufgabe: Entwickle die PERFEKTE Werbe-Strategie für dieses Produkt.

DENKE SCHRITT FÜR SCHRITT (Chain-of-Thought):
1. Was ist das Kernversprechen des Produkts?
2. Welche visuelle Welt passt am besten?
3. Wie integrieren wir das Produkt optimal in die Szene?
4. Welche kreativen Effekte verstärken die Botschaft?
5. Wie platzieren wir Text für maximale Wirkung?
6. Was macht diese Ad einzigartig und unwiderstehlich?

Antworte IMMER mit diesem JSON-Format:
{
    "reasoning": "Deine komplette Gedankenkette - jeden Schritt deiner Überlegung...",
    "creativeConcept": "Das übergreifende kreative Konzept in einem Satz",
    "sceneDescription": "Detaillierte Beschreibung der zu generierenden Szene (min. 100 Wörter)",
    "productIntegration": {
        "method": "device_mockup|centered|lifestyle|floating|integrated_scene",
        "device": "macbook|ipad|iphone|none",
        "position": "center|left|right|hero",
        "scale": 0.4-0.9,
        "effects": ["glow", "shadow", "reflection", "lighting", etc],
        "modifications": ["christmas_hat", "sparkles", "light_rays", etc]
    },
    "textPlacement": {
        "headlinePosition": "bottom|top|left_side|overlay",
        "style": "bold_white|elegant|dynamic|minimal",
        "alignment": "center|left|right"
    },
    "imagePrompt": "Der optimierte Prompt für die Bildgenerierung - SEHR DETAILLIERT (min. 150 Wörter). Dieser Prompt geht direkt an gpt-image-1 und muss die KOMPLETTE Szene beschreiben inklusive wo das Produkt platziert wird (als leere Zone) und wo der Text erscheinen soll.",
    "colorScheme": {
        "background": "#hex",
        "accent": "#hex",
        "text": "#hex"
    },
    "moodKeywords": ["keyword1", "keyword2", "keyword3"]
}`
            }, {
                role: 'user',
                content: `PRODUKT-ANALYSE:
${JSON.stringify(analysis, null, 2)}

USER'S KREATIVE VISION:
"${userPrompt}"

TEXT-ELEMENTE:
- Headline: "${headline || 'Keine Headline angegeben'}"
- Subheadline: "${subheadline || 'Keine Subheadline'}"
- CTA: "${cta || 'Kein CTA'}"

Entwickle jetzt die PERFEKTE Creative-Strategie. Denke wie ein $10,000/Stunde Creative Director.`
            }],
            max_tokens: 2000,
            response_format: { type: "json_object" }
        });

        const strategy = JSON.parse(response.choices[0].message.content);
        return strategy;
    } catch (error) {
        console.error('[CreativeDirector] Strategy development failed:', error.message);
        // Fallback strategy
        return generateFallbackStrategy(analysis, headline);
    }
}

/**
 * Fallback strategy if AI reasoning fails
 */
function generateFallbackStrategy(analysis, headline) {
    return {
        reasoning: "Fallback: Using premium default strategy",
        creativeConcept: "Premium product showcase",
        sceneDescription: `Premium advertisement featuring ${analysis.productName} in an elegant setting`,
        productIntegration: {
            method: analysis.isScreenContent ? 'device_mockup' : 'centered',
            device: analysis.isScreenContent ? 'macbook' : 'none',
            position: 'center',
            scale: 0.6,
            effects: ['shadow', 'soft_lighting'],
            modifications: []
        },
        textPlacement: {
            headlinePosition: 'bottom',
            style: 'bold_white',
            alignment: 'center'
        },
        imagePrompt: `Premium advertisement image. Dark sophisticated background with subtle gradient. ${analysis.isScreenContent ? 'MacBook Pro Space Black in center with completely black screen for content overlay.' : 'Empty center area for product placement.'} Cinematic lighting from top-left. ${headline ? `Large bold white text at bottom reading "${headline}".` : ''} Ultra-premium $10,000 creative director quality. 1080x1080px.`,
        colorScheme: {
            background: '#0a0a0a',
            accent: '#ff4444',
            text: '#ffffff'
        },
        moodKeywords: ['premium', 'sophisticated', 'modern']
    };
}

/**
 * Phase 3: Execute the Creative Strategy
 */
async function executeCreativeStrategy(openai, strategy, productImageUrl, generateHeroImage) {
    // Step 1: Generate scene using AI's crafted prompt
    console.log('[CreativeDirector] Generating scene with AI-crafted prompt...');

    const imageResult = await generateHeroImage({
        prompt: strategy.imagePrompt,
        size: '1024x1024',
        quality: 'high'
    });

    let sceneBuffer = Buffer.from(imageResult.b64, 'base64');
    console.log('[CreativeDirector] ✓ Scene generated');

    // Step 2: Download and prepare product image
    console.log('[CreativeDirector] Preparing product for integration...');
    const productResponse = await fetch(productImageUrl);
    const productBuffer = Buffer.from(await productResponse.arrayBuffer());

    // Step 3: Integrate product based on strategy
    let integratedBuffer;
    const integration = strategy.productIntegration;

    if (integration.method === 'device_mockup' && integration.device) {
        integratedBuffer = await compositeIntoDevice(sceneBuffer, productBuffer, integration);
    } else {
        integratedBuffer = await compositeProduct(sceneBuffer, productBuffer, integration);
    }

    console.log('[CreativeDirector] ✓ Product integrated');

    // Step 4: Apply effects if specified
    if (integration.effects && integration.effects.includes('glow')) {
        integratedBuffer = await applyGlowEffect(integratedBuffer, strategy.colorScheme?.accent || '#FF4444');
    }

    // Step 5: Final resize and output
    const finalBuffer = await sharp(integratedBuffer)
        .resize(CANVAS, CANVAS, { fit: 'cover' })
        .png()
        .toBuffer();

    return finalBuffer;
}

/**
 * Composite product into device (MacBook, iPad, iPhone)
 */
async function compositeIntoDevice(sceneBuffer, productBuffer, integration) {
    const deviceFrames = {
        macbook: { x: 0.05, y: 0.08, width: 0.90, height: 0.55 },
        ipad: { x: 0.15, y: 0.10, width: 0.70, height: 0.70 },
        iphone: { x: 0.30, y: 0.08, width: 0.40, height: 0.75 }
    };

    const frame = deviceFrames[integration.device] || deviceFrames.macbook;
    const meta = await sharp(sceneBuffer).metadata();

    const screenX = Math.round(meta.width * frame.x);
    const screenY = Math.round(meta.height * frame.y);
    const screenW = Math.round(meta.width * frame.width);
    const screenH = Math.round(meta.height * frame.height);

    const resizedProduct = await sharp(productBuffer)
        .resize(screenW, screenH, { fit: 'cover' })
        .png()
        .toBuffer();

    return sharp(sceneBuffer)
        .composite([{ input: resizedProduct, left: screenX, top: screenY }])
        .png()
        .toBuffer();
}

/**
 * Composite product into scene (centered, lifestyle, etc.)
 */
async function compositeProduct(sceneBuffer, productBuffer, integration) {
    const meta = await sharp(sceneBuffer).metadata();
    const scale = integration.scale || 0.6;

    const productW = Math.round(meta.width * scale);
    const productH = Math.round(meta.height * scale);

    let productX, productY;
    switch (integration.position) {
        case 'left':
            productX = Math.round(meta.width * 0.05);
            productY = Math.round((meta.height - productH) / 2);
            break;
        case 'right':
            productX = Math.round(meta.width * 0.95 - productW);
            productY = Math.round((meta.height - productH) / 2);
            break;
        default: // center
            productX = Math.round((meta.width - productW) / 2);
            productY = Math.round((meta.height - productH) / 2) - 50; // Slightly up for text space
    }

    const resizedProduct = await sharp(productBuffer)
        .resize(productW, productH, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();

    return sharp(sceneBuffer)
        .composite([{ input: resizedProduct, left: productX, top: productY }])
        .png()
        .toBuffer();
}

/**
 * Apply glow effect
 */
async function applyGlowEffect(imageBuffer, color = '#FF4444') {
    const glowSvg = `
<svg width="${CANVAS}" height="${CANVAS}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <radialGradient id="glow" cx="50%" cy="45%" r="40%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:0.25"/>
            <stop offset="100%" style="stop-color:${color};stop-opacity:0"/>
        </radialGradient>
    </defs>
    <ellipse cx="${CANVAS / 2}" cy="${CANVAS * 0.45}" rx="${CANVAS * 0.35}" ry="${CANVAS * 0.3}" fill="url(#glow)"/>
</svg>`;

    const resized = await sharp(imageBuffer)
        .resize(CANVAS, CANVAS, { fit: 'cover' })
        .png()
        .toBuffer();

    return sharp(resized)
        .composite([{ input: Buffer.from(glowSvg), blend: 'screen' }])
        .png()
        .toBuffer();
}

export default {
    createAdWithCreativeDirector,
    deepAnalyzeProduct,
    developCreativeStrategy,
    executeCreativeStrategy,
    CANVAS
};
