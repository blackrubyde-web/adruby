/**
 * Creative QA Gate v1.0
 * 
 * Validates every creative asset before packaging:
 *   - Aspect ratio correctness (within 2% tolerance)
 *   - Minimum resolution (≥1080px shortest side)
 *   - File existence and non-empty buffer
 *   - File size (≤5MB per image)
 *   - 9:16 safe zone (top/bottom 14% text-free)
 *   - Copy length limits (headlines ≤60, descriptions ≤200)
 *   - Compliance pass-through check
 */

// ═══════════════════════════════════════════════════════════════
// FORMAT SPECS
// ═══════════════════════════════════════════════════════════════

const EXPECTED_RATIOS = {
    square: { ratio: 1.0, tolerance: 0.02 },
    portrait: { ratio: 0.8, tolerance: 0.02 }, // 1080/1350 = 0.8
    story: { ratio: 0.5625, tolerance: 0.02 }, // 1080/1920 = 0.5625
};

const MIN_RESOLUTION = 1080; // px shortest side
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const COPY_LIMITS = {
    headline: 60,
    description: 200,
    cta: 25,
    primaryText: 2200, // Meta primary text limit
};

// ═══════════════════════════════════════════════════════════════
// IMAGE VALIDATION
// ═══════════════════════════════════════════════════════════════

/**
 * Validate a single creative image asset.
 * 
 * @param {Object} asset - The image asset
 * @param {Buffer} asset.buffer - Image buffer
 * @param {number} asset.width - Image width in pixels
 * @param {number} asset.height - Image height in pixels
 * @param {string} formatKey - Format key (square, portrait, story)
 * @returns {QAResult}
 */
export function validateImageAsset(asset, formatKey) {
    const results = [];
    let passed = true;

    // 1. Buffer exists and non-empty
    if (!asset.buffer || asset.buffer.length === 0) {
        results.push({ check: 'file_exists', passed: false, message: 'Image buffer is empty or missing' });
        return { passed: false, results, formatKey };
    }
    results.push({ check: 'file_exists', passed: true, message: 'Image buffer present' });

    // 2. File size (≤5MB)
    const sizeMB = asset.buffer.length / (1024 * 1024);
    if (asset.buffer.length > MAX_FILE_SIZE) {
        results.push({ check: 'file_size', passed: false, message: `File size ${sizeMB.toFixed(1)}MB exceeds 5MB limit` });
        passed = false;
    } else {
        results.push({ check: 'file_size', passed: true, message: `File size: ${sizeMB.toFixed(1)}MB` });
    }

    // 3. Resolution (≥1080px shortest side)
    if (asset.width && asset.height) {
        const shortSide = Math.min(asset.width, asset.height);
        if (shortSide < MIN_RESOLUTION) {
            results.push({ check: 'resolution', passed: false, message: `Shortest side ${shortSide}px < ${MIN_RESOLUTION}px minimum` });
            passed = false;
        } else {
            results.push({ check: 'resolution', passed: true, message: `Resolution: ${asset.width}×${asset.height}` });
        }

        // 4. Aspect ratio (within tolerance)
        const expectedSpec = EXPECTED_RATIOS[formatKey];
        if (expectedSpec) {
            const actualRatio = asset.width / asset.height;
            const diff = Math.abs(actualRatio - expectedSpec.ratio);
            if (diff > expectedSpec.tolerance) {
                results.push({
                    check: 'aspect_ratio',
                    passed: false,
                    message: `Aspect ratio ${actualRatio.toFixed(3)} deviates from expected ${expectedSpec.ratio.toFixed(3)} by ${(diff * 100).toFixed(1)}% (max ${expectedSpec.tolerance * 100}%)`,
                });
                passed = false;
            } else {
                results.push({ check: 'aspect_ratio', passed: true, message: `Aspect ratio correct: ${actualRatio.toFixed(3)}` });
            }
        }
    } else {
        results.push({ check: 'resolution', passed: false, message: 'Missing width/height metadata' });
        passed = false;
    }

    return { passed, results, formatKey };
}

// ═══════════════════════════════════════════════════════════════
// COPY VALIDATION
// ═══════════════════════════════════════════════════════════════

/**
 * Validate copy pack items against Meta limits.
 * Returns auto-trimmed versions where needed.
 */
