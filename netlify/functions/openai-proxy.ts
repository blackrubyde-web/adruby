import { createClient } from '@supabase/supabase-js';
import type { Handler, HandlerEvent } from '@netlify/functions';
import { isIP } from 'node:net';

/**
 * Netlify Function: OpenAI Proxy + Image Upload
 * Proxies requests to OpenAI API and handles backend image uploads
 */
export const handler: Handler = async (event: HandlerEvent) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers: corsHeaders,
            body: ''
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    // Get API key from environment
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    // Supabase credentials
    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const allowAnonymous = process.env.ALLOW_ANON_OPENAI_PROXY === 'true';

    // Check OpenAI Key
    if (!OPENAI_API_KEY) {
        console.error('❌ Configuration Error: OPENAI_API_KEY is missing.');
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server configuration error: OpenAI API Key missing' })
        };
    }

    try {
        const authHeader = event.headers.authorization || event.headers.Authorization;
        if (!allowAnonymous) {
            if (!authHeader) {
                return {
                    statusCode: 401,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Unauthorized' })
                };
            }
            if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
                return {
                    statusCode: 500,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Server configuration error: Supabase auth misconfigured' })
                };
            }
            const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                global: { headers: { Authorization: authHeader } }
            });
            const { data: { user }, error: authError } = await authClient.auth.getUser();
            if (authError || !user) {
                console.error('❌ Auth failed:', authError);
                return {
                    statusCode: 401,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Unauthorized' })
                };
            }
        }

        // Parse request body
        const body = JSON.parse(event.body || '{}');
        const { endpoint = 'chat/completions', processParams, ...requestData } = body;

        // *** HANDLE IMAGE UPLOAD (Supabase Storage) ***
        if (processParams && processParams.imageUrl) {
            // Check Supabase Config specifically for upload requests
            if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
                console.error('❌ Configuration Error: Missing Supabase credentials for upload.');
                return {
                    statusCode: 500,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Server configuration error: Storage credentials missing' })
                };
            }

            console.log('Backend: Processing image upload for:', processParams.productName);
            try {
                assertAllowedImageUrl(processParams.imageUrl);
            } catch (error) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        error: error instanceof Error ? error.message : 'Invalid imageUrl'
                    })
                };
            }
            const publicUrl = await handleImageUpload(processParams, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ publicUrl })
            };
        }

        // Validate endpoint (security)
        const allowedEndpoints = ['chat/completions', 'images/generations', 'images/edits', 'images/variations'];
        if (!allowedEndpoints.includes(endpoint)) {
            return {
                statusCode: 400,
                headers: corsHeaders,
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
                ...corsHeaders,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error('OpenAI proxy/upload error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
};

const DEFAULT_ALLOWED_IMAGE_HOSTS = (process.env.ALLOWED_IMAGE_HOSTS || '*.blob.core.windows.net,images.openai.com')
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);

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

function assertAllowedImageUrl(imageUrl: string): void {
    let parsed: URL;
    try {
        parsed = new URL(imageUrl);
    } catch {
        throw new Error('Invalid imageUrl');
    }

    if (parsed.protocol !== 'https:') {
        throw new Error('Only https URLs are allowed for image uploads');
    }

    const hostname = parsed.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname.endsWith('.local')) {
        throw new Error('Localhost image URLs are not allowed');
    }

    const ipVersion = isIP(hostname);
    if (ipVersion && isPrivateIp(hostname)) {
        throw new Error('Private network image URLs are not allowed');
    }

    if (DEFAULT_ALLOWED_IMAGE_HOSTS.length > 0) {
        const isAllowed = DEFAULT_ALLOWED_IMAGE_HOSTS.some((pattern) => matchesHostPattern(hostname, pattern));
        if (!isAllowed) {
            throw new Error(`Image host not allowed: ${hostname}`);
        }
    }
}

function matchesHostPattern(hostname: string, pattern: string): boolean {
    if (pattern.startsWith('*.')) {
        const suffix = pattern.slice(2);
        return hostname === suffix || hostname.endsWith(`.${suffix}`);
    }
    return hostname === pattern;
}

function isPrivateIp(ip: string): boolean {
    if (ip.includes(':')) {
        const normalized = ip.toLowerCase();
        return (
            normalized === '::1' ||
            normalized.startsWith('fe80:') ||
            normalized.startsWith('fc') ||
            normalized.startsWith('fd')
        );
    }

    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return false;
    const [a, b] = parts;
    return (
        a === 10 ||
        a === 127 ||
        a === 0 ||
        (a === 169 && b === 254) ||
        (a === 192 && b === 168) ||
        (a === 172 && b >= 16 && b <= 31)
    );
}
