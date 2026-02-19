/**
 * Ad Pipeline Orchestrator v1.0
 * 
 * Master orchestrator that sequences all modules:
 *   1. Parse + Validate AdSpec (5%)
 *   2. Generate Copy Pack (20%)
 *   3. Filter Compliance (25%)
 *   4. Generate Creative Images (60%)
 *   5. Run QA Gate (85%)
 *   6. Package Output (90%)
 *   7. Upload Assets to Supabase (95%)
 *   8. Return Final Pack (100%)
 * 
 * Supports progress updates via callback for DB status tracking.
 */

import crypto from 'crypto';
import { generateCopyPack } from './copyPackGenerator.js';
import { filterForCompliance } from './complianceFilter.js';
import { generateCreativePack, cleanupTempFiles } from './nanoBananaCreativeEngine.js';
import { runQAGate } from './qaGate.js';
import { buildAdPack } from './metaAdPackager.js';
import { supabaseAdmin } from '../clients.js';

// ═══════════════════════════════════════════════════════════════
// ADSPEC VALIDATION
// ═══════════════════════════════════════════════════════════════

/**
 * Validate an AdSpec input.
 */
function validateAdSpec(adSpec) {
    const errors = [];

    if (!adSpec.offer || typeof adSpec.offer !== 'string' || adSpec.offer.trim().length < 5) {
        errors.push('offer: required, minimum 5 characters');
    }
    if (!adSpec.audience || typeof adSpec.audience !== 'string' || adSpec.audience.trim().length < 3) {
        errors.push('audience: required, minimum 3 characters');
    }
    if (!adSpec.angle || typeof adSpec.angle !== 'string' || adSpec.angle.trim().length < 3) {
        errors.push('angle: required, minimum 3 characters');
    }

    // Optional fields validation
    if (adSpec.brandKit) {
        if (adSpec.brandKit.palette && !Array.isArray(adSpec.brandKit.palette)) {
            errors.push('brandKit.palette: must be an array of hex color strings');
        }
    }

    if (adSpec.constraints) {
        if (adSpec.constraints.language && !['de', 'en'].includes(adSpec.constraints.language)) {
            errors.push('constraints.language: must be "de" or "en"');
        }
        if (adSpec.constraints.niche &&
            !['general', 'health', 'finance', 'dating'].includes(adSpec.constraints.niche)) {
            errors.push('constraints.niche: must be one of: general, health, finance, dating');
        }
    }

    return { valid: errors.length === 0, errors };
}

// ═══════════════════════════════════════════════════════════════
// ASSET UPLOAD
// ═══════════════════════════════════════════════════════════════

/**
 * Upload all creative assets to Supabase Storage.
 */
async function uploadAssets(creativePack, userId, packId) {
    const uploadResults = [];

    for (const concept of creativePack.concepts || []) {
        for (const [formatKey, asset] of Object.entries(concept.formats || {})) {
            if (asset.error || !asset.buffer) continue;

            const filename = `ad-packs/${userId}/${packId}/${concept.key}_${formatKey}.png`;

            try {
                const { error: uploadError } = await supabaseAdmin.storage
                    .from('creative-images')
                    .upload(filename, asset.buffer, {
                        contentType: 'image/png',
                        upsert: true,
                    });

                if (uploadError) {
                    console.error(`[Orchestrator] Upload failed for ${filename}:`, uploadError.message);
                    uploadResults.push({ filename, success: false, error: uploadError.message });
                    continue;
                }

                const { data: urlData } = supabaseAdmin.storage
                    .from('creative-images')
                    .getPublicUrl(filename);

                // Attach public URL to the asset
                asset.publicUrl = urlData.publicUrl;
                asset.storagePath = filename;

                uploadResults.push({ filename, success: true, url: urlData.publicUrl });
                console.log(`[Orchestrator] ✅ Uploaded: ${filename}`);
            } catch (err) {
                console.error(`[Orchestrator] Upload exception for ${filename}:`, err.message);
                uploadResults.push({ filename, success: false, error: err.message });
            }
        }
    }

    return uploadResults;
}

