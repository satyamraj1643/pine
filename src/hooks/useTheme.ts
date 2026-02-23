import { useCallback, useEffect, useState } from "react";

interface UseThemeReturn {
  setTheme: (themeClass: string) => void;
  currentTheme: string;
}

export function useTheme(): UseThemeReturn {
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    if (typeof window === "undefined") return "theme-light";
    return document.body.className || "theme-light";
  });

  const setTheme = useCallback((themeClass: string) => {
    document.body.className = themeClass;
    setCurrentTheme(themeClass);
  }, []);

  useEffect(() => {
    document.body.className = currentTheme;
  }, [currentTheme]);

  return { setTheme, currentTheme };
}