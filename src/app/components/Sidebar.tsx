import { memo, useCallback, useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3, Layers, Brain, LogOut, X, BarChart2, Gift, BookOpen, Palette, Shield, Wand2, User, Settings, type LucideIcon } from 'lucide-react';
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
  displayName?: string | null;
  planLabel?: string | null;
}

type NavItem = {
  icon: LucideIcon;
  label: string;
  page: PageType;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Analyse',
    items: [
      { icon: BarChart3, label: 'Dashboard', page: 'dashboard' },
      { icon: BarChart2, label: 'Analytics', page: 'analytics' },
      { icon: Brain, label: 'AI Analyse', page: 'aianalysis' },
    ],
  },
  {
    label: 'Kreativ',
    items: [
      { icon: Wand2, label: 'AI Ad Builder', page: 'aibuilder' },
      { icon: BookOpen, label: 'Creative Library', page: 'library' },
    ],
  },
  {
    label: 'Verwalten',
    items: [
      { icon: Layers, label: 'Kampagnen', page: 'campaigns' },
      { icon: User, label: 'Profil', page: 'profile' },
      { icon: Settings, label: 'Einstellungen', page: 'settings' },
      { icon: Gift, label: 'Affiliate', page: 'affiliate' },
    ],
  },
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
  onLogout,
  displayName,
  planLabel,
}: SidebarProps) {
  const { isAdmin, isCheckingRole } = useAdmin();
  const [isHovering, setIsHovering] = useState(false);

  const isExpanded = isMobileOpen || !isCollapsed || isHovering;
  const showLabels = isExpanded;
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
            ? "bg-primary/15 text-primary font-semibold border-l-2 border-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium border-l-2 border-transparent",
          showLabels ? "gap-3 justify-start" : "gap-0 justify-center p-2.5"
        )}
        title={(!showLabels && !isMobileOpen) ? item.label : undefined}
      >
        <item.icon className={cn("w-5 h-5 flex-shrink-0 transition-all duration-200", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground group-hover:scale-110")} />

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

  const firstName = displayName?.split(' ')[0] || null;

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
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
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
        <nav aria-label="Hauptnavigation" className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-5 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="space-y-1">
              {showLabels && (
                <div className="px-3 mb-2 animate-in fade-in slide-in-from-left-2 duration-300">
                  <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                    {group.label}
                  </span>
                </div>
              )}
              {group.items.map(renderNavButton)}
            </div>
          ))}

          {/* Divider before Admin */}
          {isAdmin && !isCheckingRole && (
            <>
              <div className="h-px bg-sidebar-border/50 mx-2" />
              <div className="space-y-1">
                {showLabels && (
                  <div className="px-3 mb-2 animate-in fade-in slide-in-from-left-2 duration-300">
                    <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                      Admin
                    </span>
                  </div>
                )}
                {ADMIN_ITEMS.map(renderNavButton)}
              </div>
            </>
          )}
        </nav>

        {/* Footer — Mini Profile + Logout */}
        <div className="p-3 border-t border-sidebar-border/50 space-y-2">
          {/* Mini Profile */}
          {showLabels && firstName && (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-primary">
                  {firstName.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-sidebar-foreground truncate">{firstName}</div>
                {planLabel && (
                  <div className="text-[10px] text-muted-foreground font-medium">{planLabel}</div>
                )}
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            className={cn(
              "w-full flex items-center px-3 py-2.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors group",
              showLabels ? "gap-3 justify-start" : "gap-0 justify-center"
            )}
            title={(!showLabels && !isMobileOpen) ? 'Logout' : undefined}
            aria-label="Abmelden"
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
