import { invokeOpenAIProxy } from './proxyClient';

export interface HeadlineDesign {
    primaryColor: string;
    accentColor: string;
    fontWeight: number;
    fontSize: number;
    letterSpacing: number;
    textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
    gradient?: {
        from: string;
        to: string;
    };
    shadow?: {
        color: string;
        blur: number;
    };
}

export interface HeadlineVariant {
    id: string;
    headline: string;
    subheadline?: string;
    style: 'bold' | 'elegant' | 'modern' | 'playful' | 'professional';
    design: HeadlineDesign;
    emotion: string;
    conversionFocus: string;
}

export interface HeadlineGenerationParams {
    partnerType: 'influencer' | 'coach' | 'community_leader' | 'agency' | 'other';
    audienceSize?: string;
    platform?: string;
    companyName?: string;
    language?: 'de' | 'en';
}

export interface HeadlineGenerationResult {
    variants: HeadlineVariant[];
    context: {
        partnerType: string;
        audienceSize?: string;
        platform?: string;
    };
}

const HEADLINE_STYLES: HeadlineVariant['style'][] = [
    'bold',
    'elegant',
    'modern',
    'playful',
    'professional'
];

const TEXT_TRANSFORMS: NonNullable<HeadlineDesign['textTransform']>[] = [
    'uppercase',
    'lowercase',
    'capitalize',
    'none'
];

