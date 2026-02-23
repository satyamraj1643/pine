import React, { useState, useEffect, useRef, useMemo } from "react";
import emojiData from "emoji-datasource/emoji.json";
import { CreateMood, GetAllMood, DeleteMood } from "../APIs";
import { formatDate } from "../utilities/formatDate";
import PageHeader from "../components/PageHeader";
import ConfirmModal from "../components/ConfirmModal";
import EmptyState from "../components/EmptyState";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────

interface MoodData {
  ID: number;
  Name: string;
  Emoji: string;
  Color: string;
  CreatedAt: string;
}

interface EmojiOption {
  id: string;
  emoji: string;
  label: string;
  category: string;
  short_names: string[];
}

// ─── Constants ────────────────────────────────────────────

const PRESET_COLORS = [
  "#f4a261",
  "#10b981",
  "#3b82f6",
  "#a855f7",
  "#ef4444",
  "#6b7280",
  "#ec4899",
  "#f59e0b",
];

// ─── Emoji helpers ────────────────────────────────────────

const charFromUtf16 = (utf16: string): string =>
  String.fromCodePoint(
    ...utf16.split("-").map((u) => parseInt(u, 16))
  );

const emojiOptions: EmojiOption[] = (emojiData as any[])
  .filter((e) => !e.obsoleted_by)
  .map((e) => ({
    id: e.short_name,
    emoji: charFromUtf16(e.unified),
    label:
      (e.name?.charAt(0)?.toUpperCase() ?? "") +
      (e.name?.slice(1)?.toLowerCase() ?? ""),
    category: e.category,
    short_names: e.short_names,
  }));

const emojiCategories = [...new Set(emojiOptions.map((e) => e.category))].map(
  (category) => ({
    category,
    emojis: emojiOptions.filter((e) => e.category === category),
  })
);

function getEmoji(shortcode: string): string {
  return emojiOptions.find((e) => e.id === shortcode)?.emoji ?? "😊";
}

// ─── Loading spinner ──────────────────────────────────────

function LoadingSpinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// ─── Skeleton loader ──────────────────────────────────────

function MoodSkeleton() {
  return (
    <div className="rounded-lg bg-[rgb(var(--card))] border border-[rgb(var(--border))] p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-[rgb(var(--surface))]" />
        <div className="flex-1">
          <div className="h-4 bg-[rgb(var(--surface))] rounded w-20 mb-1.5" />
          <div className="h-3 bg-[rgb(var(--surface))] rounded w-14" />
        </div>
      </div>
    </div>
  );
}

// ─── Emoji Palette Modal ──────────────────────────────────

interface EmojiPaletteProps {
  onSelect: (id: string) => void;
  onClose: () => void;
  selectedEmojiId: string;
}

