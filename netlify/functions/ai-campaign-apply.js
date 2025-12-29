// netlify/functions/ai-campaign-apply.js
// Receives AI analysis results and applies recommended actions to Meta via the existing meta-apply-action endpoint.
// Also logs each action to Supabase for future learning.

const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

// Supabase client – assumes env vars are set (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

exports.handler = async function (event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    let payload;
    try {
        payload = JSON.parse(event.body);
    } catch (e) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON payload' }) };
    }

    const { analyses } = payload;
    if (!Array.isArray(analyses) || analyses.length === 0) {
        return { statusCode: 400, body: JSON.stringify({ error: 'No analyses provided' }) };
    }

    const results = [];
    for (const analysis of analyses) {
        const { campaignId, recommendation, confidence, reason } = analysis;
        // Map AI recommendation to Meta action
        let action;
        switch (recommendation) {
            case 'kill':
                action = 'pause';
                break;
            case 'duplicate':
                action = 'duplicate';
                break;
            case 'increase':
                action = 'increase';
                break;
            case 'decrease':
                action = 'decrease';
                break;
            default:
                action = null;
        }
        if (!action) continue;

        // Call existing meta-apply-action Netlify function with proper URL
        const host = event.headers.host || event.headers.Host || 'localhost:8888';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const baseUrl = `${protocol}://${host}`;

        const applyRes = await fetch(`${baseUrl}/.netlify/functions/meta-apply-action`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Forward auth if present
                ...(event.headers.authorization && { 'Authorization': event.headers.authorization })
            },
            body: JSON.stringify({ campaignId, action, scalePct: undefined })
        });
        const applyJson = await applyRes.json();
        const success = applyRes.ok && applyJson.ok;

        // Log learning data
        await supabase.from('ai_learning').insert({
            campaign_id: campaignId,
            recommendation,
            confidence,
            reason,
            applied_action: action,
            success,
            created_at: new Date().toISOString()
        });

        results.push({ campaignId, recommendation, action, success, applyResponse: applyJson });
    }

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST' },
        body: JSON.stringify({ results })
    };
};
