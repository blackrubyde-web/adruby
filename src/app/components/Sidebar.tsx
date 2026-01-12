import { memo, useCallback, useState } from 'react';
import { BarChart3, Layers, Brain, Settings, LogOut, X, BarChart2, Gift, BookOpen, Palette, Shield, type LucideIcon } from 'lucide-react';
import { PageType } from '../App';
import { useAdmin } from '../contexts/AdminContext';
import { cn } from '../lib/utils';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  onLogout?: () => void;
}

type NavItem = {
  icon: LucideIcon;
  label: string;
  page: PageType;
};

const CORE_WORKFLOW: NavItem[] = [
  { icon: BarChart3, label: 'Dashboard', page: 'dashboard' },
  { icon: BarChart2, label: 'Analytics', page: 'analytics' },
  { icon: Palette, label: 'Creative Studio', page: 'studio' },
  { icon: Layers, label: 'Campaigns', page: 'campaigns' },
  { icon: Brain, label: 'AI Analysis', page: 'aianalysis' },
  { icon: BookOpen, label: 'Creative Library', page: 'library' },
];

const ACCOUNT_ITEMS: NavItem[] = [
  { icon: Settings, label: 'Settings', page: 'settings' },
  { icon: Gift, label: 'Affiliate', page: 'affiliate' },
];

const ADMIN_ITEMS: NavItem[] = [
  { icon: Shield, label: 'Admin', page: 'admin' },
];

export const Sidebar = memo(function Sidebar({
  isCollapsed = false,
  onToggle,
  currentPage,
  onNavigate,
  isMobileOpen,
  onMobileClose,
  onLogout
}: SidebarProps) {
  const { isAdmin, isCheckingRole } = useAdmin();
  const [isHovering, setIsHovering] = useState(false);

  // Logic: Expand if mobile open, or if not collapsed, or if collapsed + hovering
  const isExpanded = isMobileOpen || !isCollapsed || isHovering;
  const showLabels = isExpanded;

  // Show overlay only on desktop when collapsed + hovering
  const showOverlay = !isMobileOpen && isCollapsed && isHovering;

  const handleNavigate = useCallback((page: PageType) => {
    onNavigate(page);
    if (onMobileClose) {
      onMobileClose();
    }
  }, [onNavigate, onMobileClose]);

  const renderNavButton = useCallback((item: NavItem) => {
    const isActive = item.page === currentPage;

    return (
      <button
        key={item.page}
        onClick={() => handleNavigate(item.page)}
        className={cn(
          "relative w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group overflow-hidden",
          isActive
            ? "bg-primary/10 text-primary font-semibold"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium",
          showLabels ? "gap-3 justify-start" : "gap-0 justify-center p-2.5"
        )}
        title={(!showLabels && !isMobileOpen) ? item.label : undefined}
      >
        {/* Active Indicator Bar - Left */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
        )}

        <item.icon className={cn("w-5 h-5 flex-shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />

        <span
          className={cn(
            "whitespace-nowrap transition-all duration-300 overflow-hidden text-sm",
            showLabels ? "opacity-100 max-w-[150px] translate-x-0" : "opacity-0 max-w-0 -translate-x-2"
          )}
        >
          {item.label}
        </span>
      </button>
    );
  }, [currentPage, handleNavigate, showLabels, isMobileOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm animate-in fade-in"
          onClick={onMobileClose}
        />
      )}

      {/* Desktop Hover Overlay */}
      {showOverlay && (
        <div
          className="fixed inset-0 bg-black/20 z-40 hidden md:block animate-in fade-in"
          onClick={() => setIsHovering(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen z-50 flex flex-col transition-[width,transform] duration-300 ease-in-out border-r border-sidebar-border bg-sidebar shadow-xl",
          isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0",
          !isMobileOpen && (isExpanded ? "w-64" : "w-20")
        )}
        onMouseEnter={() => !isMobileOpen && isCollapsed && setIsHovering(true)}
        onMouseLeave={() => !isMobileOpen && setIsHovering(false)}
      >
        {/* Header / Logo */}
        <div
          className="flex items-center justify-between p-4 h-16 border-b border-sidebar-border/50"
          onClick={() => !isMobileOpen && onToggle?.(!isCollapsed)}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-sm tracking-tighter">AR</span>
            </div>
            <span
              className={cn(
                "font-bold text-lg tracking-tight text-sidebar-foreground transition-all duration-300 whitespace-nowrap",
                showLabels ? "opacity-100" : "opacity-0 translate-x-[-10px]"
              )}
            >
              AdRuby
            </span>
          </div>

          {isMobileOpen && (
            <button
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              onClick={onMobileClose}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Nav Area */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-6 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">

          {/* Section: Workflow */}
          <div className="space-y-1">
            {showLabels && (
              <div className="px-3 mb-2 animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">
                  Workflow
                </span>
              </div>
            )}
            {CORE_WORKFLOW.map(renderNavButton)}
          </div>

          <div className="h-px bg-sidebar-border/50 mx-2" />

          {/* Section: Account */}
          <div className="space-y-1">
            {showLabels && (
              <div className="px-3 mb-2 animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">
                  Account
                </span>
              </div>
            )}
            {ACCOUNT_ITEMS.map(renderNavButton)}
          </div>

          {/* Section: Admin */}
          {isAdmin && !isCheckingRole && (
            <>
              <div className="h-px bg-sidebar-border/50 mx-2" />
              <div className="space-y-1">
                {showLabels && (
                  <div className="px-3 mb-2 animate-in fade-in slide-in-from-left-2 duration-300">
                    <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">
                      Admin
                    </span>
                  </div>
                )}
                {ADMIN_ITEMS.map(renderNavButton)}
              </div>
            </>
          )}
        </nav>

        {/* Footer / Logout */}
        <div className="p-3 border-t border-sidebar-border/50">
          <button
            className={cn(
              "w-full flex items-center px-3 py-2.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors group",
              showLabels ? "gap-3 justify-start" : "gap-0 justify-center"
            )}
            title={(!showLabels && !isMobileOpen) ? 'Logout' : undefined}
            onClick={onLogout}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <span
              className={cn(
                "whitespace-nowrap transition-all duration-300 overflow-hidden text-sm font-medium",
                showLabels ? "opacity-100 max-w-[100px]" : "opacity-0 max-w-0"
              )}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
});
