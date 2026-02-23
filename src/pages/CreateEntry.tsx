import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import {
  GetAllCollections,
  GetAllMood,
  CreateNewEntry,
  GetAllChapter,
  UpdateEntry,
} from "../APIs";
import { getEmojiFromShortcode } from "../utilities/emoji";
import {
  SmartDropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownEmpty,
  DropdownChevron,
  DropdownSeparator,
} from "../components/SmartDropdown";

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

interface Chapter {
  id: string | number;
  title: string;
  color: string;
}

interface Collection {
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

// ────────────────────────────────────────────────────────────
// Normalizers – handle both PascalCase and camelCase API shapes
// ────────────────────────────────────────────────────────────

const normalizeChapter = (raw: Record<string, any>): Chapter | null => {
  if (!raw) return null;
  return {
    id: raw.ID ?? raw.id ?? "",
    title: raw.Title ?? raw.title ?? raw.Name ?? raw.name ?? "",
    color: raw.Color ?? raw.color ?? "rgb(var(--cta))",
  };
};

const normalizeCollection = (raw: Record<string, any>): Collection | null => {
  if (!raw) return null;
  return {
    id: raw.ID ?? raw.id ?? "",
    name: raw.Name ?? raw.name ?? "",
    color: raw.Color ?? raw.color ?? "rgb(var(--cta))",
  };
};

const normalizeMood = (raw: Record<string, any>): Mood | null => {
  if (!raw) return null;
  return {
    id: raw.ID ?? raw.id ?? "",
    name: raw.Name ?? raw.name ?? "",
    emoji: raw.Emoji ?? raw.emoji ?? "",
    color: raw.Color ?? raw.color ?? "rgb(var(--cta))",
  };
};

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────

const CreateEntry: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isEditMode = location.state?.update === true;
  const st = location.state ?? {};

  // ── Data lists ─────────────────────────────────────────────
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [moods, setMoods] = useState<Mood[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [chapRes, colRes, moodRes] = await Promise.all([
        GetAllChapter(),
        GetAllCollections(),
        GetAllMood(),
      ]);

      if (chapRes?.data) {
        setChapters(
          chapRes.data
            .map((c: Record<string, any>) => normalizeChapter(c))
            .filter(Boolean) as Chapter[],
        );
      }
      if (colRes?.data) {
        setCollections(
          colRes.data
            .map((c: Record<string, any>) => normalizeCollection(c))
            .filter(Boolean) as Collection[],
        );
      }
      if (moodRes?.data) {
        setMoods(
          moodRes.data
            .map((m: Record<string, any>) => normalizeMood(m))
            .filter(Boolean) as Mood[],
        );
      }
    };

