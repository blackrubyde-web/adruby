import { useState } from 'react';
import { AlertCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { supabase } from '../../lib/supabaseClient';

interface SecurityTabProps {
    isSaving: boolean;
    setIsSaving: (v: boolean) => void;
}

export function SecurityTab({ isSaving, setIsSaving }: SecurityTabProps) {
    const [passwordData, setPasswordData] = useState({ current: '', next: '', confirm: '' });

    const handlePasswordUpdate = async () => {
        if (isSaving) return;
        if (!passwordData.next || passwordData.next.length < 8) {
            toast.error('Passwort muss mindestens 8 Zeichen haben.');
            return;
        }
        if (passwordData.next !== passwordData.confirm) {
            toast.error('Passwörter stimmen nicht überein.');
            return;
        }
        setIsSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: passwordData.next });
            if (error) throw error;
            setPasswordData({ current: '', next: '', confirm: '' });
            toast.success('Passwort aktualisiert');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Passwort-Update fehlgeschlagen';
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <h2 className="text-xl font-bold text-foreground">Sicherheit</h2>
                <p className="text-sm text-muted-foreground">Verwalte deine Sicherheitseinstellungen</p>
            </div>

            <div className="space-y-6">
                {/* Change Password */}
                <div>
                    <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider opacity-70">Passwort ändern</h3>
                    <div className="space-y-4">
                        <input
                            type="password"
                            placeholder="Aktuelles Passwort"
                            value={passwordData.current}
                            onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                            className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <input
                            type="password"
                            placeholder="Neues Passwort"
                            value={passwordData.next}
                            onChange={(e) => setPasswordData({ ...passwordData, next: e.target.value })}
                            className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <input
                            type="password"
                            placeholder="Neues Passwort bestätigen"
                            value={passwordData.confirm}
                            onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                            className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <Button
                            onClick={handlePasswordUpdate}
                            disabled={isSaving}
                        >
                            Passwort aktualisieren
                        </Button>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl mt-8">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 bg-red-500/10 rounded-full shrink-0">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-foreground mb-1">Gefahrenzone</h3>
                            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                                Sobald du dein Konto löschst, gibt es kein Zurück. Bitte sei dir sicher.
                            </p>
                            <Button
                                variant="destructive"
                                disabled
                                className="opacity-70"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Konto löschen
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
