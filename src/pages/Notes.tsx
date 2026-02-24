import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaRegStar,
  FaStar,
  FaEllipsisH,
  FaArchive,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  DeleteEntry,
  FavouriteEntry,
  GetAllEntries,
  ArchiveEntry,
} from "../APIs";
import toast from "react-hot-toast";

import { formatDate } from "../utilities/formatDate";
import { countWords, estimateReadTime, stripHtml } from "../utilities/text";
import EmptyState from "../components/EmptyState";
import {
  SmartDropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
} from "../components/SmartDropdown";
import ConfirmModal from "../components/ConfirmModal";

// ─── Types ────────────────────────────────────────────────

interface ApiChapter {
  ID: number;
  Name: string;
  Title?: string;
  Color: string;
}
interface ApiMood {
  ID: number;
  Name: string;
  Emoji: string;
  Color: string;
}
interface ApiCollection {
  ID: number;
  Name: string;
  Color: string;
}
interface ApiEntry {
  ID: number;
  Title: string;
  Content: string;
  Chapter: ApiChapter | null;
  Moods: ApiMood[] | null;
  Collections: ApiCollection[] | null;
  IsFavourite: boolean;
  IsArchived: boolean;
  UpdatedAt: string;
  CreatedAt: string;
}
interface EntryRow {
  ID: number;
  Title: string;
  Content: string;
  Chapter: { ID: number; Name: string; Color: string } | null;
  Moods: { ID: number; Name: string; Emoji: string; Color: string }[];
  Collections: { ID: number; Name: string; Color: string }[];
  IsFavourite: boolean;
  IsArchived: boolean;
  UpdatedAt: string;
  CreatedAt: string;
  wordCount: number;
  readTime: string;
}
type SortOption = "lastModified" | "created" | "title";

// ─── Skeleton ─────────────────────────────────────────────

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-1">
    {Array.from({ length: 8 }, (_, i) => (
      <div
        key={i}
        className="flex items-center gap-3 py-2.5 px-3 animate-pulse"
        style={{ animationDelay: `${i * 50}ms` }}
      >
        <div className="h-4 bg-[rgb(var(--surface))] rounded w-1/3" />
        <div className="h-3 bg-[rgb(var(--surface))] rounded w-16 ml-auto" />
      </div>
    ))}
  </div>
);

// ─── Row ──────────────────────────────────────────────────

const NoteRow: React.FC<{
  entry: EntryRow;
  onNavigate: (e: EntryRow) => void;
  onEdit: (e: EntryRow) => void;
  onDelete: (e: EntryRow) => void;
  onArchive: (e: EntryRow) => void;
  onToggleFav: (e: EntryRow) => void;
}> = ({ entry, onNavigate, onEdit, onDelete, onArchive, onToggleFav }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="group flex items-center gap-3 py-2 px-3 -mx-3 rounded-lg cursor-pointer hover:bg-[rgb(var(--surface))] transition-colors"
      onClick={() => onNavigate(entry)}
    >
      {/* Page icon */}
      <span className="w-5 text-center text-sm flex-shrink-0">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="text-[rgb(var(--copy-muted))] inline"
        >
          <path
            d="M4 2h8a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M5.5 5h5M5.5 7.5h3.5"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      </span>

      {/* Title */}
      <span className="flex-1 min-w-0 text-sm text-[rgb(var(--copy-primary))] truncate">
        {entry.Title || "Untitled"}
      </span>

      {/* Fav star (always visible if faved, hover otherwise) */}
      {entry.IsFavourite && (
        <FaStar className="text-[10px] text-[rgb(var(--accent))] flex-shrink-0" />
      )}

      {/* Notebook name */}
      {entry.Chapter?.Name && (
        <span className="text-xs text-[rgb(var(--copy-muted))] flex-shrink-0 max-w-[100px] truncate">
          {entry.Chapter.Name}
        </span>
      )}

      {/* Date */}
      <span className="text-xs text-[rgb(var(--copy-muted))] flex-shrink-0 w-16 text-right">
        {formatDate(entry.UpdatedAt)}
      </span>

      {/* Hover actions */}
      <div
        className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onToggleFav(entry)}
          className="p-1 rounded hover:bg-[rgb(var(--border))]/50 transition-colors"
          aria-label={entry.IsFavourite ? "Remove from favorites" : "Add to favorites"}
        >
          {entry.IsFavourite ? (
            <FaStar className="text-[10px] text-[rgb(var(--accent))]" />
          ) : (
            <FaRegStar className="text-[10px] text-[rgb(var(--copy-muted))]" />
          )}
        </button>
        <SmartDropdown open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownTrigger>
            <button className="p-1 rounded hover:bg-[rgb(var(--border))]/50 transition-colors" aria-label="More actions">
              <FaEllipsisH className="text-[10px] text-[rgb(var(--copy-muted))]" />
            </button>
          </DropdownTrigger>
          <DropdownContent title="Actions" align="end">
            <DropdownItem onClick={() => onEdit(entry)}>
              <FaEdit className="text-xs" style={{ color: "rgb(var(--copy-muted))" }} />
              <span>Edit</span>
            </DropdownItem>
            <DropdownItem onClick={() => onArchive(entry)}>
              <FaArchive className="text-xs" style={{ color: "rgb(var(--copy-muted))" }} />
              <span>Archive</span>
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem destructive onClick={() => onDelete(entry)}>
              <FaTrash className="text-xs" />
              <span>Delete</span>
            </DropdownItem>
          </DropdownContent>
        </SmartDropdown>
      </div>
    </div>
  );
};

