import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import {
  User,
  Bell,
  Palette,
  CreditCard,
  Shield,
  Trash2,
  Check,
  X,
  ExternalLink,
  AlertCircle,
  Save,
  Facebook,
  Link2,
  Globe,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageShell, HeroHeader } from './layout';
import { BillingPanel } from './BillingPanel';
import { connectMeta, disconnectMeta, getMetaAuthUrl, syncMeta } from '../lib/api/meta';
import { useMetaConnection } from '../hooks/useMetaConnection';
import { useAuthActions, useAuthState } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { useTheme } from './ThemeProvider';

type SettingsTab = 'account' | 'integrations' | 'notifications' | 'appearance' | 'billing' | 'security';

type NotificationSettings = {
  emailAlerts: boolean;
  budgetAlerts: boolean;
  performanceAlerts: boolean;
  weeklyReport: boolean;
  campaignUpdates: boolean;
};

type AppearanceSettings = {
  theme: 'dark' | 'light';
  language: string;
  compactMode: boolean;
};

type ProfileSettings = {
  company?: string;
  timezone?: string;
  notifications?: NotificationSettings;
  appearance?: AppearanceSettings;
  avatar?: {
    bucket: string;
    path: string;
  };
};

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
    const tab = new URLSearchParams(window.location.search).get('tab') as SettingsTab | null;
    const allowed: SettingsTab[] = [
      'account',
      'integrations',
      'notifications',
      'appearance',
      'billing',
      'security'
    ];
    return tab && allowed.includes(tab) ? tab : 'account';
  });
  const [isSaving, setIsSaving] = useState(false);
  const { user, profile } = useAuthState();
  const { refreshProfile } = useAuthActions();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [passwordData, setPasswordData] = useState({ current: '', next: '', confirm: '' });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('tab', activeTab);
    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, document.title, nextUrl);
  }, [activeTab]);

  const profileSettings = useMemo(() => {
    const raw = profile?.settings;
    if (raw && typeof raw === 'object') {
      return raw as ProfileSettings;
    }
    return {};
  }, [profile?.settings]);

  // Account Settings State
  const [accountData, setAccountData] = useState({
    name: '',
    email: '',
    company: '',
    timezone: 'Europe/Berlin',
  });

  // Facebook/Meta Integration State
  const {
    connected: facebookConnected,
    connection: facebookAccount,
    error: metaStatusError,
    refresh: refreshMetaStatus,
  } = useMetaConnection();
  const [metaError, setMetaError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const metaDetails = facebookAccount?.meta as { selected_account?: { name?: string } } | null;
  const selectedAdAccountName =
    metaDetails?.selected_account?.name || facebookAccount?.full_name || '—';
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

  // Notification Settings State
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailAlerts: true,
    budgetAlerts: true,
    performanceAlerts: true,
    weeklyReport: true,
    campaignUpdates: false,
  });

  // Appearance Settings State
  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: theme,
    language: 'de',
    compactMode: false,
  });

  useEffect(() => {
    if (!profile) return;
    setAccountData({
      name: profile.full_name ?? '',
      email: profile.email ?? user?.email ?? '',
      company: profileSettings.company ?? '',
      timezone: profileSettings.timezone ?? 'Europe/Berlin',
    });
    setNotifications({
      emailAlerts: profileSettings.notifications?.emailAlerts ?? true,
      budgetAlerts: profileSettings.notifications?.budgetAlerts ?? true,
      performanceAlerts: profileSettings.notifications?.performanceAlerts ?? true,
      weeklyReport: profileSettings.notifications?.weeklyReport ?? true,
      campaignUpdates: profileSettings.notifications?.campaignUpdates ?? false,
    });
    setAppearance({
      theme: profileSettings.appearance?.theme ?? theme,
      language: profileSettings.appearance?.language ?? 'de',
      compactMode: profileSettings.appearance?.compactMode ?? false,
    });
    setAvatarUrl(profile.avatar_url ?? null);
  }, [profile, profileSettings, theme, user?.email]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const metaErrorParam = params.get('meta_error');
    if (metaErrorParam) {
      setMetaError(decodeURIComponent(metaErrorParam));
      params.delete('meta_error');
      const nextUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, document.title, nextUrl);
    }
  }, []);

  useEffect(() => {
    if (metaStatusError) {
      setMetaError(metaStatusError);
    }
  }, [metaStatusError]);

  const buildSettings = (overrides?: Partial<ProfileSettings>) => ({
    ...profileSettings,
    company: accountData.company,
    timezone: accountData.timezone,
    notifications,
    appearance,
    ...overrides,
  });

  const saveProfile = async (updates: {
    full_name?: string | null;
    email?: string | null;
    settings?: ProfileSettings;
    avatar_url?: string | null;
  }) => {
    if (!user?.id) {
      throw new Error('Bitte zuerst anmelden.');
    }
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id);
    if (error) throw error;
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

  const handleFacebookConnect = async () => {
    setMetaError(null);
    try {
      const { url } = await getMetaAuthUrl();
      window.location.href = url;
      return;
    } catch (err: unknown) {
      // Fallback to server-side token connection (env token) if OAuth isn't configured.
      try {
        toast.info('Connecting Meta account...');
        await connectMeta();
        await refreshMetaStatus();
        toast.success('Meta account connected successfully!');
        return;
      } catch (fallbackErr: unknown) {
        const message = fallbackErr instanceof Error ? fallbackErr.message : 'Meta connection failed';
        setMetaError(message);
        toast.error(message);
      }
    }
  };

  const handleFacebookDisconnect = async () => {
    setMetaError(null);
    try {
      await disconnectMeta();
      await refreshMetaStatus();
      toast.success('Meta account disconnected');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Disconnect failed';
      setMetaError(message);
      toast.error(message);
    }
  };

  const handleMetaSync = async () => {
    setIsSyncing(true);
    setMetaError(null);
    try {
      const res = await syncMeta('30d');
      toast.success(`Synced ${res.campaigns} campaigns`);
      await refreshMetaStatus();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      setMetaError(message);
      toast.error(message);
    } finally {
      setIsSyncing(false);
    }
  };

  const formatDate = (value?: string | null) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('de-DE', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'account', label: 'Account', icon: <User className="w-5 h-5" /> },
    { id: 'integrations', label: 'Integrations', icon: <Link2 className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-5 h-5" /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-5 h-5" /> },
  ];

  return (
    <PageShell>
      <HeroHeader
        title="Settings"
        subtitle="Manage your account settings and integrations"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="backdrop-blur-xl bg-card/60 rounded-2xl border border-border/50 shadow-xl p-2 sticky top-24">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="backdrop-blur-xl bg-card/60 rounded-2xl border border-border/50 shadow-xl">
            {/* Account Settings */}
            {activeTab === 'account' && (
              <div className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Account Settings</h2>
                  <p className="text-sm text-muted-foreground">Manage your personal information</p>
                </div>

                <div className="space-y-6">
                  {/* Profile Picture */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3">Profile Picture</label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold overflow-hidden">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Profile avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span>{initials}</span>
                        )}
                      </div>
                      <div>
                        <button
                          onClick={handleAvatarClick}
                          disabled={isUploadingAvatar}
                          className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-semibold transition-all disabled:opacity-60"
                        >
                          {isUploadingAvatar ? 'Uploading…' : 'Upload New'}
                        </button>
                        <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF. Max 2MB.</p>
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
                    <label className="block text-sm font-semibold text-foreground mb-2">Full Name</label>
                    <input
                      type="text"
                      value={accountData.name}
                      onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Email Address</label>
                    <input
                      type="email"
                      value={accountData.email}
                      onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Company Name</label>
                    <input
                      type="text"
                      value={accountData.company}
                      onChange={(e) => setAccountData({ ...accountData, company: e.target.value })}
                      className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  {/* Timezone */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Timezone</label>
                    <select
                      value={accountData.timezone}
                      onChange={(e) => setAccountData({ ...accountData, timezone: e.target.value })}
                      className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="Europe/Berlin">Europe/Berlin (GMT+1)</option>
                      <option value="Europe/London">Europe/London (GMT+0)</option>
                      <option value="America/New_York">America/New York (GMT-5)</option>
                      <option value="America/Los_Angeles">America/Los Angeles (GMT-8)</option>
                    </select>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSaveAccount}
                    disabled={isSaving}
                    className="w-full md:w-auto px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:scale-105 transition-all shadow-lg shadow-primary/30 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Integrations */}
            {activeTab === 'integrations' && (
              <div className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Integrations</h2>
                  <p className="text-sm text-muted-foreground">Connect your advertising accounts and platforms</p>
                </div>

                <div className="space-y-6">
                  {/* Facebook/Meta Integration */}
                  <div className="p-6 bg-gradient-to-br from-blue-500/10 to-transparent border-2 border-blue-500/20 rounded-2xl">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#1877F2] rounded-2xl flex items-center justify-center">
                          <Facebook className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            Facebook Ads
                            {facebookConnected && (
                              <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-semibold">
                                <CheckCircle2 className="w-3 h-3" />
                                Connected
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Connect your Facebook Ad Account to import campaigns and metrics
                          </p>
                        </div>
                      </div>
                    </div>

                    {facebookConnected ? (
                      <div className="space-y-4">
                        {/* Connected Account Info */}
                        <div className="p-4 bg-background/50 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Account Name</span>
                            <span className="text-sm font-semibold text-foreground">{selectedAdAccountName}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Ad Account ID</span>
                            <span className="text-sm font-mono font-semibold text-foreground">
                              {facebookAccount?.ad_account_id || '—'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Connected Since</span>
                            <span className="text-sm font-semibold text-foreground">
                              {formatDate(facebookAccount?.connected_at)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Last Sync</span>
                            <span className="text-sm font-semibold text-foreground">
                              {formatDate(facebookAccount?.last_sync_at)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Status</span>
                            <span className="flex items-center gap-1 text-sm font-semibold text-green-500">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                              Active
                            </span>
                          </div>
                        </div>

                        {metaError && (
                          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-500">
                            {metaError}
                          </div>
                        )}

                        {/* Permissions */}
                        <div className="p-4 bg-background/50 rounded-xl">
                          <h4 className="text-sm font-semibold text-foreground mb-3">Granted Permissions</h4>
                          <div className="space-y-2">
                            {[
                              'Read ad campaigns',
                              'Read ad insights',
                              'Access ad account data',
                              'View billing information',
                            ].map((permission, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <Check className="w-4 h-4 text-green-500" />
                                <span className="text-muted-foreground">{permission}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                          <button
                            onClick={handleMetaSync}
                            disabled={isSyncing}
                            className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                          >
                            <Zap className="w-4 h-4" />
                            {isSyncing ? 'Syncing…' : 'Sync Now'}
                          </button>
                          <button
                            onClick={handleFacebookDisconnect}
                            className="flex-1 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Disconnect
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-background/50 rounded-xl">
                          <h4 className="text-sm font-semibold text-foreground mb-2">What you'll get:</h4>
                          <ul className="space-y-2">
                            {[
                              'Automatic campaign data sync',
                              'Real-time performance metrics',
                              'AI-powered optimization insights',
                              'Automated reporting',
                            ].map((feature, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Check className="w-4 h-4 text-primary" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button
                          onClick={handleFacebookConnect}
                          className="w-full px-6 py-3 bg-[#1877F2] hover:bg-[#1877F2]/90 text-white rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                          <Facebook className="w-5 h-5" />
                          Connect Facebook Account
                        </button>

                        {metaError && (
                          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-500">
                            {metaError}
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground text-center">
                          By connecting, you agree to share your ad data with our platform
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Google Ads Integration (Placeholder) */}
                  <div className="p-6 bg-gradient-to-br from-red-500/10 to-transparent border-2 border-border/30 rounded-2xl opacity-60">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center">
                          <Globe className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            Google Ads
                            <span className="px-2 py-1 bg-muted rounded-full text-xs font-semibold text-muted-foreground">
                              Coming Soon
                            </span>
                          </h3>
                          <p className="text-sm text-muted-foreground">Google Ads integration will be available soon</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TikTok Ads Integration (Placeholder) */}
                  <div className="p-6 bg-gradient-to-br from-pink-500/10 to-transparent border-2 border-border/30 rounded-2xl opacity-60">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center">
                          <Zap className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            TikTok Ads
                            <span className="px-2 py-1 bg-muted rounded-full text-xs font-semibold text-muted-foreground">
                              Coming Soon
                            </span>
                          </h3>
                          <p className="text-sm text-muted-foreground">TikTok Ads integration will be available soon</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Notifications</h2>
                  <p className="text-sm text-muted-foreground">Manage how you receive notifications</p>
                </div>

                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Email Notifications</h3>
                    <div className="space-y-4">
                      {[
                        { id: 'emailAlerts', label: 'Email Alerts', description: 'Receive important alerts via email' },
                        { id: 'budgetAlerts', label: 'Budget Alerts', description: 'Get notified when budget limits are reached' },
                        { id: 'performanceAlerts', label: 'Performance Alerts', description: 'Alerts for significant performance changes' },
                        { id: 'weeklyReport', label: 'Weekly Report', description: 'Weekly summary of your campaigns' },
                        { id: 'campaignUpdates', label: 'Campaign Updates', description: 'Updates when campaigns start or end' },
                      ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                          <div>
                            <div className="font-semibold text-foreground">{item.label}</div>
                            <div className="text-sm text-muted-foreground">{item.description}</div>
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
                            <div className="w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleSaveNotifications}
                    disabled={isSaving}
                    className="w-full md:w-auto px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:scale-105 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeTab === 'appearance' && (
              <div className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Appearance</h2>
                  <p className="text-sm text-muted-foreground">Customize how the platform looks</p>
                </div>

                <div className="space-y-6">
                  {/* Theme */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3">Theme</label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'light', label: 'Light', icon: '☀️' },
                        { id: 'dark', label: 'Dark', icon: '🌙' },
                      ].map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setAppearance({ ...appearance, theme: option.id as AppearanceSettings['theme'] })}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            appearance.theme === option.id
                              ? 'border-primary bg-primary/10'
                              : 'border-border/30 bg-muted/30 hover:bg-muted/50'
                          }`}
                        >
                          <div className="text-3xl mb-2">{option.icon}</div>
                          <div className="font-semibold text-foreground">{option.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Language</label>
                    <select
                      value={appearance.language}
                      onChange={(e) => setAppearance({ ...appearance, language: e.target.value })}
                      className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="de">Deutsch</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>

                  {/* Compact Mode */}
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                    <div>
                      <div className="font-semibold text-foreground">Compact Mode</div>
                      <div className="text-sm text-muted-foreground">Reduce spacing and padding</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={appearance.compactMode}
                        onChange={(e) => setAppearance({ ...appearance, compactMode: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <button
                    onClick={handleSaveAppearance}
                    disabled={isSaving}
                    className="w-full md:w-auto px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:scale-105 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* Billing */}
            {activeTab === 'billing' && (
              <div className="p-8">
                <BillingPanel />

                {false && (
                  <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Billing & Subscription</h2>
                  <p className="text-sm text-muted-foreground">Manage your subscription and payment methods</p>
                </div>

                <div className="space-y-6">
                  {/* Current Plan */}
                  <div className="p-6 bg-gradient-to-br from-primary/10 to-transparent border-2 border-primary/20 rounded-2xl">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground">Professional Plan</h3>
                        <p className="text-sm text-muted-foreground">Billed monthly</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-foreground">€99</div>
                        <div className="text-sm text-muted-foreground">per month</div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {[
                        'Unlimited campaigns',
                        'AI-powered insights',
                        'Priority support',
                        'Advanced analytics',
                      ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary" />
                          <span className="text-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:scale-105 transition-all">
                        Upgrade Plan
                      </button>
                      <button className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 rounded-xl text-sm font-semibold transition-all">
                        View All Plans
                      </button>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Payment Method</h3>
                    <div className="p-4 bg-muted/30 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">Visa •••• 4242</div>
                          <div className="text-sm text-muted-foreground">Expires 12/2025</div>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-semibold transition-all">
                        Update
                      </button>
                    </div>
                  </div>

                  {/* Billing History */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Billing History</h3>
                    <div className="space-y-3">
                      {[
                        { date: 'Jan 1, 2024', amount: '€99.00', status: 'Paid' },
                        { date: 'Dec 1, 2023', amount: '€99.00', status: 'Paid' },
                        { date: 'Nov 1, 2023', amount: '€99.00', status: 'Paid' },
                      ].map((invoice, i) => (
                        <div key={i} className="p-4 bg-muted/30 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-foreground">{invoice.date}</div>
                            <div className="text-sm text-muted-foreground">{invoice.amount}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-semibold">
                              {invoice.status}
                            </span>
                            <button className="text-sm text-primary hover:underline flex items-center gap-1">
                              Download
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                  </>
                )}
              </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Security</h2>
                  <p className="text-sm text-muted-foreground">Manage your account security settings</p>
                </div>

                <div className="space-y-6">
                  {/* Change Password */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Current Password</label>
                        <input
                          type="password"
                          placeholder="Enter current password"
                          value={passwordData.current}
                          onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                          className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">New Password</label>
                        <input
                          type="password"
                          placeholder="Enter new password"
                          value={passwordData.next}
                          onChange={(e) => setPasswordData({ ...passwordData, next: e.target.value })}
                          className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Confirm Password</label>
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          value={passwordData.confirm}
                          onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                          className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <button
                        onClick={handlePasswordUpdate}
                        disabled={isSaving}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:scale-105 transition-all shadow-lg shadow-primary/30 disabled:opacity-50"
                      >
                        Update Password
                      </button>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="p-6 bg-muted/30 rounded-xl">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">Two-Factor Authentication</h3>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                      </div>
                      <span className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-xs font-semibold">
                        Disabled
                      </span>
                    </div>
                    <button
                      disabled
                      className="px-4 py-2.5 bg-muted text-muted-foreground rounded-xl text-sm font-semibold cursor-not-allowed"
                    >
                      2FA coming soon
                    </button>
                  </div>

                  {/* Danger Zone */}
                  <div className="p-6 bg-red-500/5 border-2 border-red-500/20 rounded-2xl">
                    <div className="flex items-start gap-3 mb-4">
                      <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">Danger Zone</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <button
                          disabled
                          className="px-4 py-2.5 bg-red-500/10 text-red-500/60 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
