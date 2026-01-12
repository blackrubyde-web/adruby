// netlify/functions/ai-campaign-analyze.js
// Netlify serverless function that receives campaign data and returns AI analysis recommendations.
// Uses OpenAI GPT‑4o‑mini when an API key is configured; otherwise falls back to rule‑based logic.

import { requireUserId } from './_shared/auth.js';
import { badRequest, methodNotAllowed, ok, withCors } from './utils/response.js';

// Helper: simple rule‑based analysis (same logic as UI fallback)
function ruleBasedAnalysis(campaign) {
    const { roas, ctr, conversions, spend } = campaign;
    let recommendation = 'increase';
    if (roas >= 4 && ctr >= 2.5) recommendation = 'duplicate';
    if (roas < 1) recommendation = 'kill';
    if (roas >= 1 && roas < 2) recommendation = 'decrease';
    const confidence = Math.max(60, Math.min(95, Math.round(50 + roas * 8 + ctr * 3)));
    const reasonMap = {
        duplicate: 'Starke ROAS und CTR. Skalierung empfohlen.',
        increase: 'Solide Performance. Budget kann vorsichtig erhöht werden.',
        decrease: 'ROAS unter Ziel. Budget reduzieren und Creatives testen.',
        kill: 'Performance deutlich unter Ziel. Pause empfohlen.'
    };
    return {
        campaignId: campaign.id,
        recommendation,
        confidence,
        reason: reasonMap[recommendation],
        expectedImpact: recommendation === 'duplicate'
            ? '+30-50% Umsatzpotenzial bei gleichbleibender Effizienz'
            : 'Performance-Optimierung durch Budget-Anpassung',
        details: [
            `ROAS: ${roas.toFixed(2)}x`,
            `CTR: ${ctr.toFixed(2)}%`,
            `Conversions: ${conversions}`,
        ]
    };
}

export async function handler(event) {
    if (event.httpMethod === 'OPTIONS') {
        return withCors({ statusCode: 204, body: '' });
    }

    if (event.httpMethod !== 'POST') {
        return methodNotAllowed('POST,OPTIONS');
    }

    const auth = await requireUserId(event);
    if (!auth.ok) return auth.response;

    let payload;
    try {
        payload = JSON.parse(event.body);
    } catch (e) {
        return badRequest('Invalid JSON payload');
    }

    const campaigns = payload.campaigns || [];
    const strategy = payload.strategy || null;

    const openAiKey = process.env.OPENAI_API_KEY;
    let analyses = [];
    let aiPowered = false;

    if (openAiKey) {
        try {
            const systemPrompt = `You are a World-Class Media Buyer & Strategist for Meta Ads.
Your goal is to maximize ROAS and Scale based on a specific Strategy Profile.

STRATEGY CONTEXT:
Risk Tolerance: ${strategy?.autopilot_config?.risk_tolerance || 'medium'} (low=safe, medium=balanced, high=aggressive)
Scale Speed: ${strategy?.autopilot_config?.scale_speed || 'medium'} (slow=10%, medium=20%, fast=30%, aggressive=50%+)
Target ROAS: ${strategy?.autopilot_config?.target_roas || 3.0}

RULES:
1. If "Aggressive" scale is set, recommend "duplicate" for any ad set with ROAS > Target (even slightly).
2. If "Conservative" (Low Risk), only scale if ROAS is > 1.5x Target.
3. If ROAS < 1.0, ALWAYS recommend "kill" unless specific "high risk" strategy allows learning.
4. Provide a SHORT, strategic reason (German language).
5. "expectedImpact" should be specific numbers based on the Scale Speed (e.g. "+30% Budget").

5. "expectedImpact" should be specific numbers based on the Scale Speed (e.g. "+30% Budget").

Return a JSON object with an "analyses" key containing the array:
{
  "analyses": [
    {
      "campaignId": "string",
      "recommendation": "kill" | "duplicate" | "increase" | "decrease",
      "confidence": number (0-100),
      "reason": "string (German)",
      "expectedImpact": "string (German)",
      "details": ["string"]
    }
  ]
}`;

            const messages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: JSON.stringify({ campaigns, strategy }, null, 2) }
            ];

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${openAiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages,
                    temperature: 0.2,
                    response_format: { type: "json_object" }
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || 'OpenAI request failed');

            // The assistant should return a JSON string in its content.
            const content = data.choices?.[0]?.message?.content?.trim();
            const parsed = JSON.parse(content);
            analyses = parsed.analyses || [];
            aiPowered = true;
        } catch (err) {
            console.error('OpenAI error, falling back to rule‑based analysis:', err);
            analyses = campaigns.map(ruleBasedAnalysis);
        }
    } else {
        // No OpenAI key – use rule‑based fallback.
        analyses = campaigns.map(ruleBasedAnalysis);
    }

    const result = {
        meta: { aiPowered },
        analyses,
    };

    return ok(result);
}
