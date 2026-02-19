import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import type { NotificationSettings, SettingsTabProps } from './types';

type NotificationsTabProps = Pick<SettingsTabProps, 'isSaving' | 'setIsSaving' | 'profileSettings' | 'buildSettings' | 'saveProfile' | 'refreshProfile'>;

export function NotificationsTab({
    isSaving,
    setIsSaving,
    profileSettings,
    buildSettings,
    saveProfile,
    refreshProfile,
}: NotificationsTabProps) {

    const [notifications, setNotifications] = useState<NotificationSettings>({
        emailAlerts: true,
        budgetAlerts: true,
        performanceAlerts: true,
        weeklyReport: true,
        campaignUpdates: false,
    });

    useEffect(() => {
        setNotifications({
            emailAlerts: profileSettings.notifications?.emailAlerts ?? true,
            budgetAlerts: profileSettings.notifications?.budgetAlerts ?? true,
            performanceAlerts: profileSettings.notifications?.performanceAlerts ?? true,
            weeklyReport: profileSettings.notifications?.weeklyReport ?? true,
            campaignUpdates: profileSettings.notifications?.campaignUpdates ?? false,
        });
    }, [profileSettings]);

    const handleSaveNotifications = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            await saveProfile({ settings: buildSettings() });
            await refreshProfile();
            toast.success('Benachrichtigungen gespeichert');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Speichern fehlgeschlagen';
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    const items = [
        { id: 'emailAlerts', label: 'E-Mail Benachrichtigungen', description: 'Wichtige Benachrichtigungen per E-Mail erhalten' },
        { id: 'budgetAlerts', label: 'Budget-Warnungen', description: 'Benachrichtigung bei Erreichen von Budgetlimits' },
        { id: 'performanceAlerts', label: 'Performance-Warnungen', description: 'Warnungen bei signifikanten Performance-Änderungen' },
        { id: 'weeklyReport', label: 'Wöchentlicher Bericht', description: 'Wöchentliche Zusammenfassung deiner Kampagnen' },
        { id: 'campaignUpdates', label: 'Kampagnen-Updates', description: 'Updates wenn Kampagnen starten oder enden' },
    ] as const;

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <h2 className="text-xl font-bold text-foreground">Benachrichtigungen</h2>
                <p className="text-sm text-muted-foreground">Verwalte wie du benachrichtigt wirst</p>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider opacity-70">E-Mail-Benachrichtigungen</h3>
                    <div className="space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/40 hover:bg-muted/30 transition-colors">
                                <div>
                                    <div className="font-semibold text-foreground text-sm">{item.label}</div>
                                    <div className="text-xs text-muted-foreground">{item.description}</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notifications[item.id as keyof typeof notifications]}
                                        onChange={(e) =>
                                            setNotifications({ ...notifications, [item.id]: e.target.checked })
                                        }
                                        className="sr-only peer"
                                    />
                                    <div className="w-10 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <Button
                    onClick={handleSaveNotifications}
                    disabled={isSaving}
                >
                    <Save className="w-4 h-4 mr-2" />
                    Einstellungen speichern
                </Button>
            </div>
        </div>
    );
}
