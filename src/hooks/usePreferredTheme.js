import { useEffect, useState } from 'react';
import { getInitialTheme } from './useTheme';

const usePreferredTheme = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const handler = () => setTheme(getInitialTheme());

    window.addEventListener('themechange', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('themechange', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  return theme;
};

export default usePreferredTheme;
