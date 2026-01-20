/**
 * AI CREATIVE DIRECTOR
 * 
 * An intelligent system that thinks like an elite Creative Director:
 * - Deep product analysis with GPT-4 Vision
 * - Chain-of-thought reasoning for creative strategy
 * - Automatic industry/product detection
 * - Individualized ad creation for ANY product
 * - P0: Reliable text rendering + Quality verification
 * - P2: Industry best practices + A/B variants + All ad formats
 * 
 * No hardcoded rules - pure AI decision making.
 */

import sharp from 'sharp';
import { applyTextOverlay } from './textRenderer.js';
import { verifyAdQuality, passesQualityGate, improvePromptFromFeedback } from './qualityControl.js';
import { detectIndustry, getBestPractices } from './industryBestPractices.js';
import { AD_FORMATS, generateVariantPrompts, resizeToFormat, generateAllFormats } from './adFormats.js';

const CANVAS = 1080;
const MAX_QUALITY_RETRIES = 2;

/**
 * Main entry point - creates ad using AI Creative Director approach
 * Now with industry detection and multiple format support
 */
export async function createAdWithCreativeDirector(openai, config) {
    const {
        productImageUrl,
        userPrompt,
        headline,
        subheadline,
        cta,
        generateHeroImage,
        generateVariants = false,
        generateMultiFormat = false
    } = config;

    console.log('[CreativeDirector] 🧠 Starting AI Creative Director...');

    // Phase 1: Deep Product Analysis
    console.log('[CreativeDirector] Phase 1: Deep Analysis...');
    const analysis = await deepAnalyzeProduct(openai, productImageUrl, userPrompt);

    // Phase 1.5: Detect Industry and get best practices (P2)
    const industryKey = detectIndustry(analysis, userPrompt);
    const industryPractices = getBestPractices(industryKey);
    console.log(`[CreativeDirector] Industry detected: ${industryPractices.name}`);
    console.log(`[CreativeDirector] Best practices: ${industryPractices.bestPractices[0]}`);

    // Phase 2: Develop Creative Strategy (Chain-of-Thought)
    console.log('[CreativeDirector] Phase 2: Developing Creative Strategy...');
    const strategy = await developCreativeStrategy(openai, {
        analysis,
        userPrompt,
        headline,
        subheadline,
        cta,
        industryPractices // Pass industry knowledge to strategy
    });

    console.log('[CreativeDirector] Strategy developed:', strategy.reasoning?.substring(0, 200) + '...');

    // Phase 3: Execute Strategy
    console.log('[CreativeDirector] Phase 3: Executing Strategy...');
    const adBuffer = await executeCreativeStrategy(openai, strategy, productImageUrl, generateHeroImage);

    console.log('[CreativeDirector] ✅ AI Creative Director Complete');

    // Build result object
    const result = {
        buffer: adBuffer,
        strategy: strategy,
        analysis: analysis,
        industry: {
            key: industryKey,
            name: industryPractices.name,
            bestPractices: industryPractices.bestPractices
        },
        formats: {
            feed_square: adBuffer // Default format
        }
    };

    // Phase 4 (Optional): Generate all ad formats
    if (generateMultiFormat) {
        console.log('[CreativeDirector] Generating multiple ad formats...');
        const allFormats = await generateAllFormats(adBuffer);
        result.formats = {
            ...result.formats, ...Object.fromEntries(
                Object.entries(allFormats).map(([k, v]) => [k, v.buffer])
            )
        };
        console.log(`[CreativeDirector] ✓ Generated ${Object.keys(allFormats).length + 1} formats`);
    }

    // Phase 5 (Optional): Generate A/B variants
    if (generateVariants) {
        console.log('[CreativeDirector] Generating A/B variants...');
        const variantConfigs = generateVariantPrompts(strategy, 3);
        result.variantConfigs = variantConfigs;
        console.log(`[CreativeDirector] ✓ Generated ${variantConfigs.length} variant configurations`);
    }

    return result;
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
 * Phase 2: Develop Creative Strategy using Enhanced Chain-of-Thought Reasoning
 * Now includes industry-specific best practices (P2)
 */
async function developCreativeStrategy(openai, config) {
    const { analysis, userPrompt, headline, subheadline, cta, industryPractices } = config;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'system',
                content: `Du bist ein Elite Creative Director mit 15+ Jahren Erfahrung bei Apple, Nike und Meta.

DEINE AUFGABE: Entwickle die PERFEKTE Werbe-Strategie für dieses Produkt.

=== DENKE SCHRITT FÜR SCHRITT (Chain-of-Thought) ===

Schritt 1: PRODUKT-ESSENZ
- Was ist das emotionale Kernversprechen?
- Welches Problem löst es für den Käufer?
- Warum sollte jemand JETZT kaufen?

Schritt 2: VISUELLE WELT
- Welche Stimmung transportiert die Marke?
- Welche Farben verstärken die Botschaft?
- Welcher Stil passt (minimal, luxuriös, verspielt)?

Schritt 3: PRODUKT-INSZENIERUNG
- Wie präsentieren wir das Produkt am wirkungsvollsten?
- Device-Mockup für Screenshots, zentriert für Produkte
- Welche Perspektive ist am schmeichelhaftesten?

Schritt 4: KREATIVE EFFEKTE
Nutze passende Effekte:
- "glow" = Leucht-Effekt für Lampen, Tech-Produkte
- "sparkles" = Glitzer für Premium, Schmuck, Weihnachten
- "snow_particles" = Fallender Schnee für Weihnachten/Winter
- "light_rays" = Lichtstrahlen für dramatische Wirkung
- "reflection" = Spiegelung auf Oberfläche für Eleganz
- "bokeh" = Unscharfer Hintergrund für Fokus
- "christmas_glow" = Warmes Weihnachtslicht

Schritt 5: TEXT-PLATZIERUNG
- Headline: Groß, fett, WEIß - lesbar auf jedem Hintergrund
- Subheadline: Kleiner, unter Headline, 80% Opacity
- CTA: Roter Pill-Button am unteren Rand

Schritt 6: EINZIGARTIGKEIT
- Was macht DIESE Ad besser als 1000 andere?
- Welches Detail überrascht den Betrachter?

=== BEISPIEL EINER GUTEN STRATEGIE ===

Produkt: Fuchs-Lampe | Vision: "Weihnachtsmütze, gemütlich, leuchtend"

Reasoning: 
"1. Die Fuchs-Lampe ist ein Deko-Produkt für Kinderzimmer. Das emotionale Versprechen ist Geborgenheit und Wärme.
2. Weihnachtsthema = emotionale Kaufentscheidung, perfekt für Geschenke-Kampagne.
3. Die Lampe sollte LEUCHTEN (glow-Effekt) um ihre Funktion zu zeigen.
4. Eine kleine Santa-Mütze auf dem Fuchs verstärkt den Weihnachts-Appeal.
5. Gemütliche Szene mit Tanne im Hintergrund, warmes Licht, Schneepartikel.
6. Text unten: 'Das perfekte Geschenk' in warmem Weiß mit Schatten."

=== DEIN ANTWORT-FORMAT (JSON) ===
{
    "reasoning": "DETAILLIERTE Gedankenkette - JEDER Schritt deiner Überlegung (min. 200 Wörter)...",
    "creativeConcept": "Das übergreifende Konzept in einem Satz",
    "sceneDescription": "Detaillierte Szenen-Beschreibung (min. 100 Wörter)",
    "productIntegration": {
        "method": "device_mockup|centered|lifestyle|floating",
        "device": "macbook|ipad|iphone|none",
        "effects": ["glow", "sparkles", "snow_particles", "reflection", "bokeh", "light_rays"],
        "modifications": ["christmas_hat", "spotlight", "floating_elements"]
    },
    "productBounds": {
        "description": "INDIVIDUELL für DIESE spezifische Szene - WO genau soll das Produkt platziert werden?",
        "x": 0.0-1.0,
        "y": 0.0-1.0,
        "width": 0.0-1.0,
        "height": 0.0-1.0,
        "reasoning": "Warum genau DIESE Position? Z.B. 'Das Produkt muss links platziert werden weil rechts der Text steht' oder 'Zentral weil es das Hero-Element ist'"
    },
    "textConfig": {
        "headline": {
            "text": "Der Headline-Text",
            "position": "bottom",
            "fontSize": "large",
            "color": "#FFFFFF",
            "shadow": true
        },
        "subheadline": {
            "text": "Der Subheadline-Text",
            "fontSize": "medium",
            "color": "rgba(255,255,255,0.85)"
        },
        "cta": {
            "text": "CTA Button Text",
            "backgroundColor": "#FF4444",
            "position": "bottom"
        }
    },
    "imagePrompt": "SEHR DETAILLIERTER Prompt für gpt-image-1 (min. 200 Wörter). Beschreibe EXAKT: 1) Die komplette Szene/Atmosphäre 2) Wo das Produkt platziert wird (als leere/dunkle Zone - MUSS zu productBounds passen!) 3) Die unteren 20% des Bildes müssen ein sauberer, dunkler Gradient sein für späteres Text-Overlay. WICHTIG: KEINE Text, Buttons oder UI-Elemente im Bild generieren! Der Text wird nachträglich als SVG-Overlay hinzugefügt.",
    "colorScheme": {
        "background": "#hex",
        "accent": "#hex",
        "text": "#FFFFFF"
    },
    "moodKeywords": ["keyword1", "keyword2", "keyword3"]
}`
            }, {
                role: 'user',
                content: `=== PRODUKT-ANALYSE ===
${JSON.stringify(analysis, null, 2)}

=== USER'S KREATIVE VISION ===
"${userPrompt}"

=== TEXT-ELEMENTE ===
- Headline: "${headline || '(Keine angegeben - schlage eine vor)'}"
- Subheadline: "${subheadline || '(Keine angegeben - optional)'}"
- CTA: "${cta || '(Kein CTA - schlage einen vor)'}"

=== DEINE AUFGABE ===
Entwickle die PERFEKTE Creative-Strategie. Denke wie ein $10,000/Stunde Creative Director bei Apple.
WICHTIG: Der imagePrompt darf KEINEN Text, Buttons oder UI-Elemente enthalten! Diese werden später als SVG-Overlay hinzugefügt. Das Bild muss im unteren Bereich clean bleiben für das Text-Overlay.`
            }],
            max_tokens: 2500,
            response_format: { type: "json_object" }
        });

        const strategy = JSON.parse(response.choices[0].message.content);
        return strategy;
    } catch (error) {
        console.error('[CreativeDirector] Strategy development failed:', error.message);
        return generateFallbackStrategy(analysis, headline, subheadline, cta);
    }
}

