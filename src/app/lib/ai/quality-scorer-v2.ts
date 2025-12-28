import type { AdDocument } from '../../types/studio';

/**
 * QUALITY SCORER V2
 * Multi-dimensional quality analysis for premium ads
 * 
 * Scoring Dimensions:
 * - Visual Appeal (0-100)
 * - Copy Clarity (0-100)
 * - Brand Consistency (0-100)
 * - Conversion Potential (0-100)
 * - Platform Optimization (0-100)
 */

export interface QualityScore {
    totalScore: number; // 0-100 (weighted average)

    breakdown: {
        visualAppeal: number;
        copyClarity: number;
        brandConsistency: number;
        conversionPotential: number;
        platformOptimization: number;
    };

    passed: boolean; // totalScore >= 85
    feedback: string[]; // Improvement suggestions
    reasoning: string; // Why this score
}

/**
 * Score an ad document on multiple quality dimensions
 */
export async function scoreAdQuality(
    adDocument: AdDocument,
    context?: {
        brandColor?: string;
        tone?: string;
        platform?: 'meta' | 'tiktok' | 'linkedin';
    }
): Promise<QualityScore> {
    const scores = {
        visualAppeal: scoreVisualAppeal(adDocument),
        copyClarity: scoreCopyClarity(adDocument),
        brandConsistency: scoreBrandConsistency(adDocument, context?.brandColor),
        conversionPotential: scoreConversionPotential(adDocument),
        platformOptimization: scorePlatformOptimization(adDocument, context?.platform || 'meta')
    };

    // Weighted average (visual appeal counts most)
    const weights = {
        visualAppeal: 0.30,
        copyClarity: 0.25,
        brandConsistency: 0.20,
        conversionPotential: 0.15,
        platformOptimization: 0.10
    };

    const totalScore = Math.round(
        scores.visualAppeal * weights.visualAppeal +
        scores.copyClarity * weights.copyClarity +
        scores.brandConsistency * weights.brandConsistency +
        scores.conversionPotential * weights.conversionPotential +
        scores.platformOptimization * weights.platformOptimization
    );

    const feedback = generateFeedback(scores, adDocument);
    const reasoning = generateReasoning(scores, totalScore);

    return {
        totalScore,
        breakdown: scores,
        passed: totalScore >= 85,
        feedback,
        reasoning
    };
}

/**
 * Score visual appeal (composition, balance, aesthetics)
 */
function scoreVisualAppeal(ad: AdDocument): number {
    let score = 100;
    const issues: string[] = [];

    // Check layer count (too few = boring, too many = cluttered)
    if (ad.layers.length < 3) {
        score -= 15;
        issues.push('Too few layers - design feels empty');
    } else if (ad.layers.length > 12) {
        score -= 10;
        issues.push('Too many layers - design feels cluttered');
    }

    // Check for text layers (needs copy)
    const textLayers = ad.layers.filter(l => l.type === 'text' || l.type === 'cta');
    if (textLayers.length === 0) {
        score -= 20;
        issues.push('No text layers - missing copy');
    }

    // Check for product/image layers
    const imageLayers = ad.layers.filter(l => l.type === 'product' || l.type === 'background' || l.type === 'overlay');
    if (imageLayers.length === 0) {
        score -= 15;
        issues.push('No image layers - missing visual anchor');
    }

    // Check for CTA
    const ctaLayers = ad.layers.filter(l => l.type === 'cta');
    if (ctaLayers.length === 0) {
        score -= 10;
        issues.push('No CTA button - missing conversion trigger');
    }

    // Check whitespace (based on layer coverage)
    const totalLayerArea = ad.layers.reduce((sum, layer) => {
        return sum + (layer.width * layer.height);
    }, 0);
    const canvasArea = ad.width * ad.height;
    const coverage = totalLayerArea / canvasArea;

    if (coverage > 0.9) {
        score -= 10;
        issues.push('Too little whitespace - feels cramped');
    } else if (coverage < 0.3) {
        score -= 5;
        issues.push('Too much whitespace - underutilized space');
    }

    return Math.max(0, score);
}

/**
 * Score copy clarity (readability, length, structure)
 */
function scoreCopyClarity(ad: AdDocument): number {
    let score = 100;
    const issues: string[] = [];

    const textLayers = ad.layers.filter(l =>
        (l.type === 'text' || l.type === 'cta') && 'text' in l
    );

    if (textLayers.length === 0) {
        return 0; // No copy at all
    }

    textLayers.forEach(layer => {
        const text = (layer as any).text || '';

        // Check headline length
        if (layer.role === 'headline') {
            if (text.length > 60) {
                score -= 10;
                issues.push('Headline too long - hard to read');
            } else if (text.length < 10) {
                score -= 5;
                issues.push('Headline too short - not impactful');
            }
        }

        // Check for all caps abuse
        if (text === text.toUpperCase() && text.length > 20) {
            score -= 5;
            issues.push('Excessive all caps - hard to read');
        }

        // Check font size readability
        const fontSize = (layer as any).fontSize || 16;
        if (fontSize < 14 && text.length > 50) {
            score -= 8;
            issues.push('Small font with long text - readability issue');
        }
    });

    // Check for description/body copy
    const hasDescription = textLayers.some(l =>
        l.role === 'description' || ((l as any).text || '').length > 50
    );
    if (!hasDescription) {
        score -= 5;
        issues.push('Missing descriptive copy');
    }

    return Math.max(0, score);
}

/**
 * Score brand consistency (color usage, fonts)
 */
