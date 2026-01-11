/**
 * STYLE DNA EXTRACTOR
 * Extract visual style intelligence from product/brand
 * 
 * Determines optimal aesthetic direction for ad design
 */

import type { ProductDNA } from './product-dna-analyzer';

export interface StyleDNA {
    // Core Aesthetic
    aesthetic: AestheticStyle;
    subAesthetic: string;             // Specific variant

    // Design Philosophy
    philosophy: {
        approach: 'minimal' | 'maximal' | 'balanced';
        complexity: number;           // 1-10
        innovation: number;           // 1-10 (1=classic, 10=experimental)
        formality: number;            // 1-10 (1=playful, 10=corporate)
    };

    // Color Strategy
    colorStrategy: {
        scheme: ColorSchemeType;
        saturation: 'desaturated' | 'normal' | 'vibrant' | 'neon';
        contrast: 'low' | 'medium' | 'high' | 'extreme';
        temperature: 'cool' | 'neutral' | 'warm';
        palette: string[];            // Hex colors
    };

    // Typography Profile
    typography: {
        category: TypographyCategory;
        pairing: string[];            // [headline, body]
        hierarchy: 'subtle' | 'moderate' | 'dramatic';
        weight: 'light' | 'regular' | 'bold' | 'black';
        spacing: 'tight' | 'normal' | 'airy' | 'extreme';
    };

    // Visual Language
    visualLanguage: {
        forms: 'geometric' | 'organic' | 'mixed';
        corners: number;              // 0-50 border radius
        shadows: 'none' | 'soft' | 'hard' | 'dramatic' | '3d';
        layering: number;             // 1-10 depth complexity
        asymmetry: number;            // 0-100% how unbalanced
    };

    // Motion & Energy
    energy: {
        level: number;                // 1-10 (1=zen, 10=explosive)
        rhythm: 'static' | 'flowing' | 'dynamic' | 'chaotic';
        tension: 'relaxed' | 'balanced' | 'charged' | 'explosive';
    };

    // Materials & Texture
    materials: {
        primary: MaterialTexture;
        effects: EffectType[];
        depth: '2d' | '2.5d' | '3d' | 'hyper-3d';
    };
}

export type AestheticStyle =
    | 'minimal-zen'
    | 'minimal-swiss'
    | 'minimal-brutalist'
    | 'maximal-memphis'
    | 'maximal-80s'
    | 'maximal-neon'
    | 'luxury-editorial'
    | 'luxury-gold'
    | 'luxury-marble'
    | 'tech-glassmorphism'
    | 'tech-neumorphism'
    | 'tech-cyberpunk'
    | 'organic-natural'
    | 'organic-handdrawn'
    | 'retro-vintage'
    | 'futuristic-sci-fi';

export type ColorSchemeType =
    | 'monochrome'
    | 'analogous'
    | 'complementary'
    | 'split-complementary'
    | 'triadic'
    | 'tetradic';

export type TypographyCategory =
    | 'serif-classic'
    | 'serif-modern'
    | 'sans-grotesque'
    | 'sans-geometric'
    | 'sans-humanist'
    | 'display-bold'
    | 'display-elegant'
    | 'handwritten'
    | 'monospace';

export type MaterialTexture =
    | 'flat'
    | 'gradient'
    | 'grunge'
    | 'noise'
    | 'glass'
    | 'metal'
    | 'paper'
    | 'fabric';

export type EffectType =
    | 'blur'
    | 'grain'
    | 'glitch'
    | 'holographic'
    | 'chrome'
    | 'duotone';

/**
 * Extract style DNA from product DNA
 */
export function extractStyleDNA(productDNA: ProductDNA): StyleDNA {
    // Determine aesthetic based on product attributes
    const aesthetic = determineAesthetic(productDNA);

    // Build color strategy
    const colorStrategy = buildColorStrategy(productDNA, aesthetic);

    // Select typography
    const typography = selectTypography(aesthetic, productDNA);

    // Define visual language
    const visualLanguage = defineVisualLanguage(aesthetic);

    // Set energy level
    const energy = calculateEnergy(productDNA, aesthetic);

    // Choose materials
    const materials = selectMaterials(aesthetic, productDNA);

    return {
        aesthetic,
        subAesthetic: getSubAesthetic(aesthetic),
        philosophy: {
            approach: aesthetic.startsWith('minimal') ? 'minimal' : aesthetic.startsWith('maximal') ? 'maximal' : 'balanced',
            complexity: productDNA.semantic.prickPoint === 'luxury' ? 7 : 5,
            innovation: productDNA.psychological.aspirationalLevel,
            formality: productDNA.semantic.brandArchetype === 'ruler' ? 9 : productDNA.semantic.brandArchetype === 'jester' ? 2 : 5
        },
        colorStrategy,
        typography,
        visualLanguage,
        energy,
        materials
    };
}

/**
 * Determine optimal aesthetic style
 */
