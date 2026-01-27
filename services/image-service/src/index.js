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

// ═══════════════════════════════════════════════════════════════════
// ASYNC JOB STORE - For long-running composite generation
// ═══════════════════════════════════════════════════════════════════
const jobStore = new Map(); // { jobId: { status, result, error, createdAt, completedAt } }

// Auto-cleanup old jobs (1 hour TTL)
setInterval(() => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [jobId, job] of jobStore.entries()) {
        if (job.createdAt < oneHourAgo) {
            jobStore.delete(jobId);
            console.log(`[JobStore] Cleaned up old job: ${jobId}`);
        }
    }
}, 60 * 1000); // Check every minute

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

// MASTER COMPOSITE GENERATOR v10.0
// 10-Phase Designer-Level Pipeline with Quality Verification
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
            accentColor,
            enableQualityCheck = true,
            enableAIContent = true,
            enableAdvancedEffects = true,
            strictReplica = true
        } = req.body;

        console.log('[ImageService] 🎨 MASTER PIPELINE v10.0 starting...');
        console.log('[ImageService] Mode: 10-Phase Designer-Level + Quality Verification');

        let productBuffer = null;
        if (productImageBase64) {
            productBuffer = Buffer.from(productImageBase64, 'base64');
            console.log('[ImageService] Using base64 product image:', productBuffer.length, 'bytes');
        } else if (productImageUrl) {
            console.log('[ImageService] Fetching product image from:', productImageUrl);
            try {
                const response = await fetch(productImageUrl, {
                    signal: AbortSignal.timeout(30000), // 30 second timeout
                    headers: {
                        'User-Agent': 'AdRuby-ImageService/1.0'
                    }
                });
                if (!response.ok) {
                    throw new Error(`Image fetch failed: ${response.status} ${response.statusText}`);
                }
                productBuffer = Buffer.from(await response.arrayBuffer());
                console.log('[ImageService] Product image fetched:', productBuffer.length, 'bytes');
            } catch (fetchError) {
                console.error('[ImageService] Failed to fetch product image:', fetchError.message);
                throw new Error(`Could not fetch product image: ${fetchError.message}`);
            }
        }

        if (!productBuffer) {
            throw new Error('No product image provided (base64 or URL required)');
        }

        const result = await generateCompositeAd({
            productImageBuffer: productBuffer,
            headline,
            tagline,
            cta,
            accentColor: accentColor || '#FF4757',
            industry,
            userPrompt,
            enableQualityCheck,
            enableAIContent,
            enableAdvancedEffects,
            strictReplica
        });

        const duration = Date.now() - startTime;
        console.log(`[ImageService] ✅ MASTER v10.0 complete in ${duration}ms`);
        console.log(`[ImageService] Quality: ${result.qualityScore}/10 (${result.qualityTier}) | Attempts: ${result.regenerationAttempts + 1}`);

        res.json({
            success: true,
            imageBase64: result.buffer.toString('base64'),
            metadata: {
                duration: result.duration,
                qualityScore: result.qualityScore,
                qualityTier: result.qualityTier,
                qualityDetails: result.qualityDetails,
                regenerationAttempts: result.regenerationAttempts,
                referenceCount: result.referenceCount,
                similarityScore: result.similarityScore,
                similarityDetails: result.similarityDetails,
                compositionPlan: result.compositionPlan,
                dimensions: { width: 1080, height: 1080 },
                version: '10.0',
                mode: 'master_designer'
            }
        });

    } catch (error) {
        console.error('[ImageService] ❌ Master Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ═══════════════════════════════════════════════════════════════════
// ASYNC COMPOSITE GENERATION - Returns immediately, processes in background
// ═══════════════════════════════════════════════════════════════════
app.post('/generate-composite-async', async (req, res) => {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const {
        productImageUrl,
        productImageBase64,
        headline,
        tagline,
        cta,
        userPrompt,
        industry,
        accentColor,
        enableQualityCheck = true,
        enableAIContent = true,
        enableAdvancedEffects = true,
        strictReplica = true
    } = req.body;

    // Initialize job in store
    jobStore.set(jobId, {
        status: 'processing',
        progress: 0,
        result: null,
        error: null,
        createdAt: Date.now(),
        completedAt: null
    });

    console.log(`[ImageService] 🚀 ASYNC Job ${jobId} started`);

    // Return immediately with jobId
    res.json({
        success: true,
        jobId,
        status: 'processing',
        message: 'Generation started. Poll /job/:id/status for progress.'
    });

    // Process in background (don't await!)
    (async () => {
        const startTime = Date.now();
        try {
            // Fetch product image
            let productBuffer = null;
            if (productImageBase64) {
                productBuffer = Buffer.from(productImageBase64, 'base64');
            } else if (productImageUrl) {
                const response = await fetch(productImageUrl, {
                    signal: AbortSignal.timeout(30000),
                    headers: { 'User-Agent': 'AdRuby-ImageService/1.0' }
                });
                if (!response.ok) throw new Error(`Image fetch failed: ${response.status}`);
                productBuffer = Buffer.from(await response.arrayBuffer());
            }

            if (!productBuffer) {
                throw new Error('No product image provided');
            }

            // Update progress
            jobStore.get(jobId).progress = 10;

            // Generate
            const result = await generateCompositeAd({
                productImageBuffer: productBuffer,
                headline,
                tagline,
                cta,
                accentColor: accentColor || '#FF4757',
                industry,
                userPrompt,
                enableQualityCheck,
                enableAIContent,
                enableAdvancedEffects,
                strictReplica
            });

            const duration = Date.now() - startTime;
            console.log(`[ImageService] ✅ ASYNC Job ${jobId} complete in ${duration}ms`);

            // Store result
            jobStore.set(jobId, {
                status: 'complete',
                progress: 100,
                result: {
                    imageBase64: result.buffer.toString('base64'),
                    metadata: {
                        duration,
                        qualityScore: result.qualityScore,
                        qualityTier: result.qualityTier,
                        qualityDetails: result.qualityDetails,
                        regenerationAttempts: result.regenerationAttempts,
                        referenceCount: result.referenceCount,
                        compositionPlan: result.compositionPlan,
                        dimensions: { width: 1080, height: 1080 },
                        version: '10.0',
                        mode: 'master_designer_async'
                    }
                },
                error: null,
                createdAt: jobStore.get(jobId).createdAt,
                completedAt: Date.now()
            });

        } catch (error) {
            console.error(`[ImageService] ❌ ASYNC Job ${jobId} failed:`, error.message);
            jobStore.set(jobId, {
                status: 'failed',
                progress: 0,
                result: null,
                error: error.message,
                createdAt: jobStore.get(jobId).createdAt,
                completedAt: Date.now()
            });
        }
    })();
});

// Job status endpoint
app.get('/job/:id/status', (req, res) => {
    const job = jobStore.get(req.params.id);
    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }
    res.json({
        jobId: req.params.id,
        status: job.status,
        progress: job.progress,
        error: job.error,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        hasResult: !!job.result
    });
});

// Job result endpoint
app.get('/job/:id/result', (req, res) => {
    const job = jobStore.get(req.params.id);
    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }
    if (job.status === 'processing') {
        return res.status(202).json({
            status: 'processing',
            progress: job.progress,
            message: 'Job still in progress'
        });
    }
    if (job.status === 'failed') {
        return res.status(500).json({
            status: 'failed',
            error: job.error
        });
    }
    res.json({
        success: true,
        status: 'complete',
        ...job.result
    });
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
