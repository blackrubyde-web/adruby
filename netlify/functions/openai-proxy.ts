import { createClient } from '@supabase/supabase-js';
import type { Handler, HandlerEvent } from '@netlify/functions';

/**
 * Netlify Function: OpenAI Proxy + Image Upload
 * Proxies requests to OpenAI API and handles backend image uploads
 */
export const handler: Handler = async (event: HandlerEvent) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    // Get API key from environment
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

    // Supabase credentials
    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!OPENAI_API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'OpenAI API key not configured' })
        };
    }

    try {
        // Parse request body
        const body = JSON.parse(event.body || '{}');
        const { endpoint = 'chat/completions', processParams, ...requestData } = body;

        // *** HANDLE IMAGE UPLOAD (Supabase Storage) ***
        if (processParams && processParams.imageUrl) {
            if (!SUPABASE_URL || !SUPABASE_KEY) {
                console.error('Missing Supabase configuration');
                return {
                    statusCode: 500,
                    body: JSON.stringify({ error: 'Server storage configuration missing' })
                };
            }

            console.log('Backend: Processing image upload for:', processParams.productName);
            const publicUrl = await handleImageUpload(processParams, SUPABASE_URL, SUPABASE_KEY);

            return {
                statusCode: 200,
                body: JSON.stringify({ publicUrl })
            };
        }

        // Validate endpoint (security)
        const allowedEndpoints = ['chat/completions', 'images/generations', 'images/edits', 'images/variations'];
        if (!allowedEndpoints.includes(endpoint)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid endpoint' })
            };
        }

        // Call OpenAI API
        const response = await fetch(`https://api.openai.com/v1/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        // Return response
        return {
            statusCode: response.status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Allow from any origin (or restrict to your domain)
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error('OpenAI proxy/upload error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
};

/**
 * Handle server-side image upload to Supabase
 */
async function handleImageUpload(params: { imageUrl: string; productName: string }, supabaseUrl: string, supabaseKey: string): Promise<string> {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { imageUrl, productName } = params;

    // 1. Download image
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to download image from source: ${response.statusText}`);

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Generate filename
    const timestamp = Date.now();
    const cleanName = productName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const extension = 'png'; // DALL-E usually returns PNG
    const fileName = `generated/${cleanName}_${timestamp}.${extension}`;

    // 3. Upload to 'ad-images' bucket
    const { error: uploadError } = await supabase.storage
        .from('ad-images')
        .upload(fileName, buffer, {
            contentType: 'image/png',
            upsert: false
        });

    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

    // 4. Get Public URL
    const { data: { publicUrl } } = supabase.storage
        .from('ad-images')
        .getPublicUrl(fileName);

    return publicUrl;
}
