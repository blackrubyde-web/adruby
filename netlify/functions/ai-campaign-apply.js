import {
    badRequest,
    methodNotAllowed,
    ok,
    serverError,
    withCors
} from './utils/response.js';
import { initTelemetry, captureException } from './utils/telemetry.js';
import { requireUserId } from './_shared/auth.js';
import { requireActiveSubscription } from './_shared/entitlements.js';
import { supabaseAdmin } from './_shared/clients.js';

const RECOMMENDATION_TO_ACTION = {
    kill: 'pause',
    duplicate: 'duplicate',
    increase: 'increase',
    decrease: 'decrease'
};

export async function handler(event) {
    if (event.httpMethod === 'OPTIONS') return withCors({ statusCode: 204, body: '' });
    if (event.httpMethod !== 'POST') return methodNotAllowed('POST,OPTIONS');

    initTelemetry();

    const auth = await requireUserId(event);
    if (!auth.ok) return auth.response;
    const userId = auth.userId;

    const entitlement = await requireActiveSubscription(userId);
    if (!entitlement.ok) return entitlement.response;

    let payload = {};
    try {
        payload = JSON.parse(event.body || '{}');
    } catch {
        return badRequest('Invalid JSON payload');
    }

    const { analyses } = payload;
    if (!Array.isArray(analyses) || analyses.length === 0) {
        return badRequest('No analyses provided');
    }

    const host = event.headers?.host || event.headers?.Host || 'localhost:8888';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    const authHeader = event.headers?.authorization || event.headers?.Authorization || null;

    const results = [];
    for (const analysis of analyses) {
        const { campaignId, recommendation, confidence, reason } = analysis || {};
        const action = RECOMMENDATION_TO_ACTION[String(recommendation || '').toLowerCase()] || null;
        if (!campaignId || !action) continue;

        let applyJson = null;
        let success = false;
        try {
            const applyRes = await fetch(`${baseUrl}/.netlify/functions/meta-apply-action`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authHeader ? { Authorization: authHeader } : {})
                },
                body: JSON.stringify({ campaignId, action, scalePct: undefined })
            });
            applyJson = await applyRes.json();
            success = applyRes.ok && applyJson?.ok;
        } catch (err) {
            applyJson = { error: err?.message || 'Apply failed' };
            success = false;
        }

        try {
            await supabaseAdmin.from('ai_learning').insert({
                campaign_id: campaignId,
                recommendation,
                confidence: Number.isFinite(confidence) ? Math.round(confidence) : 0,
                reason: reason || null,
                applied_action: action,
                success,
                created_at: new Date().toISOString()
            });
        } catch (err) {
            console.warn('[AI Apply] Failed to log ai_learning', err?.message || err);
        }

        results.push({ campaignId, recommendation, action, success, applyResponse: applyJson });
    }

    return ok({ results });
}
