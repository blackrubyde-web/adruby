import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import facebookAdsService from '../../../services/facebookAdsService';

const FacebookDataSync = ({ onSyncComplete, facebookConnection }) => {
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncDetails, setSyncDetails] = useState({
    campaigns: 0,
    adSets: 0,
    ads: 0,
    currentStep: ''
  });
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check for last sync time from localStorage
    const lastSync = localStorage.getItem('fb_last_sync');
    if (lastSync) {
      setLastSyncTime(new Date(lastSync));
    }
  }, []);

  const handleSyncData = async () => {
    if (!facebookConnection) {
      setError('Keine Facebook-Verbindung gefunden. Bitte verbinden Sie zuerst Ihr Konto.');
      return;
    }

    setSyncStatus('syncing');
    setSyncProgress(0);
    setError('');
    
    try {
      // Step 1: Sync Campaigns
      setSyncDetails(prev => ({ ...prev, currentStep: 'Kampagnen werden synchronisiert...' }));
      setSyncProgress(20);
      
      // Simulate API calls with actual service methods
      const campaignsResult = await facebookAdsService?.fetchCampaigns();
      if (!campaignsResult?.success) {
        throw new Error('Fehler beim Abrufen der Kampagnen');
      }

      setSyncDetails(prev => ({ 
        ...prev, 
        campaigns: campaignsResult?.data?.length || 0,
        currentStep: 'AdSets werden synchronisiert...' 
      }));
      setSyncProgress(50);

      // Step 2: Sync AdSets for each campaign
      let totalAdSets = 0;
      let totalAds = 0;

      for (const campaign of (campaignsResult?.data || [])) {
        if (campaign?.meta_ad_sets) {
          totalAdSets += campaign?.meta_ad_sets?.length;
          
          // Count ads in each adset
          for (const adSet of campaign?.meta_ad_sets) {
            if (adSet?.meta_ads) {
              totalAds += adSet?.meta_ads?.length;
            }
          }
        }
      }

      setSyncDetails(prev => ({ 
        ...prev, 
        adSets: totalAdSets,
        currentStep: 'Anzeigen werden synchronisiert...' 
      }));
      setSyncProgress(75);

      // Step 3: Final sync completion
      setSyncDetails(prev => ({ 
        ...prev, 
        ads: totalAds,
        currentStep: 'Daten werden finalisiert...' 
      }));
      setSyncProgress(90);

      // Small delay for user experience
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSyncProgress(100);
      setSyncStatus('success');
      
      // Update last sync time
      const now = new Date();
      setLastSyncTime(now);
      localStorage.setItem('fb_last_sync', now?.toISOString());

      // Notify parent component
      onSyncComplete?.(campaignsResult?.data);

      // Reset to idle after success message
      setTimeout(() => {
        setSyncStatus('idle');
        setSyncProgress(0);
      }, 3000);

    } catch (error) {
      console.error('Sync error:', error);
      setError(error?.message || 'Fehler bei der Datensynchronisation');
      setSyncStatus('error');
      
      // Reset after error
      setTimeout(() => {
        setSyncStatus('idle');
        setSyncProgress(0);
      }, 5000);
    }
  };

  const formatSyncTime = (date) => {
    if (!date) return 'Nie';
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Gerade eben';
    if (diffMins < 60) return `vor ${diffMins} Min.`;
    if (diffHours < 24) return `vor ${diffHours} Std.`;
    return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing': return 'Loader2';
      case 'success': return 'CheckCircle';
      case 'error': return 'AlertCircle';
      default: return 'RefreshCw';
    }
  };

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case 'syncing': return 'text-blue-600 dark:text-blue-400';
      case 'success': return 'text-green-600 dark:text-green-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-500/20 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
              <Icon name="Database" size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">
                Facebook Daten-Synchronisation
              </h3>
              <p className="text-sm text-muted-foreground">
                Kampagnen, AdSets und Anzeigen in Echtzeit synchronisieren
              </p>
            </div>
          </div>

          <Button
            onClick={handleSyncData}
            disabled={syncStatus === 'syncing' || !facebookConnection}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            iconName={getSyncStatusIcon()}
            iconPosition="left"
          >
            {syncStatus === 'syncing' ? 'Synchronisiere...' : 'Jetzt synchronisieren'}
          </Button>
        </div>
      </div>
      {/* Sync Status */}
      <div className="p-6">
        <div className="space-y-4">
          {/* Last Sync Info */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Letzte Synchronisation:</span>
            <span className="font-medium text-foreground">
              {formatSyncTime(lastSyncTime)}
            </span>
          </div>

          {/* Connection Status */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Verbindungsstatus:</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                facebookConnection?.is_active ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="font-medium text-foreground">
                {facebookConnection?.is_active ? 'Verbunden' : 'Nicht verbunden'}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <AnimatePresence>
            {syncStatus === 'syncing' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">
                    {syncDetails?.currentStep}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {syncProgress}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <motion.div
                    className="bg-primary h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${syncProgress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sync Results */}
          <AnimatePresence>
            {(syncStatus === 'success' || syncDetails?.campaigns > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {syncDetails?.campaigns}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Kampagnen
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {syncDetails?.adSets}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    AdSets
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {syncDetails?.ads}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Anzeigen
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence>
            {syncStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center space-x-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
              >
                <Icon name="CheckCircle" size={20} className="text-green-600 dark:text-green-400" />
                <span className="text-green-700 dark:text-green-300 font-medium">
                  Synchronisation erfolgreich abgeschlossen!
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {syncStatus === 'error' && error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-start space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
              >
                <Icon name="AlertCircle" size={20} className="text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <div className="text-red-700 dark:text-red-300 font-medium">
                    Synchronisation fehlgeschlagen
                  </div>
                  <div className="text-red-600 dark:text-red-400 text-sm mt-1">
                    {error}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* Footer Tips */}
      <div className="px-6 py-4 bg-muted/50 border-t border-border">
        <div className="flex items-start space-x-2 text-xs text-muted-foreground">
          <Icon name="Info" size={14} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Synchronisation-Tipps:</p>
            <ul className="mt-1 space-y-1">
              <li>• Daten werden automatisch alle 6 Stunden synchronisiert</li>
              <li>• Manuelle Synchronisation ist jederzeit möglich</li>
              <li>• Nur aktive Kampagnen der letzten 30 Tage werden abgerufen</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FacebookDataSync;