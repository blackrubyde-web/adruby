/**
 * AI CONTENT GENERATOR
 * 
 * Uses AI to generate additional ad content:
 * - Dynamic headlines based on product
 * - Feature lists and selling points
 * - Trust indicators and social proof text
 * - Icon suggestions and placements
 * - Color recommendations
 * - Layout optimizations
 * - A/B variant suggestions
 */

import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate complete ad content package
 */
export async function generateAdContent({
    productAnalysis,
    referenceAds = [],
    userPrompt = '',
    industry = '',
    targetAudience = '',
    tone = 'premium'    // premium, playful, urgent, professional
}) {
    console.log('[AIContent] 🎨 Generating AI content package...');

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'system',
                content: `You are an elite advertising copywriter and creative strategist with 15+ years at top agencies (Wieden+Kennedy, Droga5, BBDO). You create high-converting ad copy that combines emotional resonance with clear value propositions.

Your copy is known for:
- Punchy, memorable headlines that stop the scroll
- Clear hierarchy of information
- Strong calls-to-action that create urgency
- Authentic brand voice adaptation
- Mobile-optimized length and formatting`
            },
            {
                role: 'user',
                content: `Create a complete ad content package for this product:

PRODUCT ANALYSIS:
${JSON.stringify(productAnalysis, null, 2)}

USER REQUEST: "${userPrompt}"
INDUSTRY: ${industry || 'Technology'}
TARGET AUDIENCE: ${targetAudience || 'Young professionals 25-45'}
TONE: ${tone}

${referenceAds.length > 0 ? `
TOP PERFORMING REFERENCE ADS:
${referenceAds.slice(0, 3).map((ad, i) => `${i + 1}. "${ad.headline || 'N/A'}" - Running ${ad.running_duration?.days || 30}+ days`).join('\n')}
` : ''}

Generate a COMPREHENSIVE content package with JSON response:

{
    "headlines": {
        "primary": "Main headline (max 8 words, high impact)",
        "secondary": "Alternative headline for A/B testing",
        "emotional": "Emotion-driven headline variant",
        "benefit": "Benefit-focused headline variant",
        "curiosity": "Curiosity-gap headline variant"
    },
    "taglines": {
        "primary": "Supporting tagline (max 15 words)",
        "short": "Ultra-short tagline (max 6 words)",
        "detailed": "Longer explanatory tagline (max 25 words)"
    },
    "ctas": {
        "primary": "Main CTA button text",
        "urgency": "CTA with urgency",
        "benefit": "CTA with benefit",
        "soft": "Low-commitment CTA"
    },
    "features": [
        {
            "icon": "emoji icon",
            "title": "Feature title (3 words max)",
            "description": "Brief description (10 words max)"
        }
    ],
    "trustIndicators": {
        "socialProof": "X users already trust us",
        "rating": "4.9 out of 5 stars",
        "reviews": "Based on 2,500+ reviews",
        "badges": ["✓ Verified", "🏆 Award Winner", "🔒 Secure"]
    },
    "urgencyElements": {
        "scarcity": "Limited time offer",
        "fomo": "Join 10,000+ users",
        "exclusive": "Exclusive offer"
    },
    "valueProps": [
        "Unique value proposition 1",
        "Unique value proposition 2",
        "Unique value proposition 3"
    ],
    "emotionalHooks": {
        "pain": "Pain point addressed",
        "desire": "Desire triggered",
        "fear": "FOMO element"
    },
    "colorRecommendations": {
        "primary": "#hexcode",
        "accent": "#hexcode",
        "cta": "#hexcode",
        "text": "#FFFFFF or #000000"
    },
    "layoutSuggestion": {
        "type": "hero_centered|hero_left|hero_right|split_screen|story",
        "emphasis": "product|headline|cta|features",
        "whitespace": "minimal|balanced|generous"
    },
    "abVariants": [
        {
            "name": "Control",
            "headline": "...",
            "cta": "...",
            "focus": "..."
        },
        {
            "name": "Emotional",
            "headline": "...",
            "cta": "...",
            "focus": "..."
        }
    ]
}`
            }],
            max_tokens: 2000,
            response_format: { type: 'json_object' }
        });

        const content = JSON.parse(response.choices[0].message.content);
        console.log('[AIContent] ✅ Content package generated');
        console.log(`[AIContent] Headlines: ${Object.keys(content.headlines || {}).length}, Features: ${(content.features || []).length}`);

        return content;

    } catch (error) {
        console.error('[AIContent] Generation failed:', error.message);
        return getDefaultContent(productAnalysis);
    }
}

