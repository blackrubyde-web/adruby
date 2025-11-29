import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const LoginAuthentication = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('[LoginCallback] start', { search: location.search });

    const run = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data?.session) {
          console.error('[LoginCallback] getSession error', error);
          navigate('/login', { replace: true, state: { error: 'Login fehlgeschlagen' } });
          return;
        }

        const params = new URLSearchParams(location.search);
        const redirect = params.get('redirect') || '/overview-dashboard';

        console.log('[LoginCallback] session found, redirecting', { redirect });
        navigate(redirect, { replace: true });
      } catch (err) {
        console.error('[LoginCallback] error', err);
        navigate('/login', { replace: true, state: { error: 'Login fehlgeschlagen' } });
      }
    };

    run();
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-6 py-10">
      <div className="text-center space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
        <h1 className="text-lg font-semibold">Login wird verarbeitet…</h1>
        <p className="text-sm text-slate-400">Du wirst gleich weitergeleitet.</p>
      </div>
    </div>
  );
};

export default LoginAuthentication;
