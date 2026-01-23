/**
 * AdRuby Image Service (v2.0)
 * 
 * Premium ad generation service with:
 * - 5 template types (feature_callout, hero_product, stats_grid, comparison_split, lifestyle_context)
 * - 8 industry presets
 * - Intelligent template selection
 * - Post-processing effects
 * - Quality validation
 */

import express from 'express';
import cors from 'cors';
import { generateAd } from './generators/adGenerator.js';
import { listTemplates, getTemplatesForIndustry } from './templates/index.js';
import { INDUSTRIES } from './config/industries.js';
import { healthCheck } from './utils/health.js';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: [
        'https://adruby.com',
        'https://www.adruby.com',
        'https://app.adruby.com',
        'http://localhost:5173',
        'http://localhost:3000',
        /\.netlify\.app$/
    ],
    methods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
    const status = healthCheck();
    res.json(status);
});

// List available templates
app.get('/templates', (req, res) => {
    res.json({
        templates: listTemplates(),
        industries: Object.keys(INDUSTRIES)
    });
});

// Get templates for industry
app.get('/templates/:industry', (req, res) => {
    const { industry } = req.params;
    const templates = getTemplatesForIndustry(industry);
    const config = INDUSTRIES[industry] || INDUSTRIES.tech;

    res.json({
        industry,
        recommendedTemplates: templates,
        colors: config.colors,
        defaultStyle: config.defaultStyle
    });
});

// Main ad generation endpoint
app.post('/generate', async (req, res) => {
    const startTime = Date.now();

    try {
        const {
            // Product
            productImageUrl,
            productImageBase64,

            // Copy
            headline,
            tagline,
            cta,
            features,      // Array of feature strings for feature_callout
            stats,         // Array of {value, label} for stats_grid
            comparisonData, // {leftTitle, rightTitle, leftPoints, rightPoints} for comparison

            // Configuration
            userPrompt,
            industry,
            template,      // Optional: auto-selected if not provided
            style,         // 'dark' | 'light' | 'colorful'
            accentColor,

            // Quality
            enableQualityCheck = false
        } = req.body;

        console.log('[ImageService] 🚀 Starting generation...');
        console.log('[ImageService] Industry:', industry || 'auto-detect');
        console.log('[ImageService] Template:', template || 'auto-select');

        const result = await generateAd({
            productImageUrl,
            productImageBase64,
            headline,
            tagline,
            cta,
            features: features || [],
            stats: stats || [],
            comparisonData,
            userPrompt,
            industry,
            template,
            style,
            accentColor,
            enableQualityCheck
        });

        const duration = Date.now() - startTime;
        console.log(`[ImageService] ✅ Complete in ${duration}ms`);

        res.json({
            success: true,
            imageBase64: result.buffer.toString('base64'),
            metadata: {
                duration,
                template: result.template,
                industry: result.industry,
                dimensions: { width: 1080, height: 1080 }
            }
        });

    } catch (error) {
        console.error('[ImageService] ❌ Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Specific template endpoint (for testing)
app.post('/generate/:template', async (req, res) => {
    const { template } = req.params;

    try {
        const result = await generateAd({
            ...req.body,
            template
        });

        res.json({
            success: true,
            imageBase64: result.buffer.toString('base64'),
            metadata: {
                template: result.template,
                industry: result.industry
            }
        });

    } catch (error) {
        console.error(`[ImageService] ❌ ${template} error:`, error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🎨 AdRuby Image Service v2.0                               ║
║   Running on port ${PORT}                                       ║
║                                                               ║
║   Templates: ${listTemplates().length} available                                    ║
║   Industries: ${Object.keys(INDUSTRIES).length} configured                                   ║
║                                                               ║
║   Ready to generate premium ads!                              ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    `);
});
