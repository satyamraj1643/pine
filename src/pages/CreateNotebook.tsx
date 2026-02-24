import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GetAllCollections, CreateNewChapter, UpdateChapter } from "../APIs";
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
const COLORS = [
  "#FF5722", "#2196F3", "#4CAF50", "#F44336",
  "#9C27B0", "#607D8B", "#8BC34A", "#f4a261",
];

const CreateChapter: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const st: any = location.state || {};
  const isEdit = st?.edit === true;

  // Form state
  const [title, setTitle] = useState(st?.title || st?.Title || "");
  const [description, setDescription] = useState(st?.description || st?.Description || "");
  const [selectedColor, setSelectedColor] = useState(st?.color || st?.Color || "#2196F3");
  const [selectedTags, setSelectedTags] = useState<any[]>(st?.collection || st?.Collections || []);
  const [tags, setTags] = useState<any[]>([]);

  // UI state
  const [showColorDd, setShowColorDd] = useState(false);
  const [showTagDd, setShowTagDd] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch tags
  useEffect(() => {
    GetAllCollections().then((res) => {
      if (res?.data) setTags(res.data);
    });
  }, []);

  const addTag = (tag: any) => {
    const tagName = tag.Name ?? tag.name;
    if (!selectedTags.some((t: any) => (t.Name ?? t.name) === tagName)) {
      setSelectedTags([...selectedTags, tag]);
      setShowTagDd(false);
    }
  };

  const removeTag = (tagName: string) => {
    setSelectedTags(selectedTags.filter((t: any) => (t.Name ?? t.name) !== tagName));
  };

  const filteredTags = tags.filter((tag: any) => {
    const name = tag.Name ?? tag.name ?? "";
    return !selectedTags.some((t: any) => (t.Name ?? t.name) === name);
  });

  const handleSave = async () => {
    if (!title.trim() || isSaving) return;
    setIsSaving(true);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      color: selectedColor,
      collection: selectedTags.map((t: any) => t.ID ?? t.id),
    };

    try {
      if (isEdit) {
        const ok = await UpdateChapter(st?.id || st?.ID, payload);
        if (ok) {
          toast.success("Notebook updated");
          navigate("/notebooks");
        } else {
          toast.error("Failed to update");
          setIsSaving(false);
        }
      } else {
        const res = await CreateNewChapter(payload);
        if (res?.created) {
          toast.success("Notebook created");
          navigate("/notebooks");
        } else {
          toast.error(res?.detail || "Failed to create");
          setIsSaving(false);
        }
      }
    } catch {
      toast.error("Something went wrong");
      setIsSaving(false);
    }
  };

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-primary))] transition-colors mb-8"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Notebooks
        </button>

        <h1 className="text-xl font-semibold text-[rgb(var(--copy-primary))] mb-10">
          {isEdit ? "Edit Notebook" : "New Notebook"}
        </h1>

        {/* Toolbar row */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          {/* Color selector */}
          <SmartDropdown open={showColorDd} onOpenChange={setShowColorDd}>
            <DropdownTrigger>
              <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm bg-[rgb(var(--surface))] text-[rgb(var(--copy-secondary))] hover:opacity-80 transition-colors">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedColor }} />
                <span>Color</span>
                <DropdownChevron open={showColorDd} />
              </button>
            </DropdownTrigger>
            <DropdownContent title="Color">
              <div className="grid grid-cols-4 gap-2 p-3">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setSelectedColor(c); setShowColorDd(false); }}
                    className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${selectedColor === c ? "ring-2 ring-[rgb(var(--cta))] ring-offset-1 ring-offset-[rgb(var(--background))]" : ""}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </DropdownContent>
          </SmartDropdown>

          {/* Tag selector */}
          <SmartDropdown open={showTagDd} onOpenChange={setShowTagDd}>
            <DropdownTrigger>
              <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm bg-[rgb(var(--surface))] text-[rgb(var(--copy-secondary))] hover:opacity-80 transition-colors">
                <span>
                  {selectedTags.length > 0
                    ? `${selectedTags.length} tag${selectedTags.length !== 1 ? "s" : ""}`
                    : "Tags"}
                </span>
                <DropdownChevron open={showTagDd} />
              </button>
            </DropdownTrigger>
            <DropdownContent title="Tags">
              {filteredTags.map((tag: any) => (
                <DropdownItem key={tag.Name ?? tag.name} onClick={() => addTag(tag)}>
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: tag.Color ?? tag.color }} />
                  <span className="capitalize">{tag.Name ?? tag.name}</span>
                </DropdownItem>
              ))}
              {filteredTags.length === 0 && tags.length === 0 && (
                <DropdownEmpty>No tags yet</DropdownEmpty>
              )}
              {filteredTags.length === 0 && tags.length > 0 && (
                <DropdownEmpty>All tags selected</DropdownEmpty>
              )}
              <DropdownSeparator />
              <DropdownItem onClick={() => navigate("/new-tag")}>
                <span className="flex h-5 w-5 items-center justify-center rounded text-xs" style={{ backgroundColor: "rgba(var(--cta), 0.1)", color: "rgb(var(--cta))" }}>+</span>
                <span style={{ color: "rgb(var(--cta))" }}>Create tag</span>
              </DropdownItem>
            </DropdownContent>
          </SmartDropdown>
        </div>

        {/* Title */}
        <input
          type="text"
          placeholder="Untitled"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          className="mb-4 w-full border-none bg-transparent text-3xl font-medium outline-none text-[rgb(var(--copy-primary))] placeholder:opacity-30"
        />

        {/* Description */}
        <textarea
          placeholder="Add a description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-transparent border-none text-sm resize-none leading-relaxed outline-none text-[rgb(var(--copy-secondary))] placeholder:text-[rgb(var(--copy-muted))]"
          rows={2}
        />

        {/* Selected tags pills */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-4">
            {selectedTags.map((tag: any) => {
              const name = tag.Name ?? tag.name;
              const color = tag.Color ?? tag.color ?? "rgb(var(--cta))";
              return (
                <span
                  key={name}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs"
                  style={{ backgroundColor: color + "22", color }}
                >
                  {name}
                  <button
                    onClick={() => removeTag(name)}
                    className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M8 2L2 8M2 2l6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 flex items-center justify-between border-t border-[rgb(var(--border))]/50 pt-5">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm text-[rgb(var(--copy-secondary))] hover:opacity-70 transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || isSaving}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {isSaving && (
              <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {isSaving ? "Saving..." : isEdit ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateChapter;
