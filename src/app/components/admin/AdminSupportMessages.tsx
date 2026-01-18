import { useState, useEffect } from 'react';
import { MessageSquare, Check, Clock, AlertCircle, RefreshCw, Loader2, Mail, User, Calendar, ChevronDown, ChevronUp, Reply, X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

interface SupportRequest {
    id: string;
    user_id: string | null;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    created_at: string;
    updated_at: string | null;
}

const STATUS_CONFIG = {
    open: { label: 'Offen', color: 'bg-yellow-500/20 text-yellow-500', icon: Clock },
    in_progress: { label: 'In Bearbeitung', color: 'bg-blue-500/20 text-blue-500', icon: Loader2 },
    resolved: { label: 'Gelöst', color: 'bg-green-500/20 text-green-500', icon: Check },
    closed: { label: 'Geschlossen', color: 'bg-muted text-muted-foreground', icon: X },
};

export function AdminSupportMessages() {
    const [requests, setRequests] = useState<SupportRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            let query = supabase
                .from('support_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data, error } = await query;
            if (error) throw error;
            setRequests(data || []);
        } catch (err) {
            console.error('Failed to fetch support requests:', err);
            toast.error('Fehler beim Laden der Nachrichten');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    const updateStatus = async (id: string, newStatus: SupportRequest['status']) => {
        try {
            const { error } = await supabase
                .from('support_requests')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            setRequests(prev => prev.map(r =>
                r.id === id ? { ...r, status: newStatus, updated_at: new Date().toISOString() } : r
            ));
            toast.success('Status aktualisiert');
        } catch (err) {
            console.error('Failed to update status:', err);
            toast.error('Status konnte nicht aktualisiert werden');
        }
    };

    const openCount = requests.filter(r => r.status === 'open').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-primary" />
                        Support Nachrichten
                        {openCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-sm bg-yellow-500/20 text-yellow-500 rounded-full">
                                {openCount} offen
                            </span>
                        )}
                    </h2>
                    <p className="text-sm text-muted-foreground">Anfragen aus dem Hilfe-Bereich</p>
                </div>
                <button
                    onClick={fetchRequests}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                >
                    <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                    Aktualisieren
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {(['all', 'open', 'in_progress', 'resolved'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                            "px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-colors",
                            filter === f
                                ? "bg-primary text-primary-foreground"
                                : "bg-card hover:bg-muted"
                        )}
                    >
                        {f === 'all' && 'Alle'}
                        {f === 'open' && `Offen (${requests.filter(r => r.status === 'open').length})`}
                        {f === 'in_progress' && 'In Bearbeitung'}
                        {f === 'resolved' && 'Gelöst'}
                    </button>
                ))}
            </div>

            {/* Messages List */}
            <div className="space-y-3">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>Keine Nachrichten gefunden</p>
                    </div>
                ) : (
                    requests.map((req) => {
                        const isExpanded = expandedId === req.id;
                        const StatusIcon = STATUS_CONFIG[req.status].icon;

                        return (
                            <div
                                key={req.id}
                                className={cn(
                                    "bg-card border border-border rounded-2xl overflow-hidden transition-all",
                                    isExpanded && "ring-2 ring-primary/20"
                                )}
                            >
                                {/* Header Row */}
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : req.id)}
                                    className="w-full p-4 flex items-center gap-4 text-left hover:bg-muted/30 transition-colors"
                                >
                                    <div className={cn(
                                        "px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold",
                                        STATUS_CONFIG[req.status].color
                                    )}>
                                        <StatusIcon className="w-3.5 h-3.5" />
                                        {STATUS_CONFIG[req.status].label}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-foreground truncate">{req.subject}</p>
                                        <p className="text-sm text-muted-foreground truncate">{req.name} • {req.email}</p>
                                    </div>

                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span className="hidden sm:block">
                                            {new Date(req.created_at).toLocaleDateString('de-DE', {
                                                day: '2-digit',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                        {isExpanded ? (
                                            <ChevronUp className="w-5 h-5" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5" />
                                        )}
                                    </div>
                                </button>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 border-t border-border/50">
                                        {/* Message */}
                                        <div className="my-4 p-4 bg-muted/30 rounded-xl">
                                            <p className="text-sm text-foreground whitespace-pre-wrap">{req.message}</p>
                                        </div>

                                        {/* Meta Info */}
                                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4">
                                            <div className="flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5" />
                                                {req.name}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Mail className="w-3.5 h-3.5" />
                                                {req.email}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(req.created_at).toLocaleString('de-DE')}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-wrap gap-2">
                                            <a
                                                href={`mailto:${req.email}?subject=Re: ${encodeURIComponent(req.subject)}`}
                                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors"
                                            >
                                                <Reply className="w-4 h-4" />
                                                Per Email antworten
                                            </a>

                                            {req.status === 'open' && (
                                                <button
                                                    onClick={() => updateStatus(req.id, 'in_progress')}
                                                    className="px-4 py-2 bg-blue-500/20 text-blue-500 rounded-xl text-sm font-medium hover:bg-blue-500/30"
                                                >
                                                    In Bearbeitung
                                                </button>
                                            )}

                                            {(req.status === 'open' || req.status === 'in_progress') && (
                                                <button
                                                    onClick={() => updateStatus(req.id, 'resolved')}
                                                    className="px-4 py-2 bg-green-500/20 text-green-500 rounded-xl text-sm font-medium hover:bg-green-500/30"
                                                >
                                                    Als gelöst markieren
                                                </button>
                                            )}

                                            {req.status !== 'closed' && (
                                                <button
                                                    onClick={() => updateStatus(req.id, 'closed')}
                                                    className="px-4 py-2 bg-muted text-muted-foreground rounded-xl text-sm font-medium hover:bg-muted/80"
                                                >
                                                    Schließen
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
