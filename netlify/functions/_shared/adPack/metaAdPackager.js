/**
 * Meta Ad Packager v1.0
 * 
 * Builds the final structured output JSON that maps:
 *   - Creative assets → Copy variants → Meta placements
 * 
 * Output is ready for Meta Ads Manager import or API upload.
 */

import crypto from 'crypto';

// ═══════════════════════════════════════════════════════════════
// META PLACEMENT MAPPING
// ═══════════════════════════════════════════════════════════════

const FORMAT_TO_PLACEMENTS = {
    square: ['facebook_feed', 'instagram_feed', 'audience_network', 'messenger_inbox'],
    portrait: ['instagram_feed', 'facebook_feed', 'instagram_explore'],
    story: ['instagram_story', 'facebook_story', 'instagram_reels', 'facebook_reels'],
};

const META_CTA_ENUM = [
    'LEARN_MORE', 'SHOP_NOW', 'SIGN_UP', 'BOOK_NOW',
    'CONTACT_US', 'DOWNLOAD', 'GET_OFFER', 'GET_QUOTE',
    'SUBSCRIBE', 'APPLY_NOW', 'ORDER_NOW', 'SEE_MORE',
];

// ═══════════════════════════════════════════════════════════════
// CTA MAPPING
// ═══════════════════════════════════════════════════════════════

/**
 * Map a free-text CTA to the closest Meta CTA enum value.
 */
function mapToMetaCTA(ctaText) {
    if (!ctaText) return 'LEARN_MORE';

    const lower = ctaText.toLowerCase();
    const mapping = [
        { keywords: ['kaufen', 'buy', 'shop', 'bestellen', 'order'], cta: 'SHOP_NOW' },
        { keywords: ['anmelden', 'registrier', 'sign up', 'register'], cta: 'SIGN_UP' },
        { keywords: ['buchen', 'book', 'termin', 'appointment'], cta: 'BOOK_NOW' },
        { keywords: ['kontakt', 'contact', 'anrufen', 'call'], cta: 'CONTACT_US' },
        { keywords: ['download', 'herunterladen', 'laden'], cta: 'DOWNLOAD' },
        { keywords: ['angebot', 'offer', 'deal', 'rabatt', 'discount'], cta: 'GET_OFFER' },
        { keywords: ['abo', 'subscri', 'newsletter'], cta: 'SUBSCRIBE' },
        { keywords: ['bewerben', 'apply', 'jetzt starten', 'start'], cta: 'APPLY_NOW' },
        { keywords: ['entdecken', 'discover', 'erfahren', 'learn', 'mehr'], cta: 'LEARN_MORE' },
    ];

    for (const m of mapping) {
        if (m.keywords.some(kw => lower.includes(kw))) {
            return m.cta;
        }
    }

    return 'LEARN_MORE';
}

// ═══════════════════════════════════════════════════════════════
// MAIN PACKAGER
// ═══════════════════════════════════════════════════════════════

/**
 * Build the final structured Meta ad pack output.
 * 
 * @param {Object} params
 * @param {Object} params.adSpec - Original ad specification
 * @param {Object} params.copyPack - Filtered, QA-passed copy pack
 * @param {Object} params.creativePack - Generated creative assets with upload URLs
 * @param {Object} params.qaResult - QA gate result
 * @returns {Object} Structured Meta ad pack
 */
