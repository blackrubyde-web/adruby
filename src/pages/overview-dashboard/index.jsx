import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import StatisticsCard from './components/StatisticsCard';
import PerformanceChart from './components/PerformanceChart';
import CampaignsTable from './components/CampaignsTable';
import DashboardLayout from '../../layouts/DashboardLayout';

const OverviewDashboard = () => {
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

  const quickActions = [
    {
      title: "Neue Kampagne",
      subtitle: "Kampagne erstellen",
      icon: "Plus",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      to: "/campaigns-management",
    },
    {
      title: "Berichte",
      subtitle: "Performance analysieren",
      icon: "BarChart3",
      iconBg: "bg-success/10",
      iconColor: "text-success",
      to: "/ai-analysis",
    },
    {
      title: "Zielgruppen",
      subtitle: "Segmente verwalten",
      icon: "Target",
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
      to: "/ad-strategy",
    },
    {
      title: "Einstellungen",
      subtitle: "Konto konfigurieren",
      icon: "Settings",
      iconBg: "bg-muted/20",
      iconColor: "text-foreground",
      to: "/settings-configuration",
    },
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
    <DashboardLayout>
      <motion.div
        className="p-6 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Page Header */}
        <motion.div variants={itemVariants}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Übersicht</h1>
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
                  transition: { duration: 0.2 },
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
            <h2 className="text-lg font-semibold text-foreground mb-4">Schnellaktionen</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <motion.div
                  key={action.title}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
                >
                  <Link
                    to={action.to}
                    className="block p-4 bg-accent rounded-lg border border-border text-left hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${action.iconBg} rounded-lg flex items-center justify-center`}>
                        <Icon name={action.icon} size={18} className={action.iconColor} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{action.title}</p>
                        <p className="text-sm text-muted-foreground">{action.subtitle}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default OverviewDashboard;
