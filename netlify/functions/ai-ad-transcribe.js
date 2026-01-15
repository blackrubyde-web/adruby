/**
 * AI Ad Builder - Audio Transcription Function
 * Netlify Serverless Function für Whisper Speech-to-Text
 */

import { getOpenAiClient } from './_shared/openai.js';
import { getUserProfile } from './_shared/auth.js';

export const handler = async (event) => {
    // CORS Headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json',
    };

    // Handle OPTIONS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        // Auth-Check
        const authHeader = event.headers.authorization || event.headers.Authorization;
        const user = await getUserProfile(authHeader);

        if (!user) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Unauthorized' }),
            };
        }

        // Parse multipart/form-data (audio file)
        const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';

        if (!contentType.includes('multipart/form-data')) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Content-Type must be multipart/form-data' }),
            };
        }

        // Extract audio file from base64 body
        // Note: Netlify Functions receive binary data as base64
        const body = event.isBase64Encoded
            ? Buffer.from(event.body, 'base64')
            : Buffer.from(event.body);

        // Parse multipart boundary
        const boundary = contentType.split('boundary=')[1];
        if (!boundary) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing multipart boundary' }),
            };
        }

        // Simple multipart parsing (for audio file)
        const parts = body.toString('binary').split(`--${boundary}`);
        let audioData = null;
        let filename = 'audio.webm';

        for (const part of parts) {
            if (part.includes('Content-Disposition')) {
                const match = part.match(/filename="([^"]+)"/);
                if (match) {
                    filename = match[1];
                }

                // Extract binary data after headers
                const dataStart = part.indexOf('\r\n\r\n') + 4;
                const dataEnd = part.lastIndexOf('\r\n');
                if (dataStart > 3 && dataEnd > dataStart) {
                    audioData = Buffer.from(part.substring(dataStart, dataEnd), 'binary');
                }
            }
        }

        if (!audioData) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'No audio file found in request' }),
            };
        }

        console.log('[AI Ad Transcribe] Transcribing audio for user:', user.id, 'filename:', filename);

        // Whisper Transkription
        const openai = getOpenAiClient();

        // Create a File object for OpenAI API
        const file = new File([audioData], filename, {
            type: 'audio/webm',
        });

        const transcription = await openai.audio.transcriptions.create({
            file,
            model: 'whisper-1',
            language: 'de', // Auto-detect würde auch gehen (undefined)
            response_format: 'text',
        });

        console.log('[AI Ad Transcribe] Transcription completed:', transcription.substring(0, 100));

        // Response
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: {
                    text: transcription,
                },
            }),
        };

    } catch (error) {
        console.error('[AI Ad Transcribe] Error:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Transcription failed',
                message: error.message,
            }),
        };
    }
};
