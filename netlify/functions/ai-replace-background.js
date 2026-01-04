import OpenAI from 'openai';
import { requireUserId } from './_shared/auth.js';
import { badRequest, methodNotAllowed, ok, withCors } from './utils/response.js';

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

        const { imageUrl, backgroundPrompt } = JSON.parse(event.body);

        if (!backgroundPrompt) {
            return badRequest('Missing backgroundPrompt');
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

        return ok({
            success: true,
            imageUrl: newImageUrl,
            originalImage: imageUrl,
            revisedPrompt: response.data[0].revised_prompt
        });
    } catch (error) {
        console.error('Background Replace Error:', error);
        return withCors({
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: error.message || 'Background replacement failed'
            })
        });
    }
};
