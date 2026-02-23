import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaRegStar,
  FaStar,
  FaPlus,
  FaEllipsisH,
  FaArchive,
  FaChevronLeft,
  FaChevronRight,
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
import { getEmojiFromShortcode } from "../utilities/emoji";
import { countWords, estimateReadTime } from "../utilities/text";
import PageHeader from "../components/PageHeader";
import ConfirmModal from "../components/ConfirmModal";
import EmptyState from "../components/EmptyState";
import {
  SmartDropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
} from "../components/SmartDropdown";

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
  Mood: ApiMood | null;
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
  Mood: { ID: number; Name: string; Emoji: string; Color: string } | null;
  Collections: { ID: number; Name: string; Color: string }[];
  IsFavourite: boolean;
  IsArchived: boolean;
  UpdatedAt: string;
  CreatedAt: string;
  wordCount: number;
  readTime: string;
}

type SortOption = "lastModified" | "created" | "title" | "chapter";

interface ConfirmState {
  isOpen: boolean;
  entry: EntryRow | null;
  actionType: "delete" | "archive" | null;
  isProcessing: boolean;
}

// ─── Loading placeholder ──────────────────────────────────

const LoadingRows: React.FC = () => (
  <div className="flex flex-col divide-y divide-[rgb(var(--border))]">
    {Array.from({ length: 6 }, (_, i) => (
      <div key={i} className="flex items-center gap-4 py-3 px-2 animate-pulse">
        <div className="w-0.5 h-10 rounded-full bg-[rgb(var(--border))]" />
        <div className="flex-1 space-y-2">
          <div
            className="h-4 bg-[rgb(var(--surface))] rounded"
            style={{ width: `${40 + (i * 13) % 35}%` }}
          />
          <div
            className="h-3 bg-[rgb(var(--surface))] rounded"
            style={{ width: `${55 + (i * 7) % 30}%` }}
          />
        </div>
        <div className="h-3 w-16 bg-[rgb(var(--surface))] rounded" />
      </div>
    ))}
  </div>
);

// ─── Entry Row ────────────────────────────────────────────

interface EntryRowProps {
  entry: EntryRow;
  onNavigate: (entry: EntryRow) => void;
  onEdit: (entry: EntryRow) => void;
  onDelete: (entry: EntryRow) => void;
  onArchive: (entry: EntryRow) => void;
  onToggleFavourite: (entry: EntryRow) => void;
  isFavouriting: boolean;
}

