/**
 * TEMPLATE LIBRARY
 * Professional ad layout patterns optimized for conversion
 * 
 * Features:
 * - 7 industry-tested patterns
 * - Grid-based positioning
 * - Conversion-optimized hierarchy
 * - Dynamic element sizing
 */

import type { StudioLayer, TextLayer, ImageLayer, CtaLayer, ShapeLayer } from '../../../types/studio';
import type { GridConfig } from './grid-system';
import { calculateGridPosition, LayoutPresets } from './grid-system';

export type TemplatePattern =
    | 'minimal'          // Clean, product-focused (Apple style)
    | 'bold'             // High-contrast, attention-grabbing
    | 'testimonial'      // Social proof focused
    | 'ecommerce'        // Product + benefits grid
    | 'luxury'           // Elegant, spacious
    | 'comparison'       // Before/after or vs competitor
    | 'urgency';         // Scarcity/FOMO focused

export interface TemplateDefinition {
    id: string;
    name: string;
    pattern: TemplatePattern;
    description: string;
    bestFor: string[];
    layers: (config: GridConfig) => StudioLayer[];
    requiredElements: ('headline' | 'product' | 'description' | 'cta' | 'socialProof' | 'badge')[];
}

/**
 * MINIMAL TEMPLATE
 * Clean, product-focused layout (Apple/Nike style)
 */
const MinimalTemplate: TemplateDefinition = {
    id: 'minimal-v1',
    name: 'Minimal Focus',
    pattern: 'minimal',
    description: 'Clean layout with maximum breathing room. Product takes center stage.',
    bestFor: ['Premium products', 'Tech', 'Fashion', 'Luxury goods'],
    requiredElements: ['headline', 'product', 'cta'],
    layers: (config: GridConfig) => {
        const layers: StudioLayer[] = [];
        const timestamp = Date.now();

        // Background - clean solid color
        layers.push({
            id: `bg-${timestamp}`,
            type: 'background',
            name: 'Background',
            ...calculateGridPosition(config, 1, 12, 1, 1),
            width: config.width,
            height: config.height,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: true,
            src: '',
            zIndex: 0
        } as ImageLayer);

        // Headline - top center, full width
        const headlinePos = LayoutPresets.headline(config);
        layers.push({
            id: `headline-${timestamp}`,
            type: 'text',
            name: 'Headline',
            role: 'headline',
            ...headlinePos,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            text: 'Your Headline Here',
            fontSize: 72,
            fontFamily: 'Inter',
            fontWeight: 800,
            align: 'center',
            color: '#000000',
            lineHeight: 1.1,
            zIndex: 3
        } as TextLayer);

        // Product - hero size, centered
        const productPos = LayoutPresets.productHero(config);
        layers.push({
            id: `product-${timestamp}`,
            type: 'product',
            name: 'Product',
            role: 'product',
            ...productPos,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            src: '',
            fit: 'contain',
            shadowColor: 'rgba(0,0,0,0.15)',
            shadowBlur: 40,
            shadowOffsetY: 20,
            shadowOpacity: 0.2,
            zIndex: 2
        } as ImageLayer);

        // CTA - bottom center
        const ctaPos = LayoutPresets.ctaBottom(config);
        layers.push({
            id: `cta-${timestamp}`,
            type: 'cta',
            name: 'CTA',
            role: 'cta',
            ...ctaPos,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            text: 'SHOP NOW',
            fontSize: 28,
            fontFamily: 'Inter',
            fontWeight: 700,
            color: '#FFFFFF',
            bgColor: '#000000',
            radius: 100,
            shadowColor: 'rgba(0,0,0,0.3)',
            shadowBlur: 20,
            shadowOffsetY: 10,
            shadowOpacity: 0.5,
            zIndex: 4
        } as CtaLayer);

        return layers;
    }
};

/**
 * BOLD TEMPLATE
 * High-contrast, attention-grabbing layout
 */
