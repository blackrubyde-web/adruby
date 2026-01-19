import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, Loader2, Download, RefreshCw } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { useAffiliate } from '../../contexts/AffiliateContext';

interface Payout {
    id: string;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    payoutMethod: string;
    requestedAt: string;
    processedAt: string | null;
    reference: string | null;
}

const STATUS_CONFIG = {
    pending: { label: 'Ausstehend', color: 'bg-amber-500/10 text-amber-500', icon: Clock },
    processing: { label: 'In Bearbeitung', color: 'bg-blue-500/10 text-blue-500', icon: RefreshCw },
    completed: { label: 'Abgeschlossen', color: 'bg-emerald-500/10 text-emerald-500', icon: CheckCircle2 },
    failed: { label: 'Fehlgeschlagen', color: 'bg-red-500/10 text-red-500', icon: XCircle },
};

export function PayoutHistory() {
    const { payouts: contextPayouts } = useAffiliate();
    const [isLoading, setIsLoading] = useState(true);
    const [payouts, setPayouts] = useState<Payout[]>([]);

    useEffect(() => {
        // Use real data from context instead of mock data
        const timer = setTimeout(() => {
            if (contextPayouts && contextPayouts.length > 0) {
                const mappedPayouts: Payout[] = contextPayouts.map((p, index) => ({
                    id: p.id || String(index),
                    amount: p.amount || 0,
                    status: p.status || 'pending',
                    payoutMethod: p.payout_method || 'bank_transfer',
                    requestedAt: p.requested_at || new Date().toISOString(),
                    processedAt: p.processed_at || null,
                    reference: p.payout_reference || null,
                }));
                setPayouts(mappedPayouts);
            } else {
                // No payouts yet - show empty state
                setPayouts([]);
            }
            setIsLoading(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [contextPayouts]);

    const totalPaidOut = payouts
        .filter(p => p.status === 'completed')
        .reduce((acc, p) => acc + p.amount, 0);

    const pendingAmount = payouts
        .filter(p => p.status === 'pending' || p.status === 'processing')
        .reduce((acc, p) => acc + p.amount, 0);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">Gesamt ausgezahlt</div>
                    <div className="text-2xl font-bold text-emerald-500">€{totalPaidOut.toFixed(2)}</div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">Ausstehend</div>
                    <div className="text-2xl font-bold text-amber-500">€{pendingAmount.toFixed(2)}</div>
                </Card>
            </div>

            {/* Payout List */}
            <div className="space-y-3">
                {payouts.length === 0 ? (
                    <Card className="p-8 text-center">
                        <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-bold mb-2">Keine Auszahlungen</h3>
                        <p className="text-muted-foreground">Du hast noch keine Auszahlungen beantragt.</p>
                    </Card>
                ) : (
                    payouts.map((payout) => {
                        const StatusIcon = STATUS_CONFIG[payout.status].icon;
                        return (
                            <Card key={payout.id} className="p-4">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center",
                                        STATUS_CONFIG[payout.status].color.split(' ')[0]
                                    )}>
                                        <StatusIcon className={cn("w-5 h-5", STATUS_CONFIG[payout.status].color.split(' ')[1])} />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">€{payout.amount.toFixed(2)}</span>
                                            <Badge className={cn("text-[10px]", STATUS_CONFIG[payout.status].color)}>
                                                {STATUS_CONFIG[payout.status].label}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {payout.payoutMethod === 'paypal' ? 'PayPal' : 'Banküberweisung'}
                                            {payout.reference && ` • ${payout.reference}`}
                                        </div>
                                    </div>

                                    <div className="text-right text-sm">
                                        <div className="text-muted-foreground">
                                            {new Date(payout.requestedAt).toLocaleDateString('de-DE')}
                                        </div>
                                        {payout.processedAt && (
                                            <div className="text-emerald-500 text-xs">
                                                Ausgezahlt: {new Date(payout.processedAt).toLocaleDateString('de-DE')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Download Statement */}
            {payouts.length > 0 && (
                <Button variant="outline" className="w-full gap-2">
                    <Download className="w-4 h-4" />
                    Auszahlungs-Übersicht herunterladen (PDF)
                </Button>
            )}
        </div>
    );
}
