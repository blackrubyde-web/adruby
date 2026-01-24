/**
 * DYNAMIC BADGE GENERATOR
 * 
 * Generate premium badges, labels, and trust indicators:
 * 
 * - Discount badges (% off, SALE)
 * - Trust badges (verified, secure, guarantee)
 * - Feature badges (NEW, HOT, Limited)
 * - Rating badges (stars, scores)
 * - Custom badges with icons
 */

import { renderIcon, BADGE_ICONS, SOCIAL_ICONS, UI_ICONS } from './iconLibrary.js';

// ========================================
// DISCOUNT BADGES
// ========================================

export function generateDiscountBadge({
    x = 50,
    y = 50,
    value = '50',
    type = 'percent', // 'percent', 'fixed', 'bogo', 'free'
    size = 80,
    bgColor = '#EF4444',
    textColor = '#FFFFFF',
    style = 'circle', // 'circle', 'burst', 'ribbon', 'tag'
    rotation = -15
}) {
    const id = `discount_${Date.now()}`;
    let content = '';
    let label = '';

    switch (type) {
        case 'percent': label = `${value}%`; break;
        case 'fixed': label = `$${value}`; break;
        case 'bogo': label = 'BOGO'; break;
        case 'free': label = 'FREE'; break;
    }

    const sublabel = type === 'percent' || type === 'fixed' ? 'OFF' : '';

    switch (style) {
        case 'circle':
            content = `
                <g transform="translate(${x}, ${y}) rotate(${rotation})">
                    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${bgColor}"/>
                    <text x="${size / 2}" y="${size / 2 - 5}" text-anchor="middle" dominant-baseline="middle" fill="${textColor}" font-family="Inter, system-ui" font-size="${size * 0.35}" font-weight="800">${label}</text>
                    ${sublabel ? `<text x="${size / 2}" y="${size / 2 + 15}" text-anchor="middle" fill="${textColor}" font-family="Inter, system-ui" font-size="${size * 0.18}" font-weight="600">${sublabel}</text>` : ''}
                </g>
            `;
            break;

        case 'burst':
            const points = 12;
            const innerR = size * 0.35;
            const outerR = size * 0.5;
            let burstPath = '';
            for (let i = 0; i < points * 2; i++) {
                const angle = (i * Math.PI) / points - Math.PI / 2;
                const r = i % 2 === 0 ? outerR : innerR;
                const px = size / 2 + r * Math.cos(angle);
                const py = size / 2 + r * Math.sin(angle);
                burstPath += (i === 0 ? 'M' : 'L') + `${px} ${py}`;
            }
            burstPath += 'Z';

            content = `
                <g transform="translate(${x}, ${y}) rotate(${rotation})">
                    <path d="${burstPath}" fill="${bgColor}"/>
                    <text x="${size / 2}" y="${size / 2}" text-anchor="middle" dominant-baseline="middle" fill="${textColor}" font-family="Inter, system-ui" font-size="${size * 0.28}" font-weight="800">${label}</text>
                </g>
            `;
            break;

        case 'ribbon':
            const ribbonW = size * 1.2;
            const ribbonH = size * 0.5;
            content = `
                <g transform="translate(${x}, ${y})">
                    <polygon points="0,0 ${ribbonW},0 ${ribbonW - 10},${ribbonH / 2} ${ribbonW},${ribbonH} 0,${ribbonH}" fill="${bgColor}"/>
                    <text x="${ribbonW / 2 - 5}" y="${ribbonH / 2 + 5}" text-anchor="middle" fill="${textColor}" font-family="Inter, system-ui" font-size="${ribbonH * 0.5}" font-weight="800">${label} ${sublabel}</text>
                </g>
            `;
            break;

        case 'tag':
            const tagW = size * 1.1;
            const tagH = size * 0.6;
            content = `
                <g transform="translate(${x}, ${y}) rotate(${rotation})">
                    <path d="M0 ${tagH / 2} L15 0 L${tagW} 0 L${tagW} ${tagH} L15 ${tagH} Z" fill="${bgColor}"/>
                    <circle cx="10" cy="${tagH / 2}" r="4" fill="${textColor}" fill-opacity="0.5"/>
                    <text x="${tagW / 2 + 5}" y="${tagH / 2 + 5}" text-anchor="middle" fill="${textColor}" font-family="Inter, system-ui" font-size="${tagH * 0.45}" font-weight="700">${label} ${sublabel}</text>
                </g>
            `;
            break;
    }

    return { svg: content, bounds: { x, y, width: size * 1.2, height: size } };
}

// ========================================
// TRUST BADGES
// ========================================