function determineAesthetic(dna: ProductDNA): AestheticStyle {
    const { pricePoint, brandArchetype } = dna.semantic;
    const { aspirationalLevel } = dna.psychological;
    const { productCategory } = dna.semantic;

    // Luxury products → Luxury aesthetics
    if (pricePoint === 'luxury' || pricePoint === 'ultra-luxury') {
        if (brandArchetype === 'ruler') return 'luxury-gold';
        if (productCategory === 'fashion') return 'luxury-editorial';
        return 'luxury-marble';
    }

    // Tech products → Tech aesthetics
    if (productCategory === 'electronics' || /tech|digital/i.test(productCategory)) {
        if (aspirationalLevel > 7) return 'tech-glassmorphism';
        if (brandArchetype === 'rebel') return 'tech-cyberpunk';
        return 'tech-neumorphism';
    }

    // Minimal aesthetic for professional/sophisticated
    if (brandArchetype === 'sage' || brandArchetype === 'ruler') {
        return 'minimal-swiss';
    }

    // Maximal for playful/bold
    if (brandArchetype === 'jester' || brandArchetype === 'rebel') {
        if (aspirationalLevel < 5) return 'maximal-80s';
        return 'maximal-memphis';
    }

    // Organic for natural/care products
    if (productCategory === 'beauty' || productCategory === 'food') {
        return 'organic-natural';
    }

    // Default: Minimal zen for broad appeal
    return 'minimal-zen';
}

/**
 * Build comprehensive color strategy
 */
function buildColorStrategy(dna: ProductDNA, aesthetic: AestheticStyle): StyleDNA['colorStrategy'] {
    const baseColors = dna.visual.dominantColors;

    let scheme: ColorSchemeType = 'monochrome';
    let saturation: 'desaturated' | 'normal' | 'vibrant' | 'neon' = 'normal';
    let contrast: 'low' | 'medium' | 'high' | 'extreme' = 'medium';
    let temperature: 'cool' | 'neutral' | 'warm' = 'neutral';

    // Aesthetic-specific adjustments
    switch (aesthetic) {
        case 'minimal-zen':
        case 'minimal-swiss':
            scheme = 'monochrome';
            saturation = 'desaturated';
            contrast = 'low';
            break;

        case 'minimal-brutalist':
            scheme = 'monochrome';
            saturation = 'normal';
            contrast = 'high';
            break;

        case 'maximal-memphis':
        case 'maximal-80s':
            scheme = 'triadic';
            saturation = 'vibrant';
            contrast = 'extreme';
            break;

        case 'maximal-neon':
        case 'tech-cyberpunk':
            scheme = 'complementary';
            saturation = 'neon';
            contrast = 'extreme';
            temperature = 'cool';
            break;

        case 'luxury-editorial':
        case 'luxury-gold':
            scheme = 'analogous';
            saturation = 'desaturated';
            contrast = 'medium';
            temperature = 'warm';
            break;

        case 'tech-glassmorphism':
        case 'tech-neumorphism':
            scheme = 'monochrome';
            saturation = 'desaturated';
            contrast = 'low';
            temperature = 'cool';
            break;

        case 'organic-natural':
            scheme = 'analogous';
            saturation = 'normal';
            contrast = 'medium';
            temperature = 'warm';
            break;
    }

    return {
        scheme,
        saturation,
        contrast,
        temperature,
        palette: generatePalette(scheme, saturation, baseColors)
    };
}

/**
 * Select typography based on aesthetic
 */
