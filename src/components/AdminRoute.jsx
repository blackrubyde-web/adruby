import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import RedirectScreen from './RedirectScreen.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

const AdminRoute = ({ children }) => {
  const location = useLocation();
  const { user, userProfile, isAuthReady, loading } = useAuth();
  const isAdmin = userProfile?.role === 'admin';

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
    return <Navigate to="/login-authentication" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/overview-dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
