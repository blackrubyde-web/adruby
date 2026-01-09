/**
 * Meta Audiences Endpoint
 * Fetches custom audiences from Meta Business Account
 */

import {
    badRequest,
    methodNotAllowed,
    ok,
    serverError,
    withCors
} from './utils/response.js';
import { initTelemetry, captureException } from './utils/telemetry.js';
import { requireUserId } from './_shared/auth.js';
import { fetchGraph, pickPrimaryAdAccount, resolveMetaAccessToken } from './_shared/meta.js';

function mapSubtype(subtype?: string) {
    const value = String(subtype || '').toLowerCase();
    if (value.includes('website')) return 'website';
    if (value.includes('custom')) return 'customer_list';
    if (value.includes('engagement')) return 'engagement';
    if (value.includes('app')) return 'app_activity';
    if (value.includes('offline')) return 'offline_activity';
    return 'engagement';
}

function mapStatus(status?: string) {
    const value = String(status || '').toLowerCase();
    if (value.includes('populating') || value.includes('processing')) return 'populating';
    if (value.includes('ready')) return 'ready';
    return 'ready';
}

export async function handler(event: any) {
    if (event.httpMethod === 'OPTIONS') return withCors({ statusCode: 200 });
    if (event.httpMethod !== 'GET') return methodNotAllowed('GET,OPTIONS');

    initTelemetry();

    const auth = await requireUserId(event);
    if (!auth.ok) return auth.response;
    const userId = auth.userId;

    try {
        const { token, connection } = await resolveMetaAccessToken(userId);
        if (!token) {
            return badRequest('Meta nicht verbunden. Bitte zuerst Meta verknüpfen.');
        }

        const meta = connection?.meta || {};
        const accounts = Array.isArray(meta?.ad_accounts) ? meta.ad_accounts : [];
        const primary = pickPrimaryAdAccount(accounts, connection?.ad_account_id || meta?.selected_account?.id);
        const adAccountId = connection?.ad_account_id || meta?.selected_account?.id || primary?.id;

        if (!adAccountId) {
            return badRequest('Kein Ad Account gefunden. Bitte in Einstellungen konfigurieren.');
        }

        const actId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
        const response = await fetchGraph(`/${actId}/customaudiences`, token, {
            fields: 'id,name,subtype,approximate_count,delivery_status,description',
            limit: '100'
        });

        const audiences = (response?.data || []).map((aud: any) => ({
            id: aud.id,
            name: aud.name,
            type: mapSubtype(aud.subtype),
            size: Number(aud.approximate_count || 0),
            status: mapStatus(aud.delivery_status),
            description: aud.description || null
        }));

        return ok({ success: true, audiences });
    } catch (error: any) {
        captureException(error, { function: 'meta-audiences' });
        return serverError(error?.message || 'Meta audiences failed');
    }
}
