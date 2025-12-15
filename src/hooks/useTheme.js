import { useEffect, useState, useCallback } from 'react';

const THEME_KEY = 'adruby_theme';

const getStoredTheme = () => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
  const stored = localStorage.getItem(THEME_KEY) || localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return null;
};

export const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light';
  const stored = getStoredTheme();
  if (stored) return stored;
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

const applyTheme = (theme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

const useTheme = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (err) {
      console.warn('[Theme] Failed to persist theme', err);
    }
    window.dispatchEvent(new Event('themechange'));
  }, [theme]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === THEME_KEY || event.key === 'theme') {
        const next = event.newValue === 'dark' ? 'dark' : 'light';
        setTheme(next);
      }
    };

    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    const handleMedia = (event) => {
      const stored = getStoredTheme();
      if (!stored) {
        setTheme(event.matches ? 'dark' : 'light');
      }
    };

    window.addEventListener('storage', handleStorage);
    media?.addEventListener?.('change', handleMedia);

    return () => {
      window.removeEventListener('storage', handleStorage);
      media?.removeEventListener?.('change', handleMedia);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, setTheme, toggleTheme, isDark: theme === 'dark' };
};

export default useTheme;
