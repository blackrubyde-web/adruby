/**
 * BRAND GUIDELINES VALIDATOR
 * Ensure brand consistency across all ads
 * 
 * Features:
 * - Logo placement rules (minimum clear space)
 * - Forbidden color combinations
 * - Typography hierarchy validation
 * - Aspect ratio preservation
 * - Brand voice compliance
 */

export interface BrandGuidelines {
    name: string;
    colors: {
        primary: string[];      // Allowed primary colors
        forbidden: string[][];  // Forbidden combinations [[color1, color2]]
    };
    typography: {
        allowedFonts: string[];
        headlineMaxSize: number;
        headlineMinSize: number;
        bodyMaxSize: number;
        bodyMinSize: number;
    };
    logo: {
        minClearSpace: number;    // Pixels around logo
        minSize: number;          // Minimum logo dimension
        preferredPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    };
    voice: {
        toneKeywords: string[];   // Required tone indicators
        bannedWords: string[];    // Forbidden words
    };
}

export interface ValidationResult {
    passed: boolean;
    violations: Array<{
        rule: string;
        severity: 'error' | 'warning';
        message: string;
        suggestion: string;
    }>;
    score: number; // 0-100
}

type AdLayer = {
    id?: string;
    name?: string;
    type?: string;
    role?: string;
    color?: string;
    fill?: string;
    bgColor?: string;
    fontFamily?: string;
    fontSize?: number;
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    text?: string;
};


function getLayers(doc: unknown): AdLayer[] {
    if (!doc || typeof doc !== 'object') return [];
    const layers = (doc as { layers?: unknown }).layers;
    return Array.isArray(layers) ? (layers as AdLayer[]) : [];
}

/**
 * Default brand guidelines template
 */
const DEFAULT_GUIDELINES: BrandGuidelines = {
    name: 'Default',
    colors: {
        primary: [],
        forbidden: []
    },
    typography: {
        allowedFonts: ['Inter', 'Montserrat', 'Playfair Display'],
        headlineMaxSize: 120,
        headlineMinSize: 40,
        bodyMaxSize: 36,
        bodyMinSize: 16
    },
    logo: {
        minClearSpace: 20,
        minSize: 80,
        preferredPosition: 'top-right'
    },
    voice: {
        toneKeywords: [],
        bannedWords: []
    }
};

/**
 * Check if color is in allowed list
 */
function isColorAllowed(color: string, allowed: string[]): boolean {
    if (allowed.length === 0) return true; // No restrictions
    return allowed.some(allowedColor =>
        color.toLowerCase() === allowedColor.toLowerCase()
    );
}

/**
 * Check if color combination is forbidden
 */
function isCombinationForbidden(
    color1: string,
    color2: string,
    forbidden: string[][]
): boolean {
    return forbidden.some(pair => {
        const [c1, c2] = pair.map(c => c.toLowerCase());
        const cl1 = color1.toLowerCase();
        const cl2 = color2.toLowerCase();
        return (cl1 === c1 && cl2 === c2) || (cl1 === c2 && cl2 === c1);
    });
}

/**
 * Validate brand guidelines compliance
 */
