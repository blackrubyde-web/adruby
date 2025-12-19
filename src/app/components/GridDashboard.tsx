import { useState, useEffect } from 'react';
import GridLayout, { type Layout } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
import { 
  Eye, MousePointerClick, DollarSign, TrendingUp, Target,
  Zap, Clock, Activity, Gauge, ArrowUpRight
} from 'lucide-react';
import { PerformanceChart } from './PerformanceChart';

const DEFAULT_LAYOUT: Layout = [
  // Top row - Small stats (1x1)
  { i: 'impressions', x: 0, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
  { i: 'clicks', x: 1, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
  { i: 'ctr', x: 2, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
  { i: 'roas', x: 3, y: 0, w: 1, h: 1, minW: 1, minH: 1 },
  
  // Second row - Medium widgets (2x1)
  { i: 'performance', x: 0, y: 1, w: 2, h: 2, minW: 2, minH: 2 },
  { i: 'activity', x: 2, y: 1, w: 2, h: 2, minW: 2, minH: 2 },
  
  // Third row - Large + Small
  { i: 'campaigns', x: 0, y: 3, w: 3, h: 2, minW: 2, minH: 2 },
  { i: 'quickstats', x: 3, y: 3, w: 1, h: 2, minW: 1, minH: 2 },
];

export function GridDashboard() {
  const [layout, setLayout] = useState<Layout>(() => {
    const saved = localStorage.getItem('dashboardLayout');
    return saved ? JSON.parse(saved) : DEFAULT_LAYOUT;
  });
  
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Mobile detection
  const isMobile = windowWidth < 640;

  // DYNAMIC Mobile Layout - 1 Column, Vertical Stack (SORTED BY Y!)
  const MOBILE_LAYOUT: Layout = layout
    .slice()
    .sort((a, b) => (a.y ?? 0) - (b.y ?? 0))
    .map((item, idx) => ({
      ...item,
      x: 0,
      w: 1,
      y: idx * (item.h ?? 2),
    }));

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLayoutChange = (newLayout: Layout) => {
    setLayout(newLayout);
    localStorage.setItem('dashboardLayout', JSON.stringify(newLayout));
  };

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case 'impressions':
        return (
          <div className="h-full p-5 bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-transparent backdrop-blur-xl border border-blue-500/20 rounded-3xl flex flex-col justify-between shadow-xl">
            <div className="flex items-start justify-between">
              <div className="p-3 bg-blue-500/20 rounded-2xl">
                <Eye className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full">
                <ArrowUpRight className="w-3 h-3 text-green-400" />
                <span className="text-xs font-semibold text-green-400">12.5%</span>
              </div>
            </div>
            <div className="mt-auto">
              <div className="text-3xl font-bold text-foreground mb-1">2.4M</div>
              <div className="text-xs text-muted-foreground font-medium">Impressions</div>
            </div>
          </div>
        );
      
      case 'clicks':
        return (
          <div className="h-full p-5 bg-gradient-to-br from-green-500/20 via-green-500/10 to-transparent backdrop-blur-xl border border-green-500/20 rounded-3xl flex flex-col justify-between shadow-xl">
            <div className="flex items-start justify-between">
              <div className="p-3 bg-green-500/20 rounded-2xl">
                <MousePointerClick className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full">
                <ArrowUpRight className="w-3 h-3 text-green-400" />
                <span className="text-xs font-semibold text-green-400">8.3%</span>
              </div>
            </div>
            <div className="mt-auto">
              <div className="text-3xl font-bold text-foreground mb-1">89K</div>
              <div className="text-xs text-muted-foreground font-medium">Clicks</div>
            </div>
          </div>
        );
      
      case 'ctr':
        return (
          <div className="h-full p-5 bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-transparent backdrop-blur-xl border border-purple-500/20 rounded-3xl flex flex-col justify-between shadow-xl">
            <div className="flex items-start justify-between">
              <div className="p-3 bg-purple-500/20 rounded-2xl">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full">
                <ArrowUpRight className="w-3 h-3 text-green-400" />
                <span className="text-xs font-semibold text-green-400">0.4%</span>
              </div>
            </div>
            <div className="mt-auto">
              <div className="text-3xl font-bold text-foreground mb-1">3.72%</div>
              <div className="text-xs text-muted-foreground font-medium">CTR</div>
            </div>
          </div>
        );
      
      case 'roas':
        return (
          <div className="h-full p-5 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-xl border border-primary/20 rounded-3xl flex flex-col justify-between shadow-xl">
            <div className="flex items-start justify-between">
              <div className="p-3 bg-primary/20 rounded-2xl">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full">
                <ArrowUpRight className="w-3 h-3 text-green-400" />
                <span className="text-xs font-semibold text-green-400">0.6x</span>
              </div>
            </div>
            <div className="mt-auto">
              <div className="text-3xl font-bold text-foreground mb-1">4.8x</div>
              <div className="text-xs text-muted-foreground font-medium">ROAS</div>
            </div>
          </div>
        );
      
      case 'performance':
        return (
          <div className="h-full p-6 bg-card/60 backdrop-blur-xl border border-border/30 rounded-3xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Performance
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
              </div>
              <div className="px-3 py-1.5 bg-green-500/10 rounded-full">
                <span className="text-sm font-semibold text-green-500">↑ 18.4%</span>
              </div>
            </div>
            <div className="h-[calc(100%-4rem)]">
              <PerformanceChart />
            </div>
          </div>
        );
      
      case 'activity':
        return (
          <div className="h-full p-6 bg-gradient-to-br from-indigo-500/20 via-indigo-500/10 to-transparent backdrop-blur-xl border border-indigo-500/20 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  Daily Activity
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Campaign engagement</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Activity bars */}
              <div className="space-y-3">
                {[
                  { label: 'Mon', value: 85, color: 'bg-indigo-500' },
                  { label: 'Tue', value: 92, color: 'bg-indigo-400' },
                  { label: 'Wed', value: 78, color: 'bg-indigo-500' },
                  { label: 'Thu', value: 95, color: 'bg-indigo-300' },
                  { label: 'Fri', value: 88, color: 'bg-indigo-500' },
                  { label: 'Sat', value: 65, color: 'bg-indigo-600' },
                  { label: 'Sun', value: 70, color: 'bg-indigo-500' },
                ].map((day, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-8 font-medium">{day.label}</span>
                    <div className="flex-1 h-2 bg-muted/20 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${day.color} rounded-full transition-all duration-500`}
                        style={{ width: `${day.value}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-foreground w-10 text-right">{day.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'campaigns':
        return (
          <div className="h-full p-6 bg-card/60 backdrop-blur-xl border border-border/30 rounded-3xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Active Campaigns
                </h3>
                <p className="text-xs text-muted-foreground mt-1">5 campaigns running</p>
              </div>
            </div>
            
            <div className="space-y-3 overflow-auto h-[calc(100%-4rem)] pr-2 custom-scrollbar">
              {[
                { name: 'Summer Sale 2024', status: 'Active', budget: '$2,400', spent: 78, color: 'text-green-500' },
                { name: 'Black Friday Promo', status: 'Active', budget: '$5,000', spent: 92, color: 'text-blue-500' },
                { name: 'New Product Launch', status: 'Active', budget: '$3,200', spent: 45, color: 'text-purple-500' },
              ].map((campaign, idx) => (
                <div key={idx} className="p-4 bg-muted/30 rounded-2xl border border-border/30 hover:bg-muted/50 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-sm mb-1 truncate min-w-0">{campaign.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${campaign.color} font-medium`}>{campaign.status}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{campaign.budget}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Budget spent</span>
                      <span className="text-xs font-semibold text-foreground">{campaign.spent}%</span>
                    </div>
                    <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500"
                        style={{ width: `${campaign.spent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'quickstats':
        return (
          <div className="h-full p-5 bg-gradient-to-br from-orange-500/20 via-orange-500/10 to-transparent backdrop-blur-xl border border-orange-500/20 rounded-3xl shadow-xl flex flex-col gap-4">
            <div className="flex-1 flex flex-col justify-center items-center p-4 bg-muted/20 rounded-2xl border border-border/30">
              <Gauge className="w-8 h-8 text-orange-400 mb-2" />
              <div className="text-2xl font-bold text-foreground">94</div>
              <div className="text-xs text-muted-foreground text-center mt-1">Performance Score</div>
            </div>
            
            <div className="flex-1 flex flex-col justify-center items-center p-4 bg-muted/20 rounded-2xl border border-border/30">
              <Clock className="w-8 h-8 text-blue-400 mb-2" />
              <div className="text-2xl font-bold text-foreground">2.4s</div>
              <div className="text-xs text-muted-foreground text-center mt-1">Avg. Load Time</div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full max-w-[100vw] overflow-x-hidden">
      <style>{`
        .react-grid-layout {
          position: relative;
        }
        .react-grid-item {
          transition: all 200ms ease;
        }
        .react-grid-item.react-draggable-dragging {
          transition: none;
          z-index: 100;
          opacity: 0.9;
        }
        .react-grid-item.resizing {
          transition: none;
          z-index: 100;
        }
        .react-grid-item > .react-resizable-handle::after {
          border-right: 2px solid rgba(var(--primary), 0.4);
          border-bottom: 2px solid rgba(var(--primary), 0.4);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }
      `}</style>
      
      <GridLayout
        className="layout"
        layout={isMobile ? MOBILE_LAYOUT : layout}
        cols={isMobile ? 1 : 4}
        rowHeight={isMobile ? 130 : 140}
        width={Math.min(windowWidth, window.innerWidth) - (isMobile ? 32 : 100)}
        onLayoutChange={isMobile ? undefined : handleLayoutChange}
        isDraggable={!isMobile}
        isResizable={!isMobile}
        compactType="vertical"
        preventCollision={false}
        margin={isMobile ? [12, 12] : [16, 16]}
        containerPadding={[0, 0]}
        draggableHandle=".drag-handle"
        resizeHandles={isMobile ? [] : ['se']}
      >
        {(isMobile ? MOBILE_LAYOUT : layout).map((item) => (
          <div key={item.i} className="relative group w-full overflow-hidden">
            {/* Drag Handle - Desktop only, appears on hover */}
            {!isMobile && (
              <div className="drag-handle absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-move p-2 bg-muted/90 backdrop-blur-sm rounded-xl shadow-lg">
                <div className="flex flex-col gap-0.5">
                  <div className="flex gap-0.5">
                    <div className="w-1 h-1 bg-foreground/60 rounded-full"></div>
                    <div className="w-1 h-1 bg-foreground/60 rounded-full"></div>
                  </div>
                  <div className="flex gap-0.5">
                    <div className="w-1 h-1 bg-foreground/60 rounded-full"></div>
                    <div className="w-1 h-1 bg-foreground/60 rounded-full"></div>
                  </div>
                </div>
              </div>
            )}
            
            {renderWidget(item.i)}
          </div>
        ))}
      </GridLayout>
    </div>
  );
}
