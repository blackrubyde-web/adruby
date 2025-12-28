import { memo, useCallback, useState } from 'react';
import { BarChart3, Target, Layers, Brain, Settings, LogOut, X, BarChart2, Gift, BookOpen, Palette, Shield, type LucideIcon } from 'lucide-react';
import { PageType } from '../App';
import { useAdmin } from '../contexts/AdminContext';

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
  { icon: Target, label: 'Strategies', page: 'strategies' },
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
  const isExpanded = Boolean(isMobileOpen || !isCollapsed || isHovering);
  const showLabels = isExpanded;
  const showOverlay = Boolean(!isMobileOpen && isCollapsed && isHovering);

  const handleNavigate = useCallback((page: PageType) => {
    onNavigate(page);
    if (onMobileClose) {
      onMobileClose();
    }
  }, [onNavigate, onMobileClose]);

  const renderNavButton = useCallback((item: NavItem) => {
    const isActive = item.page === currentPage;
    const labelVisibility = showLabels
      ? "opacity-100 translate-x-0 max-w-[160px]"
      : "opacity-0 translate-x-1 max-w-0";

    return (
      <button
        key={item.page}
        onClick={() => handleNavigate(item.page)}
        className={`relative w-full flex items-center px-4 py-2.5 rounded-lg transition-[color,background-color,gap] duration-200 ${isActive
          ? 'bg-sidebar-accent text-zinc-900 dark:text-sidebar-foreground'
          : 'text-zinc-600 dark:text-sidebar-foreground/70 hover:text-zinc-900 dark:hover:text-sidebar-foreground hover:bg-zinc-100 dark:hover:bg-sidebar-accent/50'
          } ${showLabels ? 'gap-3 justify-start' : 'gap-0 justify-center'}`}
        title={(!showLabels && !isMobileOpen) ? item.label : undefined}
      >
        {/* Left Accent Bar - Only on Active */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r" />
        )}

        <item.icon className="w-5 h-5 flex-shrink-0" />
        <span
          className={`flex-1 text-left text-sm leading-5 ${isActive ? 'font-semibold' : 'font-medium'} transition-[opacity,transform,max-width] duration-200 ease-out overflow-hidden whitespace-nowrap ${labelVisibility}`}
          aria-hidden={!showLabels}
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
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      {showOverlay && (
        <div
          className="fixed inset-0 bg-black/60 z-40 hidden md:block"
          onClick={() => setIsHovering(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${isExpanded ? 'bg-white/95 dark:bg-black/95 border-zinc-200/50 dark:border-white/10' : 'bg-white border-zinc-200 dark:bg-sidebar dark:border-sidebar-border'} border-r h-screen fixed left-0 top-0 flex flex-col transition-[width,transform] duration-200 z-50
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
          ${!isMobileOpen ? 'md:translate-x-0' : ''}
          ${!isMobileOpen && !isExpanded ? 'md:w-20' : 'md:w-64'}
        `}
        onMouseEnter={() => {
          if (!isMobileOpen && isCollapsed) setIsHovering(true);
        }}
        onMouseLeave={() => {
          if (!isMobileOpen) setIsHovering(false);
        }}
      >
        {/* Logo Area with Hover Trigger */}
        <div
          className="flex items-center justify-between p-4 border-b border-sidebar-border"
          onClick={() => {
            if (!isMobileOpen) {
              onToggle?.(!isCollapsed);
              setIsHovering(false);
            }
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-sm">AR</span>
            </div>
            {showLabels && (
              <span className="text-zinc-900 dark:text-sidebar-foreground font-bold text-lg">
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
            {showLabels && (
              <div className="px-4 mb-2">
                <span className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                  Workflow
                </span>
              </div>
            )}
            <div className="space-y-1">
              {CORE_WORKFLOW.map(renderNavButton)}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-sidebar-border my-4" />

          {/* GROUP 2: Account & System */}
          <div>
            {showLabels && (
              <div className="px-4 mb-2">
                <span className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                  Account
                </span>
              </div>
            )}
            <div className="space-y-1">
              {ACCOUNT_ITEMS.map(renderNavButton)}
            </div>
          </div>

          {/* GROUP 3: Admin (only if admin) */}
          {isAdmin && !isCheckingRole && (
            <>
              <div className="border-t border-sidebar-border my-4" />
              <div>
                {showLabels && (
                  <div className="px-4 mb-2">
                    <span className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                      Admin
                    </span>
                  </div>
                )}
                <div className="space-y-1">
                  {ADMIN_ITEMS.map(renderNavButton)}
                </div>
              </div>
            </>
          )}
        </nav>

        {/* Logout - Always at Bottom */}
        <div className="p-4 border-t border-sidebar-border">
          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-600 dark:text-sidebar-foreground/70 hover:text-zinc-900 dark:hover:text-sidebar-foreground hover:bg-zinc-100 dark:hover:bg-sidebar-accent/50 transition-colors"
            title={(!showLabels && !isMobileOpen) ? 'Logout' : undefined}
            onClick={onLogout}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {showLabels && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
});
