/**
 * LLM Ad Render - Full Pipeline: Claude → Constraints → Layout JSON
 * 
 * This function orchestrates the complete scene graph to layout pipeline:
 * 1. Receives scene graph from Claude Creative Director
 * 2. Solves constraints using kiwi.js
 * 3. Returns solved layout with pixel coordinates
 * 
 * The layout JSON can then be used by a canvas renderer to draw the final ad.
 */

import { solveLayout } from './_shared/constraintSolver.js';

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
        const { sceneGraph, canvasWidth = 1080, canvasHeight = 1080 } = body;

        if (!sceneGraph || !sceneGraph.elements || !sceneGraph.relations) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Invalid scene graph: missing elements or relations'
                })
            };
        }

        console.log('[LLM-Render] Solving constraints for', sceneGraph.elements.length, 'elements');

        // Solve constraints
        const layout = solveLayout(sceneGraph, canvasWidth, canvasHeight);

        console.log('[LLM-Render] ✓ Layout solved:', Object.keys(layout.elements).length, 'elements positioned');

        // Validate layout (warn about overlaps or off-canvas elements)
        const warnings = [];
        const elementIds = Object.keys(layout.elements);

        for (const id of elementIds) {
            const el = layout.elements[id];

            if (el.x < 0 || el.y < 0) {
                warnings.push(`Element '${id}' has negative position`);
            }
            if (el.x + el.width > canvasWidth || el.y + el.height > canvasHeight) {
                warnings.push(`Element '${id}' extends beyond canvas`);
            }
        }

        // Check for significant overlaps
        for (let i = 0; i < elementIds.length; i++) {
            for (let j = i + 1; j < elementIds.length; j++) {
                const a = layout.elements[elementIds[i]];
                const b = layout.elements[elementIds[j]];

                // Check if rectangles overlap significantly (more than 50%)
                const overlapX = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
                const overlapY = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
                const overlapArea = overlapX * overlapY;
                const smallerArea = Math.min(a.width * a.height, b.width * b.height);

                if (overlapArea > smallerArea * 0.5) {
                    // Check if this is an intentional overlay relation
                    const isIntentional = sceneGraph.relations.some(
                        r => (r.from === elementIds[i] && r.to === elementIds[j] && r.type === 'overlay') ||
                            (r.from === elementIds[j] && r.to === elementIds[i] && r.type === 'overlay')
                    );

                    if (!isIntentional) {
                        warnings.push(`Elements '${elementIds[i]}' and '${elementIds[j]}' have significant overlap`);
                    }
                }
            }
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                layout,
                sceneGraph: {
                    composition: sceneGraph.composition,
                    copy: sceneGraph.copy,
                    style: sceneGraph.style,
                    background: sceneGraph.background
                },
                warnings: warnings.length > 0 ? warnings : undefined
            })
        };

    } catch (error) {
        console.error('[LLM-Render] Error:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: error.message || 'Failed to solve layout constraints',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
}
