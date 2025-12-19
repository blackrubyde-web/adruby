import { TrendingUp, Target } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useTheme } from './ThemeProvider';
import { useState, useEffect } from 'react';

const historicalData = [
  { date: 'Mon', actual: 580 },
  { date: 'Tue', actual: 620 },
  { date: 'Wed', actual: 590 },
  { date: 'Thu', actual: 650 },
  { date: 'Fri', actual: 680 },
  { date: 'Sat', actual: 700 },
  { date: 'Sun', actual: 720 },
];

const forecastData = [
  { date: 'Sun', actual: 720, forecast: null },
  { date: 'Mon', actual: null, forecast: 750 },
  { date: 'Tue', actual: null, forecast: 780 },
  { date: 'Wed', actual: null, forecast: 760 },
  { date: 'Thu', actual: null, forecast: 800 },
  { date: 'Fri', actual: null, forecast: 840 },
  { date: 'Sat', actual: null, forecast: 870 },
  { date: 'Sun', actual: null, forecast: 900 },
];

export function PredictiveAnalytics() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const combinedData = [
    ...historicalData,
    ...forecastData.slice(1),
  ];

  return (
    // FIX 1: Outer Card - Mobile Padding + Hard Boundary
    <div className="bg-card rounded-xl p-4 sm:p-6 border border-border w-full max-w-full overflow-hidden">
      {/* FIX 2: Header - Flex Wrap + min-w-0 + Badge shrinkable */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 min-w-0">
        <div className="flex items-start gap-2 min-w-0">
          <Target className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="min-w-0">
            <h2 className="text-foreground truncate">7-Day Forecast</h2>
            <p className="text-xs text-muted-foreground break-words">
              AI-powered predictions based on current trends
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 px-3 py-1 rounded-full border w-fit max-w-full overflow-hidden bg-purple-500/10 border-purple-500/20">
          <TrendingUp className="w-3 h-3 text-purple-500 shrink-0" />
          <span className="text-xs text-purple-500 font-medium truncate">+25% growth</span>
        </div>
      </div>

      {/* FIX 3: Predictions - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="p-4 rounded-lg border w-full min-w-0 overflow-hidden bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <div className="text-xs text-muted-foreground mb-1 break-words">Projected Impressions</div>
          <div className="text-2xl font-bold text-blue-500 tabular-nums truncate">5.8M</div>
          <div className="text-xs text-green-500 mt-1 break-words">+1.6M from current</div>
        </div>
        <div className="p-4 rounded-lg border w-full min-w-0 overflow-hidden bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <div className="text-xs text-muted-foreground mb-1 break-words">Expected Revenue</div>
          <div className="text-2xl font-bold text-green-500 tabular-nums truncate">$36K</div>
          <div className="text-xs text-green-500 mt-1 break-words">+$7.2K increase</div>
        </div>
        <div className="p-4 rounded-lg border w-full min-w-0 overflow-hidden bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
          <div className="text-xs text-muted-foreground mb-1 break-words">Forecasted ROAS</div>
          <div className="text-2xl font-bold text-purple-500 tabular-nums truncate">5.2x</div>
          <div className="text-xs text-green-500 mt-1 break-words">+0.4x improvement</div>
        </div>
      </div>

      {/* FIX 4: Chart - Safe Container + YAxis width + Mobile YAxis hide */}
      <div className="w-full min-w-0 max-w-full overflow-hidden">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={combinedData} margin={{ left: isMobile ? -20 : 0, right: 0, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2a2a2a' : '#e5e5e5'} />
            <XAxis 
              dataKey="date" 
              stroke={isDark ? '#999999' : '#666666'}
              tick={{ fontSize: 11 }}
              interval="preserveStartEnd"
              minTickGap={16}
            />
            {!isMobile && (
              <YAxis 
                stroke={isDark ? '#999999' : '#666666'}
                tick={{ fontSize: 11 }}
                width={32}
              />
            )}
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDark ? '#0a0a0a' : '#ffffff', 
                border: `1px solid ${isDark ? '#2a2a2a' : '#e5e5e5'}`,
                borderRadius: '8px',
                color: isDark ? '#ffffff' : '#000000',
                fontSize: '12px'
              }}
            />
            
            {/* Actual Data */}
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#actualGradient)"
              name="Actual"
            />
            
            {/* Forecast Data */}
            <Area
              type="monotone"
              dataKey="forecast"
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#forecastGradient)"
              name="Forecast"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* FIX 5: Legend - Wrap + Truncate */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 shrink-0"></div>
          <span className="text-xs text-muted-foreground truncate">Historical Data</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500 shrink-0"></div>
          <span className="text-xs text-muted-foreground truncate">AI Forecast</span>
        </div>
      </div>

      {/* FIX 6: Confidence - Overflow Safe */}
      <div className="mt-4 p-3 rounded-lg border border-border bg-gradient-to-r from-primary/5 to-transparent w-full max-w-full overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Forecast Confidence</span>
          <span className="text-xs font-medium text-green-500">92%</span>
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '92%' }} />
        </div>
      </div>
    </div>
  );
}
