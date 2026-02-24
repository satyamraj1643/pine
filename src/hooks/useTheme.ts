import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "pine-theme";
const DEFAULT_THEME = "theme-light";

// Shared listener set so every useTheme() instance stays in sync
const listeners = new Set<(theme: string) => void>();

interface UseThemeReturn {
  setTheme: (themeClass: string) => void;
  currentTheme: string;
}

export function useTheme(): UseThemeReturn {
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    if (typeof window === "undefined") return DEFAULT_THEME;
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
  });

  // Register this instance's setter so other instances can notify us
  useEffect(() => {
    listeners.add(setCurrentTheme);
    return () => { listeners.delete(setCurrentTheme); };
  }, []);

  // Apply theme class to body whenever it changes
  useEffect(() => {
    document.body.className = currentTheme;
  }, [currentTheme]);

  const setTheme = useCallback((themeClass: string) => {
    localStorage.setItem(STORAGE_KEY, themeClass);
    document.body.className = themeClass;
    // Notify ALL hook instances (including this one)
    listeners.forEach((fn) => fn(themeClass));
  }, []);

  return { setTheme, currentTheme };
}
