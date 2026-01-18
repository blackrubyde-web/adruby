import { memo, useState, useCallback, useEffect } from 'react';
import {
    Bell,
    BellRing,
    AlertTriangle,
    TrendingDown,
    DollarSign,
    Clock,
    ChevronRight,
} from 'lucide-react';
import { Badge } from '../ui/badge';

export interface AlertNotification {
    id: string;
    type: 'budget' | 'roas' | 'ctr' | 'fatigue' | 'spend_spike' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    severity: 'critical' | 'warning' | 'info';
    actionLabel?: string;
    actionUrl?: string;
}

interface AlertNotificationBadgeProps {
    notifications?: AlertNotification[];
    onMarkRead?: (id: string) => void;
    onMarkAllRead?: () => void;
    onAction?: (notification: AlertNotification) => void;
    maxVisible?: number;
}

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'budget': return DollarSign;
        case 'roas': return TrendingDown;
        case 'ctr': return AlertTriangle;
        case 'fatigue': return Clock;
        case 'spend_spike': return AlertTriangle;
        default: return Bell;
    }
};

const getSeverityColor = (severity: string) => {
    switch (severity) {
        case 'critical': return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', badge: 'bg-red-500' };
        case 'warning': return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', badge: 'bg-amber-500' };
        case 'info': return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', badge: 'bg-blue-500' };
        default: return { bg: 'bg-white/5', text: 'text-white/50', border: 'border-white/10', badge: 'bg-white/50' };
    }
};

const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Gerade eben';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
};

// Demo notifications for testing
const DEMO_NOTIFICATIONS: AlertNotification[] = [
    {
        id: '1',
        type: 'budget',
        title: 'Budget Warnung',
        message: 'Kampagne "Summer Sale" hat 90% des Tagesbudgets erreicht',
        timestamp: new Date(Date.now() - 15 * 60000),
        read: false,
        severity: 'warning',
        actionLabel: 'Budget anpassen',
    },
    {
        id: '2',
        type: 'roas',
        title: 'ROAS Alert',
        message: 'ROAS für "Brand Awareness" unter 1.0 seit 2h',
        timestamp: new Date(Date.now() - 2 * 3600000),
        read: false,
        severity: 'critical',
        actionLabel: 'Kampagne prüfen',
    },
    {
        id: '3',
        type: 'fatigue',
        title: 'Ad Fatigue erkannt',
        message: 'Creative #3 zeigt Ermüdungserscheinungen (CTR -15%)',
        timestamp: new Date(Date.now() - 5 * 3600000),
        read: true,
        severity: 'warning',
        actionLabel: 'Creative erneuern',
    },
];

export const AlertNotificationBadge = memo(function AlertNotificationBadge({
    notifications: propNotifications,
    onMarkRead,
    onMarkAllRead,
    onAction,
    maxVisible = 5,
}: AlertNotificationBadgeProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<AlertNotification[]>(
        propNotifications || DEMO_NOTIFICATIONS
    );

    const unreadCount = notifications.filter(n => !n.read).length;
    const hasUnread = unreadCount > 0;

    const handleMarkRead = useCallback((id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        if (onMarkRead) onMarkRead(id);
    }, [onMarkRead]);

    const handleMarkAllRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        if (onMarkAllRead) onMarkAllRead();
    }, [onMarkAllRead]);

    const handleAction = useCallback((notification: AlertNotification) => {
        handleMarkRead(notification.id);
        if (onAction) onAction(notification);
        setIsOpen(false);
    }, [onAction, handleMarkRead]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('[data-alert-badge]')) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [isOpen]);

    return (
        <div className="relative" data-alert-badge>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-lg transition-all ${isOpen
                    ? 'bg-white/10'
                    : hasUnread
                        ? 'bg-amber-500/10 hover:bg-amber-500/20'
                        : 'hover:bg-white/5'
                    }`}
            >
                {hasUnread ? (
                    <BellRing className={`w-5 h-5 ${hasUnread ? 'text-amber-400' : 'text-white/60'}`} />
                ) : (
                    <Bell className="w-5 h-5 text-white/60" />
                )}

                {/* Unread Badge */}
                {hasUnread && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-[360px] max-w-[calc(100vw-32px)] bg-zinc-900/98 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                    {/* Header */}
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BellRing className="w-5 h-5 text-amber-400" />
                            <h3 className="font-semibold text-white">Benachrichtigungen</h3>
                            {hasUnread && (
                                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]">
                                    {unreadCount} neu
                                </Badge>
                            )}
                        </div>
                        {hasUnread && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-white/50 hover:text-white transition-colors"
                            >
                                Alle gelesen
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="w-10 h-10 text-white/20 mx-auto mb-3" />
                                <p className="text-white/50 text-sm">Keine Benachrichtigungen</p>
                            </div>
                        ) : (
                            notifications.slice(0, maxVisible).map((notification) => {
                                const colors = getSeverityColor(notification.severity);
                                const Icon = getTypeIcon(notification.type);

                                return (
                                    <div
                                        key={notification.id}
                                        className={`p-4 border-b border-white/5 last:border-0 transition-colors ${notification.read ? 'opacity-60' : 'bg-white/[0.02]'
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`w-10 h-10 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center shrink-0`}>
                                                <Icon className={`w-5 h-5 ${colors.text}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-medium text-white text-sm">{notification.title}</h4>
                                                        {!notification.read && (
                                                            <span className={`w-2 h-2 rounded-full ${colors.badge}`} />
                                                        )}
                                                    </div>
                                                    <span className="text-[11px] text-white/40 shrink-0">
                                                        {formatTimeAgo(notification.timestamp)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-white/50 mt-0.5 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                {notification.actionLabel && (
                                                    <button
                                                        onClick={() => handleAction(notification)}
                                                        className={`mt-2 px-3 py-1 text-xs font-medium rounded-md ${colors.bg} ${colors.text} border ${colors.border} hover:opacity-80 transition-opacity flex items-center gap-1`}
                                                    >
                                                        {notification.actionLabel}
                                                        <ChevronRight className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > maxVisible && (
                        <div className="p-3 border-t border-white/5 text-center">
                            <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                                Alle {notifications.length} anzeigen
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});
