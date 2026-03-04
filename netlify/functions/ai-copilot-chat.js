// netlify/functions/ai-copilot-chat.js
// AI Copilot Chat API — Gemini-powered marketing advisor
// Handles both general marketing questions AND campaign-specific insights

import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { requireUserId } from './_shared/auth.js';
import { badRequest, methodNotAllowed, ok, serverError, withCors } from './utils/response.js';

// Initialize Supabase for persistent memory
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

/* ── System Prompt ──────────────────────────────── */
const SYSTEM_PROMPT = `Du bist **AdRuby Copilot** — ein Elite Performance Marketing Experte mit Agency-Level Expertise.
Du analysierst Meta Ads Kampagnen wie ein erfahrener Media Buyer mit 10+ Jahren Erfahrung.
Gleichzeitig bist du ein allgemeiner Marketing-Berater, der jede Frage zu Digital Marketing beantworten kann.

## DEINE EXPERTISE-BEREICHE

### 1. META ADS PERFORMANCE ANALYSE
- Erkläre WARUM Ads performen oder nicht (Frequency, Audience Fatigue, Creative Burnout, Relevance Score)
- Berechne konkrete Zahlen: "Bei €X mehr Budget = ~Y mehr Conversions"
- Identifiziere Muster: "Weekend-Performance 23% besser", "Video Ads liefern 2x bessere CTR"
- Kampagnenstruktur: CBO vs. ABO, Campaign Budget Optimization, Ad Set Consolidation

### 2. BRANCHENSPEZIFISCHE META ADS STRATEGIEN
- **E-COM D2C**: ROAS >3x, AOV-Optimierung, Flash Sales, Social Proof, Dynamic Product Ads
- **SaaS/B2B**: CAC-LTV Ratio, Free Trial Funnels, Demo Bookings, LinkedIn vs. Meta
- **Coaching/Service**: High-Ticket Closer, Webinar Funnels, DM Sequences, Trust Building
- **Lead Gen**: CPL Targets, Qualifier Fragen, Follow-Up Automations, Form vs. Instant Form
- **Local Business**: Geotargeting, Store Visits, Standort-basierte Audiences

### 3. KREATIV-STRATEGIE & AD COPY
- **Frameworks**: AIDA, PAS (Problem-Agitate-Solve), Before-After-Bridge, Feature-Advantage-Benefit
- **Hook-Typen**: Pattern Interrupt, Curiosity Gap, Bold Statement, Social Proof, Question Hook
- **Visual**: UGC vs. Studio, Carousel vs. Single Image, Video Hooks (3-Sekunden-Regel)
- **Copy-Regeln**: Headlines <40 Zeichen, Primary Text 2-3 kurze Absätze, Power Words
- **A/B Testing**: Iteratives Testen, Creative Fatigue erkennen, Winner identifizieren

### 4. TARGETING & AUDIENCES
- Lookalike Audiences (1%, 3%, 5% — Wann was?)
- Custom Audiences: Website Visitors, Video Viewers, Engagement, Purchase
- Broad Targeting: Wann lohnt es sich, Meta's Algorithmus zu vertrauen?
- Retargeting: Funnel-basiertes Retargeting, Dynamic Retargeting, Exclusion Lists
- Interest Stacking vs. Interest Splitting

### 5. BUDGET & BIDDING
- Scaling Rules: 20% Regel, Vertikales vs. Horizontales Skalieren
- Bidding: Lowest Cost vs. Cost Cap vs. Bid Cap — Vor-/Nachteile
- Budget Allocation: 70/20/10 Regel (Proven/Testing/Experimental)
- Break-Even ROAS berechnen (Marge, AOV, Fixkosten)

### 6. ALLGEMEINES DIGITAL MARKETING
- SEO Grundlagen, Content Marketing, Email Marketing
- Funnel-Strategie: TOFU/MOFU/BOFU, Conversion Rate Optimization
- Marketing Analytics: Attribution, UTM Tracking, GA4 Integration
- Social Media Strategie: Instagram, TikTok, YouTube, LinkedIn
- Branding vs. Performance Marketing Balance

## ANTWORT-STIL
- **Sprache**: Deutsch, professionell aber zugänglich und freundlich
- **Konkret**: Immer konkrete Zahlen, Prozente, Benchmarks wo möglich
- **Strukturiert**: Nutze Emoji zur Strukturierung (📊 💡 ⚠️ ✅ 🎯 🔥 📈)
- **Actionable**: Jede Antwort enthält mindestens einen konkreten nächsten Schritt
- **Länge**: 3-6 Absätze, klar strukturiert mit Überschriften

## ANTWORT-TEMPLATE (für kampagenspezifische Fragen)
"""
📊 **Analyse**: [1-2 Sätze zur Diagnose]

💡 **Empfehlung**: [Was genau tun]
- Schritt 1: ...
- Schritt 2: ...

📈 **Erwartetes Ergebnis**: [Konkrete Prognose]

⚡ **Quick Win**: [Sofort umsetzbar]
"""

## ANTWORT-TEMPLATE (für allgemeine Marketing-Fragen)
"""
🎯 **Antwort**: [Klare, direkte Antwort]

📋 **Details**: [Tiefergehende Erklärung mit Beispielen]

💡 **Best Practice**: [Konkrete Empfehlung]

🔥 **Pro-Tipp**: [Fortgeschrittener Tipp]
"""

Wenn du keine Kampagnen-Daten hast, beantworte allgemeine Marketing-Fragen mit deinem Fachwissen.
Wenn der User nach seinen Kampagnen fragt aber keine Daten vorliegen, erkläre was er tun muss (Sync durchführen).`;

