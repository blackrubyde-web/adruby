import type { AdDocument, StudioLayer, TextLayer, ImageLayer, CtaLayer, ShapeLayer } from '../../types/studio';

/**
 * SMART LAYOUT ENGINE
 * "10/10" Quality Standard
 * 
 * Replaces rigid templates with dynamic, content-aware composition.
 * Enforces:
 * - Professional breathing room (80px margins)
 * - Visual Hierarchy (Headline > CTA > Product)
 * - Contrast harmony
 */

const CANV_SIZE = 1080;
const MARGIN = 80;
const SAFE_WIDTH = CANV_SIZE - (MARGIN * 2);

export interface SmartLayoutInput {
    id?: string;
    productName: string;
    brandName?: string;
    headline: string;
    subheadline?: string; // Optional hook
    description?: string;
    ctaText: string;
    productImage?: string; // S3 URL or Base64
    backgroundImage?: string; // Generated or selected
    colors: {
        primary: string; // Brand color for CTA/Accents
        text: string;    // Main text color (usually contrasting bg)
        background: string; // Fallback bg color
        accent: string;
    };
    font: 'Inter' | 'Montserrat' | 'Playfair Display'; // Can extend
    styleVibe: 'minimal' | 'bold' | 'luxury';
}

export const SmartLayoutEngine = {
    compose(input: SmartLayoutInput): AdDocument {
        const layers: StudioLayer[] = [];
        const timestamp = Date.now();

        // 1. Background
        // Priority: Provided BG Image > Solid Color
        if (input.backgroundImage) {
            layers.push({
                id: `bg-${timestamp}`,
                type: 'background',
                name: 'Smart Background',
                x: 0, y: 0,
                width: CANV_SIZE,
                height: CANV_SIZE,
                visible: true,
                locked: true, // Lock background by default for better UX
                rotation: 0,
                opacity: 1,
                src: input.backgroundImage,
                blur: input.styleVibe === 'luxury' ? 20 : 0 // Subtle blur for luxury interaction
            } as ImageLayer);

            // Add overlay for readability if needed
            layers.push({
                id: `bg-overlay-${timestamp}`,
                type: 'shape',
                name: 'Contrast Overlay',
                x: 0, y: 0,
                width: CANV_SIZE,
                height: CANV_SIZE,
                visible: true,
                locked: true,
                rotation: 0,
                opacity: input.styleVibe === 'bold' ? 0.7 : 0.4,
                fill: input.styleVibe === 'minimal' ? '#ffffff' : '#000000',
                strokeWidth: 0,
                cornerRadius: 0
            } as ShapeLayer);

        } else {
            layers.push({
                id: `bg-solid-${timestamp}`,
                type: 'background',
                name: 'Solid Background',
                x: 0, y: 0,
                width: CANV_SIZE,
                height: CANV_SIZE,
                visible: true,
                locked: true,
                rotation: 0,
                opacity: 1,
                src: '', // No image
                // Use a subtle gradient or solid
                fill: input.colors.background
            } as ImageLayer); // Type needs 'src', but renderer handles 'fill' if we trick it or usage Shape? existing renderer expects ImageLayer for BG usually, let's stick to ImageLayer structure but maybe empty src means we rely on doc.backgroundColor? 
            // Actually, AdDocument has backgroundColor. We'll set that too.
        }

        // 2. Product Hero
        // Dynamic sizing: If only product (minimal), make it huge. If lots of text, make it balanced.
        const productSize = input.styleVibe === 'bold' ? 700 : 550;
        const productY = input.styleVibe === 'bold' ? 500 : 450;

        if (input.productImage) {
            layers.push({
                id: `product-hero-${timestamp}`,
                type: 'product',
                name: 'Hero Product',
                x: (CANV_SIZE - productSize) / 2, // Centered
                y: productY,
                width: productSize,
                height: productSize, // Square aspect ratio assumption for container, fit='contain' handles actual ratio
                visible: true,
                locked: false,
                rotation: 0,
                opacity: 1,
                src: input.productImage,
                fit: 'contain',
                shadowColor: 'rgba(0,0,0,0.4)',
                shadowBlur: 40,
                shadowOffsetY: 20
            } as ImageLayer);
        }

        // 3. Typography System
        // "Smart Fitting" logic

        // Headline
        const headlineSize = calculateFontSize(input.headline, SAFE_WIDTH, 120, 60); // Max 120, Min 60
        const headlineY = MARGIN + 40; // Top padding

        layers.push({
            id: `text-headline-${timestamp}`,
            type: 'text',
            name: 'Headline',
            text: input.headline,
            x: MARGIN,
            y: headlineY,
            width: SAFE_WIDTH,
            height: headlineSize * 2.5, // ESTIMATE height
            visible: true,
            locked: false,
            rotation: 0,
            opacity: 1,
            fontSize: headlineSize,
            fontFamily: input.font,
            fontWeight: 800, // Extra Bold
            align: 'center',
            color: input.colors.text,
            lineHeight: 1.1,
            shadowColor: input.styleVibe === 'bold' ? 'rgba(0,0,0,0.5)' : 'transparent',
            shadowBlur: 10
        } as TextLayer);

        // Subheadline / Description
        if (input.description || input.subheadline) {
            const descText = input.subheadline || input.description || "";
            const descY = headlineY + (headlineSize * 1.5) + 20; // Below headline

            layers.push({
                id: `text-desc-${timestamp}`,
                type: 'text',
                name: 'Description',
                text: descText,
                x: MARGIN + 40, // Slightly tighter width for readability
                y: descY,
                width: SAFE_WIDTH - 80,
                height: 200,
                visible: true,
                locked: false,
                rotation: 0,
                opacity: 0.9,
                fontSize: 32,
                fontFamily: input.font,
                fontWeight: 500,
                align: 'center',
                color: input.colors.text,
                lineHeight: 1.4
            } as TextLayer);
        }

        // 4. CTA Button
        // Always at bottom visual anchor
        const ctaWidth = 450;
        const ctaHeight = 110;
        const ctaY = CANV_SIZE - MARGIN - ctaHeight - 20;

        layers.push({
            id: `cta-main-${timestamp}`,
            type: 'cta',
            name: 'CTA Button',
            text: input.ctaText.toUpperCase(),
            x: (CANV_SIZE - ctaWidth) / 2,
            y: ctaY,
            width: ctaWidth,
            height: ctaHeight,
            visible: true,
            locked: false,
            rotation: 0,
            opacity: 1,
            // Style
            bgColor: input.colors.primary,
            color: '#ffffff', // Always white text on primary button for now (safe assumption)
            fontSize: 28,
            fontFamily: input.font,
            fontWeight: 700,
            radius: 100, // Pill shape
            shadowColor: input.colors.primary, // Glow effect
            shadowBlur: 30,
            shadowOffsetY: 10,
            shadowOpacity: 0.5
        } as CtaLayer);


        return {
            id: input.id || `smart-ad-${timestamp}`,
            name: input.productName + ' Smart Ad',
            width: CANV_SIZE,
            height: CANV_SIZE,
            backgroundColor: input.colors.background,
            layers: layers,
            createdAt: new Date().toISOString()
        } as AdDocument;
    }
};

/**
 * Helper: Smart Font Sizing
 * Reduces font size if text is too long for the width.
 */
function calculateFontSize(text: string, containerWidth: number, max: number, min: number): number {
    const charCount = text.length;
    // Rough heuristic: Average char width is ~0.5 * fontSize
    // We want `charCount * (0.5 * fontSize) <= containerWidth * lines`
    // Assuming 2 lines max for headline usually

    if (charCount < 15) return max; // Short text -> user Big font
    if (charCount < 30) return max * 0.8;
    if (charCount < 50) return max * 0.6;

    return min; // Fallback for very long text
}
