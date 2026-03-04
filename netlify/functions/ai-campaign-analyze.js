// netlify/functions/ai-campaign-analyze.js
// Agency-Level AI Campaign Analysis — Gemini-powered
// Returns actionable recommendations with budget amounts, fatigue detection, and scaling strategy

import { GoogleGenAI } from '@google/genai';
import { requireUserId } from './_shared/auth.js';
import { badRequest, methodNotAllowed, ok, withCors } from './utils/response.js';

/* ══════════════════════════════════════════════════════
   AGENCY-LEVEL RULE-BASED ANALYSIS
   Multi-metric scoring with fatigue detection, learning
   phase awareness, and specific budget recommendations
   ══════════════════════════════════════════════════════ */

function computePerformanceScore(c) {
    const roas = Number(c.roas || 0);
    const ctr = Number(c.ctr || 0);
    const spend = Number(c.spend || 0);
    const conversions = Number(c.conversions || 0);
    const impressions = Number(c.impressions || 0);
    const clicks = Number(c.clicks || 0);
    const cpc = clicks > 0 ? spend / clicks : 999;
    const cpm = impressions > 0 ? (spend / impressions) * 1000 : 999;
    const convRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
    const frequency = Number(c.frequency || 0);

    // Weighted performance score (0-100)
    let score = 0;

    // ROAS contribution (40% weight)
    if (roas >= 5) score += 40;
    else if (roas >= 3) score += 32;
    else if (roas >= 2) score += 24;
    else if (roas >= 1.5) score += 16;
    else if (roas >= 1) score += 8;
    else score += 0;

    // CTR contribution (20% weight)
    if (ctr >= 3) score += 20;
    else if (ctr >= 2) score += 16;
    else if (ctr >= 1.5) score += 12;
    else if (ctr >= 1) score += 8;
    else if (ctr >= 0.5) score += 4;

    // Conversion Rate contribution (20% weight)
    if (convRate >= 5) score += 20;
    else if (convRate >= 3) score += 16;
    else if (convRate >= 2) score += 12;
    else if (convRate >= 1) score += 8;
    else if (convRate > 0) score += 4;

    // CPC efficiency (10% weight) — lower is better
    if (cpc < 0.5) score += 10;
    else if (cpc < 1) score += 8;
    else if (cpc < 2) score += 6;
    else if (cpc < 5) score += 4;

    // Volume bonus (10% weight) — rewards scale
    if (conversions >= 100) score += 10;
    else if (conversions >= 50) score += 8;
    else if (conversions >= 20) score += 6;
    else if (conversions >= 5) score += 4;
    else if (conversions > 0) score += 2;

    return { score, cpc, cpm, convRate, frequency };
}

function detectFatigue(c) {
    const frequency = Number(c.frequency || 0);
    const ctr = Number(c.ctr || 0);
    const roas = Number(c.roas || 0);

    // High frequency + declining metrics = fatigue
    if (frequency > 4 && ctr < 1) return { fatigued: true, severity: 'critical', reason: `Frequency ${frequency.toFixed(1)} bei nur ${ctr.toFixed(2)}% CTR — Creative erschöpft` };
    if (frequency > 3 && ctr < 1.5) return { fatigued: true, severity: 'warning', reason: `Frequency ${frequency.toFixed(1)} steigt — Creative-Wechsel empfohlen` };
    if (frequency > 5) return { fatigued: true, severity: 'critical', reason: `Frequency ${frequency.toFixed(1)} — Audience ist übersättigt` };
    return { fatigued: false, severity: 'none', reason: '' };
}

function isInLearningPhase(c) {
    const conversions = Number(c.conversions || 0);
    const spend = Number(c.spend || 0);
    // Meta needs ~50 conversions per week to exit learning
    if (conversions < 10 && spend < 20) return true;
    return false;
}

