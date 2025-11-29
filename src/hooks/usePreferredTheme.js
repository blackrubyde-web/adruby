import { useEffect, useState } from 'react';

const getInitialTheme = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 'light';
  const stored = localStorage.getItem('theme') || localStorage.getItem('adruby_theme');
  if (stored === 'dark' || stored === 'light') return stored;
  if (document.documentElement.classList.contains('dark')) return 'dark';
  return 'light';
};

const usePreferredTheme = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const handler = () => {
      setTheme(getInitialTheme());
    };

    window.addEventListener('themechange', handler);
    return () => window.removeEventListener('themechange', handler);
  }, []);

  return theme;
};

export default usePreferredTheme;
