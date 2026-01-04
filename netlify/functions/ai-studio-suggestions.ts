/**
 * AI Studio Suggestions Endpoint
 * Analyzes ad document and provides actionable improvement suggestions
 */

import OpenAI from 'openai';
import { requireUserId } from './_shared/auth.js';
import { badRequest, methodNotAllowed, ok, withCors } from './utils/response.js';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function handler(event: any) {
    // CORS
    if (event.httpMethod === 'OPTIONS') {
        return withCors({ statusCode: 204, body: '' });
    }

    if (event.httpMethod !== 'POST') {
        return methodNotAllowed('POST,OPTIONS');
    }

    try {
        const auth = await requireUserId(event);
        if (!auth.ok) return auth.response;

        const { doc } = JSON.parse(event.body || '{}');

        if (!doc || !doc.layers) {
            return badRequest('Missing ad document');
        }

        // Analyze document
        const analysis = analyzeDocument(doc);

        // Get AI suggestions
        const suggestions = await generateSuggestions(doc, analysis);

        return ok({
            success: true,
            suggestions,
            analysis
        });
    } catch (error: any) {
        console.error('AI Suggestions error:', error);
        return withCors({
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: error.message,
                // Fallback suggestions
                suggestions: getFallbackSuggestions(event.body ? JSON.parse(event.body).doc : null)
            })
        });
    }
}

function analyzeDocument(doc: any) {
    const layers = doc.layers || [];

    return {
        layerCount: layers.length,
        hasText: layers.some((l: any) => l.type === 'text'),
        hasCTA: layers.some((l: any) => l.type === 'cta'),
        hasImage: layers.some((l: any) => ['image', 'product', 'overlay'].includes(l.type)),
        textLayers: layers.filter((l: any) => l.type === 'text').length,
        avgFontSize: layers
            .filter((l: any) => l.fontSize)
            .reduce((sum: number, l: any) => sum + (l.fontSize || 0), 0) /
            Math.max(1, layers.filter((l: any) => l.fontSize).length)
    };
}

async function generateSuggestions(doc: any, analysis: any) {
    const prompt = `Analyze this ad design and provide 3-5 specific, actionable suggestions for improvement.

Ad Details:
- Dimensions: ${doc.width}×${doc.height}
- Layers: ${analysis.layerCount}
- Has Text: ${analysis.hasText}
- Has CTA: ${analysis.hasCTA}
- Has Images: ${analysis.hasImage}

Focus on:
1. Visual hierarchy and layout
2. Text readability and contrast
3. CTA prominence
4. Color harmony
5. Mobile optimization

Return JSON array of suggestions with format:
{
  "title": "Short actionable title",
  "description": "Detailed explanation",
  "category": "layout|text|color|cta|mobile",
  "impact": "high|medium|low",
  "autoFixAction": {
    "action": "resize|recolor|reposition",
    "targetLayerId": "layer-id",
    "params": { "width": 200, "height": 50 }
  }
}`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert ad designer. Provide specific, actionable suggestions in JSON format.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');
        return result.suggestions || [];
    } catch (error) {
        console.error('OpenAI error:', error);
        return getFallbackSuggestions(doc);
    }
}

function getFallbackSuggestions(doc: any) {
    if (!doc) {
        return [];
    }

    const suggestions = [];
    const layers = doc.layers || [];

    // Find CTA button
    const ctaLayer = layers.find((l: any) => l.type === 'cta');
    if (ctaLayer && ctaLayer.width < 180) {
        suggestions.push({
            title: 'CTA Button größer machen',
            description: 'Der Call-to-Action Button ist etwas klein. Größere Buttons haben höhere Click-Raten.',
            category: 'cta',
            impact: 'high',
            autoFixAction: {
                action: 'resize',
                targetLayerId: ctaLayer.id,
                params: {
                    width: Math.round(ctaLayer.width * 1.3),
                    height: Math.round(ctaLayer.height * 1.2)
                }
            }
        });
    }

    // Check text contrast
    const textLayers = layers.filter((l: any) => l.type === 'text');
    const darkText = textLayers.find((l: any) =>
        l.fill && (l.fill === '#000000' || l.fill.startsWith('#0') || l.fill.startsWith('#1'))
    );

    if (darkText && doc.backgroundColor && doc.backgroundColor.startsWith('#e')) {
        suggestions.push({
            title: 'Text-Kontrast verbessern',
            description: 'Dunkler Text auf hellem Hintergrund - überlege weißen Text für mehr Pop.',
            category: 'text',
            impact: 'medium',
            autoFixAction: {
                action: 'recolor',
                targetLayerId: darkText.id,
                params: {
                    fill: '#FFFFFF',
                    color: '#FFFFFF'
                }
            }
        });
    }

    // Layout suggestion
    if (layers.length > 5) {
        suggestions.push({
            title: 'Visuelles Decluttering',
            description: 'Mit vielen Layern kann es überladen wirken. Fokus auf 1-2 Kernelemente.',
            category: 'layout',
            impact: 'medium'
        });
    }

    return suggestions;
}
