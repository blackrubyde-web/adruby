/**
 * Template Registry
 * 
 * Central registry for all ad templates.
 * Each template is a complete generation strategy.
 */

import { featureCalloutTemplate } from './featureCallout.js';
import { heroProductTemplate } from './heroProduct.js';
import { statsGridTemplate } from './statsGrid.js';
import { comparisonSplitTemplate } from './comparisonSplit.js';
import { lifestyleContextTemplate } from './lifestyleContext.js';

/**
 * All available templates
 */
export const TEMPLATES = {
    feature_callout: {
        name: 'Feature Callout',
        description: 'Product with dotted lines pointing to feature labels',
        bestFor: ['physical products', 'tech', 'eco', 'multi-feature items'],
        generator: featureCalloutTemplate
    },
    hero_product: {
        name: 'Hero Product',
        description: 'Clean, bold product shot with prominent headline',
        bestFor: ['any product', 'brand awareness', 'simple message'],
        generator: heroProductTemplate
    },
    stats_grid: {
        name: 'Stats Grid',
        description: 'Product surrounded by impressive statistics',
        bestFor: ['food', 'supplements', 'SaaS', 'social proof'],
        generator: statsGridTemplate
    },
    comparison_split: {
        name: 'Comparison Split',
        description: 'Before/After or Us vs. Them side-by-side',
        bestFor: ['disruption', 'transformation', 'competitive advantage'],
        generator: comparisonSplitTemplate
    },
    lifestyle_context: {
        name: 'Lifestyle Context',
        description: 'Product in real-world use with subtle overlays',
        bestFor: ['fashion', 'outdoor', 'experiences', 'aspirational'],
        generator: lifestyleContextTemplate
    }
};

/**
 * Get template by name
 */
export function getTemplate(templateName) {
    const template = TEMPLATES[templateName];
    if (!template) {
        console.warn(`[Templates] Unknown template: ${templateName}, falling back to hero_product`);
        return TEMPLATES.hero_product;
    }
    return template;
}

/**
 * List all template names
 */
export function listTemplates() {
    return Object.keys(TEMPLATES);
}

/**
 * Get template recommendations for an industry
 */
export function getTemplatesForIndustry(industry) {
    const industryTemplates = {
        tech: ['feature_callout', 'hero_product', 'stats_grid'],
        food: ['stats_grid', 'hero_product', 'lifestyle_context'],
        fashion: ['lifestyle_context', 'comparison_split', 'hero_product'],
        beauty: ['hero_product', 'stats_grid', 'lifestyle_context'],
        eco: ['feature_callout', 'comparison_split', 'lifestyle_context'],
        fitness: ['stats_grid', 'comparison_split', 'hero_product'],
        saas: ['feature_callout', 'stats_grid', 'hero_product'],
        home: ['lifestyle_context', 'hero_product', 'feature_callout']
    };

    return industryTemplates[industry] || ['hero_product', 'feature_callout', 'stats_grid'];
}

export default {
    TEMPLATES,
    getTemplate,
    listTemplates,
    getTemplatesForIndustry
};