/* ── Suggested Questions ────────────────────────── */
const INITIAL_SUGGESTIONS = [
    "Welche Ad soll ich als erstes skalieren?",
    "Gib mir einen 7-Tage Optimierungsplan",
    "Was sind die besten Hook-Typen für meine Branche?",
];

const MARKETING_QUESTIONS = [
    "Wie strukturiere ich meine Meta Kampagnen optimal?",
    "Was ist der Unterschied zwischen CBO und ABO?",
    "Wie erstelle ich eine Lookalike Audience?",
    "Welche Creative-Formate performen 2025 am besten?",
    "Wie berechne ich meinen Break-Even ROAS?",
    "Was ist die beste Bidding-Strategie für Skalierung?",
    "Wie erstelle ich einen effektiven A/B Test?",
    "Was sind die besten Retargeting-Strategien?",
];

const CAMPAIGN_QUESTIONS = [
    "Welche Kampagne verbrennt am meisten Budget?",
    "Zeig mir Details zur besten Kampagne",
    "Wie kann ich meinen ROAS verbessern?",
    "Welche Ads zeigen Fatigue-Signale?",
    "Wie soll ich mein Budget umverteilen?",
    "Analysiere meine Conversion-Rate",
    "Erstelle mir einen Skalierungsplan",
];