function ruleBasedAnalysis(campaign, strategy) {
    const roas = Number(campaign.roas || 0);
    const ctr = Number(campaign.ctr || 0);
    const spend = Number(campaign.spend || 0);
    const conversions = Number(campaign.conversions || 0);
    const impressions = Number(campaign.impressions || 0);
    const clicks = Number(campaign.clicks || 0);

    const { score, cpc, cpm, convRate, frequency } = computePerformanceScore(campaign);
    const fatigue = detectFatigue(campaign);
    const learning = isInLearningPhase(campaign);

    const targetRoas = strategy?.autopilot_config?.target_roas || 3.0;
    const riskTolerance = strategy?.autopilot_config?.risk_tolerance || 'medium';
    const scaleSpeed = strategy?.autopilot_config?.scale_speed || 'medium';

    const scaleMap = { slow: 0.10, medium: 0.20, fast: 0.30, aggressive: 0.50 };
    const scalePct = scaleMap[scaleSpeed] || 0.20;

    let recommendation = 'maintain';
    let confidence = 50;
    let reason = '';
    let expectedImpact = '';
    let budgetAction = null;

    // Learning phase — don't touch
    if (learning) {
        recommendation = 'maintain';
        confidence = 40;
        reason = `Kampagne in Lernphase (${conversions} Conv., €${spend.toFixed(0)} Spend). Abwarten bis mind. 50 Conversions.`;
        expectedImpact = 'Algorithmus optimiert sich — 3-7 Tage abwarten';
    }
    // KILL: ROAS < 0.8 with significant spend
    else if (roas < 0.8 && spend > 10) {
        recommendation = 'kill';
        confidence = Math.min(95, 70 + Math.round((1 - roas) * 30));
        const wasted = spend - (spend * roas);
        reason = `ROAS ${roas.toFixed(2)}x bei €${spend.toFixed(0)} Spend — €${wasted.toFixed(0)} Verlust. Sofort pausieren.`;
        expectedImpact = `€${wasted.toFixed(0)} Budget-Einsparung sofort verfügbar`;
    }
    // KILL: Very low CTR = bad creative
    else if (ctr < 0.5 && spend > 15 && roas < 1.5) {
        recommendation = 'kill';
        confidence = 75;
        reason = `CTR nur ${ctr.toFixed(2)}% — Creative resoniert nicht. ${fatigue.fatigued ? fatigue.reason : 'Neues Creative testen.'}`;
        expectedImpact = `€${spend.toFixed(0)} können in profitablere Ads umgeleitet werden`;
    }
    // FATIGUE: Creative erschöpft
    else if (fatigue.fatigued && fatigue.severity === 'critical') {
        recommendation = roas > 1.5 ? 'decrease' : 'kill';
        confidence = 80;
        reason = fatigue.reason;
        expectedImpact = 'Creative-Refresh startet. Budget-Reduktion um 30% bis neues Creative live ist.';
        budgetAction = { type: 'decrease', pct: 0.30 };
    }
    // SCALE: Top performer
    else if (roas >= targetRoas * 1.5 && score >= 70) {
        recommendation = 'duplicate';
        confidence = Math.min(95, 75 + Math.round(roas * 3));
        const additionalBudget = spend * scalePct;
        reason = `🔥 Top Performer — ROAS ${roas.toFixed(2)}x (${(roas / targetRoas * 100).toFixed(0)}% über Ziel), Score ${score}/100. Aggressiv skalieren.`;
        expectedImpact = `+€${additionalBudget.toFixed(0)} Budget (+${(scalePct * 100).toFixed(0)}%) → geschätzt +€${(additionalBudget * roas).toFixed(0)} zusätzlicher Umsatz`;
        budgetAction = { type: 'increase', pct: scalePct, amount: additionalBudget };
    }
    // INCREASE: Above target ROAS
    else if (roas >= targetRoas && score >= 55) {
        recommendation = 'increase';
        const safeScale = riskTolerance === 'low' ? scalePct * 0.5 : scalePct;
        const additionalBudget = spend * safeScale;
        confidence = Math.min(90, 65 + Math.round(roas * 4));
        reason = `ROAS ${roas.toFixed(2)}x über Ziel-ROAS ${targetRoas}x, Score ${score}/100. Vorsichtig skalieren (${(safeScale * 100).toFixed(0)}%).`;
        expectedImpact = `+€${additionalBudget.toFixed(0)} Budget → geschätzt +€${(additionalBudget * roas * 0.8).toFixed(0)} Umsatz (konservativ)`;
        budgetAction = { type: 'increase', pct: safeScale, amount: additionalBudget };
    }
    // DECREASE: Below target but still profitable
    else if (roas >= 1 && roas < targetRoas * 0.7) {
        recommendation = 'decrease';
        confidence = 70;
        const reduction = spend * 0.20;
        reason = `ROAS ${roas.toFixed(2)}x unter Ziel ${targetRoas}x. Budget um 20% reduzieren und Creative testen.`;
        expectedImpact = `€${reduction.toFixed(0)} Budget-Einsparung, fokussiert auf profitablere Segmente`;
        budgetAction = { type: 'decrease', pct: 0.20, amount: reduction };
    }
    // MAINTAIN: Everything else
    else {
        recommendation = roas >= 1 ? 'increase' : 'decrease';
        confidence = 55;
        reason = `ROAS ${roas.toFixed(2)}x, CTR ${ctr.toFixed(2)}%, Score ${score}/100. ${roas >= 1 ? 'Leichte Erhöhung möglich.' : 'Beobachten und optimieren.'}`;
        expectedImpact = roas >= 1 ? 'Kleine Budget-Erhöhung um 10% zum Testen' : 'Budget halten, Creative-Varianten testen';
    }

    return {
        campaignId: campaign.id,
        recommendation,
        confidence,
        reason,
        expectedImpact,
        budgetAction,
        performanceScore: score,
        fatigue: fatigue.fatigued ? fatigue : undefined,
        learningPhase: learning,
        details: [
            `ROAS: ${roas.toFixed(2)}x (Ziel: ${targetRoas}x)`,
            `CTR: ${ctr.toFixed(2)}%`,
            `CPC: €${cpc.toFixed(2)}`,
            `CPM: €${cpm.toFixed(2)}`,
            `Conv. Rate: ${convRate.toFixed(2)}%`,
            `Conversions: ${conversions}`,
            `Score: ${score}/100`,
            ...(fatigue.fatigued ? [`⚠️ ${fatigue.reason}`] : []),
            ...(learning ? ['🔄 Lernphase aktiv'] : []),
        ],
    };
}

