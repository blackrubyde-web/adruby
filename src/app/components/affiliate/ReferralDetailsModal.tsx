import { useState, useEffect } from 'react';
import { X, TrendingUp, CreditCard, Calendar, Activity, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'sonner';

interface ReferralDetails {
    id: string;
    user_name: string;
    user_email: string;
    status: string;
    created_at: string;
    total_credits_purchased: number;
    lifetime_value: number;
    last_active: string;
    conversion_rate: number;
    credit_history: CreditPurchase[];
}

interface CreditPurchase {
    id: string;
    amount: number;
    credits: number;
    date: string;
    method: string;
}

interface Props {
    referralId: string;
    onClose: () => void;
}

export function ReferralDetailsModal({ referralId, onClose }: Props) {
    const [details, setDetails] = useState<ReferralDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadReferralDetails();
    }, [referralId]);

    const loadReferralDetails = async () => {
        setIsLoading(true);
        try {
            // Fetch referral user data
            const { data: userData, error: userError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', referralId)
                .single();

            if (userError) throw userError;

            // TODO: Fetch credit purchase history from payments table when available
            // For now, mock data
            const mockCreditHistory: CreditPurchase[] = [
                {
                    id: '1',
                    amount: 9.99,
                    credits: 100,
                    date: new Date().toISOString(),
                    method: 'Stripe'
                }
            ];

            const totalCredits = mockCreditHistory.reduce((sum, p) => sum + p.credits, 0);
            const totalSpent = mockCreditHistory.reduce((sum, p) => sum + p.amount, 0);

            setDetails({
                id: userData.id,
                user_name: userData.full_name || 'Anonymous',
                user_email: userData.email,
                status: userData.payment_verified ? 'paid' : userData.trial_status === 'active' ? 'trial' : 'registered',
                created_at: userData.created_at,
                total_credits_purchased: totalCredits,
                lifetime_value: totalSpent,
                last_active: userData.updated_at,
                conversion_rate: userData.payment_verified ? 100 : 0,
                credit_history: mockCreditHistory
            });
        } catch (err) {
            console.error('Failed to load referral details:', err);
            toast.error('Failed to load details');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-card border border-border rounded-2xl p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                </div>
            </div>
        );
    }

    if (!details) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-500/10 text-green-600';
            case 'trial': return 'bg-yellow-500/10 text-yellow-600';
            default: return 'bg-gray-500/10 text-gray-600';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">{details.user_name}</h2>
                        <p className="text-sm text-muted-foreground">{details.user_email}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-muted/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-xs">Status</span>
                        </div>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(details.status)}`}>
                            {details.status.charAt(0).toUpperCase() + details.status.slice(1)}
                        </span>
                    </div>

                    <div className="bg-muted/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <CreditCard className="w-4 h-4" />
                            <span className="text-xs">Credits Bought</span>
                        </div>
                        <p className="text-lg font-bold">{details.total_credits_purchased}</p>
                    </div>

                    <div className="bg-muted/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-xs">Lifetime Value</span>
                        </div>
                        <p className="text-lg font-bold">€{details.lifetime_value.toFixed(2)}</p>
                    </div>

                    <div className="bg-muted/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <Activity className="w-4 h-4" />
                            <span className="text-xs">Last Active</span>
                        </div>
                        <p className="text-sm font-medium">
                            {new Date(details.last_active).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* Timeline */}
                <div className="p-6 border-t border-border">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Timeline
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Signed up</p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(details.created_at).toLocaleDateString('de-DE', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        {details.status !== 'registered' && (
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">
                                        {details.status === 'paid' ? 'Converted to Paid' : 'Started Trial'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(details.created_at).toLocaleDateString('de-DE')}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Credit Purchase History */}
                {details.credit_history.length > 0 && (
                    <div className="p-6 border-t border-border">
                        <h3 className="font-semibold mb-4">Credit Purchase History</h3>
                        <div className="space-y-2">
                            {details.credit_history.map((purchase) => (
                                <div
                                    key={purchase.id}
                                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium">{purchase.credits} Credits</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(purchase.date).toLocaleDateString('de-DE')} • {purchase.method}
                                        </p>
                                    </div>
                                    <p className="font-bold text-green-600">€{purchase.amount.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="p-6 border-t border-border">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
