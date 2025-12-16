import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import usePreferredTheme from '../hooks/usePreferredTheme';

const RedirectScreen = ({
  title = 'Bitte warten...',
  subtitle = '',
  details = '',
  showHomeButton = true,
  showLogoutButton = false,
  showReloadButton = false
}) => {
  const navigate = useNavigate();
  const theme = usePreferredTheme();
  const isDark = theme === 'dark';

  const bgClass = isDark ? 'bg-slate-950 text-slate-50' : 'bg-white text-slate-900';
  const gradient = isDark
    ? 'bg-[radial-gradient(circle_at_20%_15%,rgba(248,113,113,0.12),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.08),transparent_35%)]'
    : 'bg-[radial-gradient(circle_at_20%_15%,rgba(248,113,113,0.12),transparent_50%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.12),transparent_40%)]';
  const cardClasses = isDark
    ? 'bg-slate-900/85 backdrop-blur-lg border border-slate-800 text-slate-50 shadow-[0_25px_60px_-30px_rgba(0,0,0,0.8)]'
    : 'bg-white/90 backdrop-blur-lg border border-slate-200 text-slate-900 shadow-[0_22px_60px_-32px_rgba(15,23,42,0.35)]';
  const subtleText = isDark ? 'text-slate-400' : 'text-slate-600';
  const buttonBase = 'px-4 py-2 rounded-lg text-sm font-medium transition-smooth border';
  const neutralButtonClasses = isDark
    ? `${buttonBase} border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700`
    : `${buttonBase} border-slate-300 bg-white text-slate-800 hover:bg-slate-50`;
  const logoutButtonClasses = isDark
    ? `${buttonBase} border-rose-500/70 bg-rose-500 text-white hover:bg-rose-600`
    : `${buttonBase} border-rose-200 bg-rose-500 text-white hover:bg-rose-600`;

  const handleHome = () => navigate('/', { replace: true });

  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[RedirectScreen] logout failed', err);
    } finally {
      navigate('/', { replace: true });
    }
  };

  return (
    <div
      className={`relative min-h-screen ${bgClass} flex items-center justify-center px-6 py-10 overflow-hidden`}
    >
      <div className={`absolute inset-0 ${gradient}`} aria-hidden="true" />
      <div
        className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-rose-500/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-[-140px] right-[-140px] h-[420px] w-[420px] rounded-full bg-indigo-500/10 blur-3xl"
        aria-hidden="true"
      />
      <div className={`relative max-w-md w-full rounded-2xl p-10 shadow-xl ${cardClasses}`}>
        <div
          className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-rose-400/70 to-transparent"
          aria-hidden="true"
        />
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-5 flex items-center justify-center">
            <div className="absolute h-16 w-16 rounded-full bg-rose-500/20 blur-2xl" aria-hidden="true" />
            <div className="h-12 w-12 rounded-full border-2 border-rose-400/80 border-t-transparent animate-spin" />
          </div>
          {title && <h1 className="text-xl font-semibold">{title}</h1>}
          {subtitle && <p className={`text-sm mt-1 ${subtleText}`}>{subtitle}</p>}
          {details && <p className={`text-xs mt-3 leading-relaxed ${subtleText}`}>{details}</p>}
        </div>

        {(showHomeButton || showLogoutButton || showReloadButton) && (
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            {showHomeButton && (
              <button
                onClick={handleHome}
                className={neutralButtonClasses}
              >
                Zur Startseite
              </button>
            )}
            {showReloadButton && (
              <button
                onClick={handleReload}
                className={neutralButtonClasses}
              >
                Neu laden
              </button>
            )}
            {showLogoutButton && (
              <button
                onClick={handleLogout}
                className={logoutButtonClasses}
              >
                Abmelden
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RedirectScreen;
