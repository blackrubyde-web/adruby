import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import usePreferredTheme from '../../hooks/usePreferredTheme';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirect = params.get('redirect') || '/overview-dashboard';
  const { user, isAuthReady } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const theme = usePreferredTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const autoRedirect = async () => {
      if (!isAuthReady || !user?.id) return;
      try {
        const { data, error: profileError } = await supabase
          .from('user_profiles')
          .select('payment_verified,onboarding_completed,role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          navigate(redirect, { replace: true });
          return;
        }

        const isAdmin = data?.role === 'admin';
        const isPaid = Boolean(data?.payment_verified || data?.onboarding_completed);
        if (isPaid) {
          navigate(redirect || (isAdmin ? '/admin-dashboard' : '/overview-dashboard'), { replace: true });
        } else {
          navigate('/payment-verification', { replace: true });
        }
      } catch {
        navigate(redirect, { replace: true });
      }
    };
    autoRedirect();
  }, [isAuthReady, user, navigate, redirect]);

  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        setError(signInError.message || 'Ungültige Anmeldedaten');
        setLoading(false);
        return;
      }

      if (data?.session) {
        navigate(`/login-authentication?redirect=${encodeURIComponent(redirect)}`, { replace: true });
      } else {
        setError('Keine aktive Session. Bitte erneut versuchen.');
      }
    } catch (err) {
      setError(err?.message || 'Login fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const redirectTo = `${window.location.origin}/login-authentication?redirect=${encodeURIComponent(
        redirect
      )}`;
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo }
      });
    } catch (err) {
      setError(err?.message || 'Google Login fehlgeschlagen');
    }
  };

  const bgClass = isDark ? 'bg-slate-950 text-slate-50' : 'bg-white text-slate-900';
  const gradient = isDark
    ? 'bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.18),transparent_60%)]'
    : 'bg-gradient-to-br from-white via-slate-50 to-slate-100';
  const cardClasses = isDark
    ? 'bg-slate-900/90 border border-slate-700 text-slate-50'
    : 'bg-white border border-slate-200 text-slate-900';
  const inputClasses = isDark
    ? 'w-full rounded-lg border border-slate-700 bg-slate-800 text-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500'
    : 'w-full rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500';
  const mutedText = isDark ? 'text-slate-300' : 'text-slate-600';
  const errorText = isDark ? 'text-red-400' : 'text-red-500';

  return (
    <div className={`relative min-h-screen ${bgClass} flex items-center justify-center px-6 py-10`}>
      <div className={`absolute inset-0 ${gradient}`} aria-hidden="true" />
      <div
        className="absolute top-0 left-0 w-[620px] h-[620px] bg-[radial-gradient(circle_at_top_left,rgba(255,0,0,0.05),transparent)] pointer-events-none"
        aria-hidden="true"
      />
      <div className={`relative max-w-md w-full rounded-2xl p-10 shadow-xl ${cardClasses}`}>
        <h1 className="text-2xl font-semibold text-center mb-2">Willkommen zurück</h1>
        <p className={`text-sm text-center mb-6 ${mutedText}`}>
          Melde dich an, um zum Dashboard zu gelangen.
        </p>

        <form className="space-y-4" onSubmit={handleEmailPasswordLogin}>
          <div className="space-y-2">
            <label className="text-sm font-medium">E-Mail</label>
            <input
              className={inputClasses}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Passwort</label>
            <input
              className={inputClasses}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className={`text-sm ${errorText}`}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-600 text-white py-3 rounded-lg font-semibold hover:bg-rose-700 transition-smooth disabled:opacity-70"
          >
            {loading ? 'Wird angemeldet…' : 'Anmelden'}
          </button>
        </form>

        <div className="mt-6">
          <button
            onClick={handleGoogleLogin}
            className="w-full border border-slate-300 text-slate-900 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-smooth flex items-center justify-center gap-2"
          >
            Mit Google anmelden
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
