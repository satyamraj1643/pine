import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  FaPlusCircle,
  FaBookOpen,
  FaFileAlt,
  FaArrowRight,
  FaEllipsisH,
  FaSearch,
  FaClock,
  FaArchive,
  FaTrash,
  FaRegStar,
  FaStar,
  FaFilter,
  FaPlus,
  FaHeart,
  FaTimes,
  FaExclamationTriangle,
  FaEdit,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import {
  GetAllChapter,
  ArchiveChapter,
  DeleteChapter,
  FavouriteEntry,
  FavouriteChapter,
  DeleteEntry,
  ArchiveEntry,
} from "../APIs";
import toast from "react-hot-toast";

// Cozy color palette for chapters
const cozyColors = [
  "#f4a261",
  "#9ca3af",
  "#6b7280",
  "#10b981",
  "#ef4444",
  "#f3f4f6",
  "#e5e7eb",
  "#4b5563",
  "#a5b4fc",
  "#3b82f6",
];

// Helper function to format dates
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  // @ts-ignore
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

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

// Loading Skeleton Components
const SkeletonCard = ({ index = 0 }) => (
  <div
    className="rounded-xl overflow-hidden bg-white border border-gray-200 animate-pulse shadow-sm"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    {/* Color bar at top */}
    <div className="h-1.5 bg-gray-200" />
    
    <div className="p-4">
      {/* Header section with icon and title */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          {/* Icon placeholder */}
          <div className="p-2 rounded-lg bg-gray-100 w-8 h-8" />
          <div className="flex-1">
            {/* Title placeholder */}
            <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
            {/* Subtitle placeholder */}
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
        </div>
        {/* Action buttons placeholder */}
        <div className="flex gap-2">
          <div className="w-6 h-6 bg-gray-200 rounded" />
          <div className="w-6 h-6 bg-gray-200 rounded" />
        </div>
      </div>
      
      {/* Tags placeholder */}
      <div className="flex gap-2 mb-3">
        <div className="h-5 bg-gray-200 rounded-full w-12" />
        <div className="h-5 bg-gray-200 rounded-full w-16" />
      </div>
      
      {/* Description placeholder */}
      <div className="mb-3">
        <div className="h-3 bg-gray-200 rounded mb-1 w-full" />
        <div className="h-3 bg-gray-200 rounded w-4/5" />
      </div>
      
      {/* Footer placeholder */}
      <div className="border-t border-gray-200 pt-3">
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-20" />
          <div className="h-3 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  </div>
);
const LoadingSkeleton = ({ count = 4 }) => (
  <div className="grid gap-4 md:grid-cols-2">
    {Array.from({ length: count }, (_, index) => (
      <SkeletonCard key={index} index={index} />
    ))}
  </div>
);

// Confirmation Modal (Reusable for Delete and Archive)
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemTitle,
  isProcessing,
  confirmText,
  confirmColor,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[rgb(var(--card))] rounded-xl shadow-2xl border border-[rgb(var(--border))] max-w-md w-full mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--border))]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[rgb(var(--error-subtle))] rounded-lg">
              <FaExclamationTriangle className="text-[rgb(var(--error))] text-lg" />
            </div>
            <h3 className="text-lg font-serif font-semibold text-[rgb(var(--copy-primary))]">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 hover:bg-[rgb(var(--surface))] rounded-lg transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <FaTimes className="text-[rgb(var(--copy-muted))]" />
          </button>
        </div>
        <div className="p-4">
          <p className="text-[rgb(var(--copy-secondary))] leading-relaxed mb-2">
            {message}
          </p>
          <div className="p-3 bg-[rgb(var(--surface))] rounded-lg border-l-4 border-[rgb(var(--error))]">
            <p className="font-medium text-[rgb(var(--copy-primary))] text-sm">
              "{itemTitle}"
            </p>
          </div>
        </div>
        <div className="flex gap-3 p-4 border-t border-[rgb(var(--border))] bg-[rgb(var(--surface))]">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--copy-primary))] bg-[rgb(var(--card))] hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${confirmColor} ${
              isProcessing ? "cursor-not-allowed" : ""
            }`}
            aria-label={confirmText}
          >
            {isProcessing ? `${confirmText}...` : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Entry item component
const EntryItem = ({
  entry,
  index,
  chapterId,
  favorites,
  setFavorites,
  fetchChapters,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef(null);
  const entryId = parseInt(`${entry.id}`);
  const isFavorite = favorites.has(entryId);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu((prev) => !prev);
  };

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    if (isFavoriting) return;

    setIsFavoriting(true);
    const value = !isFavorite;

    try {
      const response = await FavouriteEntry(entryId, value);
      if (response) {
        setFavorites((prev) => {
          const newFavorites = new Set(prev);
          if (value) newFavorites.add(entryId);
          else newFavorites.delete(entryId);
          return newFavorites;
        });
        fetchChapters();
        toast.success(value ? "Added to favorites" : "Removed from favorites");
      } else {
        toast.error("Unable to update favorite status.");
      }
    } catch (error) {
      toast.error("Error updating favorite status.");
    } finally {
      setIsFavoriting(false);
    }
  };

  const handleArchive = async (e) => {
    e.stopPropagation();
    if (isArchiving) return;

    setIsArchiving(true);
    try {
      const response = await ArchiveEntry(entryId, !entry.is_archived);
      if (response) {
        toast.success(
          entry.is_archived
            ? "Entry unarchived successfully."
            : "Entry archived successfully."
        );
        fetchChapters();
      } else {
        toast.error("Failed to update archive status.");
      }
    } catch (error) {
      toast.error("Error updating archive status.");
    } finally {
      setIsArchiving(false);
      setShowMenu(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const response = await DeleteEntry(entryId);
      if (response) {
        toast.success("Entry deleted successfully.");
        fetchChapters();
      } else {
        toast.error("Failed to delete entry.");
      }
    } catch (error) {
      toast.error("Error deleting entry.");
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate("/create-entry", {
      state: {
        entry: {
          update: true,
          id: entry.id,
          title: entry.title,
          content: entry.content,
          collection: entry.collection,
        },
        chapter: { id: chapterId },
      },
    });
    setShowMenu(false);
  };

  return (
    <div className="relative group">
      <div className="flex items-start p-2 bg-[rgb(var(--card))] rounded-lg hover:bg-[rgb(var(--surface))] transition-all duration-200 border border-[rgb(var(--border))] group-hover:shadow-sm">
        <FaFileAlt className="text-[rgb(var(--copy-muted))] mt-1 mr-2 flex-shrink-0 text-xs" />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <h3 className="text-sm font-medium text-[rgb(var(--copy-primary))] truncate">
                {entry.title}
              </h3>
              <button
                onClick={toggleFavorite}
                disabled={isFavoriting}
                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                {isFavoriting ? (
                  <div className="animate-spin text-xs text-[rgb(var(--copy-muted))]">
                    ⟳
                  </div>
                ) : isFavorite || entry.is_favourite ? (
                  <FaStar className="text-xs text-[rgb(var(--accent))]" />
                ) : (
                  <FaRegStar className="text-xs text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--accent))] transition-colors" />
                )}
              </button>
            </div>
            <div className="relative flex-shrink-0" ref={menuRef}>
              <button
                onClick={toggleMenu}
                className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[rgb(var(--surface))] transition-all duration-200"
                aria-label="Entry options"
              >
                <FaEllipsisH className="text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-primary))] text-xs" />
              </button>
              {showMenu && (
                <div
                  className="absolute right-0 top-full mt-1 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg shadow-md p-2 z-10 min-w-[140px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-2 py-1 text-xs w-full hover:bg-[rgb(var(--surface))] text-[rgb(var(--copy-primary))] rounded"
                    aria-label="Edit entry"
                  >
                    <FaEdit className="text-[rgb(var(--copy-muted))]" /> Edit
                  </button>
                  <button
                    onClick={handleArchive}
                    disabled={isArchiving}
                    className="flex items-center gap-2 px-2 py-1 text-xs w-full hover:bg-[rgb(var(--surface))] text-[rgb(var(--copy-primary))] rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={entry.is_archived ? "Unarchive entry" : "Archive entry"}
                  >
                    <FaArchive className="text-[rgb(var(--copy-muted))]" />
                    {entry.is_archived ? "Unarchive" : "Archive"}
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-2 py-1 text-xs w-full hover:bg-[rgb(var(--error)),0.1] hover:text-[rgb(var(--error))] text-[rgb(var(--copy-primary))] rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Delete entry"
                  >
                    <FaTrash className="text-[rgb(var(--copy-muted))]" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-[rgb(var(--copy-secondary))] mt-1 line-clamp-2 leading-relaxed">
            {entry.content.substring(0, 150)}...
          </p>
          {entry.collection?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {entry.collection.map((tag) => (
                <span
                  key={tag.id}
                  className="px-1.5 py-0.5 text-xs font-medium rounded-full text-[rgb(var(--cta-text))]"
                  style={{ backgroundColor: tag.color }}
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-1 text-[rgb(var(--copy-muted))] text-xs mt-1">
            <FaClock className="text-xs" />
            <span>Updated {formatDate(entry.updated_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Chapter card component
const ChapterCard = ({
  chapter,
  favorites,
  setFavorites,
  onEdit,
  onDelete,
  onArchive,
  index,
  fetchChapters,
}) => {
  const [showChapterMenu, setShowChapterMenu] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const chapterId = `chapter-${chapter.id}`;
  const isFavorite = favorites.has(chapterId);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowChapterMenu(false);
      }
    };

    if (showChapterMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showChapterMenu]);

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    if (isFavoriting) return;

    setIsFavoriting(true);
    const value = !isFavorite;

    try {
      const response = await FavouriteChapter(chapter.id, value);
      if (response) {
        setFavorites((prev) => {
          const newFavorites = new Set(prev);
          if (value) newFavorites.add(chapterId);
          else newFavorites.delete(chapterId);
          return newFavorites;
        });
        fetchChapters();
        toast.success(value ? "Added to favorites" : "Removed from favorites");
      } else {
        toast.error("Unable to update favorite status.");
      }
    } catch (error) {
      toast.error("Error updating favorite status.");
    } finally {
      setIsFavoriting(false);
    }
  };

  const toggleChapterMenu = (e) => {
    e.stopPropagation();
    setShowChapterMenu((prev) => !prev);
  };

  const handleShowChapterView = () => {
    console.log("going in chapter view with", chapter)
    navigate("/chapter-view", { state: { chapter } });
  };

  const handleAddEntry = (e) => {
    e.stopPropagation();
    navigate("/create-entry", {
      state: {
        chapter: {
          update: true,
          id: chapter.id,
          title: chapter.title,
          color: chapter.color,
        },
      },
    });
    setShowChapterMenu(false);
  };

  return (
    <div
      className="rounded-xl overflow-hidden bg-[rgb(var(--card))] group flex flex-col transition-all duration-200 border border-[rgb(var(--border))] hover:shadow-md cursor-pointer"
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={handleShowChapterView}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleShowChapterView()}
      aria-label={`View chapter ${chapter.title}`}
    >
      <div className="h-1.5" style={{ backgroundColor: chapter.color }} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div
              className="p-2 rounded-lg flex-shrink-0"
              style={{ backgroundColor: `${chapter.color}20` }}
            >
              <FaBookOpen
                className="text-sm"
                style={{ color: chapter.color }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-serif font-semibold text-[rgb(var(--copy-primary))] leading-tight capitalize">
                {chapter.title}
              </h2>
              <div className="flex items-center gap-4 text-xs text-[rgb(var(--copy-secondary))] mt-1">
                <span>{chapter.entries.length} entries</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 relative" ref={menuRef}>
            <button
              onClick={toggleFavorite}
              disabled={isFavoriting}
              className="p-1 hover:scale-110 transform transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavoriting ? (
                <div className="animate-spin text-sm text-[rgb(var(--copy-muted))]">
                  ⟳
                </div>
              ) : isFavorite || chapter.is_favourite ? (
                <FaStar className="text-sm text-[rgb(var(--accent))]" />
              ) : (
                <FaRegStar className="text-sm text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--accent))] transition-colors" />
              )}
            </button>
            <button
              onClick={toggleChapterMenu}
              className="p-1 rounded hover:bg-[rgb(var(--surface))] transition-all duration-200"
              aria-label="Chapter options"
            >
              <FaEllipsisH className="text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-primary))] text-sm" />
            </button>
            {showChapterMenu && (
              <div
                className="absolute right-0 top-full mt-1 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg shadow-md p-2 z-50 min-w-[140px]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={handleAddEntry}
                  className="flex items-center gap-2 px-2 py-1 text-xs w-full hover:bg-[rgb(var(--surface))] text-[rgb(var(--copy-primary))] rounded"
                  aria-label="Add new entry"
                >
                  <FaPlus className="text-[rgb(var(--copy-muted))]" /> Add Entry
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(chapter); }}
                  className="flex items-center gap-2 px-2 py-1 text-xs w-full hover:bg-[rgb(var(--surface))] text-[rgb(var(--copy-primary))] rounded"
                  aria-label="Edit chapter"
                >
                  <FaEdit className="text-[rgb(var(--copy-muted))]" /> Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onArchive(chapter); }}
                  className="flex items-center gap-2 px-2 py-1 text-xs w-full hover:bg-[rgb(var(--surface))] text-[rgb(var(--copy-primary))] rounded"
                  aria-label={chapter.is_archived ? "Unarchive chapter" : "Archive chapter"}
                >
                  <FaArchive className="text-[rgb(var(--copy-muted))]" />
                  {chapter.is_archived ? "Unarchive" : "Archive"}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(chapter); }}
                  className="flex items-center gap-2 px-2 py-1 text-xs w-full hover:bg-[rgb(var(--error)),0.1] hover:text-[rgb(var(--error))] text-[rgb(var(--copy-primary))] rounded"
                  aria-label="Delete chapter"
                >
                  <FaTrash className="text-[rgb(var(--copy-muted))]" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="relative mb-3">
          <p className="text-[rgb(var(--copy-secondary))] leading-relaxed text-sm font-light line-clamp-2">
            {chapter.description || "No description provided."}
          </p>
        </div>
        {chapter.collection?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {chapter.collection.map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-1 text-xs font-medium rounded-full text-[rgb(var(--cta-text))]"
                style={{ backgroundColor: tag.color }}
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="p-3 space-y-2 bg-[rgb(var(--card))] flex-1">
        {chapter.entries.slice(0, 2).map((entry, idx) => (
          <EntryItem
            key={entry.id}
            entry={entry}
            index={idx}
            chapterId={chapter.id}
            favorites={favorites}
            setFavorites={setFavorites}
            fetchChapters={fetchChapters}
          />
        ))}
      </div>
      <div className="p-3 flex justify-between items-center border-t border-[rgb(var(--border))] h-12 flex-shrink-0">
        <div className="flex items-center gap-1 text-[rgb(var(--copy-muted))] text-xs">
          <FaClock className="text-xs" />
          <span>Updated {formatDate(chapter.updated_at)}</span>
        </div>
        <div className="text-xs text-[rgb(var(--copy-secondary))]">
          {chapter.entries.length}{" "}
          {chapter.entries.length === 1 ? "entry" : "entries"}
        </div>
      </div>
    </div>
  );
};

// Pagination component
const CozyPagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-1 rounded-full text-sm ${
          currentPage === 1
            ? "text-[rgb(var(--copy-muted))] cursor-not-allowed"
            : "text-[rgb(var(--copy-secondary))] hover:bg-[rgb(var(--surface))]"
        } transition-colors`}
        title="Previous page"
        aria-label="Previous page"
      >
        <FaArrowRight className="rotate-180" />
      </button>
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            currentPage === page
              ? "bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))]"
              : "text-[rgb(var(--copy-secondary))] hover:bg-[rgb(var(--surface))]"
          } transition-colors`}
          aria-label={`Page ${page}`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-1 rounded-full text-sm ${
          currentPage === totalPages
            ? "text-[rgb(var(--copy-muted))] cursor-not-allowed"
            : "text-[rgb(var(--copy-secondary))] hover:bg-[rgb(var(--surface))]"
        } transition-colors`}
        title="Next page"
        aria-label="Next page"
      >
        <FaArrowRight />
      </button>
    </div>
  );
};

