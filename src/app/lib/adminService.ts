// Admin Service - API calls for admin dashboard
import { supabase } from './supabaseClient';

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
    // Parallel fetch for users and count
    const [usersResult, countResult] = await Promise.all([
        supabase.rpc('admin_get_all_users', {
            p_limit: params.limit || 50,
            p_offset: params.offset || 0,
            p_search: params.search || null
        }),
        supabase.rpc('admin_get_user_count', {
            p_search: params.search || null
        })
    ]);

    if (usersResult.error) throw new Error(usersResult.error.message);
    // countResult might error if function missing, handle safely
    const total = countResult.data || 0;

    return { users: usersResult.data || [], total: Number(total) };
}

export async function updateUserCredits(userId: string, credits: number, reason?: string): Promise<{
    success: boolean;
    credits_before: number;
    credits_after: number;
    error?: string;
}> {
    const { data, error } = await supabase.rpc('admin_update_user_credits', {
        p_user_id: userId,
        p_credits: credits,
        p_reason: reason || 'admin_adjustment'
    });

    if (error) return { success: false, credits_before: 0, credits_after: 0, error: error.message };
    return data;
}

export async function getAdminAffiliates(): Promise<AdminAffiliate[]> {
    const { data, error } = await supabase.rpc('admin_get_all_affiliates');
    if (error) throw new Error(error.message);
    return data || [];
}

export async function createAffiliate(params: {
    user_id: string;
    affiliate_code?: string;
    payout_email?: string;
}): Promise<{ success: boolean; affiliate_id?: string; affiliate_code?: string; error?: string }> {
    const { data, error } = await supabase.rpc('admin_create_affiliate', {
        p_user_id: params.user_id,
        p_code: params.affiliate_code || null,
        p_payout_email: params.payout_email || null
    });

    if (error) return { success: false, error: error.message };
    return data;
}

export async function approveAffiliate(affiliateId: string): Promise<{ success: boolean; error?: string }> {
    const { data, error } = await supabase.rpc('admin_approve_affiliate', {
        p_affiliate_id: affiliateId
    });

    if (error) return { success: false, error: error.message };
    return data;
}

export async function getAdminPayouts(status?: string): Promise<AdminPayout[]> {
    const { data, error } = await supabase.rpc('admin_get_all_payouts', {
        p_status: status || null
    });

    if (error) throw new Error(error.message);
    return data || [];
}

export async function processPayout(payoutId: string, status: 'completed' | 'failed' | 'processing', reference?: string): Promise<{
    success: boolean;
    error?: string;
}> {
    const { data, error } = await supabase.rpc('admin_process_payout', {
        p_payout_id: payoutId,
        p_status: status,
        p_reference: reference || null
    });

    if (error) return { success: false, error: error.message };
    return data;
}

export async function getAdminStats(): Promise<AdminStats> {
    const { data, error } = await supabase.rpc('admin_get_revenue_stats');
    if (error) throw new Error(error.message);
    return data || {
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

