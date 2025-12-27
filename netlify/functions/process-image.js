
import { createClient } from '@supabase/supabase-js';

// Netlify Function to handle Server-Side Image Uploads (Bypassing CORS & Supabase Edge Function issues)
export const handler = async (event) => {
    // CORS Headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Handle Preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: 'ok' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const { processParams } = JSON.parse(event.body);
        // Support both direct params and wrapped in processParams
        const { imageUrl, productName, userId } = processParams || JSON.parse(event.body);

        if (!imageUrl) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing imageUrl' }) };
        }

        // Initialize Supabase (Try standard Env vars, fallback to Vite ones)
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase Config in Netlify Env');
            return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server Configuration Error: Missing Supabase Credentials' }) };
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log(`Processing image for ${productName}...`);

        // 1. Fetch Image from DALL-E (Server-side)
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
            throw new Error(`Failed to fetch source image: ${imageResponse.statusText}`);
        }
        const arrayBuffer = await imageResponse.arrayBuffer();

        // 2. Upload to Supabase Storage
        const cleanName = productName ? productName.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'image';
        const filename = `${userId || 'anon'}/${Date.now()}-${cleanName}.png`;

        const { data, error: uploadError } = await supabase.storage
            .from('ad-images')
            .upload(filename, arrayBuffer, {
                contentType: 'image/png',
                upsert: false
            });

        if (uploadError) {
            throw new Error(`Supabase Upload Failed: ${uploadError.message}`);
        }

        // 3. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('ad-images')
            .getPublicUrl(filename);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, publicUrl })
        };

    } catch (error) {
        console.error('Process Image Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message || 'Internal Server Error' })
        };
    }
};
