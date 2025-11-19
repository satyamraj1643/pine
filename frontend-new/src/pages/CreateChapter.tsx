import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaPlusCircle,
  FaArrowLeft,
  FaSearch,
  FaCheck,
  FaTimes,
  FaBookOpen,
  FaFileAlt,
  FaPalette,
  FaPlus,
  FaChevronDown,
  FaClock,
  FaHashtag,
  FaTag,
} from "react-icons/fa";
import { GetAllCollections, CreateNewChapter, UpdateChapter } from "../APIs";
import toast from "react-hot-toast";

// Color options for chapters using CSS variables

const chapterColors = [
  { name: "Sunset Orange", value: "#FF5722" },
  { name: "Ocean Blue", value: "#2196F3" },
  { name: "Forest Green", value: "#4CAF50" },
  { name: "Rose Pink", value: "#F44336" },
  { name: "Violet Purple", value: "#9C27B0" },
  { name: "Slate Gray", value: "#607D8B" },
  { name: "Sage Green", value: "#8BC34A" },
  { name: "Lavender", value: "#9E9E9E" },
];

// Mock existing entries for selection
const mockEntries = [
  {
    id: "entry-1",
    title: "Morning Coffee Reflections",
    content:
      "The steam rises from my cup as I watch the sunrise through the kitchen window. There's something magical about these quiet moments before the world wakes up. The aroma of freshly ground beans fills the air, creating a sensory backdrop for contemplation.",
    createdAt: "2024-06-15T08:30:00Z",
    wordCount: 245,
    tags: [
      { name: "morning", color: "rgb(var(--warning))" },
      { name: "coffee", color: "rgb(var(--success))" },
    ],
  },
  {
    id: "entry-2",
    title: "Garden Discoveries",
    content:
      "Today I found a new flower blooming in the corner of my garden that I hadn't noticed before. Its delicate petals unfurled like a secret being revealed. Nature has a way of surprising us when we least expect it, reminding us to stay curious and observant.",
    createdAt: "2024-06-14T16:45:00Z",
    wordCount: 189,
    tags: [
      { name: "nature", color: "rgb(var(--success))" },
      { name: "garden", color: "rgb(var(--error))" },
    ],
  },
  {
    id: "entry-3",
    title: "Evening Thoughts",
    content:
      "As the day winds down, I find myself reflecting on the small moments that made it meaningful. The conversations, the laughter, the quiet pauses between activities. Sometimes the most profound insights come not from grand gestures but from simple observations.",
    createdAt: "2024-06-13T20:15:00Z",
    wordCount: 312,
    tags: [
      { name: "reflection", color: "rgb(var(--error))" },
      { name: "evening", color: "rgb(var(--accent))" },
    ],
  },
  {
    id: "entry-4",
    title: "Creative Inspiration",
    content:
      "Sometimes the best ideas come when you least expect them - in the shower, during a walk, or while washing dishes. Today was one of those days when creativity struck like lightning, illuminating possibilities I hadn't considered before.",
    createdAt: "2024-06-12T14:20:00Z",
    wordCount: 278,
    tags: [
      { name: "creativity", color: "rgb(var(--accent))" },
      { name: "inspiration", color: "rgb(var(--cta))" },
    ],
  },
  {
    id: "entry-5",
    title: "Weekend Adventures",
    content:
      "Explored a new hiking trail today with friends. The path wound through dense forest, opening up to breathtaking vistas. We packed sandwiches and spent hours talking about everything and nothing, the way good friends do.",
    createdAt: "2024-06-11T12:00:00Z",
    wordCount: 156,
    tags: [
      { name: "adventure", color: "rgb(var(--success))" },
      { name: "friends", color: "rgb(var(--warning))" },
    ],
  },
  {
    id: "entry-6",
    title: "Rainy Day Musings",
    content:
      "The rain creates a symphony against the windows, each drop contributing to nature's percussion. I've always found rainy days conducive to introspection and creativity. There's something about the gray sky that makes indoor spaces feel more cozy and thoughts more profound.",
    createdAt: "2024-06-10T15:30:00Z",
    wordCount: 203,
    tags: [
      { name: "weather", color: "rgb(var(--cta))" },
      { name: "introspection", color: "rgb(var(--error))" },
    ],
  },
  {
    id: "entry-7",
    title: "Cooking Experiments",
    content:
      "Tried a new recipe today - a fusion of Italian and Asian flavors that shouldn't work but somehow does. Cooking is like chemistry, requiring precision and intuition in equal measure. The kitchen became my laboratory, and dinner was the successful experiment.",
    createdAt: "2024-06-09T18:45:00Z",
    wordCount: 224,
    tags: [
      { name: "cooking", color: "rgb(var(--warning))" },
      { name: "experiment", color: "rgb(var(--accent))" },
    ],
  },
  {
    id: "entry-8",
    title: "Digital Detox Day",
    content:
      "Spent the entire day without screens, phones, or digital distractions. Read a physical book, wrote letters by hand, and had face-to-face conversations. It's remarkable how much mental space opens up when we disconnect from the digital noise.",
    createdAt: "2024-06-08T10:15:00Z",
    wordCount: 167,
    tags: [
      { name: "mindfulness", color: "rgb(var(--success))" },
      { name: "digital", color: "rgb(var(--copy-secondary))" },
    ],
  },
];

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
};

