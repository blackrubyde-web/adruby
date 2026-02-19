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
    <DashboardShell
      title="Einstellungen"
      subtitle="Verwalte dein Konto und Integrationen"
    >

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card variant="glass" className="sticky top-24" padding="sm">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'text-foreground/80 sm:text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <Card variant="glass" padding="default">
            {activeTab === 'account' && <AccountTab {...sharedProps} />}
            {activeTab === 'integrations' && <IntegrationsTab />}
            {activeTab === 'notifications' && <NotificationsTab {...sharedProps} />}
            {activeTab === 'appearance' && <AppearanceTab {...sharedProps} />}
            {activeTab === 'billing' && (
              <div className="p-2">
                <BillingPanel />
              </div>
            )}
            {activeTab === 'security' && <SecurityTab isSaving={isSaving} setIsSaving={setIsSaving} />}
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
