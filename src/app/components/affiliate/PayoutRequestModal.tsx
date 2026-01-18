import { useState } from 'react';
import { X, Wallet, Loader2, CheckCircle2, AlertTriangle, CreditCard, Building2 } from 'lucide-react';
import { useAffiliate } from '../../contexts/AffiliateContext';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

interface PayoutRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PAYOUT_METHODS = [
    { id: 'paypal', label: 'PayPal', icon: CreditCard, description: 'Schnellste Option (1-2 Werktage)' },
    { id: 'bank_transfer', label: 'Banküberweisung', icon: Building2, description: 'SEPA Transfer (3-5 Werktage)' },
] as const;

export function PayoutRequestModal({ isOpen, onClose }: PayoutRequestModalProps) {
    const { stats, requestPayout } = useAffiliate();
    const [payoutMethod, setPayoutMethod] = useState<'paypal' | 'bank_transfer'>('paypal');
    const [amount, setAmount] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const availableBalance = stats?.pending_earnings || 0;
    const minPayout = 50;
    const canRequestPayout = availableBalance >= minPayout;

    const handleSubmit = async () => {
        if (amount < minPayout || amount > availableBalance) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const result = await requestPayout(amount, payoutMethod);
            if (result.success) {
                setSuccess(true);
            } else {
                setError(result.error || 'Payout request failed');
            }
        } catch (err) {
            setError('Ein Fehler ist aufgetreten');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setSuccess(false);
        setError(null);
        setAmount(0);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <Card className="w-full max-w-lg bg-card border-border shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Wallet className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Auszahlung beantragen</h2>
                            <p className="text-sm text-muted-foreground">Verfügbar: €{availableBalance.toFixed(2)}</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {success ? (
                        <div className="text-center py-8 space-y-4">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-bold">Auszahlung beantragt!</h3>
                            <p className="text-muted-foreground">
                                €{amount.toFixed(2)} wird in den nächsten {payoutMethod === 'paypal' ? '1-2' : '3-5'} Werktagen überwiesen.
                            </p>
                            <Button onClick={handleClose} className="mt-4">Schließen</Button>
                        </div>
                    ) : !canRequestPayout ? (
                        <div className="text-center py-8 space-y-4">
                            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
                                <AlertTriangle className="w-8 h-8 text-amber-500" />
                            </div>
                            <h3 className="text-xl font-bold">Mindestbetrag nicht erreicht</h3>
                            <p className="text-muted-foreground">
                                Du benötigst mindestens €{minPayout} für eine Auszahlung.
                                <br />Aktuell verfügbar: €{availableBalance.toFixed(2)}
                            </p>
                            <Button variant="outline" onClick={handleClose} className="mt-4">Verstanden</Button>
                        </div>
                    ) : (
                        <>
                            {/* Amount Selection */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium">Auszahlungsbetrag</label>
                                <div className="flex gap-2">
                                    {[availableBalance * 0.5, availableBalance * 0.75, availableBalance].map((preset, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setAmount(Math.floor(preset))}
                                            className={cn(
                                                "flex-1 py-3 rounded-xl border text-sm font-semibold transition-all",
                                                amount === Math.floor(preset)
                                                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                                                    : "border-border hover:border-emerald-500/50"
                                            )}
                                        >
                                            {i === 2 ? 'Alles' : `${Math.round((i + 1) * 0.25 * 100 + 25)}%`}
                                            <br />
                                            <span className="text-xs opacity-70">€{Math.floor(preset)}</span>
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="number"
                                    value={amount || ''}
                                    onChange={(e) => setAmount(Math.min(Number(e.target.value), availableBalance))}
                                    placeholder={`Min. €${minPayout}`}
                                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-lg font-bold text-center"
                                />
                            </div>

                            {/* Payment Method */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium">Zahlungsmethode</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {PAYOUT_METHODS.map((method) => (
                                        <button
                                            key={method.id}
                                            onClick={() => setPayoutMethod(method.id)}
                                            className={cn(
                                                "p-4 rounded-xl border text-left transition-all",
                                                payoutMethod === method.id
                                                    ? "border-emerald-500 bg-emerald-500/10"
                                                    : "border-border hover:border-emerald-500/50"
                                            )}
                                        >
                                            <method.icon className={cn(
                                                "w-6 h-6 mb-2",
                                                payoutMethod === method.id ? "text-emerald-500" : "text-muted-foreground"
                                            )} />
                                            <div className="font-semibold text-sm">{method.label}</div>
                                            <div className="text-xs text-muted-foreground">{method.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Submit */}
                            <Button
                                onClick={handleSubmit}
                                disabled={amount < minPayout || isSubmitting}
                                className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-emerald-500 to-teal-600"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Wird verarbeitet...
                                    </>
                                ) : (
                                    <>
                                        <Wallet className="w-5 h-5" />
                                        €{amount || 0} auszahlen
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
}
