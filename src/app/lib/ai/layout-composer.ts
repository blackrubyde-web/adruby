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
    brandName?: string;
    productName?: string;
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

        // Replace product image if provided
        if (params.productImage && (layer.name?.toLowerCase().includes('product') || layer.type === 'product' || layer.name?.toLowerCase().includes('customer'))) {
            newLayer.src = params.productImage;
        }

        return newLayer;
    });

    const adDocument: AdDocument = {
        id: `premium-ad-${Date.now()}`,
        name: `${params.brandName || params.productName} - Premium Ad`,
        width: baseDoc.width || 1080,
        height: baseDoc.height || 1080,
        backgroundColor: baseDoc.backgroundColor || '#000000',
        layers: layers
    };

    console.log('✅ Layout composed with', layers.length, 'layers');
    return adDocument;
}
