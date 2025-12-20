import { useEffect, useState } from 'react';
import { Loader2, Sparkles, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface AuthProcessingPageProps {
  message?: string;
  onComplete?: () => void;
}

export function AuthProcessingPage({ 
  message = 'Logging you in...',
  onComplete 
}: AuthProcessingPageProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  let mounted = true;
  let tries = 0;
  // Poll less frequently to reduce client load (400ms * 25 ~= 10s)
  const maxTries = 25; // ~10s

  const interval = setInterval(async () => {
      tries += 1;

      setProgress((prev) => Math.min(90, prev + 2));

      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;

        if (data.session) {
          clearInterval(interval);
          setProgress(100);
          setIsComplete(true);
          if (onComplete) setTimeout(onComplete, 500);
          return;
        }

        if (tries >= maxTries) {
          clearInterval(interval);
          setError('Could not verify your session. Please try again.');
        }
      } catch {
        if (!mounted) return;
        clearInterval(interval);
        setError('Auth check failed. Please try again.');
      }
  }, 400);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [onComplete]);

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
          {isComplete ? (
            <CheckCircle className="w-16 h-16 text-green-600 animate-pulse" />
          ) : (
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
          )}
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold mb-4">
          {error ? 'Error' : isComplete ? 'Success!' : message}
        </h2>
        <p className="text-muted-foreground mb-8">
          {error
            ? error
            : isComplete
              ? 'Redirecting you to your dashboard...'
              : 'Please wait while we set up your session'}
        </p>

        {/* Progress Bar */}
        <div className="w-full max-w-xs mx-auto">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-red-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-3">{progress}%</p>
        </div>
      </div>
    </div>
  );
}
