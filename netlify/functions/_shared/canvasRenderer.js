/**
 * Canvas Renderer - Layout to Final Image
 * 
 * Uses Sharp + SVG to render the solved layout into a final PNG image.
 * This approach works on Netlify Functions without native dependencies.
 * 
 * Pipeline:
 * 1. Layout JSON (from constraint solver) → SVG generation
 * 2. SVG → Sharp → PNG buffer
 * 3. Optionally composite with uploaded product images
 */

import sharp from 'sharp';

// ============================================================
// TYPES
// ============================================================

/**
 * @typedef {Object} LayoutElement
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 * @property {string} type
 * @property {string} role
 * @property {number} [priority]
 */

/**
 * @typedef {Object} SolvedLayout
 * @property {Record<string, LayoutElement>} elements
 * @property {number} canvasWidth
 * @property {number} canvasHeight
 */

/**
 * @typedef {Object} RenderOptions
 * @property {Object} copy - Text content
 * @property {Object} style - Style preferences
 * @property {Object} [background] - Background settings
 * @property {Buffer[]} [images] - Uploaded image buffers
 */

// ============================================================
// COLOR SCHEMES
// ============================================================

const COLOR_SCHEMES = {
    modern: {
        background: '#0D0D0D',
        primary: '#FF4444',
        secondary: '#1A1A2E',
        text: '#FFFFFF',
        subtext: '#A0A0A0',
        accent: '#FF6B6B'
    },
    luxury: {
        background: '#0A0A0A',
        primary: '#D4AF37',
        secondary: '#1C1C1C',
        text: '#FFFFFF',
        subtext: '#C0C0C0',
        accent: '#FFD700'
    },
    aggressive: {
        background: '#000000',
        primary: '#FF0000',
        secondary: '#1A0000',
        text: '#FFFFFF',
        subtext: '#FF8080',
        accent: '#FF3333'
    },
    minimal: {
        background: '#FFFFFF',
        primary: '#000000',
        secondary: '#F5F5F5',
        text: '#000000',
        subtext: '#666666',
        accent: '#333333'
    }
};

// ============================================================
// SVG GENERATORS
// ============================================================

function escapeXml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function generateBackgroundSVG(width, height, colors, background) {
    if (background?.type === 'gradient') {
        return `
            <defs>
                <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${colors.background};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="${width}" height="${height}" fill="url(#bg-gradient)"/>
        `;
    }
    return `<rect width="${width}" height="${height}" fill="${colors.background}"/>`;
}

function generateTextSVG(element, text, colors, isHeadline = false) {
    const { x, y, width, height } = element;
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    const fontSize = isHeadline ? Math.min(72, width / 10) : Math.min(36, width / 15);
    const fontWeight = isHeadline ? 'bold' : 'normal';
    const fill = isHeadline ? colors.text : colors.subtext;

    // Word wrap for long text
    const maxCharsPerLine = Math.floor(width / (fontSize * 0.6));
    const words = (text || '').split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
        if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
            currentLine = currentLine ? currentLine + ' ' + word : word;
        } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        }
    }
    if (currentLine) lines.push(currentLine);

    const lineHeight = fontSize * 1.3;
    const startY = centerY - (lines.length - 1) * lineHeight / 2;

    return lines.map((line, i) => `
        <text 
            x="${centerX}" 
            y="${startY + i * lineHeight}" 
            text-anchor="middle" 
            dominant-baseline="middle"
            font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
            font-size="${fontSize}"
            font-weight="${fontWeight}"
            fill="${fill}"
        >${escapeXml(line)}</text>
    `).join('\n');
}

function generateCTASVG(element, text, colors) {
    const { x, y, width, height } = element;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const rx = height / 2; // Pill shape

    return `
        <rect 
            x="${x}" 
            y="${y}" 
            width="${width}" 
            height="${height}" 
            rx="${rx}"
            fill="${colors.primary}"
        />
        <text 
            x="${centerX}" 
            y="${centerY}" 
            text-anchor="middle" 
            dominant-baseline="middle"
            font-family="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
            font-size="${Math.min(24, height * 0.5)}"
            font-weight="bold"
            fill="${colors.text}"
        >${escapeXml(text)}</text>
    `;
}

function generateImagePlaceholder(element, colors, label = '') {
    const { x, y, width, height } = element;

    return `
        <rect 
            x="${x}" 
            y="${y}" 
            width="${width}" 
            height="${height}" 
            rx="16"
            fill="${colors.secondary}"
            stroke="${colors.accent}"
            stroke-width="2"
            stroke-dasharray="8,4"
        />
        <text 
            x="${x + width / 2}" 
            y="${y + height / 2}" 
            text-anchor="middle" 
            dominant-baseline="middle"
            font-family="Inter, sans-serif"
            font-size="24"
            fill="${colors.subtext}"
        >${escapeXml(label || 'Image')}</text>
    `;
}

