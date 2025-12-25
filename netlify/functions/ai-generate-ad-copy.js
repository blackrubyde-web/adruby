import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    try {
        const { productName, niche, benefits, targetAudience, mood, hookIdeas } = JSON.parse(event.body);

        const systemPrompt = `You are a world-class ad copywriter. Generate compelling ad copy for Facebook/Instagram ads.

Return a JSON object with:
{
    "headline": "Short, punchy headline (max 6 words, uppercase works well)",
    "subheadline": "Supporting line that expands on the headline (max 15 words)", 
    "ctaText": "Call-to-action button text (2-4 words)",
    "bodyText": "Optional longer description (max 30 words)",
    "hooks": ["3 different scroll-stopping hooks for the ad"],
    "urgencyElement": "Optional urgency text like 'Limited Time' or 'Only X Left'"
}

Use power words, create urgency, speak to pain points. Be direct and benefit-focused.
Mood: ${mood || 'professional'}
Target: ${targetAudience || 'general audience'}`;

        const userPrompt = `Create ad copy for: ${productName}
Industry: ${niche}
Key Benefits: ${benefits?.join(', ') || 'Not specified'}
Hook ideas to consider: ${hookIdeas?.join(', ') || 'None provided'}`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 500,
            response_format: { type: 'json_object' }
        });

        const copy = JSON.parse(response.choices[0].message.content);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                copy
            }),
        };
    } catch (error) {
        console.error('Ad Copy Generation Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message || 'Copy generation failed'
            }),
        };
    }
};