export function generateTrustBadge({
    x = 50,
    y = 50,
    type = 'verified', // 'verified', 'secure', 'guarantee', 'certified', 'award'
    width = 150,
    height = 40,
    primaryColor = '#10B981',
    bgColor = 'rgba(16, 185, 129, 0.1)',
    textColor = '#FFFFFF',
    style = 'pill' // 'pill', 'outline', 'minimal'
}) {
    const labels = {
        verified: { text: 'Verified', icon: SOCIAL_ICONS.verified },
        secure: { text: 'Secure', icon: null },
        guarantee: { text: '30-Day Guarantee', icon: UI_ICONS.checkCircle },
        certified: { text: 'Certified', icon: null },
        award: { text: 'Award Winning', icon: UI_ICONS.star }
    };

    const { text, icon } = labels[type] || labels.verified;
    const iconSvg = icon ? renderIcon({ icon, size: height * 0.5, color: primaryColor, x: x + 12, y: y + height * 0.25 }) : '';
    const textX = icon ? x + 12 + height * 0.5 + 8 : x + 15;

    let bg = '';
    switch (style) {
        case 'pill':
            bg = `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${height / 2}" fill="${bgColor}"/>`;
            break;
        case 'outline':
            bg = `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${height / 2}" fill="none" stroke="${primaryColor}" stroke-width="2"/>`;
            break;
        case 'minimal':
            bg = '';
            break;
    }

    return {
        svg: `
            ${bg}
            ${iconSvg}
            <text x="${textX}" y="${y + height / 2 + 5}" fill="${textColor}" font-family="Inter, system-ui" font-size="${height * 0.38}" font-weight="600">${text}</text>
        `,
        bounds: { x, y, width, height }
    };
}

// ========================================
// FEATURE BADGES
// ========================================

export function generateFeatureBadge({
    x = 50,
    y = 50,
    text = 'NEW',
    bgColor = '#8B5CF6',
    textColor = '#FFFFFF',
    style = 'rounded', // 'rounded', 'square', 'ribbon'
    size = 'medium', // 'small', 'medium', 'large'
    glow = false
}) {
    const sizes = {
        small: { padding: 8, fontSize: 10, height: 24 },
        medium: { padding: 12, fontSize: 12, height: 30 },
        large: { padding: 16, fontSize: 14, height: 38 }
    };

    const s = sizes[size] || sizes.medium;
    const textWidth = text.length * s.fontSize * 0.6;
    const width = textWidth + s.padding * 2;

    const id = `badge_${Date.now()}`;
    let defs = '';
    let filter = '';

    if (glow) {
        defs = `<filter id="${id}_glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/><feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.6 0"/></filter>`;
        filter = `filter="url(#${id}_glow)"`;
    }

    let bg = '';
    switch (style) {
        case 'rounded':
            bg = `<rect x="${x}" y="${y}" width="${width}" height="${s.height}" rx="${s.height / 2}" fill="${bgColor}" ${filter}/>`;
            break;
        case 'square':
            bg = `<rect x="${x}" y="${y}" width="${width}" height="${s.height}" rx="4" fill="${bgColor}" ${filter}/>`;
            break;
        case 'ribbon':
            bg = `<polygon points="${x},${y} ${x + width + 10},${y} ${x + width},${y + s.height / 2} ${x + width + 10},${y + s.height} ${x},${y + s.height}" fill="${bgColor}" ${filter}/>`;
            break;
    }

    return {
        svg: `
            ${defs ? `<defs>${defs}</defs>` : ''}
            ${bg}
            <text x="${x + width / 2}" y="${y + s.height / 2 + s.fontSize * 0.35}" text-anchor="middle" fill="${textColor}" font-family="Inter, system-ui" font-size="${s.fontSize}" font-weight="700" letter-spacing="0.5">${text}</text>
        `,
        bounds: { x, y, width, height: s.height }
    };
}

// ========================================
// RATING BADGES
// ========================================

export function generateRatingBadge({
    x = 50,
    y = 50,
    rating = 4.8,
    maxRating = 5,
    showStars = true,
    showValue = true,
    starColor = '#FBBF24',
    bgColor = 'rgba(251, 191, 36, 0.1)',
    textColor = '#FFFFFF',
    size = 'medium'
}) {
    const sizes = {
        small: { starSize: 12, fontSize: 14, height: 28, padding: 8 },
        medium: { starSize: 16, fontSize: 18, height: 36, padding: 12 },
        large: { starSize: 20, fontSize: 22, height: 44, padding: 16 }
    };

    const s = sizes[size] || sizes.medium;

    let width = s.padding * 2;
    let content = '';

    // Value
    if (showValue) {
        content += `<text x="${x + s.padding}" y="${y + s.height / 2 + s.fontSize * 0.35}" fill="${textColor}" font-family="Inter, system-ui" font-size="${s.fontSize}" font-weight="700">${rating}</text>`;
        width += s.fontSize * 1.5;
    }

    // Stars
    if (showStars) {
        const starsX = x + (showValue ? s.padding + s.fontSize * 1.5 + 5 : s.padding);
        for (let i = 0; i < maxRating; i++) {
            const fill = i < Math.floor(rating) ? starColor : 'rgba(255,255,255,0.2)';
            content += renderIcon({ icon: UI_ICONS.star, size: s.starSize, color: fill, x: starsX + i * (s.starSize + 2), y: y + (s.height - s.starSize) / 2 });
        }
        width += maxRating * (s.starSize + 2);
    }

    return {
        svg: `
            <rect x="${x}" y="${y}" width="${width}" height="${s.height}" rx="${s.height / 2}" fill="${bgColor}"/>
            ${content}
        `,
        bounds: { x, y, width, height: s.height }
    };
}

