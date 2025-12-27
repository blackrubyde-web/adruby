'use client';

import { useRef, useState, useEffect } from 'react';
import GridLayout, { type Layout, type LayoutItem } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
import {
  Plus, Eye, MousePointerClick, DollarSign, Target,
  Zap, Gauge, Activity, Users, BarChart3, Calendar,
  ArrowUpRight, Brain, Sparkles, X, Check, ChevronRight, TrendingDown
} from 'lucide-react';

// Import real dashboard components
import { AIInsightsPanel } from './AIInsightsPanel';
import { PerformanceChart } from './PerformanceChart';
import { AudienceBreakdown } from './AudienceBreakdown';
import { ConversionFunnel } from './ConversionFunnel';
import { PerformanceHeatmap } from './PerformanceHeatmap';
import { PredictiveAnalytics } from './PredictiveAnalytics';
import { PerformanceScore } from './PerformanceScore';
import { BudgetTracker } from './BudgetTracker';
import { CampaignsTable } from './CampaignsTable';
import { StrategyInsights } from './StrategyInsights';
import { AnalyticsData, TimeseriesPoint } from '../types/analytics';
import { getWidgetState, WidgetShell } from './WidgetStates';

type RGLLayout = LayoutItem;

// Color themes for widgets
const COLOR_THEMES = [
  { id: 'blue', name: 'Blue', primary: 'from-blue-500/20 via-blue-500/10', border: 'border-blue-500/20', icon: 'text-blue-400', bg: 'bg-blue-500/20' },
  { id: 'purple', name: 'Purple', primary: 'from-purple-500/20 via-purple-500/10', border: 'border-purple-500/20', icon: 'text-purple-400', bg: 'bg-purple-500/20' },
  { id: 'green', name: 'Green', primary: 'from-green-500/20 via-green-500/10', border: 'border-green-500/20', icon: 'text-green-400', bg: 'bg-green-500/20' },
  { id: 'orange', name: 'Orange', primary: 'from-orange-500/20 via-orange-500/10', border: 'border-orange-500/20', icon: 'text-orange-400', bg: 'bg-orange-500/20' },
  { id: 'pink', name: 'Pink', primary: 'from-pink-500/20 via-pink-500/10', border: 'border-pink-500/20', icon: 'text-pink-400', bg: 'bg-pink-500/20' },
  { id: 'teal', name: 'Teal', primary: 'from-teal-500/20 via-teal-500/10', border: 'border-teal-500/20', icon: 'text-teal-400', bg: 'bg-teal-500/20' },
  { id: 'red', name: 'Red', primary: 'from-red-500/20 via-red-500/10', border: 'border-red-500/20', icon: 'text-red-400', bg: 'bg-red-500/20' },
  { id: 'indigo', name: 'Indigo', primary: 'from-indigo-500/20 via-indigo-500/10', border: 'border-indigo-500/20', icon: 'text-indigo-400', bg: 'bg-indigo-500/20' },
];

// Design variants
const DESIGN_VARIANTS = [
  { id: 'minimal', name: 'Minimal', description: 'Clean and simple' },
  { id: 'gradient', name: 'Gradient', description: 'Colorful gradients' },
  { id: 'glass', name: 'Glass', description: 'Glassmorphism' },
  { id: 'outlined', name: 'Outlined', description: 'Border focused' },
];

// Available sizes
const WIDGET_SIZES = [
  { id: '2x2', label: 'Small', w: 2, h: 2 },
  { id: '3x2', label: 'Medium', w: 3, h: 2 },
  { id: '4x2', label: 'Wide', w: 4, h: 2 },
  { id: '4x3', label: 'Large', w: 4, h: 3 },
  { id: '4x4', label: 'XLarge', w: 4, h: 4 },
];

interface WidgetTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  component: 'stat' | 'chart' | 'analytics' | 'ai' | 'campaigns' | 'performance' | 'custom';
  defaultSize: { w: number; h: number };
  availableSizes: string[];
  supportsColors: boolean;
  supportsDesigns: boolean;
  minSize?: { w: number; h: number };
  recommendedSize?: { w: number; h: number };
}

interface DashboardWidget {
  layoutId: string;
  templateId: string;
  size: { w: number; h: number };
  color: string;
  design: string;
}

// Widget Templates Catalog
const WIDGET_TEMPLATES: WidgetTemplate[] = [
  // Stats
  {
    id: 'stat-impressions',
    name: 'Impressions',
    description: 'Total ad impressions with trend',
    category: 'Stats',
    icon: <Eye className="w-5 h-5" />,
    component: 'stat',
    defaultSize: { w: 2, h: 2 },
    availableSizes: ['2x2', '3x2'],
    supportsColors: true,
    supportsDesigns: true,
    minSize: { w: 2, h: 2 },
    recommendedSize: { w: 2, h: 2 },
  },
  {
    id: 'stat-clicks',
    name: 'Clicks',
    description: 'Total clicks with percentage',
    category: 'Stats',
    icon: <MousePointerClick className="w-5 h-5" />,
    component: 'stat',
    defaultSize: { w: 2, h: 2 },
    availableSizes: ['2x2', '3x2'],
    supportsColors: true,
    supportsDesigns: true,
    minSize: { w: 2, h: 2 },
    recommendedSize: { w: 2, h: 2 },
  },
  {
    id: 'stat-ctr',
    name: 'CTR',
    description: 'Click-through rate metric',
    category: 'Stats',
    icon: <Target className="w-5 h-5" />,
    component: 'stat',
    defaultSize: { w: 2, h: 2 },
    availableSizes: ['2x2', '3x2'],
    supportsColors: true,
    supportsDesigns: true,
    minSize: { w: 2, h: 2 },
    recommendedSize: { w: 2, h: 2 },
  },
  {
    id: 'stat-roas',
    name: 'ROAS',
    description: 'Return on ad spend',
    category: 'Stats',
    icon: <DollarSign className="w-5 h-5" />,
    component: 'stat',
    defaultSize: { w: 2, h: 2 },
    availableSizes: ['2x2', '3x2'],
    supportsColors: true,
    supportsDesigns: true,
    minSize: { w: 2, h: 2 },
    recommendedSize: { w: 2, h: 2 },
  },

  // Performance
  {
    id: 'performance-score',
    name: 'Performance Score',
    description: 'Overall campaign health score',
    category: 'Performance',
    icon: <Gauge className="w-5 h-5" />,
    component: 'performance',
    defaultSize: { w: 2, h: 2 },
    availableSizes: ['2x2', '3x2', '4x2'],
    supportsColors: false,
    supportsDesigns: false,
    minSize: { w: 2, h: 2 },
    recommendedSize: { w: 3, h: 2 },
  },
  {
    id: 'budget-tracker',
    name: 'Budget Tracker',
    description: 'Track spending and budget',
    category: 'Performance',
    icon: <DollarSign className="w-5 h-5" />,
    component: 'performance',
    defaultSize: { w: 2, h: 2 },
    availableSizes: ['2x2', '3x2', '4x2'],
    supportsColors: false,
    supportsDesigns: false,
    minSize: { w: 2, h: 2 },
    recommendedSize: { w: 3, h: 2 },
  },

  // Charts
  {
    id: 'chart-performance',
    name: 'Performance Chart',
    description: 'Multi-metric performance graph',
    category: 'Charts',
    icon: <BarChart3 className="w-5 h-5" />,
    component: 'chart',
    defaultSize: { w: 4, h: 3 },
    availableSizes: ['4x2', '4x3'],
    supportsColors: false,
    supportsDesigns: false,
    minSize: { w: 4, h: 2 },
    recommendedSize: { w: 4, h: 3 },
  },
  {
    id: 'chart-bars',
    name: 'Bar Chart',
    description: 'Weekly performance bars',
    category: 'Charts',
    icon: <BarChart3 className="w-5 h-5" />,
    component: 'custom',
    defaultSize: { w: 3, h: 2 },
    availableSizes: ['2x2', '3x2', '4x2'],
    supportsColors: true,
    supportsDesigns: true,
    minSize: { w: 2, h: 2 },
    recommendedSize: { w: 3, h: 2 },
  },

  // Analytics
  {
    id: 'analytics-audience',
    name: 'Audience Demographics',
    description: 'Age and gender breakdown',
    category: 'Analytics',
    icon: <Users className="w-5 h-5" />,
    component: 'analytics',
    defaultSize: { w: 3, h: 2 },
    availableSizes: ['3x2', '4x2'],
    supportsColors: false,
    supportsDesigns: false,
    minSize: { w: 3, h: 2 },
    recommendedSize: { w: 4, h: 2 },
  },
  {
    id: 'analytics-funnel',
    name: 'Conversion Funnel',
    description: 'User journey tracking',
    category: 'Analytics',
    icon: <Target className="w-5 h-5" />,
    component: 'analytics',
    defaultSize: { w: 4, h: 2 },
    availableSizes: ['3x2', '4x2', '4x3'],
    supportsColors: false,
    supportsDesigns: false,
    minSize: { w: 3, h: 2 },
    recommendedSize: { w: 4, h: 2 },
  },
  {
    id: 'analytics-heatmap',
    name: 'Performance Heatmap',
    description: 'Best times to run ads',
    category: 'Analytics',
    icon: <Activity className="w-5 h-5" />,
    component: 'analytics',
    defaultSize: { w: 4, h: 3 },
    availableSizes: ['4x3', '4x4'],
    supportsColors: false,
    supportsDesigns: false,
    minSize: { w: 4, h: 3 },
    recommendedSize: { w: 4, h: 3 },
  },
  {
    id: 'analytics-predictive',
    name: 'Predictive Analytics',
    description: 'AI-powered forecasting',
    category: 'Analytics',
    icon: <Brain className="w-5 h-5" />,
    component: 'analytics',
    defaultSize: { w: 4, h: 2 },
    availableSizes: ['4x2', '4x3'],
    supportsColors: false,
    supportsDesigns: false,
    minSize: { w: 4, h: 2 },
    recommendedSize: { w: 4, h: 3 },
  },

  // AI & Insights
  {
    id: 'ai-insights',
    name: 'AI Insights',
    description: 'Smart recommendations',
    category: 'AI & Insights',
    icon: <Sparkles className="w-5 h-5" />,
    component: 'ai',
    defaultSize: { w: 4, h: 3 },
    availableSizes: ['4x2', '4x3'],
    supportsColors: false,
    supportsDesigns: false,
    minSize: { w: 4, h: 2 },
    recommendedSize: { w: 4, h: 3 },
  },
  {
    id: 'ai-strategy',
    name: 'Strategy Insights',
    description: 'Strategic recommendations',
    category: 'AI & Insights',
    icon: <Brain className="w-5 h-5" />,
    component: 'ai',
    defaultSize: { w: 4, h: 3 },
    availableSizes: ['4x2', '4x3'],
    supportsColors: false,
    supportsDesigns: false,
    minSize: { w: 4, h: 2 },
    recommendedSize: { w: 4, h: 3 },
  },

  // Campaigns
  {
    id: 'campaigns-table',
    name: 'Campaigns Table',
    description: 'Full campaign management',
    category: 'Campaigns',
    icon: <Calendar className="w-5 h-5" />,
    component: 'campaigns',
    defaultSize: { w: 4, h: 3 },
    availableSizes: ['4x3', '4x4'],
    supportsColors: false,
    supportsDesigns: false,
    minSize: { w: 4, h: 3 },
    recommendedSize: { w: 4, h: 3 },
  },
  {
    id: 'campaigns-list',
    name: 'Active Campaigns',
    description: 'Campaign list with progress',
    category: 'Campaigns',
    icon: <Zap className="w-5 h-5" />,
    component: 'custom',
    defaultSize: { w: 3, h: 2 },
    availableSizes: ['2x2', '3x2', '4x2'],
    supportsColors: false,
    supportsDesigns: false,
    minSize: { w: 2, h: 2 },
    recommendedSize: { w: 3, h: 2 },
  },

  // Activity
  {
    id: 'activity-weekly',
    name: 'Weekly Activity',
    description: 'Daily engagement levels',
    category: 'Activity',
    icon: <Activity className="w-5 h-5" />,
    component: 'custom',
    defaultSize: { w: 2, h: 2 },
    availableSizes: ['2x2', '3x2'],
    supportsColors: true,
    supportsDesigns: true,
    minSize: { w: 2, h: 2 },
    recommendedSize: { w: 2, h: 2 },
  },
];