export function buildAdPack({
    adSpec,
    copyPack,
    creativePack,
    qaResult,
}) {
    const packId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Build concept entries with public URLs
    const concepts = (creativePack.concepts || []).map(concept => ({
        name: concept.name,
        key: concept.key,
        direction: concept.direction,
        formats: Object.fromEntries(
            Object.entries(concept.formats || {}).map(([formatKey, asset]) => [
                formatKey,
                {
                    url: asset.publicUrl || asset.dataUrl || null,
                    storagePath: asset.storagePath || null,
                    width: asset.width,
                    height: asset.height,
                    format: asset.format || 'png',
                    engine: asset.engine || 'unknown',
                    error: asset.error || null,
                },
            ])
        ),
    }));

    // Build meta mapping (combinatorial: each concept format × copy variant)
    const metaMapping = buildMetaMapping(concepts, copyPack);

    return {
        adPack: {
            id: packId,
            created_at: now,
            offer: adSpec.offer,
            audience: adSpec.audience,
            angle: adSpec.angle,
            language: adSpec.constraints?.language || 'de',
            niche: adSpec.constraints?.niche || 'general',

            copyPack: {
                primaryTexts: copyPack.primaryTexts || [],
                headlines: copyPack.headlines || [],
                descriptions: copyPack.descriptions || [],
                ctas: copyPack.ctas || [],
                ugcVariants: copyPack.ugcVariants || [],
                drVariants: copyPack.drVariants || [],
                _meta: copyPack._meta || {},
            },

            creativePack: {
                concepts,
                engine: creativePack.engine || 'unknown',
                stats: creativePack.stats || {},
            },

            metaMapping,

            qa: {
                passed: qaResult.passed,
                score: qaResult.score,
                summary: qaResult.summary,
                totalChecks: qaResult.stats?.totalChecks || 0,
                passedChecks: qaResult.stats?.passedChecks || 0,
                issues: (qaResult.results || []).filter(r => !r.passed).map(r => ({
                    category: r.category,
                    check: r.check,
                    message: r.message,
                })),
            },
        },
    };
}

// ═══════════════════════════════════════════════════════════════
// META MAPPING BUILDER
// ═══════════════════════════════════════════════════════════════

/**
 * Build the metaMapping array — suggested ad combinations.
 * Creates intelligent pairings of concepts + copy for each placement type.
 */
function buildMetaMapping(concepts, copyPack) {
    const mapping = [];
    let adIndex = 0;

    for (let ci = 0; ci < concepts.length; ci++) {
        const concept = concepts[ci];

        for (const [formatKey, asset] of Object.entries(concept.formats)) {
            // Skip failed assets
            if (asset.error) continue;

            const placements = FORMAT_TO_PLACEMENTS[formatKey] || [];

            // Pick varied copy for each concept/format combo
            const primaryIdx = (ci * 3 + adIndex) % (copyPack.primaryTexts?.length || 1);
            const headlineIdx = (ci * 4 + adIndex) % (copyPack.headlines?.length || 1);
            const descIdx = (ci * 4 + adIndex) % (copyPack.descriptions?.length || 1);
            const ctaIdx = ci % (copyPack.ctas?.length || 1);

            const ctaText = copyPack.ctas?.[ctaIdx]?.text || 'Jetzt entdecken';
            const metaCTA = mapToMetaCTA(ctaText);

            const adName = `${concept.key}_${formatKey}_${adIndex}`.toUpperCase();

            mapping.push({
                adName,
                creative: `concepts[${ci}].formats.${formatKey}`,
                creativeUrl: asset.url,
                primaryText: copyPack.primaryTexts?.[primaryIdx]?.text || '',
                primaryTextMeta: {
                    hookType: copyPack.primaryTexts?.[primaryIdx]?.hookType,
                    index: primaryIdx,
                },
                headline: copyPack.headlines?.[headlineIdx]?.text || '',
                headlineMeta: {
                    angle: copyPack.headlines?.[headlineIdx]?.angle,
                    index: headlineIdx,
                },
                description: copyPack.descriptions?.[descIdx]?.text || '',
                descriptionMeta: {
                    focus: copyPack.descriptions?.[descIdx]?.focus,
                    index: descIdx,
                },
                cta: metaCTA,
                ctaText,
                placements,
                conceptName: concept.name,
                format: formatKey,
            });

            adIndex++;
        }
    }

    return mapping;
}

export default {
    buildAdPack,
    mapToMetaCTA,
    FORMAT_TO_PLACEMENTS,
    META_CTA_ENUM,
};
