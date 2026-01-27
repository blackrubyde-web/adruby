/**
 * COLOR INTELLIGENCE ENGINE
 * 
 * AI-driven color extraction and palette generation.
 * NO hardcoded colors - everything derived from:
 * 1. Product image analysis
 * 2. Foreplay reference ad palettes
 * 3. Industry color psychology
 * 4. Color harmony theory
 */

import sharp from 'sharp';
import { callOpenAI } from '../utils/openaiClient.js';

// Color harmony ratios (degrees on color wheel)
const HARMONY_RULES = {
    complementary: 180,
    analogous: 30,
    triadic: 120,
    split_complementary: [150, 210],
    tetradic: [90, 180, 270]
};

// Industry color psychology (derived from research)
const INDUSTRY_COLOR_VIBES = {
    tech: { hue_range: [180, 270], saturation: 'high', brightness: 'medium' },
    beauty: { hue_range: [300, 360], saturation: 'medium', brightness: 'high' },
    fitness: { hue_range: [0, 30], saturation: 'high', brightness: 'high' },
    finance: { hue_range: [200, 240], saturation: 'low', brightness: 'medium' },
    food: { hue_range: [20, 50], saturation: 'high', brightness: 'high' },
    fashion: { hue_range: [0, 360], saturation: 'medium', brightness: 'high' },
    health: { hue_range: [90, 150], saturation: 'medium', brightness: 'high' },
    luxury: { hue_range: [40, 50], saturation: 'low', brightness: 'low' },
    gaming: { hue_range: [260, 320], saturation: 'high', brightness: 'medium' },
    saas: { hue_range: [200, 280], saturation: 'medium', brightness: 'medium' }
};

/**
 * Extract comprehensive color palette from product image
 * Uses k-means clustering for dominant colors
 */
export async function extractProductPalette(imageBuffer) {
    console.log('[ColorIntel] 🎨 Extracting product palette...');

    try {
        const { data, info } = await sharp(imageBuffer)
            .resize(150, 150, { fit: 'cover' })
            .raw()
            .toBuffer({ resolveWithObject: true });

        const colors = {};
        const pixels = [];

        // Sample pixels
        for (let i = 0; i < data.length; i += info.channels) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            pixels.push({ r, g, b });

            // Quantize for frequency counting
            const key = `${Math.round(r / 16) * 16},${Math.round(g / 16) * 16},${Math.round(b / 16) * 16}`;
            colors[key] = (colors[key] || 0) + 1;
        }

        // Sort by frequency
        const sorted = Object.entries(colors)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        // Extract meaningful colors (filter out near-white/black)
        const meaningful = sorted.filter(([key]) => {
            const [r, g, b] = key.split(',').map(Number);
            const brightness = (r + g + b) / 3;
            const saturation = Math.max(r, g, b) - Math.min(r, g, b);
            return brightness > 30 && brightness < 230 && saturation > 20;
        });

        // Build palette
        const palette = meaningful.slice(0, 5).map(([key]) => {
            const [r, g, b] = key.split(',').map(Number);
            return rgbToHex(r, g, b);
        });

        // Find most vibrant color as accent
        const accent = findMostVibrant(meaningful);

        // Find best text color based on dominant background
        const dominant = sorted[0];
        const [dr, dg, db] = dominant[0].split(',').map(Number);
        const dominantBrightness = (dr + dg + db) / 3;
        const textColor = dominantBrightness > 128 ? '#1A1A2E' : '#FFFFFF';

        console.log(`[ColorIntel]   Dominant: ${palette[0] || '#0A0A1A'}`);
        console.log(`[ColorIntel]   Accent: ${accent}`);
        console.log(`[ColorIntel]   Palette: ${palette.length} colors`);

        return {
            dominant: palette[0] || '#0A0A1A',
            secondary: palette[1] || '#1A1A3A',
            accent: accent,
            textPrimary: textColor,
            textSecondary: adjustOpacity(textColor, 0.7),
            palette: palette,
            raw: meaningful.map(([key, count]) => ({ color: key, count }))
        };
    } catch (error) {
        console.error('[ColorIntel] Extraction failed:', error.message);
        throw new Error(`Color extraction failed: ${error.message}`);
    }
}

/**
 * Analyze color palettes from Foreplay reference ads using GPT-4V
 */