function generateArrowSVG(fromElement, toElement, colors) {
    if (!fromElement || !toElement) return '';

    const fromCenterX = fromElement.x + fromElement.width / 2;
    const fromCenterY = fromElement.y + fromElement.height / 2;
    const toCenterX = toElement.x + toElement.width / 2;
    const toCenterY = toElement.y + toElement.height / 2;

    return `
        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="${colors.primary}"/>
            </marker>
        </defs>
        <line 
            x1="${fromCenterX}" 
            y1="${fromCenterY}" 
            x2="${toCenterX}" 
            y2="${toCenterY}"
            stroke="${colors.primary}"
            stroke-width="4"
            marker-end="url(#arrowhead)"
        />
    `;
}

function generateBadgeSVG(element, text, colors) {
    const { x, y, width, height } = element;

    return `
        <rect 
            x="${x}" 
            y="${y}" 
            width="${width}" 
            height="${height}" 
            rx="8"
            fill="${colors.primary}"
        />
        <text 
            x="${x + width / 2}" 
            y="${y + height / 2}" 
            text-anchor="middle" 
            dominant-baseline="middle"
            font-family="Inter, sans-serif"
            font-size="${Math.min(18, height * 0.6)}"
            font-weight="bold"
            fill="${colors.text}"
        >${escapeXml(text)}</text>
    `;
}

// ============================================================
// MAIN RENDERER
// ============================================================

/**
 * Render a solved layout to PNG
 */
export async function renderLayout(layout, options = {}) {
    const { canvasWidth, canvasHeight, elements } = layout;
    const { copy = {}, style = {}, background } = options;

    const tone = style.tone || 'modern';
    const colors = COLOR_SCHEMES[tone] || COLOR_SCHEMES.modern;

    // Build SVG content
    const svgParts = [];

    // Background
    svgParts.push(generateBackgroundSVG(canvasWidth, canvasHeight, colors, background));

    // Sort elements by priority (higher priority = rendered later = on top)
    const sortedElements = Object.entries(elements)
        .sort(([, a], [, b]) => (b.priority || 0) - (a.priority || 0));

    // Render each element
    for (const [id, element] of sortedElements) {
        switch (element.type) {
            case 'text':
                const isHeadline = element.role?.includes('headline') || element.role?.includes('main');
                let textContent = '';

                if (element.role?.includes('headline')) {
                    textContent = copy.headline || '';
                } else if (element.role?.includes('subheadline')) {
                    textContent = copy.subheadline || '';
                }

                if (textContent) {
                    svgParts.push(generateTextSVG(element, textContent, colors, isHeadline));
                }
                break;

            case 'cta':
                svgParts.push(generateCTASVG(element, copy.cta || 'Learn More', colors));
                break;

            case 'image':
                // For now, generate placeholder. Real images will be composited later
                svgParts.push(generateImagePlaceholder(element, colors, element.role));
                break;

            case 'badge':
                svgParts.push(generateBadgeSVG(element, 'NEW', colors));
                break;

            case 'arrow':
                // Arrows need from/to elements - skip for now
                break;

            default:
                // Generic rectangle for unknown types
                svgParts.push(`
                    <rect 
                        x="${element.x}" 
                        y="${element.y}" 
                        width="${element.width}" 
                        height="${element.height}" 
                        rx="8"
                        fill="${colors.secondary}"
                        stroke="${colors.accent}"
                        stroke-width="1"
                    />
                `);
        }
    }

    // Assemble SVG
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="${canvasWidth}" 
            height="${canvasHeight}"
            viewBox="0 0 ${canvasWidth} ${canvasHeight}"
        >
            ${svgParts.join('\n')}
        </svg>
    `;

    console.log('[CanvasRenderer] Generated SVG, converting to PNG...');

    // Convert SVG to PNG using Sharp
    const pngBuffer = await sharp(Buffer.from(svg))
        .png()
        .toBuffer();

    console.log('[CanvasRenderer] ✓ PNG generated:', pngBuffer.length, 'bytes');

    return pngBuffer;
}

/**
 * Composite a product image onto a rendered ad
 */
export async function compositeProductImage(baseImage, productImage, targetRect) {
    const { x, y, width, height } = targetRect;

    // Resize product image to fit target rect
    const resizedProduct = await sharp(productImage)
        .resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();

    // Composite onto base
    const result = await sharp(baseImage)
        .composite([{
            input: resizedProduct,
            left: x,
            top: y
        }])
        .png()
        .toBuffer();

    return result;
}

export default { renderLayout, compositeProductImage };
