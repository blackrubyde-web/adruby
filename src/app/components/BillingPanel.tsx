import { useMemo, useState } from 'react';
import { CreditCard, ExternalLink, RefreshCw, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../utils/apiClient';
import { startStripeCheckout } from '../lib/stripeService';

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(iso)
    );
  } catch {
    return iso;
  }
}

export function BillingPanel() {
  const { user, profile, billing, refreshProfile, isLoading } = useAuth();
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  const credits = profile?.credits ?? null;
  const customerId = profile?.stripe_customer_id ?? null;

  const callToAction = useMemo(() => {
    if (!user) return { title: 'Login required', subtitle: 'Please sign in to manage billing.' };
    if (billing.isSubscribed) return { title: 'Billing active', subtitle: 'Your account is ready.' };
    return { title: 'Setup required', subtitle: 'Start checkout to unlock the app.' };
  }, [billing.isSubscribed, user]);

  const startCheckout = async () => {
    if (!user?.id || !user.email) {
      toast.error('Please sign in first');
      return;
    }

    setIsStartingCheckout(true);
    try {
      const { url } = await startStripeCheckout(user.id, user.email);
      window.location.href = url;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to start checkout');
    } finally {
      setIsStartingCheckout(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!user?.id) {
      toast.error('Please sign in first');
      return;
    }

    setIsOpeningPortal(true);
    try {
      const data = await apiClient.post<{ url: string }>('/api/create-customer-portal-session', {
        userId: user.id,
        returnUrl: `${window.location.origin}/settings`
      });

      if (!data?.url) throw new Error('Portal URL missing');
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to open customer portal');
    } finally {
      setIsOpeningPortal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-foreground mb-2">Billing & Subscription</h2>
        <p className="text-sm text-muted-foreground">
          {callToAction.subtitle}
        </p>
      </div>

      {/* Status */}
      <div className="p-6 bg-gradient-to-br from-primary/10 to-transparent border-2 border-primary/20 rounded-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-foreground">Pro Plan</h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  billing.isSubscribed ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                }`}
              >
                {billing.statusLabel}
              </span>
            </div>
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              {credits != null && (
                <div>Credits: <span className="text-foreground font-semibold">{credits}</span></div>
              )}
              {billing.trialEndsAt && (
                <div>
                  Trial ends: <span className="text-foreground font-semibold">{formatDate(billing.trialEndsAt)}</span>
                </div>
              )}
              {customerId && (
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Stripe customer linked</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={() => refreshProfile().catch(() => undefined)}
              disabled={isLoading}
              className="px-4 py-2.5 bg-muted hover:bg-muted/80 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>

            {!billing.isSubscribed && (
              <button
                onClick={startCheckout}
                disabled={isStartingCheckout}
                className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:scale-105 transition-all disabled:opacity-50"
              >
                {isStartingCheckout ? 'Starting...' : 'Start checkout'}
              </button>
            )}

            {customerId && (
              <button
                onClick={openCustomerPortal}
                disabled={isOpeningPortal}
                className="px-4 py-2.5 bg-muted hover:bg-muted/80 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ExternalLink className="w-4 h-4" />
                Portal
              </button>
            )}
          </div>
        </div>
      </div>

      {!billing.isSubscribed && (
        <div className="p-5 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-foreground">Setup required</div>
            <div className="text-sm text-muted-foreground mt-1">
              Your subscription is not active yet. Start checkout or wait for payment verification to complete.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
