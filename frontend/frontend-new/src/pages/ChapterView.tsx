import React, { useState, useEffect, useRef } from "react";
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
import { GetAllEntries } from "../APIs";

// Format date utility
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

// Entry item component
const EntryItem = ({
  entry,
  index,
  chapterId,
  onView,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

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

  const handleView = (e) => {
    e.stopPropagation();
    onView(entry);
    setShowMenu(false);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(entry);
    setShowMenu(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(entry);
    setShowMenu(false);
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    onToggleFavorite(entry);
    setShowMenu(false);
  };

  const handleEntryClick = () => {
    onView(entry);
  };

  return (
    <div className="relative group">
      <div
        className="flex items-start p-3 bg-[rgb(var(--card))] rounded-lg hover:bg-[rgb(var(--surface))] transition-all duration-200 border border-[rgb(var(--border))] group-hover:shadow-md cursor-pointer"
        onClick={handleEntryClick}
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
            <div className="relative flex-shrink-0" ref={menuRef}>
              <button
                onClick={toggleMenu}
                className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-[rgb(var(--surface))] transition-all duration-200"
                aria-label="Entry options"
              >
                <FaEllipsisH className="text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-primary))] text-xs" />
              </button>
              {showMenu && (
                <div
                  className="absolute right-0 top-full mt-1 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg shadow-lg p-1 z-20 min-w-[160px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={handleView}
                    className="flex items-center gap-2 px-3 py-2 text-xs w-full hover:bg-[rgb(var(--surface))] text-[rgb(var(--copy-primary))] rounded-md transition-colors"
                    aria-label="View entry"
                  >
                    <FaFileAlt className="text-[rgb(var(--copy-muted))]" /> View
                    Entry
                  </button>
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-3 py-2 text-xs w-full hover:bg-[rgb(var(--surface))] text-[rgb(var(--copy-primary))] rounded-md transition-colors"
                    aria-label="Edit entry"
                  >
                    <FaEdit className="text-[rgb(var(--copy-muted))]" /> Edit
                    Entry
                  </button>
                  <button
                    onClick={handleToggleFavorite}
                    className="flex items-center gap-2 px-3 py-2 text-xs w-full hover:bg-[rgb(var(--surface))] text-[rgb(var(--copy-primary))] rounded-md transition-colors"
                    aria-label={
                      entry.is_favourite
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    <FaHeart
                      className={`text-xs ${
                        entry.is_favourite
                          ? "text-[rgb(var(--accent))]"
                          : "text-[rgb(var(--copy-muted))]"
                      }`}
                    />
                    {entry.is_favourite ? "Remove Favorite" : "Add Favorite"}
                  </button>
                  <div className="border-t border-[rgb(var(--border))] my-1"></div>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-3 py-2 text-xs w-full hover:bg-red-50 text-red-600 rounded-md transition-colors"
                    aria-label="Delete entry"
                  >
                    <FaTrash className="text-xs" /> Delete Entry
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-[rgb(var(--copy-secondary))] mt-2 line-clamp-2 leading-relaxed">
            {entry.content.substring(0, 150)}...
          </p>
          {entry.collection?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {entry.collection.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-0.5 text-xs font-medium rounded-full text-[rgb(var(--cta-text))]"
                  style={{ backgroundColor: tag.color }}
                >
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
                <span>•</span>
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
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const handleViewEntry = async (entryPassed) => {
    console.log("going to entry view with", chapter);

    const getEntry = await GetAllEntries();

    let entry = getEntry.data.filter((entry) => entry.id == entryPassed.id);
    entry = entry[0];
    console.log("going to entryview from chapter entries list with", entry);

    navigate("/entry-view", {
      state: { entry },
    });
  };

  const handleEditEntry = (entry) => {
    navigate("/edit-entry", {
      state: {
        entry,
        chapter: {
          id: chapter.id,
          title: chapter.title,
          color: chapter.color,
        },
      },
    });
  };

  const handleDeleteEntry = (entry) => {
    // Show confirmation toast or modal
    if (window.confirm(`Are you sure you want to delete "${entry.title}"?`)) {
      toast.success("Entry deleted successfully");
      // Here you would typically make an API call to delete the entry
    }
  };

  const handleToggleFavorite = (entry) => {
    const action = entry.is_favourite ? "removed from" : "added to";
    toast.success(`Entry ${action} favorites`);
    // Here you would typically make an API call to toggle favorite status
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddEntry = () => {
    navigate("/create-entry", {
      state: {
        chapter: {
          id: chapter.id,
          title: chapter.title,
          color: chapter.color,
        },
      },
    });
  };

  const filteredAndSortedEntries =
    chapter?.entries
      ?.filter(
        (entry) =>
          !entry.is_archived &&
          (entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.collection?.some((tag) =>
              tag.name.toLowerCase().includes(searchTerm.toLowerCase())
            ))
      )
      .sort((a, b) => {
        switch (sortBy) {
          case "name":
            return a.title.localeCompare(b.title);
          case "recent":
          default:
              // @ts-ignore
            return new Date(b.updated_at) - new Date(a.updated_at);
        }
      }) || [];

  const getSortLabel = () => {
    switch (sortBy) {
      case "name":
        return "Alphabetical";
      case "recent":
      default:
        return "Recently Updated";
    }
  };

  if (!chapter) {
    return (
      <div className="min-h-screen px-4 py-8 bg-[rgb(var(--background))]">
        <div className="max-w-3xl mx-auto text-center py-12">
          <div className="relative inline-block mb-4">
            <div className="absolute -top-1 -left-1 w-full h-full bg-[rgb(var(--accent-subtle))] rounded-full transform rotate-12 opacity-60"></div>
            <div className="relative p-4 rounded-full bg-[rgb(var(--card))] shadow-sm border border-[rgb(var(--border))]">
              <FaBookOpen className="text-xl text-[rgb(var(--cta))]" />
            </div>
          </div>
          <h2 className="text-lg font-serif text-[rgb(var(--copy-primary))] mb-2">
            Chapter Not Found
          </h2>
          <p className="text-[rgb(var(--copy-secondary))] text-sm mb-4">
            The chapter you're looking for doesn't exist or couldn't be loaded.
          </p>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-[rgb(var(--card))] text-[rgb(var(--copy-primary))] hover:bg-[rgb(var(--surface))] hover:text-[rgb(var(--cta))] rounded-lg border border-[rgb(var(--border))]"
            aria-label="Go back"
          >
            <FaArrowLeft size={14} />
            <span className="font-medium">Back to Chapters</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg bg-[rgb(var(--card))] text-[rgb(var(--copy-primary))] hover:bg-[rgb(var(--surface))] hover:text-[rgb(var(--cta))] transition-all duration-200 border border-[rgb(var(--border))]"
              aria-label="Go back"
            >
              <FaArrowLeft size={14} />
            </button>
            <div
              className="p-3 rounded-lg shadow-sm border border-[rgb(var(--border))]"
              style={{ backgroundColor: `${chapter.color}20` }}
            >
              <FaBookOpen
                className="text-lg"
                style={{ color: chapter.color }}
              />
            </div>
            <div>
              <h1 className="text-2xl font-serif text-[rgb(var(--copy-primary))] font-semibold capitalize">
                {chapter.title}
              </h1>
              <p className="text-[rgb(var(--copy-secondary))] text-sm">
                {filteredAndSortedEntries.length} of {chapter.entries.length}{" "}
                {chapter.entries.length === 1 ? "entry" : "entries"}
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
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg text-sm text-[rgb(var(--copy-primary))] focus:ring-2 focus:ring-[rgb(var(--cta))] focus:border-transparent transition-all placeholder-[rgb(var(--copy-muted))]"
                  autoFocus
                  aria-label="Search entries"
                />
              </div>
              <div className="flex gap-3">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() =>
                      setActiveDropdown(
                        activeDropdown === "sort" ? null : "sort"
                      )
                    }
                    className="flex items-center gap-2 px-3 py-2.5 bg-[rgb(var(--surface))] hover:bg-[rgb(var(--surface))] rounded-lg text-sm border border-[rgb(var(--border))] text-[rgb(var(--copy-secondary))] hover:text-[rgb(var(--copy-primary))] transition-colors"
                    aria-label={`Sort by ${getSortLabel()}`}
                  >
                    <FaFilter className="text-[rgb(var(--copy-muted))] text-xs" />
                    <span>{getSortLabel()}</span>
                  </button>
                  {activeDropdown === "sort" && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-[rgb(var(--card))] rounded-lg shadow-lg border border-[rgb(var(--border))] z-20 overflow-hidden">
                      <button
                        onClick={() => {
                          setSortBy("name");
                          setActiveDropdown(null);
                        }}
                        className={`w-full text-left px-3 py-2.5 hover:bg-[rgb(var(--surface))] flex items-center gap-2 text-xs transition-colors ${
                          sortBy === "name"
                            ? "bg-[rgb(var(--surface))] text-[rgb(var(--cta))]"
                            : "text-[rgb(var(--copy-primary))]"
                        }`}
                        aria-label="Sort alphabetically"
                      >
                        <FaSortAlphaDown className="text-xs" />
                        Alphabetical
                      </button>
                      <button
                        onClick={() => {
                          setSortBy("recent");
                          setActiveDropdown(null);
                        }}
                        className={`w-full text-left px-3 py-2.5 hover:bg-[rgb(var(--surface))] flex items-center gap-2 text-xs transition-colors ${
                          sortBy === "recent"
                            ? "bg-[rgb(var(--surface))] text-[rgb(var(--cta))]"
                            : "text-[rgb(var(--copy-primary))]"
                        }`}
                        aria-label="Sort by recently updated"
                      >
                        <FaSortRecent className="text-xs" />
                        Recently Updated
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleAddEntry}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[rgb(var(--cta))] hover:bg-[rgb(var(--cta-active))] text-[rgb(var(--cta-text))] rounded-lg text-sm font-medium shadow-sm transition-all"
                  aria-label="Add new entry"
                >
                  <FaPlusCircle className="text-xs" />
                  New Entry
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chapter Card */}
        <div className="rounded-xl overflow-hidden bg-[rgb(var(--card))] transition-all duration-200 border border-[rgb(var(--border))] shadow-sm">
          {/* Color accent bar */}
          <div className="h-1.5" style={{ backgroundColor: chapter.color }} />

          {/* Entries Section */}
          <div className="p-4 space-y-3 bg-[rgb(var(--card))]">
            {filteredAndSortedEntries.length > 0 ? (
              filteredAndSortedEntries.map((entry, idx) => (
                <EntryItem
                  key={entry.id}
                  entry={entry}
                  index={idx}
                  chapterId={chapter.id}
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
                  {searchTerm ? "No matching entries found" : "No entries yet"}
                </p>
                {searchTerm ? (
                  <p className="text-[rgb(var(--copy-muted))] text-xs mb-4">
                    Try adjusting your search terms
                  </p>
                ) : (
                  <p className="text-[rgb(var(--copy-muted))] text-xs mb-4">
                    Start writing your first entry
                  </p>
                )}
                {!searchTerm && (
                  <button
                    onClick={handleAddEntry}
                    className="flex items-center gap-2 px-4 py-2 mt-2 bg-[rgb(var(--cta))] hover:bg-[rgb(var(--cta-active))] text-[rgb(var(--cta-text))] rounded-lg text-sm mx-auto transition-all"
                    aria-label="Add new entry"
                  >
                    <FaPlusCircle className="text-xs" />
                    Add Entry
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
              <span>•</span>
              <FaBookOpen className="text-xs" />
              <span>
                {filteredAndSortedEntries.length}/{chapter.entries.length}{" "}
                entries
              </span>
            </div>
            <div className="flex items-center gap-1 text-[rgb(var(--copy-muted))] text-xs">
              {chapter.collection?.length > 0 && (
                <span
                  className="px-2 py-0.5 text-xs font-medium rounded-full text-[rgb(var(--cta-text))]"
                  style={{ backgroundColor: chapter.collection[0].color }}
                >
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
