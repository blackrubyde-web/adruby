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
    ? 'bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.18),transparent_60%)]'
    : 'bg-gradient-to-br from-white via-slate-50 to-slate-100';
  const cardClasses = isDark
    ? 'bg-slate-900/90 border border-slate-700 text-slate-50'
    : 'bg-white border border-slate-200 text-slate-900';
  const subtleText = isDark ? 'text-slate-400' : 'text-slate-500';

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
    <div className={`relative min-h-screen ${bgClass} flex items-center justify-center px-6 py-10`}>
      <div className={`absolute inset-0 ${gradient}`} aria-hidden="true" />
      <div
        className="absolute top-0 left-0 w-[620px] h-[620px] bg-[radial-gradient(circle_at_top_left,rgba(255,0,0,0.05),transparent)] pointer-events-none"
        aria-hidden="true"
      />
      <div className={`relative max-w-md w-full rounded-2xl p-10 shadow-xl ${cardClasses}`}>
        <div className="flex items-center justify-center mb-4">
          <div className="h-12 w-12 rounded-full border-2 border-rose-400 border-t-transparent animate-spin" />
        </div>
        {title && <h1 className="text-xl font-semibold text-center">{title}</h1>}
        {subtitle && <p className={`text-sm text-center mt-1 ${subtleText}`}>{subtitle}</p>}
        {details && <p className={`text-xs text-center mt-2 leading-relaxed ${subtleText}`}>{details}</p>}

        {(showHomeButton || showLogoutButton || showReloadButton) && (
          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            {showHomeButton && (
              <button
                onClick={handleHome}
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 transition text-sm font-medium"
              >
                Zur Startseite
              </button>
            )}
            {showReloadButton && (
              <button
                onClick={handleReload}
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 transition text-sm font-medium"
              >
                Neu laden
              </button>
            )}
            {showLogoutButton && (
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg border border-rose-200 bg-rose-500 text-white hover:bg-rose-600 transition text-sm font-medium"
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
