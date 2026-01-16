/**
 * AI Ad Builder - API Client
 * Client-seitige API für Netlify Functions mit Polling für Background Jobs
 */

import { supabase } from '../supabaseClient';
import type { AdGenerationParams, AdGenerationResponse, TranscriptionResponse } from '../../types/aibuilder';

const API_BASE = '/.netlify/functions';
const POLL_INTERVAL = 2000; // 2 seconds
const MAX_POLL_TIME = 120000; // 2 minutes max

/**
 * Get current auth token from Supabase session
 */
async function getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
}

/**
 * Poll for job completion
 */
async function pollJobStatus(jobId: string, token: string | null): Promise<AdGenerationResponse> {
    const startTime = Date.now();

    while (Date.now() - startTime < MAX_POLL_TIME) {
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));

        const statusResponse = await fetch(`${API_BASE}/ai-ad-status?id=${jobId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });

        if (!statusResponse.ok) {
            throw new Error('Status check failed');
        }

        const statusData = await statusResponse.json();

        if (statusData.status === 'complete') {
            return {
                success: true,
                data: statusData.data,
                metadata: statusData.metadata,
            };
        }

        if (statusData.status === 'error') {
            throw new Error(statusData.error || 'Generation failed');
        }

        // Still processing, continue polling
        console.log('[AI Ad Builder] Still processing...');
    }

    throw new Error('Generation timeout - please try again');
}

/**
 * Generiert eine Ad basierend auf Benutzereingaben
 * Verwendet Background Function mit Polling
 */
export async function generateAd(params: AdGenerationParams): Promise<AdGenerationResponse> {
    const { mode, language = 'de', ...rest } = params;

    const token = await getAuthToken();

    // Start generation (background function returns immediately with job ID)
    const response = await fetch(`${API_BASE}/ai-ad-generate-background`, {
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

    const data = await response.json();

    // Handle errors
    if (!response.ok) {
        throw new Error(data.error || data.message || 'Ad generation failed');
    }

    // If we got a jobId, poll for completion
    if (data.jobId && data.status === 'processing') {
        console.log('[AI Ad Builder] Job started:', data.jobId);
        return pollJobStatus(data.jobId, token);
    }

    // Direct response (for backward compatibility)
    return data;
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
