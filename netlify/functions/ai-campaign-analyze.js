// netlify/functions/ai-campaign-analyze.js
// Netlify serverless function that receives campaign data and returns AI analysis recommendations.
// Uses OpenAI GPT‑4o‑mini when an API key is configured; otherwise falls back to rule‑based logic.

const fetch = require('node-fetch');

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

exports.handler = async function (event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    let payload;
    try {
        payload = JSON.parse(event.body);
    } catch (e) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON payload' }) };
    }

    const campaigns = payload.campaigns || [];
    const strategy = payload.strategy || null;

    const openAiKey = process.env.OPENAI_API_KEY;
    let analyses = [];
    let aiPowered = false;

    if (openAiKey) {
        try {
            const messages = [
                { role: 'system', content: 'You are an AI that provides concise campaign performance recommendations. Return a JSON array of objects with fields: campaignId, recommendation (one of "kill", "duplicate", "increase", "decrease"), confidence (0‑100), reason, expectedImpact, details (array of strings). Use German language for reason and expectedImpact.' },
                { role: 'user', content: JSON.stringify({ campaigns, strategy }, null, 2) }
            ];

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${openAiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages,
                    temperature: 0.2,
                    max_tokens: 1500,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || 'OpenAI request failed');

            // The assistant should return a JSON string in its content.
            const content = data.choices?.[0]?.message?.content?.trim();
            analyses = JSON.parse(content);
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

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST' },
        body: JSON.stringify(result),
    };
};
