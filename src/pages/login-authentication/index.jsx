import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import RedirectScreen from '../../components/RedirectScreen.jsx';

const LoginAuthentication = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile, isAuthReady, loading, signInWithGoogle } = useAuth();
  const from = location.state?.from?.pathname || null;

  useEffect(() => {
    if (!isAuthReady || loading) return;
    if (!user) return;

    const isAdmin = userProfile?.role === 'admin';
    const target = isAdmin ? '/admin-dashboard' : '/overview-dashboard';
    navigate(from || target, { replace: true });
  }, [user, userProfile, isAuthReady, loading, navigate, from]);

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('[Login] Google Sign-In failed', err);
    }
  };

  if (!isAuthReady || loading) {
    return (
      <RedirectScreen title="Lade Login…" subtitle="Bitte warten." />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Willkommen zurück</h1>
          <p className="text-slate-300 text-sm">Melde dich an, um dein Dashboard zu öffnen.</p>
        </div>
        <button
          onClick={handleGoogle}
          className="w-full bg-slate-100 text-slate-900 px-4 py-3 rounded-lg font-medium hover:bg-white transition"
        >
          Mit Google anmelden
        </button>
        <p className="text-xs text-slate-500 text-center">AdRuby – KI-gestützte Ad Intelligence</p>
      </div>
    </div>
  );
};

export default LoginAuthentication;
