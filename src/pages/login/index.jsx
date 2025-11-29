import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirect = params.get('redirect') || '/overview-dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Willkommen zurück</h1>
          <p className="text-slate-300 text-sm">Melde dich an, um dein Dashboard zu öffnen.</p>
        </div>

        <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-slate-300">E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 text-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 text-slate-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-slate-950 px-4 py-3 rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-60"
          >
            {loading ? 'Einloggen…' : 'Einloggen'}
          </button>
        </form>

        <div className="flex items-center space-x-3 text-slate-500">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-xs">oder</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-slate-100 text-slate-900 px-4 py-3 rounded-lg font-medium hover:bg-white transition"
        >
          Mit Google anmelden
        </button>

        <p className="text-xs text-slate-500 text-center">AdRuby – KI-gestützte Ad Intelligence</p>
      </div>
    </div>
  );
};

export default LoginPage;
