import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import usePreferredTheme from '../../hooks/usePreferredTheme';

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

const LoginAuthentication = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = usePreferredTheme();
  const isDark = theme === 'dark';

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

  const bgClass = isDark ? 'bg-slate-950 text-slate-50' : 'bg-white text-slate-900';
  const gradient = isDark
    ? 'bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.18),transparent_60%)]'
    : 'bg-gradient-to-br from-white via-slate-50 to-slate-100';
  const cardClasses = isDark
    ? 'bg-slate-900/90 border border-slate-700 text-slate-50'
    : 'bg-white border border-slate-200 text-slate-900';
  const subtitleClass = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`relative min-h-screen ${bgClass} flex items-center justify-center px-6 py-10`}>
      <div className={`absolute inset-0 ${gradient}`} aria-hidden="true" />
      <div
        className="absolute top-0 left-0 w-[520px] h-[520px] bg-[radial-gradient(circle_at_top_left,rgba(255,0,0,0.06),transparent)] pointer-events-none"
        aria-hidden="true"
      />
      <div className={`relative rounded-2xl p-10 max-w-md w-full text-center shadow-xl ${cardClasses}`}>
        <div className="flex items-center justify-center mb-4">
          <div className="h-12 w-12 rounded-full border-2 border-rose-400 border-t-transparent animate-spin" />
        </div>
        <h1 className="text-lg font-semibold">Login wird verarbeitet...</h1>
        <p className={`text-sm ${subtitleClass}`}>Du wirst gleich weitergeleitet.</p>
      </div>
    </div>
  );
};

export default LoginAuthentication;
