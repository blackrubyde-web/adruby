import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';
import Select from '../../../components/ui/Select';

const NotificationSettings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [campaignAlerts, setCampaignAlerts] = useState(true);
  const [performanceReports, setPerformanceReports] = useState(false);
  const [budgetWarnings, setBudgetWarnings] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [notificationFrequency, setNotificationFrequency] = useState('immediate');

  const frequencyOptions = [
    { value: 'immediate', label: 'Sofort', description: 'Benachrichtigungen sofort erhalten' },
    { value: 'hourly', label: 'Stündlich', description: 'Zusammengefasst jede Stunde' },
    { value: 'daily', label: 'Täglich', description: 'Einmal täglich um 9:00 Uhr' },
    { value: 'weekly', label: 'Wöchentlich', description: 'Montags um 9:00 Uhr' }
  ];

  const notificationTypes = [
    {
      id: 'campaigns',
      title: 'Kampagnen-Benachrichtigungen',
      description: 'Updates zu Kampagnenstatus und -leistung',
      checked: campaignAlerts,
      onChange: setCampaignAlerts,
      icon: 'Target'
    },
    {
      id: 'performance',
      title: 'Leistungsberichte',
      description: 'Wöchentliche und monatliche Leistungsberichte',
      checked: performanceReports,
      onChange: setPerformanceReports,
      icon: 'BarChart3'
    },
    {
      id: 'budget',
      title: 'Budget-Warnungen',
      description: 'Benachrichtigungen bei Budget-Schwellenwerten',
      checked: budgetWarnings,
      onChange: setBudgetWarnings,
      icon: 'AlertTriangle'
    },
    {
      id: 'digest',
      title: 'Wöchentliche Zusammenfassung',
      description: 'Übersicht über alle Aktivitäten der Woche',
      checked: weeklyDigest,
      onChange: setWeeklyDigest,
      icon: 'Mail'
    }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name="Bell" size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Benachrichtigungen</h3>
          <p className="text-sm text-muted-foreground">Verwalten Sie Ihre Benachrichtigungseinstellungen</p>
        </div>
      </div>
      <div className="space-y-6">
        {/* General Notification Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground">Allgemeine Einstellungen</h4>
          
          <div className="space-y-3">
            <Checkbox
              label="E-Mail-Benachrichtigungen"
              description="Benachrichtigungen per E-Mail erhalten"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e?.target?.checked)}
            />
            
            <Checkbox
              label="Push-Benachrichtigungen"
              description="Browser-Benachrichtigungen aktivieren"
              checked={pushNotifications}
              onChange={(e) => setPushNotifications(e?.target?.checked)}
            />
          </div>
        </div>

        {/* Notification Frequency */}
        <div>
          <Select
            label="Benachrichtigungshäufigkeit"
            description="Wie oft möchten Sie Benachrichtigungen erhalten?"
            options={frequencyOptions}
            value={notificationFrequency}
            onChange={setNotificationFrequency}
            className="mb-4"
          />
        </div>

        {/* Specific Notification Types */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground">Benachrichtigungstypen</h4>
          
          <div className="space-y-4">
            {notificationTypes?.map((type) => (
              <div
                key={type?.id}
                className="flex items-start space-x-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center border border-border">
                  <Icon name={type?.icon} size={16} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <Checkbox
                    label={type?.title}
                    description={type?.description}
                    checked={type?.checked}
                    onChange={(e) => type?.onChange(e?.target?.checked)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-medium text-foreground mb-4">Ruhezeiten</h4>
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-foreground">Ruhezeiten aktivieren</p>
                <p className="text-sm text-muted-foreground">Keine Benachrichtigungen während bestimmter Zeiten</p>
              </div>
              <Checkbox
               
                onChange={() => {}}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 opacity-50">
              <div>
                <label className="text-xs text-muted-foreground">Von</label>
                <p className="text-sm text-foreground">22:00</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Bis</label>
                <p className="text-sm text-foreground">08:00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preview */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="Info" size={16} className="text-primary mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">Vorschau</h4>
              <p className="text-sm text-muted-foreground">
                Mit den aktuellen Einstellungen erhalten Sie {emailNotifications ? 'E-Mail' : 'keine E-Mail'} und {pushNotifications ? 'Push' : 'keine Push'}-Benachrichtigungen {notificationFrequency === 'immediate' ? 'sofort' : `${notificationFrequency === 'hourly' ? 'stündlich' : notificationFrequency === 'daily' ? 'täglich' : 'wöchentlich'}`}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;