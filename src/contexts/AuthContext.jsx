import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, securityHelpers } from '../lib/supabaseClient.js';
import { trialService } from '../services/trialService';

const AuthContext = createContext({});

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

  // 🔁 NEU: leicht geschärft, aber gleiche Idee
  const isSubscribed = () => {
    // Harte Flags aus Onboarding (kommen aus trialService / user_profiles)
    if (isOnboardingComplete(onboardingStatus)) {
      return true;
    }

    // Fallback: abgeleiteter subscriptionStatus + trialEnd
    if (subscriptionStatus === 'active') return true;
    if (subscriptionStatus === 'trialing' && isTrialActive(subscriptionMeta?.trialEndsAt)) {
      return true;
    }

    return false;
  };

  const ensureUserProfileExists = async () => {
    console.time('[AuthPerf] ensureUserProfileExists');
    try {
      await supabase?.rpc('ensure_user_profile_exists');
      console.timeEnd('[AuthPerf] ensureUserProfileExists');
    } catch (error) {
      console.error('[Auth] ensureUserProfileExists error:', error);
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
      const status = await trialService?.checkTrialStatus(sessionUser?.id);
      setOnboardingStatus({
        trialStatus: status?.trialStatus,
        onboardingCompleted: status?.onboardingCompleted,
        paymentVerified: status?.paymentVerified,
        trialExpiresAt: status?.trialExpiresAt
      });
      console.timeEnd('[AuthPerf] refreshOnboardingStatus');
    } catch (error) {
      console.error('[Auth] onboarding status error:', error);
      setOnboardingStatus(initialOnboardingState);
      console.timeEnd('[AuthPerf] refreshOnboardingStatus');
    }
  };

  // 🔁 NEU: an user_profiles-Schema angepasst, Status abgeleitet
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
      // Nur die Spalten holen, die es in user_profiles wirklich gibt
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.select(
          `
          stripe_customer_id,
          trial_status,
          trial_expires_at,
          payment_verified,
          onboarding_completed
        `
        )
        ?.eq('id', sessionUser?.id)
        ?.single();

      if (error) {
        console.error(
          '[AuthTrace] subscription status load error (schema mismatch?)',
          error,
          { userId: sessionUser?.id, ts: new Date().toISOString() }
        );

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

      setSubscriptionStatus(derivedStatus);
      setSubscriptionMeta({
        stripeCustomerId: data?.stripe_customer_id || null,
        stripeSubscriptionId: null, // existiert im Schema nicht – bewusst null
        trialEndsAt
      });

      console.log('[AuthTrace] subscription status loaded (derived)', {
        userId: sessionUser?.id,
        raw: {
          trial_status: data?.trial_status,
          trial_expires_at: data?.trial_expires_at,
          payment_verified: data?.payment_verified,
          onboarding_completed: data?.onboarding_completed
        },
        derivedStatus,
        trialActive,
        ts: new Date().toISOString()
      });

      console.timeEnd('[AuthPerf] refreshSubscriptionStatus');
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
      console.timeEnd('[AuthPerf] refreshSubscriptionStatus');
    }
  };

  const handleSessionChange = (nextSession, source = 'unknown') => {
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
      (async () => {
        try {
          await ensureUserProfileExists();
          await Promise.all([
            checkAdminStatus(sessionUser),
            refreshOnboardingStatus(sessionUser),
            refreshSubscriptionStatus(sessionUser)
          ]);
        } catch (err) {
          console.error('[AuthTrace] background session tasks failed', err);
        }
      })();
    } else {
      setIsAdmin(false);
      setOnboardingStatus(initialOnboardingState);
      setSubscriptionStatus(null);
      setSubscriptionMeta({
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        trialEndsAt: null
      });
    }
  };

  // ✅ Enhanced useEffect mit Admin-Check
  useEffect(() => {
    const init = async () => {
      console.log('[AuthTrace] init start', { path: window.location.pathname, ts: new Date().toISOString() });
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const errorDescription = params.get('error_description');

        const { data, error } = await supabase?.auth?.getSession();
        console.log('[AuthTrace] getSession result', { session: data?.session, error, path: window.location.pathname, ts: new Date().toISOString() });
        handleSessionChange(data?.session, 'initial');

        if (code) {
          console.log('[AuthTrace] OAuth code detected in URL', { codePresent: true, path: window.location.pathname, ts: new Date().toISOString() });
        } else {
          console.log('[AuthTrace] no OAuth code in URL', { path: window.location.pathname, ts: new Date().toISOString() });
        }

        // Prevents "code verifier missing" noise: only exchange if no session yet.
        if (code && !data?.session) {
          console.log('[AuthTrace] exchanging OAuth code for session', { path: window.location.pathname, ts: new Date().toISOString() });
          const { data: exchangeData, error: exchangeError } = await supabase?.auth?.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('[AuthTrace] code exchange failed', exchangeError, { path: window.location.pathname, ts: new Date().toISOString() });
          } else {
            console.log('[AuthTrace] code exchange success', { hasSession: !!exchangeData?.session, ts: new Date().toISOString() });
            handleSessionChange(exchangeData?.session, 'code-exchange');
          }
          window.history.replaceState({}, document.title, window.location.pathname);
          console.log('[AuthTrace] cleaned OAuth code from URL', { path: window.location.pathname, ts: new Date().toISOString() });
        }
      } catch (error) {
        console.error('[AuthTrace] init error', error, { path: window.location.pathname, ts: new Date().toISOString() });
      } finally {
        setLoading(false);
        setIsAuthReady(true);
        console.log('[AuthTrace] init finished', { isAuthReady: true, hasSession: !!session, path: window.location.pathname, ts: new Date().toISOString() });
      }
    };

    init();

    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(
      (event, session) => {
        console.log('[AuthTrace] onAuthStateChange', { event, hasSession: !!session, path: window.location.pathname, ts: new Date().toISOString() });
        handleSessionChange(session, 'authStateChange');
        setLoading(false);
        setIsAuthReady(true);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);  

  // ✅ Admin-Status prüfen
  const checkAdminStatus = async (user) => {
    console.time('[AuthPerf] checkAdminStatus');
    if (!user) {
      setIsAdmin(false);
      console.timeEnd('[AuthPerf] checkAdminStatus');
      return;
    }

    try {
      const adminStatus = await securityHelpers?.isAdmin();
      setIsAdmin(adminStatus);
      console.timeEnd('[AuthPerf] checkAdminStatus');
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      console.timeEnd('[AuthPerf] checkAdminStatus');
    }
  };

  // ✅ Enhanced signUp mit Profil-Erstellung
  const signUp = async (email, password, userData = {}) => {
    try {
      const { data, error } = await supabase?.auth?.signUp({
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

      // Profile wird automatisch durch Database Trigger erstellt
      return { data, error: null };
    } catch (error) {
      console.error('[AuthTrace] Signup error:', error, { ts: new Date().toISOString() });
      return { data: null, error };
    }
  };

  // ✅ Enhanced signIn
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase?.auth?.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Admin-Status nach Login prüfen
      if (data?.user) {
        await checkAdminStatus(data?.user);
      }

      return { data, error: null };
    } catch (error) {
      console.error('[AuthTrace] Signin error:', error, { ts: new Date().toISOString() });
      return { data: null, error };
    }
  };

  // ✅ Enhanced signOut
  const signOut = async () => {
    try {
      const { error } = await supabase?.auth?.signOut();
      if (error) throw error;
      
      setUser(null);
      setIsAdmin(false);
      setOnboardingStatus(initialOnboardingState);
      
      return { error: null };
    } catch (error) {
      console.error('Signout error:', error);
      return { error };
    }
  };

  // ✅ Google OAuth Sign In with enhanced error handling
  const signInWithGoogle = async () => {
    try {
      const googleClientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID;
      if (!googleClientId) {
        throw new Error('Google OAuth ist nicht konfiguriert. Bitte wenden Sie sich an den Support.');
      }

      const origin = typeof window !== 'undefined' ? window?.location?.origin : 'http://adruby.de';
      const redirectTo = import.meta.env?.VITE_GOOGLE_REDIRECT_URL || `${origin}/payment-verification`;
      console.log('[AuthTrace] signInWithGoogle redirectTo:', redirectTo, { ts: new Date().toISOString(), path: window.location.pathname });

      const { data, error } = await supabase?.auth?.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'openid email profile'
        }
      });

      if (error) {
        console.error('[AuthTrace] Google OAuth error details:', error, { ts: new Date().toISOString() });
        throw error;
      }
      console.log('[AuthTrace] signInWithGoogle response:', data, { ts: new Date().toISOString() });

      // OAuth will handle redirect automatically
      return { data, error: null };
    } catch (error) {
      console.error('[AuthTrace] Google OAuth error:', error, { ts: new Date().toISOString() });
      
      // Provide specific error messages for common issues
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

  // ✅ GDPR-konformes Profil abrufen
  const getUserProfile = async () => {
    if (!user) return null;

    try {
      const userData = await securityHelpers?.getUserData();
      return userData;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  };

  // ✅ Profil aktualisieren
  const updateProfile = async (updates) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase?.from('user_profiles')?.update(updates)?.eq('id', user?.id)?.select()?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // ✅ GDPR Data Export
  const requestDataExport = async () => {
    if (!user) throw new Error('User not authenticated');

    try {
      const userData = await securityHelpers?.getUserData();
      
      // Create downloadable file
      const exportData = {
        exportDate: new Date()?.toISOString(),
        userProfile: userData,
        notice: 'Dies sind alle Ihre in unserem System gespeicherten Daten gemäß DSGVO Art. 15.'
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meine-daten-${user?.email}-${new Date()?.toISOString()?.split('T')?.[0]}.json`;
      document.body?.appendChild(a);
      a?.click();
      document.body?.removeChild(a);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  };

  // ✅ Account löschen (GDPR)
  const deleteAccount = async () => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Erst alle Daten löschen
      const { data, error: functionError } = await supabase?.rpc(
        'delete_user_gdpr_data',
        { target_user_id: user?.id }
      );

      if (functionError) throw functionError;

      // Dann Auth-User löschen
      const { error: deleteError } = await supabase?.auth?.admin?.deleteUser(user?.id);
      if (deleteError) throw deleteError;

      // Lokalen State clearen
      setUser(null);
      setIsAdmin(false);

      return true;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  const value = {
    session,
    user,
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
    getUserProfile,
    updateProfile,
    requestDataExport,
    deleteAccount,
    checkAdminStatus: () => checkAdminStatus(user)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
