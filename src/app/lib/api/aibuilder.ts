/**
 * AI Ad Builder - API Client
 * Client-seitige API für Netlify Functions
 */

import { supabase } from '../lib/supabaseClient';
import type { AdGenerationParams, AdGenerationResponse, TranscriptionResponse } from '../types/aibuilder';

const API_BASE = '/.netlify/functions';

/**
 * Get current auth token from Supabase session
 */
async function getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
}

/**
 * Generiert eine Ad basierend auf Benutzereingaben
 */
export async function generateAd(params: AdGenerationParams): Promise<AdGenerationResponse> {
    const { mode, language = 'de', ...rest } = params;

    const token = await getAuthToken();

    const response = await fetch(`${API_BASE}/ai-ad-generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
            mode,
            language,
            ...rest,
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || error.message || 'Ad generation failed');
    }

    return response.json();
}

/**
 * Transkribiert Audio zu Text via Whisper
 */
export async function transcribeAudio(audioBlob: Blob): Promise<TranscriptionResponse> {
    const token = await getAuthToken();

    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    const response = await fetch(`${API_BASE}/ai-ad-transcribe`, {
        method: 'POST',
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || error.message || 'Transcription failed');
    }

    return response.json();
}
