import { useState, useEffect } from 'react';
import { Users, TrendingUp, Clock, CheckCircle2, AlertCircle, XCircle, Search, ChevronRight, Loader2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { useAffiliate } from '../../contexts/AffiliateContext';

interface Referral {
    id: string;
    userName: string;
    userEmail: string;
    status: 'registered' | 'trial' | 'active' | 'paid' | 'churned';
    registeredAt: string;
    firstPaymentAt: string | null;
    monthsPaid: number;
    totalCommission: number;
    planType: string | null;
    lastActivity: string;
}

const STATUS_CONFIG = {
    registered: { label: 'Registriert', color: 'bg-slate-500/10 text-slate-400', icon: Clock },
    trial: { label: 'Trial', color: 'bg-blue-500/10 text-blue-500', icon: Clock },
    active: { label: 'Aktiv', color: 'bg-emerald-500/10 text-emerald-500', icon: CheckCircle2 },
    paid: { label: 'Bezahlt', color: 'bg-green-500/10 text-green-500', icon: CheckCircle2 },
    churned: { label: 'Abgemeldet', color: 'bg-red-500/10 text-red-500', icon: XCircle },
};

export function TeamPanel() {
    const { referrals: contextReferrals, stats: _stats } = useAffiliate();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Mock data for demo - in production this comes from API
    const [referrals, setReferrals] = useState<Referral[]>([]);

    useEffect(() => {
        // Simulate loading from API
        const timer = setTimeout(() => {
            // Generate demo data based on stats
            const demoReferrals: Referral[] = [
                {
                    id: '1',
                    userName: 'Max Mustermann',
                    userEmail: 'm***@gmail.com',
                    status: 'paid',
                    registeredAt: '2026-01-05',
                    firstPaymentAt: '2026-01-10',
                    monthsPaid: 2,
                    totalCommission: 29.70,
                    planType: 'pro',
                    lastActivity: '2026-01-18',
                },
                {
                    id: '2',
                    userName: 'Lisa Schmidt',
                    userEmail: 'l***@company.de',
                    status: 'active',
                    registeredAt: '2026-01-12',
                    firstPaymentAt: '2026-01-15',
                    monthsPaid: 1,
                    totalCommission: 14.85,
                    planType: 'starter',
                    lastActivity: '2026-01-17',
                },
                {
                    id: '3',
                    userName: 'Jonas Weber',
                    userEmail: 'j***@agentur.de',
                    status: 'trial',
                    registeredAt: '2026-01-16',
                    firstPaymentAt: null,
                    monthsPaid: 0,
                    totalCommission: 0,
                    planType: null,
                    lastActivity: '2026-01-18',
                },
                {
                    id: '4',
                    userName: 'Sarah Müller',
                    userEmail: 's***@ecomm.de',
                    status: 'paid',
                    registeredAt: '2025-12-20',
                    firstPaymentAt: '2025-12-25',
                    monthsPaid: 3,
                    totalCommission: 89.10,
                    planType: 'agency',
                    lastActivity: '2026-01-18',
                },
            ];
            setReferrals(demoReferrals);
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [contextReferrals]);

    const filteredReferrals = referrals.filter(ref => {
        const matchesSearch = ref.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ref.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !statusFilter || ref.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statusCounts = {
        all: referrals.length,
        trial: referrals.filter(r => r.status === 'trial').length,
        active: referrals.filter(r => r.status === 'active' || r.status === 'paid').length,
        churned: referrals.filter(r => r.status === 'churned').length,
    };

    const totalEarnings = referrals.reduce((acc, r) => acc + r.totalCommission, 0);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                    <div className="text-3xl font-black text-primary">{statusCounts.all}</div>
                    <div className="text-sm text-muted-foreground">Team Größe</div>
                </Card>
                <Card className="p-4 text-center">
                    <div className="text-3xl font-black text-blue-500">{statusCounts.trial}</div>
                    <div className="text-sm text-muted-foreground">In Trial</div>
                </Card>
                <Card className="p-4 text-center">
                    <div className="text-3xl font-black text-emerald-500">{statusCounts.active}</div>
                    <div className="text-sm text-muted-foreground">Zahlend</div>
                </Card>
                <Card className="p-4 text-center">
                    <div className="text-3xl font-black text-emerald-500">€{totalEarnings.toFixed(0)}</div>
                    <div className="text-sm text-muted-foreground">Verdient</div>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Name oder Email suchen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm"
                    />
                </div>
                <div className="flex gap-2">
                    {[
                        { key: null, label: 'Alle' },
                        { key: 'trial', label: 'Trial' },
                        { key: 'paid', label: 'Zahlend' },
                        { key: 'churned', label: 'Churned' },
                    ].map((filter) => (
                        <button
                            key={filter.key || 'all'}
                            onClick={() => setStatusFilter(filter.key)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                                statusFilter === filter.key
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted hover:bg-muted/80"
                            )}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Referral List */}
            <div className="space-y-3">
                {filteredReferrals.length === 0 ? (
                    <Card className="p-8 text-center">
                        <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-bold mb-2">Keine Referrals gefunden</h3>
                        <p className="text-muted-foreground">
                            {searchQuery || statusFilter ? 'Versuche andere Filter.' : 'Teile deinen Link, um dein Team aufzubauen!'}
                        </p>
                    </Card>
                ) : (
                    filteredReferrals.map((referral) => {
                        const StatusIcon = STATUS_CONFIG[referral.status].icon;
                        return (
                            <Card key={referral.id} className="p-4 hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-rose-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                                        {referral.userName.charAt(0)}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold truncate">{referral.userName}</span>
                                            <Badge className={cn("text-[10px]", STATUS_CONFIG[referral.status].color)}>
                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                {STATUS_CONFIG[referral.status].label}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground truncate">{referral.userEmail}</div>
                                    </div>

                                    {/* Stats */}
                                    <div className="hidden md:flex items-center gap-6 text-sm">
                                        <div className="text-center">
                                            <div className="font-bold">{referral.monthsPaid}</div>
                                            <div className="text-xs text-muted-foreground">Monate</div>
                                        </div>
                                        {referral.planType && (
                                            <div className="text-center">
                                                <Badge variant="secondary" className="text-xs capitalize">{referral.planType}</Badge>
                                            </div>
                                        )}
                                    </div>

                                    {/* Earnings */}
                                    <div className="text-right shrink-0">
                                        <div className="font-bold text-emerald-500">€{referral.totalCommission.toFixed(2)}</div>
                                        <div className="text-xs text-muted-foreground">Verdient</div>
                                    </div>

                                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                                </div>

                                {/* Member Journey */}
                                <div className="mt-4 pt-4 border-t border-border flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Registriert: {new Date(referral.registeredAt).toLocaleDateString('de-DE')}
                                    </div>
                                    {referral.firstPaymentAt && (
                                        <div className="flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                            Erste Zahlung: {new Date(referral.firstPaymentAt).toLocaleDateString('de-DE')}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1 ml-auto">
                                        <TrendingUp className="w-3 h-3" />
                                        Zuletzt aktiv: {new Date(referral.lastActivity).toLocaleDateString('de-DE')}
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Performance Tips */}
            {referrals.length > 0 && statusCounts.trial > 0 && (
                <Card className="p-4 bg-amber-500/5 border-amber-500/20">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-sm">Conversion Tip</h4>
                            <p className="text-sm text-muted-foreground">
                                Du hast {statusCounts.trial} Member in Trial. Schick ihnen eine persönliche Nachricht,
                                um die Conversion Rate zu erhöhen!
                            </p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
