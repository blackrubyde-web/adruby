import { requireUserId } from './_shared/auth.js';
import { withCors } from './utils/response.js';

export async function handler(event) {
    if (event.httpMethod === 'OPTIONS') return withCors({ statusCode: 200 });
    const { ok, response } = await requireUserId(event);
    if (!ok) return response;

    return {
        statusCode: 501,
        headers: withCors().headers,
        body: JSON.stringify({
            success: false,
            error: 'Not Implemented',
            message: 'Image enhancement is not yet available.',
        }),
    };
}
