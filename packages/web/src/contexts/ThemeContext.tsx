// src/contexts/ThemeContext.tsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

// Theme registry - now simplified to dark/light
export const THEMES = ['dark', 'light'] as const;
type Theme = typeof THEMES[number];

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
  isLight: boolean;
}

const STORAGE_KEY = 'equitherm-theme';

// Migrate old theme names to new format
const migrateTheme = (oldTheme: string): Theme | null => {
  const migrations: Record<string, Theme> = {
    'esphome': 'dark',
    'esphome-light': 'light',
  };
  return migrations[oldTheme] || null;
};

// SSR-safe localStorage accessor with migration
const getStoredTheme = (): Theme | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    // Check if it's a valid new theme
    if (THEMES.includes(stored as Theme)) {
      return stored as Theme;
    }

    // Try to migrate old theme name
    const migrated = migrateTheme(stored);
    if (migrated) {
      // Save migrated theme
      localStorage.setItem(STORAGE_KEY, migrated);
      return migrated;
    }

    return null;
  } catch {
    return null;
  }
};

// Detect system preference
const getSystemTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = 'dark' }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return getStoredTheme() || getSystemTheme() || defaultTheme;
  });

  // Apply theme to DOM using class
  const applyTheme = useCallback((newTheme: Theme) => {
    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    // Add new theme class
    root.classList.add(newTheme);

    // Keep data-theme for backward compatibility with existing CSS
    root.setAttribute('data-theme', newTheme === 'dark' ? 'esphome' : 'esphome-light');

    // Update meta theme-color for mobile
    const metaTheme = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (metaTheme) {
      metaTheme.content = newTheme === 'light' ? '#ffffff' : '#1c2028';
    }
  }, []);

  // Apply on mount and changes
  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch { /* private mode */ }
  }, [theme, applyTheme]);

  // Cross-tab sync
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue && THEMES.includes(e.newValue as Theme)) {
        setThemeState(e.newValue as Theme);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // System preference changes
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!getStoredTheme()) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    if (THEMES.includes(newTheme)) {
      setThemeState(newTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      toggleTheme,
      isDark: theme === 'dark',
      isLight: theme === 'light',
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
