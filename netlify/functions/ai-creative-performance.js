// netlify/functions/ai-creative-performance.js
// GPT-4o Vision-powered Creative Performance Analysis
// Analyzes ad creatives for visual composition, color harmony, text clarity, hook strength, and CTA visibility

import OpenAI from 'openai';
import { requireUserId } from './_shared/auth.js';
import { badRequest, methodNotAllowed, ok, serverError, withCors } from './utils/response.js';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const ANALYSIS_PROMPT = `Du bist ein Elite Creative Director und Performance Marketing Experte.
Analysiere dieses Werbebild und bewerte es anhand dieser Kriterien (1-10 Skala):

1. **Visual Composition** - Layout-Balance, Fokuspunkt, Weißraum
2. **Color Harmony** - Farbpalette, Kontrast, Markenpassung
3. **Text Clarity** - Lesbarkeit, Schriftgröße, Text-zu-Bild Verhältnis
4. **Hook Strength** - Aufmerksamkeitswert in ersten 3 Sekunden
5. **CTA Visibility** - Call-to-Action Klarheit und Prominenz

Zusätzlich analysiere:
- **Zielgruppen-Fit**: Für welche Zielgruppe optimal?
- **Plattform-Fit**: Optimal für Feed/Story/Reel?
- **Emotionaler Appeal**: Welche Emotion wird ausgelöst?

WICHTIG: Basiere auf den mitgelieferten Performance-Metriken (falls vorhanden):
- Hohe CTR = Visual/Hook funktioniert
- Niedrige CTR = Verbesserungspotenzial identifizieren
- Hoher ROAS = Overall Creative performt

Antworte NUR als JSON:
{
  "scores": {
    "visualComposition": { "score": 1-10, "feedback": "kurze Begründung" },
    "colorHarmony": { "score": 1-10, "feedback": "kurze Begründung" },
    "textClarity": { "score": 1-10, "feedback": "kurze Begründung" },
    "hookStrength": { "score": 1-10, "feedback": "kurze Begründung" },
    "ctaVisibility": { "score": 1-10, "feedback": "kurze Begründung" }
  },
  "overallScore": 1-100,
  "grade": "A+" | "A" | "B" | "C" | "D" | "F",
  "targetAudience": "Beschreibung",
  "platformFit": ["feed", "story", "reel"],
  "emotionalAppeal": "primäre Emotion",
  "strengths": ["Stärke 1", "Stärke 2"],
  "improvements": [
    { "area": "Bereich", "suggestion": "Konkrete Verbesserung", "priority": "high" | "medium" | "low" }
  ],
  "predictedPerformance": {
    "ctrPotential": "high" | "medium" | "low",
    "roasPotential": "high" | "medium" | "low",
    "fatigueRisk": "low" | "medium" | "high"
  }
}`;

export async function handler(event) {
    if (event.httpMethod === 'OPTIONS') {
        return withCors({ statusCode: 204, body: '' });
    }

    if (event.httpMethod !== 'POST') {
        return methodNotAllowed('POST,OPTIONS');
    }

    try {
        const auth = await requireUserId(event);
        if (!auth.ok) return auth.response;

        let body;
        try {
            body = JSON.parse(event.body);
        } catch {
            return badRequest('Invalid JSON body');
        }

        const { imageUrl, metrics, adName } = body;

        if (!imageUrl) {
            return badRequest('Missing imageUrl');
        }

        if (!process.env.OPENAI_API_KEY) {
            // Fallback: Return mock analysis
            return ok({
                success: true,
                source: 'fallback',
                analysis: generateFallbackAnalysis(metrics)
            });
        }

        // Build context from metrics
        let metricsContext = '';
        if (metrics) {
            metricsContext = `\n\nPerformance-Metriken dieser Ad:
- CTR: ${metrics.ctr?.toFixed(2) || 'N/A'}%
- ROAS: ${metrics.roas?.toFixed(2) || 'N/A'}x
- Impressions: ${metrics.impressions?.toLocaleString() || 'N/A'}
- Conversions: ${metrics.conversions || 'N/A'}
- Spend: €${metrics.spend?.toFixed(2) || 'N/A'}`;
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: ANALYSIS_PROMPT },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `Analysiere dieses Werbebild${adName ? ` für "${adName}"` : ''}.${metricsContext}`
                        },
                        { type: 'image_url', image_url: { url: imageUrl } }
                    ]
                }
            ],
            max_tokens: 1500,
            temperature: 0.3,
            response_format: { type: 'json_object' }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No response from OpenAI');
        }

        const analysis = JSON.parse(content);

        return ok({
            success: true,
            source: 'gpt-4o',
            analysis,
            imageUrl,
            adName: adName || null,
            analyzedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('[ai-creative-performance] Error:', error);

        // Return fallback on error
        if (error.message?.includes('rate limit') || error.status === 429) {
            return ok({
                success: true,
                source: 'fallback',
                analysis: generateFallbackAnalysis(null),
                error: 'Rate limited, using fallback analysis'
            });
        }

        return serverError(error.message || 'Creative analysis failed');
    }
}

function generateFallbackAnalysis(metrics) {
    const baseScore = metrics?.roas > 3 ? 75 : metrics?.roas > 1.5 ? 60 : 45;
    const ctrBonus = metrics?.ctr > 2 ? 10 : metrics?.ctr > 1 ? 5 : 0;
    const overallScore = Math.min(100, baseScore + ctrBonus);

    const grade = overallScore >= 90 ? 'A+' : overallScore >= 80 ? 'A' : overallScore >= 70 ? 'B' : overallScore >= 60 ? 'C' : 'D';

    return {
        scores: {
            visualComposition: { score: Math.round(overallScore / 10), feedback: 'Automatische Bewertung basierend auf Performance' },
            colorHarmony: { score: Math.round(overallScore / 10), feedback: 'Automatische Bewertung basierend auf Performance' },
            textClarity: { score: Math.round(overallScore / 10), feedback: 'Automatische Bewertung basierend auf Performance' },
            hookStrength: { score: metrics?.ctr > 2 ? 8 : metrics?.ctr > 1 ? 6 : 4, feedback: `CTR-basierte Bewertung: ${metrics?.ctr?.toFixed(2) || 'N/A'}%` },
            ctaVisibility: { score: metrics?.conversions > 10 ? 8 : 5, feedback: 'Conversion-basierte Bewertung' }
        },
        overallScore,
        grade,
        targetAudience: 'Breite Zielgruppe (automatisch geschätzt)',
        platformFit: ['feed'],
        emotionalAppeal: 'Neutral',
        strengths: metrics?.roas > 2 ? ['Gute Conversion-Rate', 'Profitabler ROAS'] : ['Potenzial für Optimierung'],
        improvements: [
            { area: 'Creative', suggestion: 'A/B Test mit neuen Varianten empfohlen', priority: 'medium' }
        ],
        predictedPerformance: {
            ctrPotential: metrics?.ctr > 2 ? 'high' : 'medium',
            roasPotential: metrics?.roas > 3 ? 'high' : 'medium',
            fatigueRisk: 'medium'
        },
        isFallback: true
    };
}
