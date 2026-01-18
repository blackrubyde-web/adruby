// netlify/functions/ai-learning-memory.js
// AI Learning Memory API - Stores and retrieves decision history for learning

import { createClient } from '@supabase/supabase-js';
import { requireUserId } from './_shared/auth.js';
import { badRequest, methodNotAllowed, ok, serverError, withCors } from './utils/response.js';

const supabase = createClient(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

export async function handler(event) {
    if (event.httpMethod === 'OPTIONS') {
        return withCors({ statusCode: 204, body: '' });
    }

    try {
        const auth = await requireUserId(event);
        if (!auth.ok) return auth.response;
        const userId = auth.userId;

        // GET: Retrieve learning data
        if (event.httpMethod === 'GET') {
            const params = event.queryStringParameters || {};
            const action = params.action || 'history';

            switch (action) {
                case 'history':
                    return await getDecisionHistory(userId, params);
                case 'patterns':
                    return await getUserPatterns(userId);
                case 'profile':
                    return await getUserProfile(userId);
                case 'stats':
                    return await getLearningStats(userId);
                default:
                    return badRequest('Invalid action');
            }
        }

        // POST: Store new data
        if (event.httpMethod === 'POST') {
            let body;
            try {
                body = JSON.parse(event.body);
            } catch {
                return badRequest('Invalid JSON body');
            }

            const { action } = body;

            switch (action) {
                case 'record_decision':
                    return await recordDecision(userId, body);
                case 'record_outcome':
                    return await recordOutcome(userId, body);
                case 'update_profile':
                    return await updateProfile(userId, body);
                case 'add_pattern':
                    return await addPattern(userId, body);
                case 'trigger_pattern':
                    return await triggerPattern(userId, body);
                default:
                    return badRequest('Invalid action');
            }
        }

        return methodNotAllowed('GET,POST,OPTIONS');

    } catch (error) {
        console.error('[ai-learning-memory] Error:', error);
        return serverError(error.message);
    }
}

// ============================================
// GET Operations
// ============================================

async function getDecisionHistory(userId, params = {}) {
    const limit = parseInt(params.limit) || 100;
    const campaignId = params.campaignId;
    const decisionType = params.decisionType;

    let query = supabase
        .from('ai_decision_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (campaignId) {
        query = query.eq('campaign_id', campaignId);
    }
    if (decisionType) {
        query = query.eq('decision_type', decisionType);
    }

    const { data, error } = await query;

    if (error) {
        console.error('[getDecisionHistory] Error:', error);
        return serverError(error.message);
    }

    return ok({ success: true, history: data || [] });
}

async function getUserPatterns(userId) {
    const { data, error } = await supabase
        .from('ai_patterns')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('confidence', { ascending: false });

    if (error) {
        console.error('[getUserPatterns] Error:', error);
        return serverError(error.message);
    }

    return ok({ success: true, patterns: data || [] });
}

async function getUserProfile(userId) {
    const { data, error } = await supabase
        .from('ai_user_profile')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') { // Not found is ok
        console.error('[getUserProfile] Error:', error);
        return serverError(error.message);
    }

    // If no profile exists, return defaults
    const profile = data || {
        user_id: userId,
        primary_industry: 'ecom_d2c',
        avg_roas: 0,
        avg_ctr: 0,
        avg_cpc: 0,
        total_decisions: 0,
        decisions_executed: 0,
        decisions_successful: 0,
        success_rate: 0,
        campaigns_analyzed: 0,
    };

    return ok({ success: true, profile });
}

