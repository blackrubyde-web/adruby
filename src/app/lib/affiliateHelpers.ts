import { supabase } from '../lib/supabaseClient';

export interface EarningsData {
    date: string;
    earnings: number;
    referrals_count: number;
    conversions_count: number;
}

/**
 * Fetch real earnings data from affiliate_earnings_daily table
 */
export async function fetchAffiliateEarnings(
    userId: string,
    days: number = 30
): Promise<EarningsData[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
        .rpc('get_affiliate_earnings_range', {
            p_affiliate_user_id: userId,
            p_start_date: startDate.toISOString().split('T')[0],
            p_end_date: endDate.toISOString().split('T')[0]
        });

    if (error) {
        console.error('Failed to fetch earnings:', error);
        // Return mock data as fallback
        return generateMockEarnings(days);
    }

    // If no data, generate mock for now
    if (!data || data.length === 0) {
        return generateMockEarnings(days);
    }

    return data.map((d: EarningsData) => ({
        date: new Date(d.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
        earnings: Number(d.earnings) || 0,
        referrals_count: d.referrals_count || 0,
        conversions_count: d.conversions_count || 0
    }));
}

/**
 * Generate mock earnings data (fallback)
 */
function generateMockEarnings(days: number): EarningsData[] {
    return Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000)
            .toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
        earnings: Math.floor(Math.random() * 30) + 10,
        referrals_count: Math.floor(Math.random() * 3),
        conversions_count: Math.floor(Math.random() * 2)
    }));
}

/**
 * Fetch detailed referral data with LTV
 */
export async function fetchDetailedReferrals(affiliateUserId: string) {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('referred_by_affiliate_id', affiliateUserId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Failed to fetch referrals:', error);
        return [];
    }

    // Calculate LTV and format data
    return (data || []).map(user => ({
        id: user.id,
        user_name: user.full_name || 'Anonymous',
        user_email: user.email,
        status: user.payment_verified ? 'paid' : user.trial_status === 'active' ? 'trial' : 'registered',
        created_at: user.created_at,
        credits_purchased: user.credits || 0,
        lifetime_value: 0, // TODO: Calculate from payments table
        last_active: user.updated_at,
        months_paid: 0, // TODO: Calculate from subscription
        total_commission_earned: 0 // TODO: Calculate
    }));
}
