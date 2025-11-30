import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import AppearanceSettings from './components/AppearanceSettings';
import LanguageSettings from './components/LanguageSettings';
import ExportSettings from './components/ExportSettings';
import NotificationSettings from './components/NotificationSettings';
import DataSettings from './components/DataSettings';
import Icon from '../../components/AppIcon';

const SettingsConfiguration = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('appearance');

  const settingsTabs = [
    {
      id: 'appearance',
      label: 'Erscheinungsbild',
      icon: 'Palette',
      description: 'Design und Theme-Einstellungen'
    },
    {
      id: 'language',
      label: 'Sprache & Region',
      icon: 'Globe',
      description: 'Sprach- und Formateinstellungen'
    },
    {
      id: 'notifications',
      label: 'Benachrichtigungen',
      icon: 'Bell',
      description: 'Benachrichtigungseinstellungen'
    },
    {
      id: 'export',
      label: 'Export',
      icon: 'Download',
      description: 'Design-Export und Dateiformate'
    },
    {
      id: 'data',
      label: 'Daten & Speicher',
      icon: 'Database',
      description: 'Datenverwaltung und Speicher'
    }
  ];

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'appearance':
        return <AppearanceSettings />;
      case 'language':
        return <LanguageSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'export':
        return <ExportSettings />;
      case 'data':
        return <DataSettings />;
      default:
        return <AppearanceSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      <Header onMenuToggle={() => setSidebarOpen(true)} />
      
      <main className="pt-16">
        <div className="p-6">
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="flex items-center space-x-4 mb-2">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="Settings" size={24} className="text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Einstellungen</h1>
                  <p className="text-muted-foreground">
                    Passen Sie Ihr Dashboard an Ihre Bedürfnisse an
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Settings Navigation */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="lg:col-span-1"
              >
                <div className="bg-card rounded-lg border border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Kategorien</h3>
                  <nav className="space-y-2">
                    {settingsTabs?.map((tab) => (
                      <button
                        key={tab?.id}
                        onClick={() => setActiveTab(tab?.id)}
                        className={`
                          w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200
                          ${activeTab === tab?.id
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                          }
                        `}
                      >
                        <Icon 
                          name={tab?.icon} 
                          size={18} 
                          className={activeTab === tab?.id ? 'text-primary-foreground' : 'text-muted-foreground'}
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${
                            activeTab === tab?.id ? 'text-primary-foreground' : 'text-foreground'
                          }`}>
                            {tab?.label}
                          </p>
                          <p className={`text-xs ${
                            activeTab === tab?.id ? 'text-primary-foreground/80' : 'text-muted-foreground'
                          }`}>
                            {tab?.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 bg-card rounded-lg border border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Schnellaktionen</h3>
                  <div className="space-y-2">
                    <button className="w-full flex items-center space-x-3 px-3 py-2 text-left text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
                      <Icon name="RotateCcw" size={16} />
                      <span>Alle zurücksetzen</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 px-3 py-2 text-left text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
                      <Icon name="Import" size={16} />
                      <span>Einstellungen importieren</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 px-3 py-2 text-left text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
                      <Icon name="HelpCircle" size={16} />
                      <span>Hilfe & Support</span>
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Settings Content */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-3"
              >
                {renderActiveTabContent()}
              </motion.div>
            </div>

            {/* Footer Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 text-center"
            >
              <p className="text-sm text-muted-foreground">
                BlackRuby Dashboard v2.1.0 • Letzte Aktualisierung: 13. Oktober {new Date()?.getFullYear()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                © {new Date()?.getFullYear()} BlackRuby. Alle Rechte vorbehalten.
              </p>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsConfiguration;
