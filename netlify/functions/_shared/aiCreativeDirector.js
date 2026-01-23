/**
 * AI CREATIVE DIRECTOR
 * 
 * An intelligent system that thinks like an elite Creative Director:
 * - Deep product analysis with Gemini Vision or GPT-4 Vision
 * - Chain-of-thought reasoning for creative strategy
 * - Automatic industry/product detection
 * - Individualized ad creation for ANY product
 * - P0: Reliable text rendering + Quality verification
 * - P2: Industry best practices + A/B variants + All ad formats
 * 
 * Now with GEMINI IMAGE-TO-IMAGE for 100% product preservation!
 */

import sharp from 'sharp';
import { applyTextOverlay } from './textRenderer.js';
import { verifyAdQuality, passesQualityGate, improvePromptFromFeedback } from './qualityControl.js';
import { detectIndustry, getBestPractices } from './industryBestPractices.js';
import { AD_FORMATS, generateVariantPrompts, resizeToFormat, generateAllFormats } from './adFormats.js';
import { analyzeProductWithGemini, generateAdWithGemini } from './gemini.js';
import { generateImageWithReference } from './openai.js';
import { selectBestPattern, REFERENCE_PATTERNS } from './referencePatterns.js';
import { QUALITY, FEATURES, fetchWithTimeout, TIMEOUTS } from './config.js';
import { buildMasterAdPrompt, ENHANCED_PATTERNS, PRODUCT_ANALYSIS_PROMPT } from './elitePrompts.js';
import { polishPromptWithExpert } from './promptPolisher.js';

const CANVAS = QUALITY.CANVAS_SIZE;
const MAX_QUALITY_RETRIES = QUALITY.MAX_RETRIES;
const USE_GEMINI = FEATURES.USE_GEMINI;

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
 * NEW: Create ad using Gemini Image-to-Image
 * 
 * This is the PREFERRED method when GEMINI_API_KEY is set.
 * Uses Gemini's multimodal capabilities to create an ad AROUND the product
 * while preserving the product image 100%.
 */
