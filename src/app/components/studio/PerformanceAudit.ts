import type { AdDocument, CtaLayer, TextLayer } from '../../types/studio';

export interface AuditResult {
    score: number;
    positives: string[];
    improvements: string[];
    criticalIssues: string[];
}

export const performAudit = (doc: AdDocument): AuditResult => {
    const result: AuditResult = {
        score: 100,
        positives: [],
        improvements: [],
        criticalIssues: []
    };

    const layers = doc.layers;
    const cta = layers.find((layer): layer is CtaLayer => layer.type === 'cta');
    const headline = layers.find((layer): layer is TextLayer => layer.type === 'text' && layer.fontSize > 50);
    const product = layers.find(layer => layer.type === 'product');

    // --- 1. CTA Check ---
    if (!cta) {
        result.score -= 30;
        result.criticalIssues.push("Missing CTA: An ad without a clear Call-To-Action lacks conversion potential.");
    } else {
        result.positives.push("Clear CTA present: Helps guide the user's next step.");
        if (cta.width < 200) {
            result.score -= 5;
            result.improvements.push("Small CTA: Increase button size for better thumb-reach on mobile.");
        }
    }

    // --- 2. Headline Check ---
    if (!headline) {
        result.score -= 15;
        result.improvements.push("No clear Headline: A strong value proposition is missing.");
    } else {
        const text = headline.text || "";
        if (text.length > 40) {
            result.score -= 10;
            result.improvements.push("Long Headline: Short, punchy copy performs 40% better on Meta.");
        } else {
            result.positives.push("Concise Headline: Perfect for rapid consumption.");
        }
    }

    // --- 3. Product Placement ---
    if (product) {
        if (product.width < doc.width * 0.4) {
            result.score -= 10;
            result.improvements.push("Small Product Image: Make the product 30% larger to increase 'hero' impact.");
        } else {
            result.positives.push("Prominent Product: Excellent visual hierarchy.");
        }
    } else {
        result.score -= 5;
        result.improvements.push("Missing Product Focal-point: If this is e-commerce, add a clear product cutout.");
    }

    // --- 4. Safe Area Violations ---
    const violations = doc.safeArea ? layers.some(l => (
        l.x < doc.safeArea!.left ||
        l.y < doc.safeArea!.top ||
        (l.x + l.width) > (doc.width - doc.safeArea!.right) ||
        (l.y + l.height) > (doc.height - doc.safeArea!.bottom)
    )) : false;

    if (violations) {
        result.score -= 15;
        result.criticalIssues.push("Safe Area Violation: Elements might be cut off by Social Media UI overlays.");
    } else {
        result.positives.push("Perfect Alignment: All elements are within safe zones.");
    }

    // Final clamps
    result.score = Math.max(0, Math.min(100, result.score));

    return result;
};
