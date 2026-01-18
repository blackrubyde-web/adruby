// netlify/functions/ai-copilot-chat.js
// AI Copilot Chat API - Natural language questions about campaign performance
// Uses GPT-4o with campaign context AND strategy knowledge for intelligent responses

import OpenAI from 'openai';
import { requireUserId } from './_shared/auth.js';
import { badRequest, methodNotAllowed, ok, serverError, withCors } from './utils/response.js';
import { generateAIContext, getStrategyContext, evaluatePerformance } from './_shared/strategyKnowledgeBase.js';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `Du bist der AdRuby AI Copilot - ein Elite Performance Marketing Experte und Media Buyer.
Du analysierst Meta Ads Kampagnen und gibst actionable Empfehlungen BASIEREND AUF BRANCHENSPEZIFISCHEM WISSEN.

DEINE AUFGABEN:
1. Beantworte Fragen zu Kampagnen-Performance verständlich
2. Erkläre warum bestimmte Ads gut/schlecht performen
3. Gib konkrete Optimierungsvorschläge BASIEREND AUF DER BRANCHE
4. Identifiziere Muster und Trends
5. Schlage Budget-Allokationen vor
6. Empfehle Messaging-Angles und Creative-Strategien basierend auf Buyer Personas

WICHTIG - BRANCHENSPEZIFISCHES WISSEN:
- Du kennst die genauen BENCHMARKS für jede Branche (E-COM D2C, SaaS, Coaching, etc.)
- Du kennst die BUYER PERSONAS und ihre psychologischen Trigger
- Du kennst die besten MESSAGING ANGLES für jede Zielgruppe
- Du kannst REGELN empfehlen die zur Branche passen

STIL:
- Antworte auf Deutsch
- Sei präzise und actionable
- Nutze Emojis sparsam für Übersichtlichkeit
- Gib konkrete Zahlen wenn möglich
- Maximal 3-4 kurze Absätze
- Bei Creative-Tipps: Nenne die Buyer Persona und den Trigger

VERFÜGBARE DATEN:
- Kampagnen-Metriken (ROAS, CTR, Spend, Conversions)
- AI-Empfehlungen (kill, duplicate, increase, decrease)
- Performance-Scores
- Branchenspezifische Benchmarks und Strategien

Wenn du keine Daten hast, frage nach einem Sync oder sage dass du mehr Kontext brauchst.`;

const SUGGESTED_QUESTIONS = [
    "Welche Ad soll ich als erstes skalieren?",
    "Warum performt meine beste Ad so gut?",
    "Welche Ads soll ich pausieren?",
    "Wie kann ich meinen ROAS verbessern?",
    "Was ist mein Budget-Tipp für morgen?",
    "Welche Creative-Strategie passt zu meiner Branche?",
    "Welche Buyer Persona sollte ich ansprechen?",
];

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

        const { message, campaignContext, conversationHistory = [], industryType = 'ecom_d2c' } = body;

        if (!message) {
            return badRequest('Missing message');
        }

        // If no OpenAI key, return fallback response
        if (!process.env.OPENAI_API_KEY) {
            return ok({
                success: true,
                source: 'fallback',
                response: getFallbackResponse(message, campaignContext),
                suggestedQuestions: SUGGESTED_QUESTIONS.slice(0, 3)
            });
        }

        // Build context from campaign data
        let contextPrompt = '';

        // Add INDUSTRY-SPECIFIC STRATEGY CONTEXT
        const strategyContext = generateAIContext(industryType);
        if (strategyContext) {
            contextPrompt += `\n\n${strategyContext}`;
        }

        // Add campaign data context
        if (campaignContext) {
            const { campaigns, summary, recommendations } = campaignContext;

            contextPrompt += `\n\nAKTUELLE KAMPAGNEN-DATEN:
Gesamt-Spend: €${summary?.spend?.toFixed(2) || 'N/A'}
Gesamt-Revenue: €${summary?.revenue?.toFixed(2) || 'N/A'}
Durchschnittlicher ROAS: ${summary?.roas?.toFixed(2) || 'N/A'}x
Anzahl Kampagnen: ${campaigns?.length || 0}

EMPFEHLUNGEN:
- Zu pausieren (Kill): ${recommendations?.kill || 0}
- Zu skalieren (Duplicate): ${recommendations?.duplicate || 0}
- Budget erhöhen: ${recommendations?.increase || 0}
- Budget reduzieren: ${recommendations?.decrease || 0}`;

            // Evaluate performance against industry benchmarks
            if (summary?.roas && summary?.ctr) {
                const evaluation = evaluatePerformance(industryType, {
                    roas: summary.roas,
                    ctr: summary.ctr,
                });
                if (evaluation) {
                    contextPrompt += `\n\nPERFORMANCE vs. BRANCHENBENCHMARKS:`;
                    for (const [metric, data] of Object.entries(evaluation)) {
                        contextPrompt += `\n- ${metric.toUpperCase()}: ${data.value.toFixed(2)} (${data.rating.toUpperCase()})`;
                    }
                }
            }

            // Add top campaigns if available
            if (campaigns && campaigns.length > 0) {
                const topByRoas = [...campaigns].sort((a, b) => b.roas - a.roas).slice(0, 3);
                contextPrompt += `\n\nTOP 3 KAMPAGNEN (ROAS):`;
                topByRoas.forEach((c, i) => {
                    contextPrompt += `\n${i + 1}. ${c.name}: ${c.roas.toFixed(2)}x ROAS, €${c.spend.toFixed(2)} Spend`;
                });

                const worstByRoas = [...campaigns].sort((a, b) => a.roas - b.roas).slice(0, 3);
                contextPrompt += `\n\nSCHLECHTESTE 3 KAMPAGNEN (ROAS):`;
                worstByRoas.forEach((c, i) => {
                    contextPrompt += `\n${i + 1}. ${c.name}: ${c.roas.toFixed(2)}x ROAS, €${c.spend.toFixed(2)} Spend`;
                });
            }
        }

        // Build messages array with history
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT + contextPrompt },
            ...conversationHistory.slice(-6).map(msg => ({
                role: msg.role,
                content: msg.content
            })),
            { role: 'user', content: message }
        ];

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages,
            max_tokens: 500,
            temperature: 0.7,
        });

        const aiResponse = response.choices[0]?.message?.content;
        if (!aiResponse) {
            throw new Error('No response from OpenAI');
        }

        // Generate relevant follow-up questions based on context
        const followUpQuestions = generateFollowUpQuestions(message, campaignContext);

        return ok({
            success: true,
            source: 'gpt-4o',
            response: aiResponse,
            suggestedQuestions: followUpQuestions,
            tokensUsed: response.usage?.total_tokens || 0
        });

    } catch (error) {
        console.error('[ai-copilot-chat] Error:', error);

        if (error.status === 429) {
            return ok({
                success: true,
                source: 'fallback',
                response: 'Ich bin gerade etwas überlastet. Versuche es in einer Minute erneut! 🔄',
                suggestedQuestions: SUGGESTED_QUESTIONS.slice(0, 3)
            });
        }

        return serverError(error.message || 'Chat failed');
    }
}

