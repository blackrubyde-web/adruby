import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    try {
        const { prompt, referenceImage, size = '1024x1024', style = 'vivid' } = JSON.parse(event.body);

        if (!prompt) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing prompt' })
            };
        }

        // Enhance the prompt for product photography
        const enhancedPrompt = `Professional product photography: ${prompt}. 
High-end commercial quality, studio lighting, 4K resolution, 
sharp details, clean composition, advertising-ready.`;

        const response = await openai.images.generate({
            model: 'dall-e-3',
            prompt: enhancedPrompt,
            n: 1,
            size: size,
            quality: 'hd',
            style: style,
        });

        const imageUrl = response.data[0].url;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                imageUrl,
                revisedPrompt: response.data[0].revised_prompt
            }),
        };
    } catch (error) {
        console.error('DALL-E Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message || 'Image generation failed'
            }),
        };
    }
};