/* ══════════════════════════════════════════════════════
   GEMINI SYSTEM PROMPT — Agency-Level Analysis
   ══════════════════════════════════════════════════════ */

function buildSystemPrompt(strategy) {
    const riskTolerance = strategy?.autopilot_config?.risk_tolerance || 'medium';
    const scaleSpeed = strategy?.autopilot_config?.scale_speed || 'medium';
    const targetRoas = strategy?.autopilot_config?.target_roas || 3.0;

    return `Du bist ein Elite Performance Media Buyer mit 10+ Jahren Erfahrung bei Top-Agenturen.
Du analysierst Meta Ads Kampagnen auf Agency-Level und gibst actionable Empfehlungen.

## ANALYSE-FRAMEWORK (2026 Best Practices)

### Skalierungs-Regeln
- **20%-Regel**: Budget nie mehr als 20% auf einmal erhöhen (außer bei aggressive scale)
- **Horizontales Skalieren**: Bei Top-Performern → Kampagne duplizieren mit anderem Targeting
- **Vertikales Skalieren**: Budget schrittweise erhöhen (+20% alle 2-3 Tage)
- **CBO vs ABO**: CBO für bewährte Ad Sets, ABO für Testing-Phase

### Fatigue-Erkennung
- Frequency > 3 + sinkende CTR = Creative fatigue → Neues Creative nötig
- Frequency > 5 = Audience-Sättigung → Neue Audience oder Expansion
- Steigende CPC bei gleichem Budget = Wettbewerb oder Fatigue

### Lernphase
- Kampagnen mit < 50 Conversions sind in der Lernphase → NICHT anfassen
- Mind. 3-5 Tage Daten sammeln bevor Änderungen
- Budget-Änderungen > 20% setzen Lernphase zurück

### Metriken-Bewertung
- **ROAS > ${targetRoas}x**: Profitabel, skalierbar
- **ROAS 1.0-${targetRoas}x**: Break-even Zone, optimieren
- **ROAS < 1.0**: Verlustzone, pausieren oder radikal ändern
- **CTR > 2%**: Gutes Creative
- **CTR < 0.8%**: Schlechtes Creative oder falsches Targeting
- **CPC > €3**: Zu teuer, Targeting oder Creative überarbeiten

## STRATEGIE-KONTEXT
- Risiko-Toleranz: ${riskTolerance} (low=konservativ, medium=balanced, high=aggressiv)
- Skalierungs-Geschwindigkeit: ${scaleSpeed} (slow=10%, medium=20%, fast=30%, aggressive=50%+)
- Ziel-ROAS: ${targetRoas}x

## ANTWORT-FORMAT
Antworte mit einem JSON-Objekt mit "analyses" Array:
{
  "analyses": [
    {
      "campaignId": "string",
      "recommendation": "kill" | "duplicate" | "increase" | "decrease",
      "confidence": number (0-100),
      "reason": "string (Deutsch, konkret, mit Zahlen)",
      "expectedImpact": "string (Deutsch, konkrete €-Beträge und %)",
      "budgetAction": { "type": "increase|decrease", "pct": number, "amount": number } | null,
      "performanceScore": number (0-100),
      "details": ["string array mit Key Metriken"]
    }
  ]
}

## WICHTIGE REGELN
1. Jede Empfehlung MUSS konkrete €-Beträge und %-Zahlen enthalten
2. Begründe WARUM (nicht nur WAS) — z.B. "CTR sinkt bei steigender Frequency → Creative Fatigue"
3. Bei "kill" → Erkläre wohin das Budget umverteilt werden soll
4. Bei "duplicate" → Empfehle neues Targeting oder Audience
5. Berücksichtige das Zusammenspiel der Kampagnen (Kannibalisierung?)
6. Markiere Kampagnen in der Lernphase als "maintain" mit confidence < 50
7. Sprache: Deutsch`;
}

