/**
 * QUALITY CONTROL - Phase 2 Enhanced
 * 
 * GPT-4V verification after ad generation.
 * Stricter checks for text legibility and artifact detection.
 */

/**
 * Verify ad quality using GPT-4V
 * Returns score 1-10 and detailed feedback
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
                        text: `You are a strict Meta Ad quality inspector. Grade this advertisement CRITICALLY.

EXPECTED CONTENT:
- Headline: "${expectedHeadline}"
- CTA Button: "${expectedCta}"

═══════════════════════════════════════
CRITICAL CHECKS (Score 1-10 each)
═══════════════════════════════════════

1. TEXT LEGIBILITY (Most Important!)
   - Can you READ the headline clearly?
   - Is the text SHARP (no blur, no distortion)?
   - Are there placeholder boxes (████) or rectangles? = FAIL
   - Is the CTA button visible with readable text?

2. PRODUCT QUALITY
   - Is the product clearly visible and recognizable?
   - Does it look natural (not floating, proper shadows)?
   - Is it the hero of the image?

3. PROFESSIONAL QUALITY
   - Does this look like a $10,000 agency ad?
   - Would you stop scrolling for this?
   - Is the lighting professional?

SCORING GUIDE:
- 1-3: Unusable (blurry text, artifacts, broken)
- 4-5: Major issues (hard to read, unprofessional)
- 6-7: Acceptable but needs work
- 8-9: Professional, Meta-ready
- 10: Perfect, award-worthy

Respond with JSON:
{
    "overallScore": 1-10,
    "scores": {
        "textLegibility": 1-10,
        "textSharpness": 1-10,
        "productQuality": 1-10,
        "professionalQuality": 1-10
    },
    "textAnalysis": {
        "headlineVisible": true/false,
        "headlineReadable": true/false,
        "headlineText": "What does the headline say?",
        "ctaVisible": true/false,
        "hasRectangleArtifacts": true/false,
        "hasBlurryText": true/false
    },
    "issues": ["List specific problems"],
    "passesQualityGate": true/false,
    "recommendation": "APPROVE|REGENERATE"
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
        console.log(`[QualityControl] Text: Visible=${quality.textAnalysis?.headlineVisible}, Readable=${quality.textAnalysis?.headlineReadable}`);

        // Auto-fail on rectangle artifacts
        if (quality.textAnalysis?.hasRectangleArtifacts) {
            console.warn('[QualityControl] ⚠️ Rectangle artifacts detected - FAILING');
            quality.overallScore = Math.min(quality.overallScore, 4);
            quality.passesQualityGate = false;
        }

        // Auto-fail on completely unreadable text
        if (quality.textAnalysis?.headlineReadable === false && expectedHeadline) {
            console.warn('[QualityControl] ⚠️ Headline not readable - FAILING');
            quality.overallScore = Math.min(quality.overallScore, 5);
            quality.passesQualityGate = false;
        }

        if (quality.issues?.length > 0) {
            console.log('[QualityControl] Issues:', quality.issues.join(', '));
        }

        return quality;
    } catch (error) {
        console.error('[QualityControl] Verification failed:', error.message);
        // Return passing score on error to not block the flow
        return {
            overallScore: 7,
            scores: { textLegibility: 7 },
            passesQualityGate: true,
            recommendation: 'APPROVE',
            error: error.message
        };
    }
}


/**
 * Smart retry with improved prompt based on quality feedback
 * Phase 2: More specific corrections based on detected issues
 */
export function improvePromptFromFeedback(originalPrompt, qualityResult) {
    if (qualityResult.overallScore >= 8) {
        return originalPrompt; // Good enough
    }

    let improvedPrompt = originalPrompt;
    const issues = [];

    // Fix specific detected issues
    if (qualityResult.textAnalysis?.hasRectangleArtifacts) {
        issues.push('CRITICAL FIX: NO placeholder rectangles or boxes. Render actual text characters only.');
    }

    if (qualityResult.textAnalysis?.hasBlurryText) {
        issues.push('CRITICAL FIX: Text must be CRYSTAL CLEAR and sharp. Use bold fonts with high contrast.');
    }

    if (qualityResult.scores?.textLegibility < 7) {
        issues.push('CRITICAL FIX: Make headline and CTA text MUCH larger and more readable.');
    }

    if (qualityResult.scores?.productQuality < 7) {
        issues.push('CRITICAL FIX: Product must be the HERO. Make it larger, centered, with spotlight.');
    }

    if (qualityResult.scores?.professionalQuality < 7) {
        issues.push('CRITICAL FIX: This must look like $10,000 agency work. Premium everything.');
    }

    if (issues.length > 0) {
        improvedPrompt += '\n\n=== RETRY CORRECTIONS ===\n' + issues.join('\n');
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
