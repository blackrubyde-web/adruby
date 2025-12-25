// Admin Service - API calls for admin dashboard
import { supabase } from './supabaseClient';

const API_BASE = '/.netlify/functions';

async function getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
        throw new Error('Not authenticated');
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
    };
}

async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/${endpoint}`, {
        ...options,
        headers: { ...headers, ...options.headers }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'API request failed');
    }

    return data;
}

// Types
export interface AdminUser {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string | null;
    credits: number;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    subscription_status: string | null;
    payment_verified: boolean;
    trial_status: string | null;
    trial_ends_at: string | null;
    is_affiliate: boolean;
    referred_by_code: string | null;
    created_at: string;
}

export interface AdminAffiliate {
    id: string;
    user_id: string;
    affiliate_code: string;
    is_approved: boolean;
    approved_at: string | null;
    payout_email: string | null;
    payout_method: string | null;
    total_earnings: number;
    pending_earnings: number;
    created_at: string;
    user_email: string | null;
    user_name: string | null;
    total_referrals: number;
    active_referrals: number;
}

export interface AdminPayout {
    id: string;
    affiliate_id: string;
    amount: number;
    status: string;
    payout_method: string | null;
    payout_reference: string | null;
    requested_at: string;
    processed_at: string | null;
    affiliate_code: string | null;
    payout_email: string | null;
    user_email: string | null;
    user_name: string | null;
}

export interface AdminStats {
    total_users: number;
    paying_users: number;
    trial_users: number;
    total_affiliates: number;
    approved_affiliates: number;
    total_referrals: number;
    active_referrals: number;
    total_affiliate_earnings: number;
    pending_affiliate_earnings: number;
    pending_payouts_count: number;
    pending_payouts_amount: number;
    completed_payouts_amount: number;
    this_month_referrals: number;
    this_month_commissions: number;
}

// API Functions
export async function checkAdminRole(): Promise<boolean> {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return false;

        const { data, error } = await supabase.rpc('admin_check_role', {
            p_user_id: session.user.id
        });

        return !error && data === true;
    } catch {
        return false;
    }
}

export async function getAdminUsers(params: {
    limit?: number;
    offset?: number;
    search?: string;
} = {}): Promise<{ users: AdminUser[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.set('limit', String(params.limit));
    if (params.offset) queryParams.set('offset', String(params.offset));
    if (params.search) queryParams.set('search', params.search);

    const data = await apiRequest(`admin-users?${queryParams.toString()}`);
    return { users: data.users || [], total: data.total || 0 };
}

export async function updateUserCredits(userId: string, credits: number, reason?: string): Promise<{
    success: boolean;
    credits_before: number;
    credits_after: number;
}> {
    return apiRequest('admin-users', {
        method: 'PATCH',
        body: JSON.stringify({ user_id: userId, credits, reason })
    });
}

export async function getAdminAffiliates(): Promise<AdminAffiliate[]> {
    const data = await apiRequest('admin-affiliates');
    return data.affiliates || [];
}

export async function createAffiliate(params: {
    user_id: string;
    affiliate_code?: string;
    payout_email?: string;
}): Promise<{ success: boolean; affiliate_id?: string; affiliate_code?: string; error?: string }> {
    return apiRequest('admin-affiliates', {
        method: 'POST',
        body: JSON.stringify(params)
    });
}

export async function approveAffiliate(affiliateId: string): Promise<{ success: boolean }> {
    return apiRequest('admin-affiliates', {
        method: 'PATCH',
        body: JSON.stringify({ affiliate_id: affiliateId, action: 'approve' })
    });
}

export async function getAdminPayouts(status?: string): Promise<AdminPayout[]> {
    const queryParams = status ? `?status=${status}` : '';
    const data = await apiRequest(`admin-payouts${queryParams}`);
    return data.payouts || [];
}

export async function processPayout(payoutId: string, status: 'completed' | 'failed' | 'processing', reference?: string): Promise<{
    success: boolean;
    error?: string;
}> {
    return apiRequest('admin-payouts', {
        method: 'POST',
        body: JSON.stringify({ payout_id: payoutId, status, reference })
    });
}

export async function getAdminStats(): Promise<AdminStats> {
    const data = await apiRequest('admin-stats');
    return data.stats || {};
}
