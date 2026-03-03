/**
 * Adaptive Selector v1.0 — Smart Creative Intelligence
 * 
 * Selects 3 diverse archetypes + layouts + hooks based on:
 *   - Industry (12 matrices)
 *   - Funnel Stage (TOF/MOF/BOF)
 *   - Audience signals
 *   - Goal (awareness/conversion/retargeting)
 * 
 * Enforces cross-category diversity: 3 variants from 3 different categories.
 */

import { AD_ARCHETYPES, ARCHETYPES_BY_CATEGORY, CATEGORIES } from './adArchetypes.js';
import { HOOKS_BY_FUNNEL, HOOK_TYPES } from './hookTypes.js';

// ═══════════════════════════════════════════════════════════════
// INDUSTRY MATRIX — high/medium/low archetype weights per industry
// ═══════════════════════════════════════════════════════════════
const INDUSTRY_MATRIX = {
    ecommerce: {
        high: ['product_hero', 'ugc_selfie', 'flash_sale_explosion', 'before_after_split', 'bundle_value_stack', 'flatlay_aesthetic', 'customer_review_card', 'packaging_showcase'],
        medium: ['feature_callout', 'benefit_checklist', 'countdown_timer', 'social_numbers', 'limited_edition', 'free_shipping_gift', 'this_or_that'],
        low: ['job_posting', 'saas_dashboard', 'case_study_result', 'team_culture', 'company_values', 'open_positions_grid', 'employer_perks'],
    },
    saas: {
        high: ['feature_callout', 'step_by_step_guide', 'us_vs_them_grid', 'case_study_result', 'infographic_stat', 'saas_dashboard', 'how_it_works', 'feature_matrix'],
        medium: ['social_numbers', 'price_comparison', 'benefit_checklist', 'expert_endorsement', 'bold_claim', 'faq_answer'],
        low: ['flash_sale_explosion', 'flatlay_aesthetic', 'seasonal_moment', 'ugc_selfie', 'packaging_showcase', 'macro_detail'],
    },
    beauty: {
        high: ['before_after_split', 'ugc_selfie', 'macro_detail', 'ingredient_spotlight', 'transformation_timeline', 'customer_review_card', 'flatlay_aesthetic', 'ingredient_science'],
        medium: ['product_hero', 'aspirational_lifestyle', 'expert_endorsement', 'step_by_step_guide', 'mood_board_aesthetic', 'pov_first_person'],
        low: ['job_posting', 'saas_dashboard', 'price_comparison', 'case_study_result', 'open_positions_grid'],
    },
    fitness: {
        high: ['before_after_split', 'transformation_timeline', 'product_in_action', 'infographic_stat', 'ugc_selfie', 'identity_statement', 'expert_endorsement'],
        medium: ['step_by_step_guide', 'benefit_checklist', 'social_numbers', 'pov_first_person', 'day_in_the_life', 'bold_claim'],
        low: ['saas_dashboard', 'job_posting', 'packaging_showcase', 'flatlay_aesthetic', 'aesthetic_gradient'],
    },
    fashion: {
        high: ['flatlay_aesthetic', 'mood_board_aesthetic', 'ugc_selfie', 'aspirational_lifestyle', 'product_hero', 'seasonal_moment', '360_product_view', 'identity_statement'],
        medium: ['customer_review_card', 'limited_edition', 'starter_pack', 'pov_first_person', 'nostalgia_throwback', 'trend_hook'],
        low: ['saas_dashboard', 'job_posting', 'how_it_works', 'case_study_result', 'infographic_stat', 'feature_matrix'],
    },
    food: {
        high: ['macro_detail', 'product_in_action', 'flatlay_aesthetic', 'ingredient_spotlight', 'ugc_selfie', 'seasonal_moment', 'customer_review_card'],
        medium: ['before_after_split', 'step_by_step_guide', 'did_you_know', 'mood_board_aesthetic', 'aspirational_lifestyle', 'tip_of_the_day'],
        low: ['saas_dashboard', 'job_posting', 'feature_callout', 'us_vs_them_grid', 'case_study_result', 'feature_matrix'],
    },
    tech: {
        high: ['feature_callout', 'product_hero', 'us_vs_them_grid', 'saas_dashboard', 'infographic_stat', 'size_comparison', 'product_ecosystem', 'how_it_works'],
        medium: ['step_by_step_guide', 'expert_endorsement', 'bold_claim', 'price_comparison', 'aesthetic_gradient', 'feature_matrix'],
        low: ['ugc_selfie', 'flatlay_aesthetic', 'seasonal_moment', 'mood_board_aesthetic', 'packaging_showcase'],
    },
    recruiting: {
        high: ['job_posting', 'team_culture', 'open_positions_grid', 'employer_perks', 'company_values', 'benefit_checklist', 'identity_statement'],
        medium: ['social_numbers', 'bold_claim', 'community_wall', 'day_in_the_life', 'aspirational_lifestyle'],
        low: ['flash_sale_explosion', 'before_after_split', 'packaging_showcase', 'countdown_timer', 'bundle_value_stack'],
    },
    luxury: {
        high: ['product_hero', 'macro_detail', 'packaging_showcase', 'aspirational_lifestyle', 'limited_edition', 'aesthetic_gradient', 'emotional_moment', 'dream_scenario'],
        medium: ['360_product_view', 'mood_board_aesthetic', 'expert_endorsement', 'award_certification', 'identity_statement'],
        low: ['flash_sale_explosion', 'meme_remix', 'ugc_selfie', 'price_comparison', 'starter_pack', 'countdown_timer'],
    },
    health: {
        high: ['expert_endorsement', 'infographic_stat', 'ingredient_spotlight', 'before_after_split', 'customer_review_card', 'did_you_know', 'ingredient_science'],
        medium: ['benefit_checklist', 'step_by_step_guide', 'transformation_timeline', 'social_numbers', 'how_it_works', 'faq_answer'],
        low: ['meme_remix', 'flash_sale_explosion', 'starter_pack', 'bold_claim', 'aesthetic_gradient'],
    },
    education: {
        high: ['step_by_step_guide', 'infographic_stat', 'transformation_timeline', 'case_study_result', 'benefit_checklist', 'expert_endorsement', 'did_you_know', 'carousel_teaser'],
        medium: ['social_numbers', 'customer_review_card', 'how_it_works', 'identity_statement', 'pov_first_person', 'faq_answer'],
        low: ['flash_sale_explosion', 'flatlay_aesthetic', 'packaging_showcase', 'macro_detail', 'meme_remix'],
    },
    agency: {
        high: ['case_study_result', 'us_vs_them_grid', 'social_numbers', 'bold_claim', 'infographic_stat', 'expert_endorsement', 'customer_review_card', 'feature_matrix'],
        medium: ['before_after_split', 'step_by_step_guide', 'team_culture', 'benefit_checklist', 'price_comparison'],
        low: ['ugc_selfie', 'flatlay_aesthetic', 'seasonal_moment', 'packaging_showcase', 'starter_pack'],
    },
};

