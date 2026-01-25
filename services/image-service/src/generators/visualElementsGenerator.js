/**
 * VISUAL ELEMENTS GENERATOR
 * 
 * Creates additional visual elements for designer-level ads:
 * - Trust badges (ratings, awards, security)
 * - Feature callouts with pointers
 * - Decorative elements (glows, lines, shapes)
 * - Social proof (star ratings, user counts)
 * - Floating UI elements (cards, tooltips)
 */

import sharp from 'sharp';

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1080;

/**
 * Generate all visual elements as SVG layers
 * Now with intelligent filtering based on deepAnalysis
 * 
 * @param {Object} designSpecs - Design specifications from reference analysis
 * @param {Object} productAnalysis - Basic product analysis
 * @param {string} accentColor - Accent color to use
 * @param {Object} deepAnalysis - NEW: Deep analysis with excludeElements, maxCallouts, visualAnchors
 */
export async function generateVisualElements(designSpecs, productAnalysis, accentColor, deepAnalysis = null) {
    console.log('[VisualElements] 🎨 Generating visual elements...');

    const elements = [];
    const specs = designSpecs.visualElements || {};

    // NEW: Extract smart filtering rules from deepAnalysis
    const excludeElements = deepAnalysis?.excludeElements || [];
    const maxCallouts = deepAnalysis?.designRecommendations?.maxCallouts || 3;
    const visualAnchors = deepAnalysis?.visualAnchors || [];

    // NEW: Log smart filtering decisions
    if (deepAnalysis) {
        console.log(`[VisualElements] 🔬 Smart Filtering Active:`);
        console.log(`[VisualElements]   Max callouts: ${maxCallouts}`);
        console.log(`[VisualElements]   Exclude: ${excludeElements.length > 0 ? excludeElements.join(', ') : 'none'}`);
        console.log(`[VisualElements]   Visual anchors: ${visualAnchors.length}`);
    }

    // Generate badges - SKIP if excluded
    const shouldExcludeBadges = excludeElements.some(e =>
        e.toLowerCase().includes('badge') || e.toLowerCase().includes('rating')
    );
    if (specs.badges && specs.badges.length > 0 && !shouldExcludeBadges) {
        const badgesSvg = generateBadges(specs.badges, accentColor);
        elements.push({ svg: badgesSvg, type: 'badges' });
    } else if (shouldExcludeBadges) {
        console.log('[VisualElements] ⏭️ Skipping badges (AI excluded)');
    }

    // Generate feature callouts - LIMIT to maxCallouts
    if (specs.featureCallouts && specs.featureCallouts.length > 0) {
        // Limit callouts based on AI recommendation
        const limitedCallouts = specs.featureCallouts.slice(0, maxCallouts);
        if (limitedCallouts.length < specs.featureCallouts.length) {
            console.log(`[VisualElements] ✂️ Limited callouts: ${limitedCallouts.length} of ${specs.featureCallouts.length}`);
        }
        const calloutsSvg = generateFeatureCallouts(limitedCallouts, accentColor);
        elements.push({ svg: calloutsSvg, type: 'callouts' });
    }

    // Generate decorative elements - Check for exclusions
    const shouldExcludeDecorative = excludeElements.some(e =>
        e.toLowerCase().includes('decorative') || e.toLowerCase().includes('shape')
    );
    if (specs.decorativeElements && specs.decorativeElements.length > 0 && !shouldExcludeDecorative) {
        const decorativeSvg = generateDecorativeElements(specs.decorativeElements, accentColor);
        elements.push({ svg: decorativeSvg, type: 'decorative' });
    }

    // Generate social proof - SKIP if excluded
    const shouldExcludeSocial = excludeElements.some(e =>
        e.toLowerCase().includes('social') || e.toLowerCase().includes('proof') ||
        e.toLowerCase().includes('review') || e.toLowerCase().includes('star')
    );
    if (specs.socialProof?.show && !shouldExcludeSocial) {
        const socialSvg = generateSocialProof(specs.socialProof, accentColor);
        elements.push({ svg: socialSvg, type: 'social' });
    } else if (shouldExcludeSocial) {
        console.log('[VisualElements] ⏭️ Skipping social proof (AI excluded)');
    }

    // Auto-generate elements based on product analysis
    // ONLY if we have minimal elements and AI didn't exclude
    if (productAnalysis && elements.length < 2) {
        const autoElements = generateAutoElements(productAnalysis, accentColor);
        if (autoElements) {
            elements.push({ svg: autoElements, type: 'auto' });
        }
    }

    console.log(`[VisualElements] ✅ Generated ${elements.length} element layers (smart filtered)`);
    return elements;
}