const DEFAULT_DESIGN: HeadlineDesign = {
    primaryColor: '#111111',
    accentColor: '#F59E0B',
    fontWeight: 800,
    fontSize: 48,
    letterSpacing: -1,
    textTransform: 'none'
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

const toString = (value: unknown, fallback: string): string =>
    typeof value === 'string' ? value : fallback;

const toNumber = (value: unknown, fallback: number): number =>
    typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const toStyle = (value: unknown): HeadlineVariant['style'] =>
    typeof value === 'string' && HEADLINE_STYLES.includes(value as HeadlineVariant['style'])
        ? (value as HeadlineVariant['style'])
        : 'modern';

const toTextTransform = (value: unknown): HeadlineDesign['textTransform'] =>
    typeof value === 'string' && TEXT_TRANSFORMS.includes(value as NonNullable<HeadlineDesign['textTransform']>)
        ? (value as HeadlineDesign['textTransform'])
        : DEFAULT_DESIGN.textTransform;

const toDesign = (value: unknown): HeadlineDesign => {
    if (!isRecord(value)) return DEFAULT_DESIGN;

    const gradient = isRecord(value.gradient)
        ? {
            from: toString(value.gradient.from, ''),
            to: toString(value.gradient.to, '')
        }
        : undefined;
    const shadow = isRecord(value.shadow)
        ? {
            color: toString(value.shadow.color, ''),
            blur: toNumber(value.shadow.blur, 0)
        }
        : undefined;

    const normalizedGradient = gradient?.from && gradient?.to ? gradient : undefined;
    const normalizedShadow = shadow?.color ? shadow : undefined;

    return {
        primaryColor: toString(value.primaryColor, DEFAULT_DESIGN.primaryColor),
        accentColor: toString(value.accentColor, DEFAULT_DESIGN.accentColor),
        fontWeight: toNumber(value.fontWeight, DEFAULT_DESIGN.fontWeight),
        fontSize: toNumber(value.fontSize, DEFAULT_DESIGN.fontSize),
        letterSpacing: toNumber(value.letterSpacing, DEFAULT_DESIGN.letterSpacing),
        textTransform: toTextTransform(value.textTransform),
        ...(normalizedGradient ? { gradient: normalizedGradient } : {}),
        ...(normalizedShadow ? { shadow: normalizedShadow } : {})
    };
};

/**
 * AI-powered headline generator for affiliate partner applications.
 * Generates conversion-optimized headlines with design specifications.
 */
export async function generateAffiliateHeadlines(
    params: HeadlineGenerationParams
): Promise<HeadlineGenerationResult> {
    const { partnerType, audienceSize, platform, language = 'de' } = params;

    // Build context-aware prompt
    const prompt = buildHeadlinePrompt(params);

    try {
        const { data, error } = await invokeOpenAIProxy<{
            choices: Array<{ message: { content: string } }>;
        }>({
            endpoint: 'chat/completions',
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: language === 'de'
                        ? `Du bist ein Elite-Copywriter für Premium Affiliate Marketing. Deine Headlines sind emotional, konversionsstark und visuell beeindruckend. Du verstehst die Psychologie von Partnern (Influencer, Coaches, Agenturen) und weißt, wie man sie begeistert. Jede Headline muss mit präzisen Design-Spezifikationen ausgestattet sein.`
                        : `You are an elite copywriter for premium affiliate marketing. Your headlines are emotional, conversion-focused, and visually impressive. You understand the psychology of partners (influencers, coaches, agencies) and know how to excite them. Each headline must come with precise design specifications.`
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.9,
            max_tokens: 2000
        });

        if (error || !data) {
            throw new Error(error?.message || 'Failed to generate headlines');
        }

        // Parse AI response
        const content = data?.choices?.[0]?.message?.content;
        if (!content) {
            throw new Error('No content in AI response');
        }

        const parsed = JSON.parse(content);

        // Validate and structure response
        if (!parsed.variants || !Array.isArray(parsed.variants)) {
            throw new Error('Invalid response format from AI');
        }

        // Add IDs to variants
        const variants: HeadlineVariant[] = parsed.variants.map((variant: unknown, idx: number) => {
            const record = isRecord(variant) ? variant : {};
            return {
                id: `headline-${Date.now()}-${idx}`,
                headline: toString(record.headline, 'Headline'),
                subheadline: typeof record.subheadline === 'string' ? record.subheadline : undefined,
                style: toStyle(record.style),
                design: toDesign(record.design),
                emotion: toString(record.emotion, ''),
                conversionFocus: toString(record.conversionFocus, '')
            };
        });

        return {
            variants,
            context: {
                partnerType,
                audienceSize,
                platform
            }
        };
    } catch (err) {
        console.error('[AI Headline Generator] Error:', err);

        // Fallback to rule-based headlines
        return generateFallbackHeadlines(params);
    }
}

/**
 * Builds a strategic prompt for headline generation based on partner context
 */
function buildHeadlinePrompt(params: HeadlineGenerationParams): string {
    const { partnerType, audienceSize, platform, companyName, language = 'de' } = params;

    const audienceContext = audienceSize ? `mit einer Community von ${audienceSize}` : '';
    const platformContext = platform ? `auf ${platform}` : '';
    const companyContext = companyName ? `für ${companyName}` : '';

    if (language === 'de') {
        return `
Generiere 4 krasse, conversion-optimierte Headlines für ein Affiliate Partner Programm.

KONTEXT:
- Partner-Typ: ${getPartnerTypeLabel(partnerType, 'de')}
- Audience: ${audienceContext || 'Nicht angegeben'}
- Plattform: ${platformContext || 'Nicht angegeben'}
- Brand: ${companyContext || 'AdRuby - AI Ad Creation Platform'}

ANFORDERUNGEN:
1. Headlines müssen EMOTIONAL und BEGEISTERND sein
2. Fokus auf FINANZIELLE FREIHEIT, PASSIVE INCOME, WACHSTUM
3. Jede Variante braucht einen anderen Stil: Bold, Elegant, Modern, Playful
4. MUSS Design-Spezifikationen enthalten (Farben, Schrift, Effekte)
5. Subheadline optional für extra Kontext

RESPONSE FORMAT (JSON):
{
  "variants": [
    {
      "headline": "Verdiene mit jedem Klick 💰",
      "subheadline": "Bis zu €10/Monat pro aktivem User - 12 Monate lang",
      "style": "bold",
      "design": {
        "primaryColor": "#000000",
        "accentColor": "#FFD700",
        "fontWeight": 900,
        "fontSize": 48,
        "letterSpacing": -1,
        "textTransform": "uppercase",
        "gradient": {
          "from": "#FFD700",
          "to": "#FFA500"
        },
        "shadow": {
          "color": "rgba(255, 215, 0, 0.3)",
          "blur": 20
        }
      },
      "emotion": "Excitement & Opportunity",
      "conversionFocus": "Financial gain"
    }
  ]
}

Generiere jetzt 4 einzigartige, krasse Headlines im JSON Format!`;
    } else {
        return `
Generate 4 amazing, conversion-optimized headlines for an Affiliate Partner Program.

CONTEXT:
- Partner Type: ${getPartnerTypeLabel(partnerType, 'en')}
- Audience: ${audienceContext || 'Not specified'}
- Platform: ${platformContext || 'Not specified'}
- Brand: ${companyContext || 'AdRuby - AI Ad Creation Platform'}

REQUIREMENTS:
1. Headlines must be EMOTIONAL and EXCITING
2. Focus on FINANCIAL FREEDOM, PASSIVE INCOME, GROWTH
3. Each variant needs a different style: Bold, Elegant, Modern, Playful
4. MUST include design specifications (colors, fonts, effects)
5. Subheadline optional for extra context

RESPONSE FORMAT (JSON):
{
  "variants": [
    {
      "headline": "Earn with Every Click 💰",
      "subheadline": "Up to €10/month per active user - for 12 months",
      "style": "bold",
      "design": {
        "primaryColor": "#000000",
        "accentColor": "#FFD700",
        "fontWeight": 900,
        "fontSize": 48,
        "letterSpacing": -1,
        "textTransform": "uppercase",
        "gradient": {
          "from": "#FFD700",
          "to": "#FFA500"
        },
        "shadow": {
          "color": "rgba(255, 215, 0, 0.3)",
          "blur": 20
        }
      },
      "emotion": "Excitement & Opportunity",
      "conversionFocus": "Financial gain"
    }
  ]
}

Generate 4 unique, amazing headlines in JSON format now!`;
    }
}

/**
 * Get localized partner type label
 */
function getPartnerTypeLabel(type: string, language: 'de' | 'en'): string {
    const labels: Record<string, Record<string, string>> = {
        influencer: { de: 'Influencer / Creator', en: 'Influencer / Creator' },
        coach: { de: 'Coach / Berater', en: 'Coach / Consultant' },
        community_leader: { de: 'Community Leader', en: 'Community Leader' },
        agency: { de: 'Agentur', en: 'Agency' },
        other: { de: 'Anderer Partner', en: 'Other Partner' }
    };
    return labels[type]?.[language] || type;
}

/**
 * Fallback headlines when AI fails
 */
function generateFallbackHeadlines(params: HeadlineGenerationParams): HeadlineGenerationResult {
    const { partnerType, audienceSize, platform } = params;

    const fallbackVariants: HeadlineVariant[] = [
        {
            id: `fallback-1-${Date.now()}`,
            headline: '💎 Werde Partner & Verdiene',
            subheadline: 'Bis zu €10/Monat pro User - Lifetime Recurring',
            style: 'bold',
            design: {
                primaryColor: '#1a1a1a',
                accentColor: '#FFD700',
                fontWeight: 900,
                fontSize: 42,
                letterSpacing: -1,
                textTransform: 'uppercase',
                gradient: {
                    from: '#FFD700',
                    to: '#FFA500'
                }
            },
            emotion: 'Excitement',
            conversionFocus: 'Financial opportunity'
        },
        {
            id: `fallback-2-${Date.now()}`,
            headline: '🚀 Passives Einkommen Starten',
            subheadline: 'Jeder Empfohlen User zahlt 12 Monate lang',
            style: 'modern',
            design: {
                primaryColor: '#0070f3',
                accentColor: '#00d4ff',
                fontWeight: 700,
                fontSize: 38,
                letterSpacing: 0,
                gradient: {
                    from: '#0070f3',
                    to: '#00d4ff'
                },
                shadow: {
                    color: 'rgba(0, 112, 243, 0.3)',
                    blur: 15
                }
            },
            emotion: 'Aspiration',
            conversionFocus: 'Passive income'
        },
        {
            id: `fallback-3-${Date.now()}`,
            headline: '✨ Premium Partner Programm',
            subheadline: 'Exklusive Konditionen für Top-Partner',
            style: 'elegant',
            design: {
                primaryColor: '#2d3748',
                accentColor: '#805ad5',
                fontWeight: 600,
                fontSize: 36,
                letterSpacing: 1,
                textTransform: 'capitalize'
            },
            emotion: 'Exclusivity',
            conversionFocus: 'Premium positioning'
        },
        {
            id: `fallback-4-${Date.now()}`,
            headline: '💰 12 Monate Recurring Revenue',
            subheadline: 'Pro aktivem User - Automatisch ausgezahlt',
            style: 'professional',
            design: {
                primaryColor: '#000000',
                accentColor: '#10b981',
                fontWeight: 800,
                fontSize: 40,
                letterSpacing: -0.5,
                gradient: {
                    from: '#10b981',
                    to: '#059669'
                }
            },
            emotion: 'Trust & Reliability',
            conversionFocus: 'Long-term income'
        }
    ];

    return {
        variants: fallbackVariants,
        context: {
            partnerType,
            audienceSize,
            platform
        }
    };
}
