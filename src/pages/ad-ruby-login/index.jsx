import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import usePreferredTheme from '../../hooks/usePreferredTheme';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirectParam = params.get('redirect');

  const { signIn, signInWithGoogle, user, isAuthReady, isSubscribed } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState('');

  const theme = usePreferredTheme();
  const isDark = theme === 'dark';

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
  const buttonPrimary = 'bg-rose-500 text-white hover:bg-rose-600';
  const googleButton = 'bg-white text-slate-900 border border-slate-300';

  const redirectAfterLogin = () => {
    const hasSub = typeof isSubscribed === 'function' ? isSubscribed() : false;

    if (redirectParam) {
      navigate(redirectParam, { replace: true });
    } else if (hasSub) {
      navigate('/overview-dashboard', { replace: true });
    } else {
      navigate('/payment-verification', { replace: true });
    }
  };

  useEffect(() => {
    if (!isAuthReady) return;
    if (user) {
      console.log('[LoginPage] user already logged in, redirecting…');
      redirectAfterLogin();
    }
  }, [user, isAuthReady]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoadingForm(true);

    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(signInError.message || 'Ungültige Anmeldedaten');
        return;
      }
      redirectAfterLogin();
    } catch (err) {
      setError(err?.message || 'Login fehlgeschlagen');
    } finally {
      setLoadingForm(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoadingGoogle(true);

    try {
      const { error: googleError } = await signInWithGoogle();
      if (googleError) {
        throw googleError;
      }
      // Redirect macht Supabase über OAuth selbst; danach greift wieder AuthContext + useEffect
    } catch (err) {
      console.error('[LoginPage] Google login error', err);
      setError(err?.message || 'Google Login fehlgeschlagen');
      setLoadingGoogle(false);
    }
  };

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
            disabled={loadingForm || loadingGoogle}
            className={`w-full px-4 py-3 rounded-lg font-medium transition disabled:opacity-60 ${buttonPrimary}`}
          >
            {loadingForm ? 'Einloggen…' : 'Einloggen'}
          </button>
        </form>

        <div className="flex items-center space-x-3 text-slate-400">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs">oder</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loadingForm || loadingGoogle}
          className={`w-full px-4 py-3 rounded-lg font-medium transition flex items-center justify-center gap-3 ${googleButton}`}
        >
          {loadingGoogle ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-600 rounded-full animate-spin" />
              <span>Google-Anmeldung…</span>
            </>
          ) : (
            <>
              <span className="text-lg">G</span>
              <span>Mit Google anmelden</span>
            </>
          )}
        </button>

        <p className={`text-xs text-center ${mutedText}`}>
          AdRuby – KI-gestützte Ad Intelligence
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
