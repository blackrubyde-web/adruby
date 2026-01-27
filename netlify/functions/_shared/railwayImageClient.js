/**
 * Railway Image Service Client
 * Connects to the v3.0 AI Design Knowledge System
 */

// Railway service URL from environment
const RAILWAY_URL = process.env.RAILWAY_IMAGE_SERVICE_URL || 'https://adruby-production.up.railway.app';

/**
 * Generate ad using AI Design Knowledge System
 * @param {Object} params - Generation parameters
 * @returns {Promise<Object>} - Generated ad result
 */
export async function generateWithAIDesign(params) {
    const {
        userPrompt,
        industry,
        headline,
        tagline,
        features = [],
        stats = [],
        cta,
        productImageUrl,
        format = '1080x1080',
    } = params;

    console.log('[Railway] Calling AI Design System:', { industry, format });

    const response = await fetch(`${RAILWAY_URL}/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userPrompt: userPrompt || `${industry} product advertisement`,
            industry: industry || 'tech',
            headline,
            tagline,
            features,
            stats,
            cta,
            productImageUrl,
            format,
        }),
        // Timeout after 120 seconds (Railway has long processing times)
        signal: AbortSignal.timeout(120000),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `Railway service error: ${response.status}`);
    }

    const result = await response.json();

    // Railway returns imageBase64, convert to buffer and also provide data URL
    let imageBuffer = null;
    let imageDataUrl = null;

    if (result.imageBase64) {
        imageBuffer = Buffer.from(result.imageBase64, 'base64');
        imageDataUrl = `data:image/png;base64,${result.imageBase64}`;
        console.log('[Railway] ✅ Received image:', imageBuffer.length, 'bytes');
    } else {
        console.warn('[Railway] ⚠️ No imageBase64 in response');
    }

    // Return both buffer and dataUrl
    return {
        imageBuffer,
        imageDataUrl,
        imageBase64: result.imageBase64,
        imagePrompt: result.prompt || userPrompt,
        metadata: {
            source: 'railway-v3',
            industry: result.metadata?.industry || industry,
            pattern: result.metadata?.pattern,
            referenceCount: result.metadata?.referenceCount,
            generationTime: result.metadata?.duration,
        },
    };
}

/**
 * Get top-performing reference ads for an industry
 * @param {string} industry - Industry category
 * @param {number} count - Number of references to fetch
 * @returns {Promise<Array>} - Reference ads
 */
export async function getReferences(industry, count = 5) {
    console.log('[Railway] Fetching references for:', industry);

    const response = await fetch(`${RAILWAY_URL}/references/${industry}?count=${count}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
        console.warn('[Railway] Failed to fetch references:', response.status);
        return [];
    }

    const result = await response.json();
    return result.references || [];
}

/**
 * Search for similar reference ads based on a prompt
 * @param {string} prompt - Search prompt
 * @param {string} industry - Optional industry filter
 * @returns {Promise<Array>} - Matching reference ads
 */
export async function searchReferences(prompt, industry = null) {
    console.log('[Railway] Searching references:', prompt);

    const params = new URLSearchParams({ prompt });
    if (industry) params.append('industry', industry);

    const response = await fetch(`${RAILWAY_URL}/search-references?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
        console.warn('[Railway] Search failed:', response.status);
        return [];
    }

    const result = await response.json();
    return result.references || [];
}

/**
 * Get Foreplay API usage stats
 * @returns {Promise<Object>} - Usage statistics
 */
export async function getForeplayUsage() {
    const response = await fetch(`${RAILWAY_URL}/foreplay/usage`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
        return { error: 'Failed to fetch usage' };
    }

    return response.json();
}

/**
 * Check if Railway service is available
 * @returns {Promise<boolean>}
 */
export async function isRailwayAvailable() {
    try {
        const response = await fetch(`${RAILWAY_URL}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
        });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Check if Railway is up AND Foreplay is configured on the service.
 * @returns {Promise<boolean>}
 */
