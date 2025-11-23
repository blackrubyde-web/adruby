import { supabase } from '../lib/supabase';

export const creditService = {
  // Get user's current credit status with color indicators
  async getUserCreditStatus(userId) {
    try {
      const { data, error } = await supabase?.rpc('get_user_credit_status', {
        p_user_id: userId
      });

      if (error) throw error;
      
      if (!data?.success) {
        throw new Error(data.error || 'Failed to get credit status');
      }

      return {
        credits: data?.credits,
        maxCredits: data?.max_credits,
        status: data?.status,
        color: data?.color,
        percentage: data?.percentage
      };
    } catch (error) {
      console.error('Error getting credit status:', error);
      throw error;
    }
  },

  // Check if user has enough credits for an action
  async checkCreditsForAction(userId, actionType) {
    const creditCosts = {
      'ad_builder': 8,
      'ai_analysis': 6, 
      'ad_strategy': 6,
      'full_process': 20
    };

    const requiredCredits = creditCosts?.[actionType];
    if (!requiredCredits) {
      throw new Error('Unknown action type');
    }

    try {
      const status = await this.getUserCreditStatus(userId);
      
      return {
        hasEnoughCredits: status?.credits >= requiredCredits,
        currentCredits: status?.credits,
        requiredCredits: requiredCredits,
        shortage: Math.max(0, requiredCredits - status?.credits)
      };
    } catch (error) {
      console.error('Error checking credits:', error);
      throw error;
    }
  },

  // Deduct credits for an action
  async deductCredits(userId, actionType, description = null) {
    const creditCosts = {
      'ad_builder': 8,
      'ai_analysis': 6,
      'ad_strategy': 6, 
      'full_process': 20
    };

    const creditsToDeduct = creditCosts?.[actionType];
    if (!creditsToDeduct) {
      throw new Error('Unknown action type');
    }

    try {
      const { data, error } = await supabase?.rpc('deduct_credits', {
        p_user_id: userId,
        p_action_type: actionType,
        p_credits_to_deduct: creditsToDeduct,
        p_description: description
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data.error || 'Failed to deduct credits');
      }

      return {
        success: true,
        creditsBefore: data?.credits_before,
        creditsAfter: data?.credits_after,
        creditsUsed: data?.credits_used,
        transactionId: data?.transaction_id
      };
    } catch (error) {
      console.error('Error deducting credits:', error);
      throw error;
    }
  },

  // Get credit transaction history
  async getCreditHistory(userId, limit = 50) {
    try {
      const { data, error } = await supabase?.from('credit_transactions')?.select('*')?.eq('user_id', userId)?.order('created_at', { ascending: false })?.limit(limit);

      if (error) throw error;

      return data?.map(transaction => ({
        id: transaction?.id,
        actionType: transaction?.action_type,
        creditsUsed: transaction?.credits_used,
        creditsBefore: transaction?.credits_before,
        creditsAfter: transaction?.credits_after,
        description: transaction?.description,
        createdAt: transaction?.created_at
      }));
    } catch (error) {
      console.error('Error getting credit history:', error);
      throw error;
    }
  },

  // Get available credit packages
  async getCreditPackages() {
    try {
      const { data, error } = await supabase?.from('credit_packages')?.select('*')?.eq('is_active', true)?.order('price_cents', { ascending: true });

      if (error) throw error;

      return data?.map(pkg => ({
        id: pkg?.id,
        name: pkg?.name,
        credits: pkg?.credits,
        priceCents: pkg?.price_cents,
        priceFormatted: this.formatPrice(pkg?.price_cents, pkg?.currency),
        currency: pkg?.currency,
        isPopular: pkg?.is_popular,
        pricePerCredit: (pkg?.price_cents / pkg?.credits / 100)?.toFixed(4)
      }));
    } catch (error) {
      console.error('Error getting credit packages:', error);
      throw error;
    }
  },

  // Format price in German format
  formatPrice(priceCents, currency = 'EUR') {
    const price = priceCents / 100;
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency
    })?.format(price);
  },

  // Format credits with German number formatting
  formatCredits(credits) {
    return new Intl.NumberFormat('de-DE')?.format(credits);
  },

  // Get color for credit display based on German requirements
  getCreditColor(credits) {
    if (credits > 250) return 'green';
    if (credits <= 250 && credits > 50) return 'orange';
    return 'red';
  },

  // Get credit display color classes for Tailwind
  getCreditColorClasses(credits) {
    const color = this.getCreditColor(credits);
    
    const colorClasses = {
      green: {
        text: 'text-green-600',
        bg: 'bg-green-100',
        border: 'border-green-300',
        icon: 'text-green-500'
      },
      orange: {
        text: 'text-orange-600', 
        bg: 'bg-orange-100',
        border: 'border-orange-300',
        icon: 'text-orange-500'
      },
      red: {
        text: 'text-red-600',
        bg: 'bg-red-100', 
        border: 'border-red-300',
        icon: 'text-red-500'
      }
    };

    return colorClasses?.[color];
  }
};