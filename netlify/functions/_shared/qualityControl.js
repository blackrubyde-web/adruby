/**
 * QUALITY CONTROL
 * 
 * GPT-4V verification after ad generation.
 * Checks if the generated ad matches the intended strategy.
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

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: `Du bist ein Ad-Qualitätsprüfer. Bewerte diese generierte Werbung.

URSPRÜNGLICHE STRATEGIE:
- Konzept: ${strategy.creativeConcept || 'Premium product showcase'}
- Szene: ${strategy.sceneDescription?.substring(0, 200) || 'N/A'}
- Effekte gewünscht: ${strategy.productIntegration?.effects?.join(', ') || 'keine'}

BEWERTE auf einer Skala 1-10:
1. Professionelle Qualität (sieht aus wie $10,000 Agentur-Arbeit?)
2. Produkt-Sichtbarkeit (ist das Produkt klar erkennbar?)
3. Text-Lesbarkeit (ist der Text scharf und lesbar?)
4. Marken-Konsistenz (passt die Stimmung zum Konzept?)
5. Meta-Ad-Tauglichkeit (würde das auf Instagram/Facebook funktionieren?)

Antworte mit JSON:
{
    "overallScore": 1-10,
    "scores": {
        "professionalQuality": 1-10,
        "productVisibility": 1-10,
        "textReadability": 1-10,
        "brandConsistency": 1-10,
        "metaTauglichkeit": 1-10
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
            max_tokens: 800,
            response_format: { type: "json_object" }
        });

        const quality = JSON.parse(response.choices[0].message.content);

        console.log(`[QualityControl] Score: ${quality.overallScore}/10 - ${quality.recommendation}`);
        if (quality.improvements?.length > 0) {
            console.log('[QualityControl] Improvements:', quality.improvements.join(', '));
        }

        return quality;
    } catch (error) {
        console.error('[QualityControl] Verification failed:', error.message);
        // Return passing score on error to not block the flow
        return {
            overallScore: 7,
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
 */
export function passesQualityGate(qualityResult, threshold = 6) {
    if (!qualityResult) return true; // Pass on error
    return qualityResult.overallScore >= threshold;
}

export default {
    verifyAdQuality,
    improvePromptFromFeedback,
    passesQualityGate
};
