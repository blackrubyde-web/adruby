// netlify/functions/ai-copilot-chat.js
// AI Copilot Chat API - Natural language questions about campaign performance
// Uses GPT-4o with campaign context, strategy knowledge, AND persistent memory

import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { requireUserId } from './_shared/auth.js';
import { badRequest, methodNotAllowed, ok, serverError, withCors } from './utils/response.js';
import { generateAIContext, getStrategyContext, evaluatePerformance } from './_shared/strategyKnowledgeBase.js';

// Initialize Supabase for persistent memory
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `Du bist der AdRuby AI Copilot - ein Elite Performance Marketing Experte mit Agency-Level Expertise.
Du analysierst Meta Ads Kampagnen wie ein erfahrener Media Buyer mit 10+ Jahren Erfahrung.

## DEINE SUPERKRÄFTE

### 1. TIEFGEHENDE ANALYSE
- Erkläre WARUM Ads performen oder nicht (Frequency, Audience Fatigue, Creative Burnout)
- Berechne konkrete Zahlen: "Bei €X mehr Budget = ~Y mehr Conversions"
- Identifiziere versteckte Muster: "Deine Weekend-Performance ist 23% besser"

### 2. BRANCHENSPEZIFISCHE EXPERTISE
Du kennst die exakten Benchmarks und Strategien für:
- **E-COM D2C**: ROAS >3x, AOV-Optimierung, Flash Sales, Social Proof
- **SaaS/B2B**: CAC-LTV Ratio, Free Trial Funnels, Demo Bookings
- **Coaching/Service**: High-Ticket Closer, Webinar Funnels, DM Sequences
- **Lead Gen**: CPL Targets, Qualifier Fragen, Follow-Up Automations

### 3. ACTIONABLE EMPFEHLUNGEN
Jede Antwort enthält:
- **DIAGNOSE**: Was genau ist das Problem/Opportunity?
- **AKTION**: Exakt was der User tun soll (Schritt-für-Schritt)
- **ERWARTETES ERGEBNIS**: "Erwarte ~X% Verbesserung in Y Tagen"

### 4. MEMORY & KONTEXT
- Du erinnerst dich an vorherige Gespräche mit diesem User
- Du weißt welche Empfehlungen bereits gegeben wurden
- Du trackst ob Empfehlungen umgesetzt wurden

## ANTWORT-STIL
- Deutsch, professionell aber freundlich
- Konkrete Zahlen und Prozente wo möglich
- Emoji nur zur Strukturierung (📊 💡 ⚠️ ✅)
- 4-6 Absätze mit klarer Struktur
- Bei Creative-Tipps: Nenne die exakte Buyer Persona und psychologischen Trigger

## BEISPIEL TEMPLATE
"""
📊 **Analyse**: [1-2 Sätze zur Diagnose]

💡 **Empfehlung**: [Was genau tun]
- Schritt 1: ...
- Schritt 2: ...

📈 **Erwartetes Ergebnis**: [Konkrete Prognose]

⚡ **Quick Win**: [Sofort umsetzbar]
"""

Wenn du keine Daten hast, erkläre genau was du brauchst und welche Insights du dann liefern könntest.`;

const SUGGESTED_QUESTIONS = [
    "Welche Ad soll ich als erstes skalieren und um wieviel?",
    "Gib mir eine detaillierte Analyse meiner Top Performer",
    "Welche Creative-Strategie passt zu meiner Branche?",
    "Analysiere meine Conversion-Rate und gib Optimierungstipps",
    "Welche Ads zeigen Fatigue-Signale?",
    "Erstelle mir einen 7-Tage Optimierungsplan",
    "Wie kann ich mein Budget effizienter verteilen?",
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

        // Load persistent memory from Supabase (last 10 messages from previous sessions)
        let persistentMemory = [];
        let userProfile = null;
        if (supabase) {
            try {
                const { data: memoryData } = await supabase.rpc('get_chat_memory', {
                    p_user_id: auth.userId,
                    p_limit: 10
                });
                if (memoryData) {
                    persistentMemory = memoryData.reverse(); // Oldest first
                }

                // Load user AI profile for personalization
                const { data: profileData } = await supabase
                    .from('ai_user_profile')
                    .select('*')
                    .eq('user_id', auth.userId)
                    .single();
                userProfile = profileData;
            } catch (memError) {
                console.log('[ai-copilot-chat] Memory load skipped:', memError.message);
            }
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

        // Add user profile context if available
        if (userProfile) {
            contextPrompt += `\n\nUSER LEARNING PROFIL:
- Durchschnittlicher ROAS: ${userProfile.avg_roas?.toFixed(2) || 'N/A'}x
- Durchschnittliche CTR: ${userProfile.avg_ctr?.toFixed(2) || 'N/A'}%
- Branche: ${userProfile.primary_industry || 'ecom_d2c'}
- Erfolgreiche Entscheidungen: ${userProfile.success_rate ? (userProfile.success_rate * 100).toFixed(0) + '%' : 'N/A'}
- Bisherige Kampagnen analysiert: ${userProfile.campaigns_analyzed || 0}`;
        }

        // Add persistent memory context if available
        if (persistentMemory.length > 0) {
            contextPrompt += `\n\nLETZTE GESPRÄCHE (für Kontext):`;
            persistentMemory.slice(-4).forEach((msg, i) => {
                const role = msg.role === 'user' ? 'User' : 'Du';
                const preview = msg.content.substring(0, 100);
                contextPrompt += `\n${i + 1}. ${role}: ${preview}${msg.content.length > 100 ? '...' : ''}`;
            });
        }

        // Build messages array with session history + persistent memory
        const allHistory = [
            // Persistent memory from previous sessions (last 4)
            ...persistentMemory.slice(-4).map(msg => ({
                role: msg.role,
                content: msg.content
            })),
            // Current session history (last 6)
            ...conversationHistory.slice(-6).map(msg => ({
                role: msg.role,
                content: msg.content
            }))
        ];

        const messages = [
            { role: 'system', content: SYSTEM_PROMPT + contextPrompt },
            ...allHistory.slice(-10), // Keep last 10 total for context window
            { role: 'user', content: message }
        ];

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages,
            max_tokens: 800,  // Increased for more detailed responses
            temperature: 0.6, // Slightly lower for more consistent quality
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

        // Return fallback response for ANY error to prevent 502/500
        const body = JSON.parse(event.body || '{}');
        return ok({
            success: true,
            source: 'fallback',
            response: getFallbackResponse(body.message || '', body.campaignContext),
            suggestedQuestions: SUGGESTED_QUESTIONS.slice(0, 3),
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
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
