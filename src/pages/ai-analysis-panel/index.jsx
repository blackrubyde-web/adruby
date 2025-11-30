import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Tooltip from '../../components/ui/Tooltip';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import facebookAdsService from '../../services/facebookAdsService';
import { useAuth } from '../../contexts/AuthContext';

// Import new components
import MetaConnectionModal from './components/MetaConnectionModal';
import CampaignPerformanceCards from './components/CampaignPerformanceCards';
import MetricsChart from './components/MetricsChart';
import FacebookDataSync from './components/FacebookDataSync';

const AIAnalysisPanel = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('de');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [facebookConnection, setFacebookConnection] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [campaignData, setCampaignData] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [expandedCampaigns, setExpandedCampaigns] = useState(new Set());
  const [expandedAdSets, setExpandedAdSets] = useState(new Set());
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [analysisDrawerOpen, setAnalysisDrawerOpen] = useState(false);
  const [analysisResults, setAnalysisResults] = useState({});
  const [kpiEvaluations, setKpiEvaluations] = useState({});
  
  // New state for enhanced functionality
  const [connectionModalOpen, setConnectionModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, campaigns, insights

  // Use AuthContext for proper authentication handling
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'de';
    setCurrentLanguage(savedLanguage);
    
    // Theme detection - same logic as AppearanceSettings
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')?.matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }

    // Listen for theme changes
    const handleStorageChange = (e) => {
      if (e?.key === 'theme') {
        setIsDarkMode(e?.newValue === 'dark');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Only load data after auth state is determined
    if (!authLoading) {
      loadFacebookConnection();
      loadCampaignData();
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [authLoading]);

  const loadFacebookConnection = async () => {
    try {
      const result = await facebookAdsService?.getFacebookConnection();
      if (result?.success && result?.data) {
        setFacebookConnection(result?.data);
      }
    } catch (error) {
      console.error('Error loading Facebook connection:', error);
    }
  };

  const loadCampaignData = async () => {
    try {
      const result = await facebookAdsService?.fetchCampaigns();
      if (result?.success) {
        setCampaignData(result?.data || []);
      }
    } catch (error) {
      console.error('Error loading campaign data:', error);
    }
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  // Enhanced connection handler with modal
  const handleConnectFacebook = async (connectionData) => {
    if (!user) {
      alert('Bitte melden Sie sich an, um Facebook zu verbinden.');
      return;
    }

    setIsConnecting(true);
    try {
      // In production, this would use the actual connectionData
      // For now, using mock data with provided info
      const mockFacebookData = {
        userId: user?.id,
        facebookId: connectionData?.adAccountId || '1234567890',
        accessToken: connectionData?.accessToken || 'mock_access_token',
        profilePicture: 'https://graph.facebook.com/1234567890/picture',
        fullName: user?.user_metadata?.full_name || 'Demo User'
      };

      const result = await facebookAdsService?.connectFacebook(mockFacebookData);
      if (result?.success) {
        setFacebookConnection(mockFacebookData);
        await loadCampaignData();
        setConnectionModalOpen(false);
      } else {
        alert(`Fehler beim Verbinden: ${result?.error}`);
      }
    } catch (error) {
      console.error('Facebook connection error:', error);
      alert('Fehler beim Verbinden mit Facebook. Bitte versuchen Sie es erneut.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectFacebook = async () => {
    if (!user) {
      alert('Bitte melden Sie sich an.');
      return;
    }

    const result = await facebookAdsService?.disconnectFacebook();
    if (result?.success) {
      setFacebookConnection(null);
      setCampaignData([]);
    } else {
      alert(`Fehler beim Trennen: ${result?.error}`);
    }
  };

  const handleRefreshData = async () => {
    setRefreshing(true);
    try {
      await loadCampaignData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const toggleCampaignExpansion = (campaignId) => {
    const newExpanded = new Set(expandedCampaigns);
    if (newExpanded?.has(campaignId)) {
      newExpanded?.delete(campaignId);
    } else {
      newExpanded?.add(campaignId);
    }
    setExpandedCampaigns(newExpanded);
  };

  const toggleAdSetExpansion = (adSetId) => {
    const newExpanded = new Set(expandedAdSets);
    if (newExpanded?.has(adSetId)) {
      newExpanded?.delete(adSetId);
    } else {
      newExpanded?.add(adSetId);
    }
    setExpandedAdSets(newExpanded);
  };

  const handleStartAnalysis = async (item, type) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    try {
      // Use enhanced analysis with KPI evaluations
      const result = await facebookAdsService?.analyzePerformanceWithKPIs(item, type);
      if (result?.success) {
        setSelectedAnalysis({ item, type, analysis: result?.analysis });
        setAnalysisResults(prev => ({
          ...prev,
          [`${type}_${item?.id}`]: result?.analysis
        }));
        
        // Store KPI evaluations for inline display
        if (result?.analysis?.kpi_evaluations) {
          setKpiEvaluations(prev => ({
            ...prev,
            [`${type}_${item?.id}`]: result?.analysis?.kpi_evaluations
          }));
        }
        
        setAnalysisDrawerOpen(true);
      } else {
        alert(`Analysefehler: ${result?.error}`);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Fehler bei der Analyse. Bitte versuchen Sie es erneut.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(100);
    }
  };

  const handleBulkAnalysis = async () => {
    if (campaignData?.length === 0) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      for (const campaign of campaignData) {
        const result = await facebookAdsService?.bulkAnalyzeCampaignData(
          campaign,
          (progress) => setAnalysisProgress(progress)
        );
        
        if (result?.success) {
          setAnalysisResults(prev => ({
            ...prev,
            [`campaign_${campaign?.id}`]: result?.results?.campaign,
            ...result?.results?.adsets?.reduce((acc, adset) => ({
              ...acc,
              [`adset_${adset?.id}`]: adset?.analysis
            }), {}),
            ...result?.results?.ads?.reduce((acc, ad) => ({
              ...acc,
              [`ad_${ad?.id}`]: ad?.analysis
            }), {})
          }));
        }
      }
    } catch (error) {
      console.error('Bulk analysis error:', error);
      alert('Fehler bei der Bulk-Analyse. Bitte versuchen Sie es erneut.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(100);
    }
  };

  // Enhanced status badge colors - now responsive to theme
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-600 dark:bg-green-900/40 dark:text-green-400 border-green-500/30 dark:border-green-800/50';
      case 'paused': return 'bg-yellow-500/20 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400 border-yellow-500/30 dark:border-yellow-800/50';
      case 'completed': return 'bg-blue-500/20 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 border-blue-500/30 dark:border-blue-800/50';
      case 'draft': return 'bg-muted text-muted-foreground border-border';
      case 'learning': return 'bg-purple-500/20 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300 border-purple-500/30 dark:border-purple-800/50';
      case 'disapproved': return 'bg-red-500/20 text-red-600 dark:bg-red-900/40 dark:text-red-400 border-red-500/30 dark:border-red-800/50';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getRecommendationColor = (score) => {
    if (score >= 80) return 'bg-green-500/20 text-green-600 dark:bg-green-900/40 dark:text-green-400 border-green-500/30 dark:border-green-800/50';
    if (score >= 60) return 'bg-yellow-500/20 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400 border-yellow-500/30 dark:border-yellow-800/50';
    return 'bg-red-500/20 text-red-600 dark:bg-red-900/40 dark:text-red-400 border-red-500/30 dark:border-red-800/50';
  };

  const getRecommendationText = (score) => {
    if (score >= 80) return '🚀 Skalieren';
    if (score >= 60) return '🧪 Optimieren';
    return '❌ Stoppen';
  };

  // Enhanced page animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    exit: { opacity: 0, y: -20 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const staggerItem = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  // Helper function to render KPI with evaluation icon - theme responsive
  const renderKPIWithEvaluation = (value, unit, kpiName, itemId, itemType) => {
    const evaluationKey = `${itemType}_${itemId}`;
    const evaluation = kpiEvaluations?.[evaluationKey]?.[kpiName];
    
    if (!evaluation) {
      return <span className="text-foreground font-semibold">{value}{unit}</span>;
    }

    return (
      <div className="flex items-center space-x-2">
        <span className="text-foreground font-semibold">{value}{unit}</span>
        <Tooltip
          content={
            <div className="space-y-1">
              <p className="font-medium text-foreground">{evaluation?.recommendation}</p>
              <p className="text-muted-foreground text-xs">{evaluation?.impact}</p>
              <div className="flex items-center space-x-1 mt-2">
                <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                  evaluation?.status === 'red' ? 'bg-red-500/20 text-red-600 dark:bg-red-900/40 dark:text-red-400' :
                  evaluation?.status === 'yellow'? 'bg-yellow-500/20 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400' : 'bg-green-500/20 text-green-600 dark:bg-green-900/40 dark:text-green-400'
                }`}>
                  {evaluation?.priority === 'high' ? 'Hoch' : 
                   evaluation?.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                </span>
              </div>
            </div>
          }
          position="top"
          className="cursor-help bg-popover text-popover-foreground border border-border"
        >
          <Icon 
            name={evaluation?.icon || 'AlertCircle'} 
            size={16} 
            className="cursor-help transition-transform hover:scale-110"
            style={{ color: evaluation?.color }}
          />
        </Tooltip>
      </div>
    );
  };

  // KPI color coding for values - theme responsive
  const getKPIValueColor = (kpiName, value) => {
    switch (kpiName) {
      case 'ctr':
        if (value > 2) return 'text-green-600 dark:text-green-400';
        if (value < 1) return 'text-red-600 dark:text-red-400';
        return 'text-foreground';
      case 'roas':
        if (value > 3) return 'text-green-600 dark:text-green-400';
        if (value < 1.5) return 'text-red-600 dark:text-red-400';
        return 'text-foreground';
      case 'cpm':
        if (value > 15) return 'text-red-600 dark:text-red-400';
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-foreground';
    }
  };

  // Show loading while auth is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Icon name="Loader2" className="animate-spin text-primary" size={24} />
          <span className="text-foreground">Lädt...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={handleSidebarClose}
      />
      <div className="hidden lg:block w-[72px] flex-shrink-0" />
      <div className="flex-1 min-h-screen flex flex-col">
        <Header onMenuToggle={handleSidebarToggle} />
        
        <motion.main 
          className="pt-16 p-6"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <motion.div 
              className="mb-8"
              variants={staggerItem}
            >
              <h1 className="text-3xl font-semibold text-foreground tracking-tight mb-2">
                AI Analyse Panel
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                Vollständige Facebook/Meta Marketing API Integration mit Echtzeit-Datenanalyse
              </p>
              {!user && (
                <div className="mt-4 p-4 bg-muted border border-border rounded-lg backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <Icon name="AlertTriangle" size={16} className="text-warning" />
                    <span className="text-warning text-sm font-medium">
                      Demo-Modus: Melden Sie sich an, um echte Kampagnendaten zu laden.
                    </span>
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-8"
            >
              {/* Enhanced Facebook Connection Header */}
              <motion.div 
                variants={staggerItem}
                className="bg-card backdrop-blur-sm rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-card-foreground mb-2">
                      Facebook / Meta Marketing API
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {user 
                        ? 'Vollständige Integration mit OAuth 2.0, Echtzeit-Sync und erweiterte Analyse-Features' :'Melden Sie sich an, um Ihr Facebook Ads Konto zu verbinden'
                      }
                    </p>
                  </div>
                  <div className="mt-4 lg:mt-0 flex items-center space-x-3">
                    {facebookConnection ? (
                      <>
                        <div className="flex items-center space-x-3">
                          <img
                            src={facebookConnection?.profile_picture || '/assets/images/no_image.png'}
                            alt={facebookConnection?.full_name}
                            className="w-10 h-10 rounded-full border-2 border-border"
                          />
                          <div>
                            <p className="font-medium text-foreground">
                              {facebookConnection?.full_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Verbunden • API v19.0
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={handleRefreshData}
                          disabled={refreshing}
                          variant="outline"
                          size="sm"
                          className="border-border text-muted-foreground hover:border-primary hover:text-foreground"
                          iconName={refreshing ? "Loader2" : "RefreshCw"}
                          iconPosition="left"
                        >
                          {refreshing ? 'Aktualisiere...' : 'Refresh'}
                        </Button>
                        <Button
                          onClick={handleDisconnectFacebook}
                          variant="outline"
                          size="sm"
                          disabled={!user}
                          className="border-border text-muted-foreground hover:border-destructive hover:text-destructive"
                        >
                          Trennen
                        </Button>
                      </>
                    ) : (
                      <Button 
                        onClick={() => setConnectionModalOpen(true)}
                        disabled={isConnecting || !user}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4 py-2 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        iconName={isConnecting ? "Loader2" : "Facebook"}
                        iconPosition="left"
                      >
                        {isConnecting ? 'Verbinde...' : !user ? 'Anmelden erforderlich' : 'Mit Facebook verbinden'}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Navigation Tabs */}
              {facebookConnection && (
                <motion.div variants={staggerItem}>
                  <div className="bg-card border border-border rounded-lg p-1">
                    <div className="flex space-x-1">
                      {[
                        { id: 'overview', label: 'Übersicht', icon: 'BarChart3' },
                        { id: 'campaigns', label: 'Kampagnen', icon: 'Megaphone' },
                        { id: 'insights', label: 'Insights', icon: 'Brain' }
                      ]?.map((tab) => (
                        <button
                          key={tab?.id}
                          onClick={() => setActiveTab(tab?.id)}
                          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md transition-all duration-200 ${
                            activeTab === tab?.id
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                        >
                          <Icon name={tab?.icon} size={16} />
                          <span className="font-medium">{tab?.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab Contents */}
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && facebookConnection && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    {/* Performance Cards */}
                    <CampaignPerformanceCards 
                      campaignData={campaignData}
                      kpiEvaluations={kpiEvaluations}
                      isDarkMode={isDarkMode}
                    />

                    {/* Metrics Chart */}
                    <MetricsChart 
                      campaignData={campaignData}
                      isDarkMode={isDarkMode}
                    />

                    {/* Data Sync Component */}
                    <FacebookDataSync 
                      onSyncComplete={setCampaignData}
                      facebookConnection={facebookConnection}
                    />
                  </motion.div>
                )}

                {activeTab === 'campaigns' && facebookConnection && (
                  <motion.div
                    key="campaigns"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    {/* Keep existing campaign analysis section */}
                    <div className="bg-card backdrop-blur-sm rounded-lg border border-border overflow-hidden shadow-sm">
                      {/* Analysis Header */}
                      <div className="p-6 border-b border-border">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <h2 className="text-xl font-semibold text-card-foreground mb-2">
                              Interaktive Kampagnen-Analyse
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                              KI-Bewertung mit roten/grünen Symbolen und Handlungsempfehlungen per Tooltip
                            </p>
                          </div>
                          <div className="mt-4 lg:mt-0 flex gap-3">
                            <Button 
                              onClick={handleBulkAnalysis}
                              disabled={isAnalyzing || campaignData?.length === 0}
                              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4 py-2 hover:shadow-lg transition-all duration-300"
                              iconName={isAnalyzing ? "Loader2" : "Brain"}
                              iconPosition="left"
                            >
                              {isAnalyzing ? 'Analysiere...' : 'Alle analysieren'}
                            </Button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {isAnalyzing && (
                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-foreground">
                                Analyse-Fortschritt: {Math.round(analysisProgress)}%
                              </span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${analysisProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Keep existing campaign table */}
                      <div className="overflow-x-auto">
                        <table className="w-full border-separate border-spacing-y-1 bg-background">
                          <thead className="bg-secondary">
                            <tr>
                              <th className="text-left py-4 px-6 font-semibold text-muted-foreground uppercase text-xs tracking-wide">
                                Kampagne / AdSet / Ad
                              </th>
                              <th className="text-left py-4 px-4 font-semibold text-muted-foreground uppercase text-xs tracking-wide">
                                CTR (%)
                              </th>
                              <th className="text-left py-4 px-4 font-semibold text-muted-foreground uppercase text-xs tracking-wide">
                                CPM (€)
                              </th>
                              <th className="text-left py-4 px-4 font-semibold text-muted-foreground uppercase text-xs tracking-wide">
                                CPA (€)
                              </th>
                              <th className="text-left py-4 px-4 font-semibold text-muted-foreground uppercase text-xs tracking-wide">
                                ROAS
                              </th>
                              <th className="text-left py-4 px-4 font-semibold text-muted-foreground uppercase text-xs tracking-wide">
                                Spend (€)
                              </th>
                              <th className="text-left py-4 px-4 font-semibold text-muted-foreground uppercase text-xs tracking-wide">
                                Frequency
                              </th>
                              <th className="text-left py-4 px-4 font-semibold text-muted-foreground uppercase text-xs tracking-wide">
                                Status
                              </th>
                              <th className="text-left py-4 px-4 font-semibold text-muted-foreground uppercase text-xs tracking-wide">
                                Analyse
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {campaignData?.length > 0 ? campaignData?.map((campaign) => (
                              <React.Fragment key={campaign?.id}>
                                {/* Campaign Row with Theme Support */}
                                <tr className="bg-card border border-border hover:bg-accent transition-all duration-300">
                                  <td className="py-4 px-6">
                                    <div className="flex items-center space-x-3">
                                      <button
                                        onClick={() => toggleCampaignExpansion(campaign?.id)}
                                        className="text-muted-foreground hover:text-foreground transition-all hover:scale-110"
                                      >
                                        <Icon 
                                          name={expandedCampaigns?.has(campaign?.id) ? "ChevronDown" : "ChevronRight"} 
                                          size={16} 
                                        />
                                      </button>
                                      <div className="w-8 h-8 bg-blue-500/20 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                                        <Icon name="Megaphone" size={16} className="text-blue-600 dark:text-blue-400" />
                                      </div>
                                      <div>
                                        <p className="font-semibold text-foreground">
                                          {campaign?.name}
                                          {!user && (
                                            <span className="ml-2 text-xs bg-blue-500/20 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                                              Demo
                                            </span>
                                          )}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          Kampagne • {campaign?.meta_ad_sets?.length || 0} AdSets
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className={`font-semibold ${getKPIValueColor('ctr', campaign?.ctr)}`}>
                                      {renderKPIWithEvaluation(campaign?.ctr, '%', 'ctr', campaign?.id, 'campaign')}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className={`font-semibold ${getKPIValueColor('cpm', campaign?.cpm)}`}>
                                      {renderKPIWithEvaluation(campaign?.cpm, '€', 'cpm', campaign?.id, 'campaign')}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4">
                                    {renderKPIWithEvaluation(
                                      campaign?.conversions > 0 ? (parseFloat(campaign?.spend) / campaign?.conversions)?.toFixed(2) : campaign?.spend,
                                      '€', 
                                      'cpa', 
                                      campaign?.id, 
                                      'campaign'
                                    )}
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className={`font-semibold ${getKPIValueColor('roas', campaign?.roas)}`}>
                                      {renderKPIWithEvaluation(campaign?.roas, '', 'roas', campaign?.id, 'campaign')}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4">
                                    {renderKPIWithEvaluation(campaign?.spend, '€', 'spend', campaign?.id, 'campaign')}
                                  </td>
                                  <td className="py-4 px-4">
                                    {renderKPIWithEvaluation(campaign?.frequency || '1.2', '', 'frequency', campaign?.id, 'campaign')}
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeColor(campaign?.status)}`}>
                                      {campaign?.status?.charAt(0)?.toUpperCase() + campaign?.status?.slice(1)}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4">
                                    <Button
                                      onClick={() => handleStartAnalysis(campaign, 'campaign')}
                                      disabled={isAnalyzing}
                                      className="bg-primary/80 text-primary-foreground rounded-md hover:bg-primary hover:shadow-lg transition-all duration-300"
                                      size="sm"
                                      iconName="Brain"
                                      iconPosition="left"
                                    >
                                      Analyse starten
                                    </Button>
                                  </td>
                                </tr>

                                {/* AdSets (Expanded) with Theme Support */}
                                <AnimatePresence>
                                  {expandedCampaigns?.has(campaign?.id) && (
                                    <motion.tr
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      transition={{ duration: 0.3, ease: "easeInOut" }}
                                      className="bg-muted/50"
                                    >
                                      <td colSpan="9" className="p-0">
                                        <div className="overflow-hidden">
                                          {campaign?.meta_ad_sets?.map((adset) => (
                                            <React.Fragment key={adset?.id}>
                                              {/* AdSet Row with Theme Support */}
                                              <div className="border-b border-border hover:bg-accent/50 transition-all duration-300">
                                                <div className="grid grid-cols-9 gap-4 py-3 px-6 pl-16 text-sm">
                                                  <div className="flex items-center space-x-3">
                                                    <button
                                                      onClick={() => toggleAdSetExpansion(adset?.id)}
                                                      className="text-muted-foreground hover:text-foreground transition-all hover:scale-110"
                                                    >
                                                      <Icon 
                                                        name={expandedAdSets?.has(adset?.id) ? "ChevronDown" : "ChevronRight"} 
                                                        size={16} 
                                                      />
                                                    </button>
                                                    <div className="w-6 h-6 bg-green-500/20 dark:bg-green-900/40 rounded flex items-center justify-center">
                                                      <Icon name="Target" size={12} className="text-green-600 dark:text-green-400" />
                                                    </div>
                                                    <div>
                                                      <p className="font-medium text-foreground">
                                                        {adset?.name}
                                                      </p>
                                                      <p className="text-xs text-muted-foreground">
                                                        AdSet • {adset?.meta_ads?.length || 0} Ads
                                                      </p>
                                                    </div>
                                                  </div>
                                                  <div className={`font-semibold ${getKPIValueColor('ctr', adset?.ctr)}`}>
                                                    {renderKPIWithEvaluation(adset?.ctr, '%', 'ctr', adset?.id, 'adset')}
                                                  </div>
                                                  <div className={`font-semibold ${getKPIValueColor('cpm', adset?.cpm)}`}>
                                                    {renderKPIWithEvaluation(adset?.cpm, '€', 'cpm', adset?.id, 'adset')}
                                                  </div>
                                                  <div>{renderKPIWithEvaluation(
                                                    adset?.conversions > 0 ? (parseFloat(adset?.spend) / adset?.conversions)?.toFixed(2) : adset?.spend,
                                                    '€', 'cpa', adset?.id, 'adset'
                                                  )}</div>
                                                  <div className={`font-semibold ${getKPIValueColor('roas', adset?.roas)}`}>
                                                    {renderKPIWithEvaluation(adset?.roas, '', 'roas', adset?.id, 'adset')}
                                                  </div>
                                                  <div>{renderKPIWithEvaluation(adset?.spend, '€', 'spend', adset?.id, 'adset')}</div>
                                                  <div>{renderKPIWithEvaluation(adset?.frequency || '1.8', '', 'frequency', adset?.id, 'adset')}</div>
                                                  <div>
                                                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium border ${getStatusBadgeColor(adset?.status)}`}>
                                                      {adset?.status?.charAt(0)?.toUpperCase() + adset?.status?.slice(1)}
                                                    </span>
                                                  </div>
                                                  <div>
                                                    <Button
                                                      onClick={() => handleStartAnalysis(adset, 'adset')}
                                                      disabled={isAnalyzing}
                                                      className="bg-primary/80 text-primary-foreground rounded-md hover:bg-primary hover:shadow-lg transition-all duration-300"
                                                      size="sm"
                                                      iconName="Brain"
                                                      iconPosition="left"
                                                    >
                                                      Analysieren
                                                    </Button>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Ads (Expanded) with Theme Support */}
                                              <AnimatePresence>
                                                {expandedAdSets?.has(adset?.id) && adset?.meta_ads?.map((ad) => (
                                                  <motion.div
                                                    key={ad?.id}
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                    className="border-b border-border/50 hover:bg-accent/30 transition-all duration-300"
                                                  >
                                                    <div className="grid grid-cols-9 gap-4 py-3 px-6 pl-24 text-sm">
                                                      <div className="flex items-center space-x-3">
                                                        <div className="w-5 h-5 bg-purple-500/20 dark:bg-purple-900/40 rounded flex items-center justify-center">
                                                          <Icon name="Image" size={10} className="text-purple-600 dark:text-purple-300" />
                                                        </div>
                                                        <div>
                                                          <p className="font-medium text-foreground text-sm">
                                                            {ad?.name}
                                                          </p>
                                                          <p className="text-xs text-muted-foreground">
                                                            Ad • {ad?.creative_type}
                                                          </p>
                                                        </div>
                                                      </div>
                                                      <div className={`font-semibold ${getKPIValueColor('ctr', ad?.ctr)}`}>
                                                        {renderKPIWithEvaluation(ad?.ctr, '%', 'ctr', ad?.id, 'ad')}
                                                      </div>
                                                      <div className={`font-semibold ${getKPIValueColor('cpm', ad?.cpm)}`}>
                                                        {renderKPIWithEvaluation(ad?.cpm, '€', 'cpm', ad?.id, 'ad')}
                                                      </div>
                                                      <div>{renderKPIWithEvaluation(
                                                        ad?.conversions > 0 ? (parseFloat(ad?.spend) / ad?.conversions)?.toFixed(2) : ad?.spend,
                                                        '€', 'cpa', ad?.id, 'ad'
                                                      )}</div>
                                                      <div className={`font-semibold ${getKPIValueColor('roas', ad?.roas)}`}>
                                                        {renderKPIWithEvaluation(ad?.roas, '', 'roas', ad?.id, 'ad')}
                                                      </div>
                                                      <div>{renderKPIWithEvaluation(ad?.spend, '€', 'spend', ad?.id, 'ad')}</div>
                                                      <div>{renderKPIWithEvaluation(ad?.frequency || '2.1', '', 'frequency', ad?.id, 'ad')}</div>
                                                      <div>
                                                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium border ${getStatusBadgeColor(ad?.status)}`}>
                                                          {ad?.status?.charAt(0)?.toUpperCase() + ad?.status?.slice(1)}
                                                        </span>
                                                      </div>
                                                      <div className="flex items-center space-x-2">
                                                        {ad?.ai_analysis_score > 0 && (
                                                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRecommendationColor(ad?.ai_analysis_score)}`}>
                                                            {getRecommendationText(ad?.ai_analysis_score)}
                                                          </span>
                                                        )}
                                                        <Button
                                                          onClick={() => handleStartAnalysis(ad, 'ad')}
                                                          disabled={isAnalyzing}
                                                          className="bg-primary/80 text-primary-foreground rounded-md hover:bg-primary hover:shadow-lg transition-all duration-300"
                                                          size="sm"
                                                          iconName="Brain"
                                                          iconPosition="left"
                                                        >
                                                          Analysieren
                                                        </Button>
                                                      </div>
                                                    </div>
                                                  </motion.div>
                                                ))}
                                              </AnimatePresence>
                                            </React.Fragment>
                                          ))}
                                        </div>
                                      </td>
                                    </motion.tr>
                                  )}
                                </AnimatePresence>
                              </React.Fragment>
                            )) : (
                              <tr>
                                <td colSpan="9" className="py-12 text-center">
                                  <div className="flex flex-col items-center space-y-3">
                                    <Icon name="Database" size={48} className="text-muted-foreground" />
                                    <div>
                                      <p className="text-foreground font-medium">
                                        {user ? 'Keine Kampagnendaten verfügbar' : 'Demo-Kampagnendaten werden geladen...'}
                                      </p>
                                      <p className="text-muted-foreground text-sm">
                                        {user 
                                          ? 'Synchronisieren Sie Ihre Facebook Ads oder verwenden Sie die Demo-Daten' :'Melden Sie sich an, um echte Kampagnendaten zu laden'
                                        }
                                      </p>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'insights' && facebookConnection && (
                  <motion.div
                    key="insights"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    <div className="bg-card border border-border rounded-lg p-8 text-center">
                      <Icon name="Brain" size={64} className="text-primary mx-auto mb-4" />
                      <h3 className="text-2xl font-semibold text-foreground mb-2">
                        AI-powered Insights
                      </h3>
                      <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                        Erweiterte KI-Analyse mit Markt-Trends, Wettbewerber-Vergleichen und personalisierten Optimierungsempfehlungen basierend auf Ihrer Branche und Zielgruppe.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <div className="p-4 border border-border rounded-lg">
                          <Icon name="TrendingUp" size={32} className="text-green-600 dark:text-green-400 mx-auto mb-2" />
                          <h4 className="font-semibold text-foreground mb-1">Performance-Trends</h4>
                          <p className="text-sm text-muted-foreground">Zeitbasierte Analyse und Prognosen</p>
                        </div>
                        <div className="p-4 border border-border rounded-lg">
                          <Icon name="Users" size={32} className="text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                          <h4 className="font-semibold text-foreground mb-1">Zielgruppen-Insights</h4>
                          <p className="text-sm text-muted-foreground">Demografische und Verhaltensanalysen</p>
                        </div>
                        <div className="p-4 border border-border rounded-lg">
                          <Icon name="Zap" size={32} className="text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                          <h4 className="font-semibold text-foreground mb-1">Automatisierung</h4>
                          <p className="text-sm text-muted-foreground">KI-gesteuerte Optimierungsvorschläge</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Connection Modal */}
              <MetaConnectionModal
                isOpen={connectionModalOpen}
                onClose={() => setConnectionModalOpen(false)}
                onConnect={handleConnectFacebook}
                isConnecting={isConnecting}
              />

              {/* Keep existing analysis drawer */}
              <AnimatePresence>
                {analysisDrawerOpen && selectedAnalysis && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4"
                    onClick={() => setAnalysisDrawerOpen(false)}
                  >
                    <motion.div
                      initial={{ x: '100%', opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: '100%', opacity: 0 }}
                      transition={{ type: "spring", damping: 25, stiffness: 500 }}
                      className="bg-popover backdrop-blur-sm rounded-lg border border-border p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-lg"
                      onClick={(e) => e?.stopPropagation()}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-xl font-semibold text-popover-foreground">
                            Strategie-basierte KI-Analyse
                          </h3>
                          <p className="text-muted-foreground mt-1 leading-relaxed">
                            {selectedAnalysis?.item?.name} • {selectedAnalysis?.type}
                          </p>
                        </div>
                        <button
                          onClick={() => setAnalysisDrawerOpen(false)}
                          className="text-muted-foreground hover:text-foreground transition-colors hover:scale-110"
                        >
                          <Icon name="X" size={20} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* KPI Evaluation Section */}
                        {selectedAnalysis?.analysis?.kpi_evaluations && (
                          <div className="space-y-4">
                            <h4 className="font-semibold text-foreground text-lg">
                              KPI Bewertung
                            </h4>
                            
                            <div className="space-y-3">
                              {Object.entries(selectedAnalysis?.analysis?.kpi_evaluations)?.map(([kpi, evaluation]) => (
                                <div key={kpi} className="flex items-center justify-between border-b border-border pb-2">
                                  <div className="flex items-center space-x-3">
                                    <Icon 
                                      name={evaluation?.icon} 
                                      size={20} 
                                      style={{ color: evaluation?.color }}
                                    />
                                    <div>
                                      <span className="font-medium text-foreground uppercase">
                                        {kpi}
                                      </span>
                                      <p className="text-xs text-muted-foreground">
                                        {evaluation?.value}{kpi === 'ctr' ? '%' : kpi === 'roas' ? '' : '€'}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="text-right max-w-xs">
                                    <p className="text-sm font-medium text-foreground">
                                      {evaluation?.recommendation}
                                    </p>
                                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium mt-1 ${
                                      evaluation?.priority === 'high' ? 'bg-red-500/20 text-red-600 dark:bg-red-900/40 dark:text-red-400' :
                                      evaluation?.priority === 'medium'? 'bg-yellow-500/20 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400' : 'bg-green-500/20 text-green-600 dark:bg-green-900/40 dark:text-green-400'
                                    }`}>
                                      {evaluation?.priority === 'high' ? 'Hoch' : 
                                       evaluation?.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Gesamtbewertung Section */}
                        <div className="space-y-4">
                          {/* Performance Score */}
                          <div className="bg-muted rounded-lg p-4 border border-border">
                            <div className="flex items-center justify-between">
                              <span className="text-foreground font-medium">
                                Performance Score
                              </span>
                              <div className="flex items-center space-x-2">
                                <span className="text-2xl font-bold text-foreground">
                                  {selectedAnalysis?.analysis?.overall_score || 0}
                                </span>
                                <span className="text-muted-foreground">/100</span>
                              </div>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2 mt-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-500"
                                style={{ width: `${selectedAnalysis?.analysis?.overall_score || 0}%` }}
                              />
                            </div>
                          </div>

                          {/* Key Insights */}
                          {selectedAnalysis?.analysis?.key_insights && (
                            <div>
                              <h4 className="font-semibold text-foreground mb-3">
                                Wichtige Erkenntnisse
                              </h4>
                              <ul className="space-y-2">
                                {selectedAnalysis?.analysis?.key_insights?.map((insight, index) => (
                                  <li key={index} className="flex items-start space-x-2">
                                    <Icon name="CheckCircle" size={16} className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-foreground leading-relaxed text-sm">{insight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Recommendations Section */}
                      {selectedAnalysis?.analysis?.recommendations && (
                        <div className="mt-6">
                          <h4 className="font-semibold text-foreground mb-4">
                            Empfohlene Aktionen (aus Strategie abgeleitet)
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedAnalysis?.analysis?.recommendations?.map((rec, index) => (
                              <div key={index} className="bg-muted rounded-lg p-4 border border-border">
                                <div className="flex items-start justify-between mb-2">
                                  <p className="font-medium text-foreground text-sm">
                                    {rec?.action}
                                  </p>
                                  <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                                    rec?.priority === 'high' ? 'bg-red-500/20 text-red-600 dark:bg-red-900/40 dark:text-red-400' :
                                    rec?.priority === 'medium'? 'bg-yellow-500/20 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400' : 'bg-green-500/20 text-green-600 dark:bg-green-900/40 dark:text-green-400'
                                  }`}>
                                    {rec?.priority === 'high' ? 'Hoch' : 
                                     rec?.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                                  </span>
                                </div>
                                <p className="text-muted-foreground text-xs leading-relaxed">
                                  <strong>Begründung:</strong> {rec?.impact}
                                </p>
                                {rec?.timeline && (
                                  <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                                    <strong>Zeitrahmen:</strong> {rec?.timeline}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="pt-6 border-t border-border">
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl hover:shadow-lg transition-all duration-300">
                          Empfehlungen in Supabase speichern
                        </Button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.main>
      </div>
    </div>
  );
};

export default AIAnalysisPanel;
