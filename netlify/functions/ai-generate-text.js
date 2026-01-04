import OpenAI from 'openai';
import { requireUserId } from './_shared/auth.js';
import { badRequest, methodNotAllowed, ok, serverError, withCors } from './utils/response.js';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return withCors({ statusCode: 204, body: '' });
    }

    if (event.httpMethod !== 'POST') {
        return methodNotAllowed('POST,OPTIONS');
    }

    try {
        const auth = await requireUserId(event);
        if (!auth.ok) return auth.response;

        const { systemPrompt, userPrompt, model = 'gpt-4o-mini', temperature = 0.7 } = JSON.parse(event.body);

        if (!userPrompt) {
            return badRequest('Missing userPrompt');
        }

        const completion = await openai.chat.completions.create({
            model: model,
            messages: [
                { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
                { role: 'user', content: userPrompt }
            ],
            temperature: temperature,
        });

        const text = completion.choices[0].message.content;

        return ok({ text });
    } catch (error) {
        console.error('OpenAI Error:', error);
        return serverError(error.message || 'Internal Server Error');
    }
};
