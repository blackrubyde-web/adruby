import { useEffect, useState } from 'react';
import { Loader2, Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuthState } from '../../contexts/AuthContext';

interface AuthProcessingPageProps {
  message?: string;
  onComplete?: () => void;
}

export function AuthProcessingPage({
  message = 'Du wirst angemeldet…',
  onComplete,
}: AuthProcessingPageProps) {
  const { isAuthReady, user } = useAuthState();
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Instead of polling supabase.auth.getSession() 30x, we simply listen to AuthContext
  useEffect(() => {
    if (!isAuthReady) return; // Still loading — wait

    if (user) {
      // Session confirmed by AuthContext — complete!
      setIsComplete(true);
      if (onComplete) setTimeout(onComplete, 600);
    } else {
      // Auth is ready but no user — something went wrong
      const timer = setTimeout(() => {
        setError('Anmeldung fehlgeschlagen. Bitte versuche es erneut.');
      }, 5000); // Give 5s grace period for PKCE exchange
      return () => clearTimeout(timer);
    }
  }, [isAuthReady, user, onComplete]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <span className="font-bold text-2xl">AdRuby</span>
        </div>

        {/* Loading Icon */}
        <div className="mb-8 flex items-center justify-center">
          {error ? (
            <AlertTriangle className="w-16 h-16 text-yellow-500" />
          ) : isComplete ? (
            <CheckCircle className="w-16 h-16 text-green-600 animate-pulse" />
          ) : (
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
          )}
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold mb-4">
          {error ? 'Fehler' : isComplete ? 'Erfolgreich!' : 'Anmelden…'}
        </h2>
        <p className="text-muted-foreground mb-8">
          {error
            ? error
            : isComplete
              ? 'Du wirst zum Dashboard weitergeleitet…'
              : message}
        </p>

        {/* Progress indicator */}
        {!error && !isComplete && (
          <div className="w-full max-w-xs mx-auto">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-gradient-to-r from-primary to-red-600 rounded-full animate-pulse" />
            </div>
          </div>
        )}

        {/* Retry link on error */}
        {error && (
          <button
            onClick={() => window.location.href = '/login'}
            className="mt-4 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            Zurück zum Login
          </button>
        )}
      </div>
    </div>
  );
}
