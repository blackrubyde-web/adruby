import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { useAuthState } from './AuthContext';
import {
    checkAdminRole,
    getAdminUsers,
    getAdminAffiliates,
    getAdminPayouts,
    getAdminStats,
    updateUserCredits,
    createAffiliate,
    approveAffiliate,
    processPayout,
    type AdminUser,
    type AdminAffiliate,
    type AdminPayout,
    type AdminStats
} from '../lib/adminService';

interface AdminContextValue {
    // State
    isAdmin: boolean;
    isLoading: boolean;
    isCheckingRole: boolean;

    // Data
    users: AdminUser[];
    userTotal: number;
    affiliates: AdminAffiliate[];
    payouts: AdminPayout[];
    stats: AdminStats | null;

    // Pagination
    usersPage: number;
    usersSearch: string;

    // Actions
    refreshAll: () => Promise<void>;
    refreshUsers: (page?: number, search?: string) => Promise<void>;
    refreshAffiliates: () => Promise<void>;
    refreshPayouts: (status?: string) => Promise<void>;
    refreshStats: () => Promise<void>;

    // CRUD
    handleUpdateUserCredits: (userId: string, credits: number, reason?: string) => Promise<{ success: boolean; error?: string }>;
    handleCreateAffiliate: (userId: string, code?: string, email?: string) => Promise<{ success: boolean; affiliate_code?: string; error?: string }>;
    handleApproveAffiliate: (affiliateId: string) => Promise<{ success: boolean; error?: string }>;
    handleProcessPayout: (payoutId: string, status: 'completed' | 'failed', reference?: string) => Promise<{ success: boolean; error?: string }>;

    // Setters
    setUsersSearch: (search: string) => void;
    setUsersPage: (page: number) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

const USERS_PER_PAGE = 25;

export function AdminProvider({ children }: { children: ReactNode }) {
    const { user } = useAuthState();

    // Role check
    const [isAdmin, setIsAdmin] = useState(false);
    const [isCheckingRole, setIsCheckingRole] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // Data
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [userTotal, setUserTotal] = useState(0);
    const [affiliates, setAffiliates] = useState<AdminAffiliate[]>([]);
    const [payouts, setPayouts] = useState<AdminPayout[]>([]);
    const [stats, setStats] = useState<AdminStats | null>(null);

    // Pagination
    const [usersPage, setUsersPage] = useState(0);
    const [usersSearch, setUsersSearch] = useState('');

    // Check admin role on mount
    useEffect(() => {
        if (!user?.id) {
            setIsAdmin(false);
            setIsCheckingRole(false);
            return;
        }

        setIsCheckingRole(true);
        checkAdminRole()
            .then(setIsAdmin)
            .finally(() => setIsCheckingRole(false));
    }, [user?.id]);

    // Refresh functions
    const refreshUsers = useCallback(async (page = 0, search = '') => {
        if (!isAdmin) return;
        try {
            const result = await getAdminUsers({
                limit: USERS_PER_PAGE,
                offset: page * USERS_PER_PAGE,
                search: search || undefined
            });
            setUsers(result.users);
            setUserTotal(result.total);
            setUsersPage(page);
            setUsersSearch(search);
        } catch (err) {
            console.error('[Admin] Failed to load users:', err);
        }
    }, [isAdmin]);

    const refreshAffiliates = useCallback(async () => {
        if (!isAdmin) return;
        try {
            const result = await getAdminAffiliates();
            setAffiliates(result);
        } catch (err) {
            console.error('[Admin] Failed to load affiliates:', err);
        }
    }, [isAdmin]);

    const refreshPayouts = useCallback(async (status?: string) => {
        if (!isAdmin) return;
        try {
            const result = await getAdminPayouts(status);
            setPayouts(result);
        } catch (err) {
            console.error('[Admin] Failed to load payouts:', err);
        }
    }, [isAdmin]);

    const refreshStats = useCallback(async () => {
        if (!isAdmin) return;
        try {
            const result = await getAdminStats();
            setStats(result);
        } catch (err) {
            console.error('[Admin] Failed to load stats:', err);
        }
    }, [isAdmin]);

    const refreshAll = useCallback(async () => {
        if (!isAdmin) return;
        setIsLoading(true);
        try {
            await Promise.all([
                refreshUsers(usersPage, usersSearch),
                refreshAffiliates(),
                refreshPayouts(),
                refreshStats()
            ]);
        } finally {
            setIsLoading(false);
        }
    }, [isAdmin, refreshUsers, refreshAffiliates, refreshPayouts, refreshStats, usersPage, usersSearch]);

    // Load initial data when admin
    useEffect(() => {
        if (isAdmin && !isCheckingRole) {
            refreshAll();
        }
    }, [isAdmin, isCheckingRole, refreshAll]);

    // CRUD handlers
    const handleUpdateUserCredits = useCallback(async (userId: string, credits: number, reason?: string) => {
        try {
            const result = await updateUserCredits(userId, credits, reason);
            if (result.success) {
                await refreshUsers(usersPage, usersSearch);
            }
            return { success: result.success };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Failed to update credits' };
        }
    }, [refreshUsers, usersPage, usersSearch]);

    const handleCreateAffiliate = useCallback(async (userId: string, code?: string, email?: string) => {
        try {
            const result = await createAffiliate({ user_id: userId, affiliate_code: code, payout_email: email });
            if (result.success) {
                await Promise.all([refreshAffiliates(), refreshUsers(usersPage, usersSearch)]);
            }
            return result;
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Failed to create affiliate' };
        }
    }, [refreshAffiliates, refreshUsers, usersPage, usersSearch]);

    const handleApproveAffiliate = useCallback(async (affiliateId: string) => {
        try {
            const result = await approveAffiliate(affiliateId);
            if (result.success) {
                await refreshAffiliates();
            }
            return { success: result.success };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Failed to approve affiliate' };
        }
    }, [refreshAffiliates]);

    const handleProcessPayout = useCallback(async (payoutId: string, status: 'completed' | 'failed', reference?: string) => {
        try {
            const result = await processPayout(payoutId, status, reference);
            if (result.success) {
                await Promise.all([refreshPayouts(), refreshStats()]);
            }
            return result;
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Failed to process payout' };
        }
    }, [refreshPayouts, refreshStats]);

    const value = useMemo<AdminContextValue>(() => ({
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
        refreshAffiliates,
        refreshPayouts,
        refreshStats,
        handleUpdateUserCredits,
        handleCreateAffiliate,
        handleApproveAffiliate,
        handleProcessPayout,
        setUsersSearch,
        setUsersPage
    }), [
        isAdmin, isLoading, isCheckingRole,
        users, userTotal, affiliates, payouts, stats,
        usersPage, usersSearch,
        refreshAll, refreshUsers, refreshAffiliates, refreshPayouts, refreshStats,
        handleUpdateUserCredits, handleCreateAffiliate, handleApproveAffiliate, handleProcessPayout
    ]);

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const ctx = useContext(AdminContext);
    if (!ctx) {
        throw new Error('useAdmin must be used within AdminProvider');
    }
    return ctx;
}

// Helper hook to check if current user is admin
export function useIsAdmin() {
    const { isAdmin, isCheckingRole } = useAdmin();
    return { isAdmin, isCheckingRole };
}
