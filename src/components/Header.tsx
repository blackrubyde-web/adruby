import React, { useEffect, useMemo, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { Bell, Search, Sun, Moon, ChevronDown, CreditCard, Sparkles } from 'lucide-react';

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
    <div className="relative overflow-hidden rounded-2xl border border-border bg-[var(--surface,#0f172a)]/85 px-5 py-4 shadow-[0_24px_60px_-38px_rgba(0,0,0,0.9)] backdrop-blur">
      <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true">
        <div className="absolute -left-14 top-0 h-48 w-48 rounded-full bg-rose-500/15 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-56 w-56 rounded-full bg-indigo-500/15 blur-3xl" />
      </div>

      <div className="relative flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand,#f43f5e)] text-white font-semibold shadow-lg shadow-rose-500/20">
              {/* TODO: REPLACE_LOGO */}
              BR
            </div>
            <div className="leading-tight">
              <p className="text-lg font-semibold text-white flex items-center gap-2">
                {title}
                <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-white/80">
                  <Sparkles size={12} aria-hidden="true" /> Pro
                </span>
              </p>
              {subtitle && <p className="text-xs text-[var(--muted,#cbd5e1)]">{subtitle}</p>}
            </div>
          </div>

          <div className="flex min-w-[320px] flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 shadow-inner focus-within:ring-2 focus-within:ring-[var(--brand,#f43f5e)]">
            <Search size={16} className="text-[var(--muted,#cbd5e1)]" aria-hidden="true" />
            <div className="relative flex-1">
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
                <div className="absolute left-0 right-0 top-[110%] z-20 rounded-xl border border-border bg-[var(--surface,#0f172a)] text-xs text-[var(--muted,#cbd5e1)] shadow-2xl">
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
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white shadow-sm">
              <CreditCard size={14} aria-hidden="true" />
              <span>Credits</span>
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px]">{credits}</span>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Theme umschalten"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white hover:border-[var(--brand,#f43f5e)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand,#f43f5e)]"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              type="button"
              aria-label="Benachrichtigungen oeffnen"
              onClick={onOpenNotifications}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white hover:border-[var(--brand,#f43f5e)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand,#f43f5e)]"
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
                aria-label="Avatar Menue oeffnen"
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white hover:border-[var(--brand,#f43f5e)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand,#f43f5e)]"
              >
                {/* TODO: REPLACE_LOGO */}
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">AB</div>
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
                <Menu.Items className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-[var(--surface,#0f172a)] p-1 text-sm text-white shadow-2xl focus:outline-none">
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

        {children ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 shadow-inner">{children}</div>
        ) : null}
      </div>
    </div>
  );
};

export default Header;
