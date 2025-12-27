import { useState, useEffect } from 'react';
import { Check, X, Clock, Mail, Users as UsersIcon, Building, Globe, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'sonner';

interface PartnerApplication {
    id: string;
    full_name: string;
    email: string;
    company_name: string | null;
    website: string | null;
    partner_type: string;
    audience_size: number | null;
    audience_description: string | null;
    platform: string | null;
    motivation: string;
    experience: string | null;
    status: 'pending' | 'approved' | 'rejected' | 'contacted';
    admin_notes: string | null;
    created_at: string;
    reviewed_at: string | null;
}

export function PartnerApplicationsTab() {
    const [applications, setApplications] = useState<PartnerApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<PartnerApplication | null>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [processing, setProcessing] = useState(false);

    // Load applications
    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('partner_applications')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setApplications(data || []);
        } catch (err) {
            console.error('Failed to load partner applications:', err);
            toast.error('Failed to load applications');
        } finally {
            setIsLoading(false);
        }
    };

    // Update application status
    const updateStatus = async (id: string, status: 'approved' | 'rejected' | 'contacted') => {
        setProcessing(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('partner_applications')
                .update({
                    status,
                    admin_notes: adminNotes || null,
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: user?.id
                })
                .eq('id', id);

            if (error) throw error;

            toast.success(`Application ${status}`);
            setSelectedApp(null);
            setAdminNotes('');
            loadApplications();
        } catch (err) {
            console.error('Failed to update application:', err);
            toast.error('Failed to update application');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500">
                        <Clock className="w-3 h-3" /> Pending
                    </span>
                );
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">
                        <Check className="w-3 h-3" /> Approved
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-500">
                        <X className="w-3 h-3" /> Rejected
                    </span>
                );
            case 'contacted':
                return (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-500">
                        <Mail className="w-3 h-3" /> Contacted
                    </span>
                );
            default:
                return null;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'influencer':
                return <UsersIcon className="w-4 h-4" />;
            case 'agency':
                return <Building className="w-4 h-4" />;
            default:
                return <Globe className="w-4 h-4" />;
        }
    };

    const pendingCount = applications.filter(a => a.status === 'pending').length;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-sm text-muted-foreground">Total Applications</p>
                    <p className="text-2xl font-bold">{applications.length}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-sm text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold text-green-500">
                        {applications.filter(a => a.status === 'approved').length}
                    </p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-sm text-muted-foreground">Rejected</p>
                    <p className="text-2xl font-bold text-red-500">
                        {applications.filter(a => a.status === 'rejected').length}
                    </p>
                </div>
            </div>

            {/* Applications Table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium">Applicant</th>
                                <th className="text-left px-4 py-3 font-medium">Type</th>
                                <th className="text-left px-4 py-3 font-medium">Audience</th>
                                <th className="text-left px-4 py-3 font-medium">Status</th>
                                <th className="text-left px-4 py-3 font-medium">Applied</th>
                                <th className="text-left px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {applications.map(app => (
                                <tr key={app.id} className="hover:bg-muted/30">
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="font-medium">{app.full_name}</p>
                                            <p className="text-xs text-muted-foreground">{app.email}</p>
                                            {app.company_name && (
                                                <p className="text-xs text-muted-foreground">{app.company_name}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {getTypeIcon(app.partner_type)}
                                            <span className="capitalize">{app.partner_type}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {app.audience_size ? (
                                            <div>
                                                <p className="font-medium">{app.audience_size.toLocaleString()}</p>
                                                <p className="text-xs text-muted-foreground">{app.platform}</p>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">{getStatusBadge(app.status)}</td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {new Date(app.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => {
                                                setSelectedApp(app);
                                                setAdminNotes(app.admin_notes || '');
                                            }}
                                            className="text-xs px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30"
                                        >
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {applications.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        No partner applications yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Review Modal */}
            {selectedApp && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold">{selectedApp.full_name}</h3>
                                <p className="text-sm text-muted-foreground">{selectedApp.email}</p>
                            </div>
                            {getStatusBadge(selectedApp.status)}
                        </div>

                        <div className="space-y-4">
                            {/* Company Info */}
                            {selectedApp.company_name && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Company</p>
                                    <p>{selectedApp.company_name}</p>
                                </div>
                            )}

                            {selectedApp.website && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Website</p>
                                    <a
                                        href={selectedApp.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        {selectedApp.website}
                                    </a>
                                </div>
                            )}

                            {/* Partner Type */}
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Partner Type</p>
                                <p className="capitalize">{selectedApp.partner_type}</p>
                            </div>

                            {/* Audience */}
                            {selectedApp.audience_size && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Audience</p>
                                    <p>
                                        {selectedApp.audience_size.toLocaleString()} followers on {selectedApp.platform}
                                    </p>
                                    {selectedApp.audience_description && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {selectedApp.audience_description}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Motivation */}
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Motivation</p>
                                <p className="whitespace-pre-wrap">{selectedApp.motivation}</p>
                            </div>

                            {/* Experience */}
                            {selectedApp.experience && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Experience</p>
                                    <p className="whitespace-pre-wrap">{selectedApp.experience}</p>
                                </div>
                            )}

                            {/* Admin Notes */}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground block mb-2">
                                    Admin Notes
                                </label>
                                <textarea
                                    value={adminNotes}
                                    onChange={e => setAdminNotes(e.target.value)}
                                    placeholder="Add internal notes..."
                                    className="w-full px-4 py-2 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setSelectedApp(null)}
                                className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => updateStatus(selectedApp.id, 'contacted')}
                                disabled={processing}
                                className="px-4 py-2 rounded-xl bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 disabled:opacity-50"
                            >
                                Mark as Contacted
                            </button>
                            <button
                                onClick={() => updateStatus(selectedApp.id, 'rejected')}
                                disabled={processing}
                                className="px-4 py-2 rounded-xl bg-red-500/20 text-red-500 hover:bg-red-500/30 disabled:opacity-50"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => updateStatus(selectedApp.id, 'approved')}
                                disabled={processing}
                                className="flex-1 px-4 py-2 rounded-xl bg-green-500 text-white font-medium disabled:opacity-50"
                            >
                                {processing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Approve'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
