import React, { useState, useEffect, useRef } from "react";
import {
  FaSearch,
  FaFilter,
  FaSortAlphaDown,
  FaClock,
  FaPlusCircle,
  FaSmile,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import emojiData from "emoji-datasource/emoji.json";
import { CreateMood, GetAllMood, DeleteMood } from "../APIs";
import toast from "react-hot-toast";

// Cozy color palette consistent with Chapters.tsx
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

// Convert unified code point to UTF-8 emoji
const charFromUtf16 = (utf16) =>
  String.fromCodePoint(...utf16.split("-").map((u) => "0x" + u));

// All emoji options from emoji-datasource
const emojiOptions = emojiData
  .filter((e) => !e.obsoleted_by)
  .map((e) => ({
    id: e.short_name,
    emoji: charFromUtf16(e.unified),
    label: e.name.charAt(0).toUpperCase() + e.name.slice(1).toLowerCase(),
    category: e.category,
    short_names: e.short_names,
  }));

// Group emojis by category
const emojiCategories = [...new Set(emojiOptions.map((e) => e.category))].map(
  (category) => ({
    category,
    emojis: emojiOptions.filter((e) => e.category === category),
  })
);

// Loading Skeleton Component
const MoodSkeleton = () => (
  <div className="rounded-xl overflow-hidden bg-[rgb(var(--card))] flex border border-[rgb(var(--border))] animate-pulse">
    <div className="w-1.5 bg-gray-300" />
    <div className="flex-1 p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-gray-300" />
        <div className="h-4 bg-gray-300 rounded w-24" />
      </div>
      <div className="h-3 bg-gray-200 rounded w-20" />
    </div>
    <div className="w-10 bg-gray-100" />
  </div>
);

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, moodName, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-[rgb(var(--background))] bg-opacity-20 backdrop-blur-sm">
      <div className="bg-[rgb(var(--card))] rounded-xl shadow-lg border border-[rgb(var(--border))] max-w-sm w-full p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-serif text-[rgb(var(--copy-primary))]">
            Delete Mood
          </h3>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 rounded-full hover:bg-[rgb(var(--surface))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close modal"
          >
            <FaTimes className="text-[rgb(var(--copy-muted))] text-sm" />
          </button>
        </div>
        <p className="text-sm text-[rgb(var(--copy-secondary))] mb-4">
          Are you sure you want to delete the mood "{moodName}"? This
          action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-3 py-2 bg-[rgb(var(--surface))] text-[rgb(var(--copy-secondary))] rounded-lg text-sm hover:bg-[rgb(var(--border))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-3 py-2 bg-[rgb(var(--error))] text-white rounded-lg text-sm hover:bg-[rgb(var(--error))] opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <FaSpinner className="text-xs animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Mood item component
const MoodItem = ({ mood, onDelete, isDeletingMood, deletingMoodId }) => {
  const selectedEmoji =
    emojiOptions.find((e) => e.id === mood.emoji)?.emoji || "😊";

  const isThisMoodDeleting = isDeletingMood && deletingMoodId === mood.id;

  return (
    <div
      className={`rounded-xl overflow-hidden bg-[rgb(var(--card))] flex transition-all duration-200 border border-[rgb(var(--border))] hover:shadow-md ${
        isThisMoodDeleting ? 'opacity-60' : ''
      }`}
    >
      {/* Color accent ribbon */}
      <div className="w-1.5" style={{ backgroundColor: mood.color }} />

      {/* Card Content */}
      <div className="flex-1 p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
              style={{ backgroundColor: mood.color }}
            >
              {selectedEmoji}
            </div>
            <h3 className="text-sm font-medium text-[rgb(var(--copy-primary))] capitalize truncate">
              {mood.name}
            </h3>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1 text-[rgb(var(--copy-muted))] text-xs">
            <FaClock className="text-xs" />
            <span>Created {formatDate(mood.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onDelete(mood)}
        disabled={isThisMoodDeleting}
        className={`w-10 flex items-center justify-center bg-[rgb(var(--surface))] text-[rgb(var(--copy-muted))] hover:bg-[rgb(var(--error))] hover:text-white transition-all border-l border-[rgb(var(--border))] ${
          isThisMoodDeleting ? 'cursor-not-allowed' : ''
        }`}
        title={isThisMoodDeleting ? "Deleting..." : "Delete mood"}
        aria-label={isThisMoodDeleting ? "Deleting mood" : "Delete mood"}
      >
        {isThisMoodDeleting ? (
          <FaSpinner className="text-sm animate-spin" />
        ) : (
          <FaTimes className="text-sm" />
        )}
      </button>
    </div>
  );
};

// Emoji palette component
const EmojiPalette = ({ onSelect, onClose, selectedEmojiId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const paletteRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (paletteRef.current && !paletteRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const filteredCategories = emojiCategories
    .map((category) => ({
      ...category,
      emojis: category.emojis.filter((e) =>
        [
          e.label.toLowerCase(),
          ...e.short_names.map((n) => n.toLowerCase()),
        ].some((s) => s.includes(searchTerm.toLowerCase().trim()))
      ),
    }))
    .filter((category) => category.emojis.length > 0);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-[rgb(var(--background))] bg-opacity-20 backdrop-blur-sm">
      <div
        ref={paletteRef}
        className="bg-[rgb(var(--card))] rounded-xl shadow-lg border border-[rgb(var(--border))] max-w-md w-full max-h-[70vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--border))]">
          <h3 className="text-lg font-serif text-[rgb(var(--copy-primary))]">
            Pick an Emoji
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[rgb(var(--surface))] transition-colors"
            aria-label="Close emoji palette"
          >
            <FaTimes className="text-[rgb(var(--copy-muted))] text-sm" />
          </button>
        </div>
        <div className="p-4">
          <div className="relative mb-4">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--copy-muted))] text-sm" />
            <input
              type="text"
              placeholder="Search emojis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 h-10 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg text-sm text-[rgb(var(--copy-primary))] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
          {filteredCategories.map((category) => (
            <div key={category.category} className="mb-4">
              <h4 className="text-sm font-medium text-[rgb(var(--copy-secondary))] mb-2 capitalize">
                {category.category}
              </h4>
              <div className="grid grid-cols-8 gap-1">
                {category.emojis.map((emoji) => (
                  <button
                    key={emoji.id}
                    onClick={() => {
                      onSelect(emoji.id);
                      onClose();
                    }}
                    className={`p-1.5 rounded-lg text-xl hover:bg-[rgb(var(--surface))] transition-colors ${
                      selectedEmojiId === emoji.id
                        ? "bg-blue-50 border border-blue-500"
                        : ""
                    }`}
                    title={emoji.label}
                    aria-label={emoji.label}
                  >
                    {emoji.emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {filteredCategories.length === 0 && (
            <p className="text-center text-sm text-[rgb(var(--copy-secondary))] py-4">
              No emojis found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Format date function
const formatDate = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h ago`;
  } else if (diffInMinutes < 10080) {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
};

// Main Mood component
export default function Mood() {
  const [moods, setMoods] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [newMoodName, setNewMoodName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState(emojiOptions[0].id);
  const [selectedColor, setSelectedColor] = useState(cozyColors[0]);
  const [isCustomColor, setIsCustomColor] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isEmojiPaletteOpen, setIsEmojiPaletteOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingMoodId, setDeletingMoodId] = useState(null);
  const dropdownRefs = useRef({});
  const navigate = useNavigate();

  const getAllMoods = async () => {
    try {
      setIsLoading(true);
      const response = await GetAllMood();
      if (response.fetched === true) {
        setMoods(response.data);
      } else {
        toast.error("Failed to fetch moods.");
      }
    } catch (error) {
      toast.error("Error fetching moods.");
      console.error("Error fetching moods:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllMoods();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedInsideDropdown = Object.values(dropdownRefs.current).some(
        (ref) => ref && ref.contains(event.target)
      );
      if (!clickedInsideDropdown) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredAndSortedMoods = moods
    .filter((mood) =>
      mood.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.created_at) - new Date(a.created_at);
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const handleAddMood = async () => {
    if (newMoodName.trim() && !isCreating) {
      const newMood = {
        name: newMoodName.trim(),
        emoji: selectedEmoji,
        color: selectedColor,
      };

      try {
        setIsCreating(true);
        const moodCreated = await CreateMood(newMood);
        if (moodCreated === true) {
          toast.success(`"${newMood.name}" mood created! 🎉`);
          setNewMoodName("");
          setSelectedEmoji(emojiOptions[0].id);
          setSelectedColor(cozyColors[0]);
          setIsCustomColor(false);
          getAllMoods();
        } else {
          toast.error(`Failed to create "${newMood.name}".`);
        }
      } catch (error) {
        toast.error(`Error creating "${newMood.name}".`);
      } finally {
        setIsCreating(false);
      }
    }
  };

  const openDeleteModal = (mood) => {
    setSelectedMood(mood);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedMood && !isDeleting) {
      try {
        setIsDeleting(true);
        setDeletingMoodId(selectedMood.id);
        
        const isMoodDeleted = await DeleteMood(selectedMood.id);
        if (isMoodDeleted) {
          toast.success(`"${selectedMood.name}" deleted successfully.`);
          await getAllMoods();
        } else {
          toast.error(`Failed to delete "${selectedMood.name}".`);
        }
      } catch (error) {
        toast.error(`Error deleting "${selectedMood.name}".`);
        console.error("Error deleting mood:", error);
      } finally {
        setIsDeleting(false);
        setDeletingMoodId(null);
        setIsModalOpen(false);
        setSelectedMood(null);
      }
    }
  };

  const closeModal = () => {
    if (!isDeleting) {
      setIsModalOpen(false);
      setSelectedMood(null);
    }
  };

  const toggleDropdown = (id, e) => {
    e.preventDefault();
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case "recent":
        return "Recently Created";
      case "name":
      default:
        return "Alphabetical";
    }
  };

  const handleCustomColorChange = (e) => {
    setSelectedColor(e.target.value);
    setIsCustomColor(true);
  };

  const currentEmoji =
    emojiOptions.find((e) => e.id === selectedEmoji)?.emoji || "😊";

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-16">
            <div className="p-4">
              <div className="p-2 bg-[rgb(var(--card))] rounded-lg shadow-sm border border-[rgb(var(--border))]">
                <span className="text-2xl">😄</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-serif text-[rgb(var(--copy-primary))] font-semibold">
                My Moods
              </h1>
              <p className="text-[rgb(var(--copy-secondary))] text-sm">
                Create and organize your own custom moods.
              </p>
            </div>
          </div>

          <div className="bg-[rgb(var(--card))] rounded-xl p-4 shadow-sm border border-[rgb(var(--border))]">
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
              <div className="relative flex-1 max-w-md w-full">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--copy-muted))] text-sm" />
                <input
                  type="text"
                  placeholder="Search moods..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 h-10 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg text-sm text-[rgb(var(--copy-primary))] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <div
                  className="relative"
                  ref={(el) => (dropdownRefs.current["sort"] = el)}
                >
                  <button
                    onClick={(e) => toggleDropdown("sort", e)}
                    className="flex items-center gap-2 px-3 py-2 h-10 bg-[rgb(var(--surface))] hover:bg-[rgb(var(--surface))] rounded-lg text-sm border border-[rgb(var(--border))]"
                  >
                    <FaFilter className="text-[rgb(var(--copy-muted))] text-xs" />
                    <span className="text-[rgb(var(--copy-secondary))]">
                      {getSortLabel()}
                    </span>
                  </button>

                  {activeDropdown === "sort" && (
                    <div className="absolute right-0 top-full mt-1 w-44 bg-[rgb(var(--card))] rounded-lg shadow-md border border-[rgb(var(--border))] z-20">
                      <button
                        onClick={() => {
                          setSortBy("name");
                          setActiveDropdown(null);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-[rgb(var(--surface))] flex items-center gap-2 text-xs ${
                          sortBy === "name"
                            ? "bg-amber-50 text-amber-600"
                            : "text-[rgb(var(--copy-primary))]"
                        }`}
                      >
                        <FaSortAlphaDown className="text-xs" />
                        Alphabetical
                      </button>
                      <button
                        onClick={() => {
                          setSortBy("recent");
                          setActiveDropdown(null);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-[rgb(var(--surface))] flex items-center gap-2 text-xs ${
                          sortBy === "recent"
                            ? "bg-amber-50 text-amber-600"
                            : "text-[rgb(var(--copy-primary))]"
                        }`}
                      >
                        <FaClock className="text-xs" />
                        Recently Created
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface))]">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    placeholder="Mood name..."
                    value={newMoodName}
                    onChange={(e) => setNewMoodName(e.target.value)}
                    disabled={isCreating}
                    className="w-full px-3 py-2 h-10 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg text-sm text-[rgb(var(--copy-primary))] focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60"
                  />
                </div>
                <button
                  onClick={() => setIsEmojiPaletteOpen(true)}
                  disabled={isCreating}
                  className="flex items-center gap-2 px-3 py-2 h-10 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg text-2xl hover:bg-[rgb(var(--surface))] disabled:opacity-60"
                >
                  {currentEmoji}
                  <FaSmile className="text-sm text-[rgb(var(--copy-muted))]" />
                </button>
                <div className="flex items-center gap-2">
                  {cozyColors.slice(0, 5).map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setIsCustomColor(false);
                      }}
                      disabled={isCreating}
                      className="w-6 h-6 rounded-full border hover:scale-110 transition-transform disabled:opacity-60"
                      style={{
                        backgroundColor: color,
                        borderColor:
                          !isCustomColor && selectedColor === color
                            ? "rgb(var(--cta))"
                            : "rgb(var(--border))",
                        borderWidth:
                          !isCustomColor && selectedColor === color
                            ? "2px"
                            : "1px",
                      }}
                      title={color}
                    />
                  ))}
                  <div className="relative w-6 h-6">
                    <input
                      type="color"
                      value={selectedColor}
                      onChange={handleCustomColorChange}
                      disabled={isCreating}
                      className="absolute w-10 h-10 p-0 border-none cursor-pointer disabled:opacity-60"
                      style={{
                        top: "-8px",
                        left: "-8px",
                        opacity: 0,
                        zIndex: 10,
                      }}
                    />
                    <button
                      onClick={() => {
                        const input = document.querySelector(
                          'input[type="color"]'
                        );
                        input?.click();
                      }}
                      disabled={isCreating}
                      className="absolute w-6 h-6 rounded-full border hover:scale-110 transition-transform disabled:opacity-60"
                      style={{
                        backgroundColor: selectedColor,
                        borderColor: isCustomColor
                          ? "rgb(var(--cta))"
                          : "rgb(var(--border))",
                        borderWidth: isCustomColor ? "2px" : "1px",
                        zIndex: 5,
                      }}
                      title="Choose custom color"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddMood}
                  disabled={!newMoodName.trim() || isCreating}
                  className={`flex items-center gap-2 px-3 py-2 h-10 rounded-lg text-sm font-medium ${
                    newMoodName.trim() && !isCreating
                      ? "shadow-sm"
                      : "cursor-not-allowed opacity-60"
                  }`}
                  style={{
                    backgroundColor: newMoodName.trim() && !isCreating
                      ? "rgb(var(--cta))"
                      : "rgb(var(--copy-muted))",
                    color: "rgb(var(--cta-text))",
                  }}
                >
                  {isCreating ? (
                    <FaSpinner className="text-xs animate-spin" />
                  ) : (
                    <FaPlusCircle className="text-xs" />
                  )}
                  {isCreating ? "Creating..." : "Add Mood"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            // Show skeleton loaders while loading
            Array.from({ length: 6 }).map((_, index) => (
              <MoodSkeleton key={index} />
            ))
          ) : filteredAndSortedMoods.length > 0 ? (
            filteredAndSortedMoods.map((mood) => (
              <MoodItem 
                key={mood.id} 
                mood={mood} 
                onDelete={openDeleteModal}
                isDeletingMood={isDeleting}
                deletingMoodId={deletingMoodId}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="relative inline-block mb-4">
                <div className="absolute -top-1 -left-1 w-full h-full bg-amber-100 rounded-full transform rotate-12 opacity-60"></div>
                <div className="relative p-4 rounded-full bg-[rgb(var(--card))] shadow-sm border border-[rgb(var(--border))]">
                  <span className="text-2xl">😊</span>
                </div>
              </div>
              <p className="text-[rgb(var(--copy-secondary))] text-sm">
                {searchTerm ? "No moods match your search." : "No moods found. Start by creating a new mood above!"}
              </p>
            </div>
          )}
        </div>

        <DeleteConfirmationModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onConfirm={confirmDelete}
          moodName={selectedMood?.name || ""}
          isDeleting={isDeleting}
        />

        {isEmojiPaletteOpen && (
          <EmojiPalette
            onSelect={setSelectedEmoji}
            onClose={() => setIsEmojiPaletteOpen(false)}
            selectedEmojiId={selectedEmoji}
          />
        )}
      </div>
    </div>
  );
}