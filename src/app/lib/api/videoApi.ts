/**
 * Video Ad API Client
 * 
 * Handles video ad generation requests and polling.
 * Follows the same pattern as aibuilder.ts (generateAd + pollJobStatus).
 */

import { supabase } from '../supabaseClient';
import type { VideoAdParams, VideoGenerationResult, VideoStatusResponse } from '../../types/aibuilder';

const API_BASE = '/.netlify/functions';
const POLL_INTERVAL = 5000;     // 5 seconds (Veo is slower than image gen)
const MAX_POLL_TIME = 420000;   // 7 minutes max

// ============================================================
// AUTH
// ============================================================

async function getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
}

function generateJobId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// ============================================================
// VIDEO GENERATION
// ============================================================

export interface VideoGenerateCallbacks {
    onProgress?: (progress: number, step: string, message: string) => void;
}

/**
 * Generate a video ad using the background function + polling.
 */
export async function generateVideoAd(
    params: VideoAdParams,
    callbacks?: VideoGenerateCallbacks
): Promise<VideoStatusResponse> {
    const token = await getAuthToken();
    const jobId = generateJobId();

    console.log('[Video API] Starting video job:', jobId);

    // Fire background function
    const response = await fetch(`${API_BASE}/video-ad-generate-background`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
            jobId,
            mode: params.mode,
            language: params.language,
            archetypeId: params.archetypeId,
            durationSeconds: params.durationSeconds,
            quality: params.quality,
            aspectRatio: params.aspectRatio,
            resolution: params.resolution,
            includeAudio: params.includeAudio,
            personGeneration: params.personGeneration || 'dont_allow',
            // Pass through input data
            productName: params.productName,
            productImageUrl: params.productImageUrl,
            productImageBase64: params.productImageBase64,
            industry: params.industry,
            targetAudience: params.targetAudience,
            usp: params.usp,
            text: params.text,
            headline: params.productName,
        }),
    });

    // Handle immediate errors
    if (!response.ok && response.status !== 202) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || error.message || 'Video generation failed');
    }

    // Start polling
    console.log('[Video API] Background job started, polling...');
    return pollVideoStatus(jobId, token, callbacks);
}

// ============================================================
// POLLING
// ============================================================

async function pollVideoStatus(
    jobId: string,
    token: string | null,
    callbacks?: VideoGenerateCallbacks
): Promise<VideoStatusResponse> {
    const startTime = Date.now();
    let pollCount = 0;

    while (Date.now() - startTime < MAX_POLL_TIME) {
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
        pollCount++;

        console.log(`[Video API] Polling status... (attempt ${pollCount})`);

        try {
            const statusResponse = await fetch(`${API_BASE}/video-ad-status?id=${jobId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            });

            if (!statusResponse.ok) {
                if (statusResponse.status === 404 && pollCount < 8) {
                    console.log('[Video API] Job not found yet, waiting...');
                    callbacks?.onProgress?.(5, 'waiting', 'Job wird vorbereitet...');
                    continue;
                }
                const errorData = await statusResponse.json().catch(() => ({}));
                throw new Error((errorData as { error?: string }).error || 'Status check failed');
            }

            const statusData: VideoStatusResponse = await statusResponse.json();

            // Report progress
            if (statusData.status === 'processing' && callbacks?.onProgress) {
                callbacks.onProgress(
                    statusData.progress || 0,
                    statusData.step || 'processing',
                    statusData.message || 'Video wird generiert...'
                );
            }

            if (statusData.status === 'complete') {
                console.log('[Video API] Video generation complete!');
                return statusData;
            }

            if (statusData.status === 'error') {
                throw new Error(statusData.error || 'Video generation failed');
            }

        } catch (err) {
            if (pollCount < 5) {
                console.log('[Video API] Network error, retrying...');
                continue;
            }
            throw err;
        }
    }

    throw new Error('Video generation timeout — please try again');
}

// ============================================================
// CREDIT COST CALCULATOR
// ============================================================

export function calculateVideoCreditCost(quality: 'fast' | 'premium', durationSeconds: number): number {
    if (quality === 'premium') {
        return durationSeconds <= 6 ? 12 : 15;
    }
    return durationSeconds <= 6 ? 8 : 10;
}
