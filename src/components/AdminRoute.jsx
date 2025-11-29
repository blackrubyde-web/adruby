import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import RedirectScreen from './RedirectScreen';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const location = useLocation();
  const { user, userProfile, isAuthReady, loading } = useAuth();
  const isAdmin = userProfile?.role === 'admin';
  const redirect = `${location.pathname}${location.search}`;

  if (!isAuthReady || loading) {
    return (
      <RedirectScreen
        title="Admin-Prüfung läuft…"
        subtitle="Wir prüfen deine Berechtigungen."
        details="Bitte einen Moment Geduld."
      />
    );
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/overview-dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
