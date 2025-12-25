import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { systemPrompt, userPrompt, model = 'gpt-4o-mini', temperature = 0.7 } = JSON.parse(event.body);

        if (!userPrompt) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing userPrompt' }) };
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

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
        };
    } catch (error) {
        console.error('OpenAI Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || 'Internal Server Error' }),
        };
    }
};
