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
        const requestData = await req.json();
        const { endpoint, method = 'POST', headers: customHeaders, ...openaiParams } = requestData;

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