const BoldTemplate: TemplateDefinition = {
    id: 'bold-v1',
    name: 'Bold Impact',
    pattern: 'bold',
    description: 'High-contrast design with diagonal energy and bold typography.',
    bestFor: ['Sales', 'Promotions', 'Events', 'Bold brands'],
    requiredElements: ['headline', 'product', 'description', 'cta'],
    layers: (config: GridConfig) => {
        const layers: StudioLayer[] = [];
        const timestamp = Date.now();

        // Dark background
        layers.push({
            id: `bg-${timestamp}`,
            type: 'background',
            name: 'Background',
            x: 0,
            y: 0,
            width: config.width,
            height: config.height,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: true,
            src: '',
            zIndex: 0
        } as ImageLayer);

        // Accent shape (diagonal)
        const shapePos = calculateGridPosition(config, 1, 6, 1, 8);
        layers.push({
            id: `accent-${timestamp}`,
            type: 'shape',
            name: 'Accent',
            ...shapePos,
            rotation: 15,
            opacity: 0.1,
            visible: true,
            locked: true,
            fill: '#FFFFFF',
            strokeWidth: 0,
            cornerRadius: 0,
            zIndex: 1
        } as ShapeLayer);

        // Headline - large, left-aligned
        const headlinePos = calculateGridPosition(config, 1, 10, 1, 2);
        layers.push({
            id: `headline-${timestamp}`,
            type: 'text',
            name: 'Headline',
            role: 'headline',
            ...headlinePos,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            text: 'BOLD HEADLINE',
            fontSize: 84,
            fontFamily: 'Montserrat',
            fontWeight: 900,
            align: 'left',
            color: '#FFFFFF',
            lineHeight: 1.0,
            shadowColor: 'rgba(0,0,0,0.8)',
            shadowBlur: 20,
            zIndex: 3
        } as TextLayer);

        // Description
        const descPos = calculateGridPosition(config, 1, 8, 3, 1);
        layers.push({
            id: `desc-${timestamp}`,
            type: 'text',
            name: 'Description',
            role: 'description',
            ...descPos,
            rotation: 0,
            opacity: 0.9,
            visible: true,
            locked: false,
            text: 'Your description here',
            fontSize: 32,
            fontFamily: 'Montserrat',
            fontWeight: 500,
            align: 'left',
            color: '#FFFFFF',
            lineHeight: 1.4,
            zIndex: 3
        } as TextLayer);

        // Product - right side
        const productPos = calculateGridPosition(config, 6, 6, 4, 4);
        layers.push({
            id: `product-${timestamp}`,
            type: 'product',
            name: 'Product',
            role: 'product',
            ...productPos,
            rotation: -5,
            opacity: 1,
            visible: true,
            locked: false,
            src: '',
            fit: 'contain',
            shadowColor: 'rgba(0,0,0,0.5)',
            shadowBlur: 50,
            shadowOffsetY: 25,
            shadowOpacity: 0.4,
            zIndex: 2
        } as ImageLayer);

        // CTA - prominent, left-aligned
        const ctaPos = calculateGridPosition(config, 1, 5, 8, 1);
        layers.push({
            id: `cta-${timestamp}`,
            type: 'cta',
            name: 'CTA',
            role: 'cta',
            ...ctaPos,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            text: 'GET YOURS NOW',
            fontSize: 30,
            fontFamily: 'Montserrat',
            fontWeight: 700,
            color: '#000000',
            bgColor: '#FFFFFF',
            radius: 12,
            shadowColor: 'rgba(255,255,255,0.4)',
            shadowBlur: 30,
            shadowOffsetY: 0,
            shadowOpacity: 0.8,
            zIndex: 4
        } as CtaLayer);

        return layers;
    }
};

/**
 * E-COMMERCE TEMPLATE
 * Product showcase with benefits grid
 */