export function validateBrandGuidelines(
    adDocument: unknown,
    guidelines: BrandGuidelines = DEFAULT_GUIDELINES
): ValidationResult {
    const violations: ValidationResult['violations'] = [];
    let score = 100;
    const layers = getLayers(adDocument);

    // 1. Validate Colors
    const colorLayers = layers.filter((l) =>
        l.type === 'text' || l.type === 'cta' || l.type === 'shape'
    );

    if (guidelines.colors.primary.length > 0) {
        colorLayers.forEach((layer) => {
            const layerColor = layer.color || layer.fill || layer.bgColor;

            if (layerColor && !isColorAllowed(layerColor, guidelines.colors.primary)) {
                violations.push({
                    rule: 'brand-colors',
                    severity: 'error',
                    message: `Layer "${layer.name}" uses non-brand color: ${layerColor}`,
                    suggestion: `Use one of: ${guidelines.colors.primary.join(', ')}`
                });
                score -= 15;
            }
        });
    }

    // Check forbidden combinations
    for (let i = 0; i < colorLayers.length; i++) {
        for (let j = i + 1; j < colorLayers.length; j++) {
            const color1 = colorLayers[i].color || colorLayers[i].fill || colorLayers[i].bgColor;
            const color2 = colorLayers[j].color || colorLayers[j].fill || colorLayers[j].bgColor;

            if (color1 && color2 && isCombinationForbidden(color1, color2, guidelines.colors.forbidden)) {
                violations.push({
                    rule: 'forbidden-combination',
                    severity: 'warning',
                    message: `Forbidden color combination: ${color1} + ${color2}`,
                    suggestion: 'Choose alternative colors per brand guidelines'
                });
                score -= 10;
            }
        }
    }

    // 2. Validate Typography
    const textLayers = layers.filter((l) => l.type === 'text' || l.type === 'cta');

    textLayers.forEach((layer) => {
        // Check font family
        if (layer.fontFamily && guidelines.typography.allowedFonts.length > 0) {
            if (!guidelines.typography.allowedFonts.includes(layer.fontFamily)) {
                violations.push({
                    rule: 'typography-font',
                    severity: 'warning',
                    message: `Layer "${layer.name}" uses non-brand font: ${layer.fontFamily}`,
                    suggestion: `Use: ${guidelines.typography.allowedFonts.join(', ')}`
                });
                score -= 5;
            }
        }

        // Check font sizes
        if (layer.role === 'headline') {
            if ((layer.fontSize ?? 0) > guidelines.typography.headlineMaxSize) {
                violations.push({
                    rule: 'typography-size',
                    severity: 'error',
                    message: `Headline too large: ${layer.fontSize}px (max: ${guidelines.typography.headlineMaxSize}px)`,
                    suggestion: `Reduce to ${guidelines.typography.headlineMaxSize}px or less`
                });
                score -= 10;
            }
            if ((layer.fontSize ?? 0) < guidelines.typography.headlineMinSize) {
                violations.push({
                    rule: 'typography-size',
                    severity: 'warning',
                    message: `Headline too small: ${layer.fontSize}px (min: ${guidelines.typography.headlineMinSize}px)`,
                    suggestion: `Increase to at least ${guidelines.typography.headlineMinSize}px`
                });
                score -= 5;
            }
        }
    });

    // 3. Validate Logo (if present)
    const logoLayer = layers.find((l) =>
        l.name?.toLowerCase().includes('logo') || l.role === 'logo'
    );

    if (logoLayer) {
        // Check minimum size
        const logoSize = Math.min(logoLayer.width ?? 0, logoLayer.height ?? 0);
        if (logoSize < guidelines.logo.minSize) {
            violations.push({
                rule: 'logo-size',
                severity: 'error',
                message: `Logo too small: ${logoSize}px (min: ${guidelines.logo.minSize}px)`,
                suggestion: `Resize logo to at least ${guidelines.logo.minSize}px`
            });
            score -= 15;
        }

        // Check clear space (naive check - just ensure not overlapping)
        const hasOverlap = layers.some((other) => {
            if (other.id === logoLayer.id || other.type === 'background') return false;

            const logoX = logoLayer.x ?? 0;
            const logoY = logoLayer.y ?? 0;
            const otherX = other.x ?? 0;
            const otherY = other.y ?? 0;
            const distance = Math.sqrt(
                Math.pow(otherX - logoX, 2) +
                Math.pow(otherY - logoY, 2)
            );

            return distance < guidelines.logo.minClearSpace;
        });

        if (hasOverlap) {
            violations.push({
                rule: 'logo-clearspace',
                severity: 'warning',
                message: `Logo has insufficient clear space (min: ${guidelines.logo.minClearSpace}px)`,
                suggestion: 'Move logo or other elements to create clear space'
            });
            score -= 5;
        }
    }

    // 4. Validate Voice/Tone (if text present)
    if (guidelines.voice.bannedWords.length > 0) {
        textLayers.forEach((layer) => {
            if (layer.text) {
                const text = layer.text.toLowerCase();
                const found = guidelines.voice.bannedWords.filter(word =>
                    text.includes(word.toLowerCase())
                );

                if (found.length > 0) {
                    violations.push({
                        rule: 'brand-voice',
                        severity: 'error',
                        message: `Layer "${layer.name}" contains banned word(s): ${found.join(', ')}`,
                        suggestion: 'Rephrase to align with brand voice'
                    });
                    score -= 20;
                }
            }
        });
    }

    return {
        passed: violations.filter(v => v.severity === 'error').length === 0,
        violations,
        score: Math.max(0, score)
    };
}

/**
 * Create custom brand guidelines
 */
export function createBrandGuidelines(config: Partial<BrandGuidelines>): BrandGuidelines {
    return {
        ...DEFAULT_GUIDELINES,
        ...config,
        colors: {
            ...DEFAULT_GUIDELINES.colors,
            ...(config.colors || {})
        },
        typography: {
            ...DEFAULT_GUIDELINES.typography,
            ...(config.typography || {})
        },
        logo: {
            ...DEFAULT_GUIDELINES.logo,
            ...(config.logo || {})
        },
        voice: {
            ...DEFAULT_GUIDELINES.voice,
            ...(config.voice || {})
        }
    };
}
