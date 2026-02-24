import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaBookOpen,
  FaTag,
  FaArchive,
  FaCog,
  FaSmile,
  FaPlus,
  FaChartBar,
  FaSearch,
  FaArrowRight,
} from "react-icons/fa";
import { FaPenNib } from "react-icons/fa6";
import { GetAllNotes } from "../APIs";
import { getEmojiFromShortcode } from "../utilities/emoji";

// ─── Types ───────────────────────────────────────────────

interface CommandItem {
  id: string;
  group: "pages" | "actions" | "notes";
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onSelect: () => void;
}

interface NoteEntry {
  id: number;
  title: string | null;
  content: string | null;
  chapter: number | string;
  mood: { emoji?: string | null; name?: string | null }[] | null;
  collection: number[] | string;
  updated_at: string;
}

// ─── Static data ─────────────────────────────────────────

const PAGE_ITEMS: Omit<CommandItem, "onSelect">[] = [
  { id: "page-home", group: "pages", icon: <FaHome size={14} />, title: "Home", subtitle: "/" },
  { id: "page-notes", group: "pages", icon: <FaPenNib size={14} />, title: "Notes", subtitle: "/notes" },
  { id: "page-notebooks", group: "pages", icon: <FaBookOpen size={14} />, title: "Notebooks", subtitle: "/notebooks" },
  { id: "page-tags", group: "pages", icon: <FaTag size={14} />, title: "Tags", subtitle: "/tags" },
  { id: "page-moods", group: "pages", icon: <FaSmile size={14} />, title: "Moods", subtitle: "/mood" },
  { id: "page-archives", group: "pages", icon: <FaArchive size={14} />, title: "Archive", subtitle: "/archives" },
  { id: "page-settings", group: "pages", icon: <FaCog size={14} />, title: "Settings", subtitle: "/settings" },
  { id: "page-reflect", group: "pages", icon: <FaChartBar size={14} />, title: "Reflect", subtitle: "/reflect" },
];

const ACTION_ITEMS: Omit<CommandItem, "onSelect">[] = [
  { id: "action-new-note", group: "actions", icon: <FaPlus size={12} />, title: "New Note", subtitle: "Create a new note" },
  { id: "action-new-notebook", group: "actions", icon: <FaPlus size={12} />, title: "New Notebook", subtitle: "Create a new notebook" },
  { id: "action-new-tag", group: "actions", icon: <FaPlus size={12} />, title: "New Tag", subtitle: "Create a new tag" },
];

const ACTION_ROUTES: Record<string, string> = {
  "action-new-note": "/new-note",
  "action-new-notebook": "/new-notebook",
  "action-new-tag": "/new-tag",
};

const PAGE_ROUTES: Record<string, string> = {
  "page-home": "/",
  "page-notes": "/notes",
  "page-notebooks": "/notebooks",
  "page-tags": "/tags",
  "page-moods": "/mood",
  "page-archives": "/archives",
  "page-settings": "/settings",
  "page-reflect": "/reflect",
};

const GROUP_LABELS: Record<string, string> = {
  pages: "Pages",
  actions: "Actions",
  notes: "Notes",
};

// ─── Helpers ─────────────────────────────────────────────

function stripHtml(html: string): string {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max).trimEnd() + "...";
}

function getMoodEmoji(mood: NoteEntry["mood"]): string {
  if (!mood || !Array.isArray(mood) || mood.length === 0) return "";
  const first = mood[0];
  if (first && first.emoji) {
    return getEmojiFromShortcode(first.emoji) || first.emoji;
  }
  return "";
}

