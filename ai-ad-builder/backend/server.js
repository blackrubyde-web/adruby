/**
 * AI Ad Builder - Backend Server
 * Express Server mit OpenAI Integration für automatische Ad-Generierung
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import generateRouter from './routes/generate.js';
import transcribeRouter from './routes/transcribe.js';

// ES Module Kompatibilität für __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Umgebungsvariablen laden
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Statische Dateien (für generierte Bilder/Videos)
app.use('/generated', express.static(path.join(__dirname, 'public/generated')));

// Routes
app.use('/api/generate', generateRouter);
app.use('/api/transcribe', transcribeRouter);

// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        openai: !!process.env.OPENAI_API_KEY
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Interner Serverfehler',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Server starten
app.listen(PORT, () => {
    console.log(`🚀 Backend Server läuft auf Port ${PORT}`);
    console.log(`📊 Health Check: http://localhost:${PORT}/health`);
    console.log(`🎨 Generated Files: http://localhost:${PORT}/generated/`);

    if (!process.env.OPENAI_API_KEY) {
        console.warn('⚠️  WARNUNG: OPENAI_API_KEY nicht gesetzt!');
    }
});

export default app;
