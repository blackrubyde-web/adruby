import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import RedirectScreen from './RedirectScreen.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { user, isAuthReady, loading } = useAuth();

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
    return <Navigate to="/login-authentication" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