// ═══════════════════════════════════════════════════════════════
// MAIN ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════

/**
 * Run the complete ad generation pipeline.
 * 
 * @param {Object} params
 * @param {Object} params.adSpec - The ad specification
 * @param {string} params.userId - Authenticated user ID
 * @param {string} params.packId - Pre-created pack ID (for DB tracking)
 * @param {Function} [params.onProgress] - Progress callback (step, progress, details)
 * @returns {Promise<Object>} The final ad pack
 */
export async function runPipeline({
    adSpec,
    userId,
    packId,
    onProgress = () => { },
}) {
    const startTime = Date.now();
    console.log(`[Orchestrator] 🚀 Starting pipeline for pack ${packId}`);

    try {
        // ══ STEP 1: Validate AdSpec (5%) ══
        onProgress('validating', 5, { step: 'Validating input' });
        const validation = validateAdSpec(adSpec);
        if (!validation.valid) {
            throw new Error(`Invalid AdSpec: ${validation.errors.join(', ')}`);
        }
        console.log('[Orchestrator] ✅ AdSpec validated');

        // ══ STEP 2: Generate Copy Pack (20%) ══
        onProgress('generating_copy', 10, { step: 'Generating copy pack (54 variants)' });
        console.log('[Orchestrator] 📝 Generating copy pack...');
        const copyPack = await generateCopyPack(adSpec, {
            maxRetries: 2,
            temperature: 0.85,
        });
        console.log('[Orchestrator] ✅ Copy pack generated:', {
            primaryTexts: copyPack.primaryTexts?.length,
            headlines: copyPack.headlines?.length,
            descriptions: copyPack.descriptions?.length,
            ctas: copyPack.ctas?.length,
            ugcVariants: copyPack.ugcVariants?.length,
            drVariants: copyPack.drVariants?.length,
        });
        onProgress('copy_complete', 20, { step: 'Copy pack generated', copyCount: copyPack._meta?.totalVariants });

        // ══ STEP 3: Compliance Filter (25%) ══
        onProgress('compliance_check', 22, { step: 'Running compliance filter' });
        const niche = adSpec.constraints?.niche || 'general';
        const complianceResult = filterForCompliance(copyPack, niche);

        if (complianceResult.violations.length > 0) {
            console.log(`[Orchestrator] ⚠️ ${complianceResult.violations.length} compliance violations auto-fixed`);
        } else {
            console.log('[Orchestrator] ✅ Copy pack passed compliance check');
        }
        onProgress('compliance_done', 25, {
            step: 'Compliance filter complete',
            violations: complianceResult.violations.length,
            passed: complianceResult.passed,
        });

        // Use filtered copy pack from here on
        const filteredCopyPack = complianceResult.filtered;

        // ══ STEP 4: Generate Creative Images (60%) ══
        onProgress('generating_images', 30, { step: 'Generating creative images (3 concepts × 3 formats)' });
        console.log('[Orchestrator] 🎨 Generating creative images...');

        const creativePack = await generateCreativePack(adSpec, {
            maxRetries: 2,
            onProgress: (step, pct, details) => {
                // Map sub-progress to 30-60% range
                const mappedPct = 30 + Math.round(pct * 0.3);
                onProgress(step, mappedPct, details);
            },
        });

        console.log('[Orchestrator] ✅ Creative pack generated:', creativePack.stats);
        onProgress('images_complete', 60, {
            step: 'Creative images generated',
            generated: creativePack.stats.generated,
            failed: creativePack.stats.failed,
            engine: creativePack.engine,
        });

        // ══ STEP 5: Upload Assets (75%) ══
        onProgress('uploading', 65, { step: 'Uploading assets to storage' });
        console.log('[Orchestrator] ☁️ Uploading assets...');
        const uploadResults = await uploadAssets(creativePack, userId, packId);
        const uploadedCount = uploadResults.filter(r => r.success).length;
        console.log(`[Orchestrator] ✅ Uploaded ${uploadedCount}/${uploadResults.length} assets`);
        onProgress('upload_complete', 75, { step: 'Assets uploaded', uploaded: uploadedCount });

        // ══ STEP 6: QA Gate (85%) ══
        onProgress('qa_gate', 80, { step: 'Running QA gate' });
        console.log('[Orchestrator] 🔍 Running QA gate...');
        const qaResult = runQAGate(creativePack, filteredCopyPack);
        console.log(`[Orchestrator] QA result: ${qaResult.passed ? '✅ PASSED' : '❌ FAILED'} (${qaResult.score}/10)`);
        onProgress('qa_complete', 85, {
            step: 'QA gate complete',
            passed: qaResult.passed,
            score: qaResult.score,
        });

        // Use QA-trimmed copy pack
        const finalCopyPack = qaResult.trimmedCopyPack || filteredCopyPack;

        // ══ STEP 7: Package Output (90%) ══
        onProgress('packaging', 90, { step: 'Building final output package' });
        console.log('[Orchestrator] 📦 Packaging output...');

        const output = buildAdPack({
            adSpec,
            copyPack: finalCopyPack,
            creativePack,
            qaResult,
        });

        // ══ STEP 8: Save to DB (95%) ══
        onProgress('saving', 95, { step: 'Saving to database' });

        const duration = Date.now() - startTime;
        const { error: dbError } = await supabaseAdmin.from('ad_creative_packs').update({
            status: 'complete',
            copy_pack: output.adPack.copyPack,
            meta_mapping: output.adPack.metaMapping,
            qa_result: output.adPack.qa,
            completed_at: new Date().toISOString(),
        }).eq('id', packId);

        if (dbError) {
            console.error('[Orchestrator] ❌ DB save error:', dbError.message);
        }

        // Save individual assets to ad_pack_assets
        for (const concept of creativePack.concepts || []) {
            for (const [formatKey, asset] of Object.entries(concept.formats || {})) {
                await supabaseAdmin.from('ad_pack_assets').insert({
                    pack_id: packId,
                    concept_name: concept.key,
                    format: formatKey,
                    storage_path: asset.storagePath || null,
                    public_url: asset.publicUrl || null,
                    width: asset.width,
                    height: asset.height,
                    file_size: asset.buffer?.length || 0,
                    qa_passed: !asset.error,
                }).catch(err => console.warn('[Orchestrator] Asset insert warning:', err.message));
            }
        }

        // ══ DONE (100%) ══
        onProgress('complete', 100, {
            step: 'Pipeline complete',
            duration: duration,
            qaScore: qaResult.score,
            imagesGenerated: creativePack.stats.generated,
        });

        console.log(`[Orchestrator] 🎉 Pipeline complete in ${(duration / 1000).toFixed(1)}s`);

        // Cleanup temp files
        await cleanupTempFiles();

        return {
            ...output,
            _pipeline: {
                duration,
                engine: creativePack.engine,
                qaScore: qaResult.score,
                qaPassed: qaResult.passed,
                complianceViolations: complianceResult.violations.length,
                imagesGenerated: creativePack.stats.generated,
                imagesFailed: creativePack.stats.failed,
                assetsUploaded: uploadedCount,
            },
        };
    } catch (err) {
        console.error('[Orchestrator] ❌ Pipeline error:', err.message);
        console.error('[Orchestrator] Stack:', err.stack);

        // Update DB with error status
        await supabaseAdmin.from('ad_creative_packs').update({
            status: 'error',
            error: err.message,
        }).eq('id', packId).catch(() => { });

        // Cleanup
        await cleanupTempFiles();

        throw err;
    }
}

export { validateAdSpec };

export default {
    runPipeline,
    validateAdSpec,
};
