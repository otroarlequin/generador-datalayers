import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { SETTINGS_STORAGE_KEY } from '@/constants';
import {
  translate,
  type Locale,
  type ThemeMode,
} from '@/i18n';

type Settings = {
  locale: Locale;
  theme: ThemeMode;
};

type SettingsContextValue = {
  locale: Locale;
  theme: ThemeMode;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return { locale: 'es', theme: 'light' };
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      locale: parsed.locale === 'en' || parsed.locale === 'pt' ? parsed.locale : 'es',
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
    };
  } catch {
    return { locale: 'es', theme: 'light' };
  }
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const initial = loadSettings();
    applyTheme(initial.theme);
    document.documentElement.lang = initial.locale;
    return initial;
  });

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    applyTheme(settings.theme);
    document.documentElement.lang = settings.locale;
  }, [settings]);

  const setLocale = useCallback((locale: Locale) => {
    setSettings((current) => ({ ...current, locale }));
  }, []);

  const setTheme = useCallback((theme: ThemeMode) => {
    setSettings((current) => ({ ...current, theme }));
  }, []);

  const toggleTheme = useCallback(() => {
    setSettings((current) => ({
      ...current,
      theme: current.theme === 'dark' ? 'light' : 'dark',
    }));
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(settings.locale, key, params),
    [settings.locale],
  );

  const value = useMemo(
    () => ({
      locale: settings.locale,
      theme: settings.theme,
      setLocale,
      setTheme,
      toggleTheme,
      t,
    }),
    [settings, setLocale, setTheme, toggleTheme, t],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return ctx;
}

export function useT() {
  return useSettings().t;
}
