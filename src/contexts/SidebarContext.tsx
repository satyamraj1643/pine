import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type SidebarState = "full" | "mid" | "hidden";

// Snap widths for mid/hidden
export const SIDEBAR_FULL_DEFAULT = 224; // default full width
export const SIDEBAR_MID = 56;
export const SIDEBAR_HIDDEN = 0;

// Max allowed width
const SIDEBAR_MAX = 480;

// Snap thresholds on release
const SNAP_TO_HIDDEN = 28;
const SNAP_TO_MID = 120;

export function stateFromWidth(w: number): SidebarState {
  if (w < SNAP_TO_HIDDEN) return "hidden";
  if (w < SNAP_TO_MID) return "mid";
  return "full";
}

interface SidebarContextType {
  sidebarState: SidebarState;
  sidebarWidth: number;
  setSidebarState: (state: SidebarState) => void;
  /** Set raw pixel width during drag — follows cursor */
  setDragWidth: (px: number) => void;
  /** Release drag — snap hidden/mid, keep full at current width */
  commitDrag: () => void;
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

const STATE_KEY = "sidebar-state";
const WIDTH_KEY = "sidebar-width";

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [sidebarState, setSidebarStateRaw] = useState<SidebarState>(() => {
    const stored = localStorage.getItem(STATE_KEY) as SidebarState | null;
    if (stored && ["full", "mid", "hidden"].includes(stored)) return stored;
    return "full";
  });

  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const state = (localStorage.getItem(STATE_KEY) as SidebarState) || "full";
    if (state === "hidden") return SIDEBAR_HIDDEN;
    if (state === "mid") return SIDEBAR_MID;
    const saved = parseInt(localStorage.getItem(WIDTH_KEY) || "", 10);
    return saved && saved >= SNAP_TO_MID ? saved : SIDEBAR_FULL_DEFAULT;
  });

  const [isDragging, setIsDragging] = useState(false);

  // Persist
  useEffect(() => {
    localStorage.setItem(STATE_KEY, sidebarState);
    if (sidebarState === "full") {
      localStorage.setItem(WIDTH_KEY, String(sidebarWidth));
    }
  }, [sidebarState, sidebarWidth]);

  const setSidebarState = useCallback((state: SidebarState) => {
    setSidebarStateRaw(state);
    if (state === "hidden") setSidebarWidth(SIDEBAR_HIDDEN);
    else if (state === "mid") setSidebarWidth(SIDEBAR_MID);
    else {
      // Restore last saved full width
      const saved = parseInt(localStorage.getItem(WIDTH_KEY) || "", 10);
      setSidebarWidth(saved && saved >= SNAP_TO_MID ? saved : SIDEBAR_FULL_DEFAULT);
    }
  }, []);

  // During drag: follow cursor, no cap except max
  const setDragWidth = useCallback((px: number) => {
    setSidebarWidth(Math.max(0, Math.min(px, SIDEBAR_MAX)));
  }, []);

  // On release: snap hidden/mid, keep full at current width
  const commitDrag = useCallback(() => {
    setSidebarWidth(prev => {
      const state = stateFromWidth(prev);
      setSidebarStateRaw(state);
      if (state === "hidden") return SIDEBAR_HIDDEN;
      if (state === "mid") return SIDEBAR_MID;
      return prev; // keep at whatever width user dragged to
    });
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + \ to cycle states
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        setSidebarStateRaw(prev => {
          const cycle: SidebarState[] = ["full", "mid", "hidden"];
          const next = cycle[(cycle.indexOf(prev) + 1) % cycle.length];
          if (next === "hidden") setSidebarWidth(SIDEBAR_HIDDEN);
          else if (next === "mid") setSidebarWidth(SIDEBAR_MID);
          else {
            const saved = parseInt(localStorage.getItem(WIDTH_KEY) || "", 10);
            setSidebarWidth(saved && saved >= SNAP_TO_MID ? saved : SIDEBAR_FULL_DEFAULT);
          }
          return next;
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <SidebarContext.Provider value={{
      sidebarState, sidebarWidth, setSidebarState,
      setDragWidth, commitDrag, isDragging, setIsDragging,
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within SidebarProvider");
  return context;
}
