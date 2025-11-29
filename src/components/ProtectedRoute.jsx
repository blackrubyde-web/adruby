// FILE: src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import RedirectScreen from './RedirectScreen';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const {
    user,
    isAuthReady,
    loading,
    isSubscribed,
    isAdmin
  } = useAuth();

  const redirect = `${location.pathname}${location.search}`;

  // 1) Solange Auth/State geladen wird → neutraler Loading-Screen
  if (!isAuthReady || loading) {
    return (
      <RedirectScreen
        title="Authentifizierung läuft…"
        subtitle="Wir bereiten dein Dashboard vor."
        details="Bitte einen Moment Geduld. Deine Sitzung wird geprüft."
        showHomeButton={false}
        showLogoutButton={false}
      />
    );
  }

  // 2) Nicht eingeloggt → auf Login mit redirect zurück
  if (!user) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirect)}`}
        replace
      />
    );
  }

  // 3) Eingeloggt, aber KEIN aktives Abo/Trial → Payment-Fluss
  // Admins lassen wir durch, auch wenn Subscription kaputt ist
  if (!isAdmin && typeof isSubscribed === 'function' && !isSubscribed()) {
    return <Navigate to="/payment-verification" replace />;
  }

  // 4) Alles ok → Seite anzeigen
  return children;
};

export default ProtectedRoute;
