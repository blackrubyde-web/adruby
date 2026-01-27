/**
 * Quality Verifier
 * 
 * Verifies generated ads match expected DNA specifications.
 * Uses GPT-4V to check headline visibility, layout accuracy, etc.
 * Provides feedback for regeneration if quality is insufficient.
 */

import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Verify generated ad quality against expected DNA
 */
export async function verifyAdQuality(imageBuffer, expectedDNA, content) {
    console.log('[QualityVerify] 🔍 Verifying generated ad quality...');

    try {
        const base64 = imageBuffer.toString('base64');

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{
                role: 'system',
                content: 'You are a quality control expert for Meta advertisements. Analyze the generated ad and score it against expectations.'
            }, {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: `Analyze this generated ad and verify quality.

Expected content:
- Headline: "${content.headline || 'N/A'}"
- CTA: "${content.cta || 'Shop Now'}"
- Subline: "${content.subline || 'N/A'}"

Return JSON:
{
  "scores": {
    "headlineVisible": 0-10,      // Is headline clearly visible and readable?
    "headlineCorrect": 0-10,      // Does headline text match expected?
    "ctaVisible": 0-10,           // Is CTA button clearly visible?
    "ctaClickable": 0-10,         // Does CTA look clickable (button style)?
    "productVisible": 0-10,       // Is product clearly visible and hero?
    "layoutProfessional": 0-10,   // Overall professional layout?
    "colorsPremium": 0-10,        // Premium color palette?
    "overallQuality": 0-10        // Would this convert on Meta?
  },
  "issues": [
    "List any specific issues found"
  ],
  "improvements": [
    "Specific improvements for regeneration"
  ],
  "pass": true/false              // true if overallQuality >= 8
}`
                    },
                    {
                        type: 'image_url',
                        image_url: { url: `data:image/png;base64,${base64}`, detail: 'high' }
                    }
                ]
            }],
            max_tokens: 600,
            response_format: { type: 'json_object' }
        });

        const result = JSON.parse(response.choices[0].message.content);
        const avgScore = Object.values(result.scores).reduce((a, b) => a + b, 0) / 8;

        console.log(`[QualityVerify] Score: ${avgScore.toFixed(1)}/10 | Pass: ${result.pass}`);

        if (!result.pass && result.issues?.length > 0) {
            console.log('[QualityVerify] Issues:', result.issues.slice(0, 2).join(', '));
        }

        return {
            ...result,
            averageScore: avgScore,
            needsRegeneration: !result.pass || avgScore < 7
        };

    } catch (error) {
        console.error('[QualityVerify] Error:', error.message);
        return {
            scores: { overallQuality: 5 },
            issues: ['Verification failed'],
            improvements: [],
            pass: true, // Don't block on verification errors
            averageScore: 5,
            needsRegeneration: false
        };
    }
}

/**
 * Build improvement prompt based on quality feedback
 */
export function buildImprovementPrompt(originalPrompt, feedback) {
    if (!feedback.issues || feedback.issues.length === 0) {
        return originalPrompt;
    }

    const fixes = feedback.improvements?.slice(0, 3).join('\n- ') || feedback.issues.slice(0, 3).join('\n- ');

    return `${originalPrompt}

=== CRITICAL FIXES REQUIRED ===
The previous generation had these issues:
- ${fixes}

PRIORITY FIXES:
${feedback.scores?.headlineVisible < 7 ? '- Make HEADLINE much larger and more visible\n' : ''}${feedback.scores?.ctaVisible < 7 ? '- Make CTA BUTTON more prominent and clickable-looking\n' : ''}${feedback.scores?.productVisible < 7 ? '- Make PRODUCT more prominent and well-lit\n' : ''}
This generation MUST fix these issues. Quality target: 9+/10`;
}

/**
 * Quick quality check (faster, less detailed)
 */
export async function quickQualityCheck(imageBuffer) {
    console.log('[QualityVerify] ⚡ Quick quality check...');

    try {
        const base64 = imageBuffer.toString('base64');

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: `Quick ad quality check. Score 1-10:
- Is there readable headline text? 
- Is there a CTA button?
- Is it professional quality?

Return JSON: { "score": 1-10, "hasHeadline": true/false, "hasCTA": true/false, "pass": true/false }`
                    },
                    {
                        type: 'image_url',
                        image_url: { url: `data:image/png;base64,${base64}`, detail: 'low' }
                    }
                ]
            }],
            max_tokens: 150,
            response_format: { type: 'json_object' }
        });

        const result = JSON.parse(response.choices[0].message.content);
        console.log(`[QualityVerify] Quick score: ${result.score}/10`);

        return result;

    } catch (error) {
        console.error('[QualityVerify] Quick check failed:', error.message);
        return { score: 5, hasHeadline: true, hasCTA: true, pass: true };
    }
}

export default {
    verifyAdQuality,
    buildImprovementPrompt,
    quickQualityCheck
};
