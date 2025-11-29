import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import usePreferredTheme from '../../hooks/usePreferredTheme';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirect = params.get('redirect') || '/overview-dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const theme = usePreferredTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    console.log('[LoginPage] mounted', { redirect });
  }, [redirect]);

  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    console.log('[LoginPage] email/password login attempt', { email });
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
    console.log('[LoginPage] google login clicked', { redirect });
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
  const buttonPrimary = isDark
    ? 'bg-rose-500 text-white hover:bg-rose-600'
    : 'bg-rose-500 text-white hover:bg-rose-600';
  const googleButton = 'bg-white text-slate-900 border border-slate-300';

  return (
    <div className={`relative min-h-screen ${bgClass} flex items-center justify-center px-6 py-12`}>
      <div className={`absolute inset-0 ${gradient}`} aria-hidden="true" />
      <div
        className="absolute top-0 left-0 w-[620px] h-[620px] bg-[radial-gradient(circle_at_top_left,rgba(255,0,0,0.05),transparent)] pointer-events-none"
        aria-hidden="true"
      />

      <div className={`relative w-full max-w-md rounded-2xl p-8 shadow-xl ${cardClasses} space-y-6`}>
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Willkommen zurück</h1>
          <p className={`${mutedText} text-sm`}>Melde dich an, um dein Dashboard zu öffnen.</p>
        </div>

        <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClasses}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClasses}
              required
            />
          </div>

          {error && <p className={`text-sm ${errorText}`}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-3 rounded-lg font-medium transition disabled:opacity-60 ${buttonPrimary}`}
          >
            {loading ? 'Einloggen…' : 'Einloggen'}
          </button>
        </form>

        <div className="flex items-center space-x-3 text-slate-400">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs">oder</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className={`w-full px-4 py-3 rounded-lg font-medium transition flex items-center justify-center gap-3 ${googleButton}`}
        >
          <span className="text-lg">G</span>
          <span>Mit Google anmelden</span>
        </button>

        <p className={`text-xs text-center ${mutedText}`}>AdRuby – KI-gestützte Ad Intelligence</p>
      </div>
    </div>
  );
};

export default LoginPage;