// ========================================
// AVATAR BADGES
// ========================================

export function generateAvatarBadge({
    x = 50,
    y = 50,
    avatars = 3,
    size = 40,
    overlap = 12,
    borderColor = '#0A0A1A',
    colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981'],
    showCount = true,
    count = '+2.5K',
    countBgColor = 'rgba(255,255,255,0.1)',
    textColor = '#FFFFFF'
}) {
    const elements = [];

    // Avatars
    for (let i = 0; i < avatars; i++) {
        const ax = x + i * (size - overlap);
        const color = colors[i % colors.length];

        elements.push(`
            <circle cx="${ax + size / 2}" cy="${y + size / 2}" r="${size / 2}" fill="${color}" stroke="${borderColor}" stroke-width="3"/>
            ${renderIcon({ icon: SOCIAL_ICONS.person, size: size * 0.5, color: 'rgba(255,255,255,0.8)', x: ax + size * 0.25, y: y + size * 0.25 })}
        `);
    }

    // Count badge
    if (showCount) {
        const countX = x + avatars * (size - overlap) + 5;
        const countW = count.length * 8 + 20;
        elements.push(`
            <rect x="${countX}" y="${y + (size - 30) / 2}" width="${countW}" height="30" rx="15" fill="${countBgColor}"/>
            <text x="${countX + countW / 2}" y="${y + size / 2 + 5}" text-anchor="middle" fill="${textColor}" font-family="Inter, system-ui" font-size="14" font-weight="600">${count}</text>
        `);
    }

    return {
        svg: elements.join('\n'),
        bounds: { x, y, width: avatars * (size - overlap) + 80, height: size }
    };
}

// ========================================
// CUSTOM BADGE
// ========================================

export function generateCustomBadge({
    x = 50,
    y = 50,
    text = 'Custom',
    icon = null,
    bgGradient = null, // ['#3B82F6', '#8B5CF6']
    bgColor = '#3B82F6',
    textColor = '#FFFFFF',
    borderRadius = 8,
    padding = { x: 16, y: 10 },
    fontSize = 14,
    iconSize = 18,
    borderColor = null,
    borderWidth = 2,
    shadow = false
}) {
    const id = `custom_${Date.now()}`;
    let defs = '';
    let bgFill = bgColor;

    // Gradient
    if (bgGradient && bgGradient.length >= 2) {
        defs += `<linearGradient id="${id}_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            ${bgGradient.map((c, i) => `<stop offset="${Math.round(i / (bgGradient.length - 1) * 100)}%" stop-color="${c}"/>`).join('')}
        </linearGradient>`;
        bgFill = `url(#${id}_grad)`;
    }

    // Shadow
    if (shadow) {
        defs += `<filter id="${id}_shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="rgba(0,0,0,0.3)"/>
        </filter>`;
    }

    const textWidth = text.length * fontSize * 0.55;
    const iconSpace = icon ? iconSize + 8 : 0;
    const width = padding.x * 2 + textWidth + iconSpace;
    const height = padding.y * 2 + fontSize;

    const border = borderColor ? `stroke="${borderColor}" stroke-width="${borderWidth}"` : '';
    const filter = shadow ? `filter="url(#${id}_shadow)"` : '';

    return {
        svg: `
            ${defs ? `<defs>${defs}</defs>` : ''}
            <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${borderRadius}" fill="${bgFill}" ${border} ${filter}/>
            ${icon ? renderIcon({ icon, size: iconSize, color: textColor, x: x + padding.x, y: y + (height - iconSize) / 2 }) : ''}
            <text x="${x + padding.x + iconSpace + textWidth / 2}" y="${y + height / 2 + fontSize * 0.35}" text-anchor="middle" fill="${textColor}" font-family="Inter, system-ui" font-size="${fontSize}" font-weight="600">${text}</text>
        `,
        bounds: { x, y, width, height }
    };
}

export default {
    generateDiscountBadge,
    generateTrustBadge,
    generateFeatureBadge,
    generateRatingBadge,
    generateAvatarBadge,
    generateCustomBadge
};
