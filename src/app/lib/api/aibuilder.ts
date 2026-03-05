/**
 * AI Ad Builder - API Client with Background Function Polling
 * Generates jobId client-side since Netlify background functions return empty 202
 */

import { supabase } from '../supabaseClient';
import type { AdGenerationParams, AdGenerationResponse } from '../../types/aibuilder';

const API_BASE = '/.netlify/functions';
const POLL_INTERVAL = 2500; // 2.5 seconds
const MAX_POLL_TIME = 300000; // 5 minutes max (Railway composite can take up to 240s)

/**
 * Get current auth token from Supabase session
 */
async function getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
}

/**
 * Generate a UUID for the job
 */
function generateJobId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Poll for job completion
 */
async function pollJobStatus(jobId: string, token: string | null): Promise<AdGenerationResponse> {
    const startTime = Date.now();
    let pollCount = 0;

    while (Date.now() - startTime < MAX_POLL_TIME) {
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
        pollCount++;

        console.log(`[AI Ad Builder] Polling status... (attempt ${pollCount})`);

        try {
            const statusResponse = await fetch(`${API_BASE}/ai-ad-status?id=${jobId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            });

            if (!statusResponse.ok) {
                const errorData = await statusResponse.json().catch(() => ({}));
                // 404 means job not created yet, keep polling
                if (statusResponse.status === 404 && pollCount < 5) {
                    console.log('[AI Ad Builder] Job not found yet, waiting...');
                    continue;
                }
                throw new Error(errorData.error || 'Status check failed');
            }

            const statusData = await statusResponse.json();

            if (statusData.status === 'complete') {
                console.log('[AI Ad Builder] Generation complete!');
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
        } catch (err) {
            // Network errors - continue polling
            if (pollCount < 3) {
                console.log('[AI Ad Builder] Network error, retrying...');
                continue;
            }
            throw err;
        }
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

    // Generate jobId client-side (Netlify background functions return empty 202)
    const jobId = generateJobId();
    console.log('[AI Ad Builder] Starting job:', jobId);

    // Start generation with background function
    const response = await fetch(`${API_BASE}/ai-ad-generate-background`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
            jobId, // Pass jobId so backend uses same ID
            mode,
            language,
            ...rest,
        }),
    });

    // Handle immediate errors (auth, validation, credits) - body may be JSON or plain text
    if (!response.ok && response.status !== 202) {
        const text = await response.text().catch(() => '');
        let errorMsg = 'Ad generation failed';
        try {
            const json = JSON.parse(text);
            errorMsg = json.message || json.error || errorMsg;
        } catch {
            if (text) errorMsg = text.substring(0, 200);
        }
        throw new Error(errorMsg);
    }

    // For 202 or 200 - start polling with our jobId
    // (Background functions return empty body, so don't try to parse)
    console.log('[AI Ad Builder] Background job started, polling for status...');
    return pollJobStatus(jobId, token);
}

/**
 * Verfeinert eine existierende Ad mit einem Änderungs-Prompt
 * Verwendet Gemini Image-to-Image Editing
 */
export async function refineAd(params: {
    jobId: string;
    refinementPrompt: string;
    language?: string;
}): Promise<AdGenerationResponse> {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE}/ai-ad-refine`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || error.message || 'Refinement failed');
    }

    const result = await response.json();
    return {
        success: true,
        status: 'complete',
        data: result.data,
        metadata: { engine: 'refined', parentJobId: params.jobId },
    };
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
