import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Sun, Moon, User, Settings, HelpCircle, Coins, Menu } from 'lucide-react';
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

interface HeaderProps {
  sidebarWidth?: number;
  onToggleMobileSidebar?: () => void;
  onNavigate?: (page: PageType | 'profile' | 'settings' | 'help') => void;
  currentPage?: PageType;
  currentCredits?: number;
  maxCredits?: number;
}

export function Header({ sidebarWidth = 0, onToggleMobileSidebar, onNavigate, currentCredits, maxCredits }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const credits = currentCredits ?? 2450;
  const creditsLabel = maxCredits
    ? `${credits.toLocaleString()} / ${maxCredits.toLocaleString()}`
    : credits.toLocaleString();
  
  return (
    <div 
      className="h-16 backdrop-blur-xl bg-card/80 border-b border-border/50 flex items-center justify-between px-4 md:px-8 fixed top-0 right-0 z-10 transition-all duration-300 shadow-lg"
      style={{ left: sidebarWidth > 0 ? `${sidebarWidth}px` : '0' }}
    >
      {/* Left Side */}
      <div className="flex items-center gap-3">
        {/* Mobile Burger Menu */}
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden w-10 h-10 rounded-lg border border-border bg-card hover:bg-muted flex items-center justify-center transition-colors"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>

        {/* Credits Display - Hidden on Mobile */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-card border border-border/50 rounded-lg hover:border-border transition-colors">
          <Coins className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground font-medium">{creditsLabel}</span>
          <span className="text-xs text-muted-foreground">Credits</span>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-lg border border-border bg-card hover:bg-muted flex items-center justify-center transition-colors"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-foreground" />
          ) : (
            <Moon className="w-5 h-5 text-foreground" />
          )}
        </button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hover:opacity-80 transition-opacity cursor-pointer">
              <Avatar className="cursor-pointer w-10 h-10">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground">PM</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mein Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={() => onNavigate?.('profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => onNavigate?.('settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
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
}
