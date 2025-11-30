import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import StatisticsCard from './components/StatisticsCard';
import PerformanceChart from './components/PerformanceChart';
import CampaignsTable from './components/CampaignsTable';

const OverviewDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, loading, isAuthReady, isSubscribed, subscriptionStatus } = useAuth();

  useEffect(() => {
    if (loading || !isAuthReady) {
      console.log('[Dashboard] waiting auth/session', { loading, isAuthReady, path: window.location.pathname });
      return;
    }

    if (!user) {
      console.log('[Dashboard] no user -> registration', { path: window.location.pathname });
      navigate('/ad-ruby-registration');
      return;
    }

    const hasActiveSub = typeof isSubscribed === 'function' ? isSubscribed() : false;
    if (!hasActiveSub) {
      console.log('[Dashboard] no active subscription -> payment verification', { path: window.location.pathname, subscriptionStatus });
      navigate('/payment-verification');
    }
  }, [user, loading, isAuthReady, isSubscribed, subscriptionStatus, navigate]);

  const statisticsData = [
    {
      title: "Click-Through-Rate",
      value: "3.8%",
      change: "+0.4%",
      changeType: "positive",
      icon: "MousePointer",
      description: "Durchschnittliche CTR aller Kampagnen"
    },
    {
      title: "Conversion Rate",
      value: "4.2%",
      change: "+0.7%",
      changeType: "positive",
      icon: "Target",
      description: "Erfolgreiche Conversions"
    },
    {
      title: "Return on Ad Spend",
      value: "4.5x",
      change: "+0.3x",
      changeType: "positive",
      icon: "TrendingUp",
      description: "Durchschnittlicher ROAS"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  useEffect(() => {
    document.title = "Übersicht - BlackRuby Dashboard";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      <Header onMenuToggle={() => setSidebarOpen(true)} />
      
      <main className="pt-16">
        <motion.div 
          className="p-6 space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
            {/* Page Header */}
            <motion.div variants={itemVariants}>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Dashboard Übersicht
                </h1>
                <p className="text-muted-foreground">
                  Willkommen zurück! Hier ist eine Übersicht Ihrer Kampagnen-Performance.
                </p>
              </div>
            </motion.div>

            {/* Statistics Cards */}
            <motion.div variants={itemVariants}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {statisticsData?.map((stat, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <StatisticsCard {...stat} />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Performance Chart */}
            <motion.div variants={itemVariants}>
              <PerformanceChart />
            </motion.div>

            {/* Recent Campaigns Table */}
            <motion.div variants={itemVariants}>
              <CampaignsTable />
            </motion.div>

            {/* Quick Actions Section */}
            <motion.div variants={itemVariants}>
              <div className="bg-card border border-border rounded-lg p-6 shadow-minimal">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Schnellaktionen
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-4 bg-accent rounded-lg border border-border cursor-pointer hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <span className="text-primary text-lg">+</span>
                        </motion.div>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Neue Kampagne</p>
                        <p className="text-sm text-muted-foreground">Kampagne erstellen</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-4 bg-accent rounded-lg border border-border cursor-pointer hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                        <span className="text-success text-lg">📊</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Berichte</p>
                        <p className="text-sm text-muted-foreground">Performance analysieren</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-4 bg-accent rounded-lg border border-border cursor-pointer hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                        <span className="text-warning text-lg">🎯</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Zielgruppen</p>
                        <p className="text-sm text-muted-foreground">Segmente verwalten</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-4 bg-accent rounded-lg border border-border cursor-pointer hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-primary text-lg">⚙️</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Einstellungen</p>
                        <p className="text-sm text-muted-foreground">Konto konfigurieren</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </main>
    </div>
  );
};

export default OverviewDashboard;
