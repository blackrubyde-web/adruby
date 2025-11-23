import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';

const LanguageSettings = () => {
  const [currentLanguage, setCurrentLanguage] = useState('de');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [numberFormat, setNumberFormat] = useState('european');

  const languageOptions = [
    { value: 'de', label: 'Deutsch (Deutschland)', description: 'Deutsche Sprache' },
    { value: 'en', label: 'English (United States)', description: 'English language' }
  ];

  const dateFormatOptions = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)', description: 'Europäisches Format' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)', description: 'Amerikanisches Format' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)', description: 'ISO Format' }
  ];

  const numberFormatOptions = [
    { value: 'european', label: '1.000,00 €', description: 'Europäisches Format' },
    { value: 'american', label: '$1,000.00', description: 'Amerikanisches Format' }
  ];

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('language') || 'de';
    const savedDateFormat = localStorage.getItem('dateFormat') || 'DD/MM/YYYY';
    const savedNumberFormat = localStorage.getItem('numberFormat') || 'european';
    
    setCurrentLanguage(savedLanguage);
    setDateFormat(savedDateFormat);
    setNumberFormat(savedNumberFormat);
  }, []);

  const handleLanguageChange = (value) => {
    setCurrentLanguage(value);
    localStorage.setItem('language', value);
    
    // Simulate language change effect
    setTimeout(() => {
      window.location?.reload();
    }, 500);
  };

  const handleDateFormatChange = (value) => {
    setDateFormat(value);
    localStorage.setItem('dateFormat', value);
  };

  const handleNumberFormatChange = (value) => {
    setNumberFormat(value);
    localStorage.setItem('numberFormat', value);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name="Globe" size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Sprache & Region</h3>
          <p className="text-sm text-muted-foreground">Konfigurieren Sie Sprach- und Formateinstellungen</p>
        </div>
      </div>
      <div className="space-y-6">
        {/* Language Selection */}
        <div>
          <Select
            label="Sprache der Benutzeroberfläche"
            description="Wählen Sie Ihre bevorzugte Sprache für die Benutzeroberfläche"
            options={languageOptions}
            value={currentLanguage}
            onChange={handleLanguageChange}
            className="mb-4"
          />
        </div>

        {/* Date Format */}
        <div>
          <Select
            label="Datumsformat"
            description="Wählen Sie das Format für die Datumsanzeige"
            options={dateFormatOptions}
            value={dateFormat}
            onChange={handleDateFormatChange}
            className="mb-4"
          />
        </div>

        {/* Number Format */}
        <div>
          <Select
            label="Zahlenformat"
            description="Wählen Sie das Format für Zahlen und Währungen"
            options={numberFormatOptions}
            value={numberFormat}
            onChange={handleNumberFormatChange}
            className="mb-4"
          />
        </div>

        {/* Regional Settings Info */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="Info" size={16} className="text-primary mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">Regionale Einstellungen</h4>
              <p className="text-sm text-muted-foreground">
                Aktuelle Einstellungen: {currentLanguage === 'de' ? 'Deutsch' : 'English'}, 
                Datumsformat: {dateFormat}, 
                Zahlenformat: {numberFormat === 'european' ? 'Europäisch' : 'Amerikanisch'}
              </p>
            </div>
          </div>
        </div>

        {/* Time Zone Display */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-foreground">Zeitzone</h4>
              <p className="text-sm text-muted-foreground">Automatisch erkannt</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {Intl.DateTimeFormat()?.resolvedOptions()?.timeZone}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date()?.toLocaleString(currentLanguage === 'de' ? 'de-DE' : 'en-US')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageSettings;