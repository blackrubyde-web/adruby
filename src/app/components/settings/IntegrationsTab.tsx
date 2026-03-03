import { useEffect, useMemo, useState } from 'react';
import {
    Facebook,
    Globe,
    AlertCircle,
    Check,
    CheckCircle2,
    X,
    Zap,
    Link2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { connectMeta, disconnectMeta, getMetaAuthUrl, syncMeta } from '../../lib/api/meta';
import { useMetaConnection } from '../../hooks/useMetaConnection';

export function IntegrationsTab() {
    const {
        connected: facebookConnected,
        connection: facebookAccount,
        error: metaStatusError,
        refresh: refreshMetaStatus,
    } = useMetaConnection();
    const [metaError, setMetaError] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const metaDetails = facebookAccount?.meta as { selected_account?: { name?: string } } | null;
    const selectedAdAccountName =
        metaDetails?.selected_account?.name || facebookAccount?.full_name || '—';

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const metaErrorParam = params.get('meta_error');
        if (metaErrorParam) {
            setMetaError(decodeURIComponent(metaErrorParam));
            params.delete('meta_error');
            const nextUrl = `${window.location.pathname}?${params.toString()}`;
            window.history.replaceState({}, document.title, nextUrl);
        }
    }, []);

    useEffect(() => {
        if (metaStatusError) setMetaError(metaStatusError);
    }, [metaStatusError]);

    const formatDate = (value?: string | null) => {
        if (!value) return '—';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return value;
        return d.toLocaleDateString('de-DE', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const handleFacebookConnect = async () => {
        setMetaError(null);
        try {
            const { url } = await getMetaAuthUrl();
            window.location.href = url;
            return;
        } catch {
            try {
                toast.info('Connecting Meta account...');
                await connectMeta();
                await refreshMetaStatus();
                toast.success('Meta account connected successfully!');
                return;
            } catch (fallbackErr: unknown) {
                const message = fallbackErr instanceof Error ? fallbackErr.message : 'Meta connection failed';
                setMetaError(message);
                toast.error(message);
            }
        }
    };

    const handleFacebookDisconnect = async () => {
        setMetaError(null);
        try {
            await disconnectMeta();
            await refreshMetaStatus();
            toast.success('Meta account disconnected');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Disconnect failed';
            setMetaError(message);
            toast.error(message);
        }
    };

    const handleMetaSync = async () => {
        setIsSyncing(true);
        setMetaError(null);
        try {
            const res = await syncMeta('30d');
            toast.success(`Synced ${res.campaigns} campaigns`);
            await refreshMetaStatus();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Sync failed';
            setMetaError(message);
            toast.error(message);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <h2 className="text-xl font-bold text-foreground">Integrationen</h2>
                <p className="text-sm text-muted-foreground">Verbinde deine Werbekonten und Plattformen</p>
            </div>

            <div className="space-y-6">
                {/* Facebook/Meta Integration */}
                <div className="p-6 bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Facebook className="w-24 h-24 text-blue-500" />
                    </div>

                    <div className="flex items-start justify-between mb-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#1877F2] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Facebook className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                    Facebook Ads
                                    {facebookConnected && (
                                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 gap-1 pl-2">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Verbunden
                                        </Badge>
                                    )}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Verbinde dein Facebook Ads Konto um Kampagnen und Metriken zu importieren
                                </p>
                            </div>
                        </div>
                    </div>

                    {facebookConnected ? (
                        <div className="space-y-4 relative z-10">
                            {/* Connected Account Info */}
                            <div className="p-4 bg-background/50 rounded-xl space-y-3 border border-border/50">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Kontoname</span>
                                    <span className="text-sm font-semibold text-foreground">{selectedAdAccountName}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Ad Account ID</span>
                                    <span className="text-sm font-mono font-semibold text-foreground">
                                        {facebookAccount?.ad_account_id || '—'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Verbunden seit</span>
                                    <span className="text-sm font-semibold text-foreground">
                                        {formatDate(facebookAccount?.connected_at)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    <span className="flex items-center gap-1 text-sm font-semibold text-green-500">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        Aktiv
                                    </span>
                                </div>
                            </div>

                            {metaError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-500 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {metaError}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={handleMetaSync}
                                    disabled={isSyncing}
                                    className="flex-1 gap-2"
                                >
                                    <Zap className="w-4 h-4" />
                                    {isSyncing ? 'Synchronisieren…' : 'Jetzt synchronisieren'}
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleFacebookDisconnect}
                                    className="flex-1 gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
                                >
                                    <X className="w-4 h-4" />
                                    Trennen
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 relative z-10">
                            <ul className="space-y-2 mb-4">
                                {[
                                    'Automatische Kampagnen-Synchronisation',
                                    'Echtzeit Performance-Metriken',
                                    'KI-gestützte Optimierungsvorschläge',
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Check className="w-4 h-4 text-primary" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Button
                                onClick={handleFacebookConnect}
                                className="w-full bg-[#1877F2] hover:bg-[#1877F2]/90 text-white gap-2 shadow-md"
                            >
                                <Facebook className="w-4 h-4" />
                                Facebook-Konto verbinden
                            </Button>

                            {metaError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-500">
                                    {metaError}
                                </div>
                            )}

                            <p className="text-[10px] text-center text-muted-foreground/60 w-full">
                                Kampagnendaten werden synchronisiert. Optimierungen nur nach Bestätigung.
                            </p>
                        </div>
                    )}
                </div>

                {/* Google Ads Integration (Placeholder) */}
                <div className="p-6 bg-muted/20 border border-border/50 rounded-2xl opacity-60">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                                <Globe className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                    Google Ads
                                    <Badge variant="outline" className="text-[10px] h-5">Bald verfügbar</Badge>
                                </h3>
                                <p className="text-sm text-muted-foreground">Google Ads Integration wird bald verfügbar sein</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
