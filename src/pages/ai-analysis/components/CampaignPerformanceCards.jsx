import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/AppIcon';
import Tooltip from '../../../components/ui/Tooltip';

const CampaignPerformanceCards = ({ campaignData, kpiEvaluations, isDarkMode }) => {
  // Calculate aggregate metrics
  const aggregateMetrics = React.useMemo(() => {
    if (!campaignData || campaignData?.length === 0) return null;

    const totals = campaignData?.reduce((acc, campaign) => ({
      spend: acc?.spend + parseFloat(campaign?.spend || 0),
      impressions: acc?.impressions + parseInt(campaign?.impressions || 0),
      clicks: acc?.clicks + parseInt(campaign?.clicks || 0),
      conversions: acc?.conversions + parseInt(campaign?.conversions || 0)
    }), { spend: 0, impressions: 0, clicks: 0, conversions: 0 });

    const avgCTR = totals?.impressions > 0 ? (totals?.clicks / totals?.impressions) * 100 : 0;
    const avgCPM = totals?.impressions > 0 ? (totals?.spend / totals?.impressions) * 1000 : 0;
    const avgROAS = totals?.spend > 0 ? (totals?.conversions * 50) / totals?.spend : 0; // Assuming 50€ AOV
    const avgCPA = totals?.conversions > 0 ? totals?.spend / totals?.conversions : totals?.spend;

    return {
      ...totals,
      avgCTR: avgCTR?.toFixed(2),
      avgCPM: avgCPM?.toFixed(2),
      avgROAS: avgROAS?.toFixed(2),
      avgCPA: avgCPA?.toFixed(2)
    };
  }, [campaignData]);

  // Performance cards configuration
  const performanceCards = [
    {
      title: 'Gesamtausgaben',
      value: `${aggregateMetrics?.spend?.toFixed(2) || '0.00'}€`,
      icon: 'Euro',
      color: 'blue',
      bgColor: 'bg-blue-500/20 dark:bg-blue-900/40',
      textColor: 'text-blue-600 dark:text-blue-400',
      description: 'Gesamte Werbeausgaben aller aktiven Kampagnen',
      trend: null
    },
    {
      title: 'Click-Through-Rate',
      value: `${aggregateMetrics?.avgCTR || '0.00'}%`,
      icon: 'MousePointer',
      color: 'green',
      bgColor: 'bg-green-500/20 dark:bg-green-900/40',
      textColor: 'text-green-600 dark:text-green-400',
      description: 'Durchschnittliche CTR aller Kampagnen',
      trend: parseFloat(aggregateMetrics?.avgCTR || 0) > 2 ? 'up' : parseFloat(aggregateMetrics?.avgCTR || 0) < 1 ? 'down' : 'stable'
    },
    {
      title: 'Kosten pro Mille',
      value: `${aggregateMetrics?.avgCPM || '0.00'}€`,
      icon: 'Eye',
      color: 'orange',
      bgColor: 'bg-orange-500/20 dark:bg-orange-900/40',
      textColor: 'text-orange-600 dark:text-orange-400',
      description: 'Durchschnittliche Kosten pro 1.000 Impressions',
      trend: parseFloat(aggregateMetrics?.avgCPM || 0) < 10 ? 'up' : parseFloat(aggregateMetrics?.avgCPM || 0) > 15 ? 'down' : 'stable'
    },
    {
      title: 'Return on Ad Spend',
      value: `${aggregateMetrics?.avgROAS || '0.00'}`,
      icon: 'TrendingUp',
      color: 'purple',
      bgColor: 'bg-purple-500/20 dark:bg-purple-900/40',
      textColor: 'text-purple-600 dark:text-purple-400',
      description: 'Durchschnittlicher Return on Ad Spend',
      trend: parseFloat(aggregateMetrics?.avgROAS || 0) > 3 ? 'up' : parseFloat(aggregateMetrics?.avgROAS || 0) < 2 ? 'down' : 'stable'
    },
    {
      title: 'Kosten pro Conversion',
      value: `${aggregateMetrics?.avgCPA || '0.00'}€`,
      icon: 'Target',
      color: 'red',
      bgColor: 'bg-red-500/20 dark:bg-red-900/40',
      textColor: 'text-red-600 dark:text-red-400',
      description: 'Durchschnittliche Kosten pro Conversion',
      trend: parseFloat(aggregateMetrics?.avgCPA || 0) < 25 ? 'up' : parseFloat(aggregateMetrics?.avgCPA || 0) > 50 ? 'down' : 'stable'
    },
    {
      title: 'Gesamte Conversions',
      value: aggregateMetrics?.conversions?.toLocaleString() || '0',
      icon: 'CheckCircle',
      color: 'emerald',
      bgColor: 'bg-emerald-500/20 dark:bg-emerald-900/40',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      description: 'Alle Conversions aller Kampagnen',
      trend: parseInt(aggregateMetrics?.conversions || 0) > 50 ? 'up' : parseInt(aggregateMetrics?.conversions || 0) < 10 ? 'down' : 'stable'
    }
  ];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return 'TrendingUp';
      case 'down': return 'TrendingDown';
      default: return 'Minus';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-green-600 dark:text-green-400';
      case 'down': return 'text-red-600 dark:text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  if (!aggregateMetrics) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center">
          <Icon name="BarChart3" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Keine Performance-Daten verfügbar
          </h3>
          <p className="text-muted-foreground">
            Verbinden Sie Ihr Facebook Ads Konto, um Performance-Metriken zu sehen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {performanceCards?.map((card, index) => (
        <motion.div
          key={card?.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${card?.bgColor} rounded-lg flex items-center justify-center`}>
              <Icon name={card?.icon} size={24} className={card?.textColor} />
            </div>
            {card?.trend && (
              <div className="flex items-center space-x-1">
                <Icon 
                  name={getTrendIcon(card?.trend)} 
                  size={16} 
                  className={getTrendColor(card?.trend)}
                />
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                {card?.title}
              </h3>
              <Tooltip
                content={card?.description}
                position="top"
                className="bg-popover text-popover-foreground border border-border"
              >
                <Icon name="Info" size={14} className="text-muted-foreground hover:text-foreground cursor-help" />
              </Tooltip>
            </div>
            
            <div className="flex items-end space-x-2">
              <span className="text-2xl font-bold text-foreground">
                {card?.value}
              </span>
            </div>
          </div>

          {/* KPI Status Indicator */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                card?.trend === 'up' ? 'bg-green-500' :
                card?.trend === 'down'? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span className="text-xs text-muted-foreground">
                {card?.trend === 'up' ? 'Gute Performance' :
                 card?.trend === 'down'? 'Optimierung nötig' : 'Durchschnittliche Performance'}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default CampaignPerformanceCards;