const INITIAL_WIDGETS: DashboardWidget[] = [
  {
    layoutId: 'widget-1',
    templateId: 'stat-impressions',
    size: { w: 2, h: 2 },
    color: 'blue',
    design: 'gradient',
  },
  {
    layoutId: 'widget-2',
    templateId: 'stat-clicks',
    size: { w: 2, h: 2 },
    color: 'green',
    design: 'gradient',
  },
  {
    layoutId: 'widget-3',
    templateId: 'chart-performance',
    size: { w: 4, h: 3 },
    color: 'blue',
    design: 'minimal',
  },
  {
    layoutId: 'widget-4',
    templateId: 'ai-insights',
    size: { w: 4, h: 3 },
    color: 'purple',
    design: 'minimal',
  },
];

const INITIAL_LAYOUT: Layout = [
  { i: 'widget-1', x: 0, y: 0, w: 2, h: 2 },
  { i: 'widget-2', x: 2, y: 0, w: 2, h: 2 },
  { i: 'widget-3', x: 0, y: 2, w: 4, h: 3 },
  { i: 'widget-4', x: 0, y: 5, w: 4, h: 3 },
];

interface AppleGridDashboardProps {
  onAddWidgetClick?: () => void;
  range?: '7d' | '30d' | '90d' | 'custom';
  compare?: boolean;
  channel?: 'meta' | 'google' | 'tiktok';
  data?: AnalyticsData | null;
  loading?: boolean;
  error?: string | null;
  accountId?: string;
}