/**
 * Fallback strategy if AI reasoning fails
 */
function generateFallbackStrategy(analysis, headline, subheadline, cta) {
    const headlineText = headline || 'Premium Quality';
    const subheadlineText = subheadline || '';
    const ctaText = cta || 'Jetzt entdecken';

    return {
        reasoning: "Fallback: Using premium default strategy with complete text package",
        creativeConcept: "Premium product showcase with clear call-to-action",
        sceneDescription: `Premium advertisement featuring ${analysis.productName || 'product'} in an elegant setting`,
        productIntegration: {
            method: analysis.isScreenContent ? 'device_mockup' : 'centered',
            device: analysis.isScreenContent ? 'macbook' : 'none',
            position: 'center',
            scale: 0.6,
            effects: ['glow', 'reflection'],
            modifications: []
        },
        textConfig: {
            headline: { text: headlineText, position: 'bottom', fontSize: 'large', color: '#FFFFFF', shadow: true },
            subheadline: { text: subheadlineText, fontSize: 'medium', color: 'rgba(255,255,255,0.85)' },
            cta: { text: ctaText, backgroundColor: '#FF4444', position: 'bottom' }
        },
        imagePrompt: `Premium advertisement image (1080x1080px). Dark sophisticated background with subtle gradient and soft glow. ${analysis.isScreenContent ? 'MacBook Pro Space Black in center with completely black screen for content overlay.' : 'Empty center area (50% of image) for product placement.'} Cinematic lighting from top-left creating elegant shadows.

DO NOT render any text, buttons, or UI elements in the image. Leave the bottom 20% of the image as a clean gradient area for text overlay to be added later.

Ultra-premium $10,000 creative director quality. Sharp, professional, conversion-focused.`,
        colorScheme: {
            background: '#0a0a0a',
            accent: '#ff4444',
            text: '#FFFFFF'
        },
        moodKeywords: ['premium', 'sophisticated', 'modern']
    };
}


