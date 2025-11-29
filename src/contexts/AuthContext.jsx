import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { trialService } from '../services/trialService';

const AuthContext = createContext({});
const AFFILIATE_REF_STORAGE_KEY = 'adruby_affiliate_ref_code';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [subscriptionMeta, setSubscriptionMeta] = useState({
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    trialEndsAt: null
  });

  const initialOnboardingState = {
    trialStatus: null,
    onboardingCompleted: false,
    paymentVerified: false,
    trialExpiresAt: null
  };
  const [onboardingStatus, setOnboardingStatus] = useState(initialOnboardingState);

  const isOnboardingComplete = (status = onboardingStatus) =>
    Boolean(
      status?.onboardingCompleted ||
      status?.paymentVerified ||
      status?.trialStatus === 'active'
    );

  const isTrialActive = (trialEndsAt) => {
    if (!trialEndsAt) return false;
    try {
      return new Date(trialEndsAt).getTime() > Date.now();
    } catch (err) {
      console.warn('[AuthTrace] invalid trialEndsAt date', { trialEndsAt });
      return false;
    }
  };

  const isSubscribed = () => {
    if (isOnboardingComplete(onboardingStatus)) {
      return true;
    }
    if (subscriptionStatus === 'active') return true;
    if (subscriptionStatus === 'trialing' && isTrialActive(subscriptionMeta?.trialEndsAt)) {
      return true;
    }
    return false;
  };

  const ensureUserProfileExists = async () => {
    console.time('[AuthPerf] ensureUserProfileExists');
    try {
      await supabase.rpc('ensure_user_profile_exists');
    } catch (error) {
      console.error('[Auth] ensureUserProfileExists error:', error);
    } finally {
      console.timeEnd('[AuthPerf] ensureUserProfileExists');
    }
  };

  const refreshOnboardingStatus = async (sessionUser = user) => {
  console.time('[AuthPerf] refreshOnboardingStatus');

  if (!sessionUser?.id) {
    setOnboardingStatus(initialOnboardingState);
    console.timeEnd('[AuthPerf] refreshOnboardingStatus');
    return;
  }

  try {
    const status = await trialService.checkTrialStatus(sessionUser.id);

    const nextStatus = {
      trialStatus: status?.trialStatus,
      onboardingCompleted: status?.onboardingCompleted,
      paymentVerified: status?.paymentVerified,
      trialExpiresAt: status?.trialExpiresAt
    };

    setOnboardingStatus(nextStatus);

    console.log('[AuthTrace] onboardingStatus updated', {
      userId: sessionUser.id,
      onboardingStatus: nextStatus,
      ts: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Auth] onboarding status error:', error);
    setOnboardingStatus(initialOnboardingState);
  } finally {
    console.timeEnd('[AuthPerf] refreshOnboardingStatus');
  }
};


  const refreshSubscriptionStatus = async (sessionUser = user) => {
  console.time('[AuthPerf] refreshSubscriptionStatus');

  if (!sessionUser?.id) {
    setSubscriptionStatus(null);
    setSubscriptionMeta({
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      trialEndsAt: null
    });
    console.timeEnd('[AuthPerf] refreshSubscriptionStatus');
    return;
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        stripe_customer_id,
        trial_status,
        trial_expires_at,
        payment_verified,
        onboarding_completed
      `)
      .eq('id', sessionUser.id)
      .single();

    if (error) {
      console.error('[AuthTrace] subscription status load error', error, {
        userId: sessionUser.id
      });

      setSubscriptionStatus(null);
      setSubscriptionMeta({
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        trialEndsAt: null
      });
      console.timeEnd('[AuthPerf] refreshSubscriptionStatus');
      return;
    }

    const trialEndsAt = data?.trial_expires_at || null;
    const trialActive =
      data?.trial_status === 'active' && trialEndsAt
        ? new Date(trialEndsAt).getTime() > Date.now()
        : false;

    let derivedStatus = null;
    if (data?.payment_verified || data?.onboarding_completed) {
      derivedStatus = 'active';
    } else if (trialActive) {
      derivedStatus = 'trialing';
    }

    const nextMeta = {
      stripeCustomerId: data?.stripe_customer_id || null,
      stripeSubscriptionId: null,
      trialEndsAt
    };

    setSubscriptionStatus(derivedStatus);
    setSubscriptionMeta(nextMeta);

    console.log('[AuthTrace] subscriptionStatus updated', {
      userId: sessionUser.id,
      subscriptionStatus: derivedStatus,
      subscriptionMeta: nextMeta,
      raw: {
        trial_status: data?.trial_status,
        trial_expires_at: data?.trial_expires_at,
        payment_verified: data?.payment_verified,
        onboarding_completed: data?.onboarding_completed
      },
      ts: new Date().toISOString()
    });
  } catch (error) {
    console.error('[AuthTrace] subscription status exception:', error, {
      userId: sessionUser?.id,
      ts: new Date().toISOString()
    });
    setSubscriptionStatus(null);
    setSubscriptionMeta({
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      trialEndsAt: null
    });
  } finally {
    console.timeEnd('[AuthPerf] refreshSubscriptionStatus');
  }
};


  const refreshUserProfile = async (sessionUser = user) => {
    console.time('[AuthPerf] refreshUserProfile');
    if (!sessionUser?.id) {
      setUserProfile(null);
      console.timeEnd('[AuthPerf] refreshUserProfile');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          email,
          role,
          first_name,
          last_name,
          company_name,
          stripe_customer_id,
          trial_status,
          trial_expires_at,
          payment_verified,
          onboarding_completed,
          affiliate_enabled,
          affiliate_code,
          referred_by_affiliate_id,
          affiliate_balance,
          affiliate_lifetime_earnings,
          bank_account_holder,
          bank_iban,
          bank_bic
        `)
        .eq('id', sessionUser.id)
        .single();

      if (error) {
        console.error('[AuthTrace] refreshUserProfile error', error, {
          userId: sessionUser.id
        });
        setUserProfile(null);
        console.timeEnd('[AuthPerf] refreshUserProfile');
        return null;
      }

      setUserProfile(data);
      console.timeEnd('[AuthPerf] refreshUserProfile');
      return data;
    } catch (err) {
      console.error('[AuthTrace] refreshUserProfile exception', err, {
        userId: sessionUser?.id
      });
      setUserProfile(null);
      console.timeEnd('[AuthPerf] refreshUserProfile');
      return null;
    }
  };

  const persistAffiliateRefFromUrl = () => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const refCode = params.get('ref');
      if (refCode) {
        localStorage.setItem(AFFILIATE_REF_STORAGE_KEY, refCode);
        console.log('[Affiliate] Stored ref code from URL', { refCode });
      }
    } catch (err) {
      console.warn('[Affiliate] Failed to persist ref from URL', err);
    }
  };

  const attachAffiliateReferralIfNeeded = async (sessionUser = user) => {
    if (typeof window === 'undefined') return;
    if (!sessionUser?.id) return;

    const storedRef = localStorage.getItem(AFFILIATE_REF_STORAGE_KEY);
    if (!storedRef) return;

    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, referred_by_affiliate_id')
        .eq('id', sessionUser.id)
        .single();

      if (profileError) {
        console.error('[Affiliate] Failed to fetch profile before attach', profileError);
        return;
      }

      if (profile?.referred_by_affiliate_id) {
        console.log('[Affiliate] User already has referral, skipping attach', {
          userId: sessionUser.id
        });
        localStorage.removeItem(AFFILIATE_REF_STORAGE_KEY);
        return;
      }

      const { data: affiliate, error: affiliateError } = await supabase
        .from('user_profiles')
        .select('id, affiliate_code')
        .eq('affiliate_code', storedRef)
        .eq('affiliate_enabled', true)
        .single();

      if (affiliateError || !affiliate?.id) {
        console.warn('[Affiliate] Ref code not valid', {
          storedRef,
          error: affiliateError?.message || affiliateError
        });
        return;
      }

      if (affiliate.id === sessionUser.id) {
        console.warn('[Affiliate] Self-referral detected, skipping', { userId: sessionUser.id });
        localStorage.removeItem(AFFILIATE_REF_STORAGE_KEY);
        return;
      }

      const { error: referralError } = await supabase
        .from('affiliate_referrals')
        .upsert(
          {
            affiliate_id: affiliate.id,
            referred_user_id: sessionUser.id,
            ref_code: storedRef,
            current_status: 'registered'
          },
          { onConflict: 'affiliate_id,referred_user_id' }
        );

      if (referralError) {
        console.error('[Affiliate] Failed to upsert referral', referralError);
        return;
      }

      const { error: profileUpdateError } = await supabase
        .from('user_profiles')
        .update({ referred_by_affiliate_id: affiliate.id })
        .eq('id', sessionUser.id);

      if (profileUpdateError) {
        console.error('[Affiliate] Failed to set referred_by_affiliate_id', profileUpdateError);
        return;
      }

      console.log('[Affiliate] Referral attached to user', {
        userId: sessionUser.id,
        affiliateId: affiliate.id
      });
      localStorage.removeItem(AFFILIATE_REF_STORAGE_KEY);
      await refreshUserProfile(sessionUser);
    } catch (err) {
      console.error('[Affiliate] attachAffiliateReferralIfNeeded crashed', err);
    }
  };

  const loadUserState = useCallback(async (sessionUser) => {
    console.time('[AuthPerf] loadUserState');
    console.log('[AuthTrace] loadUserState called', {
      userId: sessionUser?.id,
      hasUser: !!sessionUser,
      ts: new Date().toISOString()
    });

    if (!sessionUser?.id) {
      setIsAdmin(false);
      setUserProfile(null);
      setOnboardingStatus(initialOnboardingState);
      setSubscriptionStatus(null);
      setSubscriptionMeta({
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        trialEndsAt: null
      });
      setIsAuthReady(true);
      setLoading(false);
      console.timeEnd('[AuthPerf] loadUserState');
      return;
    }

    setLoading(true);
    try {
      await ensureUserProfileExists();
      const profile = await refreshUserProfile(sessionUser);
      setIsAdmin(profile?.role === 'admin');
      await refreshOnboardingStatus(sessionUser);
      await refreshSubscriptionStatus(sessionUser);
      await attachAffiliateReferralIfNeeded(sessionUser);
    } catch (err) {
      console.error('[AuthTrace] loadUserState failed', err);
    } finally {
      setLoading(false);
      setIsAuthReady(true);
      console.timeEnd('[AuthPerf] loadUserState');
    }
  }, []);

  const handleSessionChange = useCallback(
    async (nextSession, source = 'unknown') => {
      const sessionUser = nextSession?.user ?? null;
      setSession(nextSession ?? null);
      setUser(sessionUser);

      console.log('[AuthTrace] handleSessionChange', {
        source,
        path: typeof window !== 'undefined' ? window?.location?.pathname : 'unknown',
        userId: sessionUser?.id,
        email: sessionUser?.email,
        ts: new Date().toISOString()
      });

      if (sessionUser?.id) {
        await loadUserState(sessionUser);
        console.log('[AuthTrace] state after handleSessionChange', {
          hasUser: !!sessionUser,
          isAdmin: sessionUser?.role === 'admin',
          loading,
          isAuthReady
        });
      } else {
        setIsAdmin(false);
        setOnboardingStatus(initialOnboardingState);
        setSubscriptionStatus(null);
        setSubscriptionMeta({
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          trialEndsAt: null
        });
        setUserProfile(null);
        setIsAuthReady(true);
        setLoading(false);
        console.log('[AuthTrace] state after handleSessionChange', {
          hasUser: false,
          isAdmin: false,
          loading,
          isAuthReady
        });
      }
    },
    [loadUserState]
  );

  useEffect(() => {
    console.log('[AuthTrace] init useEffect run', {
      path: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      ts: new Date().toISOString()
    });

    const init = async () => {
      try {
        if (typeof window !== 'undefined') {
          persistAffiliateRefFromUrl();
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[AuthTrace] getSession error', error);
        }

        await handleSessionChange(data?.session, 'initial');

        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const code = params.get('code');
          if (code && !data?.session) {
            console.log('[AuthTrace] exchanging OAuth code for session', {
              path: window.location.pathname,
              ts: new Date().toISOString()
            });
            const { data: exchangeData, error: exchangeError } =
              await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) {
              console.error('[AuthTrace] code exchange failed', exchangeError);
            } else {
              await handleSessionChange(exchangeData?.session, 'code-exchange');
            }
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      } catch (err) {
        console.error('[AuthTrace] init error', err, {
          path: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
          ts: new Date().toISOString()
        });
      } finally {
        setIsAuthReady(true);
      }
    };

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      console.log('[AuthTrace] onAuthStateChange fired', {
        event,
        hasSession: !!nextSession,
        userId: nextSession?.user?.id,
        ts: new Date().toISOString()
      });
      (async () => {
        await handleSessionChange(nextSession, 'authStateChange');
        setIsAuthReady(true);
      })();
    });

    return () => {
      console.log('[AuthTrace] cleanup authListener');
      authListener?.subscription?.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signUp = async (email, password, userData = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData?.firstName || '',
            last_name: userData?.lastName || '',
            company_name: userData?.companyName || ''
          }
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('[AuthTrace] Signup error:', error, { ts: new Date().toISOString() });
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (data?.session) {
        await handleSessionChange(data.session, 'signin');
      }

      return { data, error: null };
    } catch (error) {
      console.error('[AuthTrace] Signin error:', error, { ts: new Date().toISOString() });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setIsAdmin(false);
      setOnboardingStatus(initialOnboardingState);
      setUserProfile(null);

      return { error: null };
    } catch (error) {
      console.error('Signout error:', error);
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const googleClientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID;
      if (!googleClientId) {
        throw new Error('Google OAuth ist nicht konfiguriert. Bitte wenden Sie sich an den Support.');
      }

      const origin = typeof window !== 'undefined' ? window?.location?.origin : 'http://adruby.de';
      const redirectTo = import.meta.env?.VITE_GOOGLE_REDIRECT_URL || `${origin}/payment-verification`;
      console.log('[AuthTrace] signInWithGoogle redirectTo:', redirectTo, {
        ts: new Date().toISOString(),
        path: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          },
          scopes: 'openid email profile'
        }
      });

      if (error) {
        console.error('[AuthTrace] Google OAuth error details:', error, { ts: new Date().toISOString() });
        throw error;
      }
      console.log('[AuthTrace] signInWithGoogle response:', data, { ts: new Date().toISOString() });

      return { data, error: null };
    } catch (error) {
      console.error('[AuthTrace] Google OAuth error:', error, { ts: new Date().toISOString() });

      let errorMessage = 'Google-Anmeldung fehlgeschlagen.';
      if (error?.message?.includes('OAuth') || error?.message?.includes('konfiguriert')) {
        errorMessage = 'Google OAuth ist nicht konfiguriert. Bitte wenden Sie sich an den Support.';
      } else if (error?.message?.includes('network') || error?.message?.includes('Network')) {
        errorMessage = 'Internetverbindung prüfen und erneut versuchen.';
      } else if (error?.message?.includes('popup') || error?.message?.includes('blocked')) {
        errorMessage = 'Popup wurde blockiert. Bitte Popup-Blocker deaktivieren.';
      } else if (error?.message?.includes('Invalid') || error?.message?.includes('invalid')) {
        errorMessage = 'Ungültige Google-Konfiguration. Bitte wenden Sie sich an den Support.';
      } else if (error?.message) {
        errorMessage = error?.message;
      }

      return { data: null, error: { ...error, message: errorMessage } };
    }
  };

  const getUserProfile = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  };

  const updateProfile = async (updates) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      await refreshUserProfile(user);
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const requestDataExport = async () => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const exportData = {
        exportDate: new Date().toISOString(),
        userProfile: data,
        notice: 'Dies sind alle Ihre in unserem System gespeicherten Daten gemäß DSGVO Art. 15.'
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meine-daten-${user?.email}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error: functionError } = await supabase.rpc('delete_user_gdpr_data', {
        target_user_id: user.id
      });

      if (functionError) throw functionError;

      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      if (deleteError) throw deleteError;

      setUser(null);
      setIsAdmin(false);
      setUserProfile(null);

      return true;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  const value = {
    session,
    user,
    userProfile,
    loading,
    isAuthReady,
    subscriptionStatus,
    subscriptionMeta,
    isSubscribed,
    isAdmin,
    onboardingStatus,
    isOnboardingComplete,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshOnboardingStatus,
    refreshSubscriptionStatus,
    refreshUserProfile,
    getUserProfile,
    updateProfile,
    requestDataExport,
    deleteAccount,
    loadUserState
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
