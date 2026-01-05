import { requireUserId } from './_shared/auth.js';
import { withCors } from './utils/response.js';

export async function handler(event) {
    if (event.httpMethod === 'OPTIONS') return withCors({ statusCode: 200 });
    const { ok, response } = await requireUserId(event);
    if (!ok) return response;

    if (event.httpMethod !== 'POST') return { statusCode: 405, headers: withCors().headers, body: 'Make a POST request' };

    console.log('[ModelTraining] Received training data', event.body);

    // TODO: Forward to Python/Training pipeline
    return {
        statusCode: 200,
        headers: withCors().headers,
        body: JSON.stringify({ success: true, queued: true })
    };
}
