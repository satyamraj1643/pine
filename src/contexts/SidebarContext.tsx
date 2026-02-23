import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type SidebarState = "full" | "mid" | "hidden";

interface SidebarContextType {
  sidebarState: SidebarState;
  setSidebarState: (state: SidebarState) => void;
  cycleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

const STORAGE_KEY = "sidebar-state";

// Cycle order: full -> mid -> hidden -> full
const STATE_CYCLE: SidebarState[] = ["full", "mid", "hidden"];

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [sidebarState, setSidebarStateInternal] = useState<SidebarState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as SidebarState | null;
    if (stored && STATE_CYCLE.includes(stored)) {
      return stored;
    }
    return "full";
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, sidebarState);
  }, [sidebarState]);

  const setSidebarState = useCallback((state: SidebarState) => {
    setSidebarStateInternal(state);
  }, []);

  const cycleSidebar = useCallback(() => {
    setSidebarStateInternal((prev) => {
      const currentIndex = STATE_CYCLE.indexOf(prev);
      const nextIndex = (currentIndex + 1) % STATE_CYCLE.length;
      return STATE_CYCLE[nextIndex];
    });
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + B to cycle sidebar states
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        cycleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cycleSidebar]);

  return (
    <SidebarContext.Provider value={{ sidebarState, setSidebarState, cycleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}
