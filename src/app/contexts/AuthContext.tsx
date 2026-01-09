import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { env } from '../lib/env';

export type UserProfile = {
  id: string;
  email: string | null;
  full_name?: string | null;
  role?: string | null;
  avatar_url?: string | null;
  settings?: Record<string, unknown> | null;
  credits?: number | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  subscription_status?: string | null;
  trial_status?: string | null;
  trial_started_at?: string | null;
  trial_expires_at?: string | null;
  trial_ends_at?: string | null;
  payment_verified?: boolean | null;
  onboarding_completed?: boolean | null;
  verification_method?: string | null;
  // Affiliate fields
  is_affiliate?: boolean | null;
  referred_by_code?: string | null;
  signup_bonus_credits_applied?: boolean | null;
};

type AuthStateValue = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isAuthReady: boolean;
  isLoading: boolean;
  authError: string | null;
  profileError: string | null;
  billing: {
    isSubscribed: boolean;
    statusLabel: string;
    trialEndsAt: string | null;
  };
};

type AuthActionsValue = {
  signInWithGoogle: (redirectPath?: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<'signed_in' | 'needs_confirmation'>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

type AuthContextValue = AuthStateValue & AuthActionsValue;

const AuthStateContext = createContext<AuthStateValue | null>(null);
const AuthActionsContext = createContext<AuthActionsValue | null>(null);

function isTrialActive(trialEndsAt: string | null) {
  if (!trialEndsAt) return false;
  const t = new Date(trialEndsAt).getTime();
  return Number.isFinite(t) && t > Date.now();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const ensureUserProfileExists = useCallback(async () => {
    try {
      await supabase.rpc('ensure_user_profile_exists');
    } catch (err) {
      // Best-effort: function may not exist in some environments
      console.warn('[Auth] ensure_user_profile_exists failed', err);
    }
  }, []);

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(
        [
          'id',
          'email',
          'full_name',
          'role',
          'avatar_url',
          'settings',
          'credits',
          'stripe_customer_id',
          'stripe_subscription_id',
          'subscription_status',
          'trial_status',
          'trial_started_at',
          'trial_expires_at',
          'trial_ends_at',
          'payment_verified',
          'onboarding_completed',
          'verification_method',
          'is_affiliate',
          'referred_by_code',
          'signup_bonus_credits_applied'
        ].join(',')
      )
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data as unknown as UserProfile;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;
    try {
      const next = await loadProfile(user.id);
      setProfile(next);
      setProfileError(null);
    } catch (err) {
      console.error('[Auth] refreshProfile failed', err);
      setProfileError('Could not load your profile. Please retry.');
    }
  }, [loadProfile, user?.id]);

  // Initial boot + OAuth code exchange (PKCE)
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (env.demoMode) {
        console.log('[Auth] Demo Mode Enabled - Mocking Auth');
        const mockUser: User = {
          id: 'demo-user-123',
          email: 'demo@adruby.ai',
          app_metadata: {},
          user_metadata: { full_name: 'Demo User' },
          aud: 'authenticated',
          created_at: new Date().toISOString()
        } as any;

        const mockSession: Session = {
          access_token: 'demo-token',
          refresh_token: 'demo-refresh',
          expires_in: 3600,
          token_type: 'bearer',
          user: mockUser
        };

        if (!cancelled) {
          setSession(mockSession);
          setUser(mockUser);
          setIsLoading(false);
          setIsAuthReady(true);
        }
        return;
      }

      setIsLoading(true);
      setAuthError(null);

      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const errorParam = params.get('error') || params.get('error_description');

        if (errorParam) {
          setAuthError(decodeURIComponent(errorParam));
          params.delete('error');
          params.delete('error_description');
          const nextQuery = params.toString();
          const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}`;
          window.history.replaceState({}, document.title, nextUrl);
          return;
        }

        // Avoid double-exchange: first ask Supabase if a session already exists.
        const sessionBefore = await supabase.auth.getSession();
        if (sessionBefore.error) {
          console.error('[Auth] getSession (pre) failed', sessionBefore.error);
        }

        let activeSession = sessionBefore.data.session ?? null;

        if (!activeSession && code) {
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
              console.error('[Auth] exchangeCodeForSession failed', error);
              setAuthError('OAuth callback failed. Please try again.');
            } else {
              activeSession = data.session ?? null;
            }
          } finally {
            params.delete('code');
            const nextQuery = params.toString();
            const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}`;
            window.history.replaceState({}, document.title, nextUrl);
          }
        }

        if (!cancelled) {
          setSession(activeSession);
          setUser(activeSession?.user ?? null);
        }
      } catch (err) {
        console.error('[Auth] init failed', err);
        if (!cancelled) setAuthError('Auth initialization failed. Check Supabase env configuration.');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsAuthReady(true);
        }
      }
    };

    init();

    const { data: listener } = env.demoMode
      ? { data: { subscription: { unsubscribe: () => { } } } }
      : supabase.auth.onAuthStateChange((_event, nextSession) => {
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
      });

    return () => {
      cancelled = true;
      if (listener.subscription) listener.subscription.unsubscribe();
    };
  }, []);

  // Profile loading
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!user?.id) {
        setProfile(null);
        return;
      }

      if (env.demoMode) {
        setProfile({
          id: user.id,
          email: user.email ?? null,
          full_name: 'AdRuby Demo',
          credits: 1000,
          onboarding_completed: true,
          payment_verified: true,
          subscription_status: 'active'
        });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        await ensureUserProfileExists();
        const nextProfile = await loadProfile(user.id);
        if (!cancelled) {
          setProfile(nextProfile);
          setProfileError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setProfile(null);
          setProfileError('We could not load your profile details.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [ensureUserProfileExists, loadProfile, user?.id]);

  const signInWithGoogle = useCallback(async (redirectPath?: string) => {
    setAuthError(null);

    const origin = window.location.origin;
    const desiredRedirect = redirectPath || '/dashboard';
    const defaultRedirectTo = `${origin}/auth/callback?redirect=${encodeURIComponent(desiredRedirect)}`;
    try {
      sessionStorage.setItem('adruby_oauth_redirect', desiredRedirect);
    } catch {
      // ignore storage errors
    }

    let redirectTo = defaultRedirectTo;
    const envRedirect =
      import.meta.env.VITE_GOOGLE_REDIRECT_URL || import.meta.env.VITE_GOOGLE_REDIRECT_URI;
    if (envRedirect) {
      try {
        const url = new URL(envRedirect);
        if (!url.pathname || url.pathname === '/' || url.pathname === '') {
          url.pathname = '/auth/callback';
        } else if (!url.pathname.includes('/auth/callback')) {
          url.pathname = '/auth/callback';
        }
        if (!url.searchParams.get('redirect')) {
          url.searchParams.set('redirect', desiredRedirect);
        }
        redirectTo = url.toString();
      } catch (err) {
        console.warn('[Auth] Invalid VITE_GOOGLE_REDIRECT_URL, using default', err);
      }
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: { access_type: 'offline', prompt: 'consent' },
        scopes: 'openid email profile'
      }
    });

    if (error) {
      console.error('[Auth] signInWithOAuth failed', error);
      setAuthError(error.message);
      throw error;
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      throw error;
    }
  }, []);

  const signUpWithEmail = useCallback(
    async (fullName: string, email: string, password: string) => {
      setAuthError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        setAuthError(error.message);
        throw error;
      }

      // If email confirmations are enabled, `data.session` can be null.
      return data.session ? 'signed_in' : 'needs_confirmation';
    },
    []
  );

  const resetPassword = useCallback(async (email: string) => {
    setAuthError(null);
    const redirectTo = `${window.location.origin}/login`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) {
      setAuthError(error.message);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    setAuthError(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setAuthError(error.message);
      throw error;
    }
  }, []);

  const billing = useMemo(() => {
    const trialEndsAt = profile?.trial_expires_at || profile?.trial_ends_at || null;
    const trialOk = profile?.trial_status === 'active' && isTrialActive(trialEndsAt);
    const paid = Boolean(profile?.payment_verified);
    const onboardingComplete = Boolean(profile?.onboarding_completed);
    const isSubscribed = paid || onboardingComplete || trialOk;

    let statusLabel = 'Setup required';
    if (paid) statusLabel = 'Active';
    else if (trialOk) statusLabel = 'Trial';
    else if (profile?.trial_status === 'active') statusLabel = 'Trial expired';

    return { isSubscribed, statusLabel, trialEndsAt };
  }, [profile]);

  const stateValue = useMemo<AuthStateValue>(
    () => ({
      session,
      user,
      profile,
      isAuthReady,
      isLoading,
      authError,
      profileError,
      billing,
    }),
    [session, user, profile, isAuthReady, isLoading, authError, profileError, billing]
  );

  const actionsValue = useMemo<AuthActionsValue>(
    () => ({
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      resetPassword,
      signOut,
      refreshProfile,
    }),
    [signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, signOut, refreshProfile]
  );

  return (
    <AuthStateContext.Provider value={stateValue}>
      <AuthActionsContext.Provider value={actionsValue}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
}

export function useAuthState() {
  const ctx = useContext(AuthStateContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useAuthActions() {
  const ctx = useContext(AuthActionsContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useAuth() {
  const state = useAuthState();
  const actions = useAuthActions();
  return { ...state, ...actions } as AuthContextValue;
}
