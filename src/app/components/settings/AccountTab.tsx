import { useRef, useMemo, useState, useEffect, type ChangeEvent } from 'react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { SelectField } from '../ui/select-field';
import { useAuthState } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import type { SettingsTabProps } from './types';

interface AccountTabProps extends SettingsTabProps { }

export function AccountTab({
    isSaving,
    setIsSaving,
    profileSettings,
    buildSettings,
    saveProfile,
    refreshProfile,
}: AccountTabProps) {
    const { user, profile } = useAuthState();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const [accountData, setAccountData] = useState({
        name: '',
        email: '',
        company: '',
        timezone: 'Europe/Berlin',
    });

    const initials = useMemo(() => {
        const base =
            accountData.name?.trim() ||
            accountData.email?.trim() ||
            user?.email?.trim() ||
            'U';
        const parts = base.split(' ').filter(Boolean);
        if (parts.length === 1) {
            return parts[0].slice(0, 2).toUpperCase();
        }
        return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
    }, [accountData.email, accountData.name, user?.email]);

    useEffect(() => {
        if (!profile) return;
        setAccountData({
            name: profile.full_name ?? '',
            email: profile.email ?? user?.email ?? '',
            company: profileSettings.company ?? '',
            timezone: profileSettings.timezone ?? 'Europe/Berlin',
        });
        setAvatarUrl(profile.avatar_url ?? null);
    }, [profile, profileSettings, user?.email]);

    const handleAvatarUpload = async (file: File) => {
        if (!user?.id) throw new Error('Bitte zuerst anmelden.');
        if (!file.type.startsWith('image/')) {
            throw new Error('Bitte nur Bilddateien hochladen.');
        }
        if (file.size > 2 * 1024 * 1024) {
            throw new Error('Maximal 2MB pro Datei.');
        }

        const ext = file.name.split('.').pop() || 'png';
        const safeName = file.name.replace(/\s+/g, '-').replace(/[^a-z0-9._-]/gi, '');
        const path = `${user.id}/avatar-${Date.now()}-${crypto.randomUUID()}-${safeName}.${ext}`;
        const buckets = ['profile-avatars', 'creative-inputs', 'creative-renders'];
        let bucketUsed = buckets[0];
        let uploaded = false;

        for (const bucket of buckets) {
            const { error } = await supabase.storage.from(bucket).upload(path, file, {
                contentType: file.type,
                upsert: true,
            });
            if (!error) {
                bucketUsed = bucket;
                uploaded = true;
                break;
            }
            if (!error?.message?.toLowerCase().includes('bucket')) {
                throw new Error(error.message);
            }
        }

        if (!uploaded) {
            throw new Error('Kein Storage-Bucket gefunden. Bitte profile-avatars oder creative-inputs anlegen.');
        }

        const { data: publicData } = supabase.storage.from(bucketUsed).getPublicUrl(path);
        let avatar = publicData?.publicUrl || '';
        if (!avatar) {
            const signed = await supabase.storage.from(bucketUsed).createSignedUrl(path, 60 * 60);
            if (signed.error) throw new Error(signed.error.message);
            avatar = signed.data.signedUrl;
        }

        await saveProfile({
            avatar_url: avatar,
            settings: buildSettings({ avatar: { bucket: bucketUsed, path } }),
        });
        setAvatarUrl(avatar);
        await refreshProfile();
        toast.success('Avatar aktualisiert');
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        event.target.value = '';
        setIsUploadingAvatar(true);
        try {
            await handleAvatarUpload(file);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Avatar-Upload fehlgeschlagen';
            toast.error(message);
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleSaveAccount = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            const trimmedEmail = accountData.email.trim();
            if (!trimmedEmail) throw new Error('Bitte eine gültige E-Mail angeben.');
            if (trimmedEmail !== user?.email) {
                const { error } = await supabase.auth.updateUser({ email: trimmedEmail });
                if (error) throw error;
                toast.info('Bitte bestätige deine neue E-Mail-Adresse im Postfach.');
            }
            await saveProfile({
                full_name: accountData.name.trim() || null,
                email: trimmedEmail,
                settings: buildSettings(),
            });
            await refreshProfile();
            toast.success('Account gespeichert');
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
                <h2 className="text-xl font-bold text-foreground">Kontoeinstellungen</h2>
                <p className="text-sm text-muted-foreground">Verwalte deine persönlichen Daten</p>
            </div>

            <div className="space-y-6">
                {/* Profile Picture */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-3">Profilbild</label>
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold overflow-hidden border-2 border-primary/10">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Profile avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span>{initials}</span>
                            )}
                        </div>
                        <div>
                            <Button
                                variant="outline"
                                onClick={handleAvatarClick}
                                disabled={isUploadingAvatar}
                            >
                                {isUploadingAvatar ? 'Wird hochgeladen…' : 'Bild hochladen'}
                            </Button>
                            <p className="text-xs text-muted-foreground mt-2">JPG, PNG oder GIF. Max 2MB.</p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarFileChange}
                                className="hidden"
                            />
                        </div>
                    </div>
                </div>

                {/* Name */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Vollständiger Name</label>
                    <input
                        type="text"
                        value={accountData.name}
                        onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">E-Mail-Adresse</label>
                    <input
                        type="email"
                        value={accountData.email}
                        onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                </div>

                {/* Company */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Firmenname</label>
                    <input
                        type="text"
                        value={accountData.company}
                        onChange={(e) => setAccountData({ ...accountData, company: e.target.value })}
                        className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                </div>

                {/* Timezone */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Zeitzone</label>
                    <SelectField
                        value={accountData.timezone}
                        onChange={(e) => setAccountData({ ...accountData, timezone: e.target.value })}
                        className="bg-muted/50"
                    >
                        <option value="Europe/Berlin">Europe/Berlin (GMT+1)</option>
                        <option value="Europe/London">Europe/London (GMT+0)</option>
                        <option value="America/New_York">America/New York (GMT-5)</option>
                        <option value="America/Los_Angeles">America/Los Angeles (GMT-8)</option>
                    </SelectField>
                </div>

                {/* Save Button */}
                <Button
                    onClick={handleSaveAccount}
                    disabled={isSaving}
                    className="w-full md:w-auto"
                >
                    {isSaving ? (
                        'Speichern...'
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Änderungen speichern
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
