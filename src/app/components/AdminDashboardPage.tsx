import { useState } from 'react';
import {
    Users,
    Gift,
    DollarSign,
    TrendingUp,
    Search,
    RefreshCw,
    Check,
    X,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    UserPlus,
    BadgeCheck,
    Clock,
    AlertCircle,
    Loader2,
    Shield,
    Copy,
    Mail,
    MessageSquare
} from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { toast } from 'sonner';
import { PartnerApplicationsTab } from './admin/PartnerApplicationsTab';
import { AdminEmailComposer } from './admin/AdminEmailComposer';
import { AdminSupportMessages } from './admin/AdminSupportMessages';

type AdminTab = 'overview' | 'users' | 'affiliates' | 'payouts' | 'partners' | 'messages' | 'email';

export function AdminDashboardPage() {
    const {
        isAdmin,
        isLoading,
        isCheckingRole,
        users,
        userTotal,
        affiliates,
        payouts,
        stats,
        usersPage,
        usersSearch,
        refreshAll,
        refreshUsers,
        handleUpdateUserCredits,
        handleCreateAffiliate,
        handleApproveAffiliate,
        handleProcessPayout,
    } = useAdmin();

    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [searchInput, setSearchInput] = useState('');

    // Modal states
    const [creditModalUser, setCreditModalUser] = useState<{ id: string; name: string; credits: number } | null>(null);
    const [newCredits, setNewCredits] = useState('');
    const [creditReason, setCreditReason] = useState('');

    const [affiliateModalUser, setAffiliateModalUser] = useState<{ id: string; email: string } | null>(null);
    const [newAffiliateCode, setNewAffiliateCode] = useState('');
    const [newPayoutEmail, setNewPayoutEmail] = useState('');

    const [payoutModal, setPayoutModal] = useState<{ id: string; amount: number; email: string } | null>(null);
    const [payoutReference, setPayoutReference] = useState('');

    const [processing, setProcessing] = useState(false);

    // Loading state
    if (isCheckingRole) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Checking admin access...</span>
                </div>
            </div>
        );
    }

    // Not admin
    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md px-6">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                    <p className="text-muted-foreground">
                        You don't have admin privileges to access this page.
                    </p>
                </div>
            </div>
        );
    }

    // Stats cards
    const statsCards = [
        { label: 'Total Users', value: stats?.total_users ?? 0, icon: Users, color: 'from-blue-500 to-blue-600' },
        { label: 'Paying Users', value: stats?.paying_users ?? 0, icon: CreditCard, color: 'from-green-500 to-green-600' },
        { label: 'Trial Users', value: stats?.trial_users ?? 0, icon: Clock, color: 'from-yellow-500 to-yellow-600' },
        { label: 'Total Affiliates', value: stats?.total_affiliates ?? 0, icon: Gift, color: 'from-purple-500 to-purple-600' },
        { label: 'Pending Payouts', value: `€${(stats?.pending_payouts_amount ?? 0).toFixed(2)}`, icon: DollarSign, color: 'from-orange-500 to-orange-600' },
        { label: 'Total Earnings (Paid)', value: `€${(stats?.completed_payouts_amount ?? 0).toFixed(2)}`, icon: TrendingUp, color: 'from-emerald-500 to-emerald-600' },
    ];

    // Tab buttons
    const tabs: { id: AdminTab; label: string; icon: typeof Users }[] = [
        { id: 'overview', label: 'Overview', icon: TrendingUp },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'affiliates', label: 'Affiliates', icon: Gift },
        { id: 'payouts', label: 'Payouts', icon: DollarSign },
        { id: 'partners', label: 'Partners', icon: UserPlus },
        { id: 'messages', label: 'Nachrichten', icon: MessageSquare },
        { id: 'email', label: 'Email', icon: Mail },
    ];

    // Pending payouts count
    const pendingPayoutsCount = payouts.filter(p => p.status === 'pending').length;

    // Handle search
    const handleSearch = () => {
        refreshUsers(0, searchInput);
    };

    // Handle credit update
    const handleCreditSubmit = async () => {
        if (!creditModalUser) return;
        setProcessing(true);
        const result = await handleUpdateUserCredits(
            creditModalUser.id,
            parseInt(newCredits),
            creditReason || 'admin_adjustment'
        );
        setProcessing(false);
        if (result.success) {
            toast.success('Credits updated successfully');
            setCreditModalUser(null);
            setNewCredits('');
            setCreditReason('');
        } else {
            toast.error(result.error || 'Failed to update credits');
        }
    };

    // Handle affiliate creation
    const handleAffiliateSubmit = async () => {
        if (!affiliateModalUser) return;
        setProcessing(true);
        const result = await handleCreateAffiliate(
            affiliateModalUser.id,
            newAffiliateCode || undefined,
            newPayoutEmail || undefined
        );
        setProcessing(false);
        if (result.success) {
            toast.success(`Affiliate created with code: ${result.affiliate_code}`);
            setAffiliateModalUser(null);
            setNewAffiliateCode('');
            setNewPayoutEmail('');
        } else {
            toast.error(result.error || 'Failed to create affiliate');
        }
    };

    // Handle payout processing
    const handlePayoutSubmit = async (status: 'completed' | 'failed') => {
        if (!payoutModal) return;
        setProcessing(true);
        const result = await handleProcessPayout(payoutModal.id, status, payoutReference || undefined);
        setProcessing(false);
        if (result.success) {
            toast.success(status === 'completed' ? 'Payout marked as completed' : 'Payout marked as failed');
            setPayoutModal(null);
            setPayoutReference('');
        } else {
            toast.error(result.error || 'Failed to process payout');
        }
    };

    // Copy to clipboard
    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied!`);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage users, affiliates, and payouts</p>
                </div>
                <button
                    onClick={() => refreshAll()}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {tab.id === 'payouts' && pendingPayoutsCount > 0 && (
                            <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                                {pendingPayoutsCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {statsCards.map((stat, i) => (
                            <div key={i} className="bg-card border border-border rounded-2xl p-5">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                        <stat.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Affiliate Stats */}
                        <div className="bg-card border border-border rounded-2xl p-5">
                            <h3 className="font-semibold mb-4">Affiliate Program</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Approved Affiliates</span>
                                    <span className="font-medium">{stats?.approved_affiliates ?? 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Referrals</span>
                                    <span className="font-medium">{stats?.total_referrals ?? 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Active Referrals</span>
                                    <span className="font-medium">{stats?.active_referrals ?? 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">This Month Commissions</span>
                                    <span className="font-medium text-green-500">€{(stats?.this_month_commissions ?? 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Pending Earnings (Total)</span>
                                    <span className="font-medium text-orange-500">€{(stats?.pending_affiliate_earnings ?? 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payout Stats */}
                        <div className="bg-card border border-border rounded-2xl p-5">
                            <h3 className="font-semibold mb-4">Payouts</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Pending Requests</span>
                                    <span className="font-medium text-orange-500">{stats?.pending_payouts_count ?? 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Pending Amount</span>
                                    <span className="font-medium">€{(stats?.pending_payouts_amount ?? 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Paid Out</span>
                                    <span className="font-medium text-green-500">€{(stats?.completed_payouts_amount ?? 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="space-y-4">
                    {/* Search */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by email or name..."
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium"
                        >
                            Search
                        </button>
                    </div>

                    {/* Users Table */}
                    <div className="bg-card border border-border rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-medium">User</th>
                                        <th className="text-left px-4 py-3 font-medium">Status</th>
                                        <th className="text-left px-4 py-3 font-medium">Credits</th>
                                        <th className="text-left px-4 py-3 font-medium">Affiliate</th>
                                        <th className="text-left px-4 py-3 font-medium">Joined</th>
                                        <th className="text-left px-4 py-3 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {users.map(user => (
                                        <tr key={user.id} className="hover:bg-muted/30">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium">{user.full_name || 'No name'}</p>
                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {user.payment_verified ? (
                                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">
                                                        <Check className="w-3 h-3" /> Paid
                                                    </span>
                                                ) : user.trial_status === 'active' ? (
                                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500">
                                                        <Clock className="w-3 h-3" /> Trial
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                                                        <AlertCircle className="w-3 h-3" /> Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 font-medium">{user.credits ?? 0}</td>
                                            <td className="px-4 py-3">
                                                {user.is_affiliate ? (
                                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-500">
                                                        <Gift className="w-3 h-3" /> Affiliate
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setCreditModalUser({ id: user.id, name: user.full_name || user.email, credits: user.credits ?? 0 });
                                                            setNewCredits(String(user.credits ?? 0));
                                                        }}
                                                        className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80"
                                                        title="Edit credits"
                                                    >
                                                        Credits
                                                    </button>
                                                    {!user.is_affiliate && (
                                                        <button
                                                            onClick={() => setAffiliateModalUser({ id: user.id, email: user.email })}
                                                            className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-500 hover:bg-purple-500/30"
                                                            title="Make affiliate"
                                                        >
                                                            <UserPlus className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                            <p className="text-sm text-muted-foreground">
                                Showing {usersPage * 25 + 1}-{Math.min((usersPage + 1) * 25, userTotal)} of {userTotal}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => refreshUsers(usersPage - 1, usersSearch)}
                                    disabled={usersPage === 0}
                                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => refreshUsers(usersPage + 1, usersSearch)}
                                    disabled={(usersPage + 1) * 25 >= userTotal}
                                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Affiliates Tab */}
            {activeTab === 'affiliates' && (
                <div className="space-y-4">
                    <div className="bg-card border border-border rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-medium">Affiliate</th>
                                        <th className="text-left px-4 py-3 font-medium">Code</th>
                                        <th className="text-left px-4 py-3 font-medium">Status</th>
                                        <th className="text-left px-4 py-3 font-medium">Referrals</th>
                                        <th className="text-left px-4 py-3 font-medium">Earnings</th>
                                        <th className="text-left px-4 py-3 font-medium">Pending</th>
                                        <th className="text-left px-4 py-3 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {affiliates.map(aff => (
                                        <tr key={aff.id} className="hover:bg-muted/30">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium">{aff.user_name || 'No name'}</p>
                                                    <p className="text-xs text-muted-foreground">{aff.user_email}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{aff.affiliate_code}</code>
                                                    <button
                                                        onClick={() => copyToClipboard(aff.affiliate_code, 'Code')}
                                                        className="text-muted-foreground hover:text-foreground"
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {aff.is_approved ? (
                                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">
                                                        <BadgeCheck className="w-3 h-3" /> Approved
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500">
                                                        <Clock className="w-3 h-3" /> Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-medium">{aff.total_referrals}</span>
                                                <span className="text-muted-foreground text-xs"> ({aff.active_referrals} active)</span>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-green-500">
                                                €{Number(aff.total_earnings).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-orange-500">
                                                €{Number(aff.pending_earnings).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3">
                                                {!aff.is_approved && (
                                                    <button
                                                        onClick={async () => {
                                                            const result = await handleApproveAffiliate(aff.id);
                                                            if (result.success) {
                                                                toast.success('Affiliate approved');
                                                            } else {
                                                                toast.error(result.error || 'Failed to approve');
                                                            }
                                                        }}
                                                        className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-500 hover:bg-green-500/30"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {affiliates.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                                No affiliates found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Payouts Tab */}
            {activeTab === 'payouts' && (
                <div className="space-y-4">
                    <div className="bg-card border border-border rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-medium">Affiliate</th>
                                        <th className="text-left px-4 py-3 font-medium">Amount</th>
                                        <th className="text-left px-4 py-3 font-medium">Status</th>
                                        <th className="text-left px-4 py-3 font-medium">Method</th>
                                        <th className="text-left px-4 py-3 font-medium">Requested</th>
                                        <th className="text-left px-4 py-3 font-medium">Reference</th>
                                        <th className="text-left px-4 py-3 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {payouts.map(payout => (
                                        <tr key={payout.id} className="hover:bg-muted/30">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium">{payout.user_name || payout.affiliate_code}</p>
                                                    <p className="text-xs text-muted-foreground">{payout.payout_email || payout.user_email}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-bold">€{Number(payout.amount).toFixed(2)}</td>
                                            <td className="px-4 py-3">
                                                {payout.status === 'pending' && (
                                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500">
                                                        <Clock className="w-3 h-3" /> Pending
                                                    </span>
                                                )}
                                                {payout.status === 'processing' && (
                                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-500">
                                                        <Loader2 className="w-3 h-3 animate-spin" /> Processing
                                                    </span>
                                                )}
                                                {payout.status === 'completed' && (
                                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">
                                                        <Check className="w-3 h-3" /> Completed
                                                    </span>
                                                )}
                                                {payout.status === 'failed' && (
                                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-500">
                                                        <X className="w-3 h-3" /> Failed
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 capitalize">{payout.payout_method || 'PayPal'}</td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {new Date(payout.requested_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground">
                                                {payout.payout_reference || '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {payout.status === 'pending' && (
                                                    <button
                                                        onClick={() => setPayoutModal({
                                                            id: payout.id,
                                                            amount: payout.amount,
                                                            email: payout.payout_email || payout.user_email || ''
                                                        })}
                                                        className="text-xs px-2 py-1 rounded bg-primary/20 text-primary hover:bg-primary/30"
                                                    >
                                                        Process
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {payouts.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                                No payouts found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Partners Tab */}
            {activeTab === 'partners' && <PartnerApplicationsTab />}

            {/* Email Tab */}
            {activeTab === 'email' && <AdminEmailComposer />}

            {/* Messages Tab */}
            {activeTab === 'messages' && <AdminSupportMessages />}

            {/* Credit Edit Modal */}
            {creditModalUser && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4">Edit Credits</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Updating credits for <strong>{creditModalUser.name}</strong>
                        </p>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">New Credits</label>
                                <input
                                    type="number"
                                    value={newCredits}
                                    onChange={e => setNewCredits(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Reason (optional)</label>
                                <input
                                    type="text"
                                    value={creditReason}
                                    onChange={e => setCreditReason(e.target.value)}
                                    placeholder="e.g., bonus, refund, correction"
                                    className="w-full px-4 py-2 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setCreditModalUser(null)}
                                className="flex-1 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreditSubmit}
                                disabled={processing}
                                className="flex-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-50"
                            >
                                {processing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Update'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Affiliate Modal */}
            {affiliateModalUser && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4">Create Affiliate Partner</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Creating affiliate for <strong>{affiliateModalUser.email}</strong>
                        </p>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Affiliate Code (optional)</label>
                                <input
                                    type="text"
                                    value={newAffiliateCode}
                                    onChange={e => setNewAffiliateCode(e.target.value.toUpperCase())}
                                    placeholder="Auto-generated if empty"
                                    className="w-full px-4 py-2 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono uppercase"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Payout Email (optional)</label>
                                <input
                                    type="email"
                                    value={newPayoutEmail}
                                    onChange={e => setNewPayoutEmail(e.target.value)}
                                    placeholder="PayPal email for payouts"
                                    className="w-full px-4 py-2 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setAffiliateModalUser(null)}
                                className="flex-1 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAffiliateSubmit}
                                disabled={processing}
                                className="flex-1 px-4 py-2 rounded-xl bg-purple-500 text-white font-medium disabled:opacity-50"
                            >
                                {processing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Create Affiliate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Process Payout Modal */}
            {payoutModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4">Process Payout</h3>
                        <div className="bg-muted rounded-xl p-4 mb-4">
                            <p className="text-2xl font-bold">€{payoutModal.amount.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">to {payoutModal.email}</p>
                        </div>
                        <div className="mb-4">
                            <label className="text-sm font-medium mb-1 block">Payment Reference (optional)</label>
                            <input
                                type="text"
                                value={payoutReference}
                                onChange={e => setPayoutReference(e.target.value)}
                                placeholder="e.g., PayPal transaction ID"
                                className="w-full px-4 py-2 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setPayoutModal(null)}
                                className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handlePayoutSubmit('failed')}
                                disabled={processing}
                                className="px-4 py-2 rounded-xl bg-red-500/20 text-red-500 hover:bg-red-500/30 disabled:opacity-50"
                            >
                                Mark Failed
                            </button>
                            <button
                                onClick={() => handlePayoutSubmit('completed')}
                                disabled={processing}
                                className="flex-1 px-4 py-2 rounded-xl bg-green-500 text-white font-medium disabled:opacity-50"
                            >
                                {processing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Mark as Paid'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