    fetchData();
  }, []);

  // ── Form state (pre-filled in edit mode) ───────────────────
  const [title, setTitle] = useState<string>(
    st.Title ?? st.title ?? st.entry?.title ?? "",
  );
  const [content, setContent] = useState<string>(
    st.Content ?? st.content ?? st.entry?.content ?? "",
  );
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(
    normalizeChapter(st.chapter ?? st.project ?? st.entry?.chapter),
  );
  const [selectedMood, setSelectedMood] = useState<string | number>(
    st.mood?.id ?? st.mood?.ID ?? st.entry?.mood?.id ?? st.entry?.mood?.ID ?? "",
  );
  const [selectedCollections, setSelectedCollections] = useState<Collection[]>(
    (st.Collections ?? st.collections ?? st.entry?.collections ?? [])
      .map((c: Record<string, any>) => normalizeCollection(c))
      .filter(Boolean) as Collection[],
  );

  // ── UI state ───────────────────────────────────────────────
  const [showChapterDd, setShowChapterDd] = useState(false);
  const [showCollectionDd, setShowCollectionDd] = useState(false);
  const [showMoodDd, setShowMoodDd] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ── Unsaved changes warning ────────────────────────────────
  const isDirty = title.trim() !== "" || content.trim() !== "";

  // Browser tab close / refresh
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty && !isSaving) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
   }, [isDirty, isSaving]);

  // ── Derived ────────────────────────────────────────────────
  const selectedMoodObj = moods.find((m) => String(m.id) === String(selectedMood));

  const availableCollections = collections.filter(
    (c) => !selectedCollections.some((s) => s.id === c.id),
  );

  // FIXED: notebook is now OPTIONAL — only title + content required
  const isFormValid = title.trim() && content.trim();

  const wordCount = content
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  // ── Handlers ───────────────────────────────────────────────
  const toggleCollection = useCallback(
    (col: Collection) => {
      setSelectedCollections((prev) => {
        const exists = prev.some((c) => c.id === col.id);
        return exists ? prev.filter((c) => c.id !== col.id) : [...prev, col];
      });
    },
    [],
  );

  const removeCollection = useCallback((id: string | number) => {
    setSelectedCollections((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleSave = async () => {
    if (!isFormValid || isSaving) return;

    setIsSaving(true);

    const payload = {
      title: title.trim(),
      content: content.trim(),
      chapter: selectedChapter?.id || null,
      collection: selectedCollections.map((c) => c.id),
      mood: selectedMood || null,
    };

    try {
      if (isEditMode) {
        const res = await UpdateEntry(st.id ?? st.ID ?? st.entry?.id, payload);
        if (res?.updated) {
          toast.success("Note updated successfully.");
          navigate("/notes");
        } else {
          toast.error(res?.detail || "Failed to update note.");
          setIsSaving(false);
        }
      } else {
        const res = await CreateNewEntry(payload);
        if (res?.created) {
          toast.success("Note created successfully.");
          navigate("/notes");
        } else {
          toast.error(res?.detail || "Failed to create note.");
          setIsSaving(false);
        }
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "rgb(var(--background))" }}
    >
      <div className="mx-auto max-w-3xl px-6 py-10">
        {/* ── Header ──────────────────────────────────────── */}
        <div className="mb-10 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:opacity-70"
            style={{ color: "rgb(var(--copy-secondary))" }}
            aria-label="Go back"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 4L7 10L13 16" />
            </svg>
          </button>
          <h1
            className="font-serif text-xl"
            style={{ color: "rgb(var(--copy-primary))" }}
          >
            {isEditMode ? "Edit Note" : "New Note"}
          </h1>
        </div>

        {/* ── Toolbar row ─────────────────────────────────── */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          {/* Notebook selector (OPTIONAL) */}
          <SmartDropdown open={showChapterDd} onOpenChange={setShowChapterDd}>
            <DropdownTrigger>
              <button
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:opacity-80 active:scale-[0.98]"
                style={{
                  backgroundColor: "rgb(var(--surface))",
                  color: "rgb(var(--copy-secondary))",
                }}
              >
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: selectedChapter?.color ?? "rgb(var(--copy-muted))",
                  }}
                />
                <span>{selectedChapter?.title ?? "Notebook"}</span>
                <DropdownChevron open={showChapterDd} />
              </button>
            </DropdownTrigger>
            <DropdownContent title="Select Notebook">
              {/* None / clear option */}
              {selectedChapter && (
                <DropdownItem
                  onClick={() => setSelectedChapter(null)}
                >
                  <span className="opacity-50">None</span>
                </DropdownItem>
              )}
              {chapters.map((ch) => (
                <DropdownItem
                  key={ch.id}
                  selected={selectedChapter?.id === ch.id}
                  onClick={() => setSelectedChapter(ch)}
                >
                  <span
                    className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: ch.color }}
                  />
                  <span className="truncate">{ch.title}</span>
                </DropdownItem>
              ))}
              {chapters.length === 0 && (
                <DropdownEmpty>No notebooks yet</DropdownEmpty>
              )}
              <DropdownSeparator />
              <DropdownItem
                onClick={() => navigate("/new-notebook")}
              >
                <span
                  className="flex h-5 w-5 items-center justify-center rounded text-xs"
                  style={{ backgroundColor: "rgba(var(--cta), 0.1)", color: "rgb(var(--cta))" }}
                >
                  +
                </span>
                <span style={{ color: "rgb(var(--cta))" }}>Create notebook</span>
              </DropdownItem>
            </DropdownContent>
          </SmartDropdown>

          {/* Tag selector */}
          <SmartDropdown open={showCollectionDd} onOpenChange={setShowCollectionDd}>
            <DropdownTrigger>
              <button
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:opacity-80 active:scale-[0.98]"
                style={{
                  backgroundColor: "rgb(var(--surface))",
                  color: "rgb(var(--copy-secondary))",
                }}
              >
                <span>
                  {selectedCollections.length > 0
                    ? `${selectedCollections.length} tag${selectedCollections.length !== 1 ? "s" : ""}`
                    : "Tags"}
                </span>
                <DropdownChevron open={showCollectionDd} />
              </button>
            </DropdownTrigger>
            <DropdownContent title="Select Tags">
              {collections.map((col) => {
                const active = selectedCollections.some((s) => s.id === col.id);
                return (
                  <DropdownItem
                    key={col.id}
                    selected={active}
                    onClick={() => toggleCollection(col)}
                    closeOnSelect={false}
                  >
                    <span
                      className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: col.color }}
                    />
                    <span className="flex-1 truncate">{col.name}</span>
                    {active && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 14 14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 7L6 10L11 4" />
                      </svg>
                    )}
                  </DropdownItem>
                );
              })}
              {collections.length === 0 && (
                <DropdownEmpty>No tags yet</DropdownEmpty>
              )}
              <DropdownSeparator />
              <DropdownItem
                onClick={() => navigate("/new-tag")}
              >
                <span
                  className="flex h-5 w-5 items-center justify-center rounded text-xs"
                  style={{ backgroundColor: "rgba(var(--cta), 0.1)", color: "rgb(var(--cta))" }}
                >
                  +
                </span>
                <span style={{ color: "rgb(var(--cta))" }}>Create tag</span>
              </DropdownItem>
            </DropdownContent>
          </SmartDropdown>

          {/* Mood selector */}
          <SmartDropdown open={showMoodDd} onOpenChange={setShowMoodDd}>
            <DropdownTrigger>
              <button
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:opacity-80 active:scale-[0.98]"
                style={{
                  backgroundColor: "rgb(var(--surface))",
                  color: "rgb(var(--copy-secondary))",
                }}
              >
                {selectedMoodObj ? (
                  <>
                    <span>{getEmojiFromShortcode(selectedMoodObj.emoji) || "😐"}</span>
                    <span className="capitalize">{selectedMoodObj.name}</span>
                  </>
                ) : (
                  <span>Mood</span>
                )}
                <DropdownChevron open={showMoodDd} />
              </button>
            </DropdownTrigger>
            <DropdownContent title="Select Mood">
              {/* None / clear option */}
              {selectedMood && (
                <DropdownItem
                  onClick={() => setSelectedMood("")}
                >
                  <span className="opacity-50">None</span>
                </DropdownItem>
              )}
              {moods.length === 0 && (
                <DropdownEmpty>No moods yet</DropdownEmpty>
              )}
              {moods.map((m) => (
                <DropdownItem
                  key={m.id}
                  selected={String(selectedMood) === String(m.id)}
                  onClick={() => {
                    if (String(selectedMood) === String(m.id)) {
                      setSelectedMood("");
                    } else {
                      setSelectedMood(m.id);
                    }
                  }}
                >
                  <span className="text-lg">{getEmojiFromShortcode(m.emoji) || "😐"}</span>
                  <span className="capitalize">{m.name}</span>
                </DropdownItem>
              ))}
            </DropdownContent>
          </SmartDropdown>

          {/* Optional label hint */}
          <span
            className="ml-auto text-xs hidden sm:inline"
            style={{ color: "rgb(var(--copy-muted))" }}
          >
            All fields except title and content are optional
          </span>
        </div>

        {/* ── Title input ─────────────────────────────────── */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          autoFocus
          className="mb-3 w-full border-none bg-transparent font-serif text-3xl font-medium outline-none placeholder:opacity-30"
          style={{ color: "rgb(var(--copy-primary))" }}
        />

        {/* ── Selected collections pills ──────────────────── */}
        {selectedCollections.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-1.5">
            {selectedCollections.map((col) => (
              <span
                key={col.id}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs"
                style={{
                  backgroundColor: col.color + "22",
                  color: col.color,
                }}
              >
                {col.name}
                <button
                  onClick={() => removeCollection(col.id)}
                  className="ml-0.5 opacity-60 transition-opacity hover:opacity-100"
                  aria-label={`Remove ${col.name}`}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <path d="M3 3L9 9M9 3L3 9" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}

        {/* ── Content textarea ────────────────────────────── */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing..."
          rows={16}
          className="w-full resize-none border-none bg-transparent text-base leading-relaxed outline-none placeholder:opacity-30"
          style={{
            color: "rgb(var(--copy-primary))",
            minHeight: "320px",
          }}
        />

        {/* ── Footer ──────────────────────────────────────── */}
        <div
          className="mt-10 flex items-center justify-between border-t pt-5"
          style={{ borderColor: "rgba(var(--border), 0.5)" }}
        >
          <div
            className="flex items-center gap-3 text-xs"
            style={{ color: "rgb(var(--copy-muted))" }}
          >
            <span>{wordCount} words</span>
            <span>·</span>
            <span>{readTime} min read</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded-md px-4 py-2 text-sm transition-colors hover:opacity-70"
              style={{ color: "rgb(var(--copy-secondary))" }}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isFormValid || isSaving}
              className="flex items-center gap-2 rounded-md px-5 py-2 text-sm font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                backgroundColor: "rgb(var(--cta))",
                color: "rgb(var(--cta-text))",
              }}
            >
              {isSaving && (
                <svg
                  className="h-3.5 w-3.5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              {isSaving
                ? "Saving..."
                : isEditMode
                  ? "Update"
                  : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEntry;
