import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FaPlus,
  FaSearch,
  FaEllipsisH,
  FaStar,
  FaRegStar,
  FaEdit,
  FaArchive,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import {
  GetAllChapter,
  ArchiveChapter,
  DeleteChapter,
  FavouriteChapter,
  FavouriteEntry,
  DeleteEntry,
  ArchiveEntry,
} from "../APIs";
import toast from "react-hot-toast";
import { formatDate } from "../utilities/formatDate";
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

// ── Types ────────────────────────────────────────────────────

interface CollectionTag {
  ID: number;
  Name: string;
  Color: string;
}

interface ChapterEntry {
  ID: number;
  Title: string;
  Content: string;
  Collections: CollectionTag[] | null;
  IsFavourite: boolean;
  IsArchived: boolean;
  UpdatedAt: string;
}

interface ChapterData {
  ID: number;
  Title: string;
  Description: string;
  Color: string;
  Entries: ChapterEntry[];
  Collections: CollectionTag[] | null;
  IsFavourite: boolean;
  IsArchived: boolean;
  UpdatedAt: string;
  CreatedAt: string;
}

type SortOption = "recent" | "oldest" | "title" | "entries";

interface ConfirmState {
  isOpen: boolean;
  type: "delete" | "archive" | "delete-entry" | "archive-entry" | null;
  chapter?: ChapterData | null;
  entry?: ChapterEntry | null;
  chapterId?: number;
  isProcessing: boolean;
}

// ── Skeleton ─────────────────────────────────────────────────

function SkeletonRow({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-4 animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-1 h-10 rounded bg-gray-200 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  );
}

// ── Note sub-row ─────────────────────────────────────────────

