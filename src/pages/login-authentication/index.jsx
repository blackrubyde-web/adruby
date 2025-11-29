import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const getPreferredTheme = () => {
  if (typeof window === 'undefined') return 'light';
  const stored =
    localStorage.getItem('adruby_theme') ||
    localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

const LoginAuthentication = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = getPreferredTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    console.log('[LoginCallback] start', { search: location.search });

    const run = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data?.session) {
          console.error('[LoginCallback] getSession error', error);
          navigate('/login', {
            replace: true,
            state: { error: 'Login fehlgeschlagen' }
          });
          return;
        }

        const params = new URLSearchParams(location.search);
        const redirect = params.get('redirect') || '/overview-dashboard';

        console.log('[LoginCallback] session found, redirecting', { redirect });
        navigate(redirect, { replace: true });
      } catch (err) {
        console.error('[LoginCallback] error', err);
        navigate('/login', {
          replace: true,
          state: { error: 'Login fehlgeschlagen' }
        });
      }
    };

    run();
  }, [location.search, navigate]);

  const bgClass = isDark ? 'bg-slate-950 text-slate-50' : 'bg-white text-slate-800';
  const gradient = isDark
    ? 'from-slate-900/60 via-slate-950 to-slate-950'
    : 'from-white via-slate-50 to-slate-100';
  const cardClasses = isDark
    ? 'bg-slate-900 border border-slate-800 text-slate-50 shadow-xl'
    : 'bg-white border border-slate-200 text-slate-800 shadow-xl shadow-slate-200';
  const subtitleClass = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`relative min-h-screen ${bgClass} flex items-center justify-center px-6 py-10`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} aria-hidden="true" />
      {!isDark && (
        <div
          className="absolute top-0 left-0 w-[520px] h-[520px] bg-[radial-gradient(circle_at_top_left,rgba(255,0,0,0.06),transparent)] pointer-events-none"
          aria-hidden="true"
        />
      )}
      <div className={`relative rounded-2xl p-10 max-w-md w-full text-center ${cardClasses}`}>
        <div className="flex items-center justify-center mb-4">
          <div
            className={`animate-spin rounded-full h-10 w-10 border-b-2 ${
              isDark ? 'border-primary' : 'border-rose-500'
            }`}
          />
        </div>
        <h1 className="text-lg font-semibold">Login wird verarbeitet…</h1>
        <p className={`text-sm ${subtitleClass}`}>Du wirst gleich weitergeleitet.</p>
      </div>
    </div>
  );
};

export default LoginAuthentication;
