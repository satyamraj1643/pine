import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  FaEllipsisH,
  FaStar,
  FaRegStar,
  FaEdit,
  FaTrash,
  FaArchive,
  FaSearch,
} from "react-icons/fa";
import toast from "react-hot-toast";
import {
  DeleteEntry,
  FavouriteEntry,
  ArchiveEntry,
  GetAllChapter,
} from "../APIs";
import { countWords, estimateReadTime, stripHtml } from "../utilities/text";
import { formatDate } from "../utilities/formatDate";
import {
  SmartDropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
} from "../components/SmartDropdown";
import ConfirmModal from "../components/ConfirmModal";

// ─── Normalize ───────────────────────────────────────────

function normEntry(obj: any) {
  if (!obj) return null;
  const content = obj.Content ?? obj.content ?? "";
  const words = countWords(content);
  return {
    id: obj.ID ?? obj.id,
    title: obj.Title ?? obj.title ?? "Untitled",
    content,
    isFavourite: obj.IsFavourite ?? obj.is_favourite ?? obj.isFavourite ?? false,
    isArchived: obj.IsArchived ?? obj.is_archived ?? obj.isArchived ?? false,
    updatedAt: obj.UpdatedAt ?? obj.updated_at ?? obj.updatedAt ?? "",
    collections: obj.Collections ?? obj.collections ?? [],
    wordCount: words,
    readTime: estimateReadTime(words),
    _raw: obj,
  };
}

function normChapter(obj: any) {
  if (!obj) return null;
  return {
    id: obj.ID ?? obj.id,
    title: obj.Title ?? obj.title ?? "",
    description: obj.Description ?? obj.description ?? "",
    color: obj.Color ?? obj.color ?? "",
    entries: (obj.Entries ?? obj.entries ?? []).map(normEntry).filter(Boolean),
    collections: obj.Collections ?? obj.collections ?? [],
    isFavourite: obj.IsFavourite ?? obj.is_favourite ?? obj.isFavourite ?? false,
  };
}

// ─── Skeleton ────────────────────────────────────────────

const Skeleton = () => (
  <div className="min-h-screen bg-[rgb(var(--background))]">
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-[rgb(var(--surface))] rounded w-20" />
        <div className="h-7 bg-[rgb(var(--surface))] rounded w-40" />
        <div className="h-4 bg-[rgb(var(--surface))] rounded w-16 mt-1" />
        <div className="space-y-1 mt-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 px-3">
              <div className="h-4 bg-[rgb(var(--surface))] rounded w-1/3" />
              <div className="h-3 bg-[rgb(var(--surface))] rounded w-14 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ─── Note Row ────────────────────────────────────────────

const NoteRow = ({
  entry,
  onView,
  onEdit,
  onDelete,
  onArchive,
  onToggleFav,
}: {
  entry: any;
  onView: (e: any) => void;
  onEdit: (e: any) => void;
  onDelete: (e: any) => void;
  onArchive: (e: any) => void;
  onToggleFav: (e: any) => void;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="group flex items-center gap-3 py-2 px-3 -mx-3 rounded-lg cursor-pointer hover:bg-[rgb(var(--surface))] transition-colors"
      onClick={() => onView(entry)}
    >
      {/* Page icon */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className="text-[rgb(var(--copy-muted))] flex-shrink-0"
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

      {/* Title */}
      <span className="flex-1 min-w-0 text-sm text-[rgb(var(--copy-primary))] truncate">
        {entry.title}
      </span>

      {entry.isFavourite && (
        <FaStar className="text-[10px] text-[rgb(var(--accent))] flex-shrink-0" />
      )}

      {/* Date */}
      <span className="text-xs text-[rgb(var(--copy-muted))] flex-shrink-0">
        {formatDate(entry.updatedAt)}
      </span>

      {/* Hover actions */}
      <div
        className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onToggleFav(entry)}
          className="p-1 rounded hover:bg-[rgb(var(--border))]/50 transition-colors"
          aria-label={entry.isFavourite ? "Remove from favorites" : "Add to favorites"}
        >
          {entry.isFavourite ? (
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

// ─── Main ────────────────────────────────────────────────

const ChapterView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const stateChapter = location.state?.chapter;
  const urlId = searchParams.get("id");

  const [chapter, setChapter] = useState<any>(() => normChapter(stateChapter));
  const [entries, setEntries] = useState<any[]>(() => normChapter(stateChapter)?.entries ?? []);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [sortOpen, setSortOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeletingNote, setIsDeletingNote] = useState(false);

  // Fetch fresh data (works with or without location.state)
  useEffect(() => {
    const chapterId = stateChapter?.ID ?? stateChapter?.id ?? (urlId ? Number(urlId) : null);
    if (!chapterId) { setIsLoading(false); return; }

    (async () => {
      try {
        const res = await GetAllChapter();
        if (res && Array.isArray(res.data)) {
          const found = res.data.find((c: any) => (c.ID ?? c.id) === chapterId);
          if (found) {
            const n = normChapter(found);
            if (n) { setChapter(n); setEntries(n.entries); }
          }
        }
      } catch { toast.error("Failed to load notebook"); }
      finally { setIsLoading(false); }
    })();
  }, []);

  // ─── Handlers ──────────────────────────────────────────

  const handleView = (entry: any) => navigate(`/note?id=${entry.id}`, { state: { entry: entry._raw ?? entry } });
  const handleEdit = (entry: any) => {
    navigate("/new-note", {
      state: { ...(entry._raw ?? entry), update: true, id: entry.id, chapter: { id: chapter?.id, title: chapter?.title, color: chapter?.color } },
    });
  };
  const handleDelete = (entry: any) => setDeleteTarget(entry);
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeletingNote(true);
    const ok = await DeleteEntry(deleteTarget.id);
    setIsDeletingNote(false);
    if (ok) {
      setEntries((p) => p.filter((e) => e.id !== deleteTarget.id));
      toast.success("Note deleted");
      setDeleteTarget(null);
    } else toast.error("Failed to delete");
  };
  const handleArchive = async (entry: any) => {
    const ok = await ArchiveEntry(entry.id, true);
    if (ok) {
      setEntries((p) => p.filter((e) => e.id !== entry.id));
      toast.success("Note archived");
    } else toast.error("Failed to archive");
  };

  const handleToggleFav = async (entry: any) => {
    const newFav = !entry.isFavourite;
    const ok = await FavouriteEntry(entry.id, newFav);
    if (ok) {
      setEntries((p) => p.map((e) => (e.id === entry.id ? { ...e, isFavourite: newFav } : e)));
      toast.success(newFav ? "Added to favorites" : "Removed from favorites");
    } else toast.error("Failed to update");
  };

  const handleBack = () => navigate("/notebooks");
  const handleAdd = () => {
    navigate("/new-note", {
      state: { chapter: { id: chapter?.id, title: chapter?.title, color: chapter?.color } },
    });
  };

  // ─── Filter + sort ─────────────────────────────────────

  const active = entries.filter((e: any) => !e.isArchived);

  const filtered = active
    .filter((e: any) =>
      !search.trim() ||
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      stripHtml(e.content).toLowerCase().includes(search.toLowerCase())
    )
    .sort((a: any, b: any) => {
      if (sortBy === "name") return (a.title ?? "").localeCompare(b.title ?? "");
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const INITIAL = 15;
  const visible = showAll || search.trim() ? filtered : filtered.slice(0, INITIAL);
  const hasMore = !showAll && !search.trim() && filtered.length > INITIAL;

  // ─── States ────────────────────────────────────────────

  if (isLoading) return <Skeleton />;

  if (!chapter) {
    return (
      <div className="min-h-screen bg-[rgb(var(--background))]">
        <div className="max-w-2xl mx-auto px-4 py-10 text-center py-20">
          <p className="text-[rgb(var(--copy-primary))] font-medium mb-2">Notebook not found</p>
          <button onClick={handleBack} className="text-sm text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-secondary))] transition-colors">
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Back */}
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-primary))] transition-colors mb-8"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Notebooks
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-baseline justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-3 h-3 rounded flex-shrink-0"
                style={{ backgroundColor: chapter.color || "rgb(var(--copy-muted))" }}
              />
              <h1 className="text-xl font-semibold text-[rgb(var(--copy-primary))] capitalize truncate">
                {chapter.title}
                <span className="text-sm font-normal text-[rgb(var(--copy-muted))] ml-2">{active.length}</span>
              </h1>
            </div>
            <button
              onClick={handleAdd}
              className="flex-shrink-0 p-1 rounded-md text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-secondary))] hover:bg-[rgb(var(--surface))] transition-colors ml-4"
              aria-label="Add note to notebook"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>
          {chapter.description && (
            <p className="text-sm text-[rgb(var(--copy-muted))] mt-1 ml-[22px]">
              {chapter.description}
            </p>
          )}
        </div>

        {/* Search + sort */}
        {active.length > 3 && (
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
            <SmartDropdown open={sortOpen} onOpenChange={setSortOpen}>
              <DropdownTrigger>
                <button className="px-2.5 py-1.5 border border-[rgb(var(--border))] rounded-lg text-xs text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-secondary))] transition-colors flex items-center gap-1">
                  {sortBy === "name" ? "A-Z" : "Recent"}
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 5L6 8L9 5" /></svg>
                </button>
              </DropdownTrigger>
              <DropdownContent title="Sort" align="end">
                <DropdownItem selected={sortBy === "recent"} onClick={() => setSortBy("recent")}>Recent</DropdownItem>
                <DropdownItem selected={sortBy === "name"} onClick={() => setSortBy("name")}>A-Z</DropdownItem>
              </DropdownContent>
            </SmartDropdown>
          </div>
        )}

        {/* Notes list */}
        {visible.length > 0 ? (
          <div>
            {visible.map((entry: any) => (
              <NoteRow
                key={entry.id}
                entry={entry}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
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
          <div className="text-center py-16">
            {search.trim() ? (
              <>
                <p className="text-sm text-[rgb(var(--copy-secondary))]">No notes match your search</p>
                <p className="text-xs text-[rgb(var(--copy-muted))] mt-1">Try a different term</p>
              </>
            ) : (
              <>
                <p className="text-sm text-[rgb(var(--copy-secondary))] mb-3">No notes in this notebook yet</p>
                <button
                  onClick={handleAdd}
                  className="flex items-center gap-1.5 text-sm text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-secondary))] transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  Write a note
                </button>
              </>
            )}
          </div>
        )}
        <ConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete note"
          message="This action cannot be undone. The note will be permanently deleted."
          itemName={deleteTarget?.title || "Untitled"}
          isProcessing={isDeletingNote}
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </div>
  );
};

export default ChapterView;
