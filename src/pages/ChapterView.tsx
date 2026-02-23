import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaBookOpen,
  FaFileAlt,
  FaClock,
  FaEllipsisH,
  FaStar,
  FaPlusCircle,
  FaSearch,
  FaFilter,
  FaSortAlphaDown,
  FaClock as FaSortRecent,
  FaEdit,
  FaTrash,
  FaHeart,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { DeleteEntry, FavouriteEntry } from "../APIs";
import ConfirmModal from "../components/ConfirmModal";
import {
  SmartDropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
} from "../components/SmartDropdown";

// Format date utility
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  } else if (diffInMinutes < 10080) {
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
};

// Note item component
const NoteItem = ({
  entry,
  onView,
  onEdit,
  onDelete,
  onToggleFavorite,
}: {
  entry: any;
  onView: (e: any) => void;
  onEdit: (e: any) => void;
  onDelete: (e: any) => void;
  onToggleFavorite: (e: any) => void;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative group">
      <div
        className="flex items-start p-3 bg-[rgb(var(--card))] rounded-lg hover:bg-[rgb(var(--surface))] transition-all duration-200 border border-[rgb(var(--border))] group-hover:shadow-md cursor-pointer"
        onClick={() => onView(entry)}
      >
        <FaFileAlt className="text-[rgb(var(--copy-muted))] mt-1 mr-3 flex-shrink-0 text-sm" />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-[rgb(var(--copy-primary))] truncate">
                {entry.title}
              </h3>
              {entry.is_favourite && (
                <FaStar className="text-xs text-[rgb(var(--accent))] flex-shrink-0" />
              )}
            </div>
            <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <SmartDropdown open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownTrigger>
                  <button
                    className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-[rgb(var(--surface))] transition-all duration-200"
                    aria-label="Note options"
                  >
                    <FaEllipsisH className="text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-primary))] text-xs" />
                  </button>
                </DropdownTrigger>
                <DropdownContent title="Note Actions" align="end">
                  <DropdownItem onClick={() => onView(entry)}>
                    <FaFileAlt className="text-xs" style={{ color: "rgb(var(--copy-muted))" }} />
                    <span>View Note</span>
                  </DropdownItem>
                  <DropdownItem onClick={() => onEdit(entry)}>
                    <FaEdit className="text-xs" style={{ color: "rgb(var(--copy-muted))" }} />
                    <span>Edit Note</span>
                  </DropdownItem>
                  <DropdownItem onClick={() => onToggleFavorite(entry)}>
                    <FaHeart className={`text-xs ${entry.is_favourite ? "text-[rgb(var(--accent))]" : ""}`} style={{ color: entry.is_favourite ? undefined : "rgb(var(--copy-muted))" }} />
                    <span>{entry.is_favourite ? "Remove Favorite" : "Add Favorite"}</span>
                  </DropdownItem>
                  <DropdownSeparator />
                  <DropdownItem destructive onClick={() => onDelete(entry)}>
                    <FaTrash className="text-xs" />
                    <span>Delete Note</span>
                  </DropdownItem>
                </DropdownContent>
              </SmartDropdown>
            </div>
          </div>
          <p className="text-xs text-[rgb(var(--copy-secondary))] mt-2 line-clamp-2 leading-relaxed">
            {entry.content?.substring(0, 150)}...
          </p>
          {entry.collection?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {entry.collection.slice(0, 3).map((tag: any) => (
                <span key={tag.id} className="px-2 py-0.5 text-xs font-medium rounded-full"
                  style={{ backgroundColor: tag.color + "20", color: tag.color }}>
                  #{tag.name}
                </span>
              ))}
              {entry.collection.length > 3 && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[rgb(var(--surface))] text-[rgb(var(--copy-muted))]">
                  +{entry.collection.length - 3}
                </span>
              )}
            </div>
          )}
          <div className="flex items-center gap-2 text-[rgb(var(--copy-muted))] text-xs mt-2">
            <FaClock className="text-xs" />
            <span>Updated {formatDate(entry.updated_at)}</span>
            {entry.word_count && (
              <>
                <span>·</span>
                <span>{entry.word_count} words</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ChapterView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const chapter = location.state?.chapter;
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Mutable entries list so we can remove / update items without refetching
  const [entries, setEntries] = useState<any[]>(chapter?.entries ?? []);

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    entry: any;
    type: "delete" | "favorite";
  }>({ open: false, entry: null, type: "delete" });
  const [isProcessing, setIsProcessing] = useState(false);

  // Use the entry data already in the chapter object — no need to refetch
  const handleViewEntry = (entry: any) => {
    navigate("/note", { state: { entry } });
  };

  const handleEditEntry = (entry: any) => {
    navigate("/new-note", {
      state: {
        ...entry,
        update: true,
        id: entry.id,
        chapter: {
          id: chapter.id,
          title: chapter.title,
          color: chapter.color,
        },
      },
    });
  };

  const handleDeleteEntry = (entry: any) => {
    setConfirmModal({ open: true, entry, type: "delete" });
  };

  const handleToggleFavorite = async (entry: any) => {
    const newFav = !entry.is_favourite;
    const success = await FavouriteEntry(entry.id, newFav);
    if (success) {
      setEntries((prev) =>
        prev.map((e) => (e.id === entry.id ? { ...e, is_favourite: newFav } : e))
      );
      toast.success(newFav ? "Added to favorites" : "Removed from favorites");
    } else {
      toast.error("Failed to update favorite status.");
    }
  };

  const confirmDelete = async () => {
    if (!confirmModal.entry) return;
    setIsProcessing(true);
    const success = await DeleteEntry(confirmModal.entry.id);
    setIsProcessing(false);
    if (success) {
      setEntries((prev) => prev.filter((e) => e.id !== confirmModal.entry.id));
      toast.success("Note deleted successfully.");
    } else {
      toast.error("Failed to delete note.");
    }
    setConfirmModal({ open: false, entry: null, type: "delete" });
  };

  const handleBack = () => navigate(-1);

  const handleAddEntry = () => {
    navigate("/new-note", {
      state: {
        chapter: { id: chapter.id, title: chapter.title, color: chapter.color },
      },
    });
  };

  const filteredAndSortedEntries = entries
    .filter(
      (entry: any) =>
        !entry.is_archived &&
        (entry.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.collection?.some((tag: any) =>
            tag.name?.toLowerCase().includes(searchTerm.toLowerCase())
          ))
    )
    .sort((a: any, b: any) => {
      if (sortBy === "name") return (a.title ?? "").localeCompare(b.title ?? "");
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  const getSortLabel = () => (sortBy === "name" ? "Alphabetical" : "Recently Updated");

  if (!chapter) {
    return (
      <div className="min-h-screen px-4 py-8 bg-[rgb(var(--background))]">
        <div className="max-w-3xl mx-auto text-center py-12">
          <div className="relative inline-block mb-4">
            <div className="relative p-4 rounded-full bg-[rgb(var(--card))] shadow-sm border border-[rgb(var(--border))]">
              <FaBookOpen className="text-xl text-[rgb(var(--cta))]" />
            </div>
          </div>
          <h2 className="text-lg font-serif text-[rgb(var(--copy-primary))] mb-2">
            Notebook Not Found
          </h2>
          <p className="text-[rgb(var(--copy-secondary))] text-sm mb-4">
            The notebook you're looking for doesn't exist or couldn't be loaded.
          </p>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-[rgb(var(--card))] text-[rgb(var(--copy-primary))] hover:bg-[rgb(var(--surface))] rounded-lg border border-[rgb(var(--border))]"
          >
            <FaArrowLeft size={14} />
            <span className="font-medium">Back to Notebooks</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] px-4 py-8">
      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={confirmModal.open && confirmModal.type === "delete"}
        onClose={() => setConfirmModal({ open: false, entry: null, type: "delete" })}
        onConfirm={confirmDelete}
        title="Delete Note"
        message="This note will be permanently deleted. This action cannot be undone."
        itemName={confirmModal.entry?.title}
        isProcessing={isProcessing}
        confirmText="Delete"
        variant="danger"
      />

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={handleBack}
              className="p-2 rounded-lg bg-[rgb(var(--card))] text-[rgb(var(--copy-primary))] hover:bg-[rgb(var(--surface))] transition-all border border-[rgb(var(--border))]"
              aria-label="Go back">
              <FaArrowLeft size={14} />
            </button>
            <div className="p-3 rounded-lg shadow-sm border border-[rgb(var(--border))]"
              style={{ backgroundColor: `${chapter.color}20` }}>
              <FaBookOpen className="text-lg" style={{ color: chapter.color }} />
            </div>
            <div>
              <h1 className="text-2xl font-serif text-[rgb(var(--copy-primary))] font-semibold capitalize">
                {chapter.title}
              </h1>
              <p className="text-[rgb(var(--copy-secondary))] text-sm">
                {filteredAndSortedEntries.length} of {entries.length}{" "}
                {entries.length === 1 ? "note" : "notes"}
                {searchTerm && " matching search"}
              </p>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="bg-[rgb(var(--card))] rounded-xl p-4 shadow-sm border border-[rgb(var(--border))]">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md w-full">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--copy-muted))] text-sm" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg text-sm text-[rgb(var(--copy-primary))] focus:ring-2 focus:ring-[rgb(var(--cta))] focus:border-transparent transition-all placeholder-[rgb(var(--copy-muted))]"
                  aria-label="Search notes"
                />
              </div>
              <div className="flex gap-3">
                <SmartDropdown open={sortDropdownOpen} onOpenChange={setSortDropdownOpen}>
                  <DropdownTrigger>
                    <button
                      className="flex items-center gap-2 px-3 py-2.5 bg-[rgb(var(--surface))] rounded-lg text-sm border border-[rgb(var(--border))] text-[rgb(var(--copy-secondary))] hover:text-[rgb(var(--copy-primary))] transition-colors"
                      aria-label={`Sort by ${getSortLabel()}`}>
                      <FaFilter className="text-[rgb(var(--copy-muted))] text-xs" />
                      <span>{getSortLabel()}</span>
                    </button>
                  </DropdownTrigger>
                  <DropdownContent title="Sort By" align="end">
                    <DropdownItem 
                      selected={sortBy === "name"} 
                      onClick={() => setSortBy("name")}
                    >
                      <FaSortAlphaDown className="text-xs" />
                      <span>Alphabetical</span>
                    </DropdownItem>
                    <DropdownItem 
                      selected={sortBy === "recent"} 
                      onClick={() => setSortBy("recent")}
                    >
                      <FaSortRecent className="text-xs" />
                      <span>Recently Updated</span>
                    </DropdownItem>
                  </DropdownContent>
                </SmartDropdown>
                <button onClick={handleAddEntry}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[rgb(var(--cta))] hover:bg-[rgb(var(--cta-active))] text-[rgb(var(--cta-text))] rounded-lg text-sm font-medium shadow-sm transition-all"
                  aria-label="Add new note">
                  <FaPlusCircle className="text-xs" /> New Note
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notes list */}
        <div className="rounded-xl overflow-hidden bg-[rgb(var(--card))] transition-all border border-[rgb(var(--border))] shadow-sm">
          <div className="h-1.5" style={{ backgroundColor: chapter.color }} />
          <div className="p-4 space-y-3 bg-[rgb(var(--card))]">
            {filteredAndSortedEntries.length > 0 ? (
              filteredAndSortedEntries.map((entry: any) => (
                <NoteItem
                  key={entry.id}
                  entry={entry}
                  onView={handleViewEntry}
                  onEdit={handleEditEntry}
                  onDelete={handleDeleteEntry}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <FaFileAlt className="text-2xl text-[rgb(var(--copy-muted))] mx-auto opacity-50 mb-3" />
                <p className="text-[rgb(var(--copy-secondary))] text-sm mb-1">
                  {searchTerm ? "No matching notes found" : "No notes yet"}
                </p>
                <p className="text-[rgb(var(--copy-muted))] text-xs mb-4">
                  {searchTerm ? "Try adjusting your search terms" : "Start writing your first note"}
                </p>
                {!searchTerm && (
                  <button onClick={handleAddEntry}
                    className="flex items-center gap-2 px-4 py-2 mt-2 bg-[rgb(var(--cta))] hover:bg-[rgb(var(--cta-active))] text-[rgb(var(--cta-text))] rounded-lg text-sm mx-auto transition-all">
                    <FaPlusCircle className="text-xs" /> Add Note
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 flex justify-between items-center border-t border-[rgb(var(--border))]">
            <div className="flex items-center gap-2 text-[rgb(var(--copy-muted))] text-xs">
              <FaClock className="text-xs" />
              <span>Updated {formatDate(chapter.updated_at)}</span>
              <span>·</span>
              <FaBookOpen className="text-xs" />
              <span>{filteredAndSortedEntries.length}/{entries.length} notes</span>
            </div>
            <div className="flex items-center gap-1 text-[rgb(var(--copy-muted))] text-xs">
              {chapter.collection?.length > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full"
                  style={{ backgroundColor: chapter.collection[0].color + "20", color: chapter.collection[0].color }}>
                  #{chapter.collection[0].name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterView;