// ═══════════════════════════════════════════════════════════════
// SCORING WEIGHTS
// ═══════════════════════════════════════════════════════════════
const WEIGHTS = {
    industryHigh: 10,
    industryMedium: 5,
    industryLow: -5,
    industryNone: 2,         // archetypes not mentioned in industry → neutral
    funnelMatch: 8,
    funnelMismatch: -3,
    goalBonus: 4,
};

// Goal → archetype category affinity
const GOAL_CATEGORY_BOOST = {
    awareness: ['emotional', 'viral', 'format_specific'],
    conversion: ['urgency', 'comparison', 'social_proof'],
    retargeting: ['social_proof', 'urgency', 'educational'],
    engagement: ['viral', 'emotional', 'format_specific'],
    recruiting: ['recruiting'],
};

// ═══════════════════════════════════════════════════════════════
// MAIN SELECTOR — selectAdaptiveTriple
// ═══════════════════════════════════════════════════════════════

/**
 * Select 3 diverse archetype+layout+hook combos based on context.
 * Enforces cross-category diversity: 3 from 3 different categories.
 * 
 * @param {Object} context
 * @param {string} context.industry - Industry key (ecommerce, saas, beauty, etc.)
 * @param {string} [context.funnelStage='tof'] - tof / mof / bof
 * @param {string} [context.goal='conversion'] - awareness / conversion / retargeting
 * @param {string} [context.audience] - Target audience description
 * @param {string} [context.productType] - Type of product
 * @param {string} [context.format='square'] - square / portrait / story
 * @returns {Array<{archetype, layout, hook}>} 3 variant configs
 */
