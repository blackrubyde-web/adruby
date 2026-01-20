/**
 * LLM Ad Render - Full Pipeline: Layout → Canvas → PNG
 * 
 * This function takes a solved layout and renders it to a PNG image.
 * 
 * Pipeline:
 * 1. Layout JSON (from constraint solver) → Canvas Renderer
 * 2. SVG generation with text, CTAs, elements
 * 3. Sharp → PNG buffer → Base64
 */

import { renderLayout, compositeProductImage } from './_shared/canvasRenderer.js';

// ============================================================
// HANDLER
// ============================================================

export async function handler(event) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const { layout, copy, style, background, productImage } = body;

        if (!layout || !layout.elements) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Invalid layout: missing elements'
                })
            };
        }

        console.log('[LLM-Render-Image] Rendering layout with', Object.keys(layout.elements).length, 'elements');

        // Render layout to PNG
        const startTime = Date.now();
        let pngBuffer = await renderLayout(layout, {
            copy: copy || {},
            style: style || {},
            background
        });

        // If product image is provided, composite it onto the first image element
        if (productImage) {
            const imageElement = Object.entries(layout.elements)
                .find(([, el]) => el.type === 'image');

            if (imageElement) {
                console.log('[LLM-Render-Image] Compositing product image...');
                const productBuffer = Buffer.from(productImage, 'base64');
                pngBuffer = await compositeProductImage(
                    pngBuffer,
                    productBuffer,
                    imageElement[1]
                );
            }
        }

        const renderTime = Date.now() - startTime;
        console.log('[LLM-Render-Image] ✓ Rendered in', renderTime, 'ms');

        // Convert to base64 for JSON response
        const base64 = pngBuffer.toString('base64');

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                image: base64,
                mimeType: 'image/png',
                size: pngBuffer.length,
                renderTime
            })
        };

    } catch (error) {
        console.error('[LLM-Render-Image] Error:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: error.message || 'Failed to render image',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
}
