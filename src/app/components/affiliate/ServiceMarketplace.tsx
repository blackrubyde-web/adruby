import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Loader2, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'sonner';
import { ServiceCreationModal } from './ServiceCreationModal';

interface Service {
    id: string;
    service_type: string;
    title: string;
    description: string;
    price_credits: number;
    is_active: boolean;
    max_slots: number | null;
    booked_slots: number;
}

interface ServiceRequest {
    id: string;
    service_id: string;
    requester_name: string;
    requester_email: string;
    message: string;
    status: string;
    created_at: string;
}

export function ServiceMarketplace() {
    const [services, setServices] = useState<Service[]>([]);
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Load services
            const { data: servicesData, error: servicesError } = await supabase
                .from('affiliate_services')
                .select('*')
                .eq('affiliate_user_id', user.id)
                .order('created_at', { ascending: false });

            if (servicesError) throw servicesError;
            setServices(servicesData || []);

            // Load service requests
            const { data: requestsData, error: requestsError } = await supabase
                .from('affiliate_service_requests')
                .select(`
                    *,
                    requester:user_profiles!requester_user_id(full_name, email)
                `)
                .in('service_id', servicesData?.map(s => s.id) || [])
                .order('created_at', { ascending: false });

            if (requestsError) throw requestsError;

            const formattedRequests = (requestsData || []).map((r: {
                id: string;
                service_id: string;
                requester?: { full_name?: string; email?: string } | null;
                message: string;
                status: string;
                created_at: string;
            }) => ({
                id: r.id,
                service_id: r.service_id,
                requester_name: r.requester?.full_name || 'Anonymous',
                requester_email: r.requester?.email || '',
                message: r.message,
                status: r.status,
                created_at: r.created_at
            }));

            setRequests(formattedRequests);
        } catch (err) {
            console.error('Failed to load services:', err);
            toast.error('Failed to load services');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestAction = async (requestId: string, action: 'accepted' | 'declined' | 'completed') => {
        try {
            const { error } = await supabase
                .from('affiliate_service_requests')
                .update({
                    status: action,
                    ...(action === 'accepted' && { accepted_at: new Date().toISOString() }),
                    ...(action === 'completed' && { completed_at: new Date().toISOString() })
                })
                .eq('id', requestId);

            if (error) throw error;

            toast.success(`Request ${action}`);
            setSelectedRequest(null);
            loadData();
        } catch (err) {
            console.error('Failed to update request:', err);
            toast.error('Failed to update request');
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            pending: 'bg-yellow-500/10 text-yellow-600',
            accepted: 'bg-blue-500/10 text-blue-600',
            completed: 'bg-green-500/10 text-green-600',
            declined: 'bg-red-500/10 text-red-600',
            cancelled: 'bg-gray-500/10 text-gray-600'
        };
        return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status as keyof typeof styles] || styles.pending}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const pendingRequests = requests.filter(r => r.status === 'pending');

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Service Marketplace</h2>
                    <p className="text-sm text-muted-foreground">
                        Biete deinen Referrals Premium-Services an
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90"
                >
                    <Plus className="w-4 h-4" />
                    Neuer Service
                </button>
            </div>

            {/* Pending Requests Alert */}
            {pendingRequests.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                    <p className="text-sm font-medium text-yellow-600">
                        {pendingRequests.length} neue Anfrage{pendingRequests.length > 1 ? 'n' : ''}
                    </p>
                </div>
            )}

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map(service => (
                    <div key={service.id} className="bg-card border border-border rounded-xl p-5">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <h3 className="font-semibold">{service.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {service.is_active ? (
                                    <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded text-xs font-medium">
                                        Active
                                    </span>
                                ) : (
                                    <span className="px-2 py-1 bg-gray-500/10 text-gray-600 rounded text-xs font-medium">
                                        Inactive
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-border">
                            <div>
                                <p className="text-2xl font-bold text-primary">{service.price_credits} Credits</p>
                                {service.max_slots && (
                                    <p className="text-xs text-muted-foreground">
                                        {service.booked_slots}/{service.max_slots} Slots gebucht
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-muted rounded-lg">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button className="p-2 hover:bg-red-500/10 text-red-600 rounded-lg">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {services.length === 0 && (
                    <div className="col-span-2 text-center py-12">
                        <div className="max-w-sm mx-auto">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Noch keine Services</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                Erstelle deinen ersten Service und biete deinen Referrals Premium-Support an!
                            </p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 inline-flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Ersten Service erstellen
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Service Requests */}
            {requests.length > 0 && (
                <div>
                    <h3 className="font-semibold mb-4">Service Anfragen</h3>
                    <div className="space-y-2">
                        {requests.map(request => (
                            <div
                                key={request.id}
                                className="bg-card border border-border rounded-xl p-4 hover:bg-accent/50 cursor-pointer"
                                onClick={() => setSelectedRequest(request)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="font-medium">{request.requester_name}</p>
                                        <p className="text-sm text-muted-foreground truncate">{request.message}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(request.status)}
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(request.created_at).toLocaleDateString('de-DE')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Request Detail Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold">Service Anfrage</h3>
                            <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-muted rounded-lg">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Von</p>
                                <p className="font-medium">{selectedRequest.requester_name}</p>
                                <p className="text-sm text-muted-foreground">{selectedRequest.requester_email}</p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Nachricht</p>
                                <p className="text-sm bg-muted/30 rounded-lg p-3">{selectedRequest.message}</p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                {getStatusBadge(selectedRequest.status)}
                            </div>
                        </div>

                        {selectedRequest.status === 'pending' && (
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => handleRequestAction(selectedRequest.id, 'declined')}
                                    className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted"
                                >
                                    Ablehnen
                                </button>
                                <button
                                    onClick={() => handleRequestAction(selectedRequest.id, 'accepted')}
                                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                                >
                                    Annehmen
                                </button>
                            </div>
                        )}

                        {selectedRequest.status === 'accepted' && (
                            <button
                                onClick={() => handleRequestAction(selectedRequest.id, 'completed')}
                                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mt-6"
                            >
                                Als erledigt markieren
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Service Creation Modal */}
            {showCreateModal && (
                <ServiceCreationModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        loadData();
                    }}
                />
            )}
        </div>
    );
}
