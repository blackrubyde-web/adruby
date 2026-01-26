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
 * Now with intelligent filtering based on deepAnalysis AND compositionPlan
 * 
 * @param {Object} designSpecs - Design specifications from reference analysis
 * @param {Object} productAnalysis - Basic product analysis
 * @param {string} accentColor - Accent color to use
 * @param {Object} deepAnalysis - Deep analysis with excludeElements, maxCallouts, visualAnchors
 * @param {Object} compositionPlan - AI-planned composition (badges, callouts, etc. are in typography layer)
 * @param {boolean} strictReplica - Strict mode disables auto elements
 */
export async function generateVisualElements(designSpecs, productAnalysis, accentColor, deepAnalysis = null, compositionPlan = null, strictReplica = false) {
    console.log('[VisualElements] 🎨 Generating visual elements...');

    const elements = [];
    const specs = designSpecs.visualElements || {};

    // Extract smart filtering rules from deepAnalysis
    const excludeElements = deepAnalysis?.excludeElements || [];
    const maxCallouts = deepAnalysis?.designRecommendations?.maxCallouts || 3;
    const visualAnchors = deepAnalysis?.visualAnchors || [];

    // IMPORTANT: If compositionPlan exists, badges/callouts/socialProof are in TYPOGRAPHY layer
    // Don't duplicate them here! Only generate decorative elements.
    const aiPlanActive = compositionPlan !== null;
    if (aiPlanActive) {
        console.log('[VisualElements] 🧠 AI Plan Active - badges/callouts/social moved to typography layer');
    }

    // NEW: Log smart filtering decisions
    if (deepAnalysis) {
        console.log(`[VisualElements] 🔬 Smart Filtering Active:`);
        console.log(`[VisualElements]   Max callouts: ${maxCallouts}`);
        console.log(`[VisualElements]   Exclude: ${excludeElements.length > 0 ? excludeElements.join(', ') : 'none'}`);
        console.log(`[VisualElements]   Visual anchors: ${visualAnchors.length}`);
    }

    // BADGES: Skip if AI plan is active (badges are in typography layer)
    // Also skip if explicitly excluded
    if (!aiPlanActive) {
        const shouldExcludeBadges = excludeElements.some(e =>
            e.toLowerCase().includes('badge') || e.toLowerCase().includes('rating')
        );
        if (specs.badges && specs.badges.length > 0 && !shouldExcludeBadges) {
            const badgesSvg = generateBadges(specs.badges, accentColor);
            elements.push({ svg: badgesSvg, type: 'badges' });
        } else if (shouldExcludeBadges) {
            console.log('[VisualElements] ⏭️ Skipping badges (AI excluded)');
        }
    } else {
        console.log('[VisualElements] ⏭️ Skipping badges (handled in typography layer)');
    }

    // CALLOUTS: Skip if AI plan is active (callouts are in typography layer)
    if (!aiPlanActive) {
        if (specs.featureCallouts && specs.featureCallouts.length > 0) {
            const limitedCallouts = specs.featureCallouts.slice(0, maxCallouts);
            if (limitedCallouts.length < specs.featureCallouts.length) {
                console.log(`[VisualElements] ✂️ Limited callouts: ${limitedCallouts.length} of ${specs.featureCallouts.length}`);
            }
            const calloutsSvg = generateFeatureCallouts(limitedCallouts, accentColor);
            elements.push({ svg: calloutsSvg, type: 'callouts' });
        }
    } else {
        console.log('[VisualElements] ⏭️ Skipping callouts (handled in typography layer)');
    }

    // DECORATIVE ELEMENTS: Keep generating - these are not in typography layer
    const shouldExcludeDecorative = excludeElements.some(e =>
        e.toLowerCase().includes('decorative') || e.toLowerCase().includes('shape')
    );
    if (specs.decorativeElements && specs.decorativeElements.length > 0 && !shouldExcludeDecorative) {
        const decorativeSvg = generateDecorativeElements(specs.decorativeElements, accentColor);
        elements.push({ svg: decorativeSvg, type: 'decorative' });
    }

    // SOCIAL PROOF: Skip if AI plan is active (handled in typography layer)
    if (!aiPlanActive) {
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
    } else {
        console.log('[VisualElements] ⏭️ Skipping social proof (handled in typography layer)');
    }

    // Auto-generate elements based on product analysis
    // ONLY if we have minimal elements and AI didn't exclude
    if (!strictReplica && productAnalysis && elements.length < 2) {
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

    // Add feature highlights from product analysis - show up to 6 features
    if (productAnalysis.keyFeatures && productAnalysis.keyFeatures.length > 0) {
        productAnalysis.keyFeatures.slice(0, 6).forEach((feature, i) => {
            const y = 580 + i * 45; // Start higher, tighter spacing for more items
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

// ========================================
// NEW ELEMENT GENERATORS (Phase 12)
// ========================================

/**
 * Generate Price Tag element
 */
export function generatePriceTag(priceTag, accentColor = '#FF4757') {
    if (!priceTag?.price) return null;

    const x = Math.round((priceTag.position?.xPercent || 0.85) * CANVAS_WIDTH);
    const y = Math.round((priceTag.position?.yPercent || 0.12) * CANVAS_HEIGHT);
    const style = priceTag.style || 'tag';

    let svg = '';

    if (style === 'burst') {
        // Starburst style for discounts
        svg = `
        <g transform="translate(${x}, ${y})">
            <polygon points="0,-50 15,-20 50,-30 25,0 50,30 15,20 0,50 -15,20 -50,30 -25,0 -50,-30 -15,-20" 
                     fill="${accentColor}" opacity="0.95"/>
            ${priceTag.originalPrice ? `
            <text x="0" y="-10" text-anchor="middle" fill="rgba(255,255,255,0.6)" 
                  font-size="14" font-family="system-ui" text-decoration="line-through">${escapeXml(priceTag.originalPrice)}</text>
            ` : ''}
            <text x="0" y="12" text-anchor="middle" fill="#FFFFFF" 
                  font-size="24" font-weight="800" font-family="system-ui">${escapeXml(priceTag.price)}</text>
            ${priceTag.discount ? `
            <text x="0" y="30" text-anchor="middle" fill="#FFFFFF" 
                  font-size="12" font-weight="600" font-family="system-ui">${escapeXml(priceTag.discount)}</text>
            ` : ''}
        </g>`;
    } else if (style === 'corner') {
        // Corner ribbon style
        svg = `
        <g transform="translate(${CANVAS_WIDTH}, 0)">
            <polygon points="-120,0 0,0 0,120" fill="${accentColor}"/>
            <text x="-60" y="40" text-anchor="middle" fill="#FFFFFF" 
                  font-size="18" font-weight="700" font-family="system-ui" 
                  transform="rotate(45, -60, 40)">${escapeXml(priceTag.price)}</text>
        </g>`;
    } else {
        // Simple tag style (default)
        svg = `
        <g transform="translate(${x}, ${y})">
            <rect x="-60" y="-25" width="120" height="50" rx="8" fill="${accentColor}" opacity="0.95"/>
            ${priceTag.originalPrice ? `
            <text x="0" y="-5" text-anchor="middle" fill="rgba(255,255,255,0.6)" 
                  font-size="12" font-family="system-ui" text-decoration="line-through">${escapeXml(priceTag.originalPrice)}</text>
            <text x="0" y="15" text-anchor="middle" fill="#FFFFFF" 
                  font-size="20" font-weight="800" font-family="system-ui">${escapeXml(priceTag.price)}</text>
            ` : `
            <text x="0" y="8" text-anchor="middle" fill="#FFFFFF" 
                  font-size="22" font-weight="800" font-family="system-ui">${escapeXml(priceTag.price)}</text>
            `}
        </g>`;
    }

    return `<svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`;
}

/**
 * Generate Countdown Timer element
 */
export function generateCountdown(countdown, accentColor = '#FF4757') {
    if (!countdown?.text) return null;

    const x = Math.round((countdown.position?.xPercent || 0.5) * CANVAS_WIDTH);
    const y = Math.round((countdown.position?.yPercent || 0.94) * CANVAS_HEIGHT);
    const style = countdown.style || 'text';

    let svg = '';

    if (style === 'urgent') {
        svg = `
        <g transform="translate(${x}, ${y})">
            <rect x="-100" y="-18" width="200" height="36" rx="18" fill="${accentColor}" opacity="0.9"/>
            <text x="-80" y="6" fill="#FFFFFF" font-size="18" font-family="system-ui">⏰</text>
            <text x="0" y="6" text-anchor="middle" fill="#FFFFFF" 
                  font-size="14" font-weight="700" font-family="system-ui">${escapeXml(countdown.text)}</text>
        </g>`;
    } else if (style === 'timer') {
        svg = `
        <g transform="translate(${x}, ${y})">
            <rect x="-80" y="-22" width="160" height="44" rx="6" fill="rgba(0,0,0,0.7)" stroke="${accentColor}" stroke-width="2"/>
            <text x="0" y="8" text-anchor="middle" fill="${accentColor}" 
                  font-size="20" font-weight="700" font-family="monospace">${escapeXml(countdown.text)}</text>
        </g>`;
    } else {
        svg = `
        <g transform="translate(${x}, ${y})">
            <text x="0" y="0" text-anchor="middle" fill="rgba(255,255,255,0.8)" 
                  font-size="14" font-family="system-ui">⏰ ${escapeXml(countdown.text)}</text>
        </g>`;
    }

    return `<svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`;
}

/**
 * Generate Progress Bar element
 */
export function generateProgressBar(progressBar, accentColor = '#10B981') {
    if (progressBar?.value === undefined) return null;

    const x = Math.round((progressBar.position?.xPercent || 0.5) * CANVAS_WIDTH);
    const y = Math.round((progressBar.position?.yPercent || 0.78) * CANVAS_HEIGHT);
    const value = Math.min(100, Math.max(0, progressBar.value));
    const barWidth = 200;
    const filledWidth = (value / 100) * barWidth;

    const svg = `
    <g transform="translate(${x - barWidth / 2}, ${y})">
        ${progressBar.label ? `
        <text x="${barWidth / 2}" y="-10" text-anchor="middle" fill="rgba(255,255,255,0.8)" 
              font-size="13" font-family="system-ui">${escapeXml(progressBar.label)}</text>
        ` : ''}
        <rect x="0" y="0" width="${barWidth}" height="8" rx="4" fill="rgba(255,255,255,0.2)"/>
        <rect x="0" y="0" width="${filledWidth}" height="8" rx="4" fill="${accentColor}"/>
        <text x="${barWidth + 10}" y="7" fill="${accentColor}" 
              font-size="12" font-weight="700" font-family="system-ui">${value}%</text>
    </g>`;

    return `<svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`;
}

/**
 * Generate Testimonial element
 */
export function generateTestimonial(testimonial, accentColor = '#3B82F6') {
    if (!testimonial?.quote) return null;

    const x = Math.round((testimonial.position?.xPercent || 0.5) * CANVAS_WIDTH);
    const y = Math.round((testimonial.position?.yPercent || 0.82) * CANVAS_HEIGHT);

    const svg = `
    <g transform="translate(${x}, ${y})">
        <rect x="-180" y="-50" width="360" height="100" rx="12" fill="rgba(255,255,255,0.08)" 
              stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
        <text x="-160" y="-20" fill="${accentColor}" font-size="32" font-family="Georgia">"</text>
        <text x="0" y="0" text-anchor="middle" fill="rgba(255,255,255,0.9)" 
              font-size="14" font-style="italic" font-family="system-ui">${escapeXml(testimonial.quote?.substring(0, 50))}...</text>
        ${testimonial.author ? `
        <text x="0" y="30" text-anchor="middle" fill="rgba(255,255,255,0.6)" 
              font-size="12" font-family="system-ui">— ${escapeXml(testimonial.author)}</text>
        ` : ''}
    </g>`;

    return `<svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`;
}

/**
 * Generate Highlight Circles/Arrows element
 */
export function generateHighlights(highlights, accentColor = '#FF4757') {
    if (!highlights || highlights.length === 0) return null;

    let svg = '';

    highlights.forEach((highlight, i) => {
        const x = Math.round((highlight.targetArea?.xPercent || 0.5) * CANVAS_WIDTH);
        const y = Math.round((highlight.targetArea?.yPercent || 0.5) * CANVAS_HEIGHT);
        const type = highlight.type || 'circle';

        if (type === 'circle') {
            svg += `
            <circle cx="${x}" cy="${y}" r="40" fill="none" stroke="${accentColor}" 
                    stroke-width="3" stroke-dasharray="8,4" opacity="0.8"/>`;
        } else if (type === 'arrow') {
            svg += `
            <g transform="translate(${x - 50}, ${y})">
                <path d="M0,0 L40,0 M30,-10 L40,0 L30,10" fill="none" 
                      stroke="${accentColor}" stroke-width="4" stroke-linecap="round"/>
            </g>`;
        } else if (type === 'glow') {
            svg += `
            <circle cx="${x}" cy="${y}" r="50" fill="${accentColor}" opacity="0.15"/>
            <circle cx="${x}" cy="${y}" r="35" fill="${accentColor}" opacity="0.1"/>`;
        } else if (type === 'underline') {
            svg += `
            <rect x="${x - 40}" y="${y + 5}" width="80" height="4" rx="2" fill="${accentColor}" opacity="0.8"/>`;
        }
    });

    return `<svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`;
}

/**
 * Generate Decorations (sparkles, particles, patterns)
 */
export function generateDecorations(decorations, accentColor = '#FFD700') {
    if (!decorations) return null;

    let svg = '';

    if (decorations.sparkles) {
        // Add sparkle effects at random positions
        const sparklePositions = [[100, 150], [950, 200], [150, 850], [900, 750], [500, 100]];
        sparklePositions.forEach(([x, y]) => {
            svg += `
            <g transform="translate(${x}, ${y})">
                <polygon points="0,-12 3,-3 12,0 3,3 0,12 -3,3 -12,0 -3,-3" fill="${accentColor}" opacity="0.7"/>
            </g>`;
        });
    }

    if (decorations.particles) {
        // Add floating particles
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * CANVAS_WIDTH;
            const y = Math.random() * CANVAS_HEIGHT;
            const r = 2 + Math.random() * 4;
            const opacity = 0.1 + Math.random() * 0.2;
            svg += `<circle cx="${x}" cy="${y}" r="${r}" fill="${accentColor}" opacity="${opacity}"/>`;
        }
    }

    if (decorations.pattern === 'dots') {
        // Dot pattern overlay
        for (let x = 50; x < CANVAS_WIDTH; x += 40) {
            for (let y = 50; y < CANVAS_HEIGHT; y += 40) {
                svg += `<circle cx="${x}" cy="${y}" r="1.5" fill="rgba(255,255,255,0.05)"/>`;
            }
        }
    }

    if (!svg) return null;
    return `<svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`;
}

export default {
    generateVisualElements,
    compositeVisualElements,
    generatePriceTag,
    generateCountdown,
    generateProgressBar,
    generateTestimonial,
    generateHighlights,
    generateDecorations
};
