import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaPlusCircle,
  FaArrowLeft,
  FaSearch,
  FaCheck,
  FaTimes,
  FaGrin,
  FaFrown,
  FaBookOpen,
  FaTag,
  FaPlus,
  FaChevronDown,
} from "react-icons/fa";
import {
  GetAllCollections,
  GetAllMood,
  CreateNewEntry,
  GetAllChapter,
  UpdateEntry,
} from "../APIs";
import emoji from "emoji-datasource/emoji.json";
import { FaL } from "react-icons/fa6";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

interface Chapter {
  id: string | number;
  title: string;
  color: string;
}

interface Tag {
  id: string | number;
  name: string;
  color: string;
}

interface Mood {
  id: string | number;
  name: string;
  emoji: string;
  color: string;
}

const normalizeChapter = (chapter: any): Chapter | null => {
  if (!chapter) return null;
  return {
    id: chapter.ID ?? chapter.id ?? "",
    title: chapter.Title ?? chapter.title ?? chapter.Name ?? chapter.name ?? "",
    color: chapter.Color ?? chapter.color ?? "rgb(var(--cta))",
  };
};

const normalizeCollection = (collection: any): Tag | null => {
  if (!collection) return null;
  return {
    id: collection.ID ?? collection.id ?? "",
    name: collection.Name ?? collection.name ?? "",
    color: collection.Color ?? collection.color ?? "rgb(var(--cta))",
  };
};

const normalizeMood = (mood: any): Mood | null => {
  if (!mood) return null;
  return {
    id: mood.ID ?? mood.id ?? "",
    name: mood.Name ?? mood.name ?? "",
    emoji: mood.Emoji ?? mood.Emoji ?? "",
    color: mood.Color ?? mood.color ?? "rgb(var(--cta))",
  };
};

// Helper function to determine if text should be white or dark based on background color
const getTextColor = (backgroundColor: string): string => {
  // For CSS variables, we'll use a simple heuristic based on the variable name
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
  // Default to white text for colored backgrounds
  return "rgb(var(--cta-text))";
};