/* ── Handler ────────────────────────────────────── */
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

        const { message, campaignContext, conversationHistory = [] } = body;

        if (!message) {
            return badRequest('Missing message');
        }

        // Load persistent memory from Supabase
        let persistentMemory = [];
        if (supabase) {
            try {
                const { data: memoryData } = await supabase.rpc('get_chat_memory', {
                    p_user_id: auth.userId,
                    p_limit: 10
                });
                if (memoryData) {
                    persistentMemory = memoryData.reverse();
                }
            } catch (memError) {
                console.log('[ai-copilot-chat] Memory load skipped:', memError.message);
            }
        }

        // If no Gemini key, return fallback
        if (!process.env.GEMINI_API_KEY) {
            return ok({
                success: true,
                source: 'fallback',
                response: getFallbackResponse(message, campaignContext),
                suggestedQuestions: INITIAL_SUGGESTIONS,
            });
        }

        // Build campaign context prompt
        let contextPrompt = '';

        if (campaignContext) {
            const { campaigns, summary, recommendations } = campaignContext;

            contextPrompt += `\n\nAKTUELLE KAMPAGNEN-DATEN DES USERS:
Gesamt-Spend: €${summary?.spend?.toFixed(2) || 'N/A'}
Gesamt-Revenue: €${summary?.revenue?.toFixed(2) || 'N/A'}
Durchschnittlicher ROAS: ${summary?.roas?.toFixed(2) || 'N/A'}x
Anzahl Kampagnen: ${campaigns?.length || 0}

AI-EMPFEHLUNGEN:
- Zu pausieren (Kill): ${recommendations?.kill || 0}
- Zu skalieren (Duplicate): ${recommendations?.duplicate || 0}
- Budget erhöhen: ${recommendations?.increase || 0}
- Budget reduzieren: ${recommendations?.decrease || 0}`;

            if (campaigns && campaigns.length > 0) {
                // Sort by ROAS and include detailed metrics
                const sorted = [...campaigns].sort((a, b) => b.roas - a.roas);
                contextPrompt += `\n\nALLE KAMPAGNEN (nach ROAS sortiert):`;
                sorted.forEach((c, i) => {
                    contextPrompt += `\n${i + 1}. "${c.name}" — ROAS: ${c.roas?.toFixed(2) || '?'}x | Spend: €${c.spend?.toFixed(2) || '?'} | CTR: ${c.ctr?.toFixed(2) || '?'}%`;
                });
            }
        }

        // Add persistent memory context
        if (persistentMemory.length > 0) {
            contextPrompt += `\n\nLETZTE GESPRÄCHE (für Kontext):`;
            persistentMemory.slice(-4).forEach((msg, i) => {
                const role = msg.role === 'user' ? 'User' : 'Du';
                const preview = msg.content.substring(0, 120);
                contextPrompt += `\n${i + 1}. ${role}: ${preview}${msg.content.length > 120 ? '...' : ''}`;
            });
        }

        // Build Gemini conversation
        const systemInstruction = SYSTEM_PROMPT + contextPrompt;

        // Combine persistent + session history
        const allHistory = [
            ...persistentMemory.slice(-4).map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }],
            })),
            ...conversationHistory.slice(-8).map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }],
            })),
        ];

        // Ensure alternating roles (Gemini requirement)
        const cleanedHistory = [];
        let lastRole = null;
        for (const msg of allHistory) {
            if (msg.role !== lastRole) {
                cleanedHistory.push(msg);
                lastRole = msg.role;
            }
        }

        const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const response = await gemini.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                ...cleanedHistory,
                { role: 'user', parts: [{ text: message }] },
            ],
            config: {
                systemInstruction,
                temperature: 0.7,
                maxOutputTokens: 1200,
            },
        });

        const aiResponse = response?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!aiResponse) {
            throw new Error('No response from Gemini');
        }

        // Save to persistent memory
        if (supabase) {
            try {
                await supabase.from('copilot_memory').insert([
                    { user_id: auth.userId, role: 'user', content: message },
                    { user_id: auth.userId, role: 'assistant', content: aiResponse },
                ]);
            } catch (saveError) {
                console.log('[ai-copilot-chat] Memory save skipped:', saveError.message);
            }
        }

        // Generate context-aware follow-up questions
        const followUpQuestions = generateFollowUpQuestions(message, campaignContext);

        return ok({
            success: true,
            source: 'gemini-2.5-flash',
            response: aiResponse,
            suggestedQuestions: followUpQuestions,
        });

    } catch (error) {
        console.error('[ai-copilot-chat] Error:', error);

        // Fallback for any error
        const body = JSON.parse(event.body || '{}');
        return ok({
            success: true,
            source: 'fallback',
            response: getFallbackResponse(body.message || '', body.campaignContext),
            suggestedQuestions: INITIAL_SUGGESTIONS,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
}

/* ── Fallback Responses ─────────────────────────── */
function getFallbackResponse(message, context) {
    const lower = message.toLowerCase();

    // Campaign-specific fallbacks
    if (lower.includes('skalieren') || lower.includes('scale') || lower.includes('top performer')) {
        if (context?.recommendations?.duplicate > 0) {
            return `📈 **${context.recommendations.duplicate} Kampagnen** sind bereit zur Skalierung!\n\nSuche nach den grünen "Duplicate" Badges in der Kampagnen-Liste. Beginne mit der Kampagne mit dem höchsten ROAS und erhöhe das Budget schrittweise um 20%.`;
        }
        return '📊 Führe zuerst einen **Meta Sync** durch, damit ich deine Top Performer identifizieren kann.';
    }

    if (lower.includes('pausieren') || lower.includes('stoppen') || lower.includes('kill')) {
        if (context?.recommendations?.kill > 0) {
            return `⚠️ **${context.recommendations.kill} Kampagnen** sollten pausiert werden — sie haben einen ROAS unter 1.0 und verbrennen Budget.\n\nNutze die "Verlierer pausieren" Schnellaktion oben.`;
        }
        return '✅ Aktuell gibt es keine kritischen Kampagnen. Alle performen über dem Minimum-ROAS.';
    }

    if (lower.includes('roas') || lower.includes('performance') || lower.includes('wie läuft')) {
        if (context?.summary?.roas) {
            const roas = context.summary.roas;
            const spend = context.summary.spend;
            if (roas > 3) return `🚀 **ROAS: ${roas.toFixed(2)}x** — Excellent!\n\nBei €${spend?.toFixed(0)} Spend generierst du €${(spend * roas).toFixed(0)} Umsatz. Fokussiere dich auf Skalierung der Top-Performer.`;
            if (roas > 1.5) return `👍 **ROAS: ${roas.toFixed(2)}x** — Solide Basis.\n\nOptimiere die schwächsten Ads und teste neue Creatives für mehr Profit.`;
            return `⚠️ **ROAS: ${roas.toFixed(2)}x** — Unter Ziel.\n\nEmpfehlung: Pausiere unprofitable Ads, teste neue Hooks und überarbeite dein Targeting.`;
        }
        return '📊 Synchronisiere deine Meta Daten für eine ROAS-Analyse. Klicke oben auf "Sync".';
    }

    // General marketing fallbacks
    if (lower.includes('hook') || lower.includes('headline') || lower.includes('copy')) {
        return `🎯 **Die 5 stärksten Hook-Typen für Meta Ads:**\n\n1. **Pattern Interrupt**: "Vergiss alles was du über X weißt"\n2. **Curiosity Gap**: "Das passiert wenn du X machst"\n3. **Social Proof**: "10.000+ Kunden können nicht irren"\n4. **Question Hook**: "Machst du auch diesen Fehler?"\n5. **Bold Statement**: "X ist der größte Fehler in deinem Marketing"\n\n💡 *Tipp: Teste jeden Hook-Typ mit demselben Visual für 3 Tage. Der mit der besten CTR gewinnt.*`;
    }

    if (lower.includes('budget') || lower.includes('skalierung') || lower.includes('scaling')) {
        return `📈 **Die 20%-Skalierungs-Regel:**\n\nErhöhe das Budget einer profitablen Kampagne **maximal 20% alle 2-3 Tage**. Zu schnelles Skalieren bricht den Algorithmus.\n\n🔥 **Pro-Tipp**: Nutze horizontales Skalieren — dupliziere die Kampagne mit anderem Targeting statt das Budget einer einzelnen Kampagne zu verdoppeln.`;
    }

    if (lower.includes('targeting') || lower.includes('audience') || lower.includes('zielgruppe')) {
        return `🎯 **Targeting-Strategie 2025:**\n\n1. **Broad Targeting** (keine Interessen) — Funktioniert erstaunlich gut bei starken Creatives\n2. **Lookalike 1%** — Beste Qualität für Skalierung\n3. **Custom Audience** — Website Visitors (7d) für heißes Retargeting\n\n💡 *Tipp: Meta's Advantage+ Shopping Campaigns (ASC) performen oft besser als manuelles Targeting.*`;
    }

    return `🤖 **Ich bin dein AdRuby Marketing-Copilot!**\n\nIch kann dir helfen mit:\n- 📊 Kampagnen-Analyse und Optimierung\n- 🎯 Targeting und Audience-Strategien\n- ✍️ Ad Copy und Creative-Tipps\n- 💰 Budget-Allokation und Skalierung\n- 📈 Allgemeines Digital Marketing\n\nFrag mich einfach!`;
}

/* ── Follow-up Question Generator ───────────────── */
function generateFollowUpQuestions(message, context) {
    const lower = message.toLowerCase();
    const questions = [];

    // Context-aware questions
    if (context?.recommendations?.duplicate > 0) {
        questions.push("Welche Kampagne hat das größte Skalierungspotenzial?");
    }
    if (context?.recommendations?.kill > 0) {
        questions.push("Warum performen diese Ads schlecht?");
    }
    if (context?.summary?.roas && context.summary.roas < 2) {
        questions.push("Wie kann ich meinen ROAS über 2x bringen?");
    }

    // Topic-based follow-ups
    if (lower.includes('creative') || lower.includes('ad') || lower.includes('hook')) {
        questions.push("Welche Video-Formate performen am besten?");
        questions.push("Wie erstelle ich einen effektiven A/B Test?");
    }
    if (lower.includes('budget') || lower.includes('skalier')) {
        questions.push("Wann sollte ich horizontales vs. vertikales Skalieren nutzen?");
    }
    if (lower.includes('target') || lower.includes('audience')) {
        questions.push("Wie erstelle ich eine effektive Lookalike Audience?");
    }

    // Fill with category-appropriate defaults
    const hasCampaigns = context?.campaigns?.length > 0;
    const pool = hasCampaigns
        ? [...CAMPAIGN_QUESTIONS, ...MARKETING_QUESTIONS]
        : MARKETING_QUESTIONS;

    while (questions.length < 3) {
        const remaining = pool.filter(q => !questions.includes(q));
        if (remaining.length === 0) break;
        questions.push(remaining[Math.floor(Math.random() * remaining.length)]);
    }

    return questions.slice(0, 3);
}