async function getLearningStats(userId) {
    // Get decision stats
    const { data: decisions, error: decError } = await supabase
        .from('ai_decision_history')
        .select('decision_type, was_executed, was_successful, confidence')
        .eq('user_id', userId);

    if (decError) {
        console.error('[getLearningStats] Error:', decError);
        return serverError(decError.message);
    }

    // Get pattern stats
    const { data: patterns, error: patError } = await supabase
        .from('ai_patterns')
        .select('pattern_type, success_rate, occurrences')
        .eq('user_id', userId)
        .eq('is_active', true);

    if (patError) {
        console.error('[getLearningStats] Patterns Error:', patError);
    }

    // Calculate stats
    const totalDecisions = decisions?.length || 0;
    const executedDecisions = decisions?.filter(d => d.was_executed).length || 0;
    const successfulDecisions = decisions?.filter(d => d.was_successful).length || 0;
    const avgConfidence = totalDecisions > 0
        ? decisions.reduce((s, d) => s + d.confidence, 0) / totalDecisions
        : 0;

    // Decision type breakdown
    const decisionBreakdown = {};
    decisions?.forEach(d => {
        decisionBreakdown[d.decision_type] = (decisionBreakdown[d.decision_type] || 0) + 1;
    });

    // Pattern type breakdown
    const patternBreakdown = {};
    patterns?.forEach(p => {
        patternBreakdown[p.pattern_type] = (patternBreakdown[p.pattern_type] || 0) + 1;
    });

    return ok({
        success: true,
        stats: {
            totalDecisions,
            executedDecisions,
            successfulDecisions,
            executionRate: totalDecisions > 0 ? (executedDecisions / totalDecisions * 100).toFixed(1) : 0,
            successRate: executedDecisions > 0 ? (successfulDecisions / executedDecisions * 100).toFixed(1) : 0,
            avgConfidence: avgConfidence.toFixed(1),
            decisionBreakdown,
            patternCount: patterns?.length || 0,
            patternBreakdown,
        }
    });
}

// ============================================
// POST Operations
// ============================================

async function recordDecision(userId, body) {
    const {
        campaignId,
        campaignName,
        decisionType,
        decisionValue,
        confidence,
        reasoning,
        scores,
        metricsAtDecision,
        industryType = 'ecom_d2c',
        wasExecuted = false,
    } = body;

    if (!campaignId || !decisionType || confidence === undefined) {
        return badRequest('Missing required fields: campaignId, decisionType, confidence');
    }

    const { data, error } = await supabase
        .from('ai_decision_history')
        .insert({
            user_id: userId,
            campaign_id: campaignId,
            campaign_name: campaignName || campaignId,
            decision_type: decisionType,
            decision_value: decisionValue,
            confidence,
            reasoning,
            scores: scores || {},
            metrics_at_decision: metricsAtDecision || {},
            industry_type: industryType,
            was_executed: wasExecuted,
        })
        .select()
        .single();

    if (error) {
        console.error('[recordDecision] Error:', error);
        return serverError(error.message);
    }

    // Update user profile stats
    await updateDecisionStats(userId);

    return ok({ success: true, decision: data });
}

