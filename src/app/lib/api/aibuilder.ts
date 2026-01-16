/**
 * AI Ad Builder - API Client with Background Function Polling
 * Calls background function and polls for completion
 */

import { supabase } from '../supabaseClient';
import type { AdGenerationParams, AdGenerationResponse } from '../../types/aibuilder';

const API_BASE = '/.netlify/functions';
const POLL_INTERVAL = 2000; // 2 seconds
const MAX_POLL_TIME = 180000; // 3 minutes max

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
            const errorData = await statusResponse.json().catch(() => ({}));
            throw new Error(errorData.error || 'Status check failed');
        }

        const statusData = await statusResponse.json();

        if (statusData.status === 'complete') {
            return {
                success: true,
                status: 'complete',
                data: statusData.data,
                metadata: statusData.metadata || {},
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

    // Start generation with background function
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

    // Handle immediate errors (auth, validation, credits)
    if (!response.ok && response.status !== 202) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || error.message || 'Ad generation failed');
    }

    const data = await response.json();

    // Background function returns 202 immediately - poll for completion
    if (response.status === 202 && data.jobId) {
        console.log('[AI Ad Builder] Job started:', data.jobId);
        return pollJobStatus(data.jobId, token);
    }

    // Direct response (if function returns complete result)
    if (data.status === 'complete' && data.data) {
        return data;
    }

    // Fallback to polling if we have a jobId
    if (data.jobId) {
        return pollJobStatus(data.jobId, token);
    }

    throw new Error('Invalid response from server');
}

/**
 * Type for transcription response
 */
export interface TranscriptionResponse {
    success: boolean;
    data: {
        text: string;
    };
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
