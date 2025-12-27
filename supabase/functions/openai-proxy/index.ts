import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        try {
            const requestData = await req.json();

            // -----------------------------------------------------
            // NEW: Handle Image Processing (Merged into this function)
            // -----------------------------------------------------
            if (requestData.processParams) {
                console.log('[OpenAI Proxy] Handling Image Processing Request...');
                const { imageUrl, productName, userId } = requestData.processParams;

                if (!imageUrl) throw new Error('Missing imageUrl');

                // 1. Fetch from external URL (Server-side download)
                const imageResponse = await fetch(imageUrl);
                if (!imageResponse.ok) throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
                const imageBlob = await imageResponse.blob();

                // 2. Upload to Supabase
                const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.7.1");
                const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
                const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

                if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase Config');

                const supabase = createClient(supabaseUrl, supabaseKey);

                const filename = `${userId || 'anon'}/${Date.now()}-${productName?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'processed'}.png`;

                const { data, error: uploadError } = await supabase
                    .storage
                    .from('ad-images')
                    .upload(filename, imageBlob, { contentType: 'image/png', upsert: false });

                if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

                const { data: { publicUrl } } = supabase
                    .storage
                    .from('ad-images')
                    .getPublicUrl(filename);

                console.log(`[OpenAI Proxy] Image processed & saved: ${publicUrl}`);

                return new Response(JSON.stringify({ success: true, publicUrl }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200,
                });
            }

            // -----------------------------------------------------
            // OLD: Standard OpenAI Proxy Logic
            // -----------------------------------------------------
            const { endpoint, method = 'POST', headers: customHeaders, ...openaiParams } = requestData;

            // ONLY Validate endpoint if NOT processing image
            if (!endpoint) {
                throw new Error('Missing endpoint');
            }

            const apiKey = Deno.env.get('OPENAI_API_KEY');
            if (!apiKey) {
                throw new Error('Missing OPENAI_API_KEY');
            }

            const url = `https://api.openai.com/v1/${endpoint}`;

            console.log(`[OpenAI Proxy] ${method} ${url}`);
            console.log('[OpenAI Proxy] Params:', JSON.stringify(openaiParams, null, 2));

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
                console.error('[OpenAI Proxy] Error:', response.status, data);
                return new Response(JSON.stringify({
                    error: data.error?.message || 'OpenAI API request failed',
                    details: data
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: response.status,
                });
            }

            console.log('[OpenAI Proxy] Success');

            return new Response(JSON.stringify(data), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        } catch (error: any) {
            console.error('[OpenAI Proxy] Exception:', error);
            return new Response(JSON.stringify({
                error: error.message || 'Internal server error',
                stack: error.stack
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            });
        }
    });
