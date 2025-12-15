import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RedirectScreen from './RedirectScreen';

const ProtectedRoute = ({ children }) => {
  const { user, isAuthReady, loading } = useAuth();
  const location = useLocation();
  const redirect = `${location.pathname}${location.search}`;
  const [showReload, setShowReload] = useState(false);

  useEffect(() => {
    if (!isAuthReady || loading) {
      const timer = setTimeout(() => setShowReload(true), 10000);
      return () => clearTimeout(timer);
    }
    setShowReload(false);
  }, [isAuthReady, loading]);

  if (!isAuthReady || loading) {
    return (
      <RedirectScreen
        title="Anmeldung wird geladen..."
        subtitle="Bitte einen Moment Geduld."
        details="Wir pruefen deine Sitzung und laden dein Konto."
        showHomeButton={false}
        showLogoutButton={false}
        showReloadButton={showReload}
      />
    );
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  return children;
};

export default ProtectedRoute;