const EcommerceTemplate: TemplateDefinition = {
    id: 'ecommerce-v1',
    name: 'E-commerce Grid',
    pattern: 'ecommerce',
    description: 'Clean product showcase with feature bullets and social proof.',
    bestFor: ['E-commerce', 'Product launches', 'Multi-feature products'],
    requiredElements: ['headline', 'product', 'description', 'cta', 'socialProof'],
    layers: (config: GridConfig) => {
        const layers: StudioLayer[] = [];
        const timestamp = Date.now();

        // Background
        layers.push({
            id: `bg-${timestamp}`,
            type: 'background',
            name: 'Background',
            x: 0,
            y: 0,
            width: config.width,
            height: config.height,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: true,
            src: '',
            zIndex: 0
        } as ImageLayer);

        // Headline
        const headlinePos = calculateGridPosition(config, 1, 12, 1, 1);
        layers.push({
            id: `headline-${timestamp}`,
            type: 'text',
            name: 'Headline',
            role: 'headline',
            ...headlinePos,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            text: 'Product Name',
            fontSize: 64,
            fontFamily: 'Inter',
            fontWeight: 700,
            align: 'center',
            color: '#000000',
            lineHeight: 1.2,
            zIndex: 3
        } as TextLayer);

        // Product - centered, large
        const productPos = calculateGridPosition(config, 3, 8, 2, 4);
        layers.push({
            id: `product-${timestamp}`,
            type: 'product',
            name: 'Product',
            role: 'product',
            ...productPos,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            src: '',
            fit: 'contain',
            shadowColor: 'rgba(0,0,0,0.2)',
            shadowBlur: 35,
            shadowOffsetY: 18,
            shadowOpacity: 0.25,
            zIndex: 2
        } as ImageLayer);

        // Benefits/Description
        const descPos = calculateGridPosition(config, 2, 10, 6, 2);
        layers.push({
            id: `benefits-${timestamp}`,
            type: 'text',
            name: 'Benefits',
            role: 'description',
            ...descPos,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            text: '✓ Feature 1\n✓ Feature 2\n✓ Feature 3',
            fontSize: 28,
            fontFamily: 'Inter',
            fontWeight: 500,
            align: 'left',
            color: '#333333',
            lineHeight: 1.6,
            zIndex: 3
        } as TextLayer);

        // Social Proof
        const proofPos = calculateGridPosition(config, 3, 8, 8, 1);
        layers.push({
            id: `proof-${timestamp}`,
            type: 'text',
            name: 'Social Proof',
            role: 'socialProof',
            ...proofPos,
            rotation: 0,
            opacity: 0.8,
            visible: true,
            locked: false,
            text: '⭐⭐⭐⭐⭐ 10,000+ Reviews',
            fontSize: 24,
            fontFamily: 'Inter',
            fontWeight: 600,
            align: 'center',
            color: '#666666',
            lineHeight: 1.4,
            zIndex: 3
        } as TextLayer);

        // CTA
        const ctaPos = calculateGridPosition(config, 4, 6, 9, 1);
        layers.push({
            id: `cta-${timestamp}`,
            type: 'cta',
            name: 'CTA',
            role: 'cta',
            ...ctaPos,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            text: 'ADD TO CART',
            fontSize: 28,
            fontFamily: 'Inter',
            fontWeight: 700,
            color: '#FFFFFF',
            bgColor: '#000000',
            radius: 8,
            shadowColor: 'rgba(0,0,0,0.3)',
            shadowBlur: 20,
            shadowOffsetY: 10,
            shadowOpacity: 0.5,
            zIndex: 4
        } as CtaLayer);

        return layers;
    }
};

/**
 * LUXURY TEMPLATE
 * Elegant, spacious design with premium feel
 */
