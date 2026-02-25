import React from "react";
import {
  House,
  PenLine,
  BookOpen,
  Star,
  Tag,
  Smile,
  Sparkles,
  Archive,
} from "lucide-react";

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export interface NavItem {
  /** Route path (must match a <Route> in App.tsx) */
  to: string;
  /** Display label */
  label: string;
  /** Icon element (rendered at the caller's chosen size) */
  icon: React.ReactElement;
}

export interface NavGroup {
  /** Optional section label (hidden in collapsed sidebar) */
  label?: string;
  /** Items in this group */
  items: NavItem[];
}

// ────────────────────────────────────────────────────────────
// Authenticated navigation
// ────────────────────────────────────────────────────────────

const ICON_SIZE = 16;
const STROKE = 1.75;

export const navGroups: NavGroup[] = [
  {
    // Main -- no label, always visible at top
    items: [
      { to: "/", label: "Home", icon: <House size={ICON_SIZE} strokeWidth={STROKE} /> },
      { to: "/notes", label: "Notes", icon: <PenLine size={ICON_SIZE} strokeWidth={STROKE} /> },
      { to: "/notebooks", label: "Notebooks", icon: <BookOpen size={ICON_SIZE} strokeWidth={STROKE} /> },
      { to: "/favorites", label: "Favorites", icon: <Star size={ICON_SIZE} strokeWidth={STROKE} /> },
    ],
  },
  {
    label: "Organize",
    items: [
      { to: "/tags", label: "Tags", icon: <Tag size={ICON_SIZE} strokeWidth={STROKE} /> },
      { to: "/mood", label: "Moods", icon: <Smile size={ICON_SIZE} strokeWidth={STROKE} /> },
    ],
  },
  {
    label: "Insights",
    items: [
      { to: "/reflect", label: "Reflect", icon: <Sparkles size={ICON_SIZE} strokeWidth={STROKE} /> },
      { to: "/archives", label: "Archive", icon: <Archive size={ICON_SIZE} strokeWidth={STROKE} /> },
    ],
  },
];

// ────────────────────────────────────────────────────────────
// Flat list (for command palette, search, etc.)
// ────────────────────────────────────────────────────────────

export const allNavItems: NavItem[] = navGroups.flatMap((g) => g.items);
