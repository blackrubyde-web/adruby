
import type { AdDocument, StudioLayer } from '../../types/studio';
import { REMIX_THEMES } from './RemixPanel';

/**
 * GENERATE VARIANTS
 * Takes a base document and creates 4 performance variations.
 */
export const generateVariants = (baseDoc: AdDocument): AdDocument[] => {
    const variants: AdDocument[] = [];

    // 1. LAYOUT FLIP (Left <-> Right)
    // Useful for testing if product on left vs right performs better
    const flipVariant = JSON.parse(JSON.stringify(baseDoc)) as AdDocument;
    flipVariant.id = `${baseDoc.id}_flip`;
    flipVariant.name = "Variant A: Layout Flip";

    flipVariant.layers = flipVariant.layers.map(layer => {
        // Simple mirror logic around center
        const centerX = baseDoc.width / 2;
        const dist = layer.x + (layer.width / 2) - centerX;
        const newX = centerX - dist - (layer.width / 2);

        return { ...layer, x: newX };
    });
    variants.push(flipVariant);


    // 2. HIGH CONTRAST (Theme Swap)
    // If dark, make light. If light, make dark.
    const contrastVariant = JSON.parse(JSON.stringify(baseDoc)) as AdDocument;
    contrastVariant.id = `${baseDoc.id}_contrast`;
    contrastVariant.name = "Variant B: High Contrast";

    const isDark = baseDoc.backgroundColor === '#000000' || baseDoc.backgroundColor === '#111111';
    const targetTheme = isDark ? REMIX_THEMES.find(t => t.id === 'pastel') : REMIX_THEMES.find(t => t.id === 'midnight');

    if (targetTheme) {
        contrastVariant.backgroundColor = targetTheme.bg || '#FFFFFF';
        contrastVariant.layers = contrastVariant.layers.map(layer => {
            if (layer.type === 'text') {
                return { ...layer, color: targetTheme.colors[0], fontFamily: targetTheme.font };
            }
            if (layer.type === 'cta') {
                return { ...layer, bgColor: targetTheme.colors[1], color: '#FFFFFF', fontFamily: targetTheme.font };
            }
            return layer;
        });
    }
    variants.push(contrastVariant);


    // 3. MAXIMALIST (Bold)
    // Bigger fonts, bigger CTA
    const boldVariant = JSON.parse(JSON.stringify(baseDoc)) as AdDocument;
    boldVariant.id = `${baseDoc.id}_bold`;
    boldVariant.name = "Variant C: Maximalist";

    boldVariant.layers = boldVariant.layers.map(layer => {
        if (layer.type === 'text' && (layer as any).fontSize) {
            // Increase font size by 20%
            return { ...layer, fontSize: (layer as any).fontSize * 1.2, fontWeight: 900 };
        }
        if (layer.type === 'cta') {
            // Make button huge
            return { ...layer, width: layer.width * 1.2, height: layer.height * 1.1 };
        }
        return layer;
    });
    variants.push(boldVariant);

    // 4. MINIMALIST (Clean)
    // Remove "Social Proof", "Badges", maximize whitespace
    // (Mock logic: reduce secondary text opacity or size)
    const cleanVariant = JSON.parse(JSON.stringify(baseDoc)) as AdDocument;
    cleanVariant.id = `${baseDoc.id}_clean`;
    cleanVariant.name = "Variant D: Minimalist";

    cleanVariant.layers = cleanVariant.layers.map(layer => {
        // If it's a small text, maybe hide it? Or just make everything smaller/cleaner
        if (layer.type === 'text') {
            return { ...layer, fontWeight: 400, letterSpacing: 2 };
        }
        if (layer.type === 'cta') {
            // Ghost button style
            return { ...layer, bgColor: 'transparent', borderWidth: 2, borderColor: '#FFFFFF', color: '#FFFFFF' };
        }
        return layer;
    });
    variants.push(cleanVariant);

    return variants;
};
