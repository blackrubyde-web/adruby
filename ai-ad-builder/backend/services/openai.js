/**
 * OpenAI Service - Zentrale Integration für GPT-4, DALL-E, Whisper und Sora
 */

import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';

// OpenAI Client initialisieren
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * GPT-4 für Ad-Copywriting
 * @param {Object} params - Parameter für die Textgenerierung
 * @returns {Object} Generierte Texte (headline, slogan, description, imagePrompt, videoPrompt)
 */
export async function generateAdCopy(params) {
    const {
        prompt,
        template,
        language = 'de',
        tone = 'professional',
        targetAudience = 'general'
    } = params;

    const systemPrompt = `Du bist ein erfahrener Werbetexter und Marketing-Experte. 
Deine Aufgabe ist es, überzeugende Werbetexte zu erstellen, die konvertieren.
Nutze bewährte Copywriting-Frameworks wie AIDA (Attention, Interest, Desire, Action) 
oder PAS (Problem, Agitation, Solution).

Antworte ausschließlich in folgendem JSON-Format:
{
  "headline": "Aufmerksamkeitsstarke Überschrift (max 60 Zeichen)",
  "slogan": "Einprägsamer Slogan (max 40 Zeichen)",
  "description": "Überzeugende Beschreibung (max 200 Zeichen)",
  "imagePrompt": "Detaillierte Beschreibung für DALL-E Bildgenerierung",
  "videoPrompt": "Szenen-Beschreibung für Video-Generierung"
}

Sprache: ${language === 'de' ? 'Deutsch' : 'English'}
Tonalität: ${tone}
Zielgruppe: ${targetAudience}`;

    const userPrompt = template
        ? `Template: ${template.name[language]}
Stil: ${template.style.tone}
Fokus: ${template.style.focus}
CTA: ${template.style.cta}

Anforderung: ${prompt}`
        : prompt;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.8,
            max_tokens: 1000
        });

        const content = JSON.parse(response.choices[0].message.content);

        return {
            headline: content.headline || '',
            slogan: content.slogan || '',
            description: content.description || '',
            imagePrompt: content.imagePrompt || prompt,
            videoPrompt: content.videoPrompt || prompt
        };
    } catch (error) {
        console.error('GPT-4 Error:', error);
        throw new Error(`Textgenerierung fehlgeschlagen: ${error.message}`);
    }
}

/**
 * DALL-E 3 für Bildgenerierung
 * @param {string} prompt - Bildbeschreibung
 * @param {Object} options - Optionen (size, quality, style)
 * @returns {Object} Bild-URL und Metadaten
 */
export async function generateImage(prompt, options = {}) {
    const {
        size = '1024x1024',
        quality = 'hd',
        style = 'vivid'
    } = options;

    try {
        const response = await openai.images.generate({
            model: 'dall-e-3',
            prompt: `Professional advertising image: ${prompt}. High quality, modern, clean, appealing composition. No text in image.`,
            n: 1,
            size,
            quality,
            style
        });

        return {
            url: response.data[0].url,
            revised_prompt: response.data[0].revised_prompt
        };
    } catch (error) {
        console.error('DALL-E Error:', error);
        throw new Error(`Bildgenerierung fehlgeschlagen: ${error.message}`);
    }
}

/**
 * Sora für Video-Generierung (mit Polling)
 * HINWEIS: Sora API ist aktuell noch limitiert verfügbar.
 * Diese Funktion zeigt die geplante Integration.
 * 
 * @param {string} prompt - Video-Beschreibung
 * @param {Object} options - Optionen (duration, resolution)
 * @returns {Object} Video-URL wenn fertig
 */
export async function generateVideo(prompt, options = {}) {
    const {
        duration = 15, // Sekunden
        resolution = '1080p'
    } = options;

    try {
        // FALLS Sora verfügbar ist:
        // const video = await openai.videos.create({
        //   model: 'sora-turbo',
        //   prompt: `Professional advertising video (${duration}s): ${prompt}. Dynamic, engaging, high production value.`,
        //   duration,
        //   resolution
        // });

        // Video-Job-ID für Polling
        // const videoId = video.id;

        // Polling bis Video fertig
        // let status = 'processing';
        // let attempts = 0;
        // const maxAttempts = 60; // 5 Minuten bei 5s Intervallen

        // while (status === 'processing' && attempts < maxAttempts) {
        //   await new Promise(resolve => setTimeout(resolve, 5000)); // 5s warten
        //   const statusCheck = await openai.videos.retrieve(videoId);
        //   status = statusCheck.status;
        //   attempts++;
        // }

        // if (status === 'completed') {
        //   return {
        //     url: statusCheck.url,
        //     duration: statusCheck.duration
        //   };
        // }

        // FALLBACK: Mockup-Video oder Pika Labs Integration
        console.log('Sora noch nicht verfügbar. Verwende Fallback...');

        // Für Demo: Erstelle Placeholder oder nutze Pika Labs API
        return {
            url: null,
            message: 'Video-Generierung wird implementiert sobald Sora API verfügbar ist',
            alternativeService: 'Pika Labs (pika.art) kann als Alternative genutzt werden'
        };

    } catch (error) {
        console.error('Video Generation Error:', error);
        throw new Error(`Video-Generierung fehlgeschlagen: ${error.message}`);
    }
}

/**
 * Whisper für Speech-to-Text
 * @param {Buffer|File} audioFile - Audio-Datei
 * @param {string} language - Sprache (optional, auto-detect)
 * @returns {string} Transkribierter Text
 */
export async function transcribeAudio(audioFile, language = null) {
    try {
        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-1',
            language: language || undefined, // null = auto-detect
            response_format: 'text'
        });

        return transcription;
    } catch (error) {
        console.error('Whisper Error:', error);
        throw new Error(`Transkription fehlgeschlagen: ${error.message}`);
    }
}

/**
 * Bild von URL herunterladen und lokal speichern
 * @param {string} imageUrl - URL des generierten Bildes
 * @param {string} filename - Dateiname
 * @returns {string} Lokaler Pfad
 */
export async function downloadImage(imageUrl, filename) {
    try {
        const response = await fetch(imageUrl);
        const buffer = await response.arrayBuffer();

        const outputPath = path.join(process.cwd(), 'public', 'generated', filename);
        await fs.writeFile(outputPath, Buffer.from(buffer));

        return `/generated/${filename}`;
    } catch (error) {
        console.error('Download Error:', error);
        throw new Error(`Bild-Download fehlgeschlagen: ${error.message}`);
    }
}

export default {
    generateAdCopy,
    generateImage,
    generateVideo,
    transcribeAudio,
    downloadImage
};
