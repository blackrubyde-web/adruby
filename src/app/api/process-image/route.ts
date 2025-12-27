import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client (Prefer Service Role for robust uploads, fallback to Anon)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { imageUrl, productName, userId } = body;

        if (!imageUrl) {
            return NextResponse.json({ error: 'Missing imageUrl' }, { status: 400 });
        }

        console.log(`[API] Processing image for ${productName || 'unknown'}...`);

        // 1. Fetch image from OpenAI (Server-side, no CORS)
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to download image: ${response.statusText}`);
        }
        const imageBuffer = await response.arrayBuffer();

        // 2. Upload to Supabase Storage
        // Generate unique filename
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
            console.error('Supabase Upload Error:', uploadError);
            throw new Error(`Upload to storage failed: ${uploadError.message}`);
        }

        // 3. Get Public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('ad-images')
            .getPublicUrl(filename);

        return NextResponse.json({
            success: true,
            publicUrl,
            path: data.path
        });

    } catch (error: any) {
        console.error('[API] Image Processing Failed:', error);
        return NextResponse.json(
            { error: error.message || 'Internal processing error' },
            { status: 500 }
        );
    }
}
