import React, { useState, useEffect, useRef } from "react";
import {
  FaArchive,
  FaBookOpen,
  FaFileAlt,
  FaEllipsisH,
  FaUndo,
  FaEye,
  FaTrash,
  FaMeh,
  FaGrin,
  FaSmile,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";

import {
  GetAllChapter,
  GetAllEntries,
  DeleteEntry,
  DeleteChapter,
  ArchiveChapter,
  ArchiveEntry,
} from "../APIs";
import emoji from "emoji-datasource/emoji.json";

// Utility function to format dates
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Mood data mapping
const getMoodData = (mood) => {
  switch (mood) {
    case "nostalgic":
      return { icon: FaMeh, label: "Nostalgic", color: "#9ca3af" };
    case "curious":
      return { icon: FaGrin, label: "Curious", color: "#f4a261" };
    default:
      return { icon: FaSmile, label: "Unknown", color: "#6b7280" };
  }
};

const getEmojiFromShortcode = (shortcode) => {
  const emojiData = emoji.find((e) => e.short_name === shortcode);
  if (emojiData && emojiData.unified) {
    return String.fromCodePoint(parseInt(emojiData.unified, 16));
  }
  return "😐";
};

// Toast Component
const Toast = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";
  const Icon = type === "success" ? FaCheck : FaExclamationTriangle;

  return (
    <div
      className={`fixed top-4 right-4 z-[200] ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 min-w-[300px] animate-slide-in`}
    >
      <Icon className="text-sm flex-shrink-0" />
      <span className="text-sm flex-1">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
      >
        <FaTimes className="text-xs" />
      </button>
    </div>
  );
};