// Helper function to determine if text should be white or dark based on background color
const getTextColor = (backgroundColor: string): string => {
  if (
    backgroundColor.includes("--background") ||
    backgroundColor.includes("--surface") ||
    backgroundColor.includes("--card")
  ) {
    return "rgb(var(--copy-primary))";
  }
  if (
    backgroundColor.includes("--copy-primary") ||
    backgroundColor.includes("--copy-secondary")
  ) {
    return "rgb(var(--cta-text))";
  }
  return "rgb(var(--cta-text))";
};

const CreateChapter: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState: any = location.state || {};
  const isEdit = locationState?.edit === true;

  // Form state
  const [title, setTitle] = useState(
    locationState?.title || locationState?.Title || ""
  );
  const [description, setDescription] = useState(
    locationState?.description || locationState?.Description || ""
  );
  const [selectedColor, setSelectedColor] = useState(
    locationState?.color || locationState?.Color || "#efbf10"
  );
  const [selectedEntries, setSelectedEntries] = useState(
    locationState?.entries || locationState?.Entries || []
  );
  const [selectedTags, setSelectedTags] = useState(
    locationState?.collection || locationState?.Collections || []
  );
  const [tags, setTags] = useState([]);

  // UI state
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showEntryDropdown, setShowEntryDropdown] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [entrySearch, setEntrySearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");

  // Refs for dropdown management
  const colorDropdownRef = useRef<HTMLDivElement>(null);
  const entryDropdownRef = useRef<HTMLDivElement>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch tags
  useEffect(() => {
    const getCollections = async () => {
      const collections = await GetAllCollections();
      if (collections) {
        setTags(collections.data);
      }
    };
    getCollections();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        colorDropdownRef.current &&
        !colorDropdownRef.current.contains(e.target as Node)
      ) {
        setShowColorDropdown(false);
      }
      if (
        entryDropdownRef.current &&
        !entryDropdownRef.current.contains(e.target as Node)
      ) {
        setShowEntryDropdown(false);
        setEntrySearch("");
      }
      if (
        tagDropdownRef.current &&
        !tagDropdownRef.current.contains(e.target as Node)
      ) {
        setShowTagDropdown(false);
        setTagSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (showEntryDropdown && entryDropdownRef.current) {
      setTimeout(() => {
        const input = entryDropdownRef.current?.querySelector("input");
        input?.focus();
      }, 100);
    }
    if (showTagDropdown && tagDropdownRef.current) {
      setTimeout(() => {
        const input = tagDropdownRef.current?.querySelector("input");
        input?.focus();
      }, 100);
    }
  }, [showEntryDropdown, showTagDropdown]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleCreate = async () => {
    if (!title.trim()) return;

    const selectedTagIds = selectedTags.map((tag) => tag.ID);

    const newChapter = {
      title: title.trim(),
      description: description.trim(),
      color: selectedColor,
      entries: selectedEntries,
      // entryCount: selectedEntries.length,
      collection: selectedTagIds,
    };

    if (isEdit) {
      const updated = await UpdateChapter(
        locationState?.id || locationState?.ID,
        newChapter
      );

      if (updated) {
        toast.success(`Chapter updated with title ${newChapter.title}`);
        navigate("/chapters");
      } else {
        toast.error(`Failed to update.`);
      }


    } else {
      const data = await CreateNewChapter(newChapter);

      if (data.created) {
        toast.success(`Chapter created with title ${newChapter.title}`);
        navigate("/chapters");
      } else {
        toast.error(`Failed to create. Error: ${data.detail}`);
      }
    }
  };

  const handleCancel = () => {
    setTitle("");
    setDescription("");
    setSelectedColor(chapterColors[0]);
    setSelectedEntries([]);
    setSelectedTags([]);
    setShowColorDropdown(false);
    setShowEntryDropdown(false);
    setShowTagDropdown(false);
    setEntrySearch("");
    setTagSearch("");
    navigate(-1);
  };

  const addEntry = (entry) => {
    if (
      !selectedEntries.some((existingEntry) => existingEntry.id === entry.id)
    ) {
      setSelectedEntries([...selectedEntries, entry]);
      setEntrySearch("");
    }
  };

  const removeEntry = (entryId: string) => {
    setSelectedEntries(selectedEntries.filter((entry) => entry.id !== entryId));
  };

  const addTag = (tag) => {
    if (!selectedTags.some((existingTag) => existingTag.name === tag.Name)) {
      setSelectedTags([...selectedTags, tag]);
      setShowTagDropdown(false);
      setTagSearch("");
    }
  };

  const addCustomTag = (tagName: string) => {
    navigate("/create-collection", {
      state: tagName,
    });
  };

  const removeTag = (tagName: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag.Name !== tagName));
  };

  const createNewEntry = () => {
    const newChapter = {
      id: `temp-chapter-${Date.now()}`,
      title: title.trim() || "New Chapter",
      color: selectedColor,
    };

    console.log("Creating new entry for chapter:", newChapter);
    alert("Navigating to create new entry...");
  };

  // Enhanced search function for entries
  const filteredEntries = mockEntries.filter((entry) => {
    if (!entrySearch.trim())
      return !selectedEntries.some(
        (selectedEntry) => selectedEntry.id === entry.id
      );

    const searchTerm = entrySearch.toLowerCase().trim();
    const titleMatch = entry.title.toLowerCase().includes(searchTerm);
    const contentMatch = entry.content.toLowerCase().includes(searchTerm);
    const tagMatch = entry.tags.some((tag) =>
      tag.Name.toLowerCase().includes(searchTerm)
    );

    return (
      (titleMatch || contentMatch || tagMatch) &&
      !selectedEntries.some((selectedEntry) => selectedEntry.id === entry.id)
    );
  });

  // Filter tags
  const filteredSuggestedTags = tags.filter(
    (tag) =>
      tag.Name?.toLowerCase().includes(tagSearch.toLowerCase().trim()) &&
      !selectedTags.some((existingTag) => existingTag.name === tag.Name)
  );

  const isFormValid = title.trim();
  const totalWordCount = selectedEntries.reduce(
    (sum, entry) => sum + entry.wordCount,
    0
  );

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "rgb(var(--background))" }}
    >
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:opacity-80 transition-all duration-200 border shadow-sm"
              style={{
                backgroundColor: "rgb(var(--card))",
                color: "rgb(var(--copy-secondary))",
                borderColor: "rgb(var(--border))",
              }}
              aria-label="Go back"
            >
              <FaArrowLeft className="text-sm" />
            </button>
            <div
              className="p-2 rounded-lg shadow-sm border"
              style={{
                backgroundColor: "rgba(var(--cta), 0.1)",
                borderColor: "rgba(var(--cta), 0.2)",
              }}
            >
              <FaBookOpen
                className="text-lg"
                style={{ color: "rgb(var(--cta))" }}
              />
            </div>
            <div>
              <h1
                className="text-2xl font-serif font-semibold"
                style={{ color: "rgb(var(--copy-primary))" }}
              >
                {isEdit ? "Edit Chapter" : "Create New Chapter"}
              </h1>
              <p
                className="text-sm"
                style={{ color: "rgb(var(--copy-secondary))" }}
              >
                {isEdit
                  ? "Update chapter details and organizing tags"
                  : "Organize your entries into meaningful collections"}
              </p>
            </div>
          </div>

          {/* Form Controls */}
          <div
            className="rounded-xl p-4 shadow-sm border"
            style={{
              backgroundColor: "rgb(var(--card))",
              borderColor: "rgb(var(--border))",
            }}
          >
            <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
              {/* Color Selection */}
              <div className="relative" ref={colorDropdownRef}>
                <button
                  onClick={() => setShowColorDropdown(!showColorDropdown)}
                  className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:opacity-80 transition-all"
                  style={{
                    backgroundColor: "rgb(var(--surface))",
                    borderColor: "rgb(var(--border))",
                    color: "rgb(var(--copy-secondary))",
                  }}
                  title="Select chapter color"
                >
                  <FaPalette
                    className="text-xs"
                    style={{ color: "rgb(var(--copy-muted))" }}
                  />
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{
                      backgroundColor: selectedColor,
                      borderColor: "rgb(var(--border))",
                    }}
                  />
                  <FaChevronDown
                    className={`text-xs transition-transform ${
                      showColorDropdown ? "rotate-180" : ""
                    }`}
                    style={{ color: "rgb(var(--copy-muted))" }}
                  />
                </button>
                {showColorDropdown && (
                  <div
                    className="absolute top-full mt-1 left-0 w-40 rounded-lg shadow-lg border z-20 p-3 grid grid-cols-4 gap-2"
                    style={{
                      backgroundColor: "rgb(var(--card))",
                      borderColor: "rgb(var(--border))",
                    }}
                  >
                    {chapterColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => {
                          setSelectedColor(color.value);
                          setShowColorDropdown(false);
                        }}
                        className="w-6 h-6 rounded-full border hover:scale-110 transition-transform"
                        style={{
                          backgroundColor: color.value,
                          borderColor:
                            selectedColor === color.name
                              ? "rgb(var(--cta))"
                              : "rgb(var(--border))",
                          borderWidth:
                            selectedColor === color.name ? "2px" : "1px",
                        }}
                        title={color.name}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Entry Selection */}
              <div className="relative flex-1 max-w-sm" ref={entryDropdownRef}>
                <button
                  onClick={() => setShowEntryDropdown(!showEntryDropdown)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 border rounded-lg text-sm hover:opacity-80 transition-all"
                  style={{
                    backgroundColor: "rgb(var(--surface))",
                    borderColor: "rgb(var(--border))",
                    color: "rgb(var(--copy-secondary))",
                  }}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FaFileAlt
                      className="text-xs flex-shrink-0"
                      style={{ color: "rgb(var(--copy-muted))" }}
                    />
                    <span
                      className="truncate"
                      style={{
                        color:
                          selectedEntries.length > 0
                            ? "rgb(var(--copy-secondary))"
                            : "rgb(var(--copy-muted))",
                      }}
                    >
                      {selectedEntries.length > 0
                        ? `${selectedEntries.length} entr${
                            selectedEntries.length !== 1 ? "ies" : "y"
                          } selected`
                        : "Add entries..."}
                    </span>
                  </div>
                  <FaChevronDown
                    className={`text-xs transition-transform ${
                      showEntryDropdown ? "rotate-180" : ""
                    }`}
                    style={{ color: "rgb(var(--copy-muted))" }}
                  />
                </button>
                {showEntryDropdown && (
                  <div
                    className="absolute top-full mt-1 w-full min-w-96 rounded-lg shadow-lg border z-20"
                    style={{
                      backgroundColor: "rgb(var(--card))",
                      borderColor: "rgb(var(--border))",
                    }}
                  >
                    <div
                      className="p-3 border-b"
                      style={{ borderColor: "rgb(var(--border))" }}
                    >
                      <div className="relative">
                        <FaSearch
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs"
                          style={{ color: "rgb(var(--copy-muted))" }}
                        />
                        <input
                          type="text"
                          placeholder="Search by title, content, or tags..."
                          value={entrySearch}
                          onChange={(e) => setEntrySearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:border-transparent transition-all"
                          style={{
                            backgroundColor: "rgb(var(--surface))",
                            borderColor: "rgb(var(--border))",
                            color: "rgb(var(--copy-secondary))",
                          }}
                        />
                      </div>
                      {entrySearch.trim() && (
                        <div
                          className="text-xs mt-2 flex items-center gap-2"
                          style={{ color: "rgb(var(--copy-muted))" }}
                        >
                          <FaSearch className="text-xs" />
                          <span>
                            {filteredEntries.length} entr
                            {filteredEntries.length !== 1 ? "ies" : "y"} found
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      <div
                        className="sticky top-0 z-10 border-b"
                        style={{
                          backgroundColor: "rgb(var(--card))",
                          borderColor: "rgb(var(--border))",
                        }}
                      >
                        <button
                          onClick={createNewEntry}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:opacity-80 text-sm transition-all"
                          style={{
                            backgroundColor: "rgba(var(--success), 0.1)",
                            color: "rgb(var(--success))",
                          }}
                        >
                          <div
                            className="p-1.5 rounded-full"
                            style={{ backgroundColor: "rgb(var(--success))" }}
                          >
                            <FaPlus
                              className="text-xs"
                              style={{ color: "rgb(var(--cta-text))" }}
                            />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">Create new entry</div>
                            <div
                              className="text-xs mt-0.5"
                              style={{ color: "rgb(var(--copy-muted))" }}
                            >
                              Write a new entry for this chapter
                            </div>
                          </div>
                        </button>
                      </div>
                      <div className="py-2">
                        {filteredEntries.length > 0 ? (
                          filteredEntries.map((entry) => (
                            <button
                              key={entry.id}
                              onClick={() => addEntry(entry)}
                              className="w-full flex items-start gap-3 px-4 py-3 hover:opacity-80 text-left transition-all border-l-2 border-transparent hover:border-l-blue-500"
                              style={
                                {
                                  backgroundColor: "transparent",
                                  color: "rgb(var(--copy-secondary))",
                                  "--border-l-color": "rgb(var(--cta))",
                                } as React.CSSProperties
                              }
                            >
                              <div
                                className="p-1.5 rounded-lg flex-shrink-0 mt-0.5"
                                style={{
                                  backgroundColor: "rgba(var(--cta), 0.1)",
                                }}
                              >
                                <FaFileAlt
                                  className="text-xs"
                                  style={{ color: "rgb(var(--cta))" }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div
                                  className="font-medium text-sm truncate"
                                  style={{ color: "rgb(var(--copy-primary))" }}
                                >
                                  {entry.title}
                                </div>
                                <div
                                  className="text-xs mt-1 line-clamp-2 leading-relaxed"
                                  style={{
                                    color: "rgb(var(--copy-secondary))",
                                  }}
                                >
                                  {entry.content.substring(0, 120)}...
                                </div>
                                <div className="flex items-center gap-3 mt-2 text-xs">
                                  <div className="flex items-center gap-1">
                                    <FaClock
                                      className="text-xs"
                                      style={{
                                        color: "rgb(var(--copy-muted))",
                                      }}
                                    />
                                    <span
                                      style={{
                                        color: "rgb(var(--copy-muted))",
                                      }}
                                    >
                                      {formatDate(entry.createdAt)}
                                    </span>
                                  </div>
                                  <span
                                    style={{ color: "rgb(var(--copy-muted))" }}
                                  >
                                    •
                                  </span>
                                  <span
                                    style={{ color: "rgb(var(--copy-muted))" }}
                                  >
                                    {entry.wordCount} words
                                  </span>
                                </div>
                                {entry.tags.length > 0 && (
                                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                                    <FaHashtag
                                      className="text-xs"
                                      style={{
                                        color: "rgb(var(--copy-muted))",
                                      }}
                                    />
                                    {entry.tags.slice(0, 3).map((tag) => (
                                      <span
                                        key={tag.Name}
                                        className="px-1.5 py-0.5 text-xs rounded-full font-medium border"
                                        style={{
                                          backgroundColor: `${tag.Color}15`,
                                          color: tag.Color,
                                          borderColor: `${tag.Color}30`,
                                        }}
                                      >
                                        {tag.Name}
                                      </span>
                                    ))}
                                    {entry.tags.length > 3 && (
                                      <span
                                        className="text-xs"
                                        style={{
                                          color: "rgb(var(--copy-muted))",
                                        }}
                                      >
                                        +{entry.tags.length - 3}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div
                                className="p-1 rounded-full flex-shrink-0 mt-2"
                                style={{
                                  backgroundColor: "rgba(var(--success), 0.1)",
                                }}
                              >
                                <FaPlus
                                  className="text-xs"
                                  style={{ color: "rgb(var(--success))" }}
                                />
                              </div>
                            </button>
                          ))
                        ) : entrySearch.trim() === "" ? (
                          <div
                            className="px-4 py-8 text-center"
                            style={{ color: "rgb(var(--copy-muted))" }}
                          >
                            <FaFileAlt className="text-2xl mx-auto mb-2 opacity-50" />
                            <div className="text-sm">
                              No available entries to add
                            </div>
                            <div className="text-xs mt-1">
                              Create a new entry to get started
                            </div>
                          </div>
                        ) : (
                          <div
                            className="px-4 py-8 text-center"
                            style={{ color: "rgb(var(--copy-muted))" }}
                          >
                            <FaSearch className="text-2xl mx-auto mb-2 opacity-50" />
                            <div className="text-sm">
                              No entries found matching
                            </div>
                            <div
                              className="text-xs mt-1 font-medium"
                              style={{ color: "rgb(var(--copy-secondary))" }}
                            >
                              "{entrySearch}"
                            </div>
                            <div className="text-xs mt-2">
                              Try different keywords or create a new entry
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tag Selection */}
              <div className="relative flex-1 max-w-sm" ref={tagDropdownRef}>
                <button
                  onClick={() => setShowTagDropdown(!showTagDropdown)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 border rounded-lg text-sm hover:opacity-80 transition-all"
                  style={{
                    backgroundColor: "rgb(var(--surface))",
                    borderColor: "rgb(var(--border))",
                    color: "rgb(var(--copy-secondary))",
                  }}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FaTag
                      className="text-xs flex-shrink-0"
                      style={{ color: "rgb(var(--copy-muted))" }}
                    />
                    <span
                      className="truncate"
                      style={{
                        color:
                          selectedTags.length > 0
                            ? "rgb(var(--copy-secondary))"
                            : "rgb(var(--copy-muted))",
                      }}
                    >
                      {selectedTags.length > 0
                        ? `${selectedTags.length} tag${
                            selectedTags.length !== 1 ? "s" : ""
                          } selected`
                        : "Add collections..."}
                    </span>
                  </div>
                  <FaChevronDown
                    className={`text-xs transition-transform ${
                      showTagDropdown ? "rotate-180" : ""
                    }`}
                    style={{ color: "rgb(var(--copy-muted))" }}
                  />
                </button>
                {showTagDropdown && (
                  <div
                    className="absolute top-full mt-1 w-full rounded-lg shadow-lg border z-20"
                    style={{
                      backgroundColor: "rgb(var(--card))",
                      borderColor: "rgb(var(--border))",
                      boxShadow:
                        "rgba(var(--shadow-lg)) 0 10px 15px -3px, rgba(var(--shadow)) 0 4px 6px -2px",
                    }}
                  >
                    <div
                      className="p-3 border-b"
                      style={{ borderColor: "rgba(var(--border), 0.5)" }}
                    >
                      <div className="relative">
                        <FaSearch
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs"
                          style={{ color: "rgb(var(--copy-muted))" }}
                        />
                        <input
                          type="text"
                          placeholder="Search or create collections..."
                          value={tagSearch}
                          onChange={(e) => setTagSearch(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && tagSearch.trim()) {
                              e.preventDefault();
                              addCustomTag(tagSearch);
                            }
                          }}
                          className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:border-transparent"
                          style={
                            {
                              backgroundColor: "rgb(var(--surface))",
                              borderColor: "rgb(var(--border))",
                              color: "rgb(var(--copy-secondary))",
                              "--tw-ring-color": "rgb(var(--cta))",
                            } as React.CSSProperties
                          }
                        />
                      </div>
                    </div>
                    <div className="py-2">
                      {tagSearch.trim() &&
                        !tags.some(
                          (tag) =>
                            tag.Name.toLowerCase() ===
                            tagSearch.toLowerCase().trim()
                        ) && (
                          <button
                            onClick={() => addCustomTag(tagSearch)}
                            className="w-full flex items-center gap-3 px-4 py-2 hover:opacity-80 text-sm transition-all border-b"
                            style={{
                              color: "rgb(var(--copy-secondary))",
                              borderColor: "rgba(var(--border), 0.5)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "rgb(var(--surface))";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                            }}
                          >
                            <FaPlus
                              className="text-xs flex-shrink-0"
                              style={{ color: "rgb(var(--success))" }}
                            />
                            <span>Create "{tagSearch.trim()}"</span>
                          </button>
                        )}
                      {filteredSuggestedTags.length > 0 ? (
                        filteredSuggestedTags.slice(0, 8).map((tag) => (
                          <button
                            key={tag.Name}
                            onClick={() => addTag(tag)}
                            className="w-full flex items-center gap-3 px-4 py-2 hover:opacity-80 text-sm transition-all"
                            style={{ color: "rgb(var(--copy-secondary))" }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "rgb(var(--surface))";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                            }}
                          >
                            <div
                              className="w-3 h-3 rounded-full border flex-shrink-0"
                              style={{
                                backgroundColor: tag.Color,
                                borderColor: "rgb(var(--border))",
                              }}
                            />
                            <span>#{tag.Name}</span>
                          </button>
                        ))
                      ) : tagSearch.trim() === "" ? (
                        <div
                          className="px-4 py-3 text-sm text-center"
                          style={{ color: "rgb(var(--copy-muted))" }}
                        >
                          Start typing to search or create collections
                        </div>
                      ) : null}
                      {filteredSuggestedTags.length > 8 && (
                        <div
                          className="px-4 py-2 text-sm text-center border-t"
                          style={{
                            color: "rgb(var(--copy-muted))",
                            borderColor: "rgba(var(--border), 0.5)",
                          }}
                        >
                          +{filteredSuggestedTags.length - 8} more tags
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div
          className="rounded-xl shadow-sm border overflow-hidden"
          style={{
            backgroundColor: "rgb(var(--card))",
            borderColor: "rgb(var(--border))",
          }}
        >
          <div className="h-1.5" style={{ backgroundColor: selectedColor }} />
          <div className="p-6 space-y-6">
            <div>
              <input
                type="text"
                placeholder="Give your chapter a title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-0 py-2 bg-transparent border-none text-xl font-serif focus:outline-none focus:ring-0"
                style={
                  {
                    color: "rgb(var(--copy-primary))",
                    "::placeholder": { color: "rgb(var(--copy-muted))" },
                  } as React.CSSProperties
                }
                autoFocus
              />
              <div
                className="h-px mt-2"
                style={{ backgroundColor: "rgb(var(--border))" }}
              />
            </div>
            <div>
              <textarea
                placeholder="Add a description for your chapter (optional)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-0 py-2 bg-transparent border-none text-sm resize-none leading-relaxed focus:outline-none focus:ring-0"
                style={
                  {
                    color: "rgb(var(--copy-secondary))",
                    "::placeholder": { color: "rgb(var(--copy-muted))" },
                  } as React.CSSProperties
                }
                rows={3}
              />
            </div>
            {selectedTags.length > 0 && (
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag.Name}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full cursor-pointer group shadow-sm"
                      style={{
                        backgroundColor: tag.Color,
                        color: getTextColor(tag.Color),
                      }}
                    >
                      #{tag.Name}
                      <button
                        onClick={() => removeTag(tag.Name)}
                        className="ml-1 opacity-70 hover:opacity-100 transition-opacity"
                        style={{ color: getTextColor(tag.Color) }}
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {selectedEntries.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3
                      className="text-sm font-medium"
                      style={{ color: "rgb(var(--copy-primary))" }}
                    >
                      Selected Entries
                    </h3>
                    <span
                      className="px-2 py-1 text-xs rounded-full font-medium"
                      style={{
                        backgroundColor: "rgba(var(--cta), 0.1)",
                        color: "rgb(var(--cta))",
                      }}
                    >
                      {selectedEntries.length}
                    </span>
                  </div>
                  {totalWordCount > 0 && (
                    <div
                      className="text-xs"
                      style={{ color: "rgb(var(--copy-muted))" }}
                    >
                      {totalWordCount.toLocaleString()} total words
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {selectedEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 p-3 rounded-lg border"
                      style={{
                        backgroundColor: "rgb(var(--surface))",
                        borderColor: "rgb(var(--border))",
                      }}
                    >
                      <div
                        className="p-1.5 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: "rgba(var(--cta), 0.1)" }}
                      >
                        <FaFileAlt
                          className="text-xs"
                          style={{ color: "rgb(var(--cta))" }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-medium text-sm mb-1"
                          style={{ color: "rgb(var(--copy-primary))" }}
                        >
                          {entry.title}
                        </div>
                        <div
                          className="text-xs line-clamp-2"
                          style={{ color: "rgb(var(--copy-secondary))" }}
                        >
                          {entry.content.substring(0, 150)}...
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <span style={{ color: "rgb(var(--copy-muted))" }}>
                            {formatDate(entry.createdAt)}
                          </span>
                          <span style={{ color: "rgb(var(--copy-muted))" }}>
                            •
                          </span>
                          <span style={{ color: "rgb(var(--copy-muted))" }}>
                            {entry.wordCount} words
                          </span>
                          {entry.tags.length > 0 && (
                            <>
                              <span style={{ color: "rgb(var(--copy-muted))" }}>
                                •
                              </span>
                              <div className="flex gap-1">
                                {entry.tags.slice(0, 2).map((tag) => (
                                  <span
                                    key={tag.Name}
                                    className="px-1.5 py-0.5 text-xs rounded-full font-medium border"
                                    style={{
                                      backgroundColor: `${tag.Color}15`,
                                      color: tag.Color,
                                      borderColor: `${tag.Color}30`,
                                    }}
                                  >
                                    {tag.Name}
                                  </span>
                                ))}
                                {entry.tags.length > 2 && (
                                  <span
                                    className="text-xs"
                                    style={{ color: "rgb(var(--copy-muted))" }}
                                  >
                                    +{entry.tags.length - 2}
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeEntry(entry.id)}
                        className="p-1.5 rounded-lg hover:opacity-80 transition-colors"
                        style={{
                          backgroundColor: "transparent",
                          color: "rgb(var(--copy-muted))",
                        }}
                        title="Remove entry"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4 mt-8">
          <button
            onClick={handleCancel}
            className="px-6 py-2.5 border rounded-lg hover:opacity-80 transition-all"
            style={{
              backgroundColor: "transparent",
              color: "rgb(var(--copy-secondary))",
              borderColor: "rgb(var(--border))",
            }}
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {(selectedEntries.length > 0 || selectedTags.length > 0) && (
              <div
                className="text-sm"
                style={{ color: "rgb(var(--copy-muted))" }}
              >
                {selectedEntries.length > 0 &&
                  `${selectedEntries.length} entr${
                    selectedEntries.length !== 1 ? "ies" : "y"
                  }`}
                {selectedEntries.length > 0 && selectedTags.length > 0 && " • "}
                {selectedTags.length > 0 &&
                  `${selectedTags.length} tag${
                    selectedTags.length !== 1 ? "s" : ""
                  }`}
                {selectedEntries.length > 0 &&
                  ` • ${totalWordCount.toLocaleString()} words`}
              </div>
            )}
            <button
              onClick={handleCreate}
              disabled={!isFormValid}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                isFormValid ? "shadow-sm" : "cursor-not-allowed"
              }`}
              style={{
                backgroundColor: isFormValid
                  ? "rgb(var(--cta))"
                  : "rgb(var(--copy-muted))",
                color: "rgb(var(--cta-text))",
                opacity: isFormValid ? 1 : 0.6,
              }}
            >
              <FaBookOpen className="text-sm" />
              {isEdit ? "Edit Chapter" : "Create Chapter"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateChapter;
