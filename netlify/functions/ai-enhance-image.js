import { requireUserId } from './_shared/auth.js';
import { withCors } from './utils/response.js';

export async function handler(event) {
    if (event.httpMethod === 'OPTIONS') return withCors({ statusCode: 200 });
    const { ok, response } = await requireUserId(event);
    if (!ok) return response;

    if (event.httpMethod !== 'POST') return { statusCode: 405, headers: withCors().headers, body: 'Make a POST request' };

    console.log('[EnhanceImage] Enhancing image request received');

    // Stub response matching EnhanceImageResult interface
    return {
        statusCode: 200,
        headers: withCors().headers,
        body: JSON.stringify({
            success: true,
            enhancedUrl: 'https://placehold.co/2160x2160?text=Enhanced+2x',
            originalSize: { width: 1080, height: 1080 },
            enhancedSize: { width: 2160, height: 2160 },
            processingTime: 850
        })
    };
}
