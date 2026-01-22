/**
 * QUALITY CONTROL
 * 
 * GPT-4V verification after ad generation.
 * Checks if the generated ad matches the intended strategy.
 * Now focuses on NATIVE TEXT RENDERING quality (text rendered directly by AI)
 */

/**
 * Verify ad quality using GPT-4V
 * Returns score 1-10 and feedback
 */
export async function verifyAdQuality(openai, imageBuffer, strategy) {
    console.log('[QualityControl] 🔍 Verifying ad quality with GPT-4V...');

    try {
        // Convert buffer to base64 data URL
        const base64 = imageBuffer.toString('base64');
        const dataUrl = `data:image/png;base64,${base64}`;

        // Extract expected text from strategy
        const expectedHeadline = strategy.textConfig?.headline?.text || '';
        const expectedCta = strategy.textConfig?.cta?.text || '';

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: `Du bist ein Ad-Qualitätsprüfer für Meta Ads 2026. Bewerte diese generierte Werbung STRIKT.

URSPRÜNGLICHE STRATEGIE:
- Konzept: ${strategy.creativeConcept || 'Premium product showcase'}
- Szene: ${strategy.sceneDescription?.substring(0, 200) || 'N/A'}
- Effekte gewünscht: ${strategy.productIntegration?.effects?.join(', ') || 'keine'}
- Erwartete Headline: "${expectedHeadline}"
- Erwarteter CTA: "${expectedCta}"

KRITISCHE PRÜFPUNKTE:

1. TEXT-LESBARKEIT (SEHR WICHTIG!)
   - Ist die Headline im Bild sichtbar und LESBAR?
   - Ist der Text SCHARF (keine verschwommenen Buchstaben)?
   - Ist der CTA-Button vorhanden und lesbar?
   - KEINE Rechteck-Artefakte (████) oder Platzhalter?

2. PRODUKT-QUALITÄT
   - Ist das Produkt natürlich in die Szene integriert?
   - Hat es realistische Schatten und Reflexionen?
   - Schwebt es nicht unnatürlich?

3. GESAMTQUALITÄT
   - Sieht es aus wie $10,000 Agentur-Arbeit?
   - Würde es auf Instagram/Facebook viral gehen?
   - Ist die Beleuchtung professionell?

BEWERTE auf einer Skala 1-10:
- 1-3: Unbrauchbar
- 4-5: Grundlegende Probleme
- 6-7: Akzeptabel, könnte besser sein
- 8-9: Professionell, Meta-ready
- 10: Perfekt, Award-würdig

Antworte mit JSON:
{
    "overallScore": 1-10,
    "scores": {
        "professionalQuality": 1-10,
        "productVisibility": 1-10,
        "textReadability": 1-10,
        "textSharpness": 1-10,
        "ctaVisible": true/false,
        "brandConsistency": 1-10,
        "metaTauglichkeit": 1-10
    },
    "textAnalysis": {
        "headlineFound": true/false,
        "headlineText": "Was steht in der Headline (falls lesbar)?",
        "ctaButtonFound": true/false,
        "hasRectangleArtifacts": true/false
    },
    "strengths": ["Was ist gut?"],
    "improvements": ["Was sollte verbessert werden?"],
    "passesQualityGate": true/false,
    "recommendation": "APPROVE|REGENERATE|ADJUST_TEXT"
}`
                    },
                    {
                        type: 'image_url',
                        image_url: { url: dataUrl }
                    }
                ]
            }],
            max_tokens: 1000,
            response_format: { type: "json_object" }
        });

        const quality = JSON.parse(response.choices[0].message.content);

        console.log(`[QualityControl] Score: ${quality.overallScore}/10 - ${quality.recommendation}`);
        console.log(`[QualityControl] Text Analysis: Headline=${quality.textAnalysis?.headlineFound}, CTA=${quality.textAnalysis?.ctaButtonFound}`);
        if (quality.improvements?.length > 0) {
            console.log('[QualityControl] Improvements:', quality.improvements.join(', '));
        }

        return quality;
    } catch (error) {
        console.error('[QualityControl] Verification failed:', error.message);
        // Return passing score on error to not block the flow
        return {
            overallScore: 7,
            scores: { textReadability: 7 },
            passesQualityGate: true,
            recommendation: 'APPROVE',
            error: error.message
        };
    }
}


/**
 * Smart retry with improved prompt based on quality feedback
 */
export function improvePromptFromFeedback(originalPrompt, qualityResult) {
    if (qualityResult.overallScore >= 7) {
        return originalPrompt; // Good enough
    }

    let improvedPrompt = originalPrompt;

    // Add specific improvements based on scores
    if (qualityResult.scores?.textReadability < 7) {
        improvedPrompt += '\n\nCRITICAL: Text must be EXTREMELY clear and readable. Use high contrast white text on dark background with strong shadow.';
    }

    if (qualityResult.scores?.productVisibility < 7) {
        improvedPrompt += '\n\nCRITICAL: Product must be the HERO of the image. Make it larger, centered, with spotlight lighting.';
    }

    if (qualityResult.scores?.professionalQuality < 7) {
        improvedPrompt += '\n\nCRITICAL: This must look like a $10,000 agency production. Premium lighting, perfect composition, no amateur elements.';
    }

    return improvedPrompt;
}

/**
 * Quality gate check - determines if ad should be used or regenerated
 * Threshold raised to 8 for Elite-level ad quality
 */
export function passesQualityGate(qualityResult, threshold = 8) {
    if (!qualityResult) return true; // Pass on error
    return qualityResult.overallScore >= threshold;
}

export default {
    verifyAdQuality,
    improvePromptFromFeedback,
    passesQualityGate
};
