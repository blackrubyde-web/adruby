import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RedirectScreen from './RedirectScreen';

const ProtectedRoute = ({ children }) => {
  const { user, isAuthReady } = useAuth();
  const location = useLocation();
  const redirect = `${location.pathname}${location.search}`;

  if (!isAuthReady) {
    return (
      <RedirectScreen
        title="Anmeldung wird geladen…"
        subtitle="Bitte einen Moment Geduld."
        details="Wir prüfen deine Sitzung und laden dein Konto."
        showHomeButton={false}
        showLogoutButton={false}
      />
    );
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  return children;
};

export default ProtectedRoute;
