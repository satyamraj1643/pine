import React from "react";
import {
  FaHome,
  FaBookOpen,
  FaTag,
  FaArchive,
  FaCog,
  FaSmile,
  FaStar,
} from "react-icons/fa";
import { FaPenNib } from "react-icons/fa6";
import { TbSparkles } from "react-icons/tb";

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

export const navGroups: NavGroup[] = [
  {
    // Main -- no label, always visible at top
    items: [
      { to: "/", label: "Home", icon: <FaHome size={15} /> },
      { to: "/notes", label: "Notes", icon: <FaPenNib size={15} /> },
      { to: "/notebooks", label: "Notebooks", icon: <FaBookOpen size={15} /> },
      { to: "/favorites", label: "Favorites", icon: <FaStar size={15} /> },
    ],
  },
  {
    label: "Organize",
    items: [
      { to: "/tags", label: "Tags", icon: <FaTag size={15} /> },
      { to: "/mood", label: "Moods", icon: <FaSmile size={15} /> },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/reflect", label: "Reflect", icon: <TbSparkles size={15} /> },
      { to: "/archives", label: "Archive", icon: <FaArchive size={15} /> },
      { to: "/settings", label: "Settings", icon: <FaCog size={15} /> },
    ],
  },
];

// ────────────────────────────────────────────────────────────
// Flat list (for command palette, search, etc.)
// ────────────────────────────────────────────────────────────

export const allNavItems: NavItem[] = navGroups.flatMap((g) => g.items);