/**
 * Generate badge elements
 */
function generateBadges(badges, accentColor) {
    let badgesSvg = '';

    badges.forEach((badge, index) => {
        const position = getBadgePosition(badge.position || 'top_right', index);
        const style = badge.style || 'pill';

        // Badge background
        const bgColor = badge.backgroundColor || 'rgba(255,255,255,0.1)';
        const borderColor = badge.borderColor || 'rgba(255,255,255,0.2)';

        // Badge dimensions based on style
        let width = 120;
        let height = 36;
        let rx = style === 'pill' ? 18 : (style === 'circle' ? 36 : 8);

        if (style === 'circle') {
            width = 72;
            height = 72;
        }

        // Generate badge SVG
        badgesSvg += `
        <g transform="translate(${position.x}, ${position.y})">
            <defs>
                <filter id="badgeGlow${index}" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="blur"/>
                    <feMerge>
                        <feMergeNode in="blur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <rect x="0" y="0" width="${width}" height="${height}" rx="${rx}" 
                  fill="${bgColor}" stroke="${borderColor}" stroke-width="1"
                  filter="url(#badgeGlow${index})"/>
            <text x="${width / 2}" y="${height / 2 + 5}" 
                  text-anchor="middle" fill="#FFFFFF" 
                  font-family="system-ui, sans-serif" 
                  font-size="14" font-weight="600">
                ${escapeXml(badge.text || '⭐ Top Rated')}
            </text>
        </g>`;
    });

    return `<svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">${badgesSvg}</svg>`;
}

/**
 * Generate feature callout elements with pointers
 */
function generateFeatureCallouts(callouts, accentColor) {
    let calloutsSvg = '';

    callouts.forEach((callout, index) => {
        const pos = callout.position || { xPercent: 0.2, yPercent: 0.5 };
        const x = Math.round(CANVAS_WIDTH * pos.xPercent);
        const y = Math.round(CANVAS_HEIGHT * pos.yPercent);

        // Callout box dimensions
        const boxWidth = 160;
        const boxHeight = 44;
        const boxX = x - boxWidth / 2;
        const boxY = y - boxHeight / 2;

        // Pointer line (if has pointer)
        let pointerSvg = '';
        if (callout.hasPointer) {
            const targetX = CANVAS_WIDTH * 0.5; // Point to product center
            const targetY = CANVAS_HEIGHT * 0.45;

            // Calculate control points for curved line
            const midX = (x + targetX) / 2;
            const midY = (y + targetY) / 2 - 30;

            pointerSvg = `
            <defs>
                <linearGradient id="lineGrad${index}" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:${accentColor};stop-opacity:0.8"/>
                    <stop offset="100%" style="stop-color:${accentColor};stop-opacity:0.2"/>
                </linearGradient>
            </defs>
            <path d="M ${x} ${y + boxHeight / 2} Q ${midX} ${midY} ${targetX} ${targetY}"
                  stroke="url(#lineGrad${index})" stroke-width="2" fill="none" 
                  stroke-dasharray="8 4"/>
            <circle cx="${targetX}" cy="${targetY}" r="6" fill="${accentColor}" fill-opacity="0.5"/>`;
        }

        calloutsSvg += `
        <g>
            ${pointerSvg}
            <defs>
                <filter id="calloutShadow${index}" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.3"/>
                </filter>
            </defs>
            <rect x="${boxX}" y="${boxY}" width="${boxWidth}" height="${boxHeight}" rx="8"
                  fill="rgba(0,0,0,0.6)" stroke="${accentColor}" stroke-width="1"
                  filter="url(#calloutShadow${index})"/>
            <text x="${x}" y="${y + 5}" text-anchor="middle" fill="#FFFFFF"
                  font-family="system-ui, sans-serif" font-size="14" font-weight="600">
                ${escapeXml(callout.text || 'Feature')}
            </text>
        </g>`;
    });

    return `<svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">${calloutsSvg}</svg>`;
}

/**
 * Generate decorative elements (glows, shapes, particles)
 */
