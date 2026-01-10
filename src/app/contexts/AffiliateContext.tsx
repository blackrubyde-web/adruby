import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuthState } from './AuthContext';

// Types
export interface AffiliateStats {
    total_earnings: number;
    pending_earnings: number;
    total_referrals: number;
    active_referrals: number;
    trial_referrals: number;
    this_month_earnings: number;
    affiliate_code: string;
    is_approved: boolean;
}

export type ApplicationStatus = 'none' | 'pending' | 'approved' | 'rejected' | 'contacted';

export interface AffiliateReferral {
    id: string;
    referred_user_id: string;
    promo_code_used: string;
    status: 'registered' | 'trial' | 'active' | 'paid' | 'churned';
    months_paid: number;
    total_commission_earned: number;
    registered_at: string;
    first_payment_at: string | null;
    plan_type: string | null;
    // Joined data
    user_name?: string;
    user_email?: string;
}

export interface AffiliateCommission {
    id: string;
    amount: number;
    month_number: number;
    status: 'pending' | 'paid' | 'cancelled';
    created_at: string;
    paid_at: string | null;
    referral_id: string;
}

export interface AffiliatePayout {
    id: string;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    payout_method: string;
    payout_reference: string | null;
    requested_at: string;
    processed_at: string | null;
}

interface AffiliateContextValue {
    isAffiliate: boolean;
    isLoading: boolean;
    applicationStatus: ApplicationStatus;
    stats: AffiliateStats | null;
    referrals: AffiliateReferral[];
    commissions: AffiliateCommission[];
    payouts: AffiliatePayout[];
    affiliateCode: string | null;
    affiliateLink: string;
    refreshData: () => Promise<void>;
    requestPayout: (amount: number, payoutMethod?: string) => Promise<{ success: boolean; error?: string; newBalance?: number }>;
}

const AffiliateContext = createContext<AffiliateContextValue | null>(null);

export function AffiliateProvider({ children }: { children: ReactNode }) {
    const { profile, user } = useAuthState();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<AffiliateStats | null>(null);
    const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>('none');
    const [referrals, setReferrals] = useState<AffiliateReferral[]>([]);
    const [commissions, setCommissions] = useState<AffiliateCommission[]>([]);
    const [payouts, setPayouts] = useState<AffiliatePayout[]>([]);

    const isAffiliate = Boolean(profile?.is_affiliate);

    const loadAffiliateData = useCallback(async () => {
        if (!user?.id) {
            setStats(null);
            setReferrals([]);
            setCommissions([]);
            setPayouts([]);
            setApplicationStatus('none');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            // 1. Check for existing application
            // Only if not already an affiliate (optimization)
            if (!isAffiliate) {
                const { data: appData } = await supabase
                    .from('partner_applications')
                    .select('status')
                    .eq('user_id', user.id)
                    .maybeSingle(); // Use maybeSingle to avoid error if no row

                if (appData) {
                    setApplicationStatus(appData.status as ApplicationStatus);
                } else {
                    setApplicationStatus('none');
                }
            } else {
                setApplicationStatus('approved');
            }

            // 2. If Affiliate, load stats & data
            if (isAffiliate) {
                // Get stats via RPC
                const { data: statsData, error: statsError } = await supabase
                    .rpc('get_affiliate_stats', { p_user_id: user.id });

                if (!statsError && statsData) {
                    setStats(statsData);
                }

                // Get affiliate partner ID first
                const { data: partnerData, error: partnerError } = await supabase
                    .from('affiliate_partners')
                    .select('id')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (partnerError) {
                    console.warn('[Affiliate] Partner lookup failed', partnerError);
                }

                if (partnerData?.id) {
                    // Get referrals
                    const { data: refData } = await supabase
                        .from('affiliate_referrals')
                        .select('*')
                        .eq('affiliate_id', partnerData.id)
                        .order('registered_at', { ascending: false });

                    if (refData) setReferrals(refData);

                    // Get commissions
                    const { data: commData } = await supabase
                        .from('affiliate_commissions')
                        .select('*')
                        .eq('affiliate_id', partnerData.id)
                        .order('created_at', { ascending: false });

                    if (commData) setCommissions(commData);

                    // Get payouts
                    const { data: payoutData } = await supabase
                        .from('affiliate_payouts')
                        .select('*')
                        .eq('affiliate_id', partnerData.id)
                        .order('requested_at', { ascending: false });

                    if (payoutData) setPayouts(payoutData);
                }
            }
        } catch (err) {
            console.error('[Affiliate] Failed to load data:', err);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, isAffiliate]);

    // Request payout via secure RPC
    const requestPayout = useCallback(async (
        amount: number,
        payoutMethod: string = 'paypal'
    ): Promise<{ success: boolean; error?: string; newBalance?: number }> => {
        if (!user?.id) {
            return { success: false, error: 'Not authenticated' };
        }

        if (amount < 20) {
            return { success: false, error: 'Minimum payout is €20' };
        }

        try {
            // Use secure RPC function
            const { data, error } = await supabase.rpc('request_payout', {
                p_user_id: user.id,
                p_amount: amount,
                p_payout_method: payoutMethod
            });

            if (error) {
                return { success: false, error: error.message };
            }

            if (!data?.success) {
                return { success: false, error: data?.error || 'Failed to request payout' };
            }

            // Refresh data to update balances
            await loadAffiliateData();
            return {
                success: true,
                newBalance: data.new_balance
            };
        } catch (err) {
            console.error('[Affiliate] Payout request failed:', err);
            return { success: false, error: 'Failed to request payout' };
        }
    }, [user?.id, loadAffiliateData]);

    // Load data when user/profile changes
    useEffect(() => {
        loadAffiliateData();
    }, [loadAffiliateData]);

    const affiliateCode = stats?.affiliate_code || null;
    const affiliateLink = affiliateCode ? `https://adruby.ai/invite/${affiliateCode.toLowerCase()}` : '';

    const value = useMemo<AffiliateContextValue>(() => ({
        isAffiliate,
        isLoading,
        applicationStatus,
        stats,
        referrals,
        commissions,
        payouts,
        affiliateCode,
        affiliateLink,
        refreshData: loadAffiliateData,
        requestPayout
    }), [isAffiliate, isLoading, applicationStatus, stats, referrals, commissions, payouts, affiliateCode, affiliateLink, loadAffiliateData, requestPayout]);

    return (
        <AffiliateContext.Provider value={value}>
            {children}
        </AffiliateContext.Provider>
    );
}

export function useAffiliate() {
    const ctx = useContext(AffiliateContext);
    if (!ctx) {
        throw new Error('useAffiliate must be used within AffiliateProvider');
    }
    return ctx;
}

// Helper hook to check if user is an approved affiliate
export function useIsApprovedAffiliate() {
    const { isAffiliate, stats } = useAffiliate();
    return isAffiliate && stats?.is_approved === true;
}
