import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const DataSettings = () => {
  const [currency, setCurrency] = useState('EUR');
  const [dataRetention, setDataRetention] = useState('12months');
  const [autoBackup, setAutoBackup] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [analyticsTracking, setAnalyticsTracking] = useState(true);

  const currencyOptions = [
    { value: 'EUR', label: 'Euro (€)', description: 'Europäische Währung' },
    { value: 'USD', label: 'US Dollar ($)', description: 'Amerikanische Währung' },
    { value: 'GBP', label: 'British Pound (£)', description: 'Britische Währung' },
    { value: 'CHF', label: 'Swiss Franc (CHF)', description: 'Schweizer Währung' }
  ];

  const retentionOptions = [
    { value: '3months', label: '3 Monate', description: 'Daten für 3 Monate speichern' },
    { value: '6months', label: '6 Monate', description: 'Daten für 6 Monate speichern' },
    { value: '12months', label: '12 Monate', description: 'Daten für 1 Jahr speichern' },
    { value: '24months', label: '24 Monate', description: 'Daten für 2 Jahre speichern' },
    { value: 'unlimited', label: 'Unbegrenzt', description: 'Alle Daten dauerhaft speichern' }
  ];

  const handleDataExport = () => {
    // Simulate data export
    const exportData = {
      campaigns: 45,
      analytics: 1250,
      settings: 12,
      timestamp: new Date()?.toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `blackruby-data-export-${Date.now()}.json`;
    link?.click();
    
    URL.revokeObjectURL(url);
  };

  const handleDataClear = () => {
    if (window.confirm('Sind Sie sicher, dass Sie alle Daten löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      // Simulate data clearing
      console.log('Data cleared');
    }
  };

  const dataStats = [
    {
      label: 'Kampagnendaten',
      value: '2.4 GB',
      description: '45 aktive Kampagnen',
      icon: 'Target'
    },
    {
      label: 'Analytics-Daten',
      value: '1.8 GB',
      description: '12 Monate Verlauf',
      icon: 'BarChart3'
    },
    {
      label: 'Asset-Dateien',
      value: '856 MB',
      description: '234 Bilder und Videos',
      icon: 'Image'
    },
    {
      label: 'Backup-Daten',
      value: '1.2 GB',
      description: 'Letzte Sicherung: Heute',
      icon: 'Shield'
    }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name="Database" size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Daten & Speicher</h3>
          <p className="text-sm text-muted-foreground">Verwalten Sie Ihre Daten und Speichereinstellungen</p>
        </div>
      </div>
      <div className="space-y-6">
        {/* Currency Settings */}
        <div>
          <Select
            label="Standardwährung"
            description="Währung für alle Finanzberichte und Budgets"
            options={currencyOptions}
            value={currency}
            onChange={setCurrency}
            className="mb-4"
          />
        </div>

        {/* Data Retention */}
        <div>
          <Select
            label="Datenaufbewahrung"
            description="Wie lange sollen Ihre Daten gespeichert werden?"
            options={retentionOptions}
            value={dataRetention}
            onChange={setDataRetention}
            className="mb-4"
          />
        </div>

        {/* Data Privacy Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground">Datenschutz-Einstellungen</h4>
          
          <div className="space-y-3">
            <Checkbox
              label="Automatische Backups"
              description="Tägliche automatische Sicherung Ihrer Daten"
              checked={autoBackup}
              onChange={(e) => setAutoBackup(e?.target?.checked)}
            />
            
            <Checkbox
              label="Analytics-Tracking"
              description="Anonyme Nutzungsdaten zur Verbesserung des Services"
              checked={analyticsTracking}
              onChange={(e) => setAnalyticsTracking(e?.target?.checked)}
            />
            
            <Checkbox
              label="Daten teilen"
              description="Aggregierte Daten für Marktforschung teilen"
              checked={dataSharing}
              onChange={(e) => setDataSharing(e?.target?.checked)}
            />
          </div>
        </div>

        {/* Storage Overview */}
        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-medium text-foreground mb-4">Speicher-Übersicht</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dataStats?.map((stat, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg"
              >
                <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center border border-border">
                  <Icon name={stat?.icon} size={16} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{stat?.label}</p>
                  <p className="text-xs text-muted-foreground">{stat?.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{stat?.value}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Total Storage */}
          <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Gesamtspeicher verwendet</p>
                <p className="text-xs text-muted-foreground">von 10 GB verfügbar</p>
              </div>
              <p className="text-lg font-bold text-primary">6.2 GB</p>
            </div>
            <div className="mt-3">
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '62%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management Actions */}
        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-medium text-foreground mb-4">Daten-Management</h4>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={handleDataExport}
              iconName="Download"
              iconPosition="left"
              className="flex-1"
            >
              Daten exportieren
            </Button>
            
            <Button
              variant="outline"
              iconName="RefreshCw"
              iconPosition="left"
              className="flex-1"
            >
              Backup erstellen
            </Button>
            
            <Button
              variant="destructive"
              onClick={handleDataClear}
              iconName="Trash2"
              iconPosition="left"
              className="flex-1"
            >
              Daten löschen
            </Button>
          </div>
        </div>

        {/* GDPR Compliance */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="Shield" size={16} className="text-primary mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">DSGVO-Konformität</h4>
              <p className="text-sm text-muted-foreground">
                Alle Daten werden gemäß der Datenschutz-Grundverordnung (DSGVO) verarbeitet und gespeichert. 
                Sie haben jederzeit das Recht auf Auskunft, Berichtigung und Löschung Ihrer Daten.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSettings;