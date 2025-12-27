import type { PremiumCopy } from './copy-generator';
import type { AdDocument, StudioLayer } from '../../types/studio';

/**
 * STAGE 4: LAYOUT COMPOSER
 * Creates strategic layer placement using golden ratio & visual hierarchy
 */

export function composeLayout(params: {
    template: any;
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
}): AdDocument {
    console.log('🎨 Stage 4: Layout Composition...');

    // Clone template document
    const baseDoc = JSON.parse(JSON.stringify(params.template.document));

    // Apply premium copy to layers
    const layers: StudioLayer[] = baseDoc.layers.map((layer: any) => {
        const newLayer = { ...layer };

        // Replace text based on layer name/type
        if (layer.type === 'text') {
            if (layer.name?.toLowerCase().includes('headline') || layer.name?.toLowerCase().includes('hook')) {
                newLayer.text = params.copy.headline;
            } else if (layer.name?.toLowerCase().includes('description') || layer.name?.toLowerCase().includes('subheadline')) {
                newLayer.text = params.copy.subheadline || params.copy.description;
            } else if (layer.name?.toLowerCase().includes('proof') || layer.name?.toLowerCase().includes('review')) {
                newLayer.text = params.copy.socialProof || newLayer.text;
            } else if (layer.name?.toLowerCase().includes('urgency') || layer.name?.toLowerCase().includes('stock')) {
                newLayer.text = params.copy.urgencyText || newLayer.text;
            }
        }

        // Replace CTA
        if (layer.type === 'cta') {
            newLayer.text = params.copy.cta;
        }

        // COMPOSITE STRATEGY:
        // 1. Background Layer -> Gets generated Background Scene
        if (params.backgroundImage && (layer.type === 'background' || layer.name?.toLowerCase().includes('bg'))) {
            newLayer.src = params.backgroundImage;
            newLayer.opacity = 1; // Ensure full visibility
        }

        // 2. Product Layer -> Gets ORIGINAL Product Image
        if (params.productImage && (layer.name?.toLowerCase().includes('product') || layer.type === 'product' || layer.name?.toLowerCase().includes('customer'))) {
            newLayer.src = params.productImage;
            // Best effort fit
            newLayer.fit = 'contain';
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

            // Update Colors
            if (newLayer.type === 'text') {
                // Headlines get primary or text color
                if (layer.name?.toLowerCase().includes('headline')) {
                    newLayer.color = textColor;
                } else {
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
                    // Contrast check simplistic: if accent is dark, text white, else black
                    // optimized for common safe hexes, else default to white/black based on brightness logic could be added here
                    // keeping it simple: most generic accents are bright/bold, so white text usually works or black.
                    // Let's stick to what the template had OR force white/black if we knew brightness.
                    // For now, let's trust the AI picked a good combo or keep template default text color if it was white/black.
                    newLayer.color = '#FFFFFF'; // defaulting to white text on buttons for safety
                    if (['#ffffff', '#fff', '#fefefe'].includes(accentColor.toLowerCase())) newLayer.color = '#000000';
                } else {
                    // Badges etc
                    newLayer.bgColor = primaryColor;
                    newLayer.color = '#FFFFFF';
                }
            }
        }

        return newLayer;
    });

    const adDocument: AdDocument = {
        id: `premium-ad-${Date.now()}`,
        name: `${params.brandName || params.productName} - Premium Ad`,
        width: baseDoc.width || 1080,
        height: baseDoc.height || 1080,
        backgroundColor: params.visualIdentity?.backgroundColor || baseDoc.backgroundColor || '#000000',
        layers: layers
    };

    console.log('✅ Layout composed with', layers.length, 'layers');
    return adDocument;
}
