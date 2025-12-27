import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { imageUrl, productName, userId } = body as { imageUrl: string; productName?: string; userId?: string };

        if (!imageUrl) {
            return Response.json({ error: 'Missing imageUrl' }, { status: 400 });
        }

        // 1. Fetch from OpenAI
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to download image: ${response.statusText}`);
        }
        const imageBuffer = await response.arrayBuffer();

        // 2. Upload to Supabase
        const cleanName = productName?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'processed';
        const filename = `${userId || 'anon'}/${Date.now()}-${cleanName}.png`;

        const { data, error: uploadError } = await supabase
            .storage
            .from('ad-images')
            .upload(filename, imageBuffer, {
                contentType: 'image/png',
                upsert: false
            });

        if (uploadError) {
            throw new Error(`Upload to storage failed: ${uploadError.message}`);
        }

        // 3. Get URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('ad-images')
            .getPublicUrl(filename);

        return Response.json({
            success: true,
            publicUrl,
            path: data.path
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Internal processing error';
        return Response.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
