import type { PremiumCopy } from './copy-generator';
import type { AdDocument, StudioLayer } from '../../types/studio';

type MutableLayer = StudioLayer & {
    text?: string;
    src?: string;
    fit?: string;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    shadowOpacity?: number;
    fontFamily?: string;
    fill?: string;
    color?: string;
    bgColor?: string;
    fontSize?: number;
    children?: MutableLayer[];
};

/**
 * STAGE 4: LAYOUT COMPOSER
 * Creates strategic layer placement using golden ratio & visual hierarchy
 */

/**
 * Generate professional shadow for product layers
 * Creates realistic depth and prevents "GIMP sticker" effect
 */
function generateProductShadow(
    layerWidth: number,
    layerHeight: number,
    intensity: 'subtle' | 'normal' | 'dramatic' = 'normal'
): {
    shadowColor: string;
    shadowBlur: number;
    shadowOffsetX: number;
    shadowOffsetY: number;
    shadowOpacity: number;
} {
    const intensityMap = {
        subtle: { blur: 20, offsetY: 10, opacity: 0.15 },
        normal: { blur: 35, offsetY: 18, opacity: 0.25 },
        dramatic: { blur: 55, offsetY: 28, opacity: 0.35 }
    };

    const config = intensityMap[intensity];

    // Scale shadow based on product size (larger products = larger shadows)
    const sizeMultiplier = Math.max(layerWidth, layerHeight) / 500;

    return {
        shadowColor: 'rgba(0, 0, 0, 1)', // Full black, opacity controlled separately
        shadowBlur: Math.round(config.blur * sizeMultiplier),
        shadowOffsetX: 0, // Centered shadow
        shadowOffsetY: Math.round(config.offsetY * sizeMultiplier),
        shadowOpacity: config.opacity
    };
}

