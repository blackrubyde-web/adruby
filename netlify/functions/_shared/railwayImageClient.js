/**
 * Railway Image Service Client
 * Connects to the v3.0 AI Design Knowledge System
 */

// Railway service URL from environment
const RAILWAY_URL = process.env.RAILWAY_IMAGE_SERVICE_URL || 'https://adruby-image-service.up.railway.app';

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
 * Generate ad using the new Composite Pipeline (v6.0)
 * 100% Product Preservation - Background + Sharp Overlay + SVG Text
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
}) {
    console.log('[Railway] 🎨 Composite Pipeline v6.0 request...');

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
        }),
        signal: AbortSignal.timeout(120000),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `Railway composite error: ${response.status}`);
    }

    const result = await response.json();

    let imageBuffer = null;
    let imageDataUrl = null;

    if (result.imageBase64) {
        imageBuffer = Buffer.from(result.imageBase64, 'base64');
        imageDataUrl = `data:image/png;base64,${result.imageBase64}`;
        console.log('[Railway] ✅ Composite image received:', imageBuffer.length, 'bytes');
    }

    return {
        imageBuffer,
        imageDataUrl,
        imageBase64: result.imageBase64,
        metadata: {
            source: 'railway-composite-v6',
            isSaaSProduct: result.metadata?.isSaaSProduct,
            referenceCount: result.metadata?.referenceCount,
            duration: result.metadata?.duration,
            mode: 'composite_pipeline'
        },
    };
}

export default {
    generateWithAIDesign,
    generateWithComposite,
    getReferences,
    searchReferences,
    getForeplayUsage,
    isRailwayAvailable,
};
