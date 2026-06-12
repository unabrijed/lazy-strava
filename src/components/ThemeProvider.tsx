"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

export type AppTheme = "light" | "dark";

type ThemeContextValue = {
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const THEME_STORAGE_KEY = "lazy-strava-theme";

function applyTheme(theme: AppTheme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme === "dark" ? "dark" : "light";
}

const noopSubscribe = () => () => {};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Boot value comes from the <html> class set by the inline boot script;
  // "light" on the server so SSR markup is stable. User toggles override it.
  const bootTheme = useSyncExternalStore<AppTheme>(
    noopSubscribe,
    () => (document.documentElement.classList.contains("dark") ? "dark" : "light"),
    () => "light"
  );
  const [override, setOverride] = useState<AppTheme | null>(null);
  const theme = override ?? bootTheme;

  const setTheme = useCallback((t: AppTheme) => {
    setOverride(t);
    localStorage.setItem(THEME_STORAGE_KEY, t);
    applyTheme(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
