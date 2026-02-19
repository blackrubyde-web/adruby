import { useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Centralized Stripe checkout hook.
 * Replaces the 3× duplicated inline checkout in App.tsx.
 */
export function useStripeCheckout() {
    const startCheckout = useCallback(async (userId: string, email: string) => {
        try {
            const { startStripeCheckout } = await import('../lib/stripeService');
            const { url } = await startStripeCheckout(userId, email);
            window.location.href = url;
        } catch (err) {
            toast.error('Upgrade fehlgeschlagen. Bitte versuche es erneut.');
            console.error('[Stripe] checkout failed', err);
        }
    }, []);

    return { startCheckout };
}
