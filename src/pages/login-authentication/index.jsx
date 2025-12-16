import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import RedirectScreen from '../../components/RedirectScreen';

const DISALLOWED_REDIRECTS = new Set(['/login', '/login-authentication', '/signup']);
const normalizeRedirect = (raw) => {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    if (!decoded.startsWith('/')) return null;
    if (DISALLOWED_REDIRECTS.has(decoded)) return null;
    return decoded;
  } catch {
    return null;
  }
};

const REDIRECT_DELAY_MS = 3000;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const LoginAuthentication = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    let intervalId;

    const finish = async (sessionUser) => {
      if (cancelled || !sessionUser?.id) return;
      try {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role,payment_verified,onboarding_completed')
          .eq('id', sessionUser.id)
          .single();

        if (profileError) {
          console.error('[LoginCallback] failed to load profile for redirect', profileError);
        }

        const isAdmin = profile?.role === 'admin';
        const params = new URLSearchParams(location.search);
        const redirectParam = normalizeRedirect(params.get('redirect'));
        const isPaid = Boolean(profile?.payment_verified || profile?.onboarding_completed);
        const finalRedirect =
          redirectParam ||
          (isPaid ? (isAdmin ? '/admin-dashboard' : '/overview-dashboard') : '/payment-verification');

        if (!cancelled) {
          await wait(REDIRECT_DELAY_MS);
        }

        if (!cancelled) {
          navigate(finalRedirect, { replace: true });
        }
      } catch (err) {
        console.error('[LoginCallback] error', err);
        if (!cancelled) {
          navigate('/login', {
            replace: true,
            state: { error: 'Login fehlgeschlagen' }
          });
        }
      }
    };

    const pollSession = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');

      // Wenn ein OAuth-Code vorhanden ist, direkt eintauschen und weiterleiten
      if (code) {
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            throw error;
          }
          if (data?.session?.user) {
            await finish(data.session.user);
            return;
          }
        } catch (err) {
          console.error('[LoginCallback] code exchange failed', err);
          navigate('/login', {
            replace: true,
            state: { error: 'Login fehlgeschlagen (Code-Exchange).' }
          });
          return;
        }
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (data?.session?.user) {
          await finish(data.session.user);
          return;
        }
        if (error) {
          console.error('[LoginCallback] getSession error', error);
        }

        let attempts = 0;
        const maxAttempts = 12; // ~6s bei 500ms

        intervalId = setInterval(async () => {
          if (cancelled) return;
          attempts += 1;
          const { data: polled } = await supabase.auth.getSession();
          if (polled?.session?.user) {
            clearInterval(intervalId);
            await finish(polled.session.user);
          } else if (attempts >= maxAttempts) {
            clearInterval(intervalId);
            navigate('/login', {
              replace: true,
              state: { error: 'Login fehlgeschlagen oder blockiert (Cookies/Adblock pruefen)' }
            });
          }
        }, 500);
      } catch (err) {
        console.error('[LoginCallback] fatal error', err);
        navigate('/login', {
          replace: true,
          state: { error: 'Login fehlgeschlagen' }
        });
      }
    };

    pollSession();

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [location.search, navigate]);

  return (
    <RedirectScreen
      title="Login wird verarbeitet..."
      subtitle="Du wirst gleich weitergeleitet."
      details="Wir richten dein Dashboard im Hintergrund ein."
      showHomeButton={false}
      showLogoutButton={false}
      showReloadButton={false}
    />
  );
};

export default LoginAuthentication;