function selectTypography(aesthetic: AestheticStyle, _dna: ProductDNA): StyleDNA['typography'] {
    const typographyMap: Record<AestheticStyle, {
        category: TypographyCategory;
        pairing: string[];
        hierarchy: 'subtle' | 'moderate' | 'dramatic';
        weight: 'light' | 'regular' | 'bold' | 'black';
    }> = {
        'minimal-zen': {
            category: 'sans-humanist',
            pairing: ['Inter', 'Inter'],
            hierarchy: 'subtle',
            weight: 'light'
        },
        'minimal-swiss': {
            category: 'sans-grotesque',
            pairing: ['Helvetica Neue', 'Helvetica Neue'],
            hierarchy: 'subtle',
            weight: 'regular'
        },
        'minimal-brutalist': {
            category: 'sans-geometric',
            pairing: ['Space Grotesk', 'IBM Plex Mono'],
            hierarchy: 'dramatic',
            weight: 'black'
        },
        'maximal-memphis': {
            category: 'display-bold',
            pairing: ['Poppins', 'Poppins'],
            hierarchy: 'dramatic',
            weight: 'black'
        },
        'maximal-80s': {
            category: 'display-bold',
            pairing: ['Fredoka One', 'Quicksand'],
            hierarchy: 'dramatic',
            weight: 'black'
        },
        'maximal-neon': {
            category: 'display-bold',
            pairing: ['Orbitron', 'Rajdhani'],
            hierarchy: 'dramatic',
            weight: 'bold'
        },
        'luxury-editorial': {
            category: 'serif-modern',
            pairing: ['Playfair Display', 'Lato'],
            hierarchy: 'moderate',
            weight: 'bold'
        },
        'luxury-gold': {
            category: 'serif-classic',
            pairing: ['Cormorant Garamond', 'Montserrat'],
            hierarchy: 'moderate',
            weight: 'regular'
        },
        'luxury-marble': {
            category: 'serif-modern',
            pairing: ['Bodoni Moda', 'Raleway'],
            hierarchy: 'subtle',
            weight: 'light'
        },
        'tech-glassmorphism': {
            category: 'sans-geometric',
            pairing: ['Inter', 'Inter'],
            hierarchy: 'subtle',
            weight: 'regular'
        },
        'tech-neumorphism': {
            category: 'sans-geometric',
            pairing: ['Rubik', 'Rubik'],
            hierarchy: 'subtle',
            weight: 'regular'
        },
        'tech-cyberpunk': {
            category: 'display-bold',
            pairing: ['Orbitron', 'Rajdhani'],
            hierarchy: 'dramatic',
            weight: 'black'
        },
        'organic-natural': {
            category: 'serif-modern',
            pairing: ['Libre Baskerville', 'Open Sans'],
            hierarchy: 'moderate',
            weight: 'regular'
        },
        'organic-handdrawn': {
            category: 'handwritten',
            pairing: ['Caveat', 'Nunito'],
            hierarchy: 'moderate',
            weight: 'regular'
        },
        'retro-vintage': {
            category: 'serif-classic',
            pairing: ['Playfair Display', 'Lora'],
            hierarchy: 'moderate',
            weight: 'bold'
        },
        'futuristic-sci-fi': {
            category: 'sans-geometric',
            pairing: ['Exo 2', 'Rajdhani'],
            hierarchy: 'dramatic',
            weight: 'bold'
        }
    };

    const typo = typographyMap[aesthetic];

    return {
        ...typo,
        spacing: typo.weight === 'black' ? 'tight' : typo.weight === 'light' ? 'airy' : 'normal'
    };
}

/**
 * Define visual language elements
 */
function defineVisualLanguage(aesthetic: AestheticStyle): StyleDNA['visualLanguage'] {
    const languageMap: Record<string, StyleDNA['visualLanguage']> = {
        minimal: {
            forms: 'geometric',
            corners: 8,
            shadows: 'soft',
            layering: 2,
            asymmetry: 0
        },
        maximal: {
            forms: 'mixed',
            corners: 24,
            shadows: 'dramatic',
            layering: 8,
            asymmetry: 40
        },
        luxury: {
            forms: 'geometric',
            corners: 4,
            shadows: 'subtle',
            layering: 3,
            asymmetry: 10
        },
        tech: {
            forms: 'geometric',
            corners: 16,
            shadows: '3d',
            layering: 6,
            asymmetry: 0
        },
        organic: {
            forms: 'organic',
            corners: 32,
            shadows: 'soft',
            layering: 4,
            asymmetry: 20
        }
    };

    const category = aesthetic.split('-')[0];
    return languageMap[category] || languageMap.minimal;
}

/**
 * Calculate energy level
 */
function calculateEnergy(dna: ProductDNA, aesthetic: AestheticStyle): StyleDNA['energy'] {
    let level = 5;

    if (aesthetic.includes('maximal')) level = 9;
    else if (aesthetic.includes('minimal')) level = 2;
    else if (aesthetic.includes('tech')) level = 6;
    else if (aesthetic.includes('luxury')) level = 4;

    // Adjust for product attributes
    level += dna.psychological.urgencyFactor / 5;
    level = Math.min(10, Math.max(1, level));

    const rhythm = level > 7 ? 'chaotic' : level > 5 ? 'dynamic' : level > 3 ? 'flowing' : 'static';
    const tension = level > 8 ? 'explosive' : level > 6 ? 'charged' : level > 4 ? 'balanced' : 'relaxed';

    return { level, rhythm, tension };
}

/**
 * Select material textures
 */
function selectMaterials(aesthetic: AestheticStyle, _dna: ProductDNA): StyleDNA['materials'] {
    const materialsMap: Record<string, StyleDNA['materials']> = {
        'minimal-zen': {
            primary: 'flat',
            effects: [],
            depth: '2d'
        },
        'tech-glassmorphism': {
            primary: 'glass',
            effects: ['blur'],
            depth: '2.5d'
        },
        'maximal-neon': {
            primary: 'gradient',
            effects: ['glitch', 'holographic'],
            depth: '3d'
        },
        'luxury-gold': {
            primary: 'metal',
            effects: ['chrome'],
            depth: '2.5d'
        },
        'organic-natural': {
            primary: 'paper',
            effects: ['grain'],
            depth: '2d'
        }
    };

    return materialsMap[aesthetic] || {
        primary: 'flat',
        effects: [],
        depth: '2d'
    };
}

// Helper functions
function getSubAesthetic(aesthetic: AestheticStyle): string {
    return aesthetic.split('-')[1] || 'default';
}

function generatePalette(scheme: ColorSchemeType, saturation: string, baseColors: string[]): string[] {
    // Simplified palette generation; in production would use color theory algorithms
    return baseColors.slice(0, 5);
}