function EntryRow({
  entry,
  chapterId,
  onRefresh,
  onConfirm,
}: {
  entry: ChapterEntry;
  chapterId: number;
  onRefresh: () => void;
  onConfirm: (state: ConfirmState) => void;
}) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const isFav = entry.IsFavourite;

  const toggleFav = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (favLoading) return;
    setFavLoading(true);
    try {
      const ok = await FavouriteEntry(entry.ID, !isFav);
      if (ok) {
        toast.success(isFav ? "Removed from favorites" : "Added to favorites");
        onRefresh();
      } else {
        toast.error("Failed to update favorite.");
      }
    } catch {
      toast.error("Error updating favorite.");
    } finally {
      setFavLoading(false);
    }
  };

  const handleEdit = () => {
    setMenuOpen(false);
    navigate("/new-note", {
      state: {
        entry: {
          update: true,
          id: entry.ID,
          title: entry.Title,
          content: entry.Content,
          collection: entry.Collections,
        },
        chapter: { id: chapterId },
      },
    });
  };

  const plainContent = (entry.Content || "").replace(/<[^>]*>/g, "").substring(0, 120);

  return (
    <div className="group/entry flex items-start gap-3 pl-6 pr-4 py-2 hover:bg-[rgb(var(--surface))] rounded transition-colors">
      <span className="text-[rgb(var(--copy-muted))] mt-0.5 text-xs select-none">&#8212;</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[rgb(var(--copy-primary))] truncate">{entry.Title}</span>
          <span className="text-xs text-[rgb(var(--copy-muted))] flex-shrink-0">{formatDate(entry.UpdatedAt)}</span>
        </div>
        {plainContent && (
          <p className="text-xs text-[rgb(var(--copy-muted))] truncate mt-0.5 leading-relaxed">
            {plainContent}
          </p>
        )}
      </div>

      {/* Hover actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover/entry:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={toggleFav}
          disabled={favLoading}
          className="p-1 rounded hover:bg-[rgb(var(--card))] transition-colors disabled:opacity-50"
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          {isFav ? (
            <FaStar className="text-xs text-[rgb(var(--accent))]" />
          ) : (
            <FaRegStar className="text-xs text-[rgb(var(--copy-muted))]" />
          )}
        </button>

        <SmartDropdown open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownTrigger>
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1 rounded hover:bg-[rgb(var(--card))] transition-colors"
              aria-label="Note options"
            >
              <FaEllipsisH className="text-xs text-[rgb(var(--copy-muted))]" />
            </button>
          </DropdownTrigger>
          <DropdownContent title="Note Actions" align="end">
            <DropdownItem onClick={handleEdit}>
              <FaEdit className="text-xs" style={{ color: "rgb(var(--copy-muted))" }} />
              <span>Edit</span>
            </DropdownItem>
            <DropdownItem
              onClick={() => {
                setMenuOpen(false);
                onConfirm({ isOpen: true, type: "archive-entry", entry, chapterId, isProcessing: false });
              }}
            >
              <FaArchive className="text-xs" style={{ color: "rgb(var(--copy-muted))" }} />
              <span>Archive</span>
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem
              destructive
              onClick={() => {
                setMenuOpen(false);
                onConfirm({ isOpen: true, type: "delete-entry", entry, chapterId, isProcessing: false });
              }}
            >
              <FaTrash className="text-xs" />
              <span>Delete</span>
            </DropdownItem>
          </DropdownContent>
        </SmartDropdown>
      </div>
    </div>
  );
}

// ── Notebook row ─────────────────────────────────────────────

function ChapterRow({
  chapter,
  onRefresh,
  onConfirm,
}: {
  chapter: ChapterData;
  onRefresh: () => void;
  onConfirm: (state: ConfirmState) => void;
}) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const isFav = chapter.IsFavourite;
  const entryCount = chapter.Entries?.length ?? 0;
  const visibleEntries = (chapter.Entries || []).filter((e) => !e.IsArchived).slice(0, 2);

  const toggleFav = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (favLoading) return;
    setFavLoading(true);
    try {
      const ok = await FavouriteChapter(chapter.ID, !isFav);
      if (ok) {
        toast.success(isFav ? "Removed from favorites" : "Added to favorites");
        onRefresh();
      } else {
        toast.error("Failed to update favorite.");
      }
    } catch {
      toast.error("Error updating favorite.");
    } finally {
      setFavLoading(false);
    }
  };

  const goToChapter = () => {
    navigate("/notebook", { state: { chapter } });
  };

  const handleAddEntry = () => {
    setMenuOpen(false);
    navigate("/new-note", {
      state: {
        chapter: {
          update: true,
          id: chapter.ID,
          title: chapter.Title,
          color: chapter.Color,
        },
      },
    });
  };

  const handleEdit = () => {
    setMenuOpen(false);
    navigate("/new-notebook", {
      state: {
        edit: true,
        id: chapter.ID,
        title: chapter.Title,
        description: chapter.Description,
        color: chapter.Color,
        entries: chapter.Entries,
        collection: chapter.Collections,
      },
    });
  };

  return (
    <div className="group border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--card))] hover:shadow-sm transition-shadow">
      {/* Main notebook row */}
      <div
        className="flex items-start gap-3 px-4 py-3.5 cursor-pointer"
        onClick={goToChapter}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && goToChapter()}
        aria-label={`View notebook: ${chapter.Title}`}
      >
        {/* Color bar */}
        <div
          className="w-1 self-stretch rounded-full flex-shrink-0"
          style={{ backgroundColor: chapter.Color || "rgb(var(--border))" }}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-serif font-medium text-[rgb(var(--copy-primary))] truncate capitalize">
              {chapter.Title}
            </h3>
            <span className="text-xs text-[rgb(var(--copy-muted))] flex-shrink-0">
              {entryCount} {entryCount === 1 ? "note" : "notes"}
            </span>
            {isFav && <FaStar className="text-xs text-[rgb(var(--accent))] flex-shrink-0" />}
          </div>

          {chapter.Description && (
            <p className="text-sm text-[rgb(var(--copy-muted))] truncate mt-0.5">
              {chapter.Description}
            </p>
          )}

          {/* Tag pills */}
          {chapter.Collections && chapter.Collections.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {chapter.Collections.map((col) => (
                <span
                  key={col.ID}
                  className="px-2 py-0.5 text-[10px] font-medium rounded-full"
                  style={{
                    backgroundColor: col.Color + "20",
                    color: col.Color,
                  }}
                >
                  {col.Name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Hover actions */}
        <div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={toggleFav}
            disabled={favLoading}
            className="p-1.5 rounded hover:bg-[rgb(var(--surface))] transition-colors disabled:opacity-50"
            aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
          >
            {isFav ? (
              <FaStar className="text-sm text-[rgb(var(--accent))]" />
            ) : (
              <FaRegStar className="text-sm text-[rgb(var(--copy-muted))]" />
            )}
          </button>

          <SmartDropdown open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownTrigger>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded hover:bg-[rgb(var(--surface))] transition-colors"
                aria-label="Notebook options"
              >
                <FaEllipsisH className="text-sm text-[rgb(var(--copy-muted))]" />
              </button>
            </DropdownTrigger>
            <DropdownContent title="Notebook Actions" align="end">
              <DropdownItem onClick={handleAddEntry}>
                <FaPlus className="text-xs" style={{ color: "rgb(var(--copy-muted))" }} />
                <span>Add Note</span>
              </DropdownItem>
              <DropdownItem onClick={handleEdit}>
                <FaEdit className="text-xs" style={{ color: "rgb(var(--copy-muted))" }} />
                <span>Edit</span>
              </DropdownItem>
              <DropdownItem
                onClick={() => {
                  setMenuOpen(false);
                  onConfirm({ isOpen: true, type: "archive", chapter, isProcessing: false });
                }}
              >
                <FaArchive className="text-xs" style={{ color: "rgb(var(--copy-muted))" }} />
                <span>Archive</span>
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem
                destructive
                onClick={() => {
                  setMenuOpen(false);
                  onConfirm({ isOpen: true, type: "delete", chapter, isProcessing: false });
                }}
              >
                <FaTrash className="text-xs" />
                <span>Delete</span>
              </DropdownItem>
            </DropdownContent>
          </SmartDropdown>
        </div>
      </div>

      {/* Nested notes */}
      {visibleEntries.length > 0 && (
        <div className="border-t border-[rgb(var(--border))]">
          {visibleEntries.map((entry) => (
            <EntryRow
              key={entry.ID}
              entry={entry}
              chapterId={chapter.ID}
              onRefresh={onRefresh}
              onConfirm={onConfirm}
            />
          ))}
          {entryCount > 2 && (
            <button
              onClick={goToChapter}
              className="w-full text-left pl-9 pr-4 py-1.5 text-xs text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-secondary))] hover:bg-[rgb(var(--surface))] transition-colors"
            >
              + {entryCount - 2} more {entryCount - 2 === 1 ? "note" : "notes"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Pagination ───────────────────────────────────────────────

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded text-sm text-[rgb(var(--copy-muted))] hover:bg-[rgb(var(--surface))] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <FaChevronLeft className="text-xs" />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            currentPage === page
              ? "bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] font-medium"
              : "text-[rgb(var(--copy-secondary))] hover:bg-[rgb(var(--surface))]"
          }`}
          aria-label={`Page ${page}`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded text-sm text-[rgb(var(--copy-muted))] hover:bg-[rgb(var(--surface))] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <FaChevronRight className="text-xs" />
      </button>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────

const CHAPTERS_PER_PAGE = 8;

const SORT_LABELS: Record<SortOption, string> = {
  recent: "Latest",
  oldest: "Oldest",
  title: "Title",
  entries: "Note count",
};

export default function Chapters() {
  const navigate = useNavigate();

  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [archivedCount, setArchivedCount] = useState(0);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [currentPage, setCurrentPage] = useState(1);

  const [confirm, setConfirm] = useState<ConfirmState>({
    isOpen: false,
    type: null,
    isProcessing: false,
  });

  // ── Fetch ────────────────────────────────────────

  const fetchChapters = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await GetAllChapter();
      if (response && Array.isArray(response.data)) {
        const all = response.data as ChapterData[];
        const active = all.filter((c) => !c.IsArchived);
        setArchivedCount(all.length - active.length);
        setChapters(active);
      } else {
        setChapters([]);
      }
    } catch {
      setChapters([]);
      toast.error("Failed to load notebooks.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  // ── Filter + sort ────────────────────────────────

  const filtered = useMemo(() => {
    let result = chapters;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.Title.toLowerCase().includes(q) ||
          (c.Description || "").toLowerCase().includes(q) ||
          (c.Collections || []).some((t) => t.Name.toLowerCase().includes(q))
      );
    }

    return result.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.UpdatedAt).getTime() - new Date(a.UpdatedAt).getTime();
        case "oldest":
          return new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime();
        case "title":
          return a.Title.localeCompare(b.Title);
        case "entries":
          return (b.Entries?.length ?? 0) - (a.Entries?.length ?? 0);
        default:
          return 0;
      }
    });
  }, [chapters, search, sortBy]);

  // ── Pagination ───────────────────────────────────

  const totalPages = Math.ceil(filtered.length / CHAPTERS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * CHAPTERS_PER_PAGE,
    currentPage * CHAPTERS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Reset to page 1 when search/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortBy]);

  // ── Confirm actions ──────────────────────────────

  const closeConfirm = () => {
    if (!confirm.isProcessing) {
      setConfirm({ isOpen: false, type: null, isProcessing: false });
    }
  };

  const handleConfirmAction = async () => {
    setConfirm((prev) => ({ ...prev, isProcessing: true }));

    try {
      switch (confirm.type) {
        case "delete": {
          const ok = await DeleteChapter(confirm.chapter!.ID);
          if (ok) {
            toast.success("Notebook deleted.");
            fetchChapters();
            setCurrentPage(1);
          } else {
            toast.error("Failed to delete notebook.");
          }
          break;
        }
        case "archive": {
          const ok = await ArchiveChapter(confirm.chapter!.ID, !confirm.chapter!.IsArchived);
          if (ok) {
            toast.success("Notebook archived.");
            fetchChapters();
            setCurrentPage(1);
          } else {
            toast.error("Failed to archive notebook.");
          }
          break;
        }
        case "delete-entry": {
          const ok = await DeleteEntry(confirm.entry!.ID);
          if (ok) {
            toast.success("Note deleted.");
            fetchChapters();
          } else {
            toast.error("Failed to delete note.");
          }
          break;
        }
        case "archive-entry": {
          const ok = await ArchiveEntry(confirm.entry!.ID, !confirm.entry!.IsArchived);
          if (ok) {
            toast.success("Note archived.");
            fetchChapters();
          } else {
            toast.error("Failed to archive note.");
          }
          break;
        }
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setConfirm({ isOpen: false, type: null, isProcessing: false });
    }
  };

  // ── Confirm modal props ──────────────────────────

  const confirmModalProps = useMemo(() => {
    const isDelete = confirm.type === "delete" || confirm.type === "delete-entry";
    const isEntry = confirm.type === "delete-entry" || confirm.type === "archive-entry";
    const itemName = isEntry ? confirm.entry?.Title : confirm.chapter?.Title;

    const titles: Record<string, string> = {
      delete: "Delete Notebook",
      archive: "Archive Notebook",
      "delete-entry": "Delete Note",
      "archive-entry": "Archive Note",
    };

    const messages: Record<string, string> = {
      delete: "This notebook and its notes will be permanently deleted.",
      archive: "This notebook will be moved to your archives.",
      "delete-entry": "This note will be permanently deleted.",
      "archive-entry": "This note will be moved to your archives.",
    };

    return {
      title: confirm.type ? titles[confirm.type] : "",
      message: confirm.type ? messages[confirm.type] : "",
      itemName: itemName || "",
      confirmText: isDelete ? "Delete" : "Archive",
      variant: (isDelete ? "danger" : "warning") as "danger" | "warning",
    };
  }, [confirm]);

  // ── Render ───────────────────────────────────────

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <PageHeader
          title="Notebooks"
          subtitle={
            !isLoading && chapters.length > 0
              ? `${chapters.length} ${chapters.length === 1 ? "notebook" : "notebooks"}${
                  archivedCount > 0 ? ` \u00B7 ${archivedCount} archived` : ""
                }`
              : undefined
          }
          action={
            <button
              onClick={() => navigate("/new-notebook")}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] rounded-md hover:bg-[rgb(var(--cta-active))] transition-colors"
            >
              <FaPlus className="text-xs" />
              New Notebook
            </button>
          }
        />

        {/* Search + sort row */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--copy-muted))] text-xs" />
            <input
              type="text"
              placeholder="Search notebooks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={isLoading}
              className="w-full pl-8 pr-3 py-2 text-sm bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-md text-[rgb(var(--copy-primary))] placeholder-[rgb(var(--copy-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--cta))] focus:border-transparent transition-all disabled:opacity-50"
              aria-label="Search notebooks"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            disabled={isLoading}
            className="px-3 py-2 text-sm bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-md text-[rgb(var(--copy-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--cta))] focus:border-transparent appearance-none cursor-pointer disabled:opacity-50"
            aria-label="Sort notebooks"
          >
            {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
              <option key={key} value={key}>
                {SORT_LABELS[key]}
              </option>
            ))}
          </select>
        </div>

        {/* Archived link */}
        {archivedCount > 0 && (
          <div className="mb-4 text-sm text-[rgb(var(--copy-muted))]">
            <Link
              to="/archives"
              className="hover:text-[rgb(var(--copy-secondary))] underline underline-offset-2 transition-colors"
            >
              {archivedCount} archived {archivedCount === 1 ? "notebook" : "notebooks"}
            </Link>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, i) => (
              <SkeletonRow key={i} delay={i * 80} />
            ))}
          </div>
        ) : paginated.length > 0 ? (
          <>
            <div className="space-y-3">
              {paginated.map((chapter) => (
                <ChapterRow
                  key={chapter.ID}
                  chapter={chapter}
                  onRefresh={fetchChapters}
                  onConfirm={setConfirm}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />

            {/* Result summary */}
            {search.trim() && filtered.length !== chapters.length && (
              <p className="text-center text-xs text-[rgb(var(--copy-muted))] mt-4">
                Showing {filtered.length} of {chapters.length} notebooks
              </p>
            )}
          </>
        ) : (
          <EmptyState
            title={search.trim() ? "No matching notebooks" : "No notebooks yet"}
            description={
              search.trim()
                ? "Try adjusting your search to find what you're looking for."
                : "Start creating your first notebook to organize your notes."
            }
            action={
              !search.trim() ? (
                <button
                  onClick={() => navigate("/new-notebook")}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] rounded-md hover:bg-[rgb(var(--cta-active))] transition-colors"
                >
                  <FaPlus className="text-xs" />
                  Create a notebook
                </button>
              ) : undefined
            }
          />
        )}
      </div>

      {/* Confirm modal */}
      <ConfirmModal
        isOpen={confirm.isOpen}
        onClose={closeConfirm}
        onConfirm={handleConfirmAction}
        title={confirmModalProps.title}
        message={confirmModalProps.message}
        itemName={confirmModalProps.itemName}
        isProcessing={confirm.isProcessing}
        confirmText={confirmModalProps.confirmText}
        variant={confirmModalProps.variant}
      />
    </div>
  );
}