function scoreBrandConsistency(ad: AdDocument, brandColor?: string): number {
    let score = 100;

    if (!brandColor) {
        return 80; // No brand color to check against, assume decent
    }

    // Check if brand color is used in any layer
    const layersWithColor = ad.layers.filter(l => {
        const color = (l as any).color || (l as any).fill || (l as any).bgColor;
        return color && colorsAreSimilar(color, brandColor);
    });

    if (layersWithColor.length === 0) {
        score -= 20; // Brand color not used at all
    } else if (layersWithColor.length === 1) {
        score -= 5; // Brand color used minimally
    }

    // Check font consistency (max 3 different fonts)
    const fontFamilies = new Set<string>();
    ad.layers.forEach(l => {
        if ('fontFamily' in l) {
            fontFamilies.add((l as any).fontFamily);
        }
    });

    if (fontFamilies.size > 3) {
        score -= 10; // Too many fonts
    }

    return Math.max(0, score);
}

/**
 * Score conversion potential (CTA strength, urgency, social proof)
 */
function scoreConversionPotential(ad: AdDocument): number {
    let score = 70; // Start at 70 (baseline)

    // Check for CTA
    const ctaLayers = ad.layers.filter(l => l.type === 'cta');
    if (ctaLayers.length > 0) {
        score += 15; // Has CTA

        // Check CTA text
        const ctaText = (ctaLayers[0] as any).text || '';
        const strongVerbs = ['get', 'start', 'join', 'claim', 'unlock', 'discover', 'try'];
        if (strongVerbs.some(verb => ctaText.toLowerCase().includes(verb))) {
            score += 10; // Strong action verb
        }
    } else {
        score -= 20; // No CTA
    }

    // Check for urgency signals
    const allText = ad.layers
        .filter(l => 'text' in l)
        .map(l => ((l as any).text || '').toLowerCase())
        .join(' ');

    const urgencyWords = ['now', 'today', 'limited', 'ending', 'last chance', 'hurry'];
    if (urgencyWords.some(word => allText.includes(word))) {
        score += 5; // Has urgency
    }

    // Check for social proof
    const proofWords = ['trusted', 'rated', 'customers', 'users', 'reviews'];
    if (proofWords.some(word => allText.includes(word))) {
        score += 10; // Has social proof
    }

    return Math.min(100, Math.max(0, score));
}

/**
 * Score platform optimization (Meta/TikTok/LinkedIn specs)
 */
function scorePlatformOptimization(
    ad: AdDocument,
    platform: 'meta' | 'tiktok' | 'linkedin'
): number {
    let score = 100;

    const specs: Record<string, { width: number; height: number; minTextSize: number }> = {
        meta: { width: 1080, height: 1350, minTextSize: 16 },
        tiktok: { width: 1080, height: 1920, minTextSize: 18 },
        linkedin: { width: 1200, height: 627, minTextSize: 14 }
    };

    const spec = specs[platform];

    // Check dimensions
    if (ad.width !== spec.width || ad.height !== spec.height) {
        score -= 15; // Wrong dimensions for platform
    }

    // Check text size
    const textLayers = ad.layers.filter(l => 'fontSize' in l);
    const tooSmallText = textLayers.filter(l =>
        ((l as any).fontSize || 16) < spec.minTextSize
    );
    if (tooSmallText.length > 0) {
        score -= 10; // Text too small for platform
    }

    // Check for platform-specific best practices
    if (platform === 'meta') {
        // Meta prefers <20% text in image
        const totalTextArea = textLayers.reduce((sum, l) => sum + (l.width * l.height), 0);
        const imageArea = ad.width * ad.height;
        if (totalTextArea / imageArea > 0.25) {
            score -= 10; // Too much text for Meta
        }
    }

    return Math.max(0, score);
}

/**
 * Generate actionable feedback
 */
function generateFeedback(
    scores: QualityScore['breakdown'],
    ad: AdDocument
): string[] {
    const feedback: string[] = [];

    if (scores.visualAppeal < 80) {
        feedback.push('Improve visual balance and composition');
    }
    if (scores.copyClarity < 80) {
        feedback.push('Simplify copy for better readability');
    }
    if (scores.brandConsistency < 80) {
        feedback.push('Use brand colors more consistently');
    }
    if (scores.conversionPotential < 80) {
        feedback.push('Add stronger CTA or urgency elements');
    }
    if (scores.platformOptimization < 90) {
        feedback.push('Optimize dimensions and text size for platform');
    }

    return feedback.length > 0 ? feedback : ['Ad meets quality standards!'];
}

/**
 * Generate reasoning for the score
 */
function generateReasoning(
    scores: QualityScore['breakdown'],
    totalScore: number
): string {
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    Object.entries(scores).forEach(([dimension, score]) => {
        if (score >= 90) {
            strengths.push(dimension);
        } else if (score < 75) {
            weaknesses.push(dimension);
        }
    });

    let reasoning = `Total quality score: ${totalScore}/100. `;

    if (strengths.length > 0) {
        reasoning += `Strong in ${strengths.join(', ')}. `;
    }
    if (weaknesses.length > 0) {
        reasoning += `Needs improvement in ${weaknesses.join(', ')}.`;
    }

    return reasoning;
}

// ========== UTILITY FUNCTIONS ==========

function colorsAreSimilar(color1: string, color2: string, threshold: number = 30): boolean {
    const hsl1 = hexToHSL(color1);
    const hsl2 = hexToHSL(color2);

    const hueDiff = Math.abs(hsl1.h - hsl2.h);
    const satDiff = Math.abs(hsl1.s - hsl2.s);
    const lightDiff = Math.abs(hsl1.l - hsl2.l);

    return (hueDiff < threshold && satDiff < 20 && lightDiff < 20);
}

function hexToHSL(hex: string): { h: number; s: number; l: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 0, l: 50 };

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