/**
 * Phase 3: Execute the Creative Strategy with Quality Verification
 * Uses GPT-4V product analysis to include product in generation prompt
 */
async function executeCreativeStrategy(openai, strategy, productImageUrl, generateHeroImage) {
    let currentPrompt = strategy.imagePrompt;
    let finalBuffer = null;
    let qualityResult = null;

    // First, download the product image for compositing fallback
    console.log('[CreativeDirector] Downloading product image...');
    const productResponse = await fetch(productImageUrl);
    const productBuffer = Buffer.from(await productResponse.arrayBuffer());
    console.log('[CreativeDirector] ✓ Product image ready');

    // Quality retry loop
    for (let attempt = 0; attempt <= MAX_QUALITY_RETRIES; attempt++) {
        if (attempt > 0) {
            console.log(`[CreativeDirector] 🔄 Quality retry ${attempt}/${MAX_QUALITY_RETRIES}...`);
            currentPrompt = improvePromptFromFeedback(currentPrompt, qualityResult);
        }

        let integratedBuffer = null;

        // ============================================================
        // GENERATE AD WITH PRODUCT DESCRIPTION IN PROMPT
        // The product details from GPT-4V analysis are already in the strategy
        // We generate a scene that INCLUDES the product as part of the image
        // ============================================================
        console.log('[CreativeDirector] 🎨 Generating ad with product in scene...');

        // Build enhanced prompt that describes the product to render
        const productIntegration = strategy.productIntegration || {};
        const productMethod = productIntegration.method || 'centered';

        // Enhanced prompt includes detailed product description
        let enhancedPrompt = currentPrompt;

        // If it's a screen/dashboard product, generate with device mockup
        if (productMethod === 'device_mockup') {
            enhancedPrompt = `${currentPrompt}

CRITICAL: Generate a premium MacBook Pro mockup in the center of the image. The laptop screen should display a professional dashboard with:
- Dark theme interface
- Red accent colors
- Stats and charts visible
- Clean, modern UI design

The laptop should be the HERO of the image, professionally lit with subtle reflections.`;
        }

        // Generate the scene
        const imageResult = await generateHeroImage({
            prompt: enhancedPrompt,
            size: '1024x1024',
            quality: 'high'
        });

        let sceneBuffer = Buffer.from(imageResult.b64, 'base64');
        console.log('[CreativeDirector] ✓ Scene generated');

        // For screen content, composite the actual screenshot into the generated device
        if (productMethod === 'device_mockup') {
            console.log('[CreativeDirector] Compositing screen content into device...');
            integratedBuffer = await compositeIntoDevice(sceneBuffer, productBuffer, productIntegration, strategy.productBounds);
        } else {
            // For physical products, composite product onto scene
            console.log('[CreativeDirector] Compositing product into scene...');
            integratedBuffer = await compositeProduct(sceneBuffer, productBuffer, productIntegration, strategy.productBounds);
        }

        console.log('[CreativeDirector] ✓ Product integrated');

        // Apply effects from strategy
        if (productIntegration.effects && productIntegration.effects.length > 0) {
            console.log('[CreativeDirector] Applying effects:', productIntegration.effects.join(', '));
            integratedBuffer = await applyEffects(
                integratedBuffer,
                productIntegration.effects,
                strategy.colorScheme?.accent || '#FF4444'
            );
        }

        // Resize to final dimensions
        let resizedBuffer = await sharp(integratedBuffer)
            .resize(CANVAS, CANVAS, { fit: 'cover' })
            .png()
            .toBuffer();

        // Apply text overlay
        const textConfig = strategy.textConfig || {};
        if (textConfig.headline?.text || textConfig.subheadline?.text || textConfig.cta?.text) {
            console.log('[CreativeDirector] Applying text overlay...');
            resizedBuffer = await applyTextOverlay(resizedBuffer, {
                headline: textConfig.headline?.text,
                subheadline: textConfig.subheadline?.text,
                cta: textConfig.cta?.text,
                position: textConfig.headline?.position || 'bottom',
                colorScheme: strategy.colorScheme
            }, sharp);
            console.log('[CreativeDirector] ✓ Text overlay applied');
        }

        // Quality verification
        console.log('[CreativeDirector] Running quality verification...');
        qualityResult = await verifyAdQuality(openai, resizedBuffer, strategy);

        if (passesQualityGate(qualityResult, 6)) {
            console.log(`[CreativeDirector] ✅ Quality passed: ${qualityResult.overallScore}/10`);
            finalBuffer = resizedBuffer;
            break;
        } else {
            console.log(`[CreativeDirector] ⚠️ Quality score ${qualityResult.overallScore}/10 - below threshold`);
            if (attempt === MAX_QUALITY_RETRIES) {
                console.log('[CreativeDirector] Max retries reached, using best result');
                finalBuffer = resizedBuffer;
            }
        }
    }

    return finalBuffer;
}


