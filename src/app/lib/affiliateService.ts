// Affiliate Service - API calls for affiliate system
import { supabase } from './supabaseClient';

export interface PromoCodeResult {
    success: boolean;
    bonus_credits?: number;
    message?: string;
    error?: string;
}

/**
 * Apply a promo code during registration
 * Validates the code, links user to affiliate, adds 250 credits
 */
export async function applyPromoCode(code: string, userId: string): Promise<PromoCodeResult> {
    try {
        const { data, error } = await supabase.rpc('apply_promo_code', {
            p_promo_code: code,
            p_user_id: userId
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return data as PromoCodeResult;
    } catch (err) {
        console.error('[Affiliate] applyPromoCode error:', err);
        return { success: false, error: 'Failed to apply promo code' };
    }
}

/**
 * Validate a promo code without applying it
 */
export async function validatePromoCode(code: string): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from('affiliate_partners')
            .select('id')
            .ilike('affiliate_code', code)
            .eq('is_approved', true)
            .single();

        return !error && !!data;
    } catch {
        return false;
    }
}

/**
 * Get affiliate partner data for the current user
 */
export async function getAffiliatePartner(userId: string) {
    const { data, error } = await supabase
        .from('affiliate_partners')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) return null;
    return data;
}

/**
 * Update affiliate's payout settings
 */
export async function updatePayoutSettings(
    userId: string,
    settings: { payout_email?: string; payout_method?: string }
) {
    const { error } = await supabase
        .from('affiliate_partners')
        .update(settings)
        .eq('user_id', userId);

    return !error;
}

/**
 * Get monthly earnings chart data (last 12 months)
 */
export async function getEarningsChartData(affiliateId: string) {
    const { data, error } = await supabase
        .from('affiliate_commissions')
        .select('amount, created_at')
        .eq('affiliate_id', affiliateId)
        .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

    if (error || !data) return [];

    // Group by month
    const monthlyData: Record<string, number> = {};
    data.forEach((c) => {
        const month = new Date(c.created_at).toLocaleDateString('de-DE', { month: 'short' });
        monthlyData[month] = (monthlyData[month] || 0) + c.amount;
    });

    return Object.entries(monthlyData).map(([date, earnings]) => ({ date, earnings }));
}

/**
 * Get referral activity log (recent signups/payments)
 */
export async function getReferralActivity(affiliateId: string, limit = 10) {
    const { data, error } = await supabase
        .from('affiliate_referrals')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .order('registered_at', { ascending: false })
        .limit(limit);

    if (error) return [];
    return data;
}
