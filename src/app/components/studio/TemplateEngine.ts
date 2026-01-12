import type { AdDocument, StudioLayer, TextLayer, CtaLayer, ImageLayer } from '../../types/studio';
import type { GeneratedAdContent } from './TextToAdGenerator';

// Helper to clone objects deeply to avoid mutating the original template
const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export interface TemplateEngineOptions {
    niche?: string;
    targetImage?: string; // Optional specific product image to use
}

/**
 * Intelligent Engine to inject content into a specific template.
 * It maps content fields to layer 'roles' defined in the template.
 */
export function injectContentIntoTemplate(
    templateDoc: Partial<AdDocument>,
    content: GeneratedAdContent,
    options: TemplateEngineOptions = {}
): Partial<AdDocument> {
    const doc = clone(templateDoc);
    if (!doc.layers) return doc;

    // Iterate through layers and inject content based on 'role' or fuzzy matching name
    doc.layers = doc.layers.map(layer => {
        return processLayer(layer, content, options);
    });

    return doc;
}

function processLayer(layer: StudioLayer, content: GeneratedAdContent, options: TemplateEngineOptions): StudioLayer {
    // 1. CONTENT MAPPING
    // We look for explicit 'role' first, then fall back to 'name' heuristic

    const role = (layer.role || layer.name || '').toLowerCase();

    // --- TEXT LAYERS ---
    if (layer.type === 'text') {
        const textLayer = layer as TextLayer;

        if (role.includes('headline') || role === 'title') {
            textLayer.text = content.headline.toUpperCase();
            // Basic Auto-Scale Logic: slightly reduce font if text is very long
            if (contextualLength(content.headline) > 20) {
                textLayer.fontSize = Math.floor(textLayer.fontSize * 0.85);
            }
        }
        else if (role.includes('sub') || role.includes('desc') || role === 'body') {
            textLayer.text = content.subheadline;
        }
        else if (role.includes('social_proof') || role.includes('review')) {
            // Keep template's social proof structure but maybe randomized number?
            // For now, keep template text or generic "⭐⭐⭐⭐⭐" if specific content missing
        }
    }

    // --- CTA LAYERS ---
    if (layer.type === 'cta') {
        const ctaLayer = layer as CtaLayer;

        if (role.includes('cta') || role.includes('button')) {
            ctaLayer.text = content.ctaText.toUpperCase();
            // Inject accent color from content if available, else keep template default
            if (content.suggestedColors?.accent) {
                // ctaLayer.bgColor = content.suggestedColors.accent; 
                // Commented out: keeping template colors is usually safer for design integrity 
            }
        }
    }

    // --- IMAGE LAYERS ---
    if (layer.type === 'background' || layer.type === 'product' || layer.type === 'image') {
        const imgLayer = layer as ImageLayer;

        // Use the provided target image for both 'product' and 'bg_image' roles
        // This ensures templates like 'UGC Testimonial' get the fresh image.
        if ((role.includes('product') || role === 'bg_image') && options.targetImage) {
            imgLayer.src = options.targetImage;
        }
        // Fallback: if name contains 'product' or 'background' and we have an image
        else if ((role.includes('product') || role.includes('background')) && options.targetImage) {
            imgLayer.src = options.targetImage;
        }
    }

    // --- RECURSIVE GROUP HANDLING ---
    if (layer.type === 'group' && 'children' in layer) {
        // Handle groups recursively
        const group = layer as any;
        if (group.children) {
            group.children = group.children.map((child: StudioLayer) =>
                processLayer(child, content, options)
            );
        }
    }

    return layer;
}

/**
 * Simple heuristic for text length weight (all caps take more space)
 */
function contextualLength(text: string): number {
    return text ? text.length : 0;
}
