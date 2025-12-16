import React, { useMemo, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  BarChart3,
  Settings,
  Zap,
  MoreHorizontal,
  User
} from 'lucide-react';

export type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  group?: string;
};

interface SidebarProps {
  collapsed: boolean;
  active: string;
  onToggle: () => void;
  onNavigate?: (id: string) => void;
  navItems?: NavItem[];
}

const defaultNavItems: NavItem[] = [
  { id: 'home', label: 'Übersicht', icon: <Home aria-hidden="true" /> },
  { id: 'performance', label: 'Performance', icon: <BarChart3 aria-hidden="true" />, badge: '8' },
  { id: 'automation', label: 'Automationen', icon: <Zap aria-hidden="true" /> },
  { id: 'settings', label: 'Einstellungen', icon: <Settings aria-hidden="true" />, group: 'System' }
];

const groupNavItems = (items: NavItem[]) => {
  return items.reduce<Record<string, NavItem[]>>((acc, item) => {
    const key = item.group || 'default';
    acc[key] = acc[key] ? [...acc[key], item] : [item];
    return acc;
  }, {});
};

const Tooltip: React.FC<{ label: string; show: boolean }> = ({ label, show }) => (
  <Transition
    show={show}
    enter="transition ease-out duration-100"
    enterFrom="opacity-0 translate-y-1"
    enterTo="opacity-100 translate-y-0"
    leave="transition ease-in duration-75"
    leaveFrom="opacity-100 translate-y-0"
    leaveTo="opacity-0 translate-y-1"
    className="absolute left-full ml-3 top-1/2 -translate-y-1/2"
  >
    <div className="whitespace-nowrap rounded-md bg-slate-900 text-white px-3 py-1 text-xs shadow-lg ring-1 ring-black/10">
      {label}
    </div>
  </Transition>
);

const Sidebar: React.FC<SidebarProps> = ({ collapsed, active, onToggle, onNavigate, navItems }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const items = navItems?.length ? navItems : defaultNavItems;
  const grouped = useMemo(() => groupNavItems(items), [items]);

  const width = collapsed ? 72 : 280;
  const handleNav = (id: string) => onNavigate?.(id);

  return (
    <motion.aside
      initial={false}
      animate={{ width }}
      className="relative flex h-screen flex-col border-r border-border bg-[var(--bg,#0f172a)] text-[var(--muted,#cbd5e1)] shadow-[4px_0_24px_-18px_rgba(0,0,0,0.45)]"
      aria-label="Hauptnavigation"
    >
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand,#f43f5e)] text-white font-semibold">
            {/* TODO: REPLACE_LOGO */}
            <span className="text-base">BR</span>
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">BlackRuby</p>
              <p className="text-xs text-[var(--muted,#cbd5e1)]">Growth Suite</p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Sidebar öffnen' : 'Sidebar schließen'}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-[var(--surface,#111827)] text-white hover:border-[var(--brand,#f43f5e)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand,#f43f5e)]"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {Object.entries(grouped).map(([groupKey, groupItems]) => (
          <div key={groupKey} className="mb-3">
            {groupKey !== 'default' && !collapsed && (
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted,#cbd5e1)]">
                {groupKey}
              </p>
            )}
            <nav role="list" className="space-y-1">
              {groupItems.map((item) => {
                const isActive = item.id === active;
                const showTooltip = collapsed && hoveredId === item.id;
                return (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <button
                      type="button"
                      aria-current={isActive ? 'page' : undefined}
                      aria-label={item.label}
                      onFocus={() => setHoveredId(item.id)}
                      onBlur={() => setHoveredId(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleNav(item.id);
                        }
                      }}
                      onClick={() => handleNav(item.id)}
                      className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand,#f43f5e)] ${
                        isActive
                          ? 'bg-gradient-to-r from-[var(--brand,#f43f5e)]/20 to-indigo-500/20 text-white shadow-[0_10px_30px_-18px_rgba(0,0,0,0.8)] border border-[var(--brand,#f43f5e)]/30'
                          : 'text-[var(--muted,#cbd5e1)] hover:bg-white/5'
                      }`}
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-white">
                        {/* TODO: REPLACE_ICONS */}
                        {item.icon}
                        {collapsed && item.badge && (
                          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[var(--brand,#f43f5e)]" aria-hidden="true" />
                        )}
                      </span>
                      {!collapsed && <span className="truncate text-left">{item.label}</span>}
                      {!collapsed && item.badge && (
                        <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs text-white">
                          {item.badge}
                        </span>
                      )}
                    </button>
                    <Tooltip label={item.label} show={showTooltip} />
                  </div>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="border-t border-border px-3 py-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            {/* TODO: INTEGRATE_BACKEND_FOR_AVATAR */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white">
              <User size={18} aria-hidden="true" />
            </div>
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">Ava Bloom</p>
              <p className="text-xs text-[var(--muted,#cbd5e1)]">Growth Lead</p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[var(--surface,#111827)] px-2 py-1 text-[11px] text-white">
                <span className="h-2 w-2 rounded-full bg-[var(--success,#22c55e)]" aria-hidden="true" />
                Credits: 1.240
              </div>
            </div>
          )}
          <Menu as="div" className="relative">
            <Menu.Button
              aria-label="Profilmenü öffnen"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-[var(--surface,#111827)] text-white hover:border-[var(--brand,#f43f5e)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand,#f43f5e)]"
            >
              <MoreHorizontal size={18} />
            </Menu.Button>
            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute bottom-12 right-0 z-20 w-48 rounded-xl border border-border bg-[var(--surface,#111827)] p-1 text-sm text-white shadow-xl focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`w-full rounded-lg px-3 py-2 text-left ${active ? 'bg-white/10' : ''}`}
                      onClick={() => handleNav('profile')}
                    >
                      Profil
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`w-full rounded-lg px-3 py-2 text-left ${active ? 'bg-white/10' : ''}`}
                      onClick={() => handleNav('workspace')}
                    >
                      Workspace wechseln
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`w-full rounded-lg px-3 py-2 text-left text-rose-300 ${active ? 'bg-white/10' : ''}`}
                      onClick={() => handleNav('logout')}
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
    </motion.aside>
  );
};

export default Sidebar;
