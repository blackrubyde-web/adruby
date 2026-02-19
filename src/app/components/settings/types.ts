// Shared types for the Settings module

export type SettingsTab = 'account' | 'integrations' | 'notifications' | 'appearance' | 'billing' | 'security';

export type NotificationSettings = {
    emailAlerts: boolean;
    budgetAlerts: boolean;
    performanceAlerts: boolean;
    weeklyReport: boolean;
    campaignUpdates: boolean;
};

export type AppearanceSettings = {
    theme: 'dark' | 'light';
    language: string;
    compactMode: boolean;
};

export type ProfileSettings = {
    company?: string;
    timezone?: string;
    notifications?: NotificationSettings;
    appearance?: AppearanceSettings;
    avatar?: {
        bucket: string;
        path: string;
    };
};

/** Props shared by most settings tab components */
export interface SettingsTabProps {
    isSaving: boolean;
    setIsSaving: (v: boolean) => void;
    profileSettings: ProfileSettings;
    buildSettings: (overrides?: Partial<ProfileSettings>) => ProfileSettings;
    saveProfile: (updates: {
        full_name?: string | null;
        email?: string | null;
        settings?: ProfileSettings;
        avatar_url?: string | null;
    }) => Promise<void>;
    refreshProfile: () => Promise<void>;
}