export function selectAdaptiveTriple(context) {
    const {
        industry = 'ecommerce',
        funnelStage = 'tof',
        goal = 'conversion',
        format = 'square',
    } = context;

    // 1. Score all archetypes
    const scored = scoreArchetypes(industry, funnelStage, goal);

    // 2. Pick top 3 from 3 different categories
    const selected = pickDiverseTop3(scored);

    // 3. For each selected archetype, pick best layout + hook
    return selected.map(({ archetype, score }) => {
        const layout = pickBestLayout(archetype, format);
        const hook = pickBestHook(archetype, funnelStage);

        return {
            archetype,
            layout,
            hook,
            score,
            meta: {
                archetypeKey: archetype.key,
                category: archetype.category,
                layoutKey: layout,
                hookKey: hook.key,
                funnelStage,
                industry,
            },
        };
    });
}

// ═══════════════════════════════════════════════════════════════
// SCORING ENGINE
// ═══════════════════════════════════════════════════════════════

function scoreArchetypes(industry, funnelStage, goal) {
    const matrix = INDUSTRY_MATRIX[industry] || INDUSTRY_MATRIX.ecommerce;
    const goalBoostCategories = GOAL_CATEGORY_BOOST[goal] || [];

    return AD_ARCHETYPES.map(archetype => {
        let score = 0;

        // Industry weight
        if (matrix.high.includes(archetype.key)) {
            score += WEIGHTS.industryHigh;
        } else if (matrix.medium.includes(archetype.key)) {
            score += WEIGHTS.industryMedium;
        } else if (matrix.low.includes(archetype.key)) {
            score += WEIGHTS.industryLow;
        } else {
            score += WEIGHTS.industryNone;
        }

        // Funnel stage match
        if (archetype.funnelStages.includes(funnelStage)) {
            score += WEIGHTS.funnelMatch;
        } else {
            score += WEIGHTS.funnelMismatch;
        }

        // Goal category boost
        if (goalBoostCategories.includes(archetype.category)) {
            score += WEIGHTS.goalBonus;
        }

        // Small random jitter (0-3) for variety between generations
        score += Math.random() * 3;

        return { archetype, score };
    }).sort((a, b) => b.score - a.score);
}

// ═══════════════════════════════════════════════════════════════
// DIVERSITY ENFORCEMENT
// ═══════════════════════════════════════════════════════════════

/**
 * Pick top 3 archetypes from 3 DIFFERENT categories.
 * Walks the sorted list, skips archetypes from already-used categories.
 */
function pickDiverseTop3(scored) {
    const result = [];
    const usedCategories = new Set();

    for (const item of scored) {
        if (result.length >= 3) break;

        // Enforce cross-category diversity
        if (!usedCategories.has(item.archetype.category)) {
            result.push(item);
            usedCategories.add(item.archetype.category);
        }
    }

    // Fallback: if we couldn't find 3 different categories (unlikely), fill with top remaining
    if (result.length < 3) {
        for (const item of scored) {
            if (result.length >= 3) break;
            if (!result.includes(item)) {
                result.push(item);
            }
        }
    }

    return result;
}

