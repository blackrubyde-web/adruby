import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';

const actions = [
  { label: 'Übersicht', path: '/overview-dashboard' },
  { label: 'Ad Builder', path: '/ad-ruby-ad-builder' },
  { label: 'Ad Strategien', path: '/ad-ruby-ad-strategies' },
  { label: 'AI Analysis', path: '/ai-analysis' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'Credits', path: '/credits' },
  { label: 'Einstellungen', path: '/settings-configuration' }
];

const CommandPalette = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handler = (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      if ((isMac && e.metaKey && e.key === 'k') || (!isMac && e.ctrlKey && e.key === 'k')) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return actions.filter((a) => a.label.toLowerCase().includes(q) || a.path.toLowerCase().includes(q));
  }, [query]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-24 px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-2xl bg-[#0f1116] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Search size={18} className="text-white/60" />
          <input
            autoFocus
            placeholder="Suchen oder navigieren..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white text-sm focus:outline-none"
          />
          <button
            onClick={() => setOpen(false)}
            className="text-white/60 hover:text-white transition-smooth"
            aria-label="Schließen"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-white/60 text-sm">Keine Ergebnisse</div>
          )}
          {filtered.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="w-full text-left px-4 py-3 flex items-center justify-between text-white hover:bg-white/5 transition-smooth"
            >
              <div>
                <div className="font-semibold text-sm">{action.label}</div>
                <div className="text-xs text-white/60">{action.path}</div>
              </div>
              <ArrowRight size={16} className="text-white/50" />
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CommandPalette;
