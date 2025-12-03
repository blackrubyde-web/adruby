import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Icon from '../../../components/AppIcon';


const MetricsChart = ({ campaignData, isDarkMode }) => {
  const [selectedMetric, setSelectedMetric] = useState('spend');
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState('7d');

  // Transform campaign data for charts
  const chartData = useMemo(() => {
    if (!campaignData || campaignData?.length === 0) return [];

    // Create time series data (simulated for demo)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date?.setDate(date?.getDate() - (6 - i));
      return date?.toISOString()?.split('T')?.[0];
    });

    return last7Days?.map((date, index) => {
      // Simulate daily metrics based on campaign data
      const dailySpend = campaignData?.reduce((sum, campaign) => 
        sum + (parseFloat(campaign?.spend || 0) / 7), 0
      );
      const dailyImpressions = campaignData?.reduce((sum, campaign) =>
        sum + Math.floor((parseInt(campaign?.impressions || 0) / 7)), 0
      );
      const dailyClicks = campaignData?.reduce((sum, campaign) =>
        sum + Math.floor((parseInt(campaign?.clicks || 0) / 7)), 0
      );
      const dailyConversions = campaignData?.reduce((sum, campaign) =>
        sum + Math.floor((parseInt(campaign?.conversions || 0) / 7)), 0
      );

      const ctr = dailyImpressions > 0 ? (dailyClicks / dailyImpressions) * 100 : 0;
      const cpm = dailyImpressions > 0 ? (dailySpend / dailyImpressions) * 1000 : 0;
      const roas = dailySpend > 0 ? (dailyConversions * 50) / dailySpend : 0;

      // Add some variation for realistic chart
      const variation = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2 multiplier

      return {
        date: date,
        dateFormatted: new Date(date)?.toLocaleDateString('de-DE', { 
          month: 'short', 
          day: 'numeric' 
        }),
        spend: (dailySpend * variation)?.toFixed(2),
        impressions: Math.floor(dailyImpressions * variation),
        clicks: Math.floor(dailyClicks * variation),
        conversions: Math.floor(dailyConversions * variation),
        ctr: (ctr * variation)?.toFixed(2),
        cpm: (cpm * variation)?.toFixed(2),
        roas: (roas * variation)?.toFixed(2)
      };
    });
  }, [campaignData]);

  const metricConfig = {
    spend: {
      label: 'Ausgaben',
      color: '#3B82F6',
      darkColor: '#60A5FA',
      unit: '€',
      icon: 'Euro'
    },
    impressions: {
      label: 'Impressionen',
      color: '#10B981',
      darkColor: '#34D399',
      unit: '',
      icon: 'Eye'
    },
    clicks: {
      label: 'Klicks',
      color: '#F59E0B',
      darkColor: '#FBBF24',
      unit: '',
      icon: 'MousePointer'
    },
    conversions: {
      label: 'Conversions',
      color: '#EF4444',
      darkColor: '#F87171',
      unit: '',
      icon: 'Target'
    },
    ctr: {
      label: 'CTR',
      color: '#8B5CF6',
      darkColor: '#A78BFA',
      unit: '%',
      icon: 'TrendingUp'
    },
    cpm: {
      label: 'CPM',
      color: '#EC4899',
      darkColor: '#F472B6',
      unit: '€',
      icon: 'BarChart3'
    },
    roas: {
      label: 'ROAS',
      color: '#06B6D4',
      darkColor: '#22D3EE',
      unit: '',
      icon: 'Activity'
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0];
      const config = metricConfig?.[selectedMetric];
      
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg backdrop-blur-sm">
          <p className="text-popover-foreground font-medium mb-1">
            {label}
          </p>
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data?.color }}
            />
            <span className="text-popover-foreground">
              {config?.label}: {data?.value}{config?.unit}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!campaignData || campaignData?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center">
          <Icon name="LineChart" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Keine Chart-Daten verfügbar
          </h3>
          <p className="text-muted-foreground">
            Verbinden Sie Ihr Facebook Ads Konto, um Leistungsdiagramme zu sehen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg overflow-hidden"
    >
      {/* Chart Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h3 className="text-xl font-semibold text-card-foreground mb-2">
              Performance-Verlauf
            </h3>
            <p className="text-muted-foreground">
              Entwicklung der wichtigsten Metriken über Zeit
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Metric Selector */}
            <div className="flex bg-muted rounded-lg p-1">
              {Object.entries(metricConfig)?.map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setSelectedMetric(key)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                    selectedMetric === key
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background'
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <Icon name={config?.icon} size={14} />
                    <span>{config?.label}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Chart Type Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              <button
                onClick={() => setChartType('line')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  chartType === 'line' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground hover:bg-background'
                }`}
              >
                <Icon name="LineChart" size={16} />
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  chartType === 'bar' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground hover:bg-background'
                }`}
              >
                <Icon name="BarChart3" size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Chart Container */}
      <div className="p-6">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={isDarkMode ? '#374151' : '#E5E7EB'}
                />
                <XAxis 
                  dataKey="dateFormatted"
                  stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  fontSize={12}
                />
                <YAxis 
                  stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke={isDarkMode ? metricConfig?.[selectedMetric]?.darkColor : metricConfig?.[selectedMetric]?.color}
                  strokeWidth={3}
                  dot={{ 
                    fill: isDarkMode ? metricConfig?.[selectedMetric]?.darkColor : metricConfig?.[selectedMetric]?.color,
                    strokeWidth: 2,
                    r: 5
                  }}
                  activeDot={{ 
                    r: 7,
                    stroke: isDarkMode ? metricConfig?.[selectedMetric]?.darkColor : metricConfig?.[selectedMetric]?.color,
                    strokeWidth: 2
                  }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={isDarkMode ? '#374151' : '#E5E7EB'}
                />
                <XAxis 
                  dataKey="dateFormatted"
                  stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  fontSize={12}
                />
                <YAxis 
                  stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey={selectedMetric}
                  fill={isDarkMode ? metricConfig?.[selectedMetric]?.darkColor : metricConfig?.[selectedMetric]?.color}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
      {/* Chart Footer */}
      <div className="px-6 py-4 bg-muted/50 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ 
                  backgroundColor: isDarkMode 
                    ? metricConfig?.[selectedMetric]?.darkColor 
                    : metricConfig?.[selectedMetric]?.color 
                }}
              />
              <span className="text-muted-foreground">
                {metricConfig?.[selectedMetric]?.label}
              </span>
            </div>
          </div>
          
          <div className="text-muted-foreground">
            Letzten 7 Tage • Aktualisiert vor 2 Min.
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MetricsChart;