export function AppleGridDashboard({
  onAddWidgetClick: _onAddWidgetClick,
  range: _range = '7d',
  compare: _compare = false,
  channel: _channel = 'meta',
  data = null,
  loading = false,
  error = null,
  accountId = 'default'
}: AppleGridDashboardProps) {
  const storageKey = `appleLayout_v2:${accountId}`;
  const widgetsKey = `appleWidgets_v2:${accountId}`;

  const [widgets, setWidgets] = useState<DashboardWidget[]>(() => {
    if (typeof window === 'undefined') return INITIAL_WIDGETS;
    const saved = localStorage.getItem(widgetsKey);
    return saved ? JSON.parse(saved) : INITIAL_WIDGETS;
  });

  const [layout, setLayout] = useState<Layout>(() => {
    if (typeof window === 'undefined') return INITIAL_LAYOUT;
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : INITIAL_LAYOUT;
  });

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTemplate, setSelectedTemplate] = useState<WidgetTemplate | null>(null);
  const [customization, setCustomization] = useState({
    size: '',
    color: 'blue',
    design: 'gradient',
  });
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const resizeFrameRef = useRef<number | null>(null);
  const handleCreateCampaign = () => {
    const url = '/adbuilder';
    window.history.pushState({}, document.title, url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  useEffect(() => {
    const handleResize = () => {
      if (resizeFrameRef.current !== null) return;
      resizeFrameRef.current = window.requestAnimationFrame(() => {
        resizeFrameRef.current = null;
        setWindowWidth(window.innerWidth);
      });
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(widgetsKey, JSON.stringify(widgets));
  }, [widgets, widgetsKey]);

  const handleLayoutChange = (newLayout: Layout) => {
    setLayout(newLayout);
    localStorage.setItem(storageKey, JSON.stringify(newLayout));
  };

  const handleTemplateSelect = (template: WidgetTemplate) => {
    setSelectedTemplate(template);
    setCustomization({
      size: template.availableSizes[0],
      color: 'blue',
      design: 'gradient',
    });
  };

  const handleAddWidget = () => {
    if (!selectedTemplate) return;

    const sizeConfig = WIDGET_SIZES.find(s => s.id === customization.size);
    if (!sizeConfig) return;

    const layoutId = `widget-${Date.now()}`;
    const newWidget: DashboardWidget = {
      layoutId,
      templateId: selectedTemplate.id,
      size: { w: sizeConfig.w, h: sizeConfig.h },
      color: selectedTemplate.supportsColors ? customization.color : 'blue',
      design: selectedTemplate.supportsDesigns ? customization.design : 'minimal',
    };

    setWidgets([...widgets, newWidget]);

    // Find position
    const maxY = layout.length > 0 ? Math.max(...layout.map(l => l.y + l.h)) : 0;

    const newLayoutItem: RGLLayout = {
      i: layoutId,
      x: 0,
      y: maxY,
      w: sizeConfig.w,
      h: sizeConfig.h,
    };

    setLayout([...layout, newLayoutItem]);
    setIsGalleryOpen(false);
    setSelectedTemplate(null);
  };

  const handleRemoveWidget = (layoutId: string) => {
    setWidgets(widgets.filter(w => w.layoutId !== layoutId));
    setLayout(layout.filter(l => l.i !== layoutId));
  };

  const categories = ['All', ...Array.from(new Set(WIDGET_TEMPLATES.map(w => w.category)))];
  const filteredTemplates = selectedCategory === 'All'
    ? WIDGET_TEMPLATES
    : WIDGET_TEMPLATES.filter(w => w.category === selectedCategory);

  return (
    <>
      {/* Toolbar with Add Widget Button */}
      <div className="mb-6 flex items-center justify-between animate-in fade-in slide-in-from-top duration-500">
        <div>
          <h3 className="text-xl font-bold text-foreground">Grid Dashboard</h3>
          <p className="text-sm text-muted-foreground">{widgets.length} active widgets</p>
        </div>
        <button
          onClick={() => setIsGalleryOpen(true)}
          className="px-5 py-3 bg-primary text-primary-foreground rounded-xl hover:scale-105 transition-all shadow-lg shadow-primary/30 flex items-center gap-2 font-bold"
        >
          <Plus className="w-5 h-5" />
          Add Widget
        </button>
      </div>

      <div className="w-full h-full relative group/dashboard">
        <style>{`
          .react-grid-layout {
            position: relative;
          }
          .react-grid-item {
            transition: all 200ms ease;
            cursor: grab;
          }
          .react-grid-item:active {
            cursor: grabbing;
          }
          .react-grid-item.react-draggable-dragging {
            transition: none;
            z-index: 100;
            opacity: 0.95;
            cursor: grabbing !important;
          }
          .react-grid-item > .react-resizable-handle {
            display: none;
          }
          .widget-content {
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
        `}</style>

        {/* Widget Gallery Modal - NOW CONTAINED & ABSOLUTE */}
        {isGalleryOpen && !selectedTemplate && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md animate-in fade-in duration-200 rounded-3xl p-4">
            <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl w-full h-full max-w-none flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-border/30">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-2xl font-bold text-foreground mb-1">Widget Gallery</h2>
                    <p className="text-xs text-muted-foreground truncate">{WIDGET_TEMPLATES.length} premium widgets available</p>
                  </div>

                  {/* Categories */}
                  <div className="flex-1 overflow-x-auto no-scrollbar flex items-center justify-center gap-2 px-4">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${selectedCategory === category
                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                          }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsGalleryOpen(false)}
                    className="p-2 hover:bg-muted/50 rounded-xl transition-all flex-shrink-0"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className="group relative bg-card/40 hover:bg-card/60 border border-border/30 hover:border-primary/50 rounded-2xl transition-all overflow-hidden hover:scale-[1.02] hover:shadow-xl text-left flex flex-col h-full"
                    >
                      <div className="p-4 flex flex-col h-full">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-2.5 bg-primary/10 rounded-xl text-primary flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                            {template.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-foreground text-sm truncate">{template.name}</h3>
                            <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">{template.description}</p>
                          </div>
                        </div>

                        <div className="mt-auto pt-3 border-t border-border/30 flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {template.availableSizes.slice(0, 2).map(sizeId => (
                              <span key={sizeId} className="px-1.5 py-0.5 bg-muted/50 rounded-md text-[10px] font-medium text-muted-foreground">
                                {WIDGET_SIZES.find(s => s.id === sizeId)?.label}
                              </span>
                            ))}
                            {template.availableSizes.length > 2 && (
                              <span className="px-1.5 py-0.5 bg-muted/50 rounded-md text-[10px] font-medium text-muted-foreground">+{template.availableSizes.length - 2}</span>
                            )}
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customization Modal - NOW CONTAINED & ABSOLUTE */}
        {isGalleryOpen && selectedTemplate && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md animate-in fade-in duration-200 rounded-3xl p-4">
            <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl w-full h-full max-w-none flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedTemplate(null)}
                      className="p-2 hover:bg-muted/50 rounded-xl transition-all"
                      title="Back to gallery"
                    >
                      <ArrowUpRight className="w-5 h-5 text-muted-foreground rotate-180" />
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Customize</h2>
                      <p className="text-xs text-muted-foreground">{selectedTemplate.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsGalleryOpen(false);
                      setSelectedTemplate(null);
                    }}
                    className="p-2 hover:bg-muted/50 rounded-xl transition-all"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="p-8 overflow-y-auto flex-1">
                <div className="max-w-4xl mx-auto space-y-8">
                  {/* Size Selection */}
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary/20 rounded-lg flex items-center justify-center text-primary text-xs font-bold">1</div>
                      Size
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {selectedTemplate.availableSizes.map(sizeId => {
                        const size = WIDGET_SIZES.find(s => s.id === sizeId);
                        if (!size) return null;

                        return (
                          <button
                            key={sizeId}
                            onClick={() => setCustomization({ ...customization, size: sizeId })}
                            className={`p-4 rounded-xl border transition-all text-left ${customization.size === sizeId
                                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10 ring-1 ring-primary'
                                : 'border-border/40 bg-card/40 hover:bg-card hover:border-border/80'
                              }`}
                          >
                            <div className="font-bold text-foreground text-sm mb-1">{size.label}</div>
                            <div className="text-xs text-muted-foreground">{size.w}×{size.h}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Design Selection */}
                  {selectedTemplate.supportsDesigns && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                      <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                        <div className="w-6 h-6 bg-primary/20 rounded-lg flex items-center justify-center text-primary text-xs font-bold">2</div>
                        Style
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {DESIGN_VARIANTS.map(design => (
                          <button
                            key={design.id}
                            onClick={() => setCustomization({ ...customization, design: design.id })}
                            className={`p-4 rounded-xl border transition-all text-left ${customization.design === design.id
                                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10 ring-1 ring-primary'
                                : 'border-border/40 bg-card/40 hover:bg-card hover:border-border/80'
                              }`}
                          >
                            <div className="font-bold text-foreground text-sm mb-1">{design.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{design.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Color Selection */}
                  {selectedTemplate.supportsColors && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                      <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                        <div className="w-6 h-6 bg-primary/20 rounded-lg flex items-center justify-center text-primary text-xs font-bold">3</div>
                        Theme
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {COLOR_THEMES.map(color => (
                          <button
                            key={color.id}
                            onClick={() => setCustomization({ ...customization, color: color.id })}
                            className={`w-12 h-12 rounded-xl border-2 transition-all hover:scale-105 bg-gradient-to-br ${color.primary} to-transparent flex items-center justify-center ${customization.color === color.id
                                ? 'border-foreground shadow-lg scale-105'
                                : 'border-transparent opacity-70 hover:opacity-100'
                              }`}
                          >
                            {customization.color === color.id && <Check className="w-5 h-5 text-foreground drop-shadow-md" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                    <button
                      onClick={handleAddWidget}
                      disabled={!customization.size}
                      className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:scale-[1.01] transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add Widget
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <GridLayout
          className="layout"
          layout={layout}
          cols={4}
          rowHeight={160}
          width={Math.min(windowWidth > 768 ? windowWidth - 120 : windowWidth - 40, 1400)}
          onLayoutChange={handleLayoutChange}
          isDraggable={true}
          isResizable={false}
          compactType="vertical"
          preventCollision={false}
          margin={[12, 12]}
          containerPadding={[0, 0]}
        >
          {widgets.map((widget) => {
            const template = WIDGET_TEMPLATES.find(t => t.id === widget.templateId);
            if (!template) return null;

            return (
              <div key={widget.layoutId} className="relative group/widget">
                <button
                  onClick={() => handleRemoveWidget(widget.layoutId)}
                  className="absolute -top-2 -right-2 z-20 w-6 h-6 bg-background border border-border text-muted-foreground hover:text-red-500 hover:border-red-500 rounded-full opacity-0 group-hover/widget:opacity-100 transition-all shadow-sm flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="widget-content">
                  <WidgetRenderer
                    widget={widget}
                    template={template}
                    data={data}
                    loading={loading}
                    error={error}
                    onCreateCampaign={handleCreateCampaign}
                  />
                </div>
              </div>
            );
          })}
        </GridLayout>
      </div>


    </>
  );
}

// Widget Preview Component (for gallery)
function WidgetPreview({ template }: { template: WidgetTemplate }) {
  // Return a simplified preview based on template
  const previewWidget: DashboardWidget = {
    layoutId: 'preview',
    templateId: template.id,
    size: template.defaultSize,
    color: 'blue',
    design: 'gradient',
  };

  return (
    <WidgetRenderer
      widget={previewWidget}
      template={template}
      data={null}
      loading={false}
      error={null}
      isPreview
    />
  );
}

// Widget Renderer Component - DATA AWARE
function WidgetRenderer({
  widget,
  template,
  data,
  loading,
  error,
  isPreview = false,
  onCreateCampaign,
}: {
  widget: DashboardWidget;
  template: WidgetTemplate;
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  isPreview?: boolean;
  onCreateCampaign?: () => void;
}) {
  const colorTheme = COLOR_THEMES.find(c => c.id === widget.color) || COLOR_THEMES[0];
  const emptyAction = onCreateCampaign ? (
    <button
      onClick={onCreateCampaign}
      className="text-sm font-medium text-primary hover:underline"
    >
      Create campaign →
    </button>
  ) : null;

  // Loading State
  if (loading && !isPreview) {
    return (
      <div className="w-full h-full backdrop-blur-xl bg-card/60 rounded-3xl border border-border/50 shadow-xl flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Error State
  if (error && !isPreview) {
    return (
      <div className="w-full h-full backdrop-blur-xl bg-card/60 rounded-3xl border border-red-500/50 shadow-xl flex items-center justify-center p-4">
        <div className="text-red-500 text-sm text-center">{error}</div>
      </div>
    );
  }

  // ========================================================================
  // STAT WIDGETS - Dynamic from data.summary
  // ========================================================================
  if (template.component === 'stat') {
    const statMap: Record<string, { key: keyof Omit<AnalyticsData['summary'], 'deltas'>; label: string; icon: React.ReactNode }> = {
      'stat-impressions': { key: 'impressions', label: 'Impressions', icon: <Eye className="w-5 h-5" /> },
      'stat-clicks': { key: 'clicks', label: 'Clicks', icon: <MousePointerClick className="w-5 h-5" /> },
      'stat-ctr': { key: 'ctr', label: 'Click Rate', icon: <Target className="w-5 h-5" /> },
      'stat-roas': { key: 'roas', label: 'ROAS', icon: <DollarSign className="w-5 h-5" /> },
    };

    const def = statMap[template.id];
    if (!def) return null;

    const rawValue = data?.summary?.[def.key];
    const delta = data?.summary?.deltas?.[def.key];

    // Coerce to numbers safely for formatting
    const rawNum = typeof rawValue === 'number' ? rawValue : Number(rawValue ?? 0);
    const deltaNum = typeof delta === 'number' ? delta : Number(delta ?? 0);

    // Format value
    const valueText = rawValue == null ? '—' :
      (def.key === 'spend' || def.key === 'revenue') ? `€${(rawNum / 1000).toFixed(1)}K` :
        def.key === 'ctr' ? `${rawNum.toFixed(2)}%` :
          def.key === 'roas' ? `${rawNum.toFixed(2)}x` :
            def.key === 'cpa' ? `€${rawNum.toFixed(2)}` :
              new Intl.NumberFormat('de-DE').format(rawNum);

    // Format trend
    const trendText = delta == null ? '—' : `${deltaNum >= 0 ? '+' : ''}${Math.round(deltaNum * 100)}%`;
    const isPositive = delta != null && deltaNum >= 0;

    return (
    return (
      <div className={`w-full h-full p-4 bg-gradient-to-br ${colorTheme.primary} to-transparent backdrop-blur-xl border ${colorTheme.border} rounded-3xl flex flex-col justify-between shadow-sm overflow-hidden group`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-2.5 ${colorTheme.bg} rounded-xl ${colorTheme.icon} group-hover:scale-110 transition-transform`}>
              {React.cloneElement(def.icon as React.ReactElement, { className: "w-5 h-5" })}
            </div>
            <div className="text-xs text-muted-foreground font-semibold">{def.label}</div>
          </div>
          {delta != null && (
            <div className={`flex items-center gap-1 px-2 py-1 ${isPositive ? 'bg-green-500/10' : 'bg-red-500/10'} rounded-lg`}>
              {isPositive ? <ArrowUpRight className="w-3 h-3 text-green-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
              <span className={`text-xs font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>{trendText}</span>
            </div>
          )}
        </div>
        <div className="mt-auto">
          <div className="text-2xl font-bold text-foreground tracking-tight">{valueText}</div>
        </div>
      </div>
    );
    );
  }

  // Real component widgets
  if (template.id === 'ai-insights') {
    return (
      <div className="w-full h-full backdrop-blur-xl bg-card/60 rounded-3xl border border-border/50 shadow-xl overflow-hidden">
        <div className="scale-100 origin-top-left w-full h-full overflow-hidden">
          <AIInsightsPanel />
        </div>
      </div>
    );
  }

  if (template.id === 'ai-strategy') {
    return (
      <div className="w-full h-full backdrop-blur-xl bg-card/60 rounded-3xl border border-border/50 shadow-xl overflow-hidden">
        <div className="scale-100 origin-top-left w-full h-full overflow-hidden">
          <StrategyInsights />
        </div>
      </div>
    );
  }

  if (template.id === 'chart-performance') {
    return (
      <div className="w-full h-full backdrop-blur-xl bg-card/60 rounded-3xl border border-border/50 shadow-xl overflow-hidden">
        <div className="w-full h-full overflow-hidden">
          <PerformanceChart
            current={data?.timeseries?.current ?? []}
            previous={data?.timeseries?.previous ?? null}
            compare={Boolean(data?.compare)}
            granularity={data?.granularity ?? 'day'}
            range={data?.range}
            loading={loading}
          />
        </div>
      </div>
    );
  }

  if (template.id === 'analytics-audience') {
    return (
      <div className="w-full h-full backdrop-blur-xl bg-card/60 rounded-3xl border border-border/50 shadow-xl p-5 overflow-hidden">
        <div className="w-full h-full overflow-hidden">
          <AudienceBreakdown />
        </div>
      </div>
    );
  }

  if (template.id === 'analytics-funnel') {
    return (
      <div className="w-full h-full backdrop-blur-xl bg-card/60 rounded-3xl border border-border/50 shadow-xl p-5 overflow-hidden">
        <div className="w-full h-full overflow-hidden">
          <ConversionFunnel />
        </div>
      </div>
    );
  }

  if (template.id === 'analytics-heatmap') {
    return (
      <div className="w-full h-full backdrop-blur-xl bg-card/60 rounded-3xl border border-border/50 shadow-xl p-5 overflow-hidden">
        <div className="w-full h-full overflow-hidden">
          <PerformanceHeatmap />
        </div>
      </div>
    );
  }

  if (template.id === 'analytics-predictive') {
    return (
      <div className="w-full h-full backdrop-blur-xl bg-card/60 rounded-3xl border border-border/50 shadow-xl p-5 overflow-hidden">
        <div className="w-full h-full overflow-hidden">
          <PredictiveAnalytics />
        </div>
      </div>
    );
  }

  if (template.id === 'performance-score') {
    return (
      <div className="w-full h-full backdrop-blur-xl bg-card/60 rounded-3xl border border-border/50 shadow-xl p-5 overflow-hidden">
        <div className="w-full h-full overflow-hidden">
          <PerformanceScore />
        </div>
      </div>
    );
  }

  if (template.id === 'budget-tracker') {
    return (
      <div className="w-full h-full backdrop-blur-xl bg-card/60 rounded-3xl border border-border/50 shadow-xl p-5 overflow-hidden">
        <div className="w-full h-full overflow-hidden">
          <BudgetTracker />
        </div>
      </div>
    );
  }

  if (template.id === 'campaigns-table') {
    return (
      <div className="w-full h-full backdrop-blur-xl bg-card/60 rounded-3xl border border-border/50 shadow-xl overflow-hidden">
        <div className="w-full h-full overflow-hidden">
          <CampaignsTable campaigns={data?.campaigns} />
        </div>
      </div>
    );
  }

  // ========================================================================
  // BAR CHART WIDGET - Dynamic from timeseries (WITH WIDGETSHELL)
  // ========================================================================
  if (template.id === 'chart-bars') {
    // Generate mock data for preview
    const mockPoints: TimeseriesPoint[] = Array.from({ length: 7 }, (_, i) => ({
      ts: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
      impressions: Math.random() * 50000 + 30000,
      clicks: Math.random() * 2000 + 1000,
      spend: Math.random() * 500 + 200,
      revenue: Math.random() * 2000 + 800,
      conversions: Math.random() * 50 + 20,
      ctr: Math.random() * 3 + 1,
      cpa: Math.random() * 20 + 5,
      roas: Math.random() * 4 + 2,
    }));

    const points = isPreview ? mockPoints : (data?.timeseries?.current ?? []);
    const metric: keyof TimeseriesPoint = 'revenue';

    const state = getWidgetState({
      loading,
      data: points.length > 0 ? points : null,
      isPreview,
      error,
    });

    const sliced = points.slice(-7);
    const values = sliced
      .map((p) => Number(p?.[metric] ?? 0))
      .map((v) => (Number.isFinite(v) ? v : 0));

    const max = Math.max(...values, 1);

    const heights = values.map((v) => {
      const pct = (v / max) * 100;
      return v > 0 ? Math.max(pct, 6) : 0;
    });

    const labels = sliced.map((p) => {
      const d = new Date(p.ts);
      return d.toLocaleDateString([], { weekday: 'short' });
    });

    return (
      <WidgetShell
        title="Performance"
        subtitle={data?.range === '7d' ? 'Last 7 days' : data?.range === '30d' ? 'Last 30 days' : data?.range === '90d' ? 'Last 90 days' : 'Custom range'}
        icon={<BarChart3 className="w-4 h-4" />}
        state={state}
        error={error}
        emptyTitle="No performance data"
        emptyDescription="Run campaigns to see performance trends here."
        emptyAction={emptyAction}
        headerAction={
          data?.summary?.deltas?.revenue != null && (
            <div className="px-2 py-1 bg-green-500/10 rounded-full">
              <span className="text-xs font-bold text-green-500">
                ↑ {Math.round(data.summary.deltas.revenue * 100)}%
              </span>
            </div>
          )
        }
      >
        <div className="w-full h-full flex flex-col">
          <div className="flex-1 min-h-0 flex items-end gap-1.5">
            {heights.map((h, i) => (
              <div key={i} className="flex-1 min-w-0">
                <div
                  className={`w-full bg-gradient-to-t ${colorTheme.primary} rounded-t-lg transition-all`}
                  style={{ height: `${h}%` }}
                  title={`${labels[i]}: €${values[i].toLocaleString('de-DE')}`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-xs text-muted-foreground">
            <span>{labels[0] ?? '—'}</span>
            <span>{labels[labels.length - 1] ?? '—'}</span>
          </div>
        </div>
      </WidgetShell>
    );
  }

  // ========================================================================
  // ACTIVITY WIDGET - Dynamic from timeseries
  // ========================================================================
  if (template.id === 'activity-weekly') {
    const points = (data?.timeseries?.current ?? []).slice(-5);
    const vals = points.map(p => p.clicks ?? 0);
    const max = Math.max(...vals, 1);

    const rows = points.map(p => ({
      label: new Date(p.ts).toLocaleDateString([], { weekday: 'short' }),
      pct: Math.round(((p.clicks ?? 0) / max) * 100)
    }));

    return (
      <div className={`w-full h-full p-5 bg-gradient-to-br ${colorTheme.primary} to-transparent backdrop-blur-xl border ${colorTheme.border} rounded-3xl shadow-xl flex flex-col overflow-hidden`}>
        <div className="mb-3">
          <div className="text-base font-bold text-foreground flex items-center gap-2">
            <Activity className={`w-4 h-4 ${colorTheme.icon}`} />
            Weekly Activity
          </div>
          <div className="text-xs text-muted-foreground">Engagement</div>
        </div>
        <div className="flex-1 space-y-2.5">
          {rows.length > 0 ? (
            rows.map((day, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-6 font-medium">{day.label}</span>
                <div className="flex-1 h-2 bg-muted/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${colorTheme.primary} rounded-full`}
                    style={{ width: `${day.pct}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-foreground w-8 text-right">{day.pct}%</span>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
              No data
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========================================================================
  // CAMPAIGNS LIST - Dynamic from data.campaigns
  // ========================================================================
  if (template.id === 'campaigns-list') {
    const active = (data?.campaigns ?? []).filter(c => c.status === 'active').slice(0, 3);

    return (
      <div className="w-full h-full p-5 bg-card/60 backdrop-blur-xl border border-border/30 rounded-3xl shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-base font-bold text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Active Campaigns
            </div>
            <div className="text-xs text-muted-foreground">{active.length} running</div>
          </div>
        </div>
        <div className="flex-1 space-y-2.5 overflow-hidden">
          {active.length > 0 ? (
            active.map((campaign) => {
              const usedPct = campaign.budget
                ? Math.round(((campaign.budgetUsed ?? campaign.spend) / campaign.budget) * 100)
                : Math.round((campaign.spend / 15000) * 100);

              return (
                <div key={campaign.id} className="p-3 bg-muted/30 rounded-xl border border-border/30">
                  <div className="font-semibold text-xs text-foreground mb-2">{campaign.name}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                        style={{ width: `${Math.min(usedPct, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-foreground">{usedPct}%</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
              No active campaigns
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
