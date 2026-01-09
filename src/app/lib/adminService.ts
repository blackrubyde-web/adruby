// Admin Service - API calls for admin dashboard
import { apiClient } from '../utils/apiClient';

// Types matches RPC return types
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
        await apiClient.get('/api/admin-stats');
        return true;
    } catch {
        return false;
    }
}

export async function getAdminUsers(params: {
    limit?: number;
    offset?: number;
    search?: string;
} = {}): Promise<{ users: AdminUser[]; total: number }> {
    const query = new URLSearchParams();
    query.set('limit', String(params.limit || 50));
    query.set('offset', String(params.offset || 0));
    if (params.search) query.set('search', params.search);

    const result = await apiClient.get<{
        success: boolean;
        users: AdminUser[];
        total: number;
    }>(`/api/admin-users?${query.toString()}`);

    return { users: result.users || [], total: Number(result.total || 0) };
}

export async function updateUserCredits(userId: string, credits: number, reason?: string): Promise<{
    success: boolean;
    credits_before: number;
    credits_after: number;
    error?: string;
}> {
    try {
        const result = await apiClient.patch<{
            success: boolean;
            credits_before: number;
            credits_after: number;
            error?: string;
        }>('/api/admin-users', {
            user_id: userId,
            credits,
            reason: reason || 'admin_adjustment'
        });
        return result;
    } catch (err) {
        return {
            success: false,
            credits_before: 0,
            credits_after: 0,
            error: err instanceof Error ? err.message : 'Failed to update credits'
        };
    }
}

export async function getAdminAffiliates(): Promise<AdminAffiliate[]> {
    const result = await apiClient.get<{ success: boolean; affiliates: AdminAffiliate[] }>(
        '/api/admin-affiliates'
    );
    return result.affiliates || [];
}

export async function createAffiliate(params: {
    user_id: string;
    affiliate_code?: string;
    payout_email?: string;
}): Promise<{ success: boolean; affiliate_id?: string; affiliate_code?: string; error?: string }> {
    try {
        const result = await apiClient.post<{
            success: boolean;
            affiliate_id?: string;
            affiliate_code?: string;
            error?: string;
        }>('/api/admin-affiliates', {
            user_id: params.user_id,
            affiliate_code: params.affiliate_code || null,
            payout_email: params.payout_email || null
        });
        return result;
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to create affiliate' };
    }
}

export async function approveAffiliate(affiliateId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const result = await apiClient.patch<{ success: boolean; error?: string }>(
            '/api/admin-affiliates',
            { affiliate_id: affiliateId, action: 'approve' }
        );
        return result;
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to approve affiliate' };
    }
}

export async function getAdminPayouts(status?: string): Promise<AdminPayout[]> {
    const query = new URLSearchParams();
    if (status) query.set('status', status);
    const result = await apiClient.get<{ success: boolean; payouts: AdminPayout[] }>(
        `/api/admin-payouts${query.toString() ? `?${query.toString()}` : ''}`
    );
    return result.payouts || [];
}

export async function processPayout(payoutId: string, status: 'completed' | 'failed' | 'processing', reference?: string): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const result = await apiClient.post<{ success: boolean; error?: string }>(
            '/api/admin-payouts',
            { payout_id: payoutId, status, reference: reference || null }
        );
        return result;
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Failed to process payout' };
    }
}

export async function getAdminStats(): Promise<AdminStats> {
    const result = await apiClient.get<{ success: boolean; stats: AdminStats }>('/api/admin-stats');
    return result.stats || {
        total_users: 0,
        paying_users: 0,
        trial_users: 0,
        total_affiliates: 0,
        approved_affiliates: 0,
        total_referrals: 0,
        active_referrals: 0,
        total_affiliate_earnings: 0,
        pending_affiliate_earnings: 0,
        pending_payouts_count: 0,
        pending_payouts_amount: 0,
        completed_payouts_amount: 0,
        this_month_referrals: 0,
        this_month_commissions: 0,
    };
}
