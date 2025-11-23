import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabasePublic as supabase, securityHelpers } from '../lib/supabaseClient.js';
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

  const isSubscribed = () =>
    subscriptionStatus === 'active' || subscriptionStatus === 'trialing' || isOnboardingComplete(onboardingStatus);

  const ensureUserProfileExists = async () => {
    try {
      await supabase?.rpc('ensure_user_profile_exists');
    } catch (error) {
      console.error('[Auth] ensureUserProfileExists error:', error);
    }
  };

  const refreshOnboardingStatus = async (sessionUser = user) => {
    if (!sessionUser?.id) {
      setOnboardingStatus(initialOnboardingState);
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
    } catch (error) {
      console.error('[Auth] onboarding status error:', error);
      setOnboardingStatus(initialOnboardingState);
    }
  };

  const refreshSubscriptionStatus = async (sessionUser = user) => {
    if (!sessionUser?.id) {
      setSubscriptionStatus(null);
      setSubscriptionMeta({
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        trialEndsAt: null
      });
      return;
    }

    try {
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.select('subscription_status, stripe_customer_id, stripe_subscription_id, trial_ends_at')
        ?.eq('id', sessionUser?.id)
        ?.single();

      if (error) {
        console.error('[Auth] subscription status load error:', error);
        return;
      }

      setSubscriptionStatus(data?.subscription_status || null);
      setSubscriptionMeta({
        stripeCustomerId: data?.stripe_customer_id || null,
        stripeSubscriptionId: data?.stripe_subscription_id || null,
        trialEndsAt: data?.trial_ends_at || null
      });
    } catch (error) {
      console.error('[Auth] subscription status exception:', error);
    }
  };

  const handleSessionChange = async (nextSession, source = 'unknown') => {
    const sessionUser = nextSession?.user ?? null;
    setSession(nextSession ?? null);
    setUser(sessionUser);

    console.log('[Auth] handleSessionChange', {
      source,
      path: typeof window !== 'undefined' ? window?.location?.pathname : 'unknown',
      userId: sessionUser?.id,
      email: sessionUser?.email
    });

    if (sessionUser?.id) {
      await ensureUserProfileExists();
      await Promise.all([
        checkAdminStatus(sessionUser),
        refreshOnboardingStatus(sessionUser),
        refreshSubscriptionStatus(sessionUser)
      ]);
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
      console.log('[Auth] init start');
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const errorDescription = params.get('error_description');

        if (code) {
          console.log('[Auth] OAuth code detected in URL', { codePresent: true });
        } else {
          console.log('[Auth] no OAuth code in URL');
        }

        if (code && !session) {
          console.log('[Auth] exchanging OAuth code for session');
          const { data, error } = await supabase?.auth?.exchangeCodeForSession(code);
          if (error) {
            console.error('[Auth] code exchange failed', error);
          } else {
            console.log('[Auth] code exchange success', { hasSession: !!data?.session });
            await handleSessionChange(data?.session, 'code-exchange');
          }
          window.history.replaceState({}, document.title, window.location.pathname);
          console.log('[Auth] cleaned OAuth code from URL');
        }

        const { data, error } = await supabase?.auth?.getSession();
        console.log('[Auth] getSession result', { session: data?.session, error });
        await handleSessionChange(data?.session, 'initial');
      } catch (error) {
        console.error('[Auth] init error', error);
      } finally {
        setLoading(false);
        setIsAuthReady(true);
        console.log('[Auth] init finished', { isAuthReady: true, hasSession: !!session });
      }
    };

    init();

    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] onAuthStateChange', { event, hasSession: !!session });
        await handleSessionChange(session, 'authStateChange');
        setLoading(false);
        setIsAuthReady(true);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);  

  // ✅ Admin-Status prüfen
  const checkAdminStatus = async (user) => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    try {
      const adminStatus = await securityHelpers?.isAdmin();
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  // ✅ Enhanced signUp mit Profil-Erstellung
  const signUp = async (email, password, userData = {}) => {
    try {
      const { data, error } = await supabasePublic?.auth?.signUp({
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
      console.error('Signup error:', error);
      return { data: null, error };
    }
  };

  // ✅ Enhanced signIn
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabasePublic?.auth?.signInWithPassword({
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
      console.error('Signin error:', error);
      return { data: null, error };
    }
  };

  // ✅ Enhanced signOut
  const signOut = async () => {
    try {
      const { error } = await supabasePublic?.auth?.signOut();
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

      const origin = typeof window !== 'undefined' ? window?.location?.origin : 'http://localhost:4028';
      const redirectTo = import.meta.env?.VITE_GOOGLE_REDIRECT_URL || `${origin}/payment-verification`;
      console.log('[Auth] signInWithGoogle redirectTo:', redirectTo);

      const { data, error } = await supabasePublic?.auth?.signInWithOAuth({
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
        console.error('Google OAuth error details:', error);
        throw error;
      }
      console.log('[Auth] signInWithGoogle response:', data);

      // OAuth will handle redirect automatically
      return { data, error: null };
    } catch (error) {
      console.error('Google OAuth error:', error);
      
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
      const { data, error } = await supabasePublic?.from('user_profiles')?.update(updates)?.eq('id', user?.id)?.select()?.single();

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
      const { data, error: functionError } = await supabasePublic?.rpc(
        'delete_user_gdpr_data',
        { target_user_id: user?.id }
      );

      if (functionError) throw functionError;

      // Dann Auth-User löschen
      const { error: deleteError } = await supabasePublic?.auth?.admin?.deleteUser(user?.id);
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
