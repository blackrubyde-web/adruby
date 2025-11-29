import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import RedirectScreen from '../../components/RedirectScreen';
import usePreferredTheme from '../../hooks/usePreferredTheme';

const LoginAuthentication = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = usePreferredTheme();
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

/*
[Flow-Analyse]
- Dashboard-Redirect: Sowohl Email/Passwort-Login als auch Google-Login leiten nach erfolgreicher Session immer auf den redirect-Param (Standard: /overview-dashboard), ohne Prüfungen auf Payment/Onboarding.
- Payment-Verification: Wird nirgends automatisch angesteuert; nur wer explizit auf /payment-verification navigiert, landet dort.
- Unbezahlte Nutzer: ProtectedRoute/AdminRoute prüfen keinen Zahlungsstatus, daher kann ein User mit fehlender/kaptter Zahlung direkt im Dashboard landen.
- /payment-verification ohne session_id: führt sofort zu navigate('/', { replace: true }) – kein endloser Loader.
- Entscheidungslogik Dashboard vs. Payment/Onboarding sitzt aktuell allein in den Redirects (Login -> /login-authentication -> redirect) und nicht in Guards; Payment-Status wird dabei ignoriert.
- Potenzielle Bugs: fehlendes Payment-Gate in ProtectedRoute/AdminRoute; redirect-Flow überspringt jegliche Payment-/Onboarding-Checks.

[Payment/Subskriptions-Felder – Kurzfassung]
- Tabelle: public.user_profiles
- Relevante Felder aus Migrationen:
  * trial_status (inactive | pending_verification | active | expired)
  * trial_started_at, trial_expires_at (Ende der Testphase)
  * payment_verified (BOOLEAN)
  * onboarding_completed (BOOLEAN)
  * verification_method (stripe_card | paypal | null)
  * stripe_customer_id (TEXT)
  * stripe_subscription_id (TEXT)
  * subscription_status (TEXT, Migration 20250101090000, wird aktuell nicht genutzt)
  * trial_ends_at (TIMESTAMPTZ, Migration 20250101090000, im Code nicht genutzt)
- Ableitung im AuthContext:
  * subscriptionStatus = 'active' wenn payment_verified ODER onboarding_completed
  * subscriptionStatus = 'trialing' wenn trial_status == 'active' UND trial_expires_at in Zukunft
  * isSubscribed() gibt true zurück, wenn subscriptionStatus 'active' ODER ('trialing' und nicht abgelaufen)
- Aktuelle Entscheidung „User hat aktive Zahlung“ basiert faktisch auf payment_verified/onboarding_completed oder aktiver Trial; subscription_status-Feld aus der Migration bleibt ungenutzt.
*/
