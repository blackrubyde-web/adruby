import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { imageUrl } = await request.json();

        if (!imageUrl) {
            return NextResponse.json(
                { error: 'Image URL is required' },
                { status: 400 }
            );
        }

        // Option 1: Use remove.bg API
        if (process.env.REMOVEBG_API_KEY) {
            const formData = new FormData();
            formData.append('image_url', imageUrl);
            formData.append('size', 'auto');
            formData.append('format', 'png');

            const response = await fetch('https://api.remove.bg/v1.0/removebg', {
                method: 'POST',
                headers: {
                    'X-Api-Key': process.env.REMOVEBG_API_KEY
                },
                body: formData
            });

            if (response.ok) {
                const buffer = await response.arrayBuffer();
                const base64 = Buffer.from(buffer).toString('base64');
                const processedUrl = `data:image/png;base64,${base64}`;

                return NextResponse.json({
                    processedUrl,
                    success: true,
                    provider: 'remove.bg'
                });
            }
        }

        // Option 2: Use Clipdrop API (alternative)
        if (process.env.CLIPDROP_API_KEY) {
            const imageResponse = await fetch(imageUrl);
            const imageBlob = await imageResponse.blob();

            const formData = new FormData();
            formData.append('image_file', imageBlob);

            const response = await fetch('https://clipdrop-api.co/remove-background/v1', {
                method: 'POST',
                headers: {
                    'x-api-key': process.env.CLIPDROP_API_KEY
                },
                body: formData
            });

            if (response.ok) {
                const buffer = await response.arrayBuffer();
                const base64 = Buffer.from(buffer).toString('base64');
                const processedUrl = `data:image/png;base64,${base64}`;

                return NextResponse.json({
                    processedUrl,
                    success: true,
                    provider: 'clipdrop'
                });
            }
        }

        // No API configured - return error
        return NextResponse.json({
            error: 'No background removal API configured. Set REMOVEBG_API_KEY or CLIPDROP_API_KEY in environment.',
            processedUrl: imageUrl,
            success: false
        }, { status: 503 });

    } catch (error: any) {
        console.error('Background removal error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to remove background', success: false },
            { status: 500 }
        );
    }
}
