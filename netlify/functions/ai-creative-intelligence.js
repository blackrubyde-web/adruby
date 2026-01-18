// netlify/functions/ai-creative-intelligence.js
// Enterprise-grade Creative Intelligence API
// Analyzes all creatives, identifies winners, detects fatigue, ranks hooks

import OpenAI from 'openai';
import { requireUserId } from './_shared/auth.js';
import { badRequest, methodNotAllowed, ok, serverError, withCors } from './utils/response.js';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const CREATIVE_INTELLIGENCE_PROMPT = `Du bist ein Elite Creative Strategist für Meta Ads bei einer Top-Agentur.
Analysiere diese Kampagnen-Creatives und liefere Enterprise-Level Insights.

ANALYSE-FRAMEWORK:

1. **WINNER/LOSER DETECTION**
   - Identifiziere klare Gewinner (ROAS > 3x, CTR > 2%)
   - Identifiziere Verlierer (ROAS < 1x)
   - Berechne statistische Signifikanz wenn möglich

2. **CREATIVE FATIGUE SCORE** (0-100)
   - 0-30: Frisch (< 7 Tage oder steigende Metriken)
   - 31-60: Normal (stabile Performance)
   - 61-80: Ermüdend (fallende CTR/ROAS)
   - 81-100: Ausgebrannt (deutlicher Decline)

3. **PATTERN ANALYSIS**
   - Welche visuellen Elemente korrelieren mit Performance?
   - Welche Hooks/Headlines performen am besten?
   - Welche CTAs konvertieren?

4. **NEXT ACTIONS**
   - Konkrete Empfehlungen für jedes Creative
   - Priorität: high/medium/low

Antworte als JSON:
{
  "summary": {
    "totalCreatives": number,
    "winners": number,
    "losers": number,
    "fatigued": number,
    "averageFatigueScore": number
  },
  "topPerformers": [
    {
      "id": "string",
      "name": "string",
      "roas": number,
      "ctr": number,
      "whyWinning": "string",
      "scaleRecommendation": "string"
    }
  ],
  "bottomPerformers": [
    {
      "id": "string",
      "name": "string",
      "roas": number,
      "ctr": number,
      "whyLosing": "string",
      "fixRecommendation": "string"
    }
  ],
  "fatigueAnalysis": [
    {
      "id": "string",
      "name": "string",
      "fatigueScore": number,
      "fatigueLevel": "fresh" | "normal" | "fatiguing" | "burned",
      "symptoms": ["string"],
      "daysUntilCritical": number | null,
      "refreshRecommendation": "string"
    }
  ],
  "patterns": {
    "winningElements": ["string"],
    "losingElements": ["string"],
    "hookRanking": [
      { "hook": "string", "avgRoas": number, "count": number }
    ]
  },
  "weeklyForecast": {
    "expectedRoas": number,
    "expectedSpend": number,
    "riskLevel": "low" | "medium" | "high",
    "topOpportunity": "string",
    "biggestRisk": "string"
  },
  "prioritizedActions": [
    {
      "priority": "high" | "medium" | "low",
      "action": "string",
      "expectedImpact": "string",
      "affectedCreatives": ["string"]
    }
  ]
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

        const { creatives, timeRange = '30d' } = body;

        if (!creatives || !Array.isArray(creatives) || creatives.length === 0) {
            return badRequest('Missing or empty creatives array');
        }

        // If no OpenAI key, use rule-based fallback
        if (!process.env.OPENAI_API_KEY) {
            return ok({
                success: true,
                source: 'fallback',
                intelligence: generateFallbackIntelligence(creatives)
            });
        }

        // Build context for GPT-4o
        const creativesContext = creatives.map(c => ({
            id: c.id,
            name: c.name,
            status: c.status,
            roas: c.roas,
            ctr: c.ctr,
            spend: c.spend,
            impressions: c.impressions,
            conversions: c.conversions,
            daysRunning: c.daysRunning || 7,
        }));

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: CREATIVE_INTELLIGENCE_PROMPT },
                {
                    role: 'user',
                    content: `Analysiere diese ${creatives.length} Creatives für den Zeitraum ${timeRange}:\n\n${JSON.stringify(creativesContext, null, 2)}`
                }
            ],
            max_tokens: 2000,
            temperature: 0.3,
            response_format: { type: 'json_object' }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No response from OpenAI');
        }

        const intelligence = JSON.parse(content);

        return ok({
            success: true,
            source: 'gpt-4o',
            intelligence,
            analyzedAt: new Date().toISOString(),
            creativesAnalyzed: creatives.length
        });

    } catch (error) {
        console.error('[ai-creative-intelligence] Error:', error);

        if (error.status === 429) {
            return ok({
                success: true,
                source: 'fallback',
                intelligence: generateFallbackIntelligence(body?.creatives || []),
                error: 'Rate limited, using fallback'
            });
        }

        return serverError(error.message || 'Creative intelligence analysis failed');
    }
}

function generateFallbackIntelligence(creatives) {
    const sorted = [...creatives].sort((a, b) => (b.roas || 0) - (a.roas || 0));
    const winners = sorted.filter(c => c.roas >= 3);
    const losers = sorted.filter(c => c.roas < 1);
    const fatigued = sorted.filter(c => c.ctr < 1);

    const topPerformers = sorted.slice(0, 3).map(c => ({
        id: c.id,
        name: c.name,
        roas: c.roas || 0,
        ctr: c.ctr || 0,
        whyWinning: c.roas >= 3 ? 'Überdurchschnittlicher ROAS' : 'Beste relative Performance',
        scaleRecommendation: c.roas >= 3 ? 'Budget um 20-30% erhöhen' : 'Beobachten und bei Stabilität skalieren'
    }));

    const bottomPerformers = sorted.slice(-3).reverse().map(c => ({
        id: c.id,
        name: c.name,
        roas: c.roas || 0,
        ctr: c.ctr || 0,
        whyLosing: c.roas < 1 ? 'ROAS unter Break-even' : 'Unterdurchschnittliche Performance',
        fixRecommendation: c.roas < 0.5 ? 'Sofort pausieren' : 'Creative Refresh oder neue Audience testen'
    }));

    const avgRoas = sorted.reduce((sum, c) => sum + (c.roas || 0), 0) / (sorted.length || 1);

    return {
        summary: {
            totalCreatives: creatives.length,
            winners: winners.length,
            losers: losers.length,
            fatigued: fatigued.length,
            averageFatigueScore: fatigued.length > 0 ? 65 : 35
        },
        topPerformers,
        bottomPerformers,
        fatigueAnalysis: fatigued.slice(0, 5).map(c => ({
            id: c.id,
            name: c.name,
            fatigueScore: Math.min(100, 50 + (3 - c.ctr) * 20),
            fatigueLevel: c.ctr < 0.5 ? 'burned' : c.ctr < 1 ? 'fatiguing' : 'normal',
            symptoms: ['Sinkende CTR', 'Audience-Sättigung möglich'],
            daysUntilCritical: c.ctr < 1 ? Math.round(c.ctr * 7) : null,
            refreshRecommendation: 'Neues Creative mit anderem Hook testen'
        })),
        patterns: {
            winningElements: ['Starke Headlines', 'Klare CTAs', 'Social Proof'],
            losingElements: ['Schwache Hooks', 'Unklare Value Proposition'],
            hookRanking: []
        },
        weeklyForecast: {
            expectedRoas: avgRoas * 0.95,
            expectedSpend: sorted.reduce((sum, c) => sum + (c.spend || 0), 0) * 1.1,
            riskLevel: losers.length > winners.length ? 'high' : losers.length > 0 ? 'medium' : 'low',
            topOpportunity: winners.length > 0 ? 'Top Performer skalieren' : 'Neue Creatives testen',
            biggestRisk: losers.length > 0 ? 'Budget-Verlust durch schwache Ads' : 'Keine kritischen Risiken'
        },
        prioritizedActions: [
            losers.length > 0 && {
                priority: 'high',
                action: `${losers.length} unprofitable Ads pausieren`,
                expectedImpact: `€${Math.round(losers.reduce((s, c) => s + (c.spend || 0) * 0.3, 0))} Einsparung`,
                affectedCreatives: losers.map(c => c.id)
            },
            winners.length > 0 && {
                priority: 'high',
                action: `${winners.length} Top Performer skalieren`,
                expectedImpact: '+20-30% Revenue-Potenzial',
                affectedCreatives: winners.map(c => c.id)
            },
            fatigued.length > 0 && {
                priority: 'medium',
                action: `${fatigued.length} ermüdende Ads refreshen`,
                expectedImpact: 'Verlängerte Lebensdauer',
                affectedCreatives: fatigued.map(c => c.id)
            }
        ].filter(Boolean),
        isFallback: true
    };
}
