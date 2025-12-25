import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
    try {
        const { systemPrompt, userPrompt, model = 'gpt-4o-mini' } = await request.json();

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'OpenAI API key not configured' },
                { status: 500 }
            );
        }

        const completion = await openai.chat.completions.create({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.8,
            max_tokens: 200
        });

        const text = completion.choices[0]?.message?.content?.trim() || '';

        // Generate alternatives with slightly different temperature
        const alternativesCompletion = await openai.chat.completions.create({
            model,
            messages: [
                { role: 'system', content: systemPrompt + '\nGenerate 3 different variations, one per line.' },
                { role: 'user', content: userPrompt }
            ],
            temperature: 1.0,
            max_tokens: 300
        });

        const alternativesText = alternativesCompletion.choices[0]?.message?.content?.trim() || '';
        const alternatives = alternativesText.split('\n').filter(line => line.trim().length > 0).slice(0, 3);

        return NextResponse.json({ text, alternatives });
    } catch (error: any) {
        console.error('OpenAI API error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate text' },
            { status: 500 }
        );
    }
}
