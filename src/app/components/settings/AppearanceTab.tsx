import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { SelectField } from '../ui/select-field';
import { useTheme } from '../ThemeProvider';
import type { AppearanceSettings, SettingsTabProps } from './types';

type AppearanceTabProps = Pick<SettingsTabProps, 'isSaving' | 'setIsSaving' | 'profileSettings' | 'buildSettings' | 'saveProfile' | 'refreshProfile'>;

export function AppearanceTab({
    isSaving,
    setIsSaving,
    profileSettings,
    buildSettings,
    saveProfile,
    refreshProfile,
}: AppearanceTabProps) {
    const { theme, setTheme } = useTheme();

    const [appearance, setAppearance] = useState<AppearanceSettings>({
        theme: theme,
        language: 'de',
        compactMode: false,
    });

    useEffect(() => {
        setAppearance({
            theme: profileSettings.appearance?.theme ?? theme,
            language: profileSettings.appearance?.language ?? 'de',
            compactMode: profileSettings.appearance?.compactMode ?? false,
        });
    }, [profileSettings, theme]);

    const handleSaveAppearance = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            setTheme(appearance.theme);
            await saveProfile({ settings: buildSettings() });
            await refreshProfile();
            toast.success('Erscheinungsbild gespeichert');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Speichern fehlgeschlagen';
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <h2 className="text-xl font-bold text-foreground">Darstellung</h2>
                <p className="text-sm text-muted-foreground">Passe das Aussehen der Plattform an</p>
            </div>

            <div className="space-y-6">
                {/* Theme */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-3">Farbschema</label>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { id: 'light', label: 'Hell', icon: '☀️' },
                            { id: 'dark', label: 'Dunkel', icon: '🌙' },
                        ].map((option) => (
                            <button
                                key={option.id}
                                onClick={() => setAppearance({ ...appearance, theme: option.id as AppearanceSettings['theme'] })}
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 h-28 ${appearance.theme === option.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border/30 bg-muted/20 hover:bg-muted/40'
                                    }`}
                            >
                                <div className="text-2xl">{option.icon}</div>
                                <div className="font-semibold text-foreground">{option.label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Language */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Sprache</label>
                    <SelectField
                        value={appearance.language}
                        onChange={(e) => setAppearance({ ...appearance, language: e.target.value })}
                        className="bg-muted/50"
                    >
                        <option value="de">Deutsch</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                    </SelectField>
                </div>

                <Button
                    onClick={handleSaveAppearance}
                    disabled={isSaving}
                >
                    <Save className="w-4 h-4 mr-2" />
                    Einstellungen speichern
                </Button>
            </div>
        </div>
    );
}
