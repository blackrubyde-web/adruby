import { memo, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Sun, Moon, User, Settings, HelpCircle, Zap, Menu, Crown } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import type { PageType } from '../App';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

/** Map page keys → German page titles */
const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  analytics: 'Analyse',
  studio: 'Creative Studio',
  aibuilder: 'AI Ad Builder',
  campaigns: 'Kampagnen',
  aianalysis: 'AI Analyse',
  library: 'Creative Bibliothek',
  profile: 'Profil',
  settings: 'Einstellungen',
  affiliate: 'Affiliate',
  help: 'Hilfe & Support',
  admin: 'Admin',
};

interface HeaderProps {
  sidebarWidth?: number;
  onToggleMobileSidebar?: () => void;
  onNavigate?: (page: PageType | 'profile' | 'settings' | 'help') => void;
  currentPage?: PageType;
  currentCredits?: number;
  maxCredits?: number;
  avatarUrl?: string | null;
  displayName?: string | null;
  email?: string | null;
  isTrialUser?: boolean;
  onUpgrade?: () => void;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Guten Morgen';
  if (h < 18) return 'Guten Tag';
  return 'Guten Abend';
}

export const Header = memo(function Header({
  sidebarWidth = 0,
  onToggleMobileSidebar,
  onNavigate,
  currentPage,
  currentCredits,
  avatarUrl,
  displayName,
  email,
  isTrialUser = false,
  onUpgrade,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const creditsLoading = currentCredits === undefined || currentCredits === null;
  const credits = currentCredits ?? 0;

  const initials = useMemo(() => {
    const base = displayName || email || 'U';
    const parts = base.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
  }, [displayName, email]);

  const pageTitle = PAGE_TITLES[currentPage || 'dashboard'] || 'Dashboard';
  const firstName = displayName?.split(' ')[0] || null;
  const isDashboard = currentPage === 'dashboard';

  return (
    <div
      className="bg-card/95 backdrop-blur-sm border-b border-border/40 flex items-center justify-between px-4 sm:px-6 md:px-8 sticky top-0 z-40 transition-[left] duration-200 md:fixed md:top-0 md:right-0"
      style={{
        height: '64px',
        left: sidebarWidth > 0 ? `${sidebarWidth}px` : '0'
      }}
    >
      {/* Left: Burger + Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Burger */}
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden w-9 h-9 rounded-lg border border-border/50 bg-muted/40 hover:bg-muted flex items-center justify-center transition-all shrink-0"
          aria-label="Menü öffnen"
        >
          <Menu className="w-4.5 h-4.5 text-foreground" />
        </button>

        {/* Page Title + Greeting */}
        <div className="min-w-0 flex items-center gap-2.5">
          <img src="/images/adruby-logo.png" alt="AdRuby" className="w-7 h-7 object-contain hidden sm:block" />
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-foreground leading-tight truncate">
              {pageTitle}
            </h1>
            {isDashboard && firstName && (
              <p className="text-xs text-muted-foreground leading-tight truncate hidden sm:block">
                {getGreeting()}, {firstName} 👋
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right: Credits + Upgrade + Avatar */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Credits Pill — always visible */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/10 rounded-full transition-colors hover:bg-primary/15 cursor-default">
          <Zap className="w-3.5 h-3.5 text-primary shrink-0" />
          {creditsLoading ? (
            <div className="w-8 h-3.5 bg-primary/20 rounded-full animate-pulse" />
          ) : (
            <span className="text-xs sm:text-sm font-semibold text-primary tabular-nums">
              {credits.toLocaleString()}
            </span>
          )}
        </div>

        {/* Upgrade — Trial Users */}
        {isTrialUser && onUpgrade && (
          <button
            onClick={onUpgrade}
            className="group px-3 py-1.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-full font-semibold text-xs flex items-center gap-1.5 hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-95 shrink-0"
          >
            <Crown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upgraden</span>
          </button>
        )}

        {/* Profile Dropdown (includes Theme Toggle) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hover:opacity-80 transition-opacity cursor-pointer">
              <Avatar className="cursor-pointer w-9 h-9">
                <AvatarImage src={avatarUrl || ''} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mein Account</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Upgrade in Dropdown for Trial Users */}
            {isTrialUser && onUpgrade && (
              <>
                <DropdownMenuItem
                  className="cursor-pointer text-primary focus:text-primary focus:bg-primary/10"
                  onClick={onUpgrade}
                >
                  <Crown className="mr-2 h-4 w-4" />
                  <span className="font-semibold">Auf Pro upgraden</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuItem className="cursor-pointer" onClick={() => onNavigate?.('profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => onNavigate?.('settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Einstellungen</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            {/* Theme Toggle — inside dropdown */}
            <DropdownMenuItem className="cursor-pointer" onClick={toggleTheme}>
              {theme === 'dark' ? (
                <Sun className="mr-2 h-4 w-4 text-yellow-500" />
              ) : (
                <Moon className="mr-2 h-4 w-4 text-slate-600" />
              )}
              <span>{theme === 'dark' ? 'Helles Design' : 'Dunkles Design'}</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={() => onNavigate?.('help')}>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Hilfe & Support</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
});