// Empty State Component
const CozyEmptyState = ({ searchValue, archivedChapterCount }) => (
  <div className="text-center py-12">
    <div className="relative inline-block mb-6">
      <div className="absolute -top-1 -left-1 w-full h-full bg-[rgb(var(--accent-subtle))] rounded-full transform rotate-12 opacity-60"></div>
      <div className="relative p-6 rounded-full bg-[rgb(var(--card))] shadow-sm ring-1 ring-[rgb(var(--border))]">
        <FaBookOpen className="text-2xl text-[rgb(var(--cta))]" />
      </div>
    </div>
    <h3 className="text-xl font-serif font-semibold text-[rgb(var(--copy-primary))] mb-2">
      {searchValue.trim() ? "No matching chapters" : "No chapters yet"}
      {archivedChapterCount > 0 && (
        <Link
          to="/archives"
          className="text-blue-600 hover:text-blue-800 underline ml-2"
          aria-label={`${archivedChapterCount} archived chapters`}
        >
          ({archivedChapterCount} archived)
        </Link>
      )}
    </h3>
    <p className="text-[rgb(var(--copy-secondary))] text-sm max-w-md mx-auto font-light leading-relaxed">
      {searchValue.trim()
        ? "Try adjusting your search to find what you're looking for."
        : "Start creating your first chapter to organize your stories."}
    </p>
  </div>
);

