// Text-to-Ad AI Generator
// Takes a product description and generates a complete ad layout using Premium Templates

import type { AdDocument } from '../../types/studio';
import { apiClient } from '../../utils/apiClient';
import { AD_TEMPLATES } from './presets';
import { injectContentIntoTemplate } from './TemplateEngine';

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
    "headline": "A short, punchy headline (max 6 words) for a Facebook Ad image",
    "subheadline": "A supporting line (max 12 words) focusing on benefit or problem/solution",
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
Be direct. Use "Hook -> Benefit" structure. Avoid generic fluff.`;

    try {
        const data = await apiClient.post<{ text: string }>(
            '/api/ai-generate-text',
            {
                systemPrompt,
                userPrompt: `Product/Service: ${description}`,
                model: 'gpt-4o-mini'
            }
        );
        try {
            // Parse the JSON from the response
            let cleanedText = data.text.trim();
            // Remove markdown code blocks if present
            if (cleanedText.startsWith('```')) {
                cleanedText = cleanedText.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '');
            }

            const parsed = JSON.parse(cleanedText);
            return parsed;
        } catch (e) {
            console.warn('Failed to parse AI response, using fallback', e);
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

// Image candidates for different niches (Fallback if template doesn't have one)
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
    saas: [ // Tech / Laptop shots
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1080&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1080&auto=format&fit=crop'
    ],
    ecommerce: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1080&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1080&auto=format&fit=crop'
    ],
    coach: [
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1080&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1080&auto=format&fit=crop'
    ],
    realestate: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1080&auto=format&fit=crop'
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
        'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1080&auto=format&fit=crop'
    ]
};

// Create a complete AdDocument from generated content
export function createAdFromContent(
    content: GeneratedAdContent,
    format: { width: number; height: number } = { width: 1080, height: 1080 }
): Partial<AdDocument> {
    const { width, height } = format;
    // 1. Select a Template
    // Prioritize templates matching the suggested niche
    const nicheTemplates = AD_TEMPLATES.filter(t => t.niche === content.suggestedNiche);

    // If no niche match, or we want randomness, allow fallback to generic ecommerce/saas as they are versatile
    const candidateTemplates = nicheTemplates.length > 0
        ? nicheTemplates
        : AD_TEMPLATES.filter(t => ['ecommerce', 'saas'].includes(t.niche));

    // Fallback if still empty (shouldn't happen)
    const templatesToUse = candidateTemplates.length > 0 ? candidateTemplates : AD_TEMPLATES;

    // Pick random
    const selectedTemplate = templatesToUse[Math.floor(Math.random() * templatesToUse.length)];

    // 2. Resolve Image (if template needs one and we want to freshen it)
    // For now, we prefer the template's carefully curated image if it's there,
    // but many templates might reuse the same image. To keep it "fresh", we pick a niche image.

    const nicheImages = NICHE_IMAGES[content.suggestedNiche] || NICHE_IMAGES.ecommerce;
    const randomImage = nicheImages[Math.floor(Math.random() * nicheImages.length)];

    // 3. Inject Content
    const doc = injectContentIntoTemplate(selectedTemplate.document, content, {
        targetImage: randomImage,
        niche: content.suggestedNiche
    });

    // 4. Ensure Format Matches (Resize/Crop) - Basic scaling
    // Only simple overrides for now: set doc width/height
    doc.width = width;
    doc.height = height;

    // 5. Assign Name
    doc.name = selectedTemplate.name + ' (AI)';

    return doc;
}