const LuxuryTemplate: TemplateDefinition = {
    id: 'luxury-v1',
    name: 'Luxury Elegance',
    pattern: 'luxury',
    description: 'Sophisticated layout with maximum whitespace and refined typography.',
    bestFor: ['Luxury brands', 'High-end products', 'Premium services'],
    requiredElements: ['headline', 'product', 'cta'],
    layers: (config: GridConfig) => {
        const layers: StudioLayer[] = [];
        const timestamp = Date.now();

        // Light background
        layers.push({
            id: `bg-${timestamp}`,
            type: 'background',
            name: 'Background',
            x: 0,
            y: 0,
            width: config.width,
            height: config.height,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: true,
            src: '',
            zIndex: 0
        } as ImageLayer);

        // Elegant headline - serif font
        const headlinePos = calculateGridPosition(config, 2, 10, 1, 2);
        layers.push({
            id: `headline-${timestamp}`,
            type: 'text',
            name: 'Headline',
            role: 'headline',
            ...headlinePos,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            text: 'Timeless Elegance',
            fontSize: 68,
            fontFamily: 'Playfair Display',
            fontWeight: 700,
            align: 'center',
            color: '#2C2C2C',
            lineHeight: 1.2,
            letterSpacing: -1,
            zIndex: 3
        } as TextLayer);

        // Product - centered, refined
        const productPos = calculateGridPosition(config, 3, 8, 3, 4);
        layers.push({
            id: `product-${timestamp}`,
            type: 'product',
            name: 'Product',
            role: 'product',
            ...productPos,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            src: '',
            fit: 'contain',
            shadowColor: 'rgba(0,0,0,0.08)',
            shadowBlur: 25,
            shadowOffsetY: 12,
            shadowOpacity: 0.15,
            zIndex: 2
        } as ImageLayer);

        // Subtle description
        const descPos = calculateGridPosition(config, 3, 8, 7, 1);
        layers.push({
            id: `desc-${timestamp}`,
            type: 'text',
            name: 'Description',
            role: 'description',
            ...descPos,
            rotation: 0,
            opacity: 0.7,
            visible: true,
            locked: false,
            text: 'Crafted with precision',
            fontSize: 26,
            fontFamily: 'Inter',
            fontWeight: 300,
            align: 'center',
            color: '#666666',
            lineHeight: 1.5,
            letterSpacing: 1,
            zIndex: 3
        } as TextLayer);

        // Refined CTA
        const ctaPos = calculateGridPosition(config, 4, 6, 8, 1);
        layers.push({
            id: `cta-${timestamp}`,
            type: 'cta',
            name: 'CTA',
            role: 'cta',
            ...ctaPos,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            text: 'Discover More',
            fontSize: 24,
            fontFamily: 'Inter',
            fontWeight: 400,
            color: '#2C2C2C',
            bgColor: 'transparent',
            borderColor: '#2C2C2C',
            borderWidth: 2,
            radius: 4,
            zIndex: 4
        } as CtaLayer);

        return layers;
    }
};

/**
 * URGENCY TEMPLATE
 * Scarcity/FOMO focused design
 */
