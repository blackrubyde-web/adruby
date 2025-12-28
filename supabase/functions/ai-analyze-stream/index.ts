import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // 1. AUTH CHECK
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) throw new Error('Missing Auth Header');

        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseKey, {
            global: { headers: { Authorization: authHeader } },
        });

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error('Unauthorized');

        // 2. PARSE REQUEST
        const { campaigns } = await req.json();
        if (!campaigns || !Array.isArray(campaigns)) {
            throw new Error('Invalid campaigns data');
        }

        // 3. STREAMING RESPONSE
        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                try {
                    // Send Start Marker
                    controller.enqueue(encoder.encode(JSON.stringify({ status: 'started', count: campaigns.length }) + '\n'));

                    const analyses = [];

                    for (let i = 0; i < campaigns.length; i++) {
                        const campaign = campaigns[i];

                        // Notify Client: Processing Campaign X
                        controller.enqueue(encoder.encode(`[CAMPAIGN:${i}]\n`));

                        // REAL AI CALL (Simulated for speed in this fix, can act as proxy later)
                        // In a real scenario, we would call OpenAI per campaign here.
                        // For now, we restore the "Mock" logic but ON THE SERVER side to prove end-to-end connectivity.

                        const analysis = {
                            campaignName: campaign.name || `Campaign ${i + 1}`,
                            score: Math.floor(Math.random() * 30) + 70, // 70-100
                            insights: [
                                "Targeting looks solid.",
                                "Creative could be more engaging.",
                                "Budget allocation is optimal."
                            ]
                        };

                        // Simulate AI Latency
                        await new Promise(r => setTimeout(r, 500));

                        analyses.push(analysis);

                        // Stream partial result
                        controller.enqueue(encoder.encode(JSON.stringify({ type: 'progress', index: i, analysis }) + '\n'));
                    }

                    // Send Final Result
                    controller.enqueue(encoder.encode(JSON.stringify({ analyses })));
                    controller.close();
                } catch (e) {
                    controller.error(e);
                }
            },
        });

        return new Response(readable, {
            headers: {
                ...corsHeaders,
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
