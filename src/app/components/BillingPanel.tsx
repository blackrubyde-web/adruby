import { useMemo, useState } from 'react';
import { CreditCard, ExternalLink, RefreshCw, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthActions, useAuthState } from '../contexts/AuthContext';
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
  const { user, profile, billing, isLoading } = useAuthState();
  const { refreshProfile } = useAuthActions();
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  const credits = profile?.credits ?? null;
  const customerId = profile?.stripe_customer_id ?? null;

  const callToAction = useMemo(() => {
    if (!user) return { title: 'Anmeldung erforderlich', subtitle: 'Bitte melde dich an, um die Abrechnung zu verwalten.' };
    if (billing.isSubscribed) return { title: 'Abrechnung aktiv', subtitle: 'Dein Account ist einsatzbereit.' };
    return { title: 'Einrichtung erforderlich', subtitle: 'Starte den Checkout, um die App freizuschalten.' };
  }, [billing.isSubscribed, user]);

  const startCheckout = async () => {
    if (!user?.id || !user.email) {
      toast.error('Bitte melde dich zuerst an');
      return;
    }

    setIsStartingCheckout(true);
    try {
      const { url } = await startStripeCheckout(user.id, user.email);
      window.location.href = url;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Checkout konnte nicht gestartet werden');
    } finally {
      setIsStartingCheckout(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!user?.id) {
      toast.error('Bitte melde dich zuerst an');
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
      toast.error(err instanceof Error ? err.message : 'Kundenportal konnte nicht geöffnet werden');
    } finally {
      setIsOpeningPortal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-foreground mb-2">Abrechnung & Abonnement</h2>
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
                className={`px-3 py-1 rounded-full text-xs font-semibold ${billing.isSubscribed ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                  }`}
              >
                {billing.statusLabel}
              </span>
            </div>
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              {credits != null && (
                <div>Guthaben: <span className="text-foreground font-semibold">{credits}</span></div>
              )}
              {billing.trialEndsAt && (
                <div>
                  Trial endet: <span className="text-foreground font-semibold">{formatDate(billing.trialEndsAt)}</span>
                </div>
              )}
              {customerId && (
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Stripe-Kunde verknüpft</span>
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
              Aktualisieren
            </button>

            {!billing.isSubscribed && (
              <button
                onClick={startCheckout}
                disabled={isStartingCheckout}
                className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:scale-105 transition-all disabled:opacity-50"
              >
                {isStartingCheckout ? 'Wird gestartet…' : 'Checkout starten'}
              </button>
            )}

            {customerId && (
              <button
                onClick={openCustomerPortal}
                disabled={isOpeningPortal}
                className="px-4 py-2.5 bg-muted hover:bg-muted/80 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ExternalLink className="w-4 h-4" />
                Kundenportal
              </button>
            )}
          </div>
        </div>
      </div>

      {!billing.isSubscribed && (
        <div className="p-5 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-foreground">Einrichtung erforderlich</div>
            <div className="text-sm text-muted-foreground mt-1">
              Dein Abonnement ist noch nicht aktiv. Starte den Checkout oder warte, bis die Zahlungsbestätigung abgeschlossen ist.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
