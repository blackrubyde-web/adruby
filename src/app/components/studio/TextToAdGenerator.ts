// Text-to-Ad AI Generator
// Takes a product description and generates a complete ad layout

import type { AdDocument, StudioLayer } from '../../types/studio';

export interface TextToAdRequest {
    description: string;
    niche?: string;
    style?: 'modern' | 'classic' | 'bold' | 'minimal';
    format?: { width: number; height: number };
}

export interface GeneratedAdContent {
    headline: string;
    subheadline: string;
    ctaText: string;
    suggestedColors: {
        background: string;
        primary: string;
        accent: string;
    };
    suggestedNiche: string;
}

// Generate ad copy using AI
export async function generateAdContent(request: TextToAdRequest): Promise<GeneratedAdContent> {
    const { description, niche, style = 'modern' } = request;

    const systemPrompt = `You are an expert ad copywriter and designer. Generate compelling ad content based on a product/service description.

Return a JSON object with EXACTLY this structure:
{
    "headline": "A short, punchy headline (max 6 words)",
    "subheadline": "A supporting line (max 12 words)",
    "ctaText": "Call-to-action button text (max 3 words)",
    "suggestedColors": {
        "background": "#hexcode (dark for modern, light for classic)",
        "primary": "#hexcode (main text color)",
        "accent": "#hexcode (CTA button color)"
    },
    "suggestedNiche": "one of: saas, coach, craft, job, ecommerce, realestate, food, fitness, event, finance"
}

Style: ${style}
${niche ? `Industry: ${niche}` : ''}
Be direct, use power words, create urgency.`;

    try {
        const response = await fetch('/api/ai-generate-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemPrompt,
                userPrompt: `Product/Service: ${description}`,
                model: 'gpt-4o-mini'
            })
        });

        if (response.ok) {
            const data = await response.json();
            try {
                // Parse the JSON from the response
                const parsed = JSON.parse(data.text);
                return parsed;
            } catch {
                // If parsing fails, use fallback
                console.warn('Failed to parse AI response, using fallback');
            }
        }
    } catch (e) {
        console.warn('AI request failed:', e);
    }

    // Fallback generation
    return generateFallbackContent(description, style);
}

function generateFallbackContent(description: string, style: string): GeneratedAdContent {
    const words = description.toLowerCase().split(' ');

    // Detect niche from keywords
    let niche = 'ecommerce';
    if (words.some(w => ['software', 'app', 'saas', 'platform', 'tool'].includes(w))) niche = 'saas';
    else if (words.some(w => ['coach', 'mentor', 'course', 'training'].includes(w))) niche = 'coach';
    else if (words.some(w => ['restaurant', 'food', 'pizza', 'cafe'].includes(w))) niche = 'food';
    else if (words.some(w => ['gym', 'fitness', 'workout', 'training'].includes(w))) niche = 'fitness';
    else if (words.some(w => ['house', 'property', 'real', 'estate'].includes(w))) niche = 'realestate';

    // Style-based colors
    const colors = {
        modern: { background: '#0a0a0a', primary: '#ffffff', accent: '#3b82f6' },
        classic: { background: '#f8fafc', primary: '#0f172a', accent: '#1e3a8a' },
        bold: { background: '#000000', primary: '#ffffff', accent: '#ef4444' },
        minimal: { background: '#ffffff', primary: '#18181b', accent: '#18181b' }
    };

    const headlines = [
        'Transform Your World',
        'The Future Starts Here',
        'Unlock Your Potential',
        'Experience Excellence',
        'Elevate Your Life'
    ];

    return {
        headline: headlines[Math.floor(Math.random() * headlines.length)],
        subheadline: 'Join thousands who already trust us',
        ctaText: 'Get Started',
        suggestedColors: colors[style as keyof typeof colors] || colors.modern,
        suggestedNiche: niche
    };
}

// Image candidates for different niches
const NICHE_IMAGES: Record<string, string[]> = {
    fitness: [
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1080&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1080&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=1080&auto=format&fit=crop'
    ],
    food: [
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1080&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1080&auto=format&fit=crop'
    ],
    saas: [
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1080&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1080&auto=format&fit=crop'
    ],
    ecommerce: [
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1080&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1080&auto=format&fit=crop'
    ],
    coach: [
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1080&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1080&auto=format&fit=crop'
    ],
    realestate: [
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1080&auto=format&fit=crop'
    ],
    event: [
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1080&auto=format&fit=crop'
    ],
    finance: [
        'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?q=80&w=1080&auto=format&fit=crop'
    ],
    craft: [
        'https://images.unsplash.com/photo-1581092921461-eab62e97a782?q=80&w=1080&auto=format&fit=crop'
    ],
    job: [
        'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1080&auto=format&fit=crop'
    ]
};