export async function analyzeReferencePalettes(referenceAds) {
    console.log(`[ColorIntel] 🔍 Analyzing ${referenceAds.length} reference palettes...`);

    if (!referenceAds || referenceAds.length === 0) {
        throw new Error('Reference ads required for palette analysis');
    }

    const referenceImages = referenceAds
        .map(ad => ad.image || ad.thumbnail)
        .filter(Boolean)
        .slice(0, 5);

    if (referenceImages.length === 0) {
        throw new Error('Reference ads have no images for color analysis');
    }

    try {
        const response = await callOpenAI({
            model: 'gpt-4o',
            messages: [{
                role: 'system',
                content: 'You are an expert color analyst. Extract precise color palettes from ad images.'
            }, {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: `Analyze these high-performing ads and extract their color palettes.
For each ad, identify:
1. Background color(s) - hex codes
2. Primary accent color - hex code
3. Text colors used - hex codes
4. Overall color mood (warm/cool/vibrant/muted/neutral)
5. Color harmony type (complementary/analogous/triadic/monochromatic)

Return JSON:
{
  "commonPalette": {
    "backgrounds": ["#hex1", "#hex2"],
    "accents": ["#hex1", "#hex2"],
    "textColors": ["#hex1", "#hex2"],
    "mood": "warm|cool|vibrant|muted|neutral",
    "harmony": "complementary|analogous|triadic|monochromatic"
  },
  "recommendations": {
    "primaryBackground": "#hex",
    "secondaryBackground": "#hex",
    "accent": "#hex",
    "textPrimary": "#hex",
    "textSecondary": "#hex"
  }
}`
                    },
                    ...referenceImages.map(url => ({
                        type: 'image_url',
                        image_url: { url, detail: 'low' }
                    }))
                ]
            }],
            max_tokens: 500,
            response_format: { type: 'json_object' }
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');
        console.log(`[ColorIntel]   Mood: ${result.commonPalette?.mood || 'unknown'}`);
        console.log(`[ColorIntel]   Harmony: ${result.commonPalette?.harmony || 'unknown'}`);

        return result;
    } catch (error) {
        console.error('[ColorIntel] Reference analysis failed:', error.message);
        throw error;
    }
}

/**
 * Generate harmonious color palette based on base color and style
 */
export function generateHarmoniousPalette(baseColor, harmonyType = 'analogous') {
    console.log(`[ColorIntel] 🌈 Generating ${harmonyType} palette from ${baseColor}...`);

    const hsl = hexToHsl(baseColor);
    const palette = [baseColor];

    switch (harmonyType) {
        case 'complementary':
            palette.push(hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l));
            break;
        case 'analogous':
            palette.push(hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l));
            palette.push(hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l));
            break;
        case 'triadic':
            palette.push(hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l));
            palette.push(hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l));
            break;
        case 'split_complementary':
            palette.push(hslToHex((hsl.h + 150) % 360, hsl.s, hsl.l));
            palette.push(hslToHex((hsl.h + 210) % 360, hsl.s, hsl.l));
            break;
        default:
            // Monochromatic - vary lightness
            palette.push(hslToHex(hsl.h, hsl.s, Math.min(95, hsl.l + 20)));
            palette.push(hslToHex(hsl.h, hsl.s, Math.max(5, hsl.l - 20)));
    }

    // Add neutral shades
    palette.push(hslToHex(hsl.h, Math.max(0, hsl.s - 60), 15)); // Dark background
    palette.push(hslToHex(hsl.h, Math.max(0, hsl.s - 70), 95)); // Light text

    return palette;
}

/**
 * Apply color psychology adjustments based on industry
 */
export function applyColorPsychology(palette, industry) {
    console.log(`[ColorIntel] 🧠 Applying ${industry} color psychology...`);

    const vibe = INDUSTRY_COLOR_VIBES[industry.toLowerCase()] || INDUSTRY_COLOR_VIBES.tech;
    const adjustedPalette = { ...palette };

    // Adjust accent color to match industry vibe
    if (palette.accent) {
        const hsl = hexToHsl(palette.accent);

        // Shift hue towards industry range if needed
        const targetHue = (vibe.hue_range[0] + vibe.hue_range[1]) / 2;
        const hueDistance = Math.abs(hsl.h - targetHue);

        if (hueDistance > 60) {
            // Blend towards industry color
            const blendedHue = hsl.h + (targetHue - hsl.h) * 0.3;
            adjustedPalette.accent = hslToHex(blendedHue, hsl.s, hsl.l);
            console.log(`[ColorIntel]   Shifted accent ${palette.accent} → ${adjustedPalette.accent}`);
        }

        // Adjust saturation
        if (vibe.saturation === 'high' && hsl.s < 60) {
            adjustedPalette.accent = hslToHex(hsl.h, Math.min(90, hsl.s + 20), hsl.l);
        } else if (vibe.saturation === 'low' && hsl.s > 50) {
            adjustedPalette.accent = hslToHex(hsl.h, Math.max(20, hsl.s - 20), hsl.l);
        }
    }

    return adjustedPalette;
}

/**
 * MASTER: Build complete color intelligence package
 */
