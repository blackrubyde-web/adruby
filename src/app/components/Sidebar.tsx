import { BarChart3, Target, Layers, Brain, Settings, LogOut, X, Zap, BarChart2, Gift, Sparkles } from 'lucide-react';
import { PageType } from '../App';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  onLogout?: () => void;
}

export function Sidebar({
  isCollapsed = false,
  onToggle,
  currentPage,
  onNavigate,
  isMobileOpen,
  onMobileClose,
  onLogout
}: SidebarProps) {
  // GROUP 1: Core Workflow
  const coreWorkflow = [
    { icon: BarChart3, label: 'Dashboard', page: 'dashboard' as PageType },
    { icon: BarChart2, label: 'Analytics', page: 'analytics' as PageType },
    { icon: Zap, label: 'Ad Builder', page: 'adbuilder' as PageType },
    { icon: Sparkles, label: 'Creative Builder', page: 'creative-builder' as PageType },
    { icon: Target, label: 'Strategies', page: 'strategies' as PageType },
    { icon: Layers, label: 'Campaigns', page: 'campaigns' as PageType },
    { icon: Brain, label: 'AI Analysis', page: 'aianalysis' as PageType },
  ];

  // GROUP 2: Account & System
  const accountItems = [
    { icon: Settings, label: 'Settings', page: 'settings' as PageType },
    { icon: Gift, label: 'Affiliate', page: 'affiliate' as PageType },
  ];

  const handleNavigate = (page: PageType) => {
    onNavigate(page);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const renderNavButton = (item: typeof coreWorkflow[0]) => {
    const isActive = item.page === currentPage;
    
    return (
      <button
        key={item.page}
        onClick={() => handleNavigate(item.page)}
        className={`relative w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
          isActive
            ? 'bg-sidebar-accent text-sidebar-foreground'
            : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
        }`}
        title={(isCollapsed && !isMobileOpen) ? item.label : undefined}
      >
        {/* Left Accent Bar - Only on Active */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r" />
        )}
        
        <item.icon className="w-5 h-5 flex-shrink-0" />
        {(isMobileOpen || !isCollapsed) && (
          <span className={`flex-1 text-left text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
            {item.label}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`bg-sidebar border-r border-sidebar-border h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 z-50
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
          ${!isMobileOpen && isCollapsed ? 'md:translate-x-0 md:w-20' : ''}
          ${!isMobileOpen && !isCollapsed ? 'md:translate-x-0 md:w-64' : ''}
        `}
        onMouseLeave={() => !isMobileOpen && onToggle?.(true)}
      >
        {/* Logo Area with Hover Trigger */}
        <div 
          className="flex items-center justify-between p-4 border-b border-sidebar-border"
          onMouseEnter={() => !isMobileOpen && onToggle?.(false)}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-sm">AR</span>
            </div>
            {(isMobileOpen || !isCollapsed) && (
              <span className="text-sidebar-foreground font-bold text-lg">
                AdRuby
              </span>
            )}
          </div>
          {isMobileOpen && (
            <button
              className="md:hidden p-2 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              onClick={onMobileClose}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          {/* GROUP 1: Core Workflow */}
          <div className="mb-6">
            {(isMobileOpen || !isCollapsed) && (
              <div className="px-4 mb-2">
                <span className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                  Workflow
                </span>
              </div>
            )}
            <div className="space-y-1">
              {coreWorkflow.map(renderNavButton)}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-sidebar-border my-4" />

          {/* GROUP 2: Account & System */}
          <div>
            {(isMobileOpen || !isCollapsed) && (
              <div className="px-4 mb-2">
                <span className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                  Account
                </span>
              </div>
            )}
            <div className="space-y-1">
              {accountItems.map(renderNavButton)}
            </div>
          </div>
        </nav>

        {/* Logout - Always at Bottom */}
        <div className="p-4 border-t border-sidebar-border">
          <button 
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
            title={(isCollapsed && !isMobileOpen) ? 'Logout' : undefined}
            onClick={onLogout}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {(isMobileOpen || !isCollapsed) && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