// Cozy Control Panel Component
const CozyControlPanel = ({
  searchValue,
  onSearchChange,
  sortBy,
  onSortChange,
  totalCount,
  filteredCount,
  onCreateNew,
  isLoading,
}) => (
  <div className="mb-8">
    <div className="bg-[rgb(var(--card))] rounded-xl p-4 shadow-sm ring-1 ring-[rgb(var(--border))]">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 max-w-md w-full">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--copy-muted))]">
            <FaSearch className="text-sm" />
          </div>
          <input
            type="text"
            placeholder="Search your chapters..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={isLoading}
            className="w-full pl-8 pr-3 py-2 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg text-sm text-[rgb(var(--copy-primary))] focus:ring-2 focus:ring-[rgb(var(--cta))] focus:border-transparent transition-all font-light placeholder-[rgb(var(--copy-muted))] disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Search chapters"
          />
        </div>
        <div className="flex gap-3 items-center">
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--copy-muted))] text-xs" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              disabled={isLoading}
              className="pl-8 pr-6 py-2 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg text-sm text-[rgb(var(--copy-primary))] focus:ring-2 focus:ring-[rgb(var(--warning))] focus:border-transparent transition-all font-medium appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Sort chapters"
            >
              <option value="recent">Latest First</option>
              <option value="created">Oldest First</option>
              <option value="name">By Title</option>
              <option value="entries">By Entries</option>
            </select>
          </div>
          <button
            onClick={onCreateNew}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] rounded-lg hover:bg-[rgb(var(--cta-active))] transition-all duration-200 font-medium text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Create new chapter"
            aria-label="Create new chapter"
          >
            <FaPlusCircle className="text-xs" />
            New Chapter
          </button>
        </div>
      </div>
      {!isLoading && filteredCount !== totalCount && (
        <div className="mt-3 pt-3 border-t border-[rgb(var(--border))]">
          <div className="text-center text-xs text-[rgb(var(--copy-muted))]">
            <span className="font-medium text-[rgb(var(--copy-secondary))]">
              {filteredCount}
            </span>{" "}
            of{" "}
            <span className="font-medium text-[rgb(var(--copy-secondary))]">
              {totalCount}
            </span>{" "}
            chapters
          </div>
        </div>
      )}
    </div>
  </div>
);

