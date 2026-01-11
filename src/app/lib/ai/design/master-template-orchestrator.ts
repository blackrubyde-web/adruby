/**
 * MASTER TEMPLATE ORCHESTRATOR
 * Brings everything together for ultimate ad generation
 * 
 * Pipeline:
 * 1. Product DNA Analysis
 * 2. Style DNA Extraction
 * 3. Product Image Analysis (adaptive layout)
 * 4. Template Intelligence (find best templates)
 * 5. Variation Generation (create unique versions)
 * 6. Quality Ranking
 * 7. Return top N variations
 */

import { analyzeProductDNA, type ProductDNA } from '../intelligence/product-dna-analyzer';
import { extractStyleDNA, type StyleDNA } from '../intelligence/style-dna-extractor';
import { generateAdaptiveTemplate, type ProductImageAnalysis, type AdaptiveTemplate } from './adaptive-layout-engine';
import { getOptimalTemplates, type TemplateIntelligence } from './template-intelligence';
import { generateVariations, type TemplateVariation } from './template-variation-generator';

export interface MasterTemplateRequest {
    productName: string;
    productDescription?: string;
    productImageBase64?: string;
    brandName?: string;
    priceValue?: number;
    category?: string;
    tone?: string;
    apiKey: string;  // Required for OpenAI service

    // Generation params
    variationCount?: number;        // How many variations to generate (default: 50)
    minQuality?: number;            // Minimum quality score (default: 70)
}

export interface MasterTemplateResult {
    // Intelligence
    productDNA: ProductDNA;
    styleDNA: StyleDNA;
    imageAnalysis?: ProductImageAnalysis;

    // Templates
    baseTemplates: TemplateIntelligence[];
    variations: TemplateVariation[];
    adaptiveLayout?: AdaptiveTemplate;

    // Best picks
    topVariations: TemplateVariation[];

    // Metadata
    telemetry: {
        analysisTime: number;
        templateSearchTime: number;
        variationTime: number;
        totalTime: number;
        templatesAnalyzed: number;
        variationsGenerated: number;
    };
}

type ExportLayerBase = {
    id: string;
    type: 'background' | 'image' | 'text' | 'shape';
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    opacity: number;
};

type ExportBackgroundLayer = ExportLayerBase & {
    type: 'background';
    fill: string;
};

type ExportImageLayer = ExportLayerBase & {
    type: 'image';
    src?: string;
};

type ExportTextLayer = ExportLayerBase & {
    type: 'text';
    fontSize: number;
    fontFamily: string;
    fill: string;
    align: 'left' | 'center' | 'right';
};

type ExportShapeLayer = ExportLayerBase & {
    type: 'shape';
    fill: string;
    cornerRadius: number;
};

type ExportLayer = ExportBackgroundLayer | ExportImageLayer | ExportTextLayer | ExportShapeLayer;

type ExportAdDocument = {
    id: string;
    name: string;
    width: number;
    height: number;
    backgroundColor: string;
    layers: ExportLayer[];
};

/**
 * Master orchestration function
 * This is the MAIN entry point for template generation
 */
export async function orchestrateTemplateGeneration(
    request: MasterTemplateRequest
): Promise<MasterTemplateResult> {
    const startTime = Date.now();

    // STAGE 1: Product DNA Analysis
    const dnaStart = Date.now();

    const productDNA = await analyzeProductDNA({
        productName: request.productName,
        productDescription: request.productDescription,
        imageBase64: request.productImageBase64,
        brandName: request.brandName,
        priceValue: request.priceValue,
        category: request.category,
        apiKey: request.apiKey
    });

    const dnaTime = Date.now() - dnaStart;

    // STAGE 2: Style DNA Extraction
    const styleStart = Date.now();

    const styleDNA = extractStyleDNA(productDNA);

    const styleTime = Date.now() - styleStart;

    // STAGE 3: Product Image Analysis (if image provided)
    let imageAnalysis: ProductImageAnalysis | undefined;
    let adaptiveLayout: AdaptiveTemplate | undefined;

    if (request.productImageBase64) {
        adaptiveLayout = await generateAdaptiveTemplate(
            request.productImageBase64,
            styleDNA,
            request.apiKey
        );

        imageAnalysis = {
            boundingBox: adaptiveLayout.layout.productZone,
            visualWeight: { left: 50, right: 50, top: 50, bottom: 50, center: 50 },
            freeSpaces: [],
            composition: {
                balance: adaptiveLayout.balance.score,
                dominantSide: 'center',
                dominantVertical: 'middle',
                openAreas: []
            },
            colors: {
                dominant: '#000000',
                accent: '#FFFFFF',
                background: '#F5F5F5',
                textSafe: ['#FFFFFF', '#000000']
            }
        };

    }

    // STAGE 4: Template Intelligence (find best matches)
    const templateStart = Date.now();

    const baseTemplates = await getOptimalTemplates(
        productDNA,
        styleDNA,
        10  // Get top 10 base templates
    );

    const templateTime = Date.now() - templateStart;

    // STAGE 5: Variation Generation
    const variationStart = Date.now();

    const variationCount = request.variationCount || 50;
    const variationsPerTemplate = Math.ceil(variationCount / baseTemplates.length);

    let allVariations: TemplateVariation[] = [];

    for (const baseTemplate of baseTemplates) {
        const variations = generateVariations(
            baseTemplate,
            styleDNA,
            imageAnalysis || {} as ProductImageAnalysis,
            variationsPerTemplate
        );

        allVariations = allVariations.concat(variations);
    }

    const variationTime = Date.now() - variationStart;

    // STAGE 6: Quality Filtering & Ranking

    const minQuality = request.minQuality || 70;
    const qualityFiltered = allVariations.filter(v => v.scores.overall >= minQuality);

    // Sort by overall score
    const ranked = qualityFiltered.sort((a, b) => b.scores.overall - a.scores.overall);

    // Take top variations (max 50)
    const topVariations = ranked.slice(0, Math.min(50, variationCount));

    // Final telemetry
    const totalTime = Date.now() - startTime;

    return {
        productDNA,
        styleDNA,
        imageAnalysis,
        baseTemplates,
        variations: allVariations,
        adaptiveLayout,
        topVariations,
        telemetry: {
            analysisTime: dnaTime + styleTime,
            templateSearchTime: templateTime,
            variationTime,
            totalTime,
            templatesAnalyzed: baseTemplates.length,
            variationsGenerated: allVariations.length
            }
        };
    }

