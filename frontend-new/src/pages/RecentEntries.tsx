import React, { useState, useEffect, useMemo, useRef } from "react";
import { useTheme } from "../hooks/useTheme";
import {
  FaFileAlt,
  FaSearch,
  FaClock,
  FaEdit,
  FaTrash,
  FaRegStar,
  FaStar,
  FaFolderOpen,
  FaQuoteLeft,
  FaHeart,
  FaFilter,
  FaSort,
  FaFeather,
  FaBookOpen,
  FaArrowLeft,
  FaArrowRight,
  FaPlusCircle,
  FaEllipsisH,
  FaTimes,
  FaExclamationTriangle,
  FaArchive,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import {
  DeleteEntry,
  FavouriteEntry,
  GetAllEntries,
  ArchiveEntry,
} from "../APIs";
import emoji from "emoji-datasource";
import toast from "react-hot-toast";

// Loading Skeleton Components
const SkeletonCard = ({ index }) => (
  <div
    className="rounded-xl overflow-hidden bg-[rgb(var(--card))] border border-[rgb(var(--border))] shadow-sm group flex flex-col transition-all duration-200"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    {/* Color bar at top */}
    <div className="h-1.5 bg-[rgb(var(--surface))]" />
    
    <div className="p-4 flex flex-col flex-1">
      {/* Header section with icon, title, and action buttons */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          {/* Chapter icon */}
          <div className="p-2 rounded-lg bg-[rgb(var(--surface))] w-10 h-10 flex-shrink-0 border border-[rgb(var(--border))]/50">
            <div className="w-full h-full bg-[rgb(var(--border))]/40 rounded-sm" />
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Entry title */}
            <div className="space-y-2">
              <div className="h-5 bg-[rgb(var(--surface))] rounded-md border border-[rgb(var(--border))]/30" style={{ width: `${65 + (index * 10) % 30}%` }} />
              <div className="h-3 bg-[rgb(var(--surface))] rounded-md w-1/2 border border-[rgb(var(--border))]/30" />
            </div>
            
            {/* Chapter and mood info */}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[rgb(var(--surface))] rounded border border-[rgb(var(--border))]/30" />
                <div className="h-3 bg-[rgb(var(--surface))] rounded-md border border-[rgb(var(--border))]/30" style={{ width: `${12 + (index * 4) % 8}px` }} />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[rgb(var(--surface))] rounded-full border border-[rgb(var(--border))]/30" />
                <div className="h-3 bg-[rgb(var(--surface))] rounded-md border border-[rgb(var(--border))]/30" style={{ width: `${10 + (index * 3) % 6}px` }} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[rgb(var(--surface))] rounded-lg border border-[rgb(var(--border))]/30" />
          <div className="w-7 h-7 bg-[rgb(var(--surface))] rounded-lg border border-[rgb(var(--border))]/30">
            <div className="flex items-center justify-center h-full">
              <div className="flex gap-0.5">
                <div className="w-1 h-1 bg-[rgb(var(--border))]/40 rounded-full" />
                <div className="w-1 h-1 bg-[rgb(var(--border))]/40 rounded-full" />
                <div className="w-1 h-1 bg-[rgb(var(--border))]/40 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tags section */}
      <div className="flex flex-wrap gap-2 mb-3">
        {[1, 2, 3].map((tagIndex) => (
          <div 
            key={tagIndex}
            className="h-6 bg-[rgb(var(--surface))] rounded-full border border-[rgb(var(--border))]/30 px-3"
            style={{ width: `${40 + (tagIndex * index * 4) % 20}px` }}
          />
        ))}
      </div>

      {/* Content preview section */}
      <div className="relative mb-3 flex-1">
        {/* Quote icon */}
        <div className="w-4 h-4 bg-[rgb(var(--surface))] rounded border border-[rgb(var(--border))]/30 mb-3" />
        
        {/* Content lines */}
        <div className="pl-3 space-y-2">
          <div className="space-y-1.5">
            <div className="h-3.5 bg-[rgb(var(--surface))] rounded-md w-full border border-[rgb(var(--border))]/20" />
            <div className="h-3.5 bg-[rgb(var(--surface))] rounded-md border border-[rgb(var(--border))]/20" style={{ width: `${75 + (index * 5) % 20}%` }} />
            <div className="h-3.5 bg-[rgb(var(--surface))] rounded-md border border-[rgb(var(--border))]/20" style={{ width: `${60 + (index * 7) % 25}%` }} />
          </div>
        </div>
      </div>

      {/* Footer section */}
      <div className="border-t border-[rgb(var(--border))] pt-3 h-12 flex-shrink-0">
        <div className="flex justify-between items-center">
          {/* Last modified time */}
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-[rgb(var(--surface))] rounded-full border border-[rgb(var(--border))]/30" />
            <div className="h-3 bg-[rgb(var(--surface))] rounded-md border border-[rgb(var(--border))]/20" style={{ width: `${60 + (index * 3) % 15}px` }} />
          </div>
          
          {/* Read time and word count */}
          <div className="flex items-center gap-1">
            <div className="h-3 bg-[rgb(var(--surface))] rounded-md border border-[rgb(var(--border))]/20" style={{ width: `${35 + (index * 2) % 10}px` }} />
            <div className="w-1 h-1 bg-[rgb(var(--border))]/40 rounded-full" />
            <div className="h-3 bg-[rgb(var(--surface))] rounded-md border border-[rgb(var(--border))]/20" style={{ width: `${25 + (index * 3) % 8}px` }} />
          </div>
        </div>
      </div>
    </div>
  </div>
);


const LoadingSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2">
    {Array.from({ length: 4 }, (_, index) => (
      <SkeletonCard key={index} index={index} />
    ))}
  </div>
);
// General Purpose Confirmation Modal
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  entryTitle,
  isLoading,
  actionType,
}) => {
  if (!isOpen) return null;

  const isDelete = actionType === "delete";
  const title = isDelete ? "Delete Entry" : "Archive Entry";
  const message = isDelete
    ? "Are you sure you want to delete this entry? This action cannot be undone."
    : "Are you sure you want to archive this entry?";
  const confirmText = isDelete ? "Delete Chapter" : "Archive Chapter";
  const confirmColor = isDelete
    ? "bg-red-600 hover:bg-red-700 active:bg-red-800"
    : "bg-amber-600 hover:bg-amber-700 active:bg-amber-800";

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
            disabled={isLoading}
            className="p-1 hover:bg-[rgb(var(--surface))] rounded-lg transition-colors disabled:opacity-50"
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
              "{entryTitle}"
            </p>
          </div>
        </div>
        <div className="flex gap-3 p-4 border-t border-[rgb(var(--border))] bg-[rgb(var(--surface))]">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--copy-primary))] bg-[rgb(var(--card))] hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              isLoading ? "bg-gray-400 cursor-not-allowed" : confirmColor
            }`}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Cozy Welcome Header Component
const CozyWelcomeHeader = () => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="p-2 bg-[rgb(var(--card))] rounded-lg shadow-sm border border-[rgb(var(--border))]">
        <FaBookOpen className="text-amber-600 text-lg" />
      </div>
      <div>
        <h1 className="text-2xl font-serif text-[rgb(var(--copy-primary))] font-semibold">
          My Entries
        </h1>
        <p className="text-[rgb(var(--copy-secondary))] text-sm">
          Write your soulful stories here
        </p>
      </div>
    </div>
  );
};

// Cozy Control Panel Component
const CozyControlPanel = ({
  searchValue,
  onSearchChange,
  sortBy,
  onSortChange,
  filterBy,
  onFilterChange,
  totalCount,
  filteredCount,
  onCreateNew,
  uniqueChapters,
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
            placeholder="Search your thoughts..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={isLoading}
            className="w-full pl-8 pr-3 py-2 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg text-sm text-[rgb(var(--copy-primary))] focus:ring-2 focus:ring-[rgb(var(--cta))] focus:border-transparent transition-all font-light placeholder-[rgb(var(--copy-muted))] disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div className="flex gap-3 items-center">
          <div className="relative">
            <FaSort className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--copy-muted))] text-xs" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              disabled={isLoading}
              className="pl-8 pr-6 py-2 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg text-sm text-[rgb(var(--copy-primary))] focus:ring-2 focus:ring-[rgb(var(--warning))] focus:border-transparent transition-all font-medium appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="lastModified">Latest First</option>
              <option value="created">Oldest First</option>
              <option value="title">By Title</option>
              <option value="chapter">By Chapter</option>
            </select>
          </div>
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--copy-muted))] text-xs" />
            <select
              value={filterBy}
              onChange={(e) => onFilterChange(e.target.value)}
              disabled={isLoading}
              className="pl-8 pr-6 py-2 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg text-sm text-[rgb(var(--copy-primary))] focus:ring-2 focus:ring-[rgb(var(--success))] focus:border-transparent transition-all font-medium appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="all">All Chapters</option>
              {uniqueChapters.map((chapter) => (
                <option key={chapter} value={chapter}>
                  {chapter}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={onCreateNew}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] rounded-lg hover:bg-[rgb(var(--cta-active))] transition-all duration-200 font-medium text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Create new entry"
          >
            <FaPlusCircle className="text-xs" />
            New Entry
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
            entries
          </div>
        </div>
      )}
    </div>
  </div>
);

// Cozy Entry Card Component
const CozyEntryCard = ({
  entry,
  favorites,
  setFavorites,
  onEdit,
  onDelete,
  onArchive,
  onShowEntry,
  index,
  getEmojiFromShortcode,
  fetchEntries,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const menuRef = useRef(null);
  const entryId = entry.id;
  const isFavorite = favorites.has(entryId);

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

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    if (isFavoriting) return;
    setIsFavoriting(true);
    const value = !isFavorite;
    try {
      const response = await FavouriteEntry(entryId, value);
      if (response) {
        fetchEntries();
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

  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu((prev) => !prev);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(entry);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(entry);
  };

  const handleArchive = (e) => {
    e.stopPropagation();
    onArchive(entry);
  };

  return (
    <div
      className="rounded-xl overflow-hidden bg-[rgb(var(--card))] group flex flex-col transition-all duration-200 border border-[rgb(var(--border))] hover:shadow-md cursor-pointer"
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={() => onShowEntry(entry)}
    >
      <div className="h-1.5" style={{ backgroundColor: entry.color }} />
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div
              className="p-2 rounded-lg flex-shrink-0"
              style={{ backgroundColor: `${entry.chapter.color}20` }}
            >
              <FaFileAlt
                className="text-sm"
                style={{ color: entry.chapter.color }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-serif font-semibold text-[rgb(var(--copy-primary))] leading-tight">
                {entry.title}
              </h3>
              <div className="flex items-center gap-4 text-xs text-[rgb(var(--copy-secondary))] mt-1">
                <span className="flex items-center gap-1">
                  <FaFolderOpen
                    className="text-xs"
                    style={{ color: entry.chapter.color }}
                  />
                  {entry.chapter.name}
                </span>
                <span className="flex items-center gap-1">
                  <span style={{ color: entry.mood.color }}>
                    {getEmojiFromShortcode(entry.mood.emoji)}
                  </span>
                  {entry.mood.name}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 relative" ref={menuRef}>
            <button
              onClick={toggleFavorite}
              disabled={isFavoriting}
              className="p-1 hover:scale-110 transform transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavoriting ? (
                <div className="animate-spin text-sm text-[rgb(var(--copy-muted))]">
                  ⟳
                </div>
              ) : isFavorite ? (
                <FaStar className="text-sm text-[rgb(var(--accent))]" />
              ) : (
                <FaRegStar className="text-sm text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--accent))] transition-colors" />
              )}
            </button>
            <button
              onClick={toggleMenu}
              className="p-1 rounded hover:bg-[rgb(var(--surface))] transition-all duration-200"
            >
              <FaEllipsisH className="text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-primary))] text-sm" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg shadow-md p-2 z-10 min-w-[140px]">
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-2 py-1 text-xs w-full hover:bg-[rgb(var(--surface))] text-[rgb(var(--copy-primary))] rounded"
                >
                  <FaEdit className="text-[rgb(var(--copy-muted))]" /> Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-2 py-1 text-xs w-full hover:bg-[rgb(var(--error)),0.1] hover:text-[rgb(var(--error))] text-[rgb(var(--copy-primary))] rounded"
                >
                  <FaTrash className="text-[rgb(var(--copy-muted))]" /> Delete
                </button>
                <button
                  onClick={handleArchive}
                  className="flex items-center gap-2 px-2 py-1 text-xs w-full hover:bg-[rgb(var(--error)),0.1] hover:text-[rgb(var(--error))] text-[rgb(var(--copy-primary))] rounded"
                >
                  <FaArchive className="text-[rgb(var(--copy-muted))]" />{" "}
                  Archive
                </button>
              </div>
            )}
          </div>
        </div>
        {entry.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {entry.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs font-medium rounded-full text-[rgb(var(--cta-text))]"
                style={{ backgroundColor: tag.color }}
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
        <div className="relative mb-3 flex-1">
          <FaQuoteLeft className="text-[rgb(var(--copy-muted))] text-xs mb-2" />
          <div className="text-[rgb(var(--copy-secondary))] leading-relaxed text-sm font-light pl-2 line-clamp-2">
            {entry.content}
          </div>
        </div>
        <div className="p-3 flex justify-between items-center border-t border-[rgb(var(--border))] h-12 flex-shrink-0">
          <div className="flex items-center gap-1 text-[rgb(var(--copy-muted))] text-xs">
            <FaClock className="text-xs" />
            <span>Updated {formatDate(entry.lastModified)}</span>
          </div>
          <div className="text-xs text-[rgb(var(--copy-secondary))]">
            {entry.readTime} • {entry.wordCount} words
          </div>
        </div>
      </div>
    </div>
  );
};

// Pagination Component
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
      >
        <FaArrowLeft />
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
      >
        <FaArrowRight />
      </button>
    </div>
  );
};

// Empty State Component
const CozyEmptyState = ({ searchValue, filterBy, archivedEntryCount }) => (
  <div className="text-center py-12">
    <div className="relative inline-block mb-6">
      <div className="absolute -top-1 -left-1 w-full h-full bg-[rgb(var(--accent-subtle))] rounded-full transform rotate-12 opacity-60"></div>
      <div className="relative p-6 rounded-full bg-[rgb(var(--card))] shadow-sm ring-1 ring-[rgb(var(--border))]">
        <FaFeather className="text-2xl text-[rgb(var(--cta))]" />
      </div>
    </div>
    <h3 className="text-xl font-serif font-semibold text-[rgb(var(--copy-primary))] mb-2">
      {searchValue.trim() || filterBy !== "all"
        ? "No matching entries"
        : "No entries yet  "}
      {archivedEntryCount > 0 && (
        <Link
          to="/archives"
          className="text-blue-600 hover:text-blue-800 "
        >
          ({archivedEntryCount} archived)
        </Link>
      )}
    </h3>
    <p className="text-[rgb(var(--copy-secondary))] text-sm max-w-md mx-auto font-light leading-relaxed">
      {searchValue.trim() || filterBy !== "all"
        ? "Try adjusting your search or filter to find what you're looking for."
        : "Start writing your first entry to capture your thoughts."}
    </p>
  </div>
);

// Utility functions
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

// Main RecentEntries component
const RecentEntries = () => {
  const { currentTheme } = useTheme();
  const [entries, setEntries] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [searchValue, setSearchValue] = useState("");
  const [sortBy, setSortBy] = useState("lastModified");
  const [filterBy, setFilterBy] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [archivedEntriesCount, setArchivedEntriesCount] = useState(0);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    entry: null,
    actionType: null,
    isProcessing: false,
  });
  const entriesPerPage = 4;
  const navigate = useNavigate();

  const getEmojiFromShortcode = (shortcode) => {
    const emojiData = emoji.find((e) => e.short_name === shortcode);
    if (emojiData && emojiData.unified) {
      return String.fromCodePoint(parseInt(emojiData.unified, 16));
    }
    return "😐";
  };

  const calculateWordCount = (content) => {
    if (!content) return 0;
    return content.trim().split(/\s+/).length;
  };

  const calculateReadTime = (wordCount) => {
    if (wordCount === 0) return "0 min read";
    const wordsPerMinute = 200;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const transformEntry = (apiEntry) => {
    const wordCount = calculateWordCount(apiEntry.content);
    return {
      id: apiEntry.id,
      title: apiEntry.title,
      content: apiEntry.content,
      color: apiEntry.chapter.color,
      chapter: {
        id: apiEntry.chapter.id,
        name: apiEntry.chapter.title,
        color: apiEntry.chapter.color,
      },
      tags: apiEntry.collection.map((col) => ({
        id: col.id,
        name: col.name,
        color: col.color,
      })),
      createdAt: apiEntry.created_at,
      lastModified: apiEntry.updated_at,
      mood: apiEntry.mood,
      wordCount,
      readTime: calculateReadTime(wordCount),
      is_favourite: apiEntry.is_favourite,
      is_archived: apiEntry.is_archived,
    };
  };

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const response = await GetAllEntries();
      console.log("in entreis", response?.data)
      if (response && Array.isArray(response.data)) {
        const transformedEntries = response.data.map(transformEntry);

        const nonArchivedEntries = transformedEntries.filter(
          (entry) => !entry.is_archived
        );

        setArchivedEntriesCount(transformedEntries.length - nonArchivedEntries.length)

        setEntries(nonArchivedEntries);

        const initialFavorites = new Set(
          transformedEntries
            .filter((entry) => entry.is_favourite)
            .map((entry) => entry.id)
        );
        const archivedEntries = transformedEntries.filter(
          (entry) => entry.is_archived
        ).length;
      
        setFavorites(initialFavorites);
      } else {
        setEntries([]);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
      setEntries([]);
      toast.error("Failed to load entries");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const uniqueChapters = useMemo(() => {
    const chapters = entries.map((entry) => entry.chapter.name);
    return [...new Set(chapters)];
  }, [entries]);

  const handleEdit = (entry) => {
    navigate("/create-entry", {
      state: { ...entry, update: true },
    });
  };

  const handleDelete = (entry) => {
    setConfirmationModal({
      isOpen: true,
      entry,
      actionType: "delete",
      isProcessing: false,
    });
  };

  const handleArchive = (entry) => {
    setConfirmationModal({
      isOpen: true,
      entry,
      actionType: "archive",
      isProcessing: false,
    });
  };

  const confirmAction = async () => {
    const { entry, actionType } = confirmationModal;
    setConfirmationModal((prev) => ({ ...prev, isProcessing: true }));

    try {
      let response;
      if (actionType === "delete") {
        response = await DeleteEntry(entry.id);
      } else if (actionType === "archive") {
        response = await ArchiveEntry(entry.id, true);
      }

      if (response) {
        toast.success(
          actionType === "delete"
            ? "Entry deleted successfully"
            : "Entry archived successfully"
        );
        fetchEntries();
        setCurrentPage(1);
        setConfirmationModal({
          isOpen: false,
          entry: null,
          actionType: null,
          isProcessing: false,
        });
      } else {
        toast.error(`Failed to ${actionType} entry`);
        setConfirmationModal((prev) => ({ ...prev, isProcessing: false }));
      }
    } catch (error) {
      toast.error(`Error ${actionType}ing entry`);
      setConfirmationModal((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  const cancelAction = () => {
    if (!confirmationModal.isProcessing) {
      setConfirmationModal({
        isOpen: false,
        entry: null,
        actionType: null,
        isProcessing: false,
      });
    }
  };

  const handleCreateNew = () => {
    navigate("/create-entry");
  };

  const handleShowEntry = (entry) => {
    console.log("from recent entries, going to entry view", entry)
    navigate("/entry-view", { state: { entry } });
  };

  const filteredAndSortedEntries = useMemo(() => {
    let filtered = entries;
    if (searchValue.trim()) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry.title.toLowerCase().includes(searchLower) ||
          entry.content.toLowerCase().includes(searchLower) ||
          entry.chapter.name.toLowerCase().includes(searchLower) ||
          entry.tags.some((tag) => tag.name.toLowerCase().includes(searchLower))
      );
    }
    if (filterBy !== "all") {
      filtered = filtered.filter((entry) => entry.chapter.name === filterBy);
    }
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "lastModified":
            // @ts-ignore
          return new Date(b.lastModified) - new Date(a.lastModified);
        case "created":
            // @ts-ignore
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "title":
          return a.title.localeCompare(b.title);
        case "chapter":
          return a.chapter.name.localeCompare(b.chapter.name);
        default:
          return 0;
      }
    });
    return filtered;
  }, [entries, searchValue, sortBy, filterBy]);

  const totalPages = Math.ceil(
    filteredAndSortedEntries.length / entriesPerPage
  );
  const paginatedEntries = filteredAndSortedEntries.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
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
          filterBy={filterBy}
          onFilterChange={setFilterBy}
          totalCount={entries.length}
          filteredCount={filteredAndSortedEntries.length}
          onCreateNew={handleCreateNew}
          uniqueChapters={uniqueChapters}
          isLoading={isLoading}
        />
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {paginatedEntries.length > 0 ? (
                paginatedEntries.map(
                  (entry, index) =>
                    entry?.is_archived === false && (
                      <CozyEntryCard
                        key={entry.id}
                        entry={entry}
                        favorites={favorites}
                        setFavorites={setFavorites}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onArchive={handleArchive}
                        index={index}
                        onShowEntry={handleShowEntry}
                        getEmojiFromShortcode={getEmojiFromShortcode}
                        fetchEntries={fetchEntries}
                      />
                    )
                )
              ) : (
                <div className="col-span-full">
                  <CozyEmptyState
                    searchValue={searchValue}
                    filterBy={filterBy}
                    archivedEntryCount={archivedEntriesCount}
                  />
                </div>
              )}
            </div>
            {filteredAndSortedEntries.length > entriesPerPage && (
              <CozyPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
            {paginatedEntries.length > 0 && (
              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[rgb(var(--card))] rounded-full shadow-sm ring-1 ring-[rgb(var(--border))]">
                  <FaHeart className="text-[rgb(var(--accent))] text-xs" />
                  <span className="text-[rgb(var(--copy-secondary))] text-sm font-light">
                    {filteredAndSortedEntries.length}{" "}
                    {filteredAndSortedEntries.length === 1
                      ? "entry"
                      : "entries"}{" "}
                    {archivedEntriesCount > 0 && (
                      <Link
                        to="/archives"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        ({archivedEntriesCount} archived)
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
          isOpen={confirmationModal.isOpen}
          onClose={cancelAction}
          onConfirm={confirmAction}
          entryTitle={confirmationModal.entry?.title || ""}
          isLoading={confirmationModal.isProcessing}
          actionType={confirmationModal.actionType}
        />
      </div>
    </div>
  );
};

export default RecentEntries;