const UrgencyTemplate: TemplateDefinition = {
    id: 'urgency-v1',
    name: 'Urgency Driver',
    pattern: 'urgency',
    description: 'High-energy layout with countdown and scarcity signals.',
    bestFor: ['Flash sales', 'Limited offers', 'Event registrations'],
    requiredElements: ['headline', 'product', 'cta', 'badge'],
    layers: (config: GridConfig) => {
        const layers: StudioLayer[] = [];
        const timestamp = Date.now();

        // Bold background
        layers.push({
            id: `bg-${timestamp}`,
            type: 'background',
            name: 'Background',
            x: 0,
            y: 0,
            width: config.width,
            height: config.height,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: true,
            src: '',
            zIndex: 0
        } as ImageLayer);

        // Urgency badge (top-right)
        const badgePos = calculateGridPosition(config, 9, 3, 1, 1);
        layers.push({
            id: `badge-${timestamp}`,
            type: 'cta',
            name: 'Urgency Badge',
            role: 'badge',
            ...badgePos,
            width: badgePos.width * 0.8,
            height: 80,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            text: '24H ONLY',
            fontSize: 22,
            fontFamily: 'Inter',
            fontWeight: 800,
            color: '#FFFFFF',
            bgColor: '#EF4444',
            radius: 8,
            zIndex: 5
        } as CtaLayer);

        // Bold headline
        const headlinePos = calculateGridPosition(config, 1, 12, 2, 2);
        layers.push({
            id: `headline-${timestamp}`,
            type: 'text',
            name: 'Headline',
            role: 'headline',
            ...headlinePos,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            text: 'LIMITED TIME OFFER!',
            fontSize: 76,
            fontFamily: 'Inter',
            fontWeight: 900,
            align: 'center',
            color: '#EF4444',
            lineHeight: 1.1,
            zIndex: 3
        } as TextLayer);

        // Product
        const productPos = calculateGridPosition(config, 3, 8, 4, 3);
        layers.push({
            id: `product-${timestamp}`,
            type: 'product',
            name: 'Product',
            role: 'product',
            ...productPos,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            src: '',
            fit: 'contain',
            shadowColor: 'rgba(239,68,68,0.4)',
            shadowBlur: 40,
            shadowOffsetY: 20,
            shadowOpacity: 0.6,
            zIndex: 2
        } as ImageLayer);

        // Urgency text
        const urgencyPos = calculateGridPosition(config, 2, 10, 7, 1);
        layers.push({
            id: `urgency-${timestamp}`,
            type: 'text',
            name: 'Urgency Text',
            role: 'description',
            ...urgencyPos,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            text: 'Only 5 left in stock!',
            fontSize: 32,
            fontFamily: 'Inter',
            fontWeight: 700,
            align: 'center',
            color: '#DC2626',
            lineHeight: 1.3,
            zIndex: 3
        } as TextLayer);

        // Prominent CTA
        const ctaPos = calculateGridPosition(config, 3, 8, 8, 1);
        layers.push({
            id: `cta-${timestamp}`,
            type: 'cta',
            name: 'CTA',
            role: 'cta',
            ...ctaPos,
            height: 120,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            text: 'CLAIM NOW →',
            fontSize: 32,
            fontFamily: 'Inter',
            fontWeight: 800,
            color: '#FFFFFF',
            bgColor: '#EF4444',
            radius: 12,
            shadowColor: 'rgba(239,68,68,0.5)',
            shadowBlur: 30,
            shadowOffsetY: 12,
            shadowOpacity: 0.8,
            zIndex: 4
        } as CtaLayer);

        return layers;
    }
};

/**
 * Template Library - All available templates
 */
export const TemplateLibrary: TemplateDefinition[] = [
    MinimalTemplate,
    BoldTemplate,
    EcommerceTemplate,
    LuxuryTemplate,
    UrgencyTemplate
];

/**
 * Get template by ID
 */
export function getTemplate(id: string): TemplateDefinition | null {
    return TemplateLibrary.find(t => t.id === id) || null;
}

/**
 * Get template by pattern
 */
export function getTemplateByPattern(pattern: TemplatePattern): TemplateDefinition {
    return TemplateLibrary.find(t => t.pattern === pattern) || MinimalTemplate;
}

/**
 * AI Template Selection based on product context
 */
export function selectTemplate(context: {
    productType?: string;
    tone?: string;
    goal?: 'awareness' | 'consideration' | 'conversion';
    hasOffer?: boolean;
}): TemplateDefinition {
    // Urgency for flash sales
    if (context.hasOffer || context.goal === 'conversion') {
        return UrgencyTemplate;
    }

    // Luxury for premium products
    if (context.tone === 'luxury' || context.productType?.includes('luxury')) {
        return LuxuryTemplate;
    }

    // Bold for attention
    if (context.tone === 'bold' || context.goal === 'awareness') {
        return BoldTemplate;
    }

    // E-commerce for features
    if (context.productType?.includes('ecommerce') || context.goal === 'consideration') {
        return EcommerceTemplate;
    }

    // Default to minimal
    return MinimalTemplate;
}
