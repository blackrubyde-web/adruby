import { requireUserId } from './_shared/auth.js';
import { badRequest, methodNotAllowed, ok, serverError, withCors } from './utils/response.js';

// Real AI-powered campaign analysis using OpenAI GPT-4
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

        const { nodes, edges } = JSON.parse(event.body || '{}');

        if (!nodes || !Array.isArray(nodes)) {
            return badRequest('Missing nodes array');
        }

        // Extract campaign structure
        const campaignNodes = nodes.filter(n => n.data?.type === 'campaign');
        const adSetNodes = nodes.filter(n => n.data?.type === 'adset');
        const adNodes = nodes.filter(n => n.data?.type === 'ad');

        // Build structure summary for AI
        const structureSummary = {
            campaigns: campaignNodes.map(c => ({
                name: c.data?.config?.name,
                objective: c.data?.config?.objective,
                budget: c.data?.config?.dailyBudget,
                bidStrategy: c.data?.config?.bidStrategy,
            })),
            adSets: adSetNodes.map(as => ({
                name: as.data?.config?.name,
                parentCampaign: campaignNodes.find(c => edges.some(e => e.source === c.id && e.target === as.id))?.data?.config?.name,
                targeting: as.data?.config?.targeting,
                adsCount: adNodes.filter(ad => ad.data?.parentId === as.id).length,
            })),
            ads: adNodes.map(ad => ({
                name: ad.data?.config?.name,
                hasCreative: !!ad.data?.creative?.id,
                hasHeadline: !!ad.data?.config?.headline,
                hasPrimaryText: !!ad.data?.config?.primaryText,
                cta: ad.data?.config?.cta,
            })),
        };

        // Try real AI analysis
        const aiResult = await analyzeWithAI(structureSummary);

        if (aiResult) {
            return ok(aiResult);
        }

        // Fallback to rule-based analysis if AI fails
        return ok(ruleBasedAnalysis(nodes, edges, campaignNodes, adSetNodes, adNodes));

    } catch (err) {
        console.error('[campaign-canvas-analyze] Error:', err);
        return serverError(err.message);
    }
};

// Real AI analysis with OpenAI
async function analyzeWithAI(structureSummary) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.log('[AI] No OpenAI API key, falling back to rules');
        return null;
    }

    try {
        const prompt = `Du bist ein Meta Ads Experte. Analysiere diese Kampagnenstruktur und gib konstruktives Feedback.

Kampagnenstruktur:
${JSON.stringify(structureSummary, null, 2)}

Gib eine JSON-Antwort mit genau diesem Format:
{
  "score": <0-100 Punkte>,
  "suggestions": [
    {
      "id": "<unique-id>",
      "type": "structure|targeting|budget|creative",
      "title": "<kurzer Titel>",
      "description": "<1-2 Sätze Erklärung>",
      "impact": "high|medium|low"
    }
  ],
  "warnings": [
    {
      "id": "<unique-id>",
      "severity": "error|warning|info",
      "title": "<kurzer Titel>",
      "description": "<1-2 Sätze Erklärung>",
      "affectedNodes": []
    }
  ]
}

Bewertungskriterien:
- Leere Campaigns/AdSets = -25 Punkte (error)
- Fehlendes Creative = -10 Punkte (warning)
- Fehlende Headline/Text = -5 Punkte (info)
- Nur 1 AdSet = Vorschlag für A/B Test
- Identisches Targeting = Hinweis auf Überschneidung
- Budget < €5 pro AdSet = Warnung
- Keine Interests = Hinweis auf breites Targeting

Antworte NUR mit dem JSON, keine Erklärungen.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: process.env.OPENAI_MODEL_TEXT || 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'Du bist ein Meta Ads Analyse-Assistent. Antworte immer in validem JSON.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.3,
                max_tokens: 1500,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('[AI] OpenAI error:', error);
            return null;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            console.error('[AI] No content in response');
            return null;
        }

        // Parse JSON from response (handle code blocks)
        let jsonStr = content;
        if (content.includes('```json')) {
            jsonStr = content.split('```json')[1].split('```')[0].trim();
        } else if (content.includes('```')) {
            jsonStr = content.split('```')[1].split('```')[0].trim();
        }

        const result = JSON.parse(jsonStr);

        // Validate structure
        if (typeof result.score !== 'number' || !Array.isArray(result.suggestions) || !Array.isArray(result.warnings)) {
            console.error('[AI] Invalid response structure');
            return null;
        }

        return {
            ...result,
            meta: {
                aiPowered: true,
                model: process.env.OPENAI_MODEL_TEXT || 'gpt-4o-mini',
                campaigns: structureSummary.campaigns.length,
                adSets: structureSummary.adSets.length,
                ads: structureSummary.ads.length,
            }
        };

    } catch (err) {
        console.error('[AI] Analysis failed:', err.message);
        return null;
    }
}

// Fallback rule-based analysis
function ruleBasedAnalysis(nodes, edges, campaignNodes, adSetNodes, adNodes) {
    const suggestions = [];
    const warnings = [];

    // Check for empty campaigns
    campaignNodes.forEach(campaign => {
        const childAdSets = adSetNodes.filter(as => as.data?.parentId === campaign.id);
        if (childAdSets.length === 0) {
            warnings.push({
                id: `warning-empty-campaign-${campaign.id}`,
                severity: 'error',
                title: 'Leere Campaign',
                description: `"${campaign.data?.config?.name || 'Campaign'}" hat keine Ad Sets.`,
                affectedNodes: [campaign.id],
            });
        }
    });

    // Check for empty ad sets
    adSetNodes.forEach(adset => {
        const adsInSet = adNodes.filter(ad => ad.data?.parentId === adset.id);
        if (adsInSet.length === 0) {
            warnings.push({
                id: `warning-empty-adset-${adset.id}`,
                severity: 'warning',
                title: 'Leeres Ad Set',
                description: `"${adset.data?.config?.name || 'Ad Set'}" hat keine Ads.`,
                affectedNodes: [adset.id],
            });
        }
    });

    // Check for missing creatives
    adNodes.forEach(ad => {
        if (!ad.data?.creative?.id) {
            warnings.push({
                id: `warning-no-creative-${ad.id}`,
                severity: 'info',
                title: 'Fehlendes Creative',
                description: `"${ad.data?.config?.name || 'Ad'}" hat kein Creative.`,
                affectedNodes: [ad.id],
            });
        }
    });

    // A/B testing suggestion
    if (adSetNodes.length === 1) {
        suggestions.push({
            id: 'suggest-ab-test',
            type: 'structure',
            title: 'A/B Testing empfohlen',
            description: 'Füge ein weiteres Ad Set hinzu um verschiedene Zielgruppen zu testen.',
            impact: 'high',
        });
    }

    // Calculate score
    const errorCount = warnings.filter(w => w.severity === 'error').length;
    const warningCount = warnings.filter(w => w.severity === 'warning').length;
    const infoCount = warnings.filter(w => w.severity === 'info').length;

    let score = 100 - (errorCount * 25) - (warningCount * 10) - (infoCount * 3);
    score = Math.max(0, Math.min(100, score));

    return {
        score,
        suggestions,
        warnings,
        meta: {
            aiPowered: false,
            campaigns: campaignNodes.length,
            adSets: adSetNodes.length,
            ads: adNodes.length,
        }
    };
}