// Create a complete AdDocument from generated content
export function createAdFromContent(
    content: GeneratedAdContent,
    format: { width: number; height: number } = { width: 1080, height: 1080 }
): Partial<AdDocument> {
    const { width, height } = format;
    const isVertical = height > width;

    // Calculate responsive positions
    const padding = Math.min(width, height) * 0.08;
    const headlineY = isVertical ? height * 0.35 : height * 0.3;
    const subheadlineY = headlineY + (isVertical ? 140 : 100);
    const ctaY = isVertical ? height * 0.75 : height * 0.7;

    // Select background image based on niche
    const nicheImages = NICHE_IMAGES[content.suggestedNiche] || NICHE_IMAGES.ecommerce;
    const randomImage = nicheImages[Math.floor(Math.random() * nicheImages.length)];

    const layers: Partial<StudioLayer>[] = [
        // Background Image
        {
            id: `bg_${Date.now()}`,
            type: 'product',
            name: 'Background',
            x: 0,
            y: 0,
            width: width,
            height: height,
            src: randomImage,
            visible: true,
            locked: true,
            zIndex: 0,
            rotation: 0,
            opacity: 1 // Full opacity image
        },
        // Dark Overlay for readability
        {
            id: `overlay_${Date.now()}`,
            type: 'cta', // Using rect as overlay (hack reusing cta type or could assume background shape)
            // But we don't have a 'shape' type exposed easily here, but we can use a "cta" style block without text or use the background color
            // Actually, let's use a CTA layer as a dimmer.
            name: 'Dimmer',
            x: 0,
            y: 0,
            width: width,
            height: height,
            text: '',
            fontSize: 0,
            fontWeight: 400,
            fontFamily: 'Inter',
            color: 'transparent',
            bgColor: '#000000',
            radius: 0,
            visible: true,
            locked: true,
            zIndex: 1,
            rotation: 0,
            opacity: 0.6 // 60% dark overlay
        },
        // Headline
        {
            id: `headline_${Date.now()}`,
            type: 'text',
            name: 'Headline',
            x: padding,
            y: headlineY,
            width: width - padding * 2,
            height: 150,
            text: content.headline.toUpperCase(),
            fontSize: isVertical ? 72 : 64,
            fontWeight: 900,
            fontFamily: 'Inter',
            color: '#FFFFFF', // Always white on dark overlay
            align: 'center',
            visible: true,
            locked: false,
            zIndex: 10,
            rotation: 0,
            opacity: 1,
            lineHeight: 1.0,
            letterSpacing: -2
        },
        // Subheadline
        {
            id: `subheadline_${Date.now() + 1}`,
            type: 'text',
            name: 'Subheadline',
            x: padding,
            y: subheadlineY,
            width: width - padding * 2,
            height: 60,
            text: content.subheadline,
            fontSize: 24,
            fontWeight: 500,
            fontFamily: 'Inter',
            color: '#EEEEEE',
            align: 'center',
            visible: true,
            locked: false,
            zIndex: 11,
            rotation: 0,
            opacity: 0.9,
            lineHeight: 1.3,
            letterSpacing: 0
        },
        // CTA Button
        {
            id: `cta_${Date.now() + 2}`,
            type: 'cta',
            name: 'CTA Button',
            x: width / 2 - 150,
            y: ctaY,
            width: 300,
            height: 70,
            text: content.ctaText.toUpperCase(),
            fontSize: 20,
            fontWeight: 800,
            fontFamily: 'Inter',
            color: '#FFFFFF',
            bgColor: content.suggestedColors.accent,
            radius: 16,
            visible: true,
            locked: false,
            zIndex: 20,
            rotation: 0,
            opacity: 1
        }
    ];

    return {
        name: 'Generated Ad',
        width,
        height,
        backgroundColor: content.suggestedColors.background,
        layers: layers as StudioLayer[]
    };
}