function getFallbackResponse(message, context) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('skalieren') || lowerMessage.includes('scale')) {
        if (context?.recommendations?.duplicate > 0) {
            return `📈 Du hast ${context.recommendations.duplicate} Kampagnen die zum Skalieren bereit sind! Suche nach den grünen "Duplicate" Badges in der Liste.`;
        }
        return '📊 Führe zuerst einen Sync durch, damit ich deine Top Performer identifizieren kann.';
    }

    if (lowerMessage.includes('pausieren') || lowerMessage.includes('stoppen') || lowerMessage.includes('kill')) {
        if (context?.recommendations?.kill > 0) {
            return `⚠️ Ich empfehle ${context.recommendations.kill} Kampagnen zu pausieren. Diese haben einen ROAS unter 1.0 und verbrennen Budget.`;
        }
        return '✅ Aktuell gibt es keine kritischen Kampagnen die pausiert werden sollten.';
    }

    if (lowerMessage.includes('roas') || lowerMessage.includes('performance')) {
        if (context?.summary?.roas) {
            const roas = context.summary.roas;
            if (roas > 3) return `🚀 Dein durchschnittlicher ROAS von ${roas.toFixed(2)}x ist excellent! Fokussiere dich auf Skalierung.`;
            if (roas > 1.5) return `👍 Dein ROAS von ${roas.toFixed(2)}x ist solide. Optimiere die schwächsten Ads für mehr Profit.`;
            return `⚠️ Dein ROAS von ${roas.toFixed(2)}x ist unter Ziel. Pausiere unprofitable Ads und teste neue Creatives.`;
        }
        return '📊 Synchronisiere deine Meta Daten für eine ROAS-Analyse.';
    }

    return '🤖 Ich bin der AdRuby AI Copilot! Frag mich zu deinen Kampagnen, z.B. "Welche Ad soll ich skalieren?" oder "Warum performt Ad X schlecht?".';
}

function generateFollowUpQuestions(message, context) {
    const questions = [];

    if (context?.recommendations?.duplicate > 0) {
        questions.push("Zeig mir Details zur besten Kampagne");
    }
    if (context?.recommendations?.kill > 0) {
        questions.push("Warum performen diese Ads schlecht?");
    }
    if (context?.summary?.roas < 2) {
        questions.push("Wie kann ich meinen ROAS verbessern?");
    }

    // Add some defaults if needed
    while (questions.length < 3) {
        const remaining = SUGGESTED_QUESTIONS.filter(q => !questions.includes(q));
        if (remaining.length > 0) {
            questions.push(remaining[Math.floor(Math.random() * remaining.length)]);
        } else {
            break;
        }
    }

    return questions.slice(0, 3);
}