function generateDecorativeElements(decoratives, accentColor) {
    let decorativeSvg = '';

    decoratives.forEach((elem, index) => {
        const pos = elem.position || { xPercent: 0.5, yPercent: 0.5 };
        const x = Math.round(CANVAS_WIDTH * pos.xPercent);
        const y = Math.round(CANVAS_HEIGHT * pos.yPercent);
        const color = elem.color || accentColor;
        const opacity = elem.opacity || 0.15;
        const size = getSizeValue(elem.size);

        switch (elem.type) {
            case 'glow_orb':
                decorativeSvg += `
                <defs>
                    <radialGradient id="orb${index}" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" style="stop-color:${color};stop-opacity:${opacity}"/>
                        <stop offset="100%" style="stop-color:${color};stop-opacity:0"/>
                    </radialGradient>
                </defs>
                <ellipse cx="${x}" cy="${y}" rx="${size * 1.2}" ry="${size}" fill="url(#orb${index})"/>`;
                break;

            case 'line':
                const angle = elem.angle || 0;
                const length = size * 2;
                decorativeSvg += `
                <defs>
                    <linearGradient id="lineFade${index}" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:${color};stop-opacity:0"/>
                        <stop offset="50%" style="stop-color:${color};stop-opacity:${opacity}"/>
                        <stop offset="100%" style="stop-color:${color};stop-opacity:0"/>
                    </linearGradient>
                </defs>
                <line x1="${x - length / 2}" y1="${y}" x2="${x + length / 2}" y2="${y}"
                      stroke="url(#lineFade${index})" stroke-width="2"
                      transform="rotate(${angle} ${x} ${y})"/>`;
                break;

            case 'shape':
                const shapeType = elem.shapeType || 'circle';
                if (shapeType === 'circle') {
                    decorativeSvg += `
                    <circle cx="${x}" cy="${y}" r="${size / 3}" 
                            fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1"/>`;
                } else if (shapeType === 'hexagon') {
                    const r = size / 4;
                    const points = [];
                    for (let i = 0; i < 6; i++) {
                        const a = (i * 60 - 30) * Math.PI / 180;
                        points.push(`${x + r * Math.cos(a)},${y + r * Math.sin(a)}`);
                    }
                    decorativeSvg += `
                    <polygon points="${points.join(' ')}" 
                             fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1"/>`;
                }
                break;

            case 'particles':
                // Generate random particles
                for (let i = 0; i < 8; i++) {
                    const px = x + (Math.random() - 0.5) * size * 2;
                    const py = y + (Math.random() - 0.5) * size * 2;
                    const pr = 2 + Math.random() * 4;
                    decorativeSvg += `
                    <circle cx="${px}" cy="${py}" r="${pr}" 
                            fill="${color}" fill-opacity="${opacity * (0.5 + Math.random() * 0.5)}"/>`;
                }
                break;

            case 'bokeh':
                // Generate bokeh circles
                for (let i = 0; i < 5; i++) {
                    const bx = x + (Math.random() - 0.5) * size * 3;
                    const by = y + (Math.random() - 0.5) * size * 2;
                    const br = 30 + Math.random() * 60;
                    decorativeSvg += `
                    <circle cx="${bx}" cy="${by}" r="${br}" 
                            fill="${color}" fill-opacity="${opacity * 0.3}"/>`;
                }
                break;
        }
    });

    return `<svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">${decorativeSvg}</svg>`;
}

/**
 * Generate social proof elements
 */
function generateSocialProof(socialProof, accentColor) {
    if (!socialProof.show) return '';

    const position = socialProof.position || 'near_cta';
    let x, y;

    switch (position) {
        case 'top':
            x = CANVAS_WIDTH / 2;
            y = 50;
            break;
        case 'near_cta':
            x = CANVAS_WIDTH / 2;
            y = CANVAS_HEIGHT * 0.82;
            break;
        default:
            x = CANVAS_WIDTH / 2;
            y = CANVAS_HEIGHT * 0.95;
    }

    let socialSvg = '';

    switch (socialProof.type) {
        case 'stars':
            // 5-star rating
            const stars = '★★★★★';
            socialSvg = `
            <g transform="translate(${x - 80}, ${y})">
                <text x="0" y="0" fill="#FFD700" font-size="18" font-family="system-ui">${stars}</text>
                <text x="90" y="0" fill="rgba(255,255,255,0.7)" font-size="14" font-family="system-ui">
                    ${socialProof.rating || '4.9'} (${socialProof.count || '2.4k'} reviews)
                </text>
            </g>`;
            break;

        case 'users_count':
            socialSvg = `
            <g transform="translate(${x - 100}, ${y})">
                <text x="0" y="0" fill="#FFFFFF" font-size="14" font-weight="600" font-family="system-ui">
                    👥 ${socialProof.count || '10,000+'} users trust us
                </text>
            </g>`;
            break;

        case 'logo_bar':
            // Placeholder for logo bar (would need actual logos)
            socialSvg = `
            <text x="${x}" y="${y}" text-anchor="middle" fill="rgba(255,255,255,0.5)" 
                  font-size="12" font-family="system-ui">
                Trusted by Fortune 500 companies
            </text>`;
            break;
    }

    return `<svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">${socialSvg}</svg>`;
}

