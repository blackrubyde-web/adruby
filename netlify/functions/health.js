/**
 * Health check endpoint
 * Returns service status for monitoring and alerting
 */

import { supabaseAdmin } from './_shared/clients.js';
import { withCors } from './utils/response.js';

export async function handler(event) {
    const headers = {
        'Access-Control-Allow-Origin': process.env.FRONTEND_URL || 'https://adruby.de',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers };
    }

    const checks = {};
    let healthy = true;

    // Check Supabase connectivity
    try {
        const start = Date.now();
        const { error } = await supabaseAdmin
            .from('user_profiles')
            .select('id', { count: 'exact', head: true })
            .limit(1);
        checks.supabase = {
            status: error ? 'degraded' : 'ok',
            latencyMs: Date.now() - start,
        };
        if (error) healthy = false;
    } catch (err) {
        checks.supabase = { status: 'down', error: err.message };
        healthy = false;
    }

    // Check environment variables
    const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'OPENAI_API_KEY', 'STRIPE_SECRET_KEY'];
    const missingEnv = requiredEnvVars.filter(key => !process.env[key]);
    checks.environment = {
        status: missingEnv.length === 0 ? 'ok' : 'degraded',
        missing: missingEnv.length,
    };
    if (missingEnv.length > 0) healthy = false;

    return {
        statusCode: healthy ? 200 : 503,
        headers,
        body: JSON.stringify({
            status: healthy ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            version: process.env.DEPLOY_ID || 'local',
            checks,
        }),
    };
}