// ═══════════════════════════════════════════════════════════════
// LAYOUT + HOOK SELECTION
// ═══════════════════════════════════════════════════════════════

/**
 * Pick the best layout for this archetype + format.
 * If archetype has preferred layouts, pick randomly from those.
 * Otherwise, return a generic layout.
 */
function pickBestLayout(archetype, format) {
    const preferred = archetype.preferredLayouts || [];

    if (preferred.length > 0) {
        // Random from preferred (they're already ranked)
        return preferred[Math.floor(Math.random() * Math.min(preferred.length, 3))];
    }

    // Format-specific fallbacks
    const formatDefaults = {
        square: 'split_panel',
        portrait: 'full_bleed',
        story: 'bold_typographic',
    };
    return formatDefaults[format] || 'split_panel';
}

/**
 * Pick the best hook for this archetype + funnel stage.
 * Prefers hooks from archetype's hookAffinity that match the funnel stage.
 */
function pickBestHook(archetype, funnelStage) {
    const affinity = archetype.hookAffinity || [];
    const funnelHooks = HOOKS_BY_FUNNEL[funnelStage] || HOOK_TYPES;

    // Prefer hooks that match BOTH affinity AND funnel stage
    const idealHooks = funnelHooks.filter(h => affinity.includes(h.key));
    if (idealHooks.length > 0) {
        return idealHooks[Math.floor(Math.random() * idealHooks.length)];
    }

    // Fallback: any hook from the funnel stage
    if (funnelHooks.length > 0) {
        return funnelHooks[Math.floor(Math.random() * funnelHooks.length)];
    }

    // Ultimate fallback
    return HOOK_TYPES[0];
}

// ═══════════════════════════════════════════════════════════════
// UTILITY EXPORTS
// ═══════════════════════════════════════════════════════════════

/**
 * Get the archetype index in AD_ARCHETYPES for forced generation.
 */
export function getArchetypeIndex(key) {
    return AD_ARCHETYPES.findIndex(a => a.key === key);
}

/**
 * Map industry string to closest known industry key.
 */
export function resolveIndustryForSelector(raw) {
    if (!raw) return 'ecommerce';
    const lower = raw.toLowerCase().replace(/[^a-z]/g, '');

    const aliases = {
        ecommerce: ['ecommerce', 'shop', 'store', 'onlineshop', 'retail', 'dtc'],
        saas: ['saas', 'software', 'app', 'platform', 'tool'],
        beauty: ['beauty', 'cosmetics', 'skincare', 'makeup', 'pflege'],
        fitness: ['fitness', 'sport', 'gym', 'training', 'workout'],
        fashion: ['fashion', 'mode', 'clothing', 'bekleidung', 'schmuck', 'jewelry'],
        food: ['food', 'essen', 'nahrung', 'drinks', 'beverage', 'restaurant'],
        tech: ['tech', 'technology', 'gadgets', 'electronics', 'hardware'],
        recruiting: ['recruiting', 'hr', 'jobs', 'karriere', 'career', 'hiring'],
        luxury: ['luxury', 'luxus', 'premium', 'highend'],
        health: ['health', 'gesundheit', 'supplements', 'wellness', 'medical', 'pharma'],
        education: ['education', 'bildung', 'kurs', 'course', 'training', 'coaching'],
        agency: ['agency', 'agentur', 'consulting', 'beratung', 'marketing'],
    };

    for (const [key, terms] of Object.entries(aliases)) {
        if (terms.some(t => lower.includes(t))) return key;
    }
    return 'ecommerce';
}

export { INDUSTRY_MATRIX };

export default {
    selectAdaptiveTriple,
    getArchetypeIndex,
    resolveIndustryForSelector,
    INDUSTRY_MATRIX,
};