/* ══════════════════════════════════════════════════════
   HANDLER
   ══════════════════════════════════════════════════════ */

export async function handler(event) {
    if (event.httpMethod === 'OPTIONS') {
        return withCors({ statusCode: 204, body: '' });
    }

    if (event.httpMethod !== 'POST') {
        return methodNotAllowed('POST,OPTIONS');
    }

    const auth = await requireUserId(event);
    const serviceSecret = event.headers?.["x-service-secret"] || event.headers?.["X-Service-Secret"];
    const autoScaleSecret = process.env.AUTOSCALE_SECRET;
    if (!auth.ok && !(autoScaleSecret && serviceSecret === autoScaleSecret)) {
        return auth.response;
    }

    let payload;
    try {
        payload = JSON.parse(event.body);
    } catch (e) {
        return badRequest('Invalid JSON payload');
    }

    const campaigns = payload.campaigns || [];
    const strategy = payload.strategy || null;

    if (!campaigns.length) {
        return ok({ meta: { aiPowered: false }, analyses: [] });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    let analyses = [];
    let aiPowered = false;

    if (geminiKey) {
        try {
            const gemini = new GoogleGenAI({ apiKey: geminiKey });
            const systemPrompt = buildSystemPrompt(strategy);

            const userContent = JSON.stringify({
                campaigns: campaigns.map(c => ({
                    id: c.id,
                    name: c.name,
                    roas: Number(c.roas || 0).toFixed(2),
                    ctr: Number(c.ctr || 0).toFixed(2),
                    spend: Number(c.spend || 0).toFixed(2),
                    impressions: Number(c.impressions || 0),
                    clicks: Number(c.clicks || 0),
                    conversions: Number(c.conversions || 0),
                    cpc: c.clicks > 0 ? (c.spend / c.clicks).toFixed(2) : 'N/A',
                    cpm: c.impressions > 0 ? ((c.spend / c.impressions) * 1000).toFixed(2) : 'N/A',
                    frequency: Number(c.frequency || 0).toFixed(1),
                })),
                strategy: strategy ? {
                    riskTolerance: strategy.autopilot_config?.risk_tolerance || 'medium',
                    scaleSpeed: strategy.autopilot_config?.scale_speed || 'medium',
                    targetRoas: strategy.autopilot_config?.target_roas || 3.0,
                } : null,
            }, null, 2);

            const response = await gemini.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ role: 'user', parts: [{ text: userContent }] }],
                config: {
                    systemInstruction: systemPrompt,
                    temperature: 0.2,
                    responseMimeType: 'application/json',
                    maxOutputTokens: 4000,
                },
            });

            const content = response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (!content) throw new Error('Empty Gemini response');

            const parsed = JSON.parse(content);
            analyses = parsed.analyses || [];
            aiPowered = true;

            console.log(`[ai-campaign-analyze] Gemini analyzed ${campaigns.length} campaigns, ${analyses.length} results`);
        } catch (err) {
            console.error('[ai-campaign-analyze] Gemini error, falling back to rule-based:', err?.message || err);
            analyses = campaigns.map(c => ruleBasedAnalysis(c, strategy));
        }
    } else {
        // No Gemini key — use agency-level rule-based fallback
        analyses = campaigns.map(c => ruleBasedAnalysis(c, strategy));
    }

    return ok({
        meta: { aiPowered, engine: aiPowered ? 'gemini-2.5-flash' : 'rule-based-v2' },
        analyses,
    });
}
