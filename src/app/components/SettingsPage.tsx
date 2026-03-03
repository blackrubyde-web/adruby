import { useEffect, useMemo, useState } from 'react';
import {
  User,
  Bell,
  Palette,
  CreditCard,
  Shield,
  Link2,
} from 'lucide-react';
import { DashboardShell } from './layout/DashboardShell';
import { Card } from './ui/card';
import { useAuthActions, useAuthState } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { useTheme } from './ThemeProvider';

import { AccountTab } from './settings/AccountTab';
import { IntegrationsTab } from './settings/IntegrationsTab';
import { NotificationsTab } from './settings/NotificationsTab';
import { AppearanceTab } from './settings/AppearanceTab';
import { BillingPanel } from './BillingPanel';
import { SecurityTab } from './settings/SecurityTab';
import type { SettingsTab, ProfileSettings } from './settings/types';

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
  useTheme();

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

  // Notification & appearance state is managed per-tab, but buildSettings
  // needs access to them. For now, provide a passthrough that each tab
  // can override when calling saveProfile.
  const buildSettings = (overrides?: Partial<ProfileSettings>) => ({
    ...profileSettings,
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

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'account', label: 'Konto', icon: <User className="w-4 h-4" /> },
    { id: 'integrations', label: 'Integrationen', icon: <Link2 className="w-4 h-4" /> },
    { id: 'notifications', label: 'Benachrichtigungen', icon: <Bell className="w-4 h-4" /> },
    { id: 'appearance', label: 'Darstellung', icon: <Palette className="w-4 h-4" /> },
    { id: 'billing', label: 'Abrechnung', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'security', label: 'Sicherheit', icon: <Shield className="w-4 h-4" /> },
  ];

  const sharedProps = {
    isSaving,
    setIsSaving,
    profileSettings,
    buildSettings,
    saveProfile,
    refreshProfile,
  };

  return (
    <DashboardShell hideHero>
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Einstellungen</h1>
          <p className="text-sm text-muted-foreground">Verwalte dein Konto und Integrationen</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-border/50 bg-card p-2">
            <nav className="space-y-0.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
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
          <div className="rounded-xl border border-border/50 bg-card p-6">
            {activeTab === 'account' && <AccountTab {...sharedProps} />}
            {activeTab === 'integrations' && <IntegrationsTab />}
            {activeTab === 'notifications' && <NotificationsTab {...sharedProps} />}
            {activeTab === 'appearance' && <AppearanceTab {...sharedProps} />}
            {activeTab === 'billing' && (
              <div>
                <BillingPanel />
              </div>
            )}
            {activeTab === 'security' && <SecurityTab isSaving={isSaving} setIsSaving={setIsSaving} />}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
