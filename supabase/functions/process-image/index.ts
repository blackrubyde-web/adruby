import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { imageUrl, productName, userId } = await req.json();

        if (!imageUrl) {
            throw new Error('Missing imageUrl');
        }

        console.log(`[Process Image] Processing image for ${productName || 'unknown product'}`);

        // 1. Fetch the image from the external URL (e.g., OpenAI DALL-E)
        // Accessing external URLs from the backend avoids CORS issues
        const imageResponse = await fetch(imageUrl);

        if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image from source: ${imageResponse.statusText}`);
        }

        const imageBlob = await imageResponse.blob();

        // 2. Upload to Supabase Storage
        // Use the service role key to bypass RLS for administrative uploads if needed, 
        // or just use the standard client if the user has permissions. 
        // Here we use the service role key for reliability in this background process.

        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing Supabase configuration');
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const filename = `${userId || 'anon'}/${Date.now()}-${productName?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'generated'}.png`;

        const { data, error: uploadError } = await supabase
            .storage
            .from('ad-images')
            .upload(filename, imageBlob, {
                contentType: 'image/png',
                upsert: false
            });

        if (uploadError) {
            throw new Error(`Upload failed: ${uploadError.message}`);
        }

        // 3. Get Public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('ad-images')
            .getPublicUrl(filename);

        console.log(`[Process Image] Success! Saved to: ${publicUrl}`);

        return new Response(JSON.stringify({
            success: true,
            publicUrl,
            path: data.path
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error('[Process Image] Error:', error);
        return new Response(JSON.stringify({
            error: error.message || 'Internal server error',
            stack: error.stack
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