const CreateEntry: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [moods, SetMoods] = useState<Mood[]>([]);
  const [collections, SetCollections] = useState<Tag[]>([]);
  const [chapters, SetChapters] = useState<Chapter[]>([]);

  useEffect(() => {
    const getMoodAndCollections = async () => {
      const moods = await GetAllMood();
      const collections = await GetAllCollections();
      const chapters = await GetAllChapter();
      console.log(moods.data, collections.data, chapters.data);

      if (collections?.data) {
        SetCollections(
          collections.data
            .map((c: any) => normalizeCollection(c))
            .filter(Boolean)
        );
      }
      if (moods?.data) {
        SetMoods(
          moods.data
            .map((m: any) => normalizeMood(m))
            .filter(Boolean)
        );
      }
      if (chapters?.data) {
        SetChapters(
          chapters.data
            .map((ch: any) => normalizeChapter(ch))
            .filter(Boolean)
        );
      }
    };

    getMoodAndCollections();
  }, []);

  const getEmojiFromShortcode = (shortcode) => {
    const emojiData = emoji.find((e) => e.short_name === shortcode);
    if (emojiData && emojiData.unified) {
      return String.fromCodePoint(parseInt(emojiData.unified, 16));
    }
    return "😐";
  };

  // Form state
  const [title, setTitle] = useState(
    location.state?.Title ||
      location.state?.title ||
      location.state?.entry?.title ||
      ""
  );
  const [content, setContent] = useState(
    location.state?.content || location.state?.entry?.content || ""
  );

  const [selectedChapter, setSelectedChapter] = useState(
    normalizeChapter(
      location.state?.chapter ||
        location.state?.project ||
        location.state?.entry?.chapter
    )
  );
  const [selectedMood, setSelectedMood] = useState(
    location.state?.mood?.id ||
      location.state?.mood?.ID ||
      location.state?.entry?.mood?.id ||
      location.state?.entry?.mood?.ID ||
      ""
  );
  const [selectedCollections, setSelectedCollections] = useState(
    (location.state?.Collections ||
      location.state?.collections ||
      location.state?.entry?.collections ||
      [])
      .map((c: any) => normalizeCollection(c))
      .filter(Boolean)
  );

  // UI state
  const [chapterSearch, setChapterSearch] = useState("");
  const [collectionSearch, setCollectionSearch] = useState("");
  const [showChapterDropdown, setShowChapterDropdown] = useState(false);
  const [showMoodDropdown, setShowMoodDropdown] = useState(false);
  const [showCollectionDropdown, setShowCollectionDropdown] = useState(false);

  // Refs for dropdown management
  const chapterDropdownRef = useRef<HTMLDivElement>(null);
  const moodDropdownRef = useRef<HTMLDivElement>(null);
  const collectionDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        chapterDropdownRef.current &&
        !chapterDropdownRef.current.contains(e.target as Node)
      ) {
        setShowChapterDropdown(false);
        setChapterSearch("");
      }
      if (
        moodDropdownRef.current &&
        !moodDropdownRef.current.contains(e.target as Node)
      ) {
        setShowMoodDropdown(false);
      }
      if (
        collectionDropdownRef.current &&
        !collectionDropdownRef.current.contains(e.target as Node)
      ) {
        setShowCollectionDropdown(false);
        setCollectionSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleCreate = async () => {
    if (!title.trim() || !content.trim() || !selectedChapter) return;
    const selectedCollectionIds = selectedCollections.map((collection) => collection.id);

    const newEntry = {
      title: title.trim(),
      content: content.trim(),
      chapter: selectedChapter.id,
      collection: selectedCollectionIds,
      mood: selectedMood,
    };

    if (!location.state?.update == true) {
      console.log("data going for entry", newEntry)
      const data = await CreateNewEntry(newEntry);

      if (data.created) {
        toast.success(`${newEntry.title} created succesfully.`);
        navigate("/my-entries");
      } else {
        toast.error(`Failed to create ${newEntry.title}`);
      }
    } else {
      const data = await UpdateEntry(location?.state?.id, newEntry);

      if (data.updated) {
        toast.success(`${newEntry.title} updated succesfully.`);
        navigate("/my-entries");
      } else {
        toast.error(`Failed to update ${newEntry.title}`);
      }
    }

    // Navigate to EntryView with new entry
    //navigate("/entry-view", { state: { entry: newEntry } });
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setSelectedChapter(
      location.state?.chapter || location.state?.project || null
    );
    setSelectedMood(location.state?.mood || "");
    setSelectedCollections(location.state?.Collections || []);
    setShowChapterDropdown(false);
    setShowMoodDropdown(false);
    setShowCollectionDropdown(false);
    setChapterSearch("");
    setCollectionSearch("");
    navigate(-1);
  };

  const addCollection = (collection: Tag) => {
    if (
      !selectedCollections.some(
        (existingCollection) => existingCollection.id === collection.id
      )
    ) {
      setSelectedCollections([...selectedCollections, collection]);
      setShowCollectionDropdown(false);
      setCollectionSearch("");
    }
  };

  const addCustomCollection = (collectionName: string) => {
    navigate("/create-collection", {
      state: collectionName,
    });
  };

  const removeCollection = (collectionId: string | number) => {
    setSelectedCollections(
      selectedCollections.filter((collection) => collection.id !== collectionId)
    );
  };

  const filteredChapters = chapters.filter((chapter: Chapter) =>
    (chapter.title || "")
      .toLowerCase()
      .includes(chapterSearch.toLowerCase().trim())
  );

  const filteredSuggestedCollections = collections.filter((collection: Tag) =>
    (collection.name || "")
      .toLowerCase()
      .includes(collectionSearch.toLowerCase().trim()) &&
    !selectedCollections.some(
      (existingCollection) => existingCollection.id === collection.id
    )
  );

  const selectedMoodOption = moods.find(
    (mood) => String(mood.id) === String(selectedMood)
  );

  const isFormValid = title.trim() && content.trim() && selectedChapter;
  const wordCount = content
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

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
                backgroundColor: "rgba(var(--warning), 0.1)",
                borderColor: "rgba(var(--warning), 0.2)",
              }}
            >
              <FaPlusCircle
                className="text-lg"
                style={{ color: "rgb(var(--warning))" }}
              />
            </div>
            <div>
              <h1
                className="text-2xl font-serif font-semibold"
                style={{ color: "rgb(var(--copy-primary))" }}
              >
                Create New Entry
              </h1>
              <p
                className="text-sm"
                style={{ color: "rgb(var(--copy-secondary))" }}
              >
                Add a new entry to your chapter collection
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
              {/* Chapter Selection */}
              <div
                className="relative flex-1 max-w-xs"
                ref={chapterDropdownRef}
              >
                <button
                  onClick={() => setShowChapterDropdown(!showChapterDropdown)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 border rounded-lg text-sm hover:opacity-80 transition-all"
                  style={{
                    backgroundColor: "rgb(var(--surface))",
                    borderColor: "rgb(var(--border))",
                    color: "rgb(var(--copy-secondary))",
                  }}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FaBookOpen
                      className="text-xs flex-shrink-0"
                      style={{ color: "rgb(var(--copy-muted))" }}
                    />
                    {selectedChapter ? (
                      <>
                        <div
                          className="w-3 h-3 rounded-full border flex-shrink-0"
                          style={{
                            backgroundColor: selectedChapter.color,
                            borderColor: "rgb(var(--border))",
                          }}
                        />
                        <span className="truncate">{selectedChapter.title}</span>
                      </>
                    ) : (
                      <span
                        className="truncate"
                        style={{ color: "rgb(var(--copy-muted))" }}
                      >
                        Select chapter...
                      </span>
                    )}
                  </div>
                  <FaChevronDown
                    className={`text-xs transition-transform ${
                      showChapterDropdown ? "rotate-180" : ""
                    }`}
                    style={{ color: "rgb(var(--copy-muted))" }}
                  />
                </button>
                {showChapterDropdown && (
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
                          placeholder="Search chapters..."
                          value={chapterSearch}
                          onChange={(e) => setChapterSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 border rounded-lg text-xs focus:ring-2 focus:border-transparent"
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
                      {filteredChapters.length > 0 ? (
                        filteredChapters.slice(0, 6).map((chapter) => (
                          <button
                            key={chapter.id}
                            onClick={() => {
                              setSelectedChapter(chapter);
                              setShowChapterDropdown(false);
                              setChapterSearch("");
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 hover:opacity-80 text-xs transition-all"
                            style={{
                              backgroundColor: "transparent",
                              color: "rgb(var(--copy-secondary))",
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
                            <div
                              className="w-3 h-3 rounded-full border flex-shrink-0"
                              style={{
                                backgroundColor: chapter.color,
                                borderColor: "rgb(var(--border))",
                              }}
                            />
                            <span className="truncate">{chapter.title}</span>
                          </button>
                        ))
                      ) : (
                        <div
                          className="px-4 py-3 text-xs text-center"
                          style={{ color: "rgb(var(--copy-muted))" }}
                        >
                          No chapters found.
                        </div>
                      )}
                      {filteredChapters.length > 6 && (
                        <div
                          className="px-4 py-2 text-xs text-center border-t"
                          style={{
                            color: "rgb(var(--copy-muted))",
                            borderColor: "rgba(var(--border), 0.5)",
                          }}
                        >
                          +{filteredChapters.length - 6} more chapters
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Collection Selection */}
              <div className="relative flex-1 max-w-xs" ref={collectionDropdownRef}>
                <button
                  onClick={() => setShowCollectionDropdown(!showCollectionDropdown)}
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
                      style={{ color: "rgb(var(--copy-muted))" }}
                    >
                      {selectedCollections.length > 0
                        ? `${selectedCollections.length} collection${
                            selectedCollections.length !== 1 ? "s" : ""
                          } selected`
                        : "Add collections..."}
                    </span>
                  </div>
                  <FaChevronDown
                    className={`text-xs transition-transform ${
                      showCollectionDropdown ? "rotate-180" : ""
                    }`}
                    style={{ color: "rgb(var(--copy-muted))" }}
                  />
                </button>
                {showCollectionDropdown && (
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
                          value={collectionSearch}
                          onChange={(e) => setCollectionSearch(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && collectionSearch.trim()) {
                              e.preventDefault();
                              addCustomCollection(collectionSearch);
                            }
                          }}
                          className="w-full pl-8 pr-3 py-2 border rounded-lg text-xs focus:ring-2 focus:border-transparent"
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
                      {/* Create new collection option */}
                      {collectionSearch.trim() &&
                        !collections.some(
                          (collection) =>
                            collection.name.toLowerCase() ===
                            collectionSearch.toLowerCase().trim()
                        ) && (
                          <button
                            onClick={() => addCustomCollection(collectionSearch)}
                            className="w-full flex items-center gap-3 px-4 py-2 hover:opacity-80 text-xs transition-all border-b"
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
                            <span>Create "{collectionSearch.trim()}"</span>
                          </button>
                        )}

                      {/* Suggested collections */}
                      {filteredSuggestedCollections.length > 0 ? (
                        filteredSuggestedCollections.slice(0, 8).map((collection) => (
                          <button
                            key={collection.id}
                            onClick={() => addCollection(collection)}
                            className="w-full flex items-center gap-3 px-4 py-2 hover:opacity-80 text-xs transition-all"
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
                                backgroundColor: collection.color,
                                borderColor: "rgb(var(--border))",
                              }}
                            />
                            <span>#{collection.name}</span>
                          </button>
                        ))
                      ) : collectionSearch.trim() === "" ? (
                        <div
                          className="px-4 py-3 text-xs text-center"
                          style={{ color: "rgb(var(--copy-muted))" }}
                        >
                          Start typing to search or create collections
                        </div>
                      ) : null}

                      {filteredSuggestedCollections.length > 8 && (
                        <div
                          className="px-4 py-2 text-xs text-center border-t"
                          style={{
                            color: "rgb(var(--copy-muted))",
                            borderColor: "rgba(var(--border), 0.5)",
                          }}
                        >
                          +{filteredSuggestedCollections.length - 8} more collections
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Mood Selection */}
              <div className="relative" ref={moodDropdownRef}>
                <button
                  onClick={() => setShowMoodDropdown(!showMoodDropdown)}
                  className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:opacity-80 transition-all"
                  style={{
                    backgroundColor: "rgb(var(--surface))",
                    borderColor: "rgb(var(--border))",
                    color: "rgb(var(--copy-secondary))",
                  }}
                  title="Select mood"
                >
                  {selectedMoodOption && (
                    <span
                      className="text-xs"
                      style={{
                        color: selectedMoodOption.color,
                      }}
                    >
                      {getEmojiFromShortcode(selectedMoodOption.Emoji) || "😊"}
                    </span>
                  )}
                  <span className="capitalize text-xs">
                    {selectedMoodOption?.name || "Select Mood"}
                  </span>
                  <FaChevronDown
                    className={`text-xs transition-transform ${
                      showMoodDropdown ? "rotate-180" : ""
                    }`}
                    style={{ color: "rgb(var(--copy-muted))" }}
                  />
                </button>
                {showMoodDropdown && (
                  <div
                    className="absolute top-full mt-1 right-0 w-44 rounded-lg shadow-lg border z-20"
                    style={{
                      backgroundColor: "rgb(var(--card))",
                      borderColor: "rgb(var(--border))",
                      boxShadow:
                        "rgba(var(--shadow-lg)) 0 10px 15px -3px, rgba(var(--shadow)) 0 4px 6px -2px",
                    }}
                  >
                    <div className="py-2">
                      {moods.map((mood) => (
                        <button
                          key={mood.id}
                          onClick={() => {
                            setSelectedMood(mood.id);
                            setShowMoodDropdown(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-xs transition-all duration-200"
                          style={{
                            backgroundColor:
                              String(selectedMood) === String(mood.id)
                                ? "rgba(var(--warning), 0.1)"
                                : "transparent",
                            color:
                              String(selectedMood) === String(mood.id)
                                ? "rgb(var(--warning))"
                                : "rgb(var(--copy-secondary))",
                          }}
                          onMouseEnter={(e) => {
                            if (String(selectedMood) !== String(mood.id)) {
                              e.currentTarget.style.backgroundColor =
                                "rgba(var(--surface), 0.5)";
                              e.currentTarget.style.transform = "scale(1.02)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (String(selectedMood) !== String(mood.id)) {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                              e.currentTarget.style.transform = "scale(1)";
                            } else {
                              e.currentTarget.style.backgroundColor =
                                "rgba(var(--warning), 0.1)";
                              e.currentTarget.style.transform = "scale(1)";
                            }
                          }}
                        >
                          <span
                            className="text-xs"
                            style={{ color: mood.color }}
                          >
                            {getEmojiFromShortcode(mood.Emoji) || "😊"}
                          </span>
                          <span className="capitalize">{mood.name}</span>
                        </button>
                      ))}
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
          {/* Color accent bar */}
          {selectedChapter && (
            <div
              className="h-1.5"
              style={{ backgroundColor: selectedChapter.color }}
            />
          )}

          <div className="p-6 space-y-6">
            {/* Title Input */}
            <div>
              <input
                type="text"
                placeholder="Give your entry a title..."
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

            {/* Selected Collections Display */}
            {selectedCollections.length > 0 && (
              <div>
                <div className="flex flex-wrap items-center gap-2">
                    {selectedCollections.map((collection) => (
                      <span
                        key={collection.id}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full cursor-pointer group shadow-sm"
                        style={{
                          backgroundColor: collection.color,
                          color: getTextColor(collection.color),
                        }}
                      >
                      #{collection.name}
                      <button
                        onClick={() => removeCollection(collection.id)}
                        className="ml-1 opacity-70 hover:opacity-100 transition-opacity"
                        style={{ color: getTextColor(collection.color) }}
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Content Textarea */}
            <div>
              <textarea
                placeholder="Start writing your entry..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-0 py-2 bg-transparent border-none text-sm resize-none leading-relaxed focus:outline-none focus:ring-0"
                style={
                  {
                    color: "rgb(var(--copy-primary))",
                    minHeight: "200px",
                    "::placeholder": { color: "rgb(var(--copy-muted))" },
                  } as React.CSSProperties
                }
                rows={12}
              />
            </div>

            {/* Stats and Actions */}
            <div
              className="flex justify-between items-center pt-4 border-t"
              style={{ borderColor: "rgb(var(--border))" }}
            >
              <div
                className="flex items-center gap-4 text-xs"
                style={{ color: "rgb(var(--copy-muted))" }}
              >
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{estimatedReadTime} min read</span>
                {selectedCollections.length > 0 && (
                  <>
                    <span>•</span>
                    <span>
                      {selectedCollections.length} collection
                      {selectedCollections.length !== 1 ? "s" : ""}
                    </span>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm hover:opacity-80 rounded-lg transition-colors"
                  style={{
                    color: "rgb(var(--copy-secondary))",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgb(var(--surface))";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <FaTimes className="inline mr-1 text-xs" />
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!isFormValid}
                  className="px-4 py-2 text-sm rounded-lg transition-colors font-medium shadow-sm disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: isFormValid
                      ? "rgb(var(--cta))"
                      : "rgb(var(--copy-muted))",
                    color: "rgb(var(--cta-text))",
                    opacity: isFormValid ? 1 : 0.6,
                  }}
                  onMouseEnter={(e) => {
                    if (isFormValid) {
                      e.currentTarget.style.backgroundColor =
                        "rgb(var(--cta-active))";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isFormValid) {
                      e.currentTarget.style.backgroundColor = "rgb(var(--cta))";
                    }
                  }}
                >
                  <FaCheck className="inline mr-1 text-xs" />
                  {location.state?.update == true ? "Update Entry" : "Create Entry"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEntry;