function EmojiPalette({ onSelect, onClose, selectedEmojiId }: EmojiPaletteProps) {
  const [search, setSearch] = useState("");
  const paletteRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return emojiCategories;
    return emojiCategories
      .map((cat) => ({
        ...cat,
        emojis: cat.emojis.filter((e) =>
          [e.label?.toLowerCase(), ...e.short_names.map((n) => n?.toLowerCase())].some(
            (s) => s?.includes(term)
          )
        ),
      }))
      .filter((cat) => cat.emojis.length > 0);
  }, [search]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div
        ref={paletteRef}
        className="bg-[rgb(var(--card))] rounded-lg border border-[rgb(var(--border))] shadow-lg max-w-md w-full mx-4 max-h-[70vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[rgb(var(--border))]">
          <h3 className="text-sm font-semibold text-[rgb(var(--copy-primary))]">
            Pick an emoji
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[rgb(var(--surface))] transition-colors text-[rgb(var(--copy-muted))]"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-3 pb-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search emojis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="w-full px-3 py-1.5 text-sm bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-md text-[rgb(var(--copy-primary))] placeholder-[rgb(var(--copy-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--cta))] focus:border-transparent"
          />
        </div>

        {/* Emoji grid */}
        <div className="flex-1 overflow-y-auto px-4 pb-3">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-[rgb(var(--copy-muted))] py-8">
              No emojis found.
            </p>
          ) : (
            filtered.map((cat) => (
              <div key={cat.category} className="mb-3">
                <p className="text-xs font-medium text-[rgb(var(--copy-muted))] mb-1.5 capitalize">
                  {cat.category}
                </p>
                <div className="grid grid-cols-8 gap-0.5">
                  {cat.emojis.map((em) => (
                    <button
                      key={em.id}
                      onClick={() => {
                        onSelect(em.id);
                        onClose();
                      }}
                      className={`p-1.5 rounded text-lg hover:bg-[rgb(var(--surface))] transition-colors ${
                        selectedEmojiId === em.id
                          ? "bg-[rgb(var(--surface))] ring-1 ring-[rgb(var(--cta))]"
                          : ""
                      }`}
                      title={em.label}
                      aria-label={em.label}
                    >
                      {em.emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Mood grid item ───────────────────────────────────────

interface MoodItemProps {
  mood: MoodData;
  onDelete: (mood: MoodData) => void;
}

function MoodItem({ mood, onDelete }: MoodItemProps) {
  const emoji = getEmoji(mood.Emoji);

  return (
    <div className="group relative rounded-lg bg-[rgb(var(--card))] border border-[rgb(var(--border))] p-4 hover:border-[rgb(var(--copy-muted))] transition-colors">
      {/* Delete button - visible on hover */}
      <button
        onClick={() => onDelete(mood)}
        className="absolute top-2.5 right-2.5 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[rgb(var(--surface))] transition-all text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--error,239_68_68))]"
        aria-label={`Delete ${mood.Name}`}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Content */}
      <div className="flex items-center gap-3">
        <span className="text-2xl leading-none flex-shrink-0">{emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-[rgb(var(--copy-primary))] capitalize truncate">
              {mood.Name}
            </h3>
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: mood.Color }}
              aria-label={`Color: ${mood.Color}`}
            />
          </div>
          <p className="text-xs text-[rgb(var(--copy-muted))] mt-0.5">
            {formatDate(mood.CreatedAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────

export default function Mood() {
  const [moods, setMoods] = useState<MoodData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(emojiOptions[0]?.id ?? "grinning");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [isCustomColor, setIsCustomColor] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Search & sort
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "recent">("name");

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<MoodData | null>(null);

  const colorInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch moods ──

  const fetchMoods = async () => {
    try {
      setIsLoading(true);
      const response = await GetAllMood();
      if (response.fetched) {
        setMoods(response.data ?? []);
      } else {
        toast.error("Failed to fetch moods.");
      }
    } catch {
      toast.error("Error fetching moods.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMoods();
  }, []);

  // ── Filtered & sorted ──

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    const list = term
      ? moods.filter((m) => m.Name?.toLowerCase().includes(term))
      : moods;

    return [...list].sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime();
      }
      return (a.Name ?? "").localeCompare(b.Name ?? "");
    });
  }, [moods, search, sortBy]);

  // ── Create mood ──

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed || isCreating) return;

    try {
      setIsCreating(true);
      const created = await CreateMood({ name: trimmed, emoji, color });
      if (created === true) {
        toast.success(`"${trimmed}" created`);
        setName("");
        setEmoji(emojiOptions[0]?.id ?? "grinning");
        setColor(PRESET_COLORS[0]);
        setIsCustomColor(false);
        fetchMoods();
      } else {
        toast.error(`Failed to create "${trimmed}".`);
      }
    } catch {
      toast.error(`Error creating "${trimmed}".`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name.trim() && !isCreating) {
      handleCreate();
    }
  };

  // ── Delete mood ──

  const confirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;

    try {
      setIsDeleting(true);
      const deleted = await DeleteMood(deleteTarget.ID);
      if (deleted) {
        toast.success(`"${deleteTarget.Name}" deleted`);
        await fetchMoods();
      } else {
        toast.error(`Failed to delete "${deleteTarget.Name}".`);
      }
    } catch {
      toast.error(`Error deleting "${deleteTarget.Name}".`);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // ── Render ──

  const currentEmoji = getEmoji(emoji);

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <PageHeader
          title="Moods"
          subtitle="Track how you feel with custom moods."
        />

        {/* ── Create form ── */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Name input */}
            <input
              type="text"
              placeholder="New mood name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isCreating}
              className="flex-1 w-full sm:w-auto px-3 py-2 text-sm bg-transparent border border-[rgb(var(--border))] rounded-md text-[rgb(var(--copy-primary))] placeholder-[rgb(var(--copy-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--cta))] focus:border-transparent disabled:opacity-50 transition-colors"
            />

            {/* Emoji picker trigger */}
            <button
              onClick={() => setShowEmojiPicker(true)}
              disabled={isCreating}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-[rgb(var(--border))] rounded-md hover:bg-[rgb(var(--surface))] transition-colors disabled:opacity-50"
              aria-label="Select emoji"
            >
              <span className="text-lg leading-none">{currentEmoji}</span>
              <span className="text-xs text-[rgb(var(--copy-muted))]">Emoji</span>
            </button>

            {/* Color swatches */}
            <div className="flex items-center gap-1.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => { setColor(c); setIsCustomColor(false); }}
                  disabled={isCreating}
                  className={`w-6 h-6 rounded-full transition-transform hover:scale-110 disabled:opacity-50 ${
                    !isCustomColor && color === c
                      ? "ring-2 ring-[rgb(var(--cta))] ring-offset-1 ring-offset-[rgb(var(--background))]"
                      : ""
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
              {/* Custom color */}
              <div className="relative">
                <input
                  ref={colorInputRef}
                  type="color"
                  value={color}
                  onChange={(e) => { setColor(e.target.value); setIsCustomColor(true); }}
                  disabled={isCreating}
                  className="absolute inset-0 w-6 h-6 opacity-0 cursor-pointer"
                  tabIndex={-1}
                />
                <button
                  onClick={() => colorInputRef.current?.click()}
                  disabled={isCreating}
                  className={`w-6 h-6 rounded-full border border-dashed border-[rgb(var(--copy-muted))] flex items-center justify-center text-[rgb(var(--copy-muted))] hover:scale-110 transition-transform disabled:opacity-50 ${
                    isCustomColor
                      ? "ring-2 ring-[rgb(var(--cta))] ring-offset-1 ring-offset-[rgb(var(--background))]"
                      : ""
                  }`}
                  style={isCustomColor ? { backgroundColor: color, borderStyle: "solid", borderColor: color } : {}}
                  aria-label="Choose custom color"
                >
                  {!isCustomColor && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M5 2v6M2 5h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Add button */}
            <button
              onClick={handleCreate}
              disabled={!name.trim() || isCreating}
              className="px-4 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: name.trim() && !isCreating ? "rgb(var(--cta))" : "rgb(var(--surface))",
                color: name.trim() && !isCreating ? "rgb(var(--cta-text))" : "rgb(var(--copy-muted))",
              }}
            >
              {isCreating ? (
                <span className="flex items-center gap-1.5">
                  <LoadingSpinner className="h-3.5 w-3.5" />
                  Adding...
                </span>
              ) : (
                "Add"
              )}
            </button>
          </div>
        </div>

        {/* ── Search & sort ── */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[rgb(var(--copy-muted))]"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
            >
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-transparent border border-[rgb(var(--border))] rounded-md text-[rgb(var(--copy-primary))] placeholder-[rgb(var(--copy-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--cta))] focus:border-transparent transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-[rgb(var(--surface))] text-[rgb(var(--copy-muted))]"
                aria-label="Clear search"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M8 2L2 8M2 2l6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-center rounded-md border border-[rgb(var(--border))] overflow-hidden text-xs">
            <button
              onClick={() => setSortBy("name")}
              className={`px-3 py-1.5 transition-colors ${
                sortBy === "name"
                  ? "bg-[rgb(var(--surface))] text-[rgb(var(--copy-primary))] font-medium"
                  : "text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-secondary))]"
              }`}
            >
              A–Z
            </button>
            <button
              onClick={() => setSortBy("recent")}
              className={`px-3 py-1.5 transition-colors border-l border-[rgb(var(--border))] ${
                sortBy === "recent"
                  ? "bg-[rgb(var(--surface))] text-[rgb(var(--copy-primary))] font-medium"
                  : "text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-secondary))]"
              }`}
            >
              Recent
            </button>
          </div>
        </div>

        {/* ── Mood grid ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <MoodSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((mood) => (
              <MoodItem
                key={mood.ID}
                mood={mood}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={search ? "No moods match your search" : "No moods yet"}
            description={
              search
                ? "Try a different search term."
                : "Create your first mood above to get started."
            }
          />
        )}

        {/* ── Count ── */}
        {!isLoading && filtered.length > 0 && (
          <p className="text-center text-xs text-[rgb(var(--copy-muted))] mt-6">
            {filtered.length} {filtered.length === 1 ? "mood" : "moods"}
            {search && moods.length !== filtered.length && ` of ${moods.length}`}
          </p>
        )}

        {/* ── Delete confirm modal ── */}
        <ConfirmModal
          isOpen={deleteTarget !== null}
          onClose={() => !isDeleting && setDeleteTarget(null)}
          onConfirm={confirmDelete}
          title="Delete mood"
          message="This action cannot be undone. Are you sure?"
          itemName={deleteTarget?.Name ?? ""}
          isProcessing={isDeleting}
          confirmText="Delete"
          variant="danger"
        />

        {/* ── Emoji palette modal ── */}
        {showEmojiPicker && (
          <EmojiPalette
            onSelect={setEmoji}
            onClose={() => setShowEmojiPicker(false)}
            selectedEmojiId={emoji}
          />
        )}
      </div>
    </div>
  );
}