export async function isForeplayAvailable() {
    try {
        const response = await fetch(`${RAILWAY_URL}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
        });
        if (!response.ok) return false;
        const data = await response.json().catch(() => ({}));
        const foreplayEnabled = data?.foreplay === true || data?.services?.foreplay === true;
        return foreplayEnabled === true;
    } catch {
        return false;
    }
}

/**
 * Generate ad using MASTER Pipeline v10.0
 * 10-Phase Designer-Level + Quality Verification + Regeneration
 * 
 * @param {Object} params - Generation parameters
 * @returns {Promise<Object>} - Generated ad with buffer and metadata
 */
export async function generateWithComposite({
    productImageBase64,
    productImageUrl,
    headline,
    tagline,
    cta,
    userPrompt,
    industry,
    accentColor = '#FF4757',
    enableQualityCheck = true,
    enableAIContent = true,
    enableAdvancedEffects = true,
    strictReplica = true,
}) {
    console.log('[Railway] 🎨 MASTER Pipeline v10.0 request...');
    console.log('[Railway] Mode: 10-Phase Designer-Level + Quality Verification');
    console.log('[Railway] Has productImageBase64:', !!productImageBase64, productImageBase64 ? `(${Math.round(productImageBase64.length / 1024)}KB)` : '');
    console.log('[Railway] Has productImageUrl:', !!productImageUrl);

    const response = await fetch(`${RAILWAY_URL}/generate-composite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            productImageBase64,
            productImageUrl,
            headline,
            tagline,
            cta,
            userPrompt,
            industry,
            accentColor,
            enableQualityCheck,
            enableAIContent,
            enableAdvancedEffects,
            strictReplica,
        }),
        signal: AbortSignal.timeout(600000), // 10 minutes for full 10-phase pipeline + quality gates + regen
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error body');
        console.error('[Railway] Request failed:', response.status, errorText.substring(0, 500));
        let errorData = {};
        try { errorData = JSON.parse(errorText); } catch (e) { /* not JSON */ }
        throw new Error(errorData.error || `Railway master error: ${response.status}`);
    }

    const result = await response.json();

    let imageBuffer = null;
    let imageDataUrl = null;

    if (result.imageBase64) {
        imageBuffer = Buffer.from(result.imageBase64, 'base64');
        imageDataUrl = `data:image/png;base64,${result.imageBase64}`;
        console.log('[Railway] ✅ MASTER v10.0 ad received:', imageBuffer.length, 'bytes');
        console.log('[Railway] Quality:', result.metadata?.qualityScore, `(${result.metadata?.qualityTier})`);
    }

    return {
        imageBuffer,
        imageDataUrl,
        imageBase64: result.imageBase64,
        metadata: {
            source: 'railway-master-v10',
            qualityScore: result.metadata?.qualityScore,
            qualityTier: result.metadata?.qualityTier,
            qualityDetails: result.metadata?.qualityDetails,
            regenerationAttempts: result.metadata?.regenerationAttempts,
            referenceCount: result.metadata?.referenceCount,
            duration: result.metadata?.duration,
            similarityScore: result.metadata?.similarityScore,
            similarityDetails: result.metadata?.similarityDetails,
            compositionPlan: result.metadata?.compositionPlan,
            mode: 'master_designer'
        },
    };
}



/**
 * Start async composite job - returns immediately with jobId
 */
export async function startCompositeJobAsync(params) {
    console.log('[Railway] 🚀 Starting ASYNC composite job...');

    const response = await fetch(`${RAILWAY_URL}/generate-composite-async`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: AbortSignal.timeout(30000), // Quick timeout - just starting the job
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Failed to start async job: ${response.status}`);
    }

    const result = await response.json();
    console.log('[Railway] ✅ Async job started:', result.jobId);
    return result;
}

/**
 * Poll job status until complete or failed
 */
export async function pollJobStatus(jobId, intervalMs = 5000, maxWaitMs = 900000) {
    console.log(`[Railway] 📊 Polling job ${jobId}...`);
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
        try {
            const response = await fetch(`${RAILWAY_URL}/job/${jobId}/status`, {
                signal: AbortSignal.timeout(10000),
            });

            if (!response.ok) {
                throw new Error(`Status check failed: ${response.status}`);
            }

            const status = await response.json();
            console.log(`[Railway] Job ${jobId}: ${status.status} (${status.progress}%)`);

            if (status.status === 'complete') {
                return status;
            }
            if (status.status === 'failed') {
                throw new Error(status.error || 'Job failed');
            }

            // Wait before next poll
            await new Promise(resolve => setTimeout(resolve, intervalMs));
        } catch (error) {
            console.error(`[Railway] Poll error:`, error.message);
            // Continue polling on transient errors
            await new Promise(resolve => setTimeout(resolve, intervalMs));
        }
    }

    throw new Error(`Job ${jobId} timed out after ${maxWaitMs}ms`);
}

/**
 * Get completed job result
 */
export async function getJobResult(jobId) {
    console.log(`[Railway] 📥 Fetching result for job ${jobId}...`);

    const response = await fetch(`${RAILWAY_URL}/job/${jobId}/result`, {
        signal: AbortSignal.timeout(30000),
    });

    if (response.status === 202) {
        throw new Error('Job still processing');
    }
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Failed to get result: ${response.status}`);
    }

    const result = await response.json();

    return {
        imageBuffer: result.imageBase64 ? Buffer.from(result.imageBase64, 'base64') : null,
        imageDataUrl: result.imageBase64 ? `data:image/png;base64,${result.imageBase64}` : null,
        imageBase64: result.imageBase64,
        metadata: result.metadata,
    };
}

/**
 * Generate with async pattern - starts job, polls, returns result
 */
export async function generateWithCompositeAsync(params) {
    // Start the job
    const { jobId } = await startCompositeJobAsync(params);

    // Poll until complete
    await pollJobStatus(jobId);

    // Get the result
    return await getJobResult(jobId);
}


export default {
    generateWithAIDesign,
    generateWithComposite,
    generateWithCompositeAsync,
    startCompositeJobAsync,
    pollJobStatus,
    getJobResult,
    getReferences,
    searchReferences,
    getForeplayUsage,
    isRailwayAvailable,
    isForeplayAvailable,
};
