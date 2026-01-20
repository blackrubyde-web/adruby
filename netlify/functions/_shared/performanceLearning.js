/**
 * PERFORMANCE LEARNING ENGINE
 * 
 * Learns from ad performance data to improve future generations.
 * Tracks what works: headlines, CTAs, layouts, color palettes, etc.
 * 
 * Meta 2026 Level: AI that gets smarter with every ad.
 */

import { supabaseAdmin } from './clients.js';

// ============================================================
// PERFORMANCE WEIGHTS - What we track
// ============================================================

const TRACKED_DIMENSIONS = {
    headline_formula: { weight: 0.25 },  // Which headline formulas work
    cta_style: { weight: 0.15 },         // Which CTA styles convert
    color_palette: { weight: 0.15 },     // Which palettes perform
    layout: { weight: 0.15 },            // Which layouts engage
    industry: { weight: 0.10 },          // Industry-specific patterns
    effects: { weight: 0.10 },           // Visual effects impact
    text_position: { weight: 0.10 }      // Text placement patterns
};

// ============================================================
// PERFORMANCE TRACKING
// ============================================================

/**
 * Record ad performance for learning
 */
export async function recordAdPerformance(adId, performanceData) {
    const {
        impressions = 0,
        clicks = 0,
        conversions = 0,
        spend = 0,
        // Creative metadata
        headlineFormula,
        ctaStyle,
        colorPalette,
        layout,
        industry,
        effects = [],
        textPosition
    } = performanceData;

    // Calculate key metrics
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const cvr = clicks > 0 ? (conversions / clicks) * 100 : 0;
    const cpc = clicks > 0 ? spend / clicks : 0;
    const cpa = conversions > 0 ? spend / conversions : 0;
    const roas = spend > 0 ? (conversions * 50) / spend : 0; // Assuming $50 avg value

    // Performance score (0-100)
    const performanceScore = calculatePerformanceScore({ ctr, cvr, roas });

    try {
        // Insert into performance tracking table
        await supabaseAdmin.from('ad_performance_learning').insert({
            ad_id: adId,
            impressions,
            clicks,
            conversions,
            spend,
            ctr,
            cvr,
            cpc,
            cpa,
            roas,
            performance_score: performanceScore,
            // Creative dimensions for learning
            headline_formula: headlineFormula,
            cta_style: ctaStyle,
            color_palette: colorPalette,
            layout,
            industry,
            effects,
            text_position: textPosition,
            recorded_at: new Date().toISOString()
        });

        console.log(`[PerformanceLearning] Recorded performance for ad ${adId}: Score ${performanceScore}`);

        // Update aggregated insights
        await updateAggregatedInsights({
            headlineFormula,
            ctaStyle,
            colorPalette,
            layout,
            industry,
            effects,
            textPosition,
            performanceScore
        });

        return { success: true, performanceScore };
    } catch (error) {
        console.error('[PerformanceLearning] Failed to record:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Calculate performance score (0-100)
 */
function calculatePerformanceScore({ ctr, cvr, roas }) {
    // Weights for each metric
    const ctrScore = Math.min(ctr * 10, 40);  // Max 40 points (4% CTR = max)
    const cvrScore = Math.min(cvr * 5, 30);   // Max 30 points (6% CVR = max)
    const roasScore = Math.min(roas * 10, 30); // Max 30 points (3x ROAS = max)

    return Math.round(ctrScore + cvrScore + roasScore);
}

/**
 * Update aggregated insights for learning
 */
async function updateAggregatedInsights(dimensions) {
    const {
        headlineFormula,
        ctaStyle,
        colorPalette,
        layout,
        industry,
        performanceScore
    } = dimensions;

    // Update each dimension's aggregate score
    const updates = [];

    if (headlineFormula) {
        updates.push(updateDimensionScore('headline_formula', headlineFormula, performanceScore));
    }
    if (ctaStyle) {
        updates.push(updateDimensionScore('cta_style', ctaStyle, performanceScore));
    }
    if (colorPalette) {
        updates.push(updateDimensionScore('color_palette', colorPalette, performanceScore));
    }
    if (layout) {
        updates.push(updateDimensionScore('layout', layout, performanceScore));
    }
    if (industry) {
        updates.push(updateDimensionScore('industry', industry, performanceScore));
    }

    await Promise.all(updates);
}

/**
 * Update a single dimension's aggregate score
 */
async function updateDimensionScore(dimension, value, score) {
    try {
        // Upsert into insights table
        const { data: existing } = await supabaseAdmin
            .from('ad_creative_insights')
            .select('*')
            .eq('dimension', dimension)
            .eq('value', value)
            .single();

        if (existing) {
            // Update with exponential moving average
            const alpha = 0.3; // Learning rate
            const newScore = alpha * score + (1 - alpha) * existing.avg_score;
            const newCount = existing.sample_count + 1;

            await supabaseAdmin
                .from('ad_creative_insights')
                .update({
                    avg_score: newScore,
                    sample_count: newCount,
                    last_updated: new Date().toISOString()
                })
                .eq('id', existing.id);
        } else {
            // Insert new
            await supabaseAdmin.from('ad_creative_insights').insert({
                dimension,
                value,
                avg_score: score,
                sample_count: 1,
                created_at: new Date().toISOString(),
                last_updated: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error(`[PerformanceLearning] Failed to update ${dimension}:`, error.message);
    }
}

// ============================================================
// LEARNING RECOMMENDATIONS
// ============================================================

/**
 * Get recommendations based on learned performance
 */
export async function getLearnedRecommendations(context = {}) {
    const { industry, goal } = context;

    try {
        // Fetch top performers for each dimension
        const recommendations = {};

        for (const dimension of Object.keys(TRACKED_DIMENSIONS)) {
            let query = supabaseAdmin
                .from('ad_creative_insights')
                .select('*')
                .eq('dimension', dimension)
                .gte('sample_count', 5) // Minimum samples for confidence
                .order('avg_score', { ascending: false })
                .limit(3);

            // Filter by industry if applicable
            if (industry && dimension === 'industry') {
                query = query.eq('value', industry);
            }

            const { data, error } = await query;

            if (!error && data?.length > 0) {
                recommendations[dimension] = data.map(d => ({
                    value: d.value,
                    score: d.avg_score,
                    confidence: Math.min(d.sample_count / 20, 1) // Max confidence at 20 samples
                }));
            }
        }

        return {
            success: true,
            recommendations,
            generated_at: new Date().toISOString()
        };
    } catch (error) {
        console.error('[PerformanceLearning] Failed to get recommendations:', error.message);
        return { success: false, error: error.message, recommendations: {} };
    }
}

/**
 * Get optimized creative config based on learning
 */
export async function getOptimizedCreativeConfig(context = {}) {
    const { industry, goal, language = 'de' } = context;

    const { recommendations } = await getLearnedRecommendations({ industry, goal });

    // Build optimized config from top performers
    const optimizedConfig = {
        suggestedPalette: recommendations.color_palette?.[0]?.value || 'premium',
        suggestedLayout: recommendations.layout?.[0]?.value || 'hero_features_right',
        suggestedHeadlineFormula: recommendations.headline_formula?.[0]?.value || 'number_benefit_time',
        suggestedCtaStyle: recommendations.cta_style?.[0]?.value || 'urgency',
        suggestedTextPosition: recommendations.text_position?.[0]?.value || 'bottom',
        confidence: calculateOverallConfidence(recommendations),
        source: 'performance_learning_engine'
    };

    console.log('[PerformanceLearning] Optimized config:', optimizedConfig);

    return optimizedConfig;
}

/**
 * Calculate overall confidence in recommendations
 */
function calculateOverallConfidence(recommendations) {
    let totalConfidence = 0;
    let count = 0;

    for (const dimension of Object.values(recommendations)) {
        if (dimension?.[0]?.confidence) {
            totalConfidence += dimension[0].confidence * TRACKED_DIMENSIONS[Object.keys(recommendations).find(k => recommendations[k] === dimension)]?.weight || 0.1;
            count++;
        }
    }

    return count > 0 ? Math.round((totalConfidence / count) * 100) : 0;
}

// ============================================================
// PERFORMANCE SUMMARY
// ============================================================

/**
 * Get performance summary for dashboard
 */
export async function getPerformanceSummary(userId = null) {
    try {
        let query = supabaseAdmin
            .from('ad_performance_learning')
            .select('*')
            .order('recorded_at', { ascending: false })
            .limit(100);

        if (userId) {
            // Would need to join with generated_creatives to filter by user
        }

        const { data, error } = await query;

        if (error) throw error;

        // Calculate summary statistics
        const summary = {
            totalAds: data?.length || 0,
            avgCTR: 0,
            avgCVR: 0,
            avgROAS: 0,
            avgPerformanceScore: 0,
            topPalette: null,
            topLayout: null,
            topHeadlineFormula: null
        };

        if (data?.length > 0) {
            summary.avgCTR = data.reduce((sum, d) => sum + (d.ctr || 0), 0) / data.length;
            summary.avgCVR = data.reduce((sum, d) => sum + (d.cvr || 0), 0) / data.length;
            summary.avgROAS = data.reduce((sum, d) => sum + (d.roas || 0), 0) / data.length;
            summary.avgPerformanceScore = data.reduce((sum, d) => sum + (d.performance_score || 0), 0) / data.length;

            // Find top performers
            const paletteScores = {};
            const layoutScores = {};

            data.forEach(d => {
                if (d.color_palette) {
                    paletteScores[d.color_palette] = (paletteScores[d.color_palette] || 0) + d.performance_score;
                }
                if (d.layout) {
                    layoutScores[d.layout] = (layoutScores[d.layout] || 0) + d.performance_score;
                }
            });

            summary.topPalette = Object.entries(paletteScores).sort((a, b) => b[1] - a[1])[0]?.[0];
            summary.topLayout = Object.entries(layoutScores).sort((a, b) => b[1] - a[1])[0]?.[0];
        }

        return { success: true, summary };
    } catch (error) {
        console.error('[PerformanceLearning] Failed to get summary:', error.message);
        return { success: false, error: error.message };
    }
}

export default {
    recordAdPerformance,
    getLearnedRecommendations,
    getOptimizedCreativeConfig,
    getPerformanceSummary,
    TRACKED_DIMENSIONS
};