/**
 * Auto-generate elements based on product analysis
 */
function generateAutoElements(productAnalysis, accentColor) {
    if (!productAnalysis) return null;

    let autoSvg = '';

    // Add rating badge if product has high rating
    if (productAnalysis.rating && productAnalysis.rating >= 4.5) {
        autoSvg += `
        <g transform="translate(${CANVAS_WIDTH - 130}, 50)">
            <rect x="0" y="0" width="100" height="32" rx="16" 
                  fill="rgba(255,215,0,0.15)" stroke="rgba(255,215,0,0.3)" stroke-width="1"/>
            <text x="50" y="21" text-anchor="middle" fill="#FFD700" 
                  font-size="14" font-weight="600" font-family="system-ui">
                ⭐ ${productAnalysis.rating}
            </text>
        </g>`;
    }

    // Add "New" badge for new products
    if (productAnalysis.isNew) {
        autoSvg += `
        <g transform="translate(50, 50)">
            <rect x="0" y="0" width="60" height="28" rx="14" fill="${accentColor}"/>
            <text x="30" y="19" text-anchor="middle" fill="#FFFFFF" 
                  font-size="12" font-weight="700" font-family="system-ui">NEW</text>
        </g>`;
    }

    // Add feature highlights from product analysis
    if (productAnalysis.keyFeatures && productAnalysis.keyFeatures.length > 0) {
        productAnalysis.keyFeatures.slice(0, 2).forEach((feature, i) => {
            const y = 700 + i * 50;
            autoSvg += `
            <g transform="translate(80, ${y})">
                <circle cx="0" cy="0" r="6" fill="${accentColor}"/>
                <text x="15" y="5" fill="rgba(255,255,255,0.9)" 
                      font-size="14" font-family="system-ui">${escapeXml(feature)}</text>
            </g>`;
        });
    }

    if (!autoSvg) return null;

    return `<svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">${autoSvg}</svg>`;
}

/**
 * Composite all visual element layers onto base image
 */
export async function compositeVisualElements(baseBuffer, elementLayers) {
    if (!elementLayers || elementLayers.length === 0) {
        return baseBuffer;
    }

    let result = baseBuffer;

    for (const layer of elementLayers) {
        try {
            const layerBuffer = await sharp(Buffer.from(layer.svg)).png().toBuffer();
            result = await sharp(result)
                .composite([{ input: layerBuffer, left: 0, top: 0 }])
                .png()
                .toBuffer();
        } catch (e) {
            console.warn(`[VisualElements] Failed to composite ${layer.type}:`, e.message);
        }
    }

    return result;
}

// Helper functions
function getBadgePosition(position, index) {
    const offset = index * 45; // Stack multiple badges

    switch (position) {
        case 'top_left':
            return { x: 50, y: 50 + offset };
        case 'top_right':
            return { x: CANVAS_WIDTH - 170, y: 50 + offset };
        case 'bottom_left':
            return { x: 50, y: CANVAS_HEIGHT - 100 - offset };
        case 'bottom_right':
            return { x: CANVAS_WIDTH - 170, y: CANVAS_HEIGHT - 100 - offset };
        case 'near_cta':
            return { x: CANVAS_WIDTH / 2 + 180, y: CANVAS_HEIGHT * 0.88 };
        default:
            return { x: CANVAS_WIDTH - 170, y: 50 + offset };
    }
}

function getSizeValue(size) {
    switch (size) {
        case 'small': return 80;
        case 'medium': return 150;
        case 'large': return 250;
        default: return 150;
    }
}

function escapeXml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default { generateVisualElements, compositeVisualElements };