// Confirmation Modal Component
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  confirmColor = "rgb(var(--error))",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-[rgb(var(--background))] bg-opacity-20 backdrop-blur-sm">
      <div className="bg-[rgb(var(--card))] rounded-xl shadow-lg border border-[rgb(var(--border))] max-w-sm w-full p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-serif text-[rgb(var(--copy-primary))]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[rgb(var(--surface))] transition-colors"
            aria-label="Close modal"
          >
            <FaTimes className="text-[rgb(var(--copy-muted))] text-sm" />
          </button>
        </div>
        <p className="text-sm text-[rgb(var(--copy-secondary))] mb-4">
          {message}
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 bg-[rgb(var(--surface))] text-[rgb(var(--copy-secondary))] rounded-lg text-sm hover:bg-[rgb(var(--border))] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-2 rounded-lg text-sm text-white transition-colors hover:opacity-80"
            style={{ backgroundColor: confirmColor }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Components
const ArchiveHeader = () => (
  <div className="flex items-center gap-2 mb-4">
    <div className="p-2 bg-[rgb(var(--card))] rounded-lg shadow-sm border border-[rgb(var(--border))]">
      <FaBookOpen className="text-amber-600 text-lg" />
    </div>
    <div>
      <h1 className="text-2xl font-serif text-[rgb(var(--copy-primary))] font-semibold">
        My Archives
      </h1>
      <p className="text-[rgb(var(--copy-secondary))] text-sm">
        Your Preserved stories and chapters.
      </p>
    </div>
  </div>
);

const ArchiveSection = ({ title, children }) => (
  <section className="mb-12">
    <h2 className="text-xl font-serif text-[rgb(var(--copy-primary))] mb-4 font-semibold">
      {title}
    </h2>
    {children}
  </section>
);

const ArchivedProjectCard = ({ chapter, onChapterUpdate, showToast }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

  const handleUnarchive = async () => {
    try {
      const result = await ArchiveChapter(chapter.id, false);
      if (result) {
        showToast(
          `"${chapter.title}" has been unarchived successfully!`,
          "success"
        );
        setShowUnarchiveModal(false);
        setShowMenu(false);
        onChapterUpdate();
      } else {
        showToast(
          `Failed to unarchive "${chapter.title}". Please try again.`,
          "error"
        );
      }
    } catch (error) {
      console.error("Error unarchiving chapter:", error);
      showToast(
        `An error occurred while unarchiving "${chapter.title}".`,
        "error"
      );
    }
  };

  const handleDelete = async () => {
    try {
      const result = await DeleteChapter(chapter.id);
      if (result) {
        showToast(
          `"${chapter.title}" has been deleted permanently.`,
          "success"
        );
        setShowDeleteModal(false);
        setShowMenu(false);
        onChapterUpdate();
      } else {
        showToast(
          `Failed to delete "${chapter.title}". Please try again.`,
          "error"
        );
      }
    } catch (error) {
      console.error("Error deleting chapter:", error);
      showToast(
        `An error occurred while deleting "${chapter.title}".`,
        "error"
      );
    }
  };

  return (
    <>
      <div
        className={`rounded-xl overflow-visible bg-[rgb(var(--card))] group flex flex-col transition-all duration-200 border border-[rgb(var(--border))]  hover:shadow-md ${
          showMenu ? "relative z-50" : "relative z-10"
        }`}
      >
        <div
          className="h-1.5 rounded-t-xl"
          style={{ backgroundColor: chapter?.color }}
        />
        <div className="p-3">
          <div className="flex justify-between items-start">
            <h3 className="text-base font-serif font-semibold text-[rgb(var(--copy-primary))] truncate">
              {chapter?.title}
            </h3>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded hover:bg-[rgb(var(--surface))] transition-colors duration-150"
              >
                <FaEllipsisH className="text-[rgb(var(--copy-muted))]" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg shadow-lg p-1 z-[100] min-w-[140px]">
                  <button
                    className="flex items-center gap-2 px-3 py-2 text-sm w-full  hover:text-blue-600 text-[rgb(var(--copy-primary))] rounded transition-colors duration-150 cursor-pointer"
                    onClick={() => {
                      setShowUnarchiveModal(true);
                      setShowMenu(false);
                    }}
                  >
                    <FaUndo className="text-xs" /> Unarchive
                  </button>

                  <button
                    className="flex items-center gap-2 px-3 py-2 text-sm w-full  hover:text-red-600 rounded transition-colors duration-150"
                    onClick={() => {
                      setShowDeleteModal(true);
                      setShowMenu(false);
                    }}
                  >
                    <FaTrash className="text-xs" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="text-sm text-[rgb(var(--copy-secondary))] mt-1">
            {chapter?.entries?.length} entries
          </div>
          <div className="text-xs text-[rgb(var(--copy-muted))] mt-2">
            Archived {formatDate(chapter?.updated_at)}
          </div>
        </div>
      </div>

      {/* Unarchive Confirmation Modal */}
      <ConfirmationModal
        isOpen={showUnarchiveModal}
        onClose={() => setShowUnarchiveModal(false)}
        onConfirm={handleUnarchive}
        title="Unarchive Chapter"
        message={`Are you sure you want to unarchive "${chapter?.title}"? This will move it back to your active chapters.`}
        confirmText="Unarchive"
        confirmColor="#3b82f6"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Chapter"
        message={`Are you sure you want to delete "${chapter?.title}"? This action cannot be undone and will permanently remove the chapter and all its entries.`}
        confirmText="Delete"
        confirmColor="rgb(var(--error))"
      />
    </>
  );
};

const ArchivedEntryCard = ({ entry, onEntryUpdate, showToast }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const menuRef = useRef(null);

  const MoodIcon = getEmojiFromShortcode(entry?.mood?.emoji);

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

  const handleUnarchive = async () => {
    try {
      const result = await ArchiveEntry(entry.id, false);
      if (result) {
        showToast(
          `"${entry.title}" has been unarchived successfully!`,
          "success"
        );
        setShowUnarchiveModal(false);
        setShowMenu(false);
        onEntryUpdate();
      } else {
        showToast(
          `Failed to unarchive "${entry.title}". Please try again.`,
          "error"
        );
      }
    } catch (error) {
      console.error("Error unarchiving entry:", error);
      showToast(
        `An error occurred while unarchiving "${entry.title}".`,
        "error"
      );
    }
  };

  const handleDelete = async () => {
    try {
      const result = await DeleteEntry(entry.id);
      if (result) {
        showToast(`"${entry.title}" has been deleted permanently.`, "success");
        setShowDeleteModal(false);
        setShowMenu(false);
        onEntryUpdate();
      } else {
        showToast(
          `Failed to delete "${entry.title}". Please try again.`,
          "error"
        );
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      showToast(`An error occurred while deleting "${entry.title}".`, "error");
    }
  };

  return (
    <>
      <div
        className={`rounded-xl overflow-visible bg-[rgb(var(--card))] group flex flex-col transition-all duration-200 border border-[rgb(var(--border))] hover:shadow-md hover:shadow-md ${
          showMenu ? "relative z-50" : "relative z-10"
        }`}
      >
        <div
          className="h-1.5 rounded-t-xl"
          style={{ backgroundColor: entry?.chapter?.color }}
        />
        <div className="p-3">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-[rgb(var(--copy-primary))] truncate">
              {entry.title}
            </h3>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded hover:bg-[rgb(var(--surface))] transition-colors duration-150"
              >
                <FaEllipsisH className="text-[rgb(var(--copy-muted))]" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg shadow-lg p-1 z-[100] min-w-[120px]">
                  <button
                    className="flex items-center gap-2 px-3 py-2 text-sm w-full  hover:text-blue-600 text-[rgb(var(--copy-primary))] rounded transition-colors duration-150 cursor-pointer"
                    onClick={() => {
                      setShowUnarchiveModal(true);
                      setShowMenu(false);
                    }}
                  >
                    <FaUndo className="text-xs" /> Unarchive
                  </button>

                  <button
                    className="flex items-center gap-2 px-3 py-2 text-sm w-full  hover:text-red-600 rounded transition-colors duration-150"
                    onClick={() => {
                      setShowDeleteModal(true);
                      setShowMenu(false);
                    }}
                  >
                    <FaTrash className="text-xs" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-[rgb(var(--copy-secondary))] line-clamp-2 mb-2">
            {entry?.content}
          </p>
          <div className="flex items-center gap-2 mb-2">
            {entry?.collection?.map((tag) => (
              <span
                key={tag?.name}
                className="text-xs px-1.5 py-0.5 rounded-2xl"
                style={{
                  backgroundColor: `${tag?.color}33`,
                  color: tag?.color,
                }}
              >
                #{tag.name}
              </span>
            ))}
            <span
              className="flex items-center gap-1 text-xs"
              style={{ color: entry?.mood?.color }}
            >
              {MoodIcon} {entry?.mood?.name}
            </span>
          </div>
          <div className="text-xs text-[rgb(var(--copy-muted))]">
            Archived {formatDate(entry?.updated_at)}
          </div>
        </div>
      </div>

      {/* Unarchive Confirmation Modal */}
      <ConfirmationModal
        isOpen={showUnarchiveModal}
        onClose={() => setShowUnarchiveModal(false)}
        onConfirm={handleUnarchive}
        title="Unarchive Entry"
        message={`Are you sure you want to unarchive "${entry?.title}"? This will move it back to your active entries.`}
        confirmText="Unarchive"
        confirmColor="#3b82f6"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Entry"
        message={`Are you sure you want to delete "${entry?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="rgb(var(--error))"
      />
    </>
  );
};

const Archives = () => {
  const [archivedEntries, setArchivedEntries] = useState([]);
  const [archivedChapters, setArchivedChapters] = useState([]);
  const [toast, setToast] = useState({
    message: "",
    type: "",
    isVisible: false,
  });

  const showToast = (message, type) => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast({ ...toast, isVisible: false });
  };

  const getArchivedEntries = async () => {
    const archived = await GetAllEntries();
    console.log("get all entries", archived?.data);
    const archivedEntries = archived?.data.filter((entry) => {
      return entry?.is_archived; // Added return statement
    });
    setArchivedEntries(archivedEntries);
  };

  const getArchivedChapters = async () => {
    const archived = await GetAllChapter();
    console.log("get all chapters", archived?.data);
    const archivedChapters = archived?.data.filter((chapter) => {
      return chapter.is_archived; // Added return statement
    });
    setArchivedChapters(archivedChapters);
  };

  useEffect(() => {
    getArchivedEntries();
    getArchivedChapters();
  }, []);

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <ArchiveHeader />
        <ArchiveSection title="Archived Projects">
          {archivedChapters.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {archivedChapters.map((chapter) => (
                <ArchivedProjectCard
                  key={chapter.id}
                  chapter={chapter}
                  onChapterUpdate={getArchivedChapters}
                  showToast={showToast}
                />
              ))}
            </div>
          ) : (
            <p className="text-[rgb(var(--copy-muted))] text-sm">
              No archived projects yet.
            </p>
          )}
        </ArchiveSection>
        <ArchiveSection title="Archived Entries">
          {archivedEntries.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {archivedEntries.map((entry) => (
                <ArchivedEntryCard
                  key={entry.id}
                  entry={entry}
                  onEntryUpdate={getArchivedEntries}
                  showToast={showToast}
                />
              ))}
            </div>
          ) : (
            <p className="text-[rgb(var(--copy-muted))] text-sm">
              No archived entries yet.
            </p>
          )}
        </ArchiveSection>
      </div>
    </div>
  );
};

export default Archives;
