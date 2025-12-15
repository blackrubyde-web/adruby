import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { trialService } from '../services/trialService';
import { apiClient } from '../utils/apiClient';
import { logger } from '../utils/logger';

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

  const loadUserStateLock = useRef(null);
  const lastSessionTokenRef = useRef(null);
  const hasLoadedUserRef = useRef({ userId: null, loaded: false });
  const isMountedRef = useRef(true);

  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    []
  );

  const isOnboardingComplete = (status = onboardingStatus) => {
    const trialActive = status?.trialStatus === 'active';
    const paid = Boolean(status?.paymentVerified);
    const completed = Boolean(status?.onboardingCompleted);
    // Onboarding gilt nur als fertig, wenn bezahlt ODER (Onboarding erledigt und Trial aktiv).
    return Boolean(paid || (completed && trialActive));
  };

  const isTrialActive = (trialEndsAt) => {
    if (!trialEndsAt) return false;
    try {
      return new Date(trialEndsAt).getTime() > Date.now();
    } catch (err) {
      logger.warn('[AuthTrace] invalid trialEndsAt date', { trialEndsAt, err });
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
    logger.time('[AuthPerf] ensureUserProfileExists');
    try {
      await supabase.rpc('ensure_user_profile_exists');
    } catch (error) {
      logger.error('[Auth] ensureUserProfileExists error:', error);
    } finally {
      logger.timeEnd('[AuthPerf] ensureUserProfileExists');
    }
  };

  const refreshOnboardingStatus = async (sessionUser = user) => {
    logger.time('[AuthPerf] refreshOnboardingStatus');

    if (!sessionUser?.id) {
      if (isMountedRef.current) setOnboardingStatus(initialOnboardingState);
      logger.timeEnd('[AuthPerf] refreshOnboardingStatus');
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

      if (isMountedRef.current) {
        setOnboardingStatus(nextStatus);
      }

      logger.log('[AuthTrace] onboardingStatus updated', {
        userId: sessionUser.id,
        onboardingStatus: nextStatus,
        ts: new Date().toISOString()
      });
    } catch (error) {
      logger.error('[Auth] onboarding status error:', error);
      if (isMountedRef.current) {
        setOnboardingStatus(initialOnboardingState);
      }
    } finally {
      logger.timeEnd('[AuthPerf] refreshOnboardingStatus');
    }
  };

  const refreshSubscriptionStatus = async (sessionUser = user) => {
    logger.time('[AuthPerf] refreshSubscriptionStatus');

    if (!sessionUser?.id) {
      if (isMountedRef.current) {
        setSubscriptionStatus(null);
        setSubscriptionMeta({
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          trialEndsAt: null
        });
      }
      logger.timeEnd('[AuthPerf] refreshSubscriptionStatus');
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
        logger.error('[AuthTrace] subscription status load error', error, {
          userId: sessionUser.id
        });

        if (isMountedRef.current) {
          setSubscriptionStatus(null);
          setSubscriptionMeta({
            stripeCustomerId: null,
            stripeSubscriptionId: null,
            trialEndsAt: null
          });
        }
        logger.timeEnd('[AuthPerf] refreshSubscriptionStatus');
        return;
      }

      const trialEndsAt = data?.trial_expires_at || null;
      const trialActive =
        data?.trial_status === 'active' && trialEndsAt
          ? new Date(trialEndsAt).getTime() > Date.now()
          : false;

      const paid = Boolean(data?.payment_verified);
      const completed = Boolean(data?.onboarding_completed);

      let derivedStatus = null;
      if (paid || (completed && trialActive)) {
        derivedStatus = 'active';
      } else if (trialActive) {
        derivedStatus = 'trialing';
      }

      const nextMeta = {
        stripeCustomerId: data?.stripe_customer_id || null,
        stripeSubscriptionId: null,
        trialEndsAt
      };

      if (isMountedRef.current) {
        setSubscriptionStatus(derivedStatus);
        setSubscriptionMeta(nextMeta);
      }

      logger.log('[AuthTrace] subscriptionStatus updated', {
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
      logger.error('[AuthTrace] subscription status exception:', error, {
        userId: sessionUser?.id,
        ts: new Date().toISOString()
      });
      if (isMountedRef.current) {
        setSubscriptionStatus(null);
        setSubscriptionMeta({
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          trialEndsAt: null
        });
      }
    } finally {
      logger.timeEnd('[AuthPerf] refreshSubscriptionStatus');
    }
  };

  const refreshUserProfile = async (sessionUser = user) => {
    logger.time('[AuthPerf] refreshUserProfile');
    if (!sessionUser?.id) {
      if (isMountedRef.current) {
        setUserProfile(null);
      }
      logger.timeEnd('[AuthPerf] refreshUserProfile');
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
        logger.error('[AuthTrace] refreshUserProfile error', error, {
          userId: sessionUser.id
        });
        if (isMountedRef.current) setUserProfile(null);
        logger.timeEnd('[AuthPerf] refreshUserProfile');
        return null;
      }

      if (isMountedRef.current) setUserProfile(data);
      logger.timeEnd('[AuthPerf] refreshUserProfile');
      return data;
    } catch (err) {
      logger.error('[AuthTrace] refreshUserProfile exception', err, {
        userId: sessionUser?.id
      });
      if (isMountedRef.current) setUserProfile(null);
      logger.timeEnd('[AuthPerf] refreshUserProfile');
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
        logger.log('[Affiliate] Stored ref code from URL', { refCode });
      }
    } catch (err) {
      logger.warn('[Affiliate] Failed to persist ref from URL', err);
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
        logger.error('[Affiliate] Failed to fetch profile before attach', profileError);
        return;
      }

      if (profile?.referred_by_affiliate_id) {
        logger.log('[Affiliate] User already has referral, skipping attach', {
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
        logger.warn('[Affiliate] Ref code not valid', {
          storedRef,
          error: affiliateError?.message || affiliateError
        });
        return;
      }

      if (affiliate.id === sessionUser.id) {
        logger.warn('[Affiliate] Self-referral detected, skipping', { userId: sessionUser.id });
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
        logger.error('[Affiliate] Failed to upsert referral', referralError);
        return;
      }

      const { error: profileUpdateError } = await supabase
        .from('user_profiles')
        .update({ referred_by_affiliate_id: affiliate.id })
        .eq('id', sessionUser.id);

      if (profileUpdateError) {
        logger.error('[Affiliate] Failed to set referred_by_affiliate_id', profileUpdateError);
        return;
      }

      logger.log('[Affiliate] Referral attached to user', {
        userId: sessionUser.id,
        affiliateId: affiliate.id
      });
      localStorage.removeItem(AFFILIATE_REF_STORAGE_KEY);
      await refreshUserProfile(sessionUser);
    } catch (err) {
      logger.error('[Affiliate] attachAffiliateReferralIfNeeded crashed', err);
    }
  };

  const loadUserState = useCallback(
    async (sessionUser) => {
      logger.time('[AuthPerf] loadUserState');
      logger.log('[AuthTrace] loadUserState called', {
        userId: sessionUser?.id,
        hasUser: !!sessionUser,
        ts: new Date().toISOString()
      });

      const currentUserId = sessionUser?.id || null;

      if (!currentUserId) {
        if (isMountedRef.current) {
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
        }
        logger.timeEnd('[AuthPerf] loadUserState');
        return;
      }

      if (
        loadUserStateLock.current?.userId === currentUserId &&
        loadUserStateLock.current?.promise
      ) {
        logger.log('[AuthTrace] dedup loadUserState for same user', { userId: currentUserId });
        return loadUserStateLock.current.promise;
      }

      const run = async () => {
        if (isMountedRef.current) setLoading(true);
        try {
          await ensureUserProfileExists();
          const profile = await refreshUserProfile(sessionUser);
          if (isMountedRef.current) setIsAdmin(profile?.role === 'admin');

          await Promise.all([
            refreshOnboardingStatus(sessionUser),
            refreshSubscriptionStatus(sessionUser),
            attachAffiliateReferralIfNeeded(sessionUser)
          ]);
        } catch (err) {
          logger.error('[AuthTrace] loadUserState failed', err);
        } finally {
          if (isMountedRef.current) {
            setLoading(false);
            setIsAuthReady(true);
          }
          logger.timeEnd('[AuthPerf] loadUserState');
        }
      };

      const promise = run();
      loadUserStateLock.current = { userId: currentUserId, promise };
      promise.finally(() => {
        if (loadUserStateLock.current?.promise === promise) {
          loadUserStateLock.current = null;
        }
      });
      return promise;
    },
    [refreshOnboardingStatus, refreshSubscriptionStatus, refreshUserProfile]
  );

  const handleSessionChange = useCallback(
    async (nextSession, source = 'unknown', eventType = null) => {
      const sessionUser = nextSession?.user ?? null;
      const token = nextSession?.access_token || null;

      if (isMountedRef.current) {
        setSession(nextSession ?? null);
        setUser(sessionUser);
      }

      logger.log('[AuthTrace] handleSessionChange', {
        source,
        path: typeof window !== 'undefined' ? window?.location?.pathname : 'unknown',
        userId: sessionUser?.id,
        email: sessionUser?.email,
        eventType,
        ts: new Date().toISOString()
      });

      if (sessionUser?.id) {
        // Reset the loaded-flag when user changes
        if (hasLoadedUserRef.current.userId !== sessionUser.id) {
          hasLoadedUserRef.current = { userId: sessionUser.id, loaded: false };
        }

        // Skip if we already loaded data for this user in this session
        if (hasLoadedUserRef.current.loaded) {
          logger.log('[AuthTrace] skip loadUserState (already loaded for user)', {
            source,
            eventType,
            userId: sessionUser.id
          });
        } else {
          lastSessionTokenRef.current = token;
          await loadUserState(sessionUser);
          hasLoadedUserRef.current = { userId: sessionUser.id, loaded: true };
        }

        logger.log('[AuthTrace] state after handleSessionChange', {
          hasUser: !!sessionUser,
          isAdmin: sessionUser?.role === 'admin',
          loading,
          isAuthReady
        });
      } else if (isMountedRef.current) {
        lastSessionTokenRef.current = token;
        hasLoadedUserRef.current = { userId: null, loaded: false };
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
        logger.log('[AuthTrace] state after handleSessionChange', {
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
    let cancelled = false;
    const readyTimeout = setTimeout(() => {
      if (!isAuthReady && isMountedRef.current) {
        logger.warn('[AuthTrace] init timeout -> set isAuthReady true fallback');
        setIsAuthReady(true);
        setLoading(false);
      }
    }, 6000);
    logger.log('[AuthTrace] init useEffect run', {
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
          logger.error('[AuthTrace] getSession error', error);
        }

        if (!cancelled) {
          await handleSessionChange(data?.session, 'initial');
        }

        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const code = params.get('code');
          if (code && !data?.session) {
            logger.log('[AuthTrace] exchanging OAuth code for session', {
              path: window.location.pathname,
              ts: new Date().toISOString()
            });
            const { data: exchangeData, error: exchangeError } =
              await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) {
              logger.error('[AuthTrace] code exchange failed', exchangeError);
            } else if (!cancelled) {
              await handleSessionChange(exchangeData?.session, 'code-exchange');
              const redirectParam = params.get('redirect');
              const redirectTo =
                redirectParam && redirectParam.startsWith('/')
                  ? redirectParam
                  : '/overview-dashboard';
              window.location.replace(redirectTo);
              return;
            }
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      } catch (err) {
        logger.error('[AuthTrace] init error', err, {
          path: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
          ts: new Date().toISOString()
        });
      } finally {
        if (!cancelled && isMountedRef.current) {
          setIsAuthReady(true);
        } else if (import.meta?.env?.DEV) {
          logger.warn('[AuthTrace] init skipped setting ready due to unmount');
        }
      }
    };

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      logger.log('[AuthTrace] onAuthStateChange fired', {
        event,
        hasSession: !!nextSession,
        userId: nextSession?.user?.id,
        ts: new Date().toISOString()
      });
      (async () => {
        if (!cancelled) {
          await handleSessionChange(nextSession, 'authStateChange', event);
          if (isMountedRef.current) setIsAuthReady(true);
        }
      })();
    });

    return () => {
      cancelled = true;
      clearTimeout(readyTimeout);
      logger.log('[AuthTrace] cleanup authListener');
      authListener?.subscription?.unsubscribe();
    };
  }, [handleSessionChange]); // eslint-disable-line react-hooks/exhaustive-deps

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
      logger.error('[AuthTrace] Signup error:', error, { ts: new Date().toISOString() });
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
      logger.error('[AuthTrace] Signin error:', error, { ts: new Date().toISOString() });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      if (isMountedRef.current) {
        setUser(null);
        setIsAdmin(false);
        setOnboardingStatus(initialOnboardingState);
        setUserProfile(null);
      }

      return { error: null };
    } catch (error) {
      logger.error('Signout error:', error);
      return { error };
    }
  };

  const signInWithGoogle = async (redirectPath) => {
    try {
      const googleClientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID;
      if (!googleClientId) {
        throw new Error('Google OAuth ist nicht konfiguriert. Bitte wenden Sie sich an den Support.');
      }

      const origin = typeof window !== 'undefined' ? window?.location?.origin : 'http://adruby.de';
      const desiredRedirect =
        redirectPath ||
        (typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('redirect') || '/overview-dashboard'
          : '/overview-dashboard');

      const defaultRedirectTo = `${origin}/login-authentication?redirect=${encodeURIComponent(
        desiredRedirect
      )}`;

      let redirectTo = defaultRedirectTo;
      const envRedirect = import.meta.env?.VITE_GOOGLE_REDIRECT_URL;

      if (envRedirect) {
        try {
          const url = new URL(envRedirect);
          if (!url.searchParams.get('redirect') && desiredRedirect) {
            url.searchParams.set('redirect', desiredRedirect);
          }
          redirectTo = url.toString();
        } catch (err) {
          logger.warn('[AuthTrace] Invalid VITE_GOOGLE_REDIRECT_URL, falling back to default', err);
          redirectTo = defaultRedirectTo;
        }
      }

      logger.log('[AuthTrace] signInWithGoogle redirectTo:', redirectTo, {
        ts: new Date().toISOString(),
        path: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
        desiredRedirect
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
        logger.error('[AuthTrace] Google OAuth error details:', error, { ts: new Date().toISOString() });
        throw error;
      }
      logger.log('[AuthTrace] signInWithGoogle response:', data, { ts: new Date().toISOString() });

      return { data, error: null };
    } catch (error) {
      logger.error('[AuthTrace] Google OAuth error:', error, { ts: new Date().toISOString() });

      let errorMessage = 'Google-Anmeldung fehlgeschlagen.';
      if (error?.message?.includes('OAuth') || error?.message?.includes('konfiguriert')) {
        errorMessage = 'Google OAuth ist nicht konfiguriert. Bitte wenden Sie sich an den Support.';
      } else if (error?.message?.includes('network') || error?.message?.includes('Network')) {
        errorMessage = 'Internetverbindung pr\u00fcfen und erneut versuchen.';
      } else if (error?.message?.includes('popup') || error?.message?.includes('blocked')) {
        errorMessage = 'Popup wurde blockiert. Bitte Popup-Blocker deaktivieren.';
      } else if (error?.message?.includes('Invalid') || error?.message?.includes('invalid')) {
        errorMessage = 'Ung\u00fcltige Google-Konfiguration. Bitte wenden Sie sich an den Support.';
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
      logger.error('Error fetching user profile:', error);
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
      logger.error('Error updating profile:', error);
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
        notice: 'Dies sind alle Ihre in unserem System gespeicherten Daten gem\u00e4\u00df DSGVO Art. 15.'
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
      logger.error('Error exporting user data:', error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData?.session?.access_token) {
        throw sessionError || new Error('Session missing or expired');
      }

      const token = sessionData.session.access_token;

      const payload = await apiClient.post(
        '/api/delete-account',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!payload?.ok) {
        throw new Error(payload?.error || 'Account deletion failed');
      }

      await supabase.auth.signOut();
      if (isMountedRef.current) {
        setUser(null);
        setIsAdmin(false);
        setUserProfile(null);
      }

      return true;
    } catch (error) {
      logger.error('Error deleting account:', error);
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