// ─── Component ───────────────────────────────────────────

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [notesLoaded, setNotesLoaded] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // ── Global shortcut ──────────────────────────────────

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ── Fetch notes when opened ──────────────────────────

  useEffect(() => {
    if (!isOpen) return;
    // Reset state on open
    setQuery("");
    setSelectedIndex(0);

    if (!notesLoaded) {
      GetAllNotes().then((res: any) => {
        if (res?.fetched && Array.isArray(res.data)) {
          setNotes(res.data);
        }
        setNotesLoaded(true);
      });
    }
  }, [isOpen, notesLoaded]);

  // ── Focus input on open ──────────────────────────────

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  // ── Close helper ─────────────────────────────────────

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // ── Build filtered results ───────────────────────────

  const results: CommandItem[] = useMemo(() => {
    const q = query.toLowerCase().trim();
    const items: CommandItem[] = [];

    // Pages
    const filteredPages = PAGE_ITEMS.filter(
      (p) => !q || p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q)
    );
    for (const p of filteredPages) {
      items.push({
        ...p,
        onSelect: () => {
          navigate(PAGE_ROUTES[p.id]);
          close();
        },
      });
    }

    // Actions
    const filteredActions = ACTION_ITEMS.filter(
      (a) => !q || a.title.toLowerCase().includes(q)
    );
    for (const a of filteredActions) {
      items.push({
        ...a,
        onSelect: () => {
          navigate(ACTION_ROUTES[a.id]);
          close();
        },
      });
    }

    // Notes — only when there's a query (at least 1 char)
    if (q.length >= 1) {
      const matchingNotes = notes
        .filter((n) => {
          const title = (n.title || "").toLowerCase();
          const content = stripHtml(n.content || "").toLowerCase();
          return title.includes(q) || content.includes(q);
        })
        .slice(0, 5);

      for (const n of matchingNotes) {
        const emoji = getMoodEmoji((n as any).Moods ?? (n as any).moods ?? n.mood);
        const plainContent = truncate(stripHtml(n.content || ""), 60);
        items.push({
          id: `note-${n.id}`,
          group: "notes",
          icon: emoji ? (
            <span className="text-sm leading-none">{emoji}</span>
          ) : (
            <FaPenNib size={13} className="opacity-50" />
          ),
          title: n.title || "Untitled",
          subtitle: plainContent || "No content",
          onSelect: () => {
            navigate(`/note?id=${n.id}`);
            close();
          },
        });
      }
    }

    return items;
  }, [query, notes, navigate, close]);

  // ── Reset selected index when results change ─────────

  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length, query]);

  // ── Scroll active item into view ─────────────────────

  useEffect(() => {
    const active = listRef.current?.querySelector("[data-active='true']");
    active?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  // ── Keyboard navigation ──────────────────────────────

  function handleInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % results.length || 0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + results.length) % results.length || 0);
    } else if (e.key === "Enter") {
      e.preventDefault();
      results[selectedIndex]?.onSelect();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  // ── Group results for rendering ──────────────────────

  const grouped = useMemo(() => {
    const map = new Map<string, { items: CommandItem[]; startIndex: number }>();
    let idx = 0;
    for (const item of results) {
      if (!map.has(item.group)) {
        map.set(item.group, { items: [], startIndex: idx });
      }
      map.get(item.group)!.items.push(item);
      idx++;
    }
    return map;
  }, [results]);

  // ── Don't render anything when closed ────────────────

  if (!isOpen) return null;

  // ── Detect platform for shortcut hint ────────────────

  const isMac = navigator.platform?.toUpperCase().includes("MAC");
  const modKey = isMac ? "\u2318" : "Ctrl";

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[12vh]"
      onClick={close}
      style={{ animation: "cp-fade-in 150ms ease-out" }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg mx-4 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "cp-scale-in 150ms ease-out" }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[rgb(var(--border))]">
          <FaSearch size={14} className="text-[rgb(var(--copy-muted))] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search pages, actions, or notes..."
            className="flex-1 bg-transparent text-sm text-[rgb(var(--copy-primary))] placeholder:text-[rgb(var(--copy-muted))] outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-[rgb(var(--copy-muted))] bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto overscroll-contain py-1">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-[rgb(var(--copy-muted))]">
                No results found for "{query}"
              </p>
            </div>
          ) : (
            Array.from(grouped.entries()).map(([group, { items, startIndex }]) => (
              <div key={group}>
                {/* Group header */}
                <div className="px-4 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--copy-muted))]">
                  {GROUP_LABELS[group] || group}
                </div>

                {/* Items */}
                {items.map((item, i) => {
                  const globalIndex = startIndex + i;
                  const isActive = globalIndex === selectedIndex;

                  return (
                    <button
                      key={item.id}
                      data-active={isActive}
                      onClick={item.onSelect}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={[
                        "flex items-center gap-3 w-full px-4 py-2 text-left text-sm transition-colors duration-75",
                        isActive
                          ? "bg-[rgb(var(--surface))] text-[rgb(var(--copy-primary))]"
                          : "text-[rgb(var(--copy-secondary))] hover:bg-[rgb(var(--surface))]/60",
                      ].join(" ")}
                    >
                      {/* Icon */}
                      <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[rgb(var(--surface))] border border-[rgb(var(--border))] flex-shrink-0 text-[rgb(var(--copy-muted))]">
                        {item.icon}
                      </span>

                      {/* Text */}
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium truncate text-[rgb(var(--copy-primary))]">
                          {item.title}
                        </span>
                        <span className="block text-xs truncate text-[rgb(var(--copy-muted))]">
                          {item.subtitle}
                        </span>
                      </span>

                      {/* Keyboard hint for active item */}
                      {isActive && (
                        <span className="flex items-center gap-1 flex-shrink-0 text-[rgb(var(--copy-muted))]">
                          <FaArrowRight size={10} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-[rgb(var(--border))] bg-[rgb(var(--surface))]">
          <div className="flex items-center gap-3 text-[10px] text-[rgb(var(--copy-muted))]">
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center px-1 py-0.5 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded text-[10px]">
                &uarr;
              </kbd>
              <kbd className="inline-flex items-center px-1 py-0.5 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded text-[10px]">
                &darr;
              </kbd>
              <span className="ml-0.5">navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center px-1 py-0.5 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded text-[10px]">
                &crarr;
              </kbd>
              <span className="ml-0.5">select</span>
            </span>
          </div>
          <span className="text-[10px] text-[rgb(var(--copy-muted))]">
            {modKey}+K to toggle
          </span>
        </div>
      </div>

      {/* Keyframe animations injected via style tag */}
      <style>{`
        @keyframes cp-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cp-scale-in {
          from { opacity: 0; transform: scale(0.96) translateY(-8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
}

export default CommandPalette;