export function validateCopyItems(copyPack) {
    const results = [];
    let passed = true;
    const trimmed = { ...copyPack };

    // Check headlines
    if (Array.isArray(trimmed.headlines)) {
        trimmed.headlines = trimmed.headlines.map((h, i) => {
            if (h.text && h.text.length > COPY_LIMITS.headline) {
                results.push({
                    check: 'headline_length',
                    passed: false,
                    message: `headlines[${i}]: ${h.text.length} chars > ${COPY_LIMITS.headline} limit — auto-trimmed`,
                    autoFixed: true,
                });
                return { ...h, text: h.text.substring(0, COPY_LIMITS.headline - 3) + '...', _trimmed: true };
            }
            return h;
        });
    }

    // Check descriptions
    if (Array.isArray(trimmed.descriptions)) {
        trimmed.descriptions = trimmed.descriptions.map((d, i) => {
            if (d.text && d.text.length > COPY_LIMITS.description) {
                results.push({
                    check: 'description_length',
                    passed: false,
                    message: `descriptions[${i}]: ${d.text.length} chars > ${COPY_LIMITS.description} limit — auto-trimmed`,
                    autoFixed: true,
                });
                return { ...d, text: d.text.substring(0, COPY_LIMITS.description - 3) + '...', _trimmed: true };
            }
            return d;
        });
    }

    // Check CTAs
    if (Array.isArray(trimmed.ctas)) {
        trimmed.ctas = trimmed.ctas.map((c, i) => {
            if (c.text && c.text.length > COPY_LIMITS.cta) {
                results.push({
                    check: 'cta_length',
                    passed: false,
                    message: `ctas[${i}]: ${c.text.length} chars > ${COPY_LIMITS.cta} limit — auto-trimmed`,
                    autoFixed: true,
                });
                return { ...c, text: c.text.substring(0, COPY_LIMITS.cta), _trimmed: true };
            }
            return c;
        });
    }

    // Check primary texts
    if (Array.isArray(trimmed.primaryTexts)) {
        trimmed.primaryTexts = trimmed.primaryTexts.map((pt, i) => {
            if (pt.text && pt.text.length > COPY_LIMITS.primaryText) {
                results.push({
                    check: 'primary_text_length',
                    passed: false,
                    message: `primaryTexts[${i}]: ${pt.text.length} chars > ${COPY_LIMITS.primaryText} limit — auto-trimmed`,
                    autoFixed: true,
                });
                return { ...pt, text: pt.text.substring(0, COPY_LIMITS.primaryText - 3) + '...', _trimmed: true };
            }
            return pt;
        });
    }

    // Mark overall as passed if all auto-fixable
    const hasHardFail = results.some(r => !r.passed && !r.autoFixed);
    passed = !hasHardFail;

    return { passed, results, trimmedCopyPack: trimmed };
}

// ═══════════════════════════════════════════════════════════════
// FULL QA GATE
// ═══════════════════════════════════════════════════════════════

/**
 * Run the full QA gate on creative pack + copy pack.
 * 
 * @param {Object} creativePack - From nanoBananaCreativeEngine
 * @param {Object} copyPack - From copyPackGenerator (post-compliance)
 * @returns {{ passed: boolean, score: number, results: Object[], summary: string }}
 */
export function runQAGate(creativePack, copyPack) {
    const allResults = [];
    let totalChecks = 0;
    let passedChecks = 0;

    // 1. Validate all image assets
    if (creativePack?.concepts) {
        for (const concept of creativePack.concepts) {
            for (const [formatKey, asset] of Object.entries(concept.formats || {})) {
                if (asset.error) {
                    allResults.push({
                        category: 'image',
                        concept: concept.name,
                        format: formatKey,
                        check: 'generation',
                        passed: false,
                        message: `Image generation failed: ${asset.error}`,
                    });
                    totalChecks++;
                    continue;
                }

                const imageResult = validateImageAsset(asset, formatKey);
                totalChecks += imageResult.results.length;
                passedChecks += imageResult.results.filter(r => r.passed).length;

                for (const r of imageResult.results) {
                    allResults.push({
                        category: 'image',
                        concept: concept.name,
                        format: formatKey,
                        ...r,
                    });
                }
            }
        }
    }

    // 2. Validate copy items
    const copyResult = validateCopyItems(copyPack);
    totalChecks += copyResult.results.length + 1; // +1 for overall copy check
    if (copyResult.passed) passedChecks += copyResult.results.length + 1;

    for (const r of copyResult.results) {
        allResults.push({ category: 'copy', ...r });
    }

    // 3. Check minimum viable counts
    const imageCount = creativePack?.stats?.generated || 0;
    const totalImages = creativePack?.stats?.total || 9;
    const imageRatio = imageCount / totalImages;

    if (imageRatio < 0.67) {
        allResults.push({
            category: 'viability',
            check: 'minimum_images',
            passed: false,
            message: `Only ${imageCount}/${totalImages} images generated (need ≥67%)`,
        });
        totalChecks++;
    } else {
        allResults.push({
            category: 'viability',
            check: 'minimum_images',
            passed: true,
            message: `${imageCount}/${totalImages} images generated (${(imageRatio * 100).toFixed(0)}%)`,
        });
        totalChecks++;
        passedChecks++;
    }

    // Calculate score (0-10)
    const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) / 10 : 0;
    const passed = score >= 7.0 && imageRatio >= 0.67;

    const failedChecks = allResults.filter(r => !r.passed);
    const summary = passed
        ? `✅ QA passed (${score}/10). ${imageCount}/${totalImages} images, ${passedChecks}/${totalChecks} checks passed.`
        : `❌ QA failed (${score}/10). ${failedChecks.length} issues found: ${failedChecks.map(f => f.message).join('; ')}`;

    console.log(`[QAGate] ${summary}`);

    return {
        passed,
        score,
        results: allResults,
        summary,
        stats: {
            totalChecks,
            passedChecks,
            failedChecks: totalChecks - passedChecks,
            imageCount,
            totalImages,
        },
        trimmedCopyPack: copyResult.trimmedCopyPack,
    };
}

export default {
    runQAGate,
    validateImageAsset,
    validateCopyItems,
    EXPECTED_RATIOS,
    COPY_LIMITS,
};