export function composeLayout(params: {
    template: { document: AdDocument };
    copy: PremiumCopy;
    productImage?: string;
    backgroundImage?: string;
    brandName?: string;
    productName?: string;
    visualIdentity?: {
        primaryColor: string;
        accentColor: string;
        backgroundColor: string;
        textColor: string;
        fontStyle: string;
    };
    groundedFacts?: {
        offer?: string;
        proof?: string;
    };
}): AdDocument {
    // console.log('🎨 Stage 4: Layout Composition...');

    // Clone template document
    const baseDoc = JSON.parse(JSON.stringify(params.template.document));

    // Recursive layer processing to handle groups
    const processLayer = (layer: StudioLayer): StudioLayer => {
        const newLayer = { ...layer } as MutableLayer;

        // Content Mapping (Role-based Priority with Fallback)
        if (newLayer.role) {
            switch (newLayer.role) {
                case 'headline': newLayer.text = params.copy.headline; break;
                case 'subheadline': newLayer.text = params.copy.subheadline || params.copy.description; break;
                case 'description': newLayer.text = params.copy.description; break;
                case 'cta': newLayer.text = params.copy.cta; break;
                case 'social_proof': newLayer.text = params.copy.socialProof || '⭐⭐⭐⭐⭐'; break;
                case 'price': if (params.groundedFacts?.offer) newLayer.text = params.groundedFacts.offer; break;
            }
        }

        // Fallback: Name-based heuristic (if no role or role didn't cover it)
        if (!newLayer.role) {
            if (layer.type === 'text') {
                const name = layer.name?.toLowerCase() || '';
                if (name.includes('headline') || name.includes('hook')) {
                    newLayer.text = params.copy.headline;
                } else if (name.includes('description') || name.includes('subheadline')) {
                    newLayer.text = params.copy.subheadline || params.copy.description;
                } else if (name.includes('proof') || name.includes('review')) {
                    newLayer.text = params.copy.socialProof || newLayer.text;
                } else if (name.includes('urgency') || name.includes('stock')) {
                    newLayer.text = params.copy.urgencyText || newLayer.text;
                }
            }

            if (layer.type === 'cta') {
                const name = layer.name?.toLowerCase() || '';
                // Match: "cta", "button", "call to action", or arrows
                if (name.includes('cta') || name.includes('button') || name.includes('action') || layer.text?.includes('→')) {
                    newLayer.text = params.copy.cta;
                }
            }
        }

        // COMPOSITE STRATEGY:
        // 1. Background Layer -> Gets generated Background Scene
        if (params.backgroundImage && (layer.type === 'background' || layer.name?.toLowerCase().includes('bg'))) {
            newLayer.src = params.backgroundImage;
            newLayer.opacity = 1; // Ensure full visibility
        }

        // 2. Product Layer → Gets ORIGINAL Product Image + PROFESSIONAL SHADOW
        if (params.productImage && (layer.name?.toLowerCase().includes('product') || layer.type === 'product' || layer.name?.toLowerCase().includes('customer'))) {
            newLayer.src = params.productImage;
            // Best effort fit
            newLayer.fit = 'contain';

            // NEW: Automatic professional shadow for realistic integration
            const shadow = generateProductShadow(newLayer.width, newLayer.height, 'normal');
            newLayer.shadowColor = shadow.shadowColor;
            newLayer.shadowBlur = shadow.shadowBlur;
            newLayer.shadowOffsetX = shadow.shadowOffsetX;
            newLayer.shadowOffsetY = shadow.shadowOffsetY;
            newLayer.shadowOpacity = shadow.shadowOpacity;

            // console.log(`✨ Applied product shadow: blur=${shadow.shadowBlur}px, offset=${shadow.shadowOffsetY}px`);
        }

        // Apply Dynamic Styling
        if (params.visualIdentity) {
            const { primaryColor, accentColor, textColor, fontStyle } = params.visualIdentity;

            // Update fonts based on style
            if (newLayer.type === 'text' || newLayer.type === 'cta') {
                if (fontStyle === 'bold') newLayer.fontFamily = 'Oswald';
                else if (fontStyle === 'elegant') newLayer.fontFamily = 'Playfair Display';
                else if (fontStyle === 'handwritten') newLayer.fontFamily = 'Caveat';
                else newLayer.fontFamily = 'Inter';
            }

            // Update Colors - FIX: Use 'fill' for consistency with renderer
            if (newLayer.type === 'text') {
                // Headlines get primary or text color
                if (layer.name?.toLowerCase().includes('headline')) {
                    newLayer.fill = textColor;
                    newLayer.color = textColor; // Set both for compatibility
                } else {
                    newLayer.fill = textColor;
                    newLayer.color = textColor;
                    // Adjust opacity for subtitles
                    if (layer.name?.toLowerCase().includes('description')) {
                        newLayer.opacity = 0.9;
                    }
                }
            }

            if (newLayer.type === 'cta') {
                // CTAs get accent or primary color
                if (layer.name?.toLowerCase().includes('cta') || layer.text?.includes('→')) {
                    newLayer.bgColor = accentColor;
                    newLayer.color = '#FFFFFF'; // defaulting to white text on buttons for safety
                    if (['#ffffff', '#fff', '#fefefe'].includes(accentColor.toLowerCase())) newLayer.color = '#000000';
                } else {
                    // Badges etc
                    newLayer.bgColor = primaryColor;
                    newLayer.color = '#FFFFFF';
                }
            }
        }

        // SMART TEXT SCALING (Auto-Fit)
        if (newLayer.type === 'text' && newLayer.text && newLayer.width && newLayer.height) {
            // Heuristic: Estimated chars per line capacity
            const chars = newLayer.text.length;

            // Allow slightly bigger headlines, tighter bodies
            let currentFontSize = newLayer.fontSize || 60;
            const minSize = 24; // Never go below this

            // Simple heuristic loop (Node.js/Backend side)
            // Ideally this happens on client, but we do a "safe" guess here
            // Assume Average char width ~ 0.5 * fontSize
            // Total Area Needed ~ chars * (fontSize * 0.5) * (fontSize * 1.2 line height)

            // Optimize: decrease font size until area fits
            const availableArea = newLayer.width * newLayer.height * 0.9; // 90% fill factor

            let estimatedArea = chars * (currentFontSize * 0.6) * (currentFontSize * 1.2);

            while (estimatedArea > availableArea && currentFontSize > minSize) {
                currentFontSize -= 2;
                estimatedArea = chars * (currentFontSize * 0.6) * (currentFontSize * 1.2);
            }

            // Apply new safe font size
            newLayer.fontSize = Math.floor(currentFontSize);
        }

        // RECURSIVE: Process group children
        if (newLayer.type === 'group' && Array.isArray(newLayer.children)) {
            newLayer.children = (newLayer.children as StudioLayer[]).map(processLayer) as MutableLayer[];
        }

        return newLayer as unknown as StudioLayer;
    };

    // Apply recursive processing to all layers
    const layers: StudioLayer[] = baseDoc.layers.map(processLayer);

    const adDocument: AdDocument = {
        id: `premium-ad-${Date.now()}`,
        name: `${params.brandName || params.productName} - Premium Ad`,
        width: baseDoc.width || 1080,
        height: baseDoc.height || 1080,
        backgroundColor: params.visualIdentity?.backgroundColor || baseDoc.backgroundColor || '#000000',
        layers: layers
    };

    // console.log('✅ Layout composed with', layers.length, 'layers');
    return adDocument;
}