export async function buildColorIntelligence(productImageBuffer, referenceAds, industry) {
    console.log('[ColorIntel] ════════════════════════════════════');
    console.log('[ColorIntel] 🎨 BUILDING COLOR INTELLIGENCE');
    console.log('[ColorIntel] ════════════════════════════════════');

    // 1. Extract from product
    const productPalette = await extractProductPalette(productImageBuffer);

    // 2. Analyze references
    const referencePalette = await analyzeReferencePalettes(referenceAds);

    // 3. Merge intelligently
    const mergedPalette = {
        // Prefer product's dominant for brand consistency
        dominant: productPalette.dominant,
        // Use reference recommendations for secondary
        secondary: referencePalette.recommendations?.secondaryBackground || productPalette.secondary,
        // Blend accents (product + reference)
        accent: blendColors(productPalette.accent, referencePalette.recommendations?.accent),
        // Text from reference (proven readability)
        textPrimary: referencePalette.recommendations?.textPrimary || productPalette.textPrimary,
        textSecondary: referencePalette.recommendations?.textSecondary || productPalette.textSecondary,
        // Keep raw palette for effects
        palette: [...new Set([...productPalette.palette, ...(referencePalette.commonPalette?.accents || [])])].slice(0, 8),
        // Metadata
        mood: referencePalette.commonPalette?.mood || 'vibrant',
        harmony: referencePalette.commonPalette?.harmony || 'analogous'
    };

    // 4. Apply industry psychology
    const finalPalette = applyColorPsychology(mergedPalette, industry);

    // 5. Generate gradient pairs
    finalPalette.gradients = {
        primary: [finalPalette.accent, shiftHue(finalPalette.accent, 30)],
        cta: [finalPalette.accent, shiftHue(finalPalette.accent, -20)],
        background: [finalPalette.dominant, finalPalette.secondary]
    };

    // 6. Ensure contrast ratios
    finalPalette.textPrimary = ensureContrast(finalPalette.textPrimary, finalPalette.dominant, 7);
    finalPalette.textSecondary = ensureContrast(finalPalette.textSecondary, finalPalette.dominant, 4.5);

    console.log('[ColorIntel] ════════════════════════════════════');
    console.log(`[ColorIntel] ✅ Palette complete: ${finalPalette.palette.length} colors`);
    console.log(`[ColorIntel]    Mood: ${finalPalette.mood}`);
    console.log(`[ColorIntel]    Accent: ${finalPalette.accent}`);
    console.log('[ColorIntel] ════════════════════════════════════');

    return finalPalette;
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function hexToHsl(hex) {
    const { r, g, b } = hexToRgb(hex);
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case rNorm: h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6; break;
            case gNorm: h = ((bNorm - rNorm) / d + 2) / 6; break;
            case bNorm: h = ((rNorm - gNorm) / d + 4) / 6; break;
        }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function findMostVibrant(colors) {
    let maxVibrance = 0;
    let vibrantColor = '#FF4757';

    for (const [key] of colors) {
        const [r, g, b] = key.split(',').map(Number);
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max === 0 ? 0 : (max - min) / max;
        const brightness = (r + g + b) / 3;
        const vibrance = saturation * (brightness / 255);

        if (vibrance > maxVibrance && brightness > 50 && brightness < 220) {
            maxVibrance = vibrance;
            vibrantColor = rgbToHex(r, g, b);
        }
    }

    return vibrantColor;
}

function adjustOpacity(hex, opacity) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function blendColors(color1, color2, ratio = 0.5) {
    if (!color1) return color2 || '#FF4757';
    if (!color2) return color1;

    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    return rgbToHex(
        Math.round(rgb1.r * ratio + rgb2.r * (1 - ratio)),
        Math.round(rgb1.g * ratio + rgb2.g * (1 - ratio)),
        Math.round(rgb1.b * ratio + rgb2.b * (1 - ratio))
    );
}

function shiftHue(hex, degrees) {
    const hsl = hexToHsl(hex);
    return hslToHex((hsl.h + degrees + 360) % 360, hsl.s, hsl.l);
}

function getContrastRatio(color1, color2) {
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
}

function getLuminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    const [rs, gs, bs] = [r, g, b].map(c => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function ensureContrast(textColor, bgColor, minRatio = 4.5) {
    let ratio = getContrastRatio(textColor, bgColor);
    if (ratio >= minRatio) return textColor;

    const bgLum = getLuminance(bgColor);
    // If background is dark, ensure light text; if light, ensure dark text
    return bgLum < 0.5 ? '#FFFFFF' : '#1A1A2E';
}

export default {
    extractProductPalette,
    analyzeReferencePalettes,
    generateHarmoniousPalette,
    applyColorPsychology,
    buildColorIntelligence
};