/**
 * Composite product into device (MacBook, iPad, iPhone)
 * NOW USES AI-determined productBounds for individualized placement
 */
async function compositeIntoDevice(sceneBuffer, productBuffer, integration, productBounds) {
    const meta = await sharp(sceneBuffer).metadata();

    // Use AI-determined bounds if provided, otherwise fallback to device defaults
    let screenX, screenY, screenW, screenH;

    if (productBounds && productBounds.x !== undefined) {
        // AI-determined placement - INDIVIDUALIZED per ad!
        console.log(`[CreativeDirector] Using AI-determined device bounds: ${productBounds.reasoning || 'custom'}`);
        screenX = Math.round(meta.width * productBounds.x);
        screenY = Math.round(meta.height * productBounds.y);
        screenW = Math.round(meta.width * productBounds.width);
        screenH = Math.round(meta.height * productBounds.height);
    } else {
        // Fallback to device defaults (legacy behavior)
        const deviceFrames = {
            macbook: { x: 0.05, y: 0.08, width: 0.90, height: 0.55 },
            ipad: { x: 0.15, y: 0.10, width: 0.70, height: 0.70 },
            iphone: { x: 0.30, y: 0.08, width: 0.40, height: 0.75 }
        };
        const frame = deviceFrames[integration.device] || deviceFrames.macbook;
        screenX = Math.round(meta.width * frame.x);
        screenY = Math.round(meta.height * frame.y);
        screenW = Math.round(meta.width * frame.width);
        screenH = Math.round(meta.height * frame.height);
    }

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
 * NOW USES AI-determined productBounds for individualized placement
 */
async function compositeProduct(sceneBuffer, productBuffer, integration, productBounds) {
    const meta = await sharp(sceneBuffer).metadata();

    let productX, productY, productW, productH;

    if (productBounds && productBounds.x !== undefined) {
        // AI-determined placement - INDIVIDUALIZED per ad!
        console.log(`[CreativeDirector] Using AI-determined product bounds: ${productBounds.reasoning || 'custom'}`);
        productX = Math.round(meta.width * productBounds.x);
        productY = Math.round(meta.height * productBounds.y);
        productW = Math.round(meta.width * productBounds.width);
        productH = Math.round(meta.height * productBounds.height);
    } else {
        // Fallback to default centered placement (legacy behavior)
        const scale = 0.6;
        productW = Math.round(meta.width * scale);
        productH = Math.round(meta.height * scale);
        productX = Math.round((meta.width - productW) / 2);
        productY = Math.round((meta.height - productH) / 2) - 50;
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

/**
 * Apply sparkles effect (for premium, jewelry, christmas)
 */
async function applySparklesEffect(imageBuffer) {
    // Generate random sparkle positions
    const sparkles = [];
    for (let i = 0; i < 25; i++) {
        const x = Math.random() * CANVAS;
        const y = Math.random() * CANVAS * 0.7; // Top 70%
        const size = 2 + Math.random() * 4;
        const opacity = 0.4 + Math.random() * 0.6;
        sparkles.push(`<circle cx="${x}" cy="${y}" r="${size}" fill="white" opacity="${opacity}"/>`);
        // Add cross shape for some sparkles
        if (Math.random() > 0.5) {
            sparkles.push(`<line x1="${x - size * 2}" y1="${y}" x2="${x + size * 2}" y2="${y}" stroke="white" stroke-width="1" opacity="${opacity * 0.7}"/>`);
            sparkles.push(`<line x1="${x}" y1="${y - size * 2}" x2="${x}" y2="${y + size * 2}" stroke="white" stroke-width="1" opacity="${opacity * 0.7}"/>`);
        }
    }

    const sparklesSvg = `
<svg width="${CANVAS}" height="${CANVAS}" xmlns="http://www.w3.org/2000/svg">
    ${sparkles.join('\n')}
</svg>`;

    const resized = await sharp(imageBuffer)
        .resize(CANVAS, CANVAS, { fit: 'cover' })
        .png()
        .toBuffer();

    return sharp(resized)
        .composite([{ input: Buffer.from(sparklesSvg), blend: 'screen' }])
        .png()
        .toBuffer();
}

/**
 * Apply snow particles effect (for christmas, winter)
 */
async function applySnowEffect(imageBuffer) {
    const snowflakes = [];
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * CANVAS;
        const y = Math.random() * CANVAS;
        const size = 1 + Math.random() * 3;
        const opacity = 0.3 + Math.random() * 0.5;
        snowflakes.push(`<circle cx="${x}" cy="${y}" r="${size}" fill="white" opacity="${opacity}"/>`);
    }

    const snowSvg = `
<svg width="${CANVAS}" height="${CANVAS}" xmlns="http://www.w3.org/2000/svg">
    ${snowflakes.join('\n')}
</svg>`;

    const resized = await sharp(imageBuffer)
        .resize(CANVAS, CANVAS, { fit: 'cover' })
        .png()
        .toBuffer();

    return sharp(resized)
        .composite([{ input: Buffer.from(snowSvg), blend: 'over' }])
        .png()
        .toBuffer();
}

/**
 * Apply light rays effect (for dramatic emphasis)
 */
async function applyLightRaysEffect(imageBuffer, color = '#FFFFFF') {
    const raysSvg = `
<svg width="${CANVAS}" height="${CANVAS}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="ray1" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:0.15"/>
            <stop offset="100%" style="stop-color:${color};stop-opacity:0"/>
        </linearGradient>
    </defs>
    <polygon points="${CANVAS * 0.45},0 ${CANVAS * 0.55},0 ${CANVAS * 0.7},${CANVAS} ${CANVAS * 0.3},${CANVAS}" fill="url(#ray1)"/>
    <polygon points="${CANVAS * 0.3},0 ${CANVAS * 0.35},0 ${CANVAS * 0.5},${CANVAS} ${CANVAS * 0.2},${CANVAS}" fill="url(#ray1)" opacity="0.5"/>
    <polygon points="${CANVAS * 0.65},0 ${CANVAS * 0.7},0 ${CANVAS * 0.8},${CANVAS} ${CANVAS * 0.5},${CANVAS}" fill="url(#ray1)" opacity="0.5"/>
</svg>`;

    const resized = await sharp(imageBuffer)
        .resize(CANVAS, CANVAS, { fit: 'cover' })
        .png()
        .toBuffer();

    return sharp(resized)
        .composite([{ input: Buffer.from(raysSvg), blend: 'screen' }])
        .png()
        .toBuffer();
}

/**
 * Apply reflection effect (for elegant products)
 */
async function applyReflectionEffect(imageBuffer) {
    const reflectionSvg = `
<svg width="${CANVAS}" height="${CANVAS}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="reflection" x1="0%" y1="80%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:white;stop-opacity:0"/>
            <stop offset="50%" style="stop-color:white;stop-opacity:0.05"/>
            <stop offset="100%" style="stop-color:white;stop-opacity:0.1"/>
        </linearGradient>
    </defs>
    <rect x="0" y="${CANVAS * 0.75}" width="${CANVAS}" height="${CANVAS * 0.25}" fill="url(#reflection)"/>
</svg>`;

    const resized = await sharp(imageBuffer)
        .resize(CANVAS, CANVAS, { fit: 'cover' })
        .png()
        .toBuffer();

    return sharp(resized)
        .composite([{ input: Buffer.from(reflectionSvg), blend: 'over' }])
        .png()
        .toBuffer();
}

/**
 * Apply all effects based on strategy
 */
async function applyEffects(imageBuffer, effects = [], accentColor = '#FF4444') {
    let result = imageBuffer;

    for (const effect of effects) {
        console.log(`[CreativeDirector] Applying effect: ${effect}`);
        switch (effect) {
            case 'glow':
            case 'christmas_glow':
                result = await applyGlowEffect(result, effect === 'christmas_glow' ? '#FFA500' : accentColor);
                break;
            case 'sparkles':
                result = await applySparklesEffect(result);
                break;
            case 'snow_particles':
            case 'snow':
                result = await applySnowEffect(result);
                break;
            case 'light_rays':
                result = await applyLightRaysEffect(result);
                break;
            case 'reflection':
                result = await applyReflectionEffect(result);
                break;
            // bokeh is applied in the AI prompt itself
        }
    }

    return result;
}

export default {
    createAdWithCreativeDirector,
    deepAnalyzeProduct,
    developCreativeStrategy,
    executeCreativeStrategy,
    applyEffects,
    applyGlowEffect,
    applySparklesEffect,
    applySnowEffect,
    applyLightRaysEffect,
    applyReflectionEffect,
    CANVAS
};