/**
 * Generate feature callouts with icons
 */
export async function generateFeatureCallouts(productAnalysis, count = 4) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'user',
                content: `Generate ${count} compelling feature callouts for this product:

${JSON.stringify(productAnalysis, null, 2)}

Return JSON array:
[
    {
        "icon": "appropriate emoji",
        "title": "Short title (2-4 words)",
        "description": "Brief benefit-focused description (8-12 words)",
        "position": "suggested position: top_left|top_right|left|right|bottom_left|bottom_right",
        "importance": 1-5 rating
    }
]

Focus on:
- Clear, scannable text
- Benefit-oriented language
- Trust-building elements
- Differentiating features`
            }],
            max_tokens: 800,
            response_format: { type: 'json_object' }
        });

        const result = JSON.parse(response.choices[0].message.content);
        return result.features || result;
    } catch (error) {
        return getDefaultFeatures();
    }
}

/**
 * Generate social proof elements
 */
export async function generateSocialProof(productAnalysis, style = 'premium') {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'user',
                content: `Generate compelling social proof elements for this ${style} product:

${JSON.stringify(productAnalysis, null, 2)}

Return JSON:
{
    "rating": {
        "score": 4.9,
        "text": "4.9 out of 5",
        "visual": "★★★★★"
    },
    "reviews": {
        "count": "2,500+",
        "text": "Based on 2,500+ reviews"
    },
    "users": {
        "count": "50,000+",
        "text": "Trusted by 50,000+ professionals"
    },
    "awards": [
        "🏆 Product of the Year 2024",
        "⭐ Editor's Choice"
    ],
    "press": [
        "Featured in TechCrunch",
        "As seen on ProductHunt"
    ],
    "testimonial": {
        "quote": "Short impactful testimonial",
        "author": "Name, Company"
    },
    "metrics": [
        { "value": "99%", "label": "Uptime" },
        { "value": "24/7", "label": "Support" }
    ]
}`
            }],
            max_tokens: 600,
            response_format: { type: 'json_object' }
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        return getDefaultSocialProof();
    }
}

/**
 * Generate urgency elements
 */
export async function generateUrgencyElements(productAnalysis, urgencyLevel = 'medium') {
    const urgencyMap = {
        low: ['Limited availability', 'While supplies last'],
        medium: ['Offer ends soon', 'Don\'t miss out', 'Limited time'],
        high: ['Only 3 left!', 'Ends in 24 hours', 'Final chance', 'Last day']
    };

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'user',
                content: `Generate appropriate urgency elements (${urgencyLevel} level) for:

${JSON.stringify(productAnalysis, null, 2)}

Return JSON:
{
    "badge": "Main urgency badge text",
    "timer": "Countdown indication if appropriate",
    "scarcity": "Scarcity statement",
    "fomo": "Fear of missing out text",
    "exclusive": "Exclusivity angle",
    "discount": "Discount badge if applicable"
}`
            }],
            max_tokens: 300,
            response_format: { type: 'json_object' }
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        return {
            badge: urgencyMap[urgencyLevel][0],
            timer: null,
            scarcity: 'Limited availability',
            fomo: 'Join thousands of happy customers',
            exclusive: 'Exclusive offer',
            discount: null
        };
    }
}

/**
 * Generate multiple headline variants for testing
 */
export async function generateHeadlineVariants(productAnalysis, count = 10) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'user',
                content: `Generate ${count} diverse, high-converting headline variants for:

${JSON.stringify(productAnalysis, null, 2)}

Return JSON:
{
    "headlines": [
        {
            "text": "Headline text",
            "type": "benefit|emotional|curiosity|social_proof|how_to|number|question|command",
            "emotion": "primary emotion targeted",
            "strength": 1-10 predicted strength
        }
    ]
}

Requirements:
- Maximum 8 words each
- Variety of approaches
- Clear value proposition
- Stop-scroll power
- Mobile-friendly length`
            }],
            max_tokens: 1000,
            response_format: { type: 'json_object' }
        });

        const result = JSON.parse(response.choices[0].message.content);
        return result.headlines || [];
    } catch (error) {
        return [
            { text: productAnalysis?.productName || 'Premium Quality', type: 'benefit', strength: 7 }
        ];
    }
}