// Cozy Welcome Header Component
const CozyWelcomeHeader = () => (
  <div className="flex items-center gap-2 mb-4">
    <div className="p-2 bg-[rgb(var(--card))] rounded-lg shadow-sm border border-[rgb(var(--border))]">
      <FaBookOpen className="text-amber-600 text-lg" />
    </div>
    <div>
      <h1 className="text-2xl font-serif text-[rgb(var(--copy-primary))] font-semibold">
        My Chapters
      </h1>
      <p className="text-[rgb(var(--copy-secondary))] text-sm">
        Organize your stories into meaningful chapters
      </p>
    </div>
  </div>
);

// Main Chapters component
export default function Chapters() {
  const [chapters, setChapters] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [searchValue, setSearchValue] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [archivedChapterCount, setArchivedChapterCount] = useState(0);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    chapter: null,
    isDeleting: false,
  });
  const [archiveModal, setArchiveModal] = useState({
    isOpen: false,
    chapter: null,
    isArchiving: false,
  });
  const chaptersPerPage = 4;
  const navigate = useNavigate();

  const fetchChapters = async () => {
    setIsLoading(true);
    try {
      const response = await GetAllChapter();
      if (response && Array.isArray(response.data)) {
        const unarchivedChapters = response.data.filter(
          (chapter) => !chapter.is_archived
        );
        setArchivedChapterCount(response.data.length - unarchivedChapters.length);
        setChapters(unarchivedChapters);
        const initialFavorites = new Set(
          unarchivedChapters
            .filter((chapter) => chapter.is_favourite)
            .map((chapter) => `chapter-${chapter.id}`)
        );
        unarchivedChapters.forEach((chapter) => {
          chapter.entries.forEach((entry) => {
            if (entry.is_favourite) {
                // @ts-ignore
              initialFavorites.add(parseInt(entry.id));
            }
          });
        });
        setFavorites(initialFavorites);
      } else {
        setChapters([]);
      }
    } catch (error) {
      console.error("Error fetching chapters:", error);
      setChapters([]);
      toast.error("Failed to load chapters");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, []);

  const handleEdit = (chapter) => {
    navigate("/create-chapter", { state: chapter });
  };

  const handleDelete = (chapter) => {
    setDeleteModal({ isOpen: true, chapter, isDeleting: false });
  };

  const confirmDelete = async () => {
    const { chapter } = deleteModal;
    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));

    try {
      const response = await DeleteChapter(chapter.id);
      if (response) {
        toast.success("Chapter deleted successfully.");
        fetchChapters();
        setCurrentPage(1);
        setDeleteModal({ isOpen: false, chapter: null, isDeleting: false });
      } else {
        toast.error("Failed to delete chapter.");
        setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
      }
    } catch (error) {
      toast.error("Error deleting chapter.");
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const cancelDelete = () => {
    if (!deleteModal.isDeleting) {
      setDeleteModal({ isOpen: false, chapter: null, isDeleting: false });
    }
  };

  const handleArchive = (chapter) => {
    setArchiveModal({ isOpen: true, chapter, isArchiving: false });
  };

  const confirmArchive = async () => {
    const { chapter } = archiveModal;
    setArchiveModal((prev) => ({ ...prev, isArchiving: true }));

    try {
      const response = await ArchiveChapter(chapter.id, !chapter.is_archived);
      if (response) {
        toast.success(
          chapter.is_archived
            ? "Chapter unarchived successfully."
            : "Chapter archived successfully."
        );
        fetchChapters();
        setCurrentPage(1);
        setArchiveModal({ isOpen: false, chapter: null, isArchiving: false });
      } else {
        toast.error("Failed to update archive status.");
        setArchiveModal((prev) => ({ ...prev, isArchiving: false }));
      }
    } catch (error) {
      toast.error("Error updating archive status.");
      setArchiveModal((prev) => ({ ...prev, isArchiving: false }));
    }
  };

  const cancelArchive = () => {
    if (!archiveModal.isArchiving) {
      setArchiveModal({ isOpen: false, chapter: null, isArchiving: false });
    }
  };

  const handleCreateNew = () => {
    navigate("/create-chapter");
  };

  // Filter and sort chapters
  const filteredAndSortedChapters = useMemo(() => {
    let filtered = chapters;

    if (searchValue.trim()) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(
        (chapter) =>
          chapter.title.toLowerCase().includes(searchLower) ||
          chapter.description?.toLowerCase().includes(searchLower) ||
          chapter.collection.some((tag) =>
            tag.name.toLowerCase().includes(searchLower)
          )
      );
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          // @ts-ignore
          return new Date(b.updated_at) - new Date(a.updated_at);
        case "created":
            // @ts-ignore
          return new Date(b.created_at) - new Date(a.created_at);
        case "name":
          return a.title.localeCompare(b.title);
        case "entries":
          return b.entries.length - a.entries.length;
        default:
          return 0;
      }
    });
  }, [chapters, searchValue, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(
    filteredAndSortedChapters.length / chaptersPerPage
  );
  const paginatedChapters = filteredAndSortedChapters.slice(
    (currentPage - 1) * chaptersPerPage,
    currentPage * chaptersPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <CozyWelcomeHeader />
        <CozyControlPanel
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalCount={chapters.length}
          filteredCount={filteredAndSortedChapters.length}
          onCreateNew={handleCreateNew}
          isLoading={isLoading}
        />
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {paginatedChapters.length > 0 ? (
                paginatedChapters.map((chapter, index) => (
                  <ChapterCard
                    key={chapter.id}
                    chapter={chapter}
                    favorites={favorites}
                    setFavorites={setFavorites}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onArchive={handleArchive}
                    index={index}
                    fetchChapters={fetchChapters}
                  />
                ))
              ) : (
                <div className="col-span-full">
                  <CozyEmptyState
                    searchValue={searchValue}
                    archivedChapterCount={archivedChapterCount}
                  />
                </div>
              )}
            </div>
            {filteredAndSortedChapters.length > chaptersPerPage && (
              <CozyPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
            {paginatedChapters.length > 0 && (
              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[rgb(var(--card))] rounded-full shadow-sm ring-1 ring-[rgb(var(--border))]">
                  <FaHeart className="text-[rgb(var(--accent))] text-xs" />
                  <span className="text-[rgb(var(--copy-secondary))] text-sm font-light">
                    {filteredAndSortedChapters.length}{" "}
                    {filteredAndSortedChapters.length === 1
                      ? "chapter"
                      : "chapters"}{" "}
                    {archivedChapterCount > 0 && (
                      <Link
                        to="/archives"
                        className="text-blue-600 hover:text-blue-800 underline"
                        aria-label={`${archivedChapterCount} archived chapters`}
                      >
                        ({archivedChapterCount} archived)
                      </Link>
                    )}{" "}
                    found
                  </span>
                  <FaHeart className="text-[rgb(var(--accent))] text-xs" />
                </div>
              </div>
            )}
          </>
        )}
        <ConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          title="Delete Chapter"
          message="Are you sure you want to delete this chapter? This action cannot be undone."
          itemTitle={deleteModal.chapter?.title || ""}
          isProcessing={deleteModal.isDeleting}
          confirmText="Delete Chapter"
          confirmColor="bg-red-600 hover:bg-red-700 active:bg-red-800"
        />
        <ConfirmationModal
          isOpen={archiveModal.isOpen}
          onClose={cancelArchive}
          onConfirm={confirmArchive}
          title={archiveModal.chapter?.is_archived ? "Unarchive Chapter" : "Archive Chapter"}
          message={`Are you sure you want to ${
            archiveModal.chapter?.is_archived ? "unarchive" : "archive"
          } this chapter?`}
          itemTitle={archiveModal.chapter?.title || ""}
          isProcessing={archiveModal.isArchiving}
          confirmText={archiveModal.chapter?.is_archived ? "Unarchive Chapter" : "Archive Chapter"}
          confirmColor="bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
        />
      </div>
    </div>
  );
}