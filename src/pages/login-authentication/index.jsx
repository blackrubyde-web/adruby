import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import RedirectScreen from '../../components/RedirectScreen';
import usePreferredTheme from '../../hooks/usePreferredTheme';
import { useAuth } from '../../contexts/AuthContext';

const LoginAuthentication = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = usePreferredTheme();
  const isDark = theme === 'dark';
  const { user, isAuthReady } = useAuth();

  useEffect(() => {
    const finish = async (sessionUser) => {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', sessionUser.id)
          .single();

        if (profileError) {
          console.error('[LoginCallback] failed to load profile for redirect', profileError);
        }

        const isAdmin = profile?.role === 'admin';
        const params = new URLSearchParams(location.search);
        const redirectParam = params.get('redirect');
        const finalRedirect =
          redirectParam || (isAdmin ? '/admin-dashboard' : '/overview-dashboard');

        navigate(finalRedirect, { replace: true });
      } catch (err) {
        console.error('[LoginCallback] error', err);
        navigate('/login', {
          replace: true,
          state: { error: 'Login fehlgeschlagen' }
        });
      }
    };

    const run = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (data?.session?.user) {
        await finish(data.session.user);
        return;
      }

      if (error) {
        console.error('[LoginCallback] getSession error', error);
      }

      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          finish(session.user);
        }
      });

      const timer = setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: { error: 'Login fehlgeschlagen oder abgebrochen' }
        });
      }, 8000);

      return () => {
        clearTimeout(timer);
        authListener?.subscription?.unsubscribe();
      };
    };

    run();
  }, [location.search, navigate]);

  useEffect(() => {
    if (isAuthReady && user?.id) {
      navigate('/overview-dashboard', { replace: true });
    }
  }, [isAuthReady, user, navigate]);

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
        <h1 className="text-lg font-semibold">Login wird verarbeitet…</h1>
        <p className={`text-sm ${subtitleClass}`}>Du wirst gleich weitergeleitet.</p>
      </div>
    </div>
  );
};

export default LoginAuthentication;