export async function createAdWithGeminiDirector(openai, config) {
    const {
        productImageUrl,
        userPrompt,
        headline,
        subheadline,
        cta,
        generateHeroImage, // Fallback to OpenAI
        generateVariants = false,
        generateMultiFormat = false
    } = config;

    console.log('[CreativeDirector] 🚀 Starting GEMINI Creative Director (Image-to-Image)...');

    // Download product image with timeout protection
    console.log('[CreativeDirector] Downloading product image...');
    const productResponse = await fetchWithTimeout(productImageUrl, {}, TIMEOUTS.IMAGE_FETCH);
    if (!productResponse.ok) {
        throw new Error(`Failed to fetch product image: ${productResponse.status}`);
    }
    const productBuffer = Buffer.from(await productResponse.arrayBuffer());
    console.log('[CreativeDirector] ✓ Product image ready');

    // Phase 1: Analyze product with Gemini Vision
    console.log('[CreativeDirector] Phase 1: Gemini Vision Analysis...');
    let analysis;
    try {
        analysis = await analyzeProductWithGemini(productBuffer);
    } catch (geminiError) {
        console.warn('[CreativeDirector] Gemini analysis failed, falling back to OpenAI:', geminiError.message);
        analysis = await deepAnalyzeProduct(openai, productImageUrl, userPrompt);
    }

    // Detect industry
    const industryKey = detectIndustry(analysis, userPrompt);
    const industryPractices = getBestPractices(industryKey);
    console.log(`[CreativeDirector] Industry detected: ${industryPractices.name}`);

    // Phase 1.5: Select best reference pattern based on product analysis
    const referencePattern = selectBestPattern({
        productType: analysis.productType || 'general',
        industry: industryKey,
        hasMultipleFeatures: (analysis.keyVisualElements?.length || 0) > 3,
        hasCompetitor: userPrompt?.toLowerCase().includes('vs') || userPrompt?.toLowerCase().includes('besser'),
        isLifestyle: analysis.emotionalAppeal?.toLowerCase().includes('lifestyle') || analysis.suggestedMood?.includes('aspirational'),
        productCount: 1,
        userHint: userPrompt || ''
    });
    console.log(`[CreativeDirector] 🎯 Selected reference pattern: ${referencePattern.name}`);

    // Phase 1.5: Polish user prompt with Marketing Expert AI
    console.log('[CreativeDirector] Phase 1.5: Marketing Expert Prompt Polish...');
    let enhancedPrompt;
    try {
        enhancedPrompt = await polishPromptWithExpert(openai, {
            userPrompt,
            productAnalysis: analysis,
            industry: industryKey,
            headline,
            subheadline,
            cta
        });
        console.log('[CreativeDirector] ✅ Prompt enhanced by Marketing Expert');
    } catch (polishError) {
        console.warn('[CreativeDirector] Prompt polish failed, using original:', polishError.message);
        enhancedPrompt = userPrompt || `Premium ad for ${analysis.productName || 'this product'}`;
    }

    // Phase 2: Generate ad with Gemini Image-to-Image using enhanced prompt
    console.log('[CreativeDirector] Phase 2: Gemini Image-to-Image Ad Generation...');

    const geminiResult = await generateAdWithGemini({
        productImageBuffer: productBuffer,
        headline: headline || 'Premium Quality',
        subheadline: subheadline || '',
        cta: cta || 'Shop Now',
        productAnalysis: analysis,
        style: 'premium_dark',
        referencePattern,  // Pass the selected pattern for style guidance
        enhancedPrompt     // Pass the marketing-expert-polished prompt
    });

    let adBuffer;
    let source = 'gemini';

    if (geminiResult.success && geminiResult.buffer) {
        console.log('[CreativeDirector] ✓ Gemini ad generation successful!');
        adBuffer = geminiResult.buffer;
    } else {
        // Fallback to OpenAI images.edit for true image-to-image
        console.log('[CreativeDirector] ⚠️ Gemini failed, trying OpenAI images.edit...');
        source = 'openai_images_edit';

        // Build a prompt for OpenAI images.edit
        const editPrompt = `Transform this product into a premium 2026 Meta advertisement:
- Create a stunning, professional ad scene AROUND this exact product
- Keep the product recognizable and as the hero
- Add dramatic lighting: cinematic three-point lighting with subtle glow
- Background: elegant dark gradient with subtle bokeh effects
- Style: premium, viral dropshipping aesthetic
- Text at bottom: "${headline || 'Premium Quality'}" as bold headline
${subheadline ? `- Subheadline: "${subheadline}"` : ''}
${cta ? `- CTA button: red pill-shaped button with "${cta}"` : ''}
- Final result: Magazine-quality Meta ad, 1080x1080px`;

        const editResult = await generateImageWithReference({
            prompt: editPrompt,
            referenceImageBuffer: productBuffer,
            size: "1024x1024",
            quality: "high"
        });

        if (editResult.success && editResult.buffer) {
            console.log('[CreativeDirector] ✅ OpenAI images.edit successful!');
            adBuffer = editResult.buffer;
        } else {
            // Last resort: composite fallback
            console.log('[CreativeDirector] ⚠️ images.edit failed, using composite fallback...');
            source = 'openai_composite_fallback';

            const strategy = await developCreativeStrategy(openai, {
                analysis,
                userPrompt,
                headline,
                subheadline,
                cta,
                industryPractices
            });

            adBuffer = await executeCreativeStrategy(openai, strategy, productImageUrl, generateHeroImage);
        }
    }

    // Resize to final dimensions
    adBuffer = await sharp(adBuffer)
        .resize(CANVAS, CANVAS, { fit: 'cover' })
        .png()
        .toBuffer();

    // Quality verification with Gemini or GPT-4V
    console.log('[CreativeDirector] Phase 3: Quality verification...');
    const qualityResult = await verifyAdQuality(openai, adBuffer, {
        textConfig: {
            headline: { text: headline },
            subheadline: { text: subheadline },
            cta: { text: cta }
        }
    });

    // SVG overlay DISABLED - Gemini now generates complete ads with text
    // The SVG overlay was causing rectangle bugs due to missing fonts on Netlify
    // All text (headline, subheadline, CTA) is now rendered by Gemini directly
    console.log('[CreativeDirector] ✓ Using Gemini-rendered text (no SVG overlay)');

    console.log(`[CreativeDirector] ✅ Gemini Creative Director Complete (source: ${source})`);

    // Build result
    const result = {
        buffer: adBuffer,
        source,
        analysis,
        industry: {
            key: industryKey,
            name: industryPractices.name,
            bestPractices: industryPractices.bestPractices
        },
        formats: {
            feed_square: adBuffer
        }
    };

    // Generate multiple formats if requested
    if (generateMultiFormat) {
        console.log('[CreativeDirector] Generating multiple ad formats...');
        const allFormats = await generateAllFormats(adBuffer);
        result.formats = {
            ...result.formats,
            ...Object.fromEntries(Object.entries(allFormats).map(([k, v]) => [k, v.buffer]))
        };
        console.log(`[CreativeDirector] ✓ Generated ${Object.keys(allFormats).length + 1} formats`);
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
                content: `Du bist ein ELITE CREATIVE DIRECTOR mit 15+ Jahren Erfahrung bei Apple, Nike und Meta.
Du erstellst META ADS die VIRAL gehen und MILLIONEN an Umsatz generieren.

=== DEINE MISSION ===
Erstelle eine VOLLSTÄNDIGE, FERTIGE Ad die sofort auf Instagram/Facebook geschaltet werden kann.
Das Bild muss KOMPLETT SEIN - inklusive Produkt, Text, und CTA-Button.

=== CHAIN-OF-THOUGHT PROZESS ===

Schritt 1: PRODUKT-VERSTÄNDNIS
- Was GENAU ist das Produkt? (Nutze die Analyse)
- Welches PROBLEM löst es?
- Welche EMOTION soll ausgelöst werden?

Schritt 2: SZENEN-DESIGN
- Welche Umgebung präsentiert das Produkt am besten?
- Welche Farben, Lichtstimmung, Atmosphäre?
- Wie kann das Produkt ORGANISCH in die Szene integriert werden?

Schritt 3: TEXT-INTEGRATION (KRITISCH!)
- Die Headline MUSS im Bild gerendert werden - groß, fett, lesbar
- Der CTA-Button MUSS im Bild sein - auffällig, klickbar aussehend
- Text muss TEIL der Komposition sein, nicht draufgeklebt

Schritt 4: PREMIUM-QUALITÄT
- Jedes Pixel muss aussehen wie $10,000 Agentur-Arbeit
- Professionelle Beleuchtung, perfekte Komposition
- Meta 2026 Ad-Standards

=== KRITISCHE REGELN ===

🔴 DAS PRODUKT:
- Beschreibe das Produkt im imagePrompt EXAKT so wie in der Analyse
- Das Produkt muss natürlich in die Szene eingebettet sein
- Realistische Schatten, Reflexionen, Perspektive

🔴 DER TEXT (MUSS IM BILD SEIN!):
- Headline: Große, fette, weiße Schrift mit Schatten - AM UNTEREN RAND
- Subheadline: Kleiner, unter der Headline
- CTA-Button: Roter/farbiger Pill-Button mit weißem Text
- Text muss SCHARF und LESBAR sein - keine verschwommenen Buchstaben!

🔴 VERBOTEN:
- Keine verzerrten Buchstaben oder unleserlichen Text
- Keine abgeschnittenen Wörter
- Keine generischen Platzhalter-Texte
- Keine schwebenden/unnatürlichen Produkte

=== BEISPIEL EINES PERFEKTEN imagePrompt ===

"ULTRA-PREMIUM META AD (1080x1080px):

SZENE: Eleganter dunkler Schreibtisch mit warmem Ambient-Licht von links. Subtiler Bokeh-Hintergrund mit Lichtpunkten.

PRODUKT: Ein schlankes MacBook Pro Space Black steht leicht angewinkelt auf dem Tisch. Der Bildschirm zeigt ein professionelles Dashboard mit dunklem Theme, roten Akzenten, Statistik-Graphen. Das Dashboard zeigt den Text 'WERBUNG DIE KNALLT.' prominent.

BELEUCHTUNG: Cinematisches Drei-Punkt-Licht. Hauptlicht von links oben, Fülllicht von rechts, Randlicht für Tiefe. Subtiler Glow um den Laptop-Bildschirm.

TEXT IM BILD (KRITISCH - MUSS GERENDERT WERDEN):
- Am unteren Bildrand: 'Erstelle Ads die konvertieren' in großer, fetter, weißer Schrift (ca. 48px). Der Text hat einen leichten Schatten für bessere Lesbarkeit.
- Darunter in kleinerer Schrift: 'In nur 2 Minuten' in weiß mit 80% Opacity
- CTA-Button: Roter Pill-Button mit dem Text 'Jetzt starten' in weißer Schrift

QUALITÄT: Magazin-Cover-Niveau, fotorealistisch, perfekte Schärfe."

=== DEIN OUTPUT (JSON) ===
{
    "reasoning": "Deine komplette Gedankenkette (min. 200 Wörter)...",
    "creativeConcept": "Das Konzept in einem Satz",
    "sceneDescription": "Detaillierte Szenen-Beschreibung",
    "productDescription": "EXAKTE Beschreibung des Produkts basierend auf der Analyse - wird in imagePrompt verwendet",
    "productIntegration": {
        "method": "device_mockup|centered|lifestyle|floating",
        "device": "macbook|ipad|iphone|none",
        "effects": ["glow", "sparkles", "reflection", "bokeh", "light_rays"],
        "sceneElements": ["Was ist noch in der Szene? Tisch, Pflanzen, etc."]
    },
    "productBounds": {
        "x": 0.15,
        "y": 0.10,
        "width": 0.70,
        "height": 0.50,
        "reasoning": "Warum diese Position?"
    },
    "textConfig": {
        "headline": { "text": "...", "position": "bottom" },
        "subheadline": { "text": "..." },
        "cta": { "text": "...", "backgroundColor": "#FF4444" }
    },
    "imagePrompt": "ULTRA-DETAILLIERTER PROMPT (min. 250 Wörter). MUSS ENTHALTEN: 1) Vollständige Szene mit Atmosphäre 2) Das Produkt EXAKT wie analysiert, natürlich in der Szene 3) TEXT IM BILD: Headline, Subheadline, CTA-Button - mit exakten Texten! 4) Professionelle Beleuchtung und Qualität",
    "colorScheme": { "background": "#hex", "accent": "#hex", "text": "#FFFFFF" },
    "moodKeywords": ["keyword1", "keyword2", "keyword3"]
}`
            }, {
                role: 'user',
                content: `=== PRODUKT-ANALYSE (GPT-4V) ===
${JSON.stringify(analysis, null, 2)}

=== USER'S KREATIVE VISION ===
"${userPrompt}"

=== TEXT-ELEMENTE FÜR DIE AD ===
- Headline: "${headline || 'Schlage eine passende Headline vor'}"
- Subheadline: "${subheadline || ''}"
- CTA: "${cta || 'Jetzt entdecken'}"

=== DEINE AUFGABE ===
1. Entwickle die PERFEKTE Creative-Strategie
2. Der imagePrompt MUSS das Produkt VOLLSTÄNDIG BESCHREIBEN (basierend auf der Analyse)
3. Der imagePrompt MUSS die Text-Elemente ENTHALTEN - sie werden DIREKT von der KI gerendert
4. Das Ergebnis muss eine FERTIGE, PROFESSIONELLE Meta Ad sein`
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

    // Build product description from analysis
    const productDesc = analysis.productName
        ? `${analysis.productName} - ${analysis.productType || 'premium product'}`
        : 'premium product';

    return {
        reasoning: "Fallback: Using premium default strategy with NATIVE text rendering",
        creativeConcept: "Premium product showcase with integrated text and clear call-to-action",
        sceneDescription: `Premium advertisement featuring ${productDesc} in an elegant setting with professional typography`,
        productDescription: productDesc,
        productIntegration: {
            method: analysis.isScreenContent ? 'device_mockup' : 'centered',
            device: analysis.isScreenContent ? 'macbook' : 'none',
            position: 'center',
            scale: 0.6,
            effects: ['glow', 'reflection'],
            sceneElements: ['elegant dark background', 'subtle lighting']
        },
        textConfig: {
            headline: { text: headlineText, position: 'bottom', fontSize: 'large', color: '#FFFFFF', shadow: true },
            subheadline: { text: subheadlineText, fontSize: 'medium', color: 'rgba(255,255,255,0.85)' },
            cta: { text: ctaText, backgroundColor: '#FF4444', position: 'bottom' }
        },
        imagePrompt: `ULTRA-PREMIUM META AD (1080x1080px):

SZENE: Eleganter dunkler Hintergrund mit subtilen Lichteffekten. Professionelle Studio-Beleuchtung mit cinematischem Drei-Punkt-Licht.

PRODUKT: ${analysis.isScreenContent
                ? `Ein schlankes MacBook Pro Space Black steht zentral im Bild. Der Bildschirm zeigt ${productDesc} mit professionellem Interface-Design.`
                : `${productDesc} steht zentral im Bild, perfekt ausgeleuchtet mit subtilen Reflexionen und Schatten.`
            }

BELEUCHTUNG: Hauptlicht von links oben (45 Grad), Fülllicht von rechts, Randlicht für Tiefe. Subtiler Glow um das Produkt.

TEXT IM BILD (KRITISCH - MUSS GERENDERT WERDEN!):
- Am unteren Bildrand in großer, fetter, weißer Schrift: "${headlineText}"
- Leichter Text-Schatten für bessere Lesbarkeit auf jedem Hintergrund
${subheadlineText ? `- Darunter in kleinerer weißer Schrift (80% Opacity): "${subheadlineText}"` : ''}
- CTA-Button: Roter Pill-Button (#FF4444) mit weißem Text: "${ctaText}"

QUALITÄT: Magazin-Cover-Niveau. Jedes Detail perfekt. $10,000 Agentur-Qualität.
Der Text muss SCHARF und PERFEKT LESBAR sein - keine verschwommenen Buchstaben!`,
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
        // STAGE-BASED GENERATION:
        // 1. AI generates scene with EMPTY placeholder for product
        // 2. Real product image is composited with professional effects
        // ============================================================
        console.log('[CreativeDirector] 🎨 Generating STAGE scene for product integration...');

        const productIntegration = strategy.productIntegration || {};
        const productMethod = productIntegration.method || 'centered';
        const textConfig = strategy.textConfig || {};

        // Build stage-focused prompt (scene prepared FOR the product, not WITH the product)
        let stagePrompt = currentPrompt;

        // For device mockups: Generate device with BLANK/BLACK screen
        if (productMethod === 'device_mockup') {
            stagePrompt = `ULTRA-PREMIUM META AD SCENE (1080x1080px):

SZENE UND DEVICE:
- Eleganter dunkler Hintergrund mit professioneller Studio-Beleuchtung
- Ein schlankes MacBook Pro Space Black steht leicht angewinkelt in der Mitte-Oben des Bildes
- DER BILDSCHIRM IST KOMPLETT SCHWARZ/DUNKEL (wird später befüllt!)
- KEINE Inhalte auf dem Bildschirm generieren - nur schwarzer Screen!
- Cinematische Beleuchtung: Hauptlicht von links, subtiler Glow um das Device
- Reflexionen auf der Laptop-Oberfläche, professionelle Schatten

BELEUCHTUNG:
- Drei-Punkt-Beleuchtung für professionellen Look
- Subtile farbige Akzente (Rot/Türkis) im Hintergrund als Lichtquellen
- Der Bildschirm-Bereich sollte einen leichten Glow haben als ob er leuchtet

TEXT IM BILD (KRITISCH - AM UNTEREN RAND):
${textConfig.headline?.text ? `- Headline: "${textConfig.headline.text}" - Große, fette, weiße Schrift mit Text-Schatten` : ''}
${textConfig.subheadline?.text ? `- Subheadline: "${textConfig.subheadline.text}" - Kleinere weiße Schrift` : ''}
${textConfig.cta?.text ? `- CTA-Button: Roter Pill-Button (#FF4444) mit "${textConfig.cta.text}" in weißer Schrift` : ''}

WICHTIG:
- Der MacBook-Bildschirm muss KOMPLETT SCHWARZ sein (kein UI, keine Inhalte!)
- Text muss SCHARF und LESBAR sein - keine verschwommenen Buchstaben!
- Qualität: $10,000 Agentur-Level, Magazin-Cover
- Das Layout muss Platz für das Produkt im oberen Bereich und Text im unteren Bereich haben`;
        } else {
            // For physical products: Generate scene with empty central area
            stagePrompt = `ULTRA-PREMIUM META AD SCENE (1080x1080px):

SZENE (BÜHNE FÜR PRODUKT):
- Eleganter, dunkler Hintergrund mit professioneller Studio-Beleuchtung
- ZENTRALE ZONE (40-60% des Bildes): Muss LEER/DUNKEL sein für spätere Produkt-Integration
- Subtile Lichteffekte und Bokeh im Hintergrund
- Cinematische Beleuchtung von oben-links
- Eine reflektierende Oberfläche unten (z.B. polierter Tisch) für Produktschatten

BELEUCHTUNG:
- Professionelle Drei-Punkt-Beleuchtung
- Spotlight auf die zentrale Zone gerichtet
- Farbige Akzente im Hintergrund (passend zum Produkt)

TEXT IM BILD (AM UNTEREN RAND - MUSS GENERIERT WERDEN!):
${textConfig.headline?.text ? `- Headline: "${textConfig.headline.text}" - Große, fette, weiße Schrift mit Schatten` : ''}
${textConfig.subheadline?.text ? `- Subheadline: "${textConfig.subheadline.text}" - Kleinere weiße Schrift` : ''}
${textConfig.cta?.text ? `- CTA-Button: Roter Pill-Button (#FF4444) mit "${textConfig.cta.text}"` : ''}

WICHTIG:
- Die zentrale Zone MUSS leer bleiben (dort wird später das Produkt eingefügt)
- Text am unteren Rand muss SCHARF und LESBAR sein
- Qualität: Agentur-Level, perfekte Komposition`;
        }

        // Generate the stage scene
        const imageResult = await generateHeroImage({
            prompt: stagePrompt,
            size: '1024x1024',
            quality: 'high'
        });

        let sceneBuffer = Buffer.from(imageResult.b64, 'base64');
        console.log('[CreativeDirector] ✓ Stage scene generated');

        // Composite the REAL product into the prepared stage
        if (productMethod === 'device_mockup') {
            console.log('[CreativeDirector] 🖥️ Compositing screenshot into device screen...');
            integratedBuffer = await compositeIntoDevice(sceneBuffer, productBuffer, {
                ...productIntegration,
                accentColor: strategy.colorScheme?.accent || '#FF4444'
            }, strategy.productBounds);
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

        // Quality verification
        console.log('[CreativeDirector] Running quality verification...');
        qualityResult = await verifyAdQuality(openai, resizedBuffer, strategy);

        // ALWAYS apply SVG text overlay for guaranteed legibility
        // AI-rendered text is often unreadable, so we ensure text is always visible
        console.log('[CreativeDirector] 🔤 Applying reliable SVG text overlay...');
        // SVG overlay DISABLED - using AI-rendered text instead
        console.log('[CreativeDirector] ✓ Using Gemini-rendered text (no SVG overlay)');

        // Quality gate with higher threshold (8) for Elite-level ads
        if (passesQualityGate(qualityResult, 8)) {
            console.log(`[CreativeDirector] ✅ Quality passed: ${qualityResult.overallScore}/10`);
            finalBuffer = resizedBuffer;
            break;
        } else {
            console.log(`[CreativeDirector] ⚠️ Quality score ${qualityResult.overallScore}/10 - below threshold (8)`);
            if (attempt === MAX_QUALITY_RETRIES) {
                console.log('[CreativeDirector] Max retries reached, using best result');
                finalBuffer = resizedBuffer;
            }
        }
    }

    return finalBuffer;
}


/**
 * PROFESSIONAL COMPOSITING SYSTEM
 * Makes product look NATIVE to the AI-generated scene
 */

/**
 * Composite product into device (MacBook, iPad, iPhone)
 * NOW WITH PROFESSIONAL EFFECTS: Shadows, Glow, Screen Light Bleed
 */
async function compositeIntoDevice(sceneBuffer, productBuffer, integration, productBounds) {
    const meta = await sharp(sceneBuffer).metadata();
    const accentColor = integration.accentColor || '#FF4444';

    // Use AI-determined bounds if provided, otherwise fallback to device defaults
    let screenX, screenY, screenW, screenH;

    if (productBounds && productBounds.x !== undefined) {
        console.log(`[CreativeDirector] Using AI-determined device bounds: ${productBounds.reasoning || 'custom'}`);
        screenX = Math.round(meta.width * productBounds.x);
        screenY = Math.round(meta.height * productBounds.y);
        screenW = Math.round(meta.width * productBounds.width);
        screenH = Math.round(meta.height * productBounds.height);
    } else {
        const deviceFrames = {
            macbook: { x: 0.12, y: 0.12, width: 0.76, height: 0.48 },
            ipad: { x: 0.15, y: 0.10, width: 0.70, height: 0.70 },
            iphone: { x: 0.30, y: 0.08, width: 0.40, height: 0.75 }
        };
        const frame = deviceFrames[integration.device] || deviceFrames.macbook;
        screenX = Math.round(meta.width * frame.x);
        screenY = Math.round(meta.height * frame.y);
        screenW = Math.round(meta.width * frame.width);
        screenH = Math.round(meta.height * frame.height);
    }

    // Resize product to fit screen
    const resizedProduct = await sharp(productBuffer)
        .resize(screenW, screenH, { fit: 'cover' })
        .png()
        .toBuffer();

    // Create screen glow effect (light bleeding from screen)
    const screenGlowSvg = `
    <svg width="${meta.width}" height="${meta.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <filter id="screenGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="30" result="blur"/>
                <feMerge>
                    <feMergeNode in="blur"/>
                </feMerge>
            </filter>
            <linearGradient id="screenLight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:${accentColor};stop-opacity:0.15"/>
                <stop offset="100%" style="stop-color:${accentColor};stop-opacity:0"/>
            </linearGradient>
        </defs>
        <!-- Screen light bleed -->
        <rect x="${screenX - 20}" y="${screenY - 20}" width="${screenW + 40}" height="${screenH + 40}" 
              fill="url(#screenLight)" filter="url(#screenGlow)" opacity="0.6"/>
    </svg>`;

    // Composite with glow effect
    return sharp(sceneBuffer)
        .composite([
            // First: Screen glow (light bleeding from device)
            { input: Buffer.from(screenGlowSvg), blend: 'screen' },
            // Then: The actual product/screenshot
            { input: resizedProduct, left: screenX, top: screenY }
        ])
        .png()
        .toBuffer();
}

/**
 * Composite product into scene with PROFESSIONAL EFFECTS
 * Adds: Soft shadow, ambient glow, subtle reflection
 */
async function compositeProduct(sceneBuffer, productBuffer, integration, productBounds) {
    const meta = await sharp(sceneBuffer).metadata();
    const accentColor = integration.accentColor || '#FF4444';

    let productX, productY, productW, productH;

    if (productBounds && productBounds.x !== undefined) {
        console.log(`[CreativeDirector] Using AI-determined product bounds: ${productBounds.reasoning || 'custom'}`);
        productX = Math.round(meta.width * productBounds.x);
        productY = Math.round(meta.height * productBounds.y);
        productW = Math.round(meta.width * productBounds.width);
        productH = Math.round(meta.height * productBounds.height);
    } else {
        const scale = 0.55;
        productW = Math.round(meta.width * scale);
        productH = Math.round(meta.height * scale);
        productX = Math.round((meta.width - productW) / 2);
        productY = Math.round((meta.height - productH) / 2) - 30;
    }

    // Resize product with contain to preserve aspect ratio
    const resizedProduct = await sharp(productBuffer)
        .resize(productW, productH, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();

    // Get actual dimensions after resize
    const productMeta = await sharp(resizedProduct).metadata();
    const actualW = productMeta.width;
    const actualH = productMeta.height;
    const actualX = productX + Math.round((productW - actualW) / 2);
    const actualY = productY + Math.round((productH - actualH) / 2);

    // Create professional shadow and glow effects
    const shadowGlowSvg = `
    <svg width="${meta.width}" height="${meta.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <!-- Soft drop shadow -->
            <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="15" stdDeviation="25" flood-color="rgba(0,0,0,0.5)"/>
            </filter>
            <!-- Ambient glow -->
            <radialGradient id="ambientGlow" cx="50%" cy="50%" r="60%">
                <stop offset="0%" style="stop-color:${accentColor};stop-opacity:0.2"/>
                <stop offset="100%" style="stop-color:${accentColor};stop-opacity:0"/>
            </radialGradient>
            <!-- Bottom reflection gradient -->
            <linearGradient id="reflection" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:white;stop-opacity:0"/>
                <stop offset="70%" style="stop-color:white;stop-opacity:0"/>
                <stop offset="100%" style="stop-color:white;stop-opacity:0.08"/>
            </linearGradient>
        </defs>
        
        <!-- Ambient glow behind product -->
        <ellipse cx="${actualX + actualW / 2}" cy="${actualY + actualH / 2}" 
                 rx="${actualW * 0.6}" ry="${actualH * 0.5}" 
                 fill="url(#ambientGlow)"/>
        
        <!-- Drop shadow (positioned below product) -->
        <ellipse cx="${actualX + actualW / 2}" cy="${actualY + actualH + 20}" 
                 rx="${actualW * 0.4}" ry="20" 
                 fill="rgba(0,0,0,0.3)" filter="url(#dropShadow)"/>
        
        <!-- Subtle reflection on surface -->
        <rect x="${actualX}" y="${actualY + actualH}" 
              width="${actualW}" height="60" 
              fill="url(#reflection)" opacity="0.5"/>
    </svg>`;

    // Composite with shadow and glow
    return sharp(sceneBuffer)
        .composite([
            // First: Shadow and ambient glow (behind product)
            { input: Buffer.from(shadowGlowSvg), blend: 'over' },
            // Then: The actual product
            { input: resizedProduct, left: actualX, top: actualY }
        ])
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
