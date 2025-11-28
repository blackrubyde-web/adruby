import { supabase } from '../lib/supabaseClient.js';

export const affiliateService = {
  async getAffiliateProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, email, affiliate_enabled, affiliate_code, affiliate_balance, affiliate_lifetime_earnings, bank_account_holder, bank_iban, bank_bic')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async getReferrals(userId) {
    const { data, error } = await supabase
      .from('affiliate_referrals')
      .select('id, affiliate_id, referred_user_id, ref_code, stripe_customer_id, stripe_subscription_id, current_status, last_invoice_paid_at, created_at, referred_user:user_profiles!affiliate_referrals_referred_user_id_fkey ( id, email, first_name, last_name, company_name )')
      .eq('affiliate_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getEarnings(userId, limit = 50) {
    const { data, error } = await supabase
      .from('affiliate_earnings')
      .select('id, affiliate_id, referred_user_id, stripe_invoice_id, stripe_subscription_id, amount, currency, period_start, period_end, created_at, referred_user:user_profiles!affiliate_earnings_referred_user_id_fkey ( id, email, first_name, last_name, company_name )')
      .eq('affiliate_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getOverview(userId) {
    const profile = await this.getAffiliateProfile(userId);
    const referrals = await this.getReferrals(userId);

    const totalReferrals = referrals?.length || 0;
    const activeReferrals = referrals?.filter((r) => r?.current_status === 'active')?.length || 0;

    return {
      profile,
      totalReferrals,
      activeReferrals,
      balance: profile?.affiliate_balance || 0,
      lifetimeEarnings: profile?.affiliate_lifetime_earnings || 0
    };
  },

  async updateBankDetails(userId, details) {
    const sanitized = {
      bank_account_holder: details?.bank_account_holder?.trim() || null,
      bank_iban: details?.bank_iban?.trim() || null,
      bank_bic: details?.bank_bic?.trim() || null
    };

    const { data, error } = await supabase
      .from('user_profiles')
      .update(sanitized)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async requestPayout(userId, amount) {
    const numericAmount = Number(amount || 0);
    if (!numericAmount || numericAmount <= 0) {
      throw new Error('Ungültiger Auszahlungsbetrag');
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('affiliate_balance')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;
    if ((profile?.affiliate_balance || 0) < numericAmount) {
      throw new Error('Nicht genügend Guthaben für die Auszahlung');
    }

    const { data: payout, error } = await supabase
      .from('affiliate_payouts')
      .insert({
        affiliate_id: userId,
        amount: numericAmount,
        currency: 'EUR',
        status: 'requested'
      })
      .select()
      .single();

    if (error) throw error;

    // Reduce available balance immediately
    const newBalance = Math.max(0, (profile?.affiliate_balance || 0) - numericAmount);

    const { error: balanceError } = await supabase
      .from('user_profiles')
      .update({
        affiliate_balance: newBalance
      })
      .eq('id', userId);

    if (balanceError) {
      console.error('[Affiliate] Failed to deduct balance after payout request', balanceError);
    }

    return payout;
  },

  async applyReferralCode(code) {
    const trimmed = (code || '').trim();
    if (!trimmed) {
      throw new Error('Affiliate-Code darf nicht leer sein');
    }

    const { data, error } = await supabase.rpc('apply_affiliate_referral', {
      p_code: trimmed
    });

    if (error) {
      console.error('[Affiliate] applyReferralCode error', error);
      throw error;
    }

    return data;
  },

  async updateAffiliateCode(userId, newCode) {
    const trimmed = (newCode || '').trim();
    const codeRegex = /^[A-Za-z0-9_-]{4,32}$/;
    if (!trimmed) throw new Error('Affiliate-Code darf nicht leer sein');
    if (!codeRegex.test(trimmed)) {
      throw new Error('Affiliate-Code muss 4-32 Zeichen lang sein und darf nur Buchstaben, Zahlen, "-" oder "_" enthalten.');
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ affiliate_code: trimmed })
      .eq('id', userId)
      .select('id, affiliate_code')
      .single();

    if (error) {
      console.error('[Affiliate] updateAffiliateCode error', error);
      if (error?.code === '23505') {
        throw new Error('Dieser Affiliate-Code ist bereits vergeben.');
      }
      throw error;
    }

    return data;
  }
};

export default affiliateService;
