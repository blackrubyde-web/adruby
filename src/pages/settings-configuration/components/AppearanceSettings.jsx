import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AppearanceSettings = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')?.matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement?.classList?.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement?.classList?.remove('dark');
    }
  }, []);

  const handleThemeToggle = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.documentElement?.classList?.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement?.classList?.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name="Palette" size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Erscheinungsbild</h3>
          <p className="text-sm text-muted-foreground">Passen Sie das Aussehen Ihres Dashboards an</p>
        </div>
      </div>
      <div className="space-y-6">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between py-4 border-b border-border">
          <div className="flex-1">
            <h4 className="text-sm font-medium text-foreground mb-1">Design-Modus</h4>
            <p className="text-sm text-muted-foreground">
              Wählen Sie zwischen hellem und dunklem Design
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Icon name="Sun" size={16} />
              <span>Hell</span>
            </div>
            <button
              onClick={handleThemeToggle}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out
                ${isDarkMode ? 'bg-primary' : 'bg-gray-200'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out
                  ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Icon name="Moon" size={16} />
              <span>Dunkel</span>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <div className="pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => {
              setIsDarkMode(false);
              document.documentElement?.classList?.remove('dark');
              localStorage.removeItem('theme');
            }}
            className="w-full sm:w-auto"
          >
            <Icon name="RotateCcw" size={16} className="mr-2" />
            Auf Standard zurücksetzen
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;
