import React, { useEffect, useMemo, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { Bell, Search, Sun, Moon, ChevronDown, CreditCard } from 'lucide-react';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onToggleTheme?: () => void;
  credits?: string | number;
  notificationsCount?: number;
  onOpenNotifications?: () => void;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const suggestions = ['Umsatz', 'Conversion Rate', 'ROAS', 'CPC', 'Kampagnen'];

const Header: React.FC<HeaderProps> = ({
  onSearch,
  onToggleTheme,
  credits = '0',
  notificationsCount = 0,
  onOpenNotifications,
  title = 'Dashboard',
  subtitle,
  children
}) => {
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'dark';
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleSearch = (value?: string) => {
    const next = value ?? query;
    if (next.trim().length === 0) return;
    onSearch?.(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((prev) => {
        const next = prev === null ? 0 : (prev + 1) % suggestions.length;
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((prev) => {
        if (prev === null) return suggestions.length - 1;
        return (prev - 1 + suggestions.length) % suggestions.length;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlighted !== null) {
        const value = suggestions[highlighted];
        setQuery(value);
        handleSearch(value);
      } else {
        handleSearch();
      }
    }
  };

  const activeSuggestions = useMemo(() => {
    const lower = query.toLowerCase();
    return suggestions.filter((s) => s.toLowerCase().includes(lower));
  }, [query]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    onToggleTheme?.();
  };

  return (
    <div className="space-y-3 border-b border-border bg-[var(--surface,#0f172a)]/90 px-4 py-3 backdrop-blur">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand,#f43f5e)] text-white font-semibold">
            {/* TODO: REPLACE_LOGO */}
            BR
          </div>
          <div className="leading-tight">
            <p className="text-base font-semibold text-white">{title}</p>
            {subtitle && <p className="text-xs text-[var(--muted,#cbd5e1)]">{subtitle}</p>}
          </div>
        </div>

        <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-border bg-[var(--bg,#0b1220)] px-3 py-2 shadow-inner focus-within:ring-2 focus-within:ring-[var(--brand,#f43f5e)]">
          <Search size={16} className="text-[var(--muted,#cbd5e1)]" aria-hidden="true" />
          <div className="flex-1">
            <label className="sr-only" htmlFor="global-search">
              Suchen
            </label>
            <input
              id="global-search"
              role="searchbox"
              aria-label="Globale Suche"
              placeholder="Suchen..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-sm text-white placeholder:text-[var(--muted,#cbd5e1)] focus:outline-none"
            />
            {activeSuggestions.length > 0 && (
              <div className="mt-2 rounded-lg border border-border bg-[var(--surface,#0f172a)] text-xs text-[var(--muted,#cbd5e1)] shadow-lg">
                <ul role="listbox">
                  {activeSuggestions.map((s, idx) => (
                    <li
                      key={s}
                      role="option"
                      aria-selected={highlighted === idx}
                      className={`cursor-pointer px-3 py-2 ${
                        highlighted === idx ? 'bg-white/10 text-white' : ''
                      }`}
                      onMouseEnter={() => setHighlighted(idx)}
                      onClick={() => handleSearch(s)}
                    >
                      {/* TODO: INTEGRATE_SEARCH_API */}
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-border bg-white/5 px-3 py-1 text-xs text-white">
            <CreditCard size={14} aria-hidden="true" />
            <span>Credits</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px]">{credits}</span>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Theme umschalten"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-[var(--bg,#0b1220)] text-white hover:border-[var(--brand,#f43f5e)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand,#f43f5e)]"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            type="button"
            aria-label="Benachrichtigungen öffnen"
            onClick={onOpenNotifications}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-[var(--bg,#0b1220)] text-white hover:border-[var(--brand,#f43f5e)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand,#f43f5e)]"
          >
            {/* TODO: CONNECT_NOTIFICATIONS_API */}
            <Bell size={16} />
            {notificationsCount > 0 && (
              <span
                aria-live="polite"
                className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-[var(--brand,#f43f5e)] px-1 text-[10px] font-semibold text-white"
              >
                {notificationsCount}
              </span>
            )}
          </button>

          <Menu as="div" className="relative">
            <Menu.Button
              aria-label="Avatar Menü öffnen"
              className="flex items-center gap-2 rounded-lg border border-border bg-[var(--bg,#0b1220)] px-2 py-1 text-white hover:border-[var(--brand,#f43f5e)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand,#f43f5e)]"
            >
              {/* TODO: REPLACE_LOGO */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">AB</div>
              <ChevronDown size={14} />
            </Menu.Button>
            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-[var(--surface,#0f172a)] p-1 text-sm text-white shadow-xl focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <button className={`w-full rounded-lg px-3 py-2 text-left ${active ? 'bg-white/10' : ''}`}>
                      Profil
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button className={`w-full rounded-lg px-3 py-2 text-left ${active ? 'bg-white/10' : ''}`}>
                      Einstellungen
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`w-full rounded-lg px-3 py-2 text-left text-rose-300 ${active ? 'bg-white/10' : ''}`}
                    >
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <motion.div
          layout
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white shadow-sm"
        >
          <span className="h-2 w-2 rounded-full bg-[var(--success,#22c55e)]" aria-hidden="true" />
          Live
        </motion.div>
        <motion.div
          layout
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white shadow-sm"
        >
          CTR ↑ 0.4%
        </motion.div>
        <motion.div
          layout
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white shadow-sm"
        >
          ROAS 4.5x
        </motion.div>
      </div>

      {children ? <div className="pt-2">{children}</div> : null}
    </div>
  );
};

export default Header;
