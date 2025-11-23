import { supabase } from '../lib/supabase';

export const trialService = {
  // Start trial after payment verification
  async startTrial(userId) {
    try {
      const { data, error } = await supabase?.rpc('start_trial', {
        target_user_id: userId
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Fehler beim Starten der Testversion');
      }

      return {
        success: true,
        trialStartedAt: data?.trial_started_at,
        trialExpiresAt: data?.trial_expires_at,
        creditsGranted: data?.credits_granted || 1000
      };
    } catch (error) {
      console.error('Error starting trial:', error);
      throw error;
    }
  },

  // Verify payment and activate trial
  async verifyPaymentAndActivateTrial(userId, paymentMethod = 'stripe_card') {
    try {
      const { data, error } = await supabase?.rpc('verify_payment_and_activate_trial', {
        target_user_id: userId,
        payment_method: paymentMethod
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Fehler bei der Zahlungsverifizierung');
      }

      return {
        success: true,
        trialStartedAt: data?.trial_started_at,
        trialExpiresAt: data?.trial_expires_at,
        creditsGranted: data?.credits_granted || 1000
      };
    } catch (error) {
      console.error('Error verifying payment and activating trial:', error);
      throw error;
    }
  },

  // Check trial status
  async checkTrialStatus(userId) {
    try {
      const { data, error } = await supabase?.rpc('check_trial_status', {
        target_user_id: userId
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Fehler beim Abrufen des Trial-Status');
      }

      return {
        trialStatus: data?.trial_status,
        onboardingCompleted: data?.onboarding_completed,
        paymentVerified: data?.payment_verified,
        verificationMethod: data?.verification_method,
        trialStartedAt: data?.trial_started_at,
        trialExpiresAt: data?.trial_expires_at,
        daysRemaining: data?.days_remaining,
        credits: data?.credits
      };
    } catch (error) {
      console.error('Error checking trial status:', error);
      throw error;
    }
  },

  // Get user's current trial progress
  async getUserTrialProgress(userId) {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select(`
          trial_status,
          trial_started_at,
          trial_expires_at,
          onboarding_completed,
          payment_verified,
          verification_method,
          credits
        `)?.eq('id', userId)?.single();

      if (error) throw error;

      // Calculate days remaining
      let daysRemaining = 0;
      if (data?.trial_expires_at) {
        const now = new Date();
        const expiresAt = new Date(data.trial_expires_at);
        const diffTime = Math.abs(expiresAt - now);
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (expiresAt < now) daysRemaining = 0;
      }

      return {
        trialStatus: data?.trial_status || 'inactive',
        onboardingCompleted: data?.onboarding_completed || false,
        paymentVerified: data?.payment_verified || false,
        verificationMethod: data?.verification_method,
        trialStartedAt: data?.trial_started_at,
        trialExpiresAt: data?.trial_expires_at,
        daysRemaining,
        credits: data?.credits || 0
      };
    } catch (error) {
      console.error('Error getting trial progress:', error);
      throw error;
    }
  },

  // Update user trial status
  async updateTrialStatus(userId, updates) {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.update({
          ...updates,
          updated_at: new Date()?.toISOString()
        })?.eq('id', userId)?.select()?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating trial status:', error);
      throw error;
    }
  },

  // Check if trial has expired
  isTrialExpired(trialExpiresAt) {
    if (!trialExpiresAt) return true;
    return new Date(trialExpiresAt) < new Date();
  },

  // Get trial status display text
  getTrialStatusText(trialStatus) {
    const statusTexts = {
      inactive: 'Inaktiv',
      pending_verification: 'Verifizierung ausstehend',
      active: 'Aktiv',
      expired: 'Abgelaufen'
    };
    return statusTexts?.[trialStatus] || 'Unbekannt';
  },

  // Get trial status color classes
  getTrialStatusClasses(trialStatus) {
    const statusClasses = {
      inactive: {
        text: 'text-gray-600',
        bg: 'bg-gray-100',
        border: 'border-gray-300'
      },
      pending_verification: {
        text: 'text-orange-600',
        bg: 'bg-orange-100',
        border: 'border-orange-300'
      },
      active: {
        text: 'text-green-600',
        bg: 'bg-green-100',
        border: 'border-green-300'
      },
      expired: {
        text: 'text-red-600',
        bg: 'bg-red-100',
        border: 'border-red-300'
      }
    };
    return statusClasses?.[trialStatus] || statusClasses?.inactive;
  },

  // Format trial dates for display
  formatTrialDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })?.format(date);
  },

  // Calculate trial progress percentage
  getTrialProgress(trialStartedAt, trialExpiresAt) {
    if (!trialStartedAt || !trialExpiresAt) return 0;

    const start = new Date(trialStartedAt);
    const end = new Date(trialExpiresAt);
    const now = new Date();

    const totalDuration = end - start;
    const elapsed = now - start;

    const progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
    return Math.round(progress);
  }
};