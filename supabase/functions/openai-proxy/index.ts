import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // We rely on Auth Token for security.
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // 1. Handle CORS Preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // 2. AUTHENTICATION CHECK (CRITICAL)
        // Get the JWT from the Authorization header
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error('Missing Authorization header');
        }

        // Initialize Supabase Client with the Auth header
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''; // Use Anon key for client-like interaction, or Service Role if needed for admin tasks. 
        // Ideally we verify the token. The clean way in Edge Functions is creating a client with the access token.

        const supabase = createClient(supabaseUrl, supabaseKey, {
            global: { headers: { Authorization: authHeader } },
        });

        // Verify the user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('[OpenAI Proxy] Auth failed:', authError);
            return new Response(JSON.stringify({ error: 'Unauthorized', details: authError }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const requestData = await req.json();

        // 3. IMAGE PROCESSING LOGIC
        if (requestData.processParams) {
            console.log('[OpenAI Proxy] Handling Image Processing Request for User:', user.id);
            const { imageUrl, productName } = requestData.processParams;

            if (!imageUrl) throw new Error('Missing imageUrl');

            // Fetch from external URL
            const imageResponse = await fetch(imageUrl);
            if (!imageResponse.ok) throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
            const imageBlob = await imageResponse.blob();

            // Use Service Role for Storage Upload (Bypasses RLS for the "upload" part if needed, 
            // but we should ideally respect RLS. For now, to guarantee it works, we use the Service Role 
            // for the admin task of saving the processed file, or reuse the auth client if rules allow.)
            // Let's use Service Role to be safe with Storage permissions for this generated asset.
            const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
            const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

            const filename = `${user.id}/${Date.now()}-${productName?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'processed'}.png`;

            const { error: uploadError } = await adminSupabase
                .storage
                .from('ad-images')
                .upload(filename, imageBlob, { contentType: 'image/png', upsert: false });

            if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

            const { data: { publicUrl } } = adminSupabase
                .storage
                .from('ad-images')
                .getPublicUrl(filename);

            return new Response(JSON.stringify({ success: true, publicUrl }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        // 4. OPENAI PROXY LOGIC
        // Only allow authenticated users to hit OpenAI
        const { endpoint, method = 'POST', headers: customHeaders, ...openaiParams } = requestData;

        if (!endpoint) throw new Error('Missing endpoint');

        // OPTIONAL: Whitelist specific endpoints to prevent abuse?
        // const ALLOWED_ENDPOINTS = ['chat/completions', 'images/generations', 'images/edits'];
        // if (!ALLOWED_ENDPOINTS.includes(endpoint)) throw new Error('Endpoint not allowed');

        const apiKey = Deno.env.get('OPENAI_API_KEY');
        if (!apiKey) throw new Error('Missing Server Configuration');

        const url = `https://api.openai.com/v1/${endpoint}`;
        console.log(`[OpenAI Proxy] ${method} ${url} (User: ${user.id})`);

        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                ...customHeaders,
            },
            body: JSON.stringify(openaiParams),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('[OpenAI Proxy] Upstream Error:', data);
            return new Response(JSON.stringify({ error: 'OpenAI Error', details: data }), {
                status: response.status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        console.error('[OpenAI Proxy] Internal Error:', error);
        return new Response(JSON.stringify({
            error: error.message || 'Internal Server Error',
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
