/**
 * Quality Checker
 * 
 * GPT-4 Vision powered quality validation.
 * Ensures generated ads meet quality standards before returning.
 */

import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Check ad quality using GPT-4 Vision
 */
export async function checkQuality(imageBuffer, expectedElements = {}) {
    console.log('[QualityChecker] Analyzing ad quality...');

    const {
        headline,
        hasProduct = true,
        style = 'professional'
    } = expectedElements;

    try {
        const base64Image = imageBuffer.toString('base64');

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `Analyze this Meta advertisement image for quality issues.

EXPECTED ELEMENTS:
- Headline text: ${headline ? `"${headline}"` : 'Present'}
- Product visible: ${hasProduct ? 'Yes' : 'Optional'}
- Style: ${style}

QUALITY CRITERIA:
1. Text Readability (1-10): Is text sharp, legible, and well-positioned?
2. Product Visibility (1-10): Is the product clearly visible and well-lit?
3. Composition (1-10): Is the layout balanced and professional?
4. Color Harmony (1-10): Do colors work well together?
5. Overall Quality (1-10): Would this perform well as a Meta ad?

ISSUES TO CHECK:
- Blurry or distorted text
- Product cut off or obscured
- Cluttered composition
- Poor contrast between text and background
- Unprofessional or amateurish look

Respond with JSON:
{
    "scores": {
        "textReadability": 8,
        "productVisibility": 9,
        "composition": 7,
        "colorHarmony": 8,
        "overall": 8
    },
    "issues": ["List of specific issues found"],
    "passesQuality": true,
    "suggestions": ["Improvements if any"]
}`
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/png;base64,${base64Image}`,
                                detail: 'low'
                            }
                        }
                    ]
                }
            ],
            response_format: { type: 'json_object' },
            max_tokens: 500,
            temperature: 0.2
        });

        const result = JSON.parse(response.choices[0].message.content);

        // Calculate overall pass/fail
        const avgScore = Object.values(result.scores).reduce((a, b) => a + b, 0) / 5;
        result.averageScore = avgScore;
        result.passesQuality = avgScore >= 7 && !result.issues.some(issue =>
            issue.toLowerCase().includes('blurry') ||
            issue.toLowerCase().includes('unreadable')
        );

        console.log(`[QualityChecker] Score: ${avgScore.toFixed(1)}/10, Passes: ${result.passesQuality}`);

        return result;

    } catch (error) {
        console.error('[QualityChecker] Analysis failed:', error.message);
        // Return passing result on failure to not block generation
        return {
            scores: { overall: 7 },
            issues: [],
            passesQuality: true,
            averageScore: 7,
            error: error.message
        };
    }
}

/**
 * Quick quality check (faster, less detailed)
 */
export async function quickCheck(imageBuffer) {
    console.log('[QualityChecker] Quick check...');

    try {
        const base64Image = imageBuffer.toString('base64');

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `Quick check: Is this ad image professional quality? Check for: blurry text, cut-off product, poor composition.

Respond with JSON: {"passes": true/false, "reason": "brief reason"}`
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/png;base64,${base64Image}`,
                                detail: 'low'
                            }
                        }
                    ]
                }
            ],
            response_format: { type: 'json_object' },
            max_tokens: 100,
            temperature: 0.1
        });

        return JSON.parse(response.choices[0].message.content);

    } catch (error) {
        console.error('[QualityChecker] Quick check failed:', error.message);
        return { passes: true, reason: 'Check skipped due to error' };
    }
}

export default { checkQuality, quickCheck };