// ─── Transform ────────────────────────────────────────────

function transformEntry(api: ApiEntry): EntryRow {
  const words = countWords(api.Content);
  return {
    ID: api.ID,
    Title: api.Title,
    Content: api.Content,
    Chapter: api.Chapter
      ? { ID: api.Chapter.ID, Name: api.Chapter.Name || api.Chapter.Title || "", Color: api.Chapter.Color }
      : null,
    Moods: (api.Moods || []).map((m) => ({ ID: m.ID, Name: m.Name, Emoji: m.Emoji, Color: m.Color })),
    Collections: (api.Collections || []).map((c) => ({ ID: c.ID, Name: c.Name, Color: c.Color })),
    IsFavourite: api.IsFavourite,
    IsArchived: api.IsArchived,
    UpdatedAt: api.UpdatedAt,
    CreatedAt: api.CreatedAt,
    wordCount: words,
    readTime: estimateReadTime(words),
  };
}

// ─── Main ─────────────────────────────────────────────────

const RecentEntries: React.FC = () => {
  const navigate = useNavigate();

  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("lastModified");
  const [showAll, setShowAll] = useState(false);
  const [favouritingIds, setFavouritingIds] = useState<Set<number>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<EntryRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await GetAllEntries();
      if (res && Array.isArray(res.data)) {
        setEntries(res.data.map((e: ApiEntry) => transformEntry(e)).filter((e: EntryRow) => !e.IsArchived));
      } else {
        setEntries([]);
      }
    } catch {
      setEntries([]);
      toast.error("Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  // ─── Derived ─────────────────────────────────────────

  const filtered = useMemo(() => {
    let result = entries;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.Title?.toLowerCase().includes(q) ||
          stripHtml(e.Content)?.toLowerCase().includes(q) ||
          e.Chapter?.Name?.toLowerCase().includes(q)
      );
    }
    const sorted = [...result];
    sorted.sort((a, b) => {
      if (sortBy === "title") return (a.Title || "").localeCompare(b.Title || "");
      if (sortBy === "created") return new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime();
      return new Date(b.UpdatedAt).getTime() - new Date(a.UpdatedAt).getTime();
    });
    return sorted;
  }, [entries, search, sortBy]);

  const INITIAL_COUNT = 15;
  const visible = showAll || search.trim() ? filtered : filtered.slice(0, INITIAL_COUNT);
  const hasMore = !showAll && !search.trim() && filtered.length > INITIAL_COUNT;

  // ─── Handlers ────────────────────────────────────────

  const handleNavigate = (e: EntryRow) => navigate(`/note?id=${e.ID}`, { state: { entry: e } });
  const handleEdit = (e: EntryRow) => navigate("/new-note", { state: { ...e, update: true } });
  const handleDeleteClick = (e: EntryRow) => setDeleteTarget(e);
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const ok = await DeleteEntry(deleteTarget.ID);
    setIsDeleting(false);
    if (ok) { toast.success("Note deleted"); setDeleteTarget(null); fetchEntries(); }
    else toast.error("Failed to delete");
  };
  const handleArchive = async (e: EntryRow) => {
    const ok = await ArchiveEntry(e.ID, true);
    if (ok) { toast.success("Note archived"); fetchEntries(); }
    else toast.error("Failed to archive");
  };

  const handleToggleFav = async (entry: EntryRow) => {
    if (favouritingIds.has(entry.ID)) return;
    setFavouritingIds((p) => new Set(p).add(entry.ID));
    const newVal = !entry.IsFavourite;
    try {
      const ok = await FavouriteEntry(entry.ID, newVal);
      if (ok) {
        setEntries((p) => p.map((e) => (e.ID === entry.ID ? { ...e, IsFavourite: newVal } : e)));
        toast.success(newVal ? "Added to favorites" : "Removed from favorites");
      } else toast.error("Failed to update");
    } catch { toast.error("Error updating"); }
    finally {
      setFavouritingIds((p) => { const n = new Set(p); n.delete(entry.ID); return n; });
    }
  };

  // ─── Render ──────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* Header */}
        <div className="flex items-baseline justify-between mb-8">
          <h1 className="text-xl font-semibold text-[rgb(var(--copy-primary))]">
            Notes
            {!isLoading && entries.length > 0 && (
              <span className="text-sm font-normal text-[rgb(var(--copy-muted))] ml-2">{entries.length}</span>
            )}
          </h1>
          <button
            onClick={() => navigate("/new-note")}
            className="p-1 rounded-md text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-secondary))] hover:bg-[rgb(var(--surface))] transition-colors"
            aria-label="Create new note"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>

        {/* Search + sort */}
        {!isLoading && entries.length > 3 && (
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--copy-muted))] text-[11px]" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-transparent border border-[rgb(var(--border))] rounded-lg text-sm text-[rgb(var(--copy-primary))] placeholder-[rgb(var(--copy-muted))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--cta))] transition-colors"
              />
            </div>
            <SmartDropdown>
              <DropdownTrigger>
                <button className="px-2.5 py-1.5 border border-[rgb(var(--border))] rounded-lg text-xs text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-secondary))] transition-colors flex items-center gap-1">
                  {sortBy === "lastModified" ? "Recent" : sortBy === "created" ? "Oldest" : "A-Z"}
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 5L6 8L9 5" /></svg>
                </button>
              </DropdownTrigger>
              <DropdownContent title="Sort" align="end">
                <DropdownItem selected={sortBy === "lastModified"} onClick={() => setSortBy("lastModified")}>Recent</DropdownItem>
                <DropdownItem selected={sortBy === "created"} onClick={() => setSortBy("created")}>Oldest</DropdownItem>
                <DropdownItem selected={sortBy === "title"} onClick={() => setSortBy("title")}>A-Z</DropdownItem>
              </DropdownContent>
            </SmartDropdown>
          </div>
        )}

        {/* List */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : visible.length > 0 ? (
          <div>
            {visible.map((entry) => (
              <NoteRow
                key={entry.ID}
                entry={entry}
                onNavigate={handleNavigate}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onArchive={handleArchive}
                onToggleFav={handleToggleFav}
              />
            ))}
            {hasMore && (
              <button
                onClick={() => setShowAll(true)}
                className="w-full py-3 mt-2 text-sm text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-secondary))] transition-colors"
              >
                Show all {filtered.length} notes
              </button>
            )}
          </div>
        ) : (
          <EmptyState
            title={search.trim() ? "No matching notes" : "No notes yet"}
            description={search.trim() ? "Try a different search." : "Start writing to capture your thoughts."}
            action={
              !search.trim() ? (
                <button
                  onClick={() => navigate("/new-note")}
                  className="flex items-center gap-1.5 text-sm text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-secondary))] transition-colors mt-2"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  Write your first note
                </button>
              ) : undefined
            }
          />
        )}
        <ConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete note"
          message="This action cannot be undone. The note will be permanently deleted."
          itemName={deleteTarget?.Title || "Untitled"}
          isProcessing={isDeleting}
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </div>
  );
};

export default RecentEntries;
