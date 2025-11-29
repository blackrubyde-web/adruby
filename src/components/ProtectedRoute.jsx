import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import RedirectScreen from './RedirectScreen';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { user, isAuthReady, loading } = useAuth();
  const redirect = `${location.pathname}${location.search}`;

  if (!isAuthReady || loading) {
    return (
      <RedirectScreen
        title="Authentifizierung läuft…"
        subtitle="Wir bereiten dein Dashboard vor."
        details="Bitte einen Moment Geduld. Deine Sitzung wird geprüft."
      />
    );
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  return children;
};

export default ProtectedRoute;
