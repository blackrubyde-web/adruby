import { useState, useEffect } from 'react';
import { Loader2, Sparkles, CheckCircle, XCircle, Home, LogOut } from 'lucide-react';
import { apiClient } from '../../utils/apiClient';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

interface PaymentVerificationPageProps {
  sessionId?: string;
  onVerificationSuccess: () => void;
  onVerificationError?: () => void;
  onGoHome?: () => void;
  onLogout?: () => void;
}

export function PaymentVerificationPage({
  sessionId,
  onVerificationSuccess,
  onVerificationError,
  onGoHome,
  onLogout,
}: PaymentVerificationPageProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your payment...');
  const { user, refreshProfile } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const effectiveSessionId =
      sessionId ?? new URLSearchParams(window.location.search).get('session_id') ?? undefined;

    type ProfileRow = {
      payment_verified?: boolean | null;
      onboarding_completed?: boolean | null;
      trial_status?: string | null;
      trial_expires_at?: string | null;
      trial_ends_at?: string | null;
    };

    const checkDbFlag = async () => {
      if (!user?.id) return false;

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('payment_verified,onboarding_completed,trial_status,trial_expires_at,trial_ends_at')
          .eq('id', user.id)
          .single();

        if (error) return false;

        const row = data as ProfileRow | null;
        const trialEndsAt = row?.trial_expires_at || row?.trial_ends_at || null;
        const trialActive =
          row?.trial_status === 'active' && trialEndsAt
            ? new Date(trialEndsAt).getTime() > Date.now()
            : false;

        return Boolean(row?.payment_verified || row?.onboarding_completed || trialActive);
      } catch {
        return false;
      }
    };

    const setErrorState = (msg: string) => {
      if (cancelled) return;
      setStatus('error');
      setMessage(msg);
      onVerificationError?.();
    };

    const verify = async () => {
      try {
        // If there's no session_id, we can only rely on DB flags (requires login)
        if (!effectiveSessionId) {
          setMessage('Checking your account status...');
          const ok = await checkDbFlag();
          if (!ok) {
            setErrorState(user ? 'Payment required. Start checkout in Billing.' : 'Login required to verify billing.');
            return;
          }

          if (!cancelled) {
            setStatus('success');
            setMessage('Account verified!');
          }
          await refreshProfile().catch(() => undefined);
          setTimeout(() => !cancelled && onVerificationSuccess(), 800);
          return;
        }

        // With session_id we verify via Stripe, but requires an authenticated user.
        if (!user) {
          setErrorState('Login required to verify billing.');
          return;
        }

        setMessage('Verifying your payment with Stripe...');

        let lastOk = false;
        for (let attempt = 0; attempt < 8; attempt += 1) {
          const data = await apiClient.post<{ ok: boolean; status?: string }>(
            '/api/verify-checkout-session',
            { sessionId: effectiveSessionId }
          );

          lastOk = Boolean(data?.ok);
          if (lastOk) break;
          if (cancelled) return;
          setMessage('Payment pending... waiting for confirmation');
          await sleep(2000);
        }

        if (!lastOk) {
          // Fallback: if user is logged in, check DB flags (webhook might have updated it).
          const ok = await checkDbFlag();
          if (!ok) {
            setErrorState('Payment verification failed or is still pending. Please refresh in a moment.');
            return;
          }
        }

        if (!cancelled) {
          setStatus('success');
          setMessage('Payment verified successfully!');
        }
        await refreshProfile().catch(() => undefined);
        setTimeout(() => !cancelled && onVerificationSuccess(), 1200);
      } catch (error: unknown) {
        setErrorState(error instanceof Error ? error.message : 'Payment verification failed');
      }
    };

    verify();

    return () => {
      cancelled = true;
    };
  }, [sessionId, user, refreshProfile, onVerificationSuccess, onVerificationError]);

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

        {/* Status Icon */}
        <div className="mb-8 flex items-center justify-center">
          {status === 'loading' && (
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
          )}
          {status === 'success' && (
            <div className="relative">
              <CheckCircle className="w-16 h-16 text-green-600 animate-pulse" />
              <div className="absolute inset-0 bg-green-600/20 rounded-full animate-ping" />
            </div>
          )}
          {status === 'error' && (
            <XCircle className="w-16 h-16 text-red-600 animate-pulse" />
          )}
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold mb-4">
          {status === 'loading' && 'Verifying Payment'}
          {status === 'success' && 'Verification Complete!'}
          {status === 'error' && 'Verification Failed'}
        </h2>
        <p className="text-muted-foreground mb-8">
          {message}
        </p>

        {/* Loading Progress */}
        {status === 'loading' && (
          <div className="w-full max-w-xs mx-auto">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-red-600 rounded-full animate-pulse" />
            </div>
          </div>
        )}

        {/* Error Actions */}
        {status === 'error' && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            {onGoHome && (
              <button
                onClick={onGoHome}
                className="w-full sm:w-auto px-6 py-3 border-2 border-border rounded-xl font-medium hover:bg-accent transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Go Home
              </button>
            )}
            {onLogout && (
              <button
                onClick={onLogout}
                className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            )}
          </div>
        )}

        {/* Success Message */}
        {status === 'success' && (
          <div className="mt-8 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <p className="text-sm text-green-600">
              Redirecting you to your dashboard...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