/**
 * Analyze and improve existing copy
 */
export async function analyzeCopy(headline, tagline, cta) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'user',
                content: `Analyze this ad copy and provide improvements:

HEADLINE: "${headline}"
TAGLINE: "${tagline}"
CTA: "${cta}"

Return JSON:
{
    "analysis": {
        "headlineScore": 1-10,
        "taglineScore": 1-10,
        "ctaScore": 1-10,
        "overallScore": 1-10
    },
    "issues": [
        "Issue 1",
        "Issue 2"
    ],
    "improvements": {
        "headline": "Improved headline",
        "tagline": "Improved tagline",
        "cta": "Improved CTA"
    },
    "reasoning": "Brief explanation of changes"
}`
            }],
            max_tokens: 500,
            response_format: { type: 'json_object' }
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        return null;
    }
}

/**
 * Generate icon suggestions
 */
export function generateIconSuggestions(features) {
    const iconMap = {
        speed: ['⚡', '🚀', '💨', '⏱️'],
        security: ['🔒', '🛡️', '✓', '🔐'],
        money: ['💰', '💵', '💎', '📈'],
        time: ['⏰', '📅', '⌛', '🕐'],
        quality: ['⭐', '✨', '🏆', '👑'],
        ease: ['👆', '🎯', '✅', '🔄'],
        innovation: ['💡', '🔮', '🎨', '🧠'],
        communication: ['💬', '📧', '🗣️', '📱'],
        analytics: ['📊', '📈', '🔍', '📉'],
        cloud: ['☁️', '🌐', '💾', '🔗'],
        support: ['💪', '🤝', '👥', '❤️'],
        global: ['🌍', '🌎', '🌏', '🗺️']
    };

    return features.map(feature => {
        const lowerFeature = (feature.title || feature).toLowerCase();
        for (const [key, icons] of Object.entries(iconMap)) {
            if (lowerFeature.includes(key)) {
                return icons[0];
            }
        }
        return '✓';
    });
}

// Default content fallbacks
function getDefaultContent(productAnalysis) {
    const name = productAnalysis?.productName || 'Our Product';
    return {
        headlines: {
            primary: `Discover ${name}`,
            secondary: `${name}: Reimagined`,
            emotional: `Transform Your Life with ${name}`,
            benefit: `Save Time with ${name}`,
            curiosity: `Why Everyone's Talking About ${name}`
        },
        taglines: {
            primary: 'The smarter way to achieve your goals',
            short: 'Built for you',
            detailed: 'Join thousands who have already transformed their workflow with our solution'
        },
        ctas: {
            primary: 'Get Started',
            urgency: 'Start Now',
            benefit: 'Try Free',
            soft: 'Learn More'
        },
        features: getDefaultFeatures(),
        trustIndicators: getDefaultSocialProof(),
        layoutSuggestion: {
            type: 'hero_centered',
            emphasis: 'product',
            whitespace: 'balanced'
        }
    };
}

function getDefaultFeatures() {
    return [
        { icon: '⚡', title: 'Lightning Fast', description: 'Blazing speed performance' },
        { icon: '🔒', title: 'Secure', description: 'Enterprise-grade security' },
        { icon: '🎯', title: 'Easy to Use', description: 'Intuitive interface' },
        { icon: '📈', title: 'Scalable', description: 'Grows with your needs' }
    ];
}

function getDefaultSocialProof() {
    return {
        rating: { score: 4.9, text: '4.9 out of 5', visual: '★★★★★' },
        reviews: { count: '2,500+', text: 'Based on 2,500+ reviews' },
        users: { count: '50,000+', text: 'Trusted by 50,000+ users' },
        awards: ['🏆 Best in Class']
    };
}

export default {
    generateAdContent,
    generateFeatureCallouts,
    generateSocialProof,
    generateUrgencyElements,
    generateHeadlineVariants,
    analyzeCopy,
    generateIconSuggestions
};
