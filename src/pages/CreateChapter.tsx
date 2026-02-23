import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaBookOpen,
  FaFileAlt,
  FaPalette,
  FaPlus,
  FaTimes,
  FaTag,
} from "react-icons/fa";
import { GetAllCollections, GetAllEntries, CreateNewChapter, UpdateChapter } from "../APIs";
import toast from "react-hot-toast";
import {
  SmartDropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownEmpty,
  DropdownChevron,
  DropdownSeparator,
} from "../components/SmartDropdown";

// Color options
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

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
};

const getTextColor = (backgroundColor: string): string => {
  if (
    backgroundColor.includes("--background") ||
    backgroundColor.includes("--surface") ||
    backgroundColor.includes("--card")
  ) {
    return "rgb(var(--copy-primary))";
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
    locationState?.color || locationState?.Color || "#2196F3"
  );
  const [selectedTags, setSelectedTags] = useState(
    locationState?.collection || locationState?.Collections || []
  );
  const [tags, setTags] = useState<any[]>([]);

  // Real entries from API
  const [allEntries, setAllEntries] = useState<any[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<any[]>(
    locationState?.entries || locationState?.Entries || []
  );
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);

  // UI state
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showEntryDropdown, setShowEntryDropdown] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [entrySearch, setEntrySearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch tags + real entries from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingEntries(true);
      const [colRes, entryRes] = await Promise.all([
        GetAllCollections(),
        GetAllEntries(),
      ]);
      if (colRes?.data) setTags(colRes.data);
      if (entryRes?.data) setAllEntries(entryRes.data);
      setIsLoadingEntries(false);
    };
    fetchData();
  }, []);

  const handleBack = () => navigate(-1);

  const handleCreate = async () => {
    if (!title.trim() || isSaving) return;
    setIsSaving(true);

    const selectedTagIds = selectedTags.map((tag: any) => tag.ID ?? tag.id);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      color: selectedColor,
      collection: selectedTagIds,
    };

    try {
      if (isEdit) {
        const updated = await UpdateChapter(
          locationState?.id || locationState?.ID,
          payload
        );
        if (updated) {
          toast.success("Notebook updated successfully.");
          navigate("/notebooks");
        } else {
          toast.error("Failed to update notebook.");
          setIsSaving(false);
        }
      } else {
        const data = await CreateNewChapter(payload);
        if (data?.created) {
          toast.success("Notebook created successfully.");
          navigate("/notebooks");
        } else {
          toast.error(data?.detail || "Failed to create notebook.");
          setIsSaving(false);
        }
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsSaving(false);
    }
  };

  const addEntry = (entry: any) => {
    const entryId = entry.ID ?? entry.id;
    if (!selectedEntries.some((e: any) => (e.ID ?? e.id) === entryId)) {
      setSelectedEntries([...selectedEntries, entry]);
      setEntrySearch("");
    }
  };

  const removeEntry = (entryId: string | number) => {
    setSelectedEntries(selectedEntries.filter((e: any) => (e.ID ?? e.id) !== entryId));
  };

  const addTag = (tag: any) => {
    const tagName = tag.Name ?? tag.name;
    if (!selectedTags.some((t: any) => (t.Name ?? t.name) === tagName)) {
      setSelectedTags([...selectedTags, tag]);
      setShowTagDropdown(false);
      setTagSearch("");
    }
  };

  const removeTag = (tagName: string) => {
    setSelectedTags(selectedTags.filter((tag: any) => (tag.Name ?? tag.name) !== tagName));
  };

  const handleCreateNewNote = () => {
    navigate("/new-note", {
      state: {
        chapter: {
          id: locationState?.id || locationState?.ID || null,
          title: title.trim() || "New Notebook",
          color: selectedColor,
        },
      },
    });
  };

  // Filter entries from real API data
  const filteredEntries = allEntries.filter((entry: any) => {
    const entryId = entry.ID ?? entry.id;
    const isSelected = selectedEntries.some((e: any) => (e.ID ?? e.id) === entryId);
    if (isSelected) return false;

    if (!entrySearch.trim()) return true;

    const searchTerm = entrySearch.toLowerCase().trim();
    const entryTitle = (entry.Title ?? entry.title ?? "").toLowerCase();
    const entryContent = (entry.Content ?? entry.content ?? "").toLowerCase();
    return entryTitle.includes(searchTerm) || entryContent.includes(searchTerm);
  });

  // Filter tags
  const filteredSuggestedTags = tags.filter((tag: any) => {
    const tagName = (tag.Name ?? tag.name ?? "").toLowerCase();
    const isSelected = selectedTags.some((t: any) => (t.Name ?? t.name) === (tag.Name ?? tag.name));
    if (isSelected) return false;
    if (!tagSearch.trim()) return true;
    return tagName.includes(tagSearch.toLowerCase().trim());
  });

  const isFormValid = title.trim();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "rgb(var(--background))" }}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:opacity-80 transition-all border shadow-sm"
              style={{ backgroundColor: "rgb(var(--card))", color: "rgb(var(--copy-secondary))", borderColor: "rgb(var(--border))" }}
              aria-label="Go back"
            >
              <FaArrowLeft className="text-sm" />
            </button>
            <div className="p-2 rounded-lg shadow-sm border" style={{ backgroundColor: "rgba(var(--cta), 0.1)", borderColor: "rgba(var(--cta), 0.2)" }}>
              <FaBookOpen className="text-lg" style={{ color: "rgb(var(--cta))" }} />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-semibold" style={{ color: "rgb(var(--copy-primary))" }}>
                {isEdit ? "Edit Notebook" : "New Notebook"}
              </h1>
              <p className="text-sm" style={{ color: "rgb(var(--copy-secondary))" }}>
                {isEdit ? "Update notebook details and tags" : "Group your notes together"}
              </p>
            </div>
          </div>

          {/* Toolbar */}
          <div className="rounded-xl p-4 shadow-sm border" style={{ backgroundColor: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}>
            <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
              {/* Color Selection */}
              <SmartDropdown open={showColorDropdown} onOpenChange={setShowColorDropdown}>
                <DropdownTrigger>
                  <button
                    className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:opacity-80 transition-all active:scale-[0.98]"
                    style={{ backgroundColor: "rgb(var(--surface))", borderColor: "rgb(var(--border))", color: "rgb(var(--copy-secondary))" }}
                    title="Select notebook color"
                  >
                    <FaPalette className="text-xs" style={{ color: "rgb(var(--copy-muted))" }} />
                    <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: selectedColor, borderColor: "rgb(var(--border))" }} />
                    <DropdownChevron open={showColorDropdown} />
                  </button>
                </DropdownTrigger>
                <DropdownContent title="Select Color">
                  <div className="grid grid-cols-4 gap-3 p-3">
                    {chapterColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => { setSelectedColor(color.value); setShowColorDropdown(false); }}
                        className="w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform"
                        style={{
                          backgroundColor: color.value,
                          borderColor: selectedColor === color.value ? "rgb(var(--cta))" : "transparent",
                        }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </DropdownContent>
              </SmartDropdown>

              {/* Entry Selection (Real data) */}
              <SmartDropdown open={showEntryDropdown} onOpenChange={(open) => {
                setShowEntryDropdown(open);
                if (!open) setEntrySearch("");
              }}>
                <DropdownTrigger>
                  <button
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 border rounded-lg text-sm hover:opacity-80 transition-all active:scale-[0.98]"
                    style={{ backgroundColor: "rgb(var(--surface))", borderColor: "rgb(var(--border))", color: "rgb(var(--copy-secondary))" }}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FaFileAlt className="text-xs flex-shrink-0" style={{ color: "rgb(var(--copy-muted))" }} />
                      <span className="truncate" style={{ color: selectedEntries.length > 0 ? "rgb(var(--copy-secondary))" : "rgb(var(--copy-muted))" }}>
                        {selectedEntries.length > 0
                          ? `${selectedEntries.length} note${selectedEntries.length !== 1 ? "s" : ""} selected`
                          : "Add notes..."}
                      </span>
                    </div>
                    <DropdownChevron open={showEntryDropdown} />
                  </button>
                </DropdownTrigger>
                <DropdownContent 
                  title="Add Notes" 
                  searchable 
                  searchPlaceholder="Search notes..."
                  onSearch={setEntrySearch}
                >
                  {/* Create new note action */}
                  <DropdownItem onClick={handleCreateNewNote}>
                    <div className="p-1.5 rounded-full" style={{ backgroundColor: "rgb(var(--success))" }}>
                      <FaPlus className="text-xs" style={{ color: "rgb(var(--cta-text))" }} />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium" style={{ color: "rgb(var(--success))" }}>Create new note</div>
                      <div className="text-xs mt-0.5" style={{ color: "rgb(var(--copy-muted))" }}>
                        Write a new note for this notebook
                      </div>
                    </div>
                  </DropdownItem>
                  <DropdownSeparator />
                  {isLoadingEntries ? (
                    <DropdownEmpty>Loading notes...</DropdownEmpty>
                  ) : filteredEntries.length > 0 ? (
                    filteredEntries.slice(0, 20).map((entry: any) => {
                      const eTitle = entry.Title ?? entry.title ?? "Untitled";
                      const eContent = entry.Content ?? entry.content ?? "";
                      const eId = entry.ID ?? entry.id;
                      const eDate = entry.updated_at ?? entry.UpdatedAt ?? entry.createdAt ?? "";
                      return (
                        <DropdownItem
                          key={eId}
                          onClick={() => addEntry(entry)}
                          closeOnSelect={false}
                        >
                          <div className="p-1.5 rounded-lg flex-shrink-0" style={{ backgroundColor: "rgba(var(--cta), 0.1)" }}>
                            <FaFileAlt className="text-xs" style={{ color: "rgb(var(--cta))" }} />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="font-medium text-sm truncate" style={{ color: "rgb(var(--copy-primary))" }}>
                              {eTitle}
                            </div>
                            {eContent && (
                              <div className="text-xs mt-0.5 line-clamp-1" style={{ color: "rgb(var(--copy-muted))" }}>
                                {eContent.substring(0, 60)}...
                              </div>
                            )}
                          </div>
                          <FaPlus className="text-xs flex-shrink-0" style={{ color: "rgb(var(--success))" }} />
                        </DropdownItem>
                      );
                    })
                  ) : (
                    <DropdownEmpty>
                      {allEntries.length === 0 ? "No notes yet" : "No matching notes"}
                    </DropdownEmpty>
                  )}
                </DropdownContent>
              </SmartDropdown>

              {/* Tag Selection */}
              <SmartDropdown open={showTagDropdown} onOpenChange={(open) => {
                setShowTagDropdown(open);
                if (!open) setTagSearch("");
              }}>
                <DropdownTrigger>
                  <button
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 border rounded-lg text-sm hover:opacity-80 transition-all active:scale-[0.98]"
                    style={{ backgroundColor: "rgb(var(--surface))", borderColor: "rgb(var(--border))", color: "rgb(var(--copy-secondary))" }}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FaTag className="text-xs flex-shrink-0" style={{ color: "rgb(var(--copy-muted))" }} />
                      <span className="truncate" style={{ color: selectedTags.length > 0 ? "rgb(var(--copy-secondary))" : "rgb(var(--copy-muted))" }}>
                        {selectedTags.length > 0
                          ? `${selectedTags.length} tag${selectedTags.length !== 1 ? "s" : ""} selected`
                          : "Add tags..."}
                      </span>
                    </div>
                    <DropdownChevron open={showTagDropdown} />
                  </button>
                </DropdownTrigger>
                <DropdownContent 
                  title="Add Tags" 
                  searchable 
                  searchPlaceholder="Search or create tags..."
                  onSearch={setTagSearch}
                >
                  {tagSearch.trim() && !tags.some((tag: any) =>
                    (tag.Name ?? tag.name ?? "").toLowerCase() === tagSearch.toLowerCase().trim()
                  ) && (
                    <DropdownItem onClick={() => navigate("/new-tag", { state: tagSearch })}>
                      <FaPlus className="text-xs flex-shrink-0" style={{ color: "rgb(var(--success))" }} />
                      <span>Create "{tagSearch.trim()}"</span>
                    </DropdownItem>
                  )}
                  {filteredSuggestedTags.length > 0 ? (
                    filteredSuggestedTags.slice(0, 8).map((tag: any) => (
                      <DropdownItem
                        key={tag.Name ?? tag.name}
                        onClick={() => addTag(tag)}
                      >
                        <div className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: tag.Color ?? tag.color }} />
                        <span>#{tag.Name ?? tag.name}</span>
                      </DropdownItem>
                    ))
                  ) : tagSearch.trim() === "" ? (
                    <DropdownEmpty>
                      {tags.length === 0 ? "No tags yet" : "Start typing to search"}
                    </DropdownEmpty>
                  ) : null}
                </DropdownContent>
              </SmartDropdown>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="rounded-xl shadow-sm border overflow-hidden"
          style={{ backgroundColor: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}>
          <div className="h-1.5" style={{ backgroundColor: selectedColor }} />
          <div className="p-6 space-y-6">
            <div>
              <input
                type="text"
                placeholder="Give your notebook a title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-0 py-2 bg-transparent border-none text-xl font-serif focus:outline-none focus:ring-0"
                style={{ color: "rgb(var(--copy-primary))" }}
                autoFocus
              />
              <div className="h-px mt-2" style={{ backgroundColor: "rgb(var(--border))" }} />
            </div>
            <div>
              <textarea
                placeholder="Add a description (optional)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-0 py-2 bg-transparent border-none text-sm resize-none leading-relaxed focus:outline-none focus:ring-0"
                style={{ color: "rgb(var(--copy-secondary))" }}
                rows={3}
              />
            </div>

            {/* Selected tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {selectedTags.map((tag: any) => {
                  const name = tag.Name ?? tag.name;
                  const color = tag.Color ?? tag.color ?? "rgb(var(--cta))";
                  return (
                    <span key={name} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full shadow-sm"
                      style={{ backgroundColor: color, color: getTextColor(color) }}>
                      #{name}
                      <button onClick={() => removeTag(name)} className="ml-1 opacity-70 hover:opacity-100 transition-opacity">
                        <FaTimes className="text-xs" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Selected entries */}
            {selectedEntries.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium" style={{ color: "rgb(var(--copy-primary))" }}>
                      Selected Notes
                    </h3>
                    <span className="px-2 py-0.5 text-xs rounded-full font-medium"
                      style={{ backgroundColor: "rgba(var(--cta), 0.1)", color: "rgb(var(--cta))" }}>
                      {selectedEntries.length}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {selectedEntries.map((entry: any) => {
                    const eTitle = entry.Title ?? entry.title ?? "Untitled";
                    const eContent = entry.Content ?? entry.content ?? "";
                    const eId = entry.ID ?? entry.id;
                    return (
                      <div key={eId} className="flex items-start gap-3 p-3 rounded-lg border"
                        style={{ backgroundColor: "rgb(var(--surface))", borderColor: "rgb(var(--border))" }}>
                        <div className="p-1.5 rounded-lg flex-shrink-0" style={{ backgroundColor: "rgba(var(--cta), 0.1)" }}>
                          <FaFileAlt className="text-xs" style={{ color: "rgb(var(--cta))" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm" style={{ color: "rgb(var(--copy-primary))" }}>{eTitle}</div>
                          {eContent && (
                            <div className="text-xs mt-1 line-clamp-1" style={{ color: "rgb(var(--copy-secondary))" }}>
                              {eContent.substring(0, 100)}...
                            </div>
                          )}
                        </div>
                        <button onClick={() => removeEntry(eId)}
                          className="p-1.5 rounded-lg hover:opacity-80 transition-colors"
                          style={{ color: "rgb(var(--copy-muted))" }} title="Remove note">
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4 mt-8">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 border rounded-lg hover:opacity-80 transition-all"
            style={{ backgroundColor: "transparent", color: "rgb(var(--copy-secondary))", borderColor: "rgb(var(--border))" }}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!isFormValid || isSaving}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${isFormValid && !isSaving ? "shadow-sm" : "cursor-not-allowed"}`}
            style={{
              backgroundColor: isFormValid && !isSaving ? "rgb(var(--cta))" : "rgb(var(--copy-muted))",
              color: "rgb(var(--cta-text))",
              opacity: isFormValid && !isSaving ? 1 : 0.6,
            }}
          >
            {isSaving && (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            <FaBookOpen className="text-sm" />
            {isSaving ? "Saving..." : isEdit ? "Update Notebook" : "Create Notebook"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateChapter;
