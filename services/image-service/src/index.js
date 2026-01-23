/**
 * AdRuby Image Service
 * 
 * Dedicated service for premium ad generation.
 * Runs on Railway with proper font support and no timeout limits.
 */

import express from 'express';
import cors from 'cors';
import { generateAd } from './generators/adGenerator.js';
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
        'http://localhost:3000'
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
            userPrompt,
            industry,
            template,
            accentColor
        } = req.body;

        console.log('[ImageService] 🚀 Starting ad generation...');
        console.log('[ImageService] Template:', template || 'hero_product');
        console.log('[ImageService] Industry:', industry || 'default');

        const result = await generateAd({
            productImageUrl,
            productImageBase64,
            headline,
            tagline,
            cta,
            userPrompt,
            industry,
            template,
            accentColor
        });

        const duration = Date.now() - startTime;
        console.log(`[ImageService] ✅ Complete in ${duration}ms`);

        res.json({
            success: true,
            imageBase64: result.buffer.toString('base64'),
            metadata: {
                duration,
                template: result.template,
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

app.listen(PORT, () => {
    console.log(`[ImageService] 🎨 Running on port ${PORT}`);
    console.log('[ImageService] Ready to generate premium ads!');
});