/**
 * Simplified API for quick template generation
 */
export async function generateTemplatesQuick(
    productName: string,
    apiKey: string,
    productImageBase64?: string,
    count: number = 20
): Promise<TemplateVariation[]> {
    const result = await orchestrateTemplateGeneration({
        productName,
        productImageBase64,
        variationCount: count,
        apiKey
    });

    return result.topVariations;
}

/**
 * Export best variation as ready-to-use ad document
 */
export function exportAsAdDocument(
    variation: TemplateVariation,
    productDNA: ProductDNA,
    _styleDNA: StyleDNA,
    adaptiveLayout?: AdaptiveTemplate
): ExportAdDocument {
    // Build ad document structure compatible with existing system
    const doc: ExportAdDocument = {
        id: variation.id,
        name: `${productDNA.semantic.productCategory} Ad - ${variation.id}`,
        width: 1080,
        height: 1080,
        backgroundColor: variation.colors.palette[0] || '#FFFFFF',

        // Layers built from variation + adaptive layout
        layers: buildLayers(variation, adaptiveLayout)
    };

    return doc;
}

/**
 * Build ad layers from variation and adaptive layout
 */
function buildLayers(
    variation: TemplateVariation,
    adaptiveLayout?: AdaptiveTemplate
): ExportLayer[] {
    const layers: ExportLayer[] = [];

    // Background layer
    if (variation.colors.backgroundGradient) {
        layers.push({
            id: 'bg-gradient',
            type: 'background',
            name: 'Background Gradient',
            x: 0,
            y: 0,
            width: 1080,
            height: 1080,
            fill: `linear-gradient(${variation.colors.backgroundGradient.angle}deg, ${variation.colors.backgroundGradient.colors.join(', ')})`,
            opacity: 1
        });
    } else {
        layers.push({
            id: 'bg',
            type: 'background',
            name: 'Background',
            x: 0,
            y: 0,
            width: 1080,
            height: 1080,
            fill: variation.colors.palette[0],
            opacity: 1
        });
    }

    // Product layer (if adaptive layout available)
    if (adaptiveLayout) {
        layers.push({
            id: 'product',
            type: 'image',
            name: 'Product',
            x: adaptiveLayout.layout.productZone.x,
            y: adaptiveLayout.layout.productZone.y,
            width: adaptiveLayout.layout.productZone.width,
            height: adaptiveLayout.layout.productZone.height,
            opacity: 1,
            src: ''
        });

        // Text zones from adaptive layout
        for (const textZone of adaptiveLayout.layout.textZones) {
            layers.push({
                id: `text-${textZone.type}`,
                type: 'text',
                name: textZone.type,
                x: textZone.x,
                y: textZone.y,
                width: textZone.width,
                height: textZone.height,
                fontSize: textZone.maxFontSize * variation.typography.sizeScale,
                fontFamily: textZone.type === 'headline' ? variation.typography.headlineFont : variation.typography.bodyFont,
                fill: variation.colors.dominantColor,
                align: textZone.alignment,
                opacity: 1
            });
        }

        // CTA layer
        layers.push({
            id: 'cta',
            type: 'shape',
            name: 'CTA Background',
            x: adaptiveLayout.layout.ctaZone.x,
            y: adaptiveLayout.layout.ctaZone.y,
            width: adaptiveLayout.layout.ctaZone.width,
            height: adaptiveLayout.layout.ctaZone.height,
            fill: variation.colors.accentColor,
            cornerRadius: variation.elements.shapeStyle === 'circle' ? 30 : variation.elements.shapeStyle === 'rounded' ? 12 : 0,
            opacity: 1
        });
    }

    return layers;
}
