/**
 * AdRuby Image Service v6.0 - Composite Pipeline
 * 
 * PERFECTION-level ad generation using:
 * - Visual DNA Extraction (GPT-4V pixel-precise analysis)
 * - Pattern DNA from 30+ day winning Foreplay ads
 * - Composite Pipeline: Background + Sharp Overlay + SVG Text
 * - 100% Product Preservation
 */

import express from 'express';
import cors from 'cors';
import { generateAd } from './generators/adGenerator.js';
import { generateCompositeAd } from './generators/compositeGenerator.js';
import { createForeplayClient } from './ai/foreplayClient.js';
import { INDUSTRIES } from './config/industries.js';
import { healthCheck } from './utils/health.js';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Foreplay client
const foreplay = createForeplayClient(process.env.FOREPLAY_API_KEY);

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
    status.foreplay = !!foreplay;
    res.json(status);
});

// List available industries
app.get('/industries', (req, res) => {
    const industries = Object.entries(INDUSTRIES).map(([key, config]) => ({
        id: key,
        name: config.name,
        colors: config.colors,
        defaultStyle: config.defaultStyle
    }));
    res.json({ industries });
});

// Check Foreplay API credits
app.get('/foreplay/usage', async (req, res) => {
    if (!foreplay) {
        return res.status(503).json({ error: 'Foreplay not configured' });
    }
    try {
        const usage = await foreplay.checkUsage();
        res.json(usage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get reference ads for an industry
app.get('/references/:industry', async (req, res) => {
    if (!foreplay) {
        return res.status(503).json({ error: 'Foreplay not configured' });
    }
    try {
        const ads = await foreplay.getTopPerformingAds(req.params.industry, { limit: 10 });
        res.json({
            count: ads.length,
            ads: ads.map(ad => ({
                id: ad.id,
                thumbnail: ad.thumbnail,
                image: ad.image,
                niches: ad.niches,
                runningDays: ad.running_duration?.days
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Main ad generation endpoint
app.post('/generate', async (req, res) => {
    const startTime = Date.now();

    try {
        const {
            productImageUrl,
            productImageBase64,
            headline,
            tagline,
            cta,
            features,
            stats,
            comparisonData,
            userPrompt,
            industry,
            style,
            accentColor,
            enableQualityCheck = false
        } = req.body;

        console.log('[ImageService] 🚀 AI-directed generation starting...');
        console.log('[ImageService] Industry:', industry || 'auto-detect');

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
                pattern: result.pattern,
                industry: result.industry,
                referenceCount: result.referenceCount,
                confidence: result.confidence,
                dimensions: { width: 1080, height: 1080 },
                version: '3.0',
                mode: 'ai_directed'
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

// NEW: Composite Ad Generation (100% Product Preservation)
// Uses: Background-only Gemini + Sharp Compositing + SVG Text
app.post('/generate-composite', async (req, res) => {
    const startTime = Date.now();

    try {
        const {
            productImageUrl,
            productImageBase64,
            headline,
            tagline,
            cta,
            userPrompt,
            industry,
            accentColor
        } = req.body;

        console.log('[ImageService] 🎨 Composite Pipeline v6.0 starting...');
        console.log('[ImageService] Mode: 100% Product Preservation');

        // Convert URL to buffer if needed
        let productBuffer = null;
        if (productImageBase64) {
            productBuffer = Buffer.from(productImageBase64, 'base64');
        } else if (productImageUrl) {
            const response = await fetch(productImageUrl);
            productBuffer = Buffer.from(await response.arrayBuffer());
        }

        const result = await generateCompositeAd({
            productImageBuffer: productBuffer,
            headline,
            tagline,
            cta,
            accentColor: accentColor || '#FF4757',
            industry,
            userPrompt
        });

        const duration = Date.now() - startTime;
        console.log(`[ImageService] ✅ Composite complete in ${duration}ms`);

        res.json({
            success: true,
            imageBase64: result.buffer.toString('base64'),
            metadata: {
                duration: result.duration,
                isSaaSProduct: result.isSaaSProduct,
                referenceCount: result.referenceCount,
                dimensions: { width: 1080, height: 1080 },
                version: '6.0',
                mode: 'composite_pipeline'
            }
        });

    } catch (error) {
        console.error('[ImageService] ❌ Composite Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Search similar ads endpoint
app.post('/search-references', async (req, res) => {
    if (!foreplay) {
        return res.status(503).json({ error: 'Foreplay not configured' });
    }

    try {
        const { prompt, industry, limit = 5 } = req.body;
        const ads = await foreplay.findSimilarAds(prompt, industry, { limit });

        res.json({
            count: ads.length,
            ads: ads.map(ad => ({
                id: ad.id,
                thumbnail: ad.thumbnail,
                image: ad.image,
                niches: ad.niches,
                headline: ad.headline,
                description: ad.description
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   🎨 AdRuby Image Service v3.0 - AI Design Director             ║
║   Running on port ${PORT}                                          ║
║                                                                  ║
║   Features:                                                      ║
║   ✅ Foreplay Integration (100M+ reference ads)                 ║
║   ✅ GPT-4 Vision Design Analysis                               ║
║   ✅ AI-Directed Dynamic Layouts                                ║
║   ✅ No Fixed Templates - Unlimited Variations                  ║
║                                                                  ║
║   Industries: ${Object.keys(INDUSTRIES).length} configured                                      ║
║   Foreplay: ${foreplay ? '✅ Connected' : '❌ Not configured'}                                  ║
║                                                                  ║
║   Ready to generate designer-level ads!                          ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
    `);
});
