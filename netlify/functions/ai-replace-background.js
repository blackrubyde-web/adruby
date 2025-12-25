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
        const { imageUrl, backgroundPrompt } = JSON.parse(event.body);

        if (!backgroundPrompt) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing backgroundPrompt' })
            };
        }

        // For background replacement, we generate a new background image
        // In a full implementation, you would use image editing/inpainting APIs
        const enhancedPrompt = `Background scene for product photography: ${backgroundPrompt}. 
Empty space in center for product placement, professional lighting, 
seamless edges, high-end commercial quality, 4K resolution.`;

        const response = await openai.images.generate({
            model: 'dall-e-3',
            prompt: enhancedPrompt,
            n: 1,
            size: '1024x1024',
            quality: 'hd',
            style: 'natural',
        });

        const newImageUrl = response.data[0].url;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                imageUrl: newImageUrl,
                originalImage: imageUrl,
                revisedPrompt: response.data[0].revised_prompt
            }),
        };
    } catch (error) {
        console.error('Background Replace Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message || 'Background replacement failed'
            }),
        };
    }
};