async function recordOutcome(userId, body) {
    const {
        decisionId,
        outcomeRoas,
        outcomeCtr,
        outcomeSpend,
        wasSuccessful,
        notes,
    } = body;

    if (!decisionId || wasSuccessful === undefined) {
        return badRequest('Missing required fields: decisionId, wasSuccessful');
    }

    const { data, error } = await supabase
        .from('ai_decision_history')
        .update({
            outcome_roas: outcomeRoas,
            outcome_ctr: outcomeCtr,
            outcome_spend: outcomeSpend,
            was_successful: wasSuccessful,
            outcome_notes: notes,
            outcome_measured_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', decisionId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) {
        console.error('[recordOutcome] Error:', error);
        return serverError(error.message);
    }

    // Update success stats
    await updateDecisionStats(userId);

    // If decision was successful/unsuccessful, update related patterns
    await updatePatternFromOutcome(userId, data);

    return ok({ success: true, decision: data });
}

async function updateProfile(userId, body) {
    const {
        primaryIndustry,
        avgRoas,
        avgCtr,
        avgCpc,
        campaignsAnalyzed,
    } = body;

    const updates = {
        updated_at: new Date().toISOString(),
        last_analysis_at: new Date().toISOString(),
    };

    if (primaryIndustry) updates.primary_industry = primaryIndustry;
    if (avgRoas !== undefined) updates.avg_roas = avgRoas;
    if (avgCtr !== undefined) updates.avg_ctr = avgCtr;
    if (avgCpc !== undefined) updates.avg_cpc = avgCpc;
    if (campaignsAnalyzed !== undefined) updates.campaigns_analyzed = campaignsAnalyzed;

    const { data, error } = await supabase
        .from('ai_user_profile')
        .upsert({
            user_id: userId,
            ...updates,
        }, { onConflict: 'user_id' })
        .select()
        .single();

    if (error) {
        console.error('[updateProfile] Error:', error);
        return serverError(error.message);
    }

    return ok({ success: true, profile: data });
}

async function addPattern(userId, body) {
    const {
        patternType,
        patternName,
        description,
        conditions,
        successRate = 0.5,
        confidence = 0.5,
    } = body;

    if (!patternType || !patternName) {
        return badRequest('Missing required fields: patternType, patternName');
    }

    // Check if similar pattern exists
    const { data: existing } = await supabase
        .from('ai_patterns')
        .select('id, occurrences')
        .eq('user_id', userId)
        .eq('pattern_type', patternType)
        .eq('pattern_name', patternName)
        .single();

    if (existing) {
        // Update existing pattern
        const { data, error } = await supabase
            .from('ai_patterns')
            .update({
                occurrences: existing.occurrences + 1,
                last_triggered_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id)
            .select()
            .single();

        if (error) {
            console.error('[addPattern Update] Error:', error);
            return serverError(error.message);
        }

        return ok({ success: true, pattern: data, updated: true });
    }

    // Create new pattern
    const { data, error } = await supabase
        .from('ai_patterns')
        .insert({
            user_id: userId,
            pattern_type: patternType,
            pattern_name: patternName,
            description,
            conditions: conditions || {},
            success_rate: successRate,
            confidence,
        })
        .select()
        .single();

    if (error) {
        console.error('[addPattern Insert] Error:', error);
        return serverError(error.message);
    }

    return ok({ success: true, pattern: data, created: true });
}

async function triggerPattern(userId, body) {
    const { patternId, wasSuccessful } = body;

    if (!patternId || wasSuccessful === undefined) {
        return badRequest('Missing required fields: patternId, wasSuccessful');
    }

    // Get current pattern
    const { data: pattern, error: getError } = await supabase
        .from('ai_patterns')
        .select('*')
        .eq('id', patternId)
        .eq('user_id', userId)
        .single();

    if (getError || !pattern) {
        return badRequest('Pattern not found');
    }

    // Update success rate (weighted average)
    const newOccurrences = pattern.occurrences + 1;
    const newSuccessRate = (
        (pattern.success_rate * pattern.occurrences + (wasSuccessful ? 1 : 0)) / newOccurrences
    );
    const newConfidence = Math.min(0.95, pattern.confidence + (wasSuccessful ? 0.02 : -0.01));

    const { data, error } = await supabase
        .from('ai_patterns')
        .update({
            occurrences: newOccurrences,
            success_rate: newSuccessRate,
            confidence: newConfidence,
            last_triggered_at: new Date().toISOString(),
            last_success_at: wasSuccessful ? new Date().toISOString() : pattern.last_success_at,
            updated_at: new Date().toISOString(),
        })
        .eq('id', patternId)
        .select()
        .single();

    if (error) {
        console.error('[triggerPattern] Error:', error);
        return serverError(error.message);
    }

    return ok({ success: true, pattern: data });
}

// ============================================
// Helper Functions
// ============================================

async function updateDecisionStats(userId) {
    const { data: decisions } = await supabase
        .from('ai_decision_history')
        .select('was_executed, was_successful')
        .eq('user_id', userId);

    if (!decisions) return;

    const total = decisions.length;
    const executed = decisions.filter(d => d.was_executed).length;
    const successful = decisions.filter(d => d.was_successful).length;
    const successRate = executed > 0 ? successful / executed : 0;

    await supabase
        .from('ai_user_profile')
        .upsert({
            user_id: userId,
            total_decisions: total,
            decisions_executed: executed,
            decisions_successful: successful,
            success_rate: successRate,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
}

async function updatePatternFromOutcome(userId, decision) {
    // This could be enhanced to identify which pattern was relevant
    // For now, we'll just log the outcome
    console.log(`[updatePatternFromOutcome] User ${userId}: Decision ${decision.decision_type} was ${decision.was_successful ? 'successful' : 'unsuccessful'}`);
}
