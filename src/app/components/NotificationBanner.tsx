import { AlertTriangle, TrendingDown, Info, X } from 'lucide-react';
import { useState } from 'react';

interface Notification {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

export function NotificationBanner() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Budget Alert',
      message: 'Campaign #7305 has reached 90% of allocated budget'
    },
    {
      id: '2',
      type: 'error',
      title: 'Performance Drop',
      message: 'CTR decreased by 20% in the last 24 hours for Age 45+ audience'
    }
  ]);

  const dismissNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'error':
        return <TrendingDown className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'warning':
        return {
          container: 'bg-card border-yellow-500/20',
          icon: 'text-yellow-600 dark:text-yellow-500',
          title: 'text-foreground'
        };
      case 'error':
        return {
          container: 'bg-card border-red-500/20',
          icon: 'text-red-600 dark:text-red-500',
          title: 'text-foreground'
        };
      case 'info':
        return {
          container: 'bg-card border-blue-500/20',
          icon: 'text-blue-600 dark:text-blue-500',
          title: 'text-foreground'
        };
      default:
        return {
          container: 'bg-card border-border',
          icon: 'text-muted-foreground',
          title: 'text-foreground'
        };
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="space-y-3">
      {notifications.map((notification) => {
        const styles = getStyles(notification.type);
        return (
          <div
            key={notification.id}
            className={`flex items-start gap-4 p-4 rounded-lg border ${styles.container} transition-colors hover:border-border/80 animate-in slide-in-from-top-2 duration-300`}
          >
            {/* Icon */}
            <div className={`mt-0.5 flex-shrink-0 ${styles.icon}`}>
              {getIcon(notification.type)}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold text-sm mb-1 ${styles.title}`}>
                {notification.title}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {notification.message}
              </p>
            </div>
            
            {/* Dismiss */}
            <button
              onClick={() => dismissNotification(notification.id)}
              className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