const EntryRowItem: React.FC<EntryRowProps> = ({
  entry,
  onNavigate,
  onEdit,
  onDelete,
  onArchive,
  onToggleFavourite,
  isFavouriting,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const chapterColor = entry.Chapter?.Color || "rgb(var(--border))";
  const moodEmoji = entry.Mood?.Emoji ? getEmojiFromShortcode(entry.Mood.Emoji) : "";

  const contentPreview = entry.Content
    ? entry.Content.replace(/[#*_~`>\-\[\]()!]/g, "").slice(0, 140)
    : "";

  return (
    <div
      className="group flex items-start gap-3 py-3 px-2 rounded-md cursor-pointer transition-colors hover:bg-[rgb(var(--surface))]"
      onClick={() => onNavigate(entry)}
    >
      {/* Color bar */}
      <div
        className="w-0.5 min-h-[2.5rem] self-stretch rounded-full flex-shrink-0 mt-0.5"
        style={{ backgroundColor: chapterColor }}
      />

      {/* Content area */}
      <div className="flex-1 min-w-0">
        {/* Title line */}
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-serif font-medium text-[rgb(var(--copy-primary))] truncate">
            {entry.Title || "Untitled"}
          </h3>
          {entry.IsFavourite && (
            <FaStar className="text-[10px] text-[rgb(var(--accent))] flex-shrink-0" />
          )}
          {moodEmoji && (
            <span className="text-xs flex-shrink-0">{moodEmoji}</span>
          )}
        </div>

        {/* Content preview */}
        {contentPreview && (
          <p className="text-xs text-[rgb(var(--copy-muted))] truncate mt-0.5 leading-relaxed">
            {contentPreview}
          </p>
        )}

        {/* Meta: chapter, date, word count */}
        <div className="flex items-center gap-3 mt-1 text-xs text-[rgb(var(--copy-muted))]">
          {entry.Chapter?.Name && (
            <span className="flex items-center gap-1">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: chapterColor }}
              />
              {entry.Chapter.Name}
            </span>
          )}
          <span>{formatDate(entry.UpdatedAt)}</span>
          <span>{entry.wordCount} words</span>
        </div>
      </div>

      {/* Hover actions */}
      <div
        className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onToggleFavourite(entry)}
          disabled={isFavouriting}
          className="p-1.5 rounded hover:bg-[rgb(var(--border))]/50 transition-colors disabled:opacity-50"
          title={entry.IsFavourite ? "Remove from favorites" : "Add to favorites"}
        >
          {entry.IsFavourite ? (
            <FaStar className="text-xs text-[rgb(var(--accent))]" />
          ) : (
            <FaRegStar className="text-xs text-[rgb(var(--copy-muted))]" />
          )}
        </button>

        <SmartDropdown open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownTrigger>
            <button className="p-1.5 rounded hover:bg-[rgb(var(--border))]/50 transition-colors">
              <FaEllipsisH className="text-xs text-[rgb(var(--copy-muted))]" />
            </button>
          </DropdownTrigger>
          <DropdownContent title="Note Actions" align="end">
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

// ─── Pagination ───────────────────────────────────────────

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages: (number | "ellipsis")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "ellipsis") {
      pages.push("ellipsis");
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-1.5 rounded text-[rgb(var(--copy-muted))] hover:bg-[rgb(var(--surface))] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <FaChevronLeft className="text-xs" />
      </button>

      {pages.map((page, idx) =>
        page === "ellipsis" ? (
          <span key={`e-${idx}`} className="px-2 text-xs text-[rgb(var(--copy-muted))]">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              currentPage === page
                ? "bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))]"
                : "text-[rgb(var(--copy-secondary))] hover:bg-[rgb(var(--surface))]"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-1.5 rounded text-[rgb(var(--copy-muted))] hover:bg-[rgb(var(--surface))] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <FaChevronRight className="text-xs" />
      </button>
    </div>
  );
};

// ─── Transform API data ──────────────────────────────────

function transformEntry(apiEntry: ApiEntry): EntryRow {
  const words = countWords(apiEntry.Content);
  return {
    ID: apiEntry.ID,
    Title: apiEntry.Title,
    Content: apiEntry.Content,
    Chapter: apiEntry.Chapter
      ? {
          ID: apiEntry.Chapter.ID,
          Name: apiEntry.Chapter.Name || apiEntry.Chapter.Title || "",
          Color: apiEntry.Chapter.Color,
        }
      : null,
    Mood: apiEntry.Mood
      ? {
          ID: apiEntry.Mood.ID,
          Name: apiEntry.Mood.Name,
          Emoji: apiEntry.Mood.Emoji,
          Color: apiEntry.Mood.Color,
        }
      : null,
    Collections: (apiEntry.Collections || []).map((c) => ({
      ID: c.ID,
      Name: c.Name,
      Color: c.Color,
    })),
    IsFavourite: apiEntry.IsFavourite,
    IsArchived: apiEntry.IsArchived,
    UpdatedAt: apiEntry.UpdatedAt,
    CreatedAt: apiEntry.CreatedAt,
    wordCount: words,
    readTime: estimateReadTime(words),
  };
}

// ─── Main Component ──────────────────────────────────────

const ENTRIES_PER_PAGE = 10;

const RecentEntries: React.FC = () => {
  const navigate = useNavigate();

  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("lastModified");
  const [filterBy, setFilterBy] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [favouritingIds, setFavouritingIds] = useState<Set<number>>(new Set());
  const [confirmModal, setConfirmModal] = useState<ConfirmState>({
    isOpen: false,
    entry: null,
    actionType: null,
    isProcessing: false,
  });

  // ─── Fetch entries ────────────────────────────────────

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await GetAllEntries();
      if (response && Array.isArray(response.data)) {
        const all = response.data.map((e: ApiEntry) => transformEntry(e));
        const active = all.filter((e) => !e.IsArchived);
        setEntries(active);
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

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // ─── Derived data ─────────────────────────────────────

  const uniqueChapters = useMemo(() => {
    const names = entries
      .map((e) => e.Chapter?.Name)
      .filter((n): n is string => Boolean(n));
    return [...new Set(names)];
  }, [entries]);

  const filteredAndSorted = useMemo(() => {
    let result = entries;

    // Search
    if (searchValue.trim()) {
      const q = searchValue.toLowerCase();
      result = result.filter(
        (e) =>
          e.Title?.toLowerCase().includes(q) ||
          e.Content?.toLowerCase().includes(q) ||
          e.Chapter?.Name?.toLowerCase().includes(q) ||
          e.Collections.some((c) => c.Name?.toLowerCase().includes(q))
      );
    }

    // Filter by chapter
    if (filterBy !== "all") {
      result = result.filter((e) => e.Chapter?.Name === filterBy);
    }

    // Sort
    const sorted = [...result];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case "lastModified":
          return new Date(b.UpdatedAt).getTime() - new Date(a.UpdatedAt).getTime();
        case "created":
          return new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime();
        case "title":
          return (a.Title || "").localeCompare(b.Title || "");
        case "chapter":
          return (a.Chapter?.Name || "").localeCompare(b.Chapter?.Name || "");
        default:
          return 0;
      }
    });

    return sorted;
  }, [entries, searchValue, sortBy, filterBy]);

  const totalPages = Math.ceil(filteredAndSorted.length / ENTRIES_PER_PAGE);
  const paginated = filteredAndSorted.slice(
    (currentPage - 1) * ENTRIES_PER_PAGE,
    currentPage * ENTRIES_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, sortBy, filterBy]);

  // ─── Handlers ─────────────────────────────────────────

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNavigate = (entry: EntryRow) => {
    navigate("/note", { state: { entry } });
  };

  const handleEdit = (entry: EntryRow) => {
    navigate("/new-note", { state: { ...entry, update: true } });
  };

  const handleDelete = (entry: EntryRow) => {
    setConfirmModal({ isOpen: true, entry, actionType: "delete", isProcessing: false });
  };

  const handleArchive = (entry: EntryRow) => {
    setConfirmModal({ isOpen: true, entry, actionType: "archive", isProcessing: false });
  };

  const handleToggleFavourite = async (entry: EntryRow) => {
    if (favouritingIds.has(entry.ID)) return;

    setFavouritingIds((prev) => new Set(prev).add(entry.ID));
    const newValue = !entry.IsFavourite;

    try {
      const success = await FavouriteEntry(entry.ID, newValue);
      if (success) {
        setEntries((prev) =>
          prev.map((e) => (e.ID === entry.ID ? { ...e, IsFavourite: newValue } : e))
        );
        toast.success(newValue ? "Added to favorites" : "Removed from favorites");
      } else {
        toast.error("Unable to update favorite status.");
      }
    } catch {
      toast.error("Error updating favorite status.");
    } finally {
      setFavouritingIds((prev) => {
        const next = new Set(prev);
        next.delete(entry.ID);
        return next;
      });
    }
  };

  const confirmAction = async () => {
    const { entry, actionType } = confirmModal;
    if (!entry || !actionType) return;

    setConfirmModal((prev) => ({ ...prev, isProcessing: true }));

    try {
      let success = false;
      if (actionType === "delete") {
        success = await DeleteEntry(entry.ID);
      } else {
        success = await ArchiveEntry(entry.ID, true);
      }

      if (success) {
        toast.success(
          actionType === "delete" ? "Note deleted successfully" : "Note archived successfully"
        );
        fetchEntries();
        setCurrentPage(1);
        setConfirmModal({ isOpen: false, entry: null, actionType: null, isProcessing: false });
      } else {
        toast.error(`Failed to ${actionType} note`);
        setConfirmModal((prev) => ({ ...prev, isProcessing: false }));
      }
    } catch {
      toast.error(`Error ${confirmModal.actionType}ing note`);
      setConfirmModal((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  const cancelAction = () => {
    if (!confirmModal.isProcessing) {
      setConfirmModal({ isOpen: false, entry: null, actionType: null, isProcessing: false });
    }
  };

  // ─── Confirm modal labels ────────────────────────────

  const isDeleteAction = confirmModal.actionType === "delete";
  const modalTitle = isDeleteAction ? "Delete Note" : "Archive Note";
  const modalMessage = isDeleteAction
    ? "Are you sure you want to delete this note? This action cannot be undone."
    : "Are you sure you want to archive this note?";
  const modalConfirmText = isDeleteAction ? "Delete" : "Archive";
  const modalVariant = isDeleteAction ? "danger" : ("warning" as const);

  // ─── Render ───────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <PageHeader
          title="Notes"
          subtitle="Your personal journal"
          action={
            <button
              onClick={() => navigate("/new-note")}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] rounded-md hover:bg-[rgb(var(--cta-active))] transition-colors"
            >
              <FaPlus className="text-xs" />
              New Note
            </button>
          }
        />

        {/* Search + sort/filter controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--copy-muted))] text-xs" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              disabled={isLoading}
              className="w-full pl-8 pr-3 py-2 bg-transparent border border-[rgb(var(--border))] rounded-md text-sm text-[rgb(var(--copy-primary))] placeholder-[rgb(var(--copy-muted))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--cta))] focus:border-[rgb(var(--cta))] transition-colors disabled:opacity-50"
            />
          </div>

          <SmartDropdown>
            <DropdownTrigger>
              <button
                disabled={isLoading}
                className="px-3 py-2 bg-transparent border border-[rgb(var(--border))] rounded-md text-sm text-[rgb(var(--copy-secondary))] hover:border-[rgb(var(--copy-muted))] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <span>
                  {sortBy === "lastModified" && "Latest first"}
                  {sortBy === "created" && "Oldest first"}
                  {sortBy === "title" && "By title"}
                  {sortBy === "chapter" && "By notebook"}
                </span>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 5L6 8L9 5" />
                </svg>
              </button>
            </DropdownTrigger>
            <DropdownContent title="Sort By" align="end">
              <DropdownItem selected={sortBy === "lastModified"} onClick={() => setSortBy("lastModified")}>
                Latest first
              </DropdownItem>
              <DropdownItem selected={sortBy === "created"} onClick={() => setSortBy("created")}>
                Oldest first
              </DropdownItem>
              <DropdownItem selected={sortBy === "title"} onClick={() => setSortBy("title")}>
                By title
              </DropdownItem>
              <DropdownItem selected={sortBy === "chapter"} onClick={() => setSortBy("chapter")}>
                By notebook
              </DropdownItem>
            </DropdownContent>
          </SmartDropdown>

          {uniqueChapters.length > 0 && (
            <SmartDropdown>
              <DropdownTrigger>
                <button
                  disabled={isLoading}
                  className="px-3 py-2 bg-transparent border border-[rgb(var(--border))] rounded-md text-sm text-[rgb(var(--copy-secondary))] hover:border-[rgb(var(--copy-muted))] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <span>{filterBy === "all" ? "All notebooks" : filterBy}</span>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 5L6 8L9 5" />
                  </svg>
                </button>
              </DropdownTrigger>
              <DropdownContent title="Filter by Notebook" align="end">
                <DropdownItem selected={filterBy === "all"} onClick={() => setFilterBy("all")}>
                  All notebooks
                </DropdownItem>
                <DropdownSeparator />
                {uniqueChapters.map((ch) => (
                  <DropdownItem key={ch} selected={filterBy === ch} onClick={() => setFilterBy(ch)}>
                    {ch}
                  </DropdownItem>
                ))}
              </DropdownContent>
            </SmartDropdown>
          )}
        </div>

        {/* Entry list */}
        {isLoading ? (
          <LoadingRows />
        ) : paginated.length > 0 ? (
          <>
            <div className="divide-y divide-[rgb(var(--border))]">
              {paginated.map((entry) => (
                <EntryRowItem
                  key={entry.ID}
                  entry={entry}
                  onNavigate={handleNavigate}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onArchive={handleArchive}
                  onToggleFavourite={handleToggleFavourite}
                  isFavouriting={favouritingIds.has(entry.ID)}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <EmptyState
            title={
              searchValue.trim() || filterBy !== "all"
                ? "No matching notes"
                : "No notes yet"
            }
            description={
              searchValue.trim() || filterBy !== "all"
                ? "Try adjusting your search or filter."
                : "Write your first note to capture your thoughts."
            }
            action={
              !searchValue.trim() && filterBy === "all" ? (
                <button
                  onClick={() => navigate("/new-note")}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] rounded-md hover:bg-[rgb(var(--cta-active))] transition-colors"
                >
                  <FaPlus className="text-xs" />
                  New Note
                </button>
              ) : undefined
            }
          />
        )}
      </div>

      {/* Confirm modal for delete/archive */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={cancelAction}
        onConfirm={confirmAction}
        title={modalTitle}
        message={modalMessage}
        itemName={confirmModal.entry?.Title || ""}
        isProcessing={confirmModal.isProcessing}
        confirmText={modalConfirmText}
        variant={modalVariant}
      />
    </div>
  );
};

export default RecentEntries;
