import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import {
  GetAllCollections,
  GetAllMood,
  CreateNewEntry,
  GetAllChapter,
  UpdateEntry,
  AISuggestMood,
  CreateMood,
  createTag,
  CreateNewChapter,
} from "../APIs";
import { getEmojiFromShortcode } from "../utilities/emoji";
import RichTextEditor, { htmlToPlainText } from "../components/RichTextEditor";
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
// Preset colors for inline creation
// ────────────────────────────────────────────────────────────

const TAG_COLORS = [
  "#FF5722", "#007BFF", "#28A745", "#DC3545",
  "#6F42C1", "#6C757D", "#ADBE98", "#f4a261",
];

const NOTEBOOK_COLORS = [
  "#FF5722", "#2196F3", "#4CAF50", "#F44336",
  "#9C27B0", "#607D8B", "#8BC34A", "#f4a261",
];

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────

const CreateEntry: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isEditMode = location.state?.update === true;
  const st = location.state ?? {};

  // ── Entry ID (null for new notes until first save) ─────
  const [entryId, setEntryId] = useState<number | null>(
    isEditMode ? (st.id ?? st.ID ?? st.entry?.id ?? null) : null
  );

  // ── Data lists ─────────────────────────────────────────────
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [moods, setMoods] = useState<Mood[]>([]);

  const refreshData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

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
  const [selectedMoods, setSelectedMoods] = useState<Mood[]>(
    (st.Moods ?? st.moods ?? st.entry?.moods ?? st.entry?.Moods ?? [])
      .map((m: Record<string, any>) => normalizeMood(m))
      .filter(Boolean) as Mood[],
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
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // AI mood suggestions that don't exist yet (pending creation on save)
  const [pendingMoods, setPendingMoods] = useState<{ name: string; emoji: string }[]>([]);
  const [isDetectingMood, setIsDetectingMood] = useState(false);

  // ── Inline tag creation state ──────────────────────────────
  const [showInlineTagCreate, setShowInlineTagCreate] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  // ── Inline notebook creation state ─────────────────────────
  const [showInlineNotebookCreate, setShowInlineNotebookCreate] = useState(false);
  const [newNotebookTitle, setNewNotebookTitle] = useState("");
  const [newNotebookColor, setNewNotebookColor] = useState(NOTEBOOK_COLORS[1]);
  const [isCreatingNotebook, setIsCreatingNotebook] = useState(false);

  // ── Refs for auto-save ─────────────────────────────────────
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);

  // Snapshot of last-saved state for dirty tracking
  const lastSavedRef = useRef({
    title: title,
    content: content,
    chapter: selectedChapter?.id ?? null,
    collections: selectedCollections.map((c) => c.id).sort().join(","),
    moods: selectedMoods.map((m) => String(m.id)).sort().join(","),
    pendingMoods: pendingMoods.map((m) => m.name).sort().join(","),
  });

  // ── Auto-save draft to localStorage ────────────────────────
  const DRAFT_KEY = "pine-draft";

  // Restore draft on mount (only for new notes, not edits)
  useEffect(() => {
    if (!isEditMode && !st.title && !st.content) {
      try {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
          const draft = JSON.parse(saved);
          if (draft.title) setTitle(draft.title);
          if (draft.content) setContent(draft.content);
        }
      } catch { /* ignore corrupt drafts */ }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save draft to localStorage (debounced 1s)
  useEffect(() => {
    if (isEditMode || isSaving) return;
    const timer = setTimeout(() => {
      if (title.trim() || content.trim()) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, content }));
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [title, content, isEditMode, isSaving]);

  const clearDraft = () => localStorage.removeItem(DRAFT_KEY);

  // ── Dirty tracking (changes since last successful save) ────
  const currentSnapshot = useCallback(() => ({
    title,
    content,
    chapter: selectedChapter?.id ?? null,
    collections: selectedCollections.map((c) => c.id).sort().join(","),
    moods: selectedMoods.map((m) => String(m.id)).sort().join(","),
    pendingMoods: pendingMoods.map((m) => m.name).sort().join(","),
  }), [title, content, selectedChapter, selectedCollections, selectedMoods, pendingMoods]);

  const isDirty = useCallback(() => {
    const snap = currentSnapshot();
    const last = lastSavedRef.current;
    return (
      snap.title !== last.title ||
      snap.content !== last.content ||
      snap.chapter !== last.chapter ||
      snap.collections !== last.collections ||
      snap.moods !== last.moods ||
      snap.pendingMoods !== last.pendingMoods
    );
  }, [currentSnapshot]);

  // Has any content at all (for form validity)
  const hasContent = title.trim() !== "" || (content.trim() !== "" && content !== "<p></p>");

  // ── Browser tab close: warn if unsaved ──────────────────────
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty() && !isSavingRef.current) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // ── Derived ────────────────────────────────────────────────
  const totalMoodCount = selectedMoods.length + pendingMoods.length;

  const isFormValid = Boolean(title.trim() && content.trim() && content !== "<p></p>");

  const plainText = htmlToPlainText(content);
  const wordCount = plainText
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

  const toggleMood = useCallback(
    (mood: Mood) => {
      setSelectedMoods((prev) => {
        const exists = prev.some((m) => String(m.id) === String(mood.id));
        return exists ? prev.filter((m) => String(m.id) !== String(mood.id)) : [...prev, mood];
      });
    },
    [],
  );

  const removeMood = useCallback((id: string | number) => {
    setSelectedMoods((prev) => prev.filter((m) => String(m.id) !== String(id)));
  }, []);

  const removePendingMood = useCallback((name: string) => {
    setPendingMoods((prev) => prev.filter((m) => m.name !== name));
  }, []);

  // ── Inline tag creation handler ────────────────────────────
  const handleCreateTag = async () => {
    if (!newTagName.trim() || isCreatingTag) return;
    setIsCreatingTag(true);
    try {
      const res = await createTag({
        name: newTagName.trim(),
        color: newTagColor,
        slug: null,
      });
      if (res) {
        // Refresh collections list and auto-select the new tag
        const colRes = await GetAllCollections();
        if (colRes?.data) {
          const updated = colRes.data
            .map((c: Record<string, any>) => normalizeCollection(c))
            .filter(Boolean) as Collection[];
          setCollections(updated);
          // Find and auto-select the newly created tag
          const newCol = updated.find(
            (c) => c.name.toLowerCase() === newTagName.trim().toLowerCase()
          );
          if (newCol) {
            setSelectedCollections((prev) => {
              const exists = prev.some((c) => c.id === newCol.id);
              return exists ? prev : [...prev, newCol];
            });
          }
        }
        setNewTagName("");
        setShowInlineTagCreate(false);
      }
    } catch {
      toast.error("Failed to create tag");
    } finally {
      setIsCreatingTag(false);
    }
  };

  // ── Inline notebook creation handler ───────────────────────
  const handleCreateNotebook = async () => {
    if (!newNotebookTitle.trim() || isCreatingNotebook) return;
    setIsCreatingNotebook(true);
    try {
      const res = await CreateNewChapter({
        title: newNotebookTitle.trim(),
        color: newNotebookColor,
      });
      if (res) {
        // Refresh chapters list and auto-select the new notebook
        const chapRes = await GetAllChapter();
        if (chapRes?.data) {
          const updated = chapRes.data
            .map((c: Record<string, any>) => normalizeChapter(c))
            .filter(Boolean) as Chapter[];
          setChapters(updated);
          // Find and auto-select the newly created notebook
          const newChap = updated.find(
            (c) => c.title.toLowerCase() === newNotebookTitle.trim().toLowerCase()
          );
          if (newChap) {
            setSelectedChapter(newChap);
          }
        }
        setNewNotebookTitle("");
        setShowInlineNotebookCreate(false);
      }
    } catch {
      toast.error("Failed to create notebook");
    } finally {
      setIsCreatingNotebook(false);
    }
  };

  // ── Save function ───────────────────────────────────────────
  const performSave = useCallback(async (): Promise<boolean> => {
    if (!isFormValid || isSavingRef.current) return false;

    isSavingRef.current = true;
    setIsSaving(true);
    setAutoSaveStatus("saving");

    // Collect mood IDs: existing moods first
    const moodIds: (string | number)[] = selectedMoods.map((m) => m.id);

    // Create any pending (AI-suggested new) moods
    for (const pm of pendingMoods) {
      try {
        const created = await CreateMood({
          name: pm.name,
          emoji: pm.emoji,
          color: "#8b8b8b",
        });
        if (created) {
          const moodRes = await GetAllMood();
          if (moodRes?.data) {
            const found = moodRes.data.find((m: any) =>
              (m.Name ?? m.name)?.toLowerCase() === pm.name.toLowerCase()
            );
            if (found) {
              moodIds.push(found.ID ?? found.id);
            }
          }
        }
      } catch {
        // Skip this pending mood if creation fails
      }
    }

    const payload = {
      title: title.trim(),
      content: content.trim(),
      chapter: selectedChapter ? Number(selectedChapter.id) || null : null,
      collection: selectedCollections.map((c) => Number(c.id)).filter(Boolean),
      mood: moodIds.map((id) => Number(id)).filter(Boolean),
    };

    let success = false;
    try {
      if (entryId) {
        const res = await UpdateEntry(entryId, payload);
        if (res?.updated) {
          clearDraft();
          setAutoSaveStatus("saved");
          success = true;
        } else {
          setAutoSaveStatus("error");
        }
      } else {
        const res = await CreateNewEntry(payload);
        if (res?.created) {
          clearDraft();
          if (res.id) {
            setEntryId(res.id);
          }
          setAutoSaveStatus("saved");
          success = true;
        } else {
          setAutoSaveStatus("error");
        }
      }
    } catch {
      setAutoSaveStatus("error");
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }

    // Update last-saved snapshot on success
    if (success) {
      lastSavedRef.current = {
        title,
        content,
        chapter: selectedChapter?.id ?? null,
        collections: selectedCollections.map((c) => c.id).sort().join(","),
        moods: selectedMoods.map((m) => String(m.id)).sort().join(","),
        pendingMoods: pendingMoods.map((m) => m.name).sort().join(","),
      };
    }

    return success;
  }, [isFormValid, selectedMoods, pendingMoods, title, content, selectedChapter, selectedCollections, entryId]);

  // ── Auto-save effect: 1.5s after any change ────────────────
  useEffect(() => {
    if (!isFormValid || !isDirty()) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      performSave();
    }, 1500);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [title, content, selectedChapter, selectedCollections, selectedMoods, pendingMoods, isFormValid, isDirty, performSave]);

  // Reset "saved" status after 3s
  useEffect(() => {
    if (autoSaveStatus === "saved") {
      const t = setTimeout(() => setAutoSaveStatus("idle"), 3000);
      return () => clearTimeout(t);
    }
  }, [autoSaveStatus]);

  // ── Keyboard shortcuts ──────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        performSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }); // intentionally no deps — always uses latest

  // ── Back button handler (save-before-leave) ────────────────
  const handleBack = useCallback(async () => {
    if (isDirty() && isFormValid) {
      await performSave();
    }
    navigate(-1);
  }, [isDirty, isFormValid, performSave, navigate]);

  // ── Manual mood detect handler ─────────────────────────────
  const handleDetectMood = async () => {
    if (!content || content.length < 20) {
      toast("Write a bit more first");
      return;
    }
    setIsDetectingMood(true);
    try {
      const res = await AISuggestMood(content);
      if (res.mood_name) {
        if (res.is_new === false && res.mood_id) {
          const found = moods.find((m) => String(m.id) === String(res.mood_id));
          if (found) {
            const alreadySelected = selectedMoods.some((m) => String(m.id) === String(found.id));
            if (!alreadySelected) setSelectedMoods((prev) => [...prev, found]);
          } else {
            const byName = moods.find((m) => m.name.toLowerCase() === res.mood_name!.toLowerCase());
            if (byName) {
              const alreadySelected = selectedMoods.some((m) => String(m.id) === String(byName.id));
              if (!alreadySelected) setSelectedMoods((prev) => [...prev, byName]);
            } else {
              setPendingMoods((prev) => [...prev, { name: res.mood_name!, emoji: res.mood_emoji || "neutral_face" }]);
            }
          }
        } else {
          const existingMatch = moods.find((m) => m.name.toLowerCase() === res.mood_name!.toLowerCase());
          if (existingMatch) {
            const alreadySelected = selectedMoods.some((m) => String(m.id) === String(existingMatch.id));
            if (!alreadySelected) setSelectedMoods((prev) => [...prev, existingMatch]);
          } else {
            const alreadyPending = pendingMoods.some((m) => m.name.toLowerCase() === res.mood_name!.toLowerCase());
            if (!alreadyPending) {
              setPendingMoods((prev) => [...prev, { name: res.mood_name!, emoji: res.mood_emoji || "neutral_face" }]);
            }
          }
        }
      } else {
        toast.error(res.error || "Couldn't detect mood");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsDetectingMood(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "rgb(var(--background))" }}
    >
      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* ── Header row ──────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: "rgb(var(--copy-muted))" }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Notes
          </button>

          {/* Save status — always in the same spot, no layout shift */}
          <div className="h-5 flex items-center">
            {autoSaveStatus === "saving" && (
              <span className="flex items-center gap-1.5 text-xs" style={{ color: "rgb(var(--copy-muted))" }}>
                <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </span>
            )}
            {autoSaveStatus === "saved" && (
              <span className="flex items-center gap-1 text-xs" style={{ color: "rgb(var(--cta))" }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 6l3 3 5-5" />
                </svg>
                Saved
              </span>
            )}
            {autoSaveStatus === "error" && (
              <span className="text-xs text-red-400">Save failed</span>
            )}
          </div>
        </div>

        {/* ── Title input ─────────────────────────────────── */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          autoFocus
          className="mb-6 w-full border-none bg-transparent font-serif text-3xl font-medium outline-none placeholder:opacity-30"
          style={{ color: "rgb(var(--copy-primary))" }}
        />

        {/* ── Toolbar row (relative for floating panels) ─── */}
        <div className="relative mb-2">
          <div className="flex items-center gap-2">
            {/* Notebook selector */}
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
                    className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: selectedChapter?.color ?? "rgb(var(--copy-muted))",
                    }}
                  />
                  <span className="truncate max-w-[100px]">{selectedChapter?.title ?? "Notebook"}</span>
                  <DropdownChevron open={showChapterDd} />
                </button>
              </DropdownTrigger>
              <DropdownContent title="Select Notebook">
                {selectedChapter && (
                  <DropdownItem onClick={() => setSelectedChapter(null)}>
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
                  onClick={() => {
                    setShowInlineNotebookCreate(true);
                    setShowInlineTagCreate(false);
                    setShowChapterDd(false);
                  }}
                >
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded text-xs"
                    style={{ backgroundColor: "rgba(var(--cta), 0.1)", color: "rgb(var(--cta))" }}
                  >+</span>
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
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                  onClick={() => {
                    setShowInlineTagCreate(true);
                    setShowInlineNotebookCreate(false);
                    setShowCollectionDd(false);
                  }}
                >
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded text-xs"
                    style={{ backgroundColor: "rgba(var(--cta), 0.1)", color: "rgb(var(--cta))" }}
                  >+</span>
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
                  {totalMoodCount > 0 ? (
                    <span>{totalMoodCount} mood{totalMoodCount !== 1 ? "s" : ""}</span>
                  ) : (
                    <span>Moods</span>
                  )}
                  <DropdownChevron open={showMoodDd} />
                </button>
              </DropdownTrigger>
              <DropdownContent title="Select Moods">
                {moods.map((m) => {
                  const active = selectedMoods.some((s) => String(s.id) === String(m.id));
                  return (
                    <DropdownItem
                      key={m.id}
                      selected={active}
                      onClick={() => toggleMood(m)}
                      closeOnSelect={false}
                    >
                      <span className="text-base">{getEmojiFromShortcode(m.emoji) || "\u{1F610}"}</span>
                      <span className="flex-1 capitalize truncate">{m.name}</span>
                      {active && (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 7L6 10L11 4" />
                        </svg>
                      )}
                    </DropdownItem>
                  );
                })}
                {moods.length === 0 && (
                  <DropdownEmpty>No moods yet</DropdownEmpty>
                )}
              </DropdownContent>
            </SmartDropdown>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Detect mood button */}
            <button
              type="button"
              onClick={handleDetectMood}
              disabled={isDetectingMood}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors hover:opacity-80 disabled:opacity-40"
              style={{
                backgroundColor: "rgba(var(--cta), 0.08)",
                color: "rgb(var(--cta))",
              }}
              title="Detect mood from your writing"
            >
              {isDetectingMood ? (
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" />
                </svg>
              )}
              Detect mood
            </button>
          </div>

          {/* ── Floating notebook creation panel (absolute — no layout shift) */}
          {showInlineNotebookCreate && (
            <div
              className="absolute top-full left-0 right-0 z-20 mt-2 rounded-lg border p-3 space-y-2.5"
              style={{
                borderColor: "rgb(var(--border))",
                backgroundColor: "rgb(var(--card))",
                boxShadow: "0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: "rgb(var(--copy-secondary))" }}>
                  New Notebook
                </span>
                <button
                  onClick={() => { setShowInlineNotebookCreate(false); setNewNotebookTitle(""); }}
                  className="p-1 rounded-md transition-colors"
                  style={{ color: "rgb(var(--copy-muted))" }}
                  aria-label="Close"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M3 3L9 9M9 3L3 9" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                {NOTEBOOK_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewNotebookColor(c)}
                    className={`w-5 h-5 rounded-full transition-all hover:scale-110 ${newNotebookColor === c ? "ring-2 ring-offset-1" : ""}`}
                    style={{
                      backgroundColor: c,
                      ...(newNotebookColor === c
                        ? { ringColor: "rgb(var(--cta))", outlineColor: "rgb(var(--cta))", boxShadow: `0 0 0 2px rgb(var(--card)), 0 0 0 4px ${c}` }
                        : {}),
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Notebook name..."
                  value={newNotebookTitle}
                  onChange={(e) => setNewNotebookTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateNotebook();
                    if (e.key === "Escape") { setShowInlineNotebookCreate(false); setNewNotebookTitle(""); }
                  }}
                  autoFocus
                  className="flex-1 rounded-md border px-2.5 py-1.5 text-sm outline-none transition-colors"
                  style={{
                    borderColor: "rgb(var(--border))",
                    backgroundColor: "rgb(var(--surface))",
                    color: "rgb(var(--copy-primary))",
                  }}
                />
                <button
                  onClick={handleCreateNotebook}
                  disabled={!newNotebookTitle.trim() || isCreatingNotebook}
                  className="px-3 py-1.5 text-xs rounded-md font-medium disabled:opacity-40 transition-opacity"
                  style={{ backgroundColor: "rgb(var(--cta))", color: "rgb(var(--cta-text))" }}
                >
                  {isCreatingNotebook ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          )}

          {/* ── Floating tag creation panel (absolute — no layout shift) */}
          {showInlineTagCreate && (
            <div
              className="absolute top-full left-0 right-0 z-20 mt-2 rounded-lg border p-3 space-y-2.5"
              style={{
                borderColor: "rgb(var(--border))",
                backgroundColor: "rgb(var(--card))",
                boxShadow: "0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: "rgb(var(--copy-secondary))" }}>
                  New Tag
                </span>
                <button
                  onClick={() => { setShowInlineTagCreate(false); setNewTagName(""); }}
                  className="p-1 rounded-md transition-colors"
                  style={{ color: "rgb(var(--copy-muted))" }}
                  aria-label="Close"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M3 3L9 9M9 3L3 9" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                {TAG_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewTagColor(c)}
                    className={`w-5 h-5 rounded-full transition-all hover:scale-110 ${newTagColor === c ? "ring-2 ring-offset-1" : ""}`}
                    style={{
                      backgroundColor: c,
                      ...(newTagColor === c
                        ? { boxShadow: `0 0 0 2px rgb(var(--card)), 0 0 0 4px ${c}` }
                        : {}),
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Tag name..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateTag();
                    if (e.key === "Escape") { setShowInlineTagCreate(false); setNewTagName(""); }
                  }}
                  autoFocus
                  className="flex-1 rounded-md border px-2.5 py-1.5 text-sm outline-none transition-colors"
                  style={{
                    borderColor: "rgb(var(--border))",
                    backgroundColor: "rgb(var(--surface))",
                    color: "rgb(var(--copy-primary))",
                  }}
                />
                <button
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim() || isCreatingTag}
                  className="px-3 py-1.5 text-xs rounded-md font-medium disabled:opacity-40 transition-opacity"
                  style={{ backgroundColor: "rgb(var(--cta))", color: "rgb(var(--cta-text))" }}
                >
                  {isCreatingTag ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Metadata pills row (always rendered — stable height) ── */}
        <div className="mb-6 flex items-center gap-1.5 overflow-x-auto min-h-[28px]">
          {/* Mood pills */}
          {selectedMoods.map((m) => (
            <span
              key={m.id}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs whitespace-nowrap flex-shrink-0"
              style={{
                backgroundColor: m.color + "22",
                color: m.color,
              }}
            >
              <span>{getEmojiFromShortcode(m.emoji) || "\u{1F610}"}</span>
              <span className="capitalize">{m.name}</span>
              <button
                onClick={() => removeMood(m.id)}
                className="ml-0.5 opacity-60 transition-opacity hover:opacity-100"
                aria-label={`Remove ${m.name}`}
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M3 3L9 9M9 3L3 9" />
                </svg>
              </button>
            </span>
          ))}
          {pendingMoods.map((pm) => (
            <span
              key={`pending-${pm.name}`}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs border border-dashed whitespace-nowrap flex-shrink-0"
              style={{
                borderColor: "rgb(var(--copy-muted))",
                color: "rgb(var(--copy-secondary))",
              }}
            >
              <span>{getEmojiFromShortcode(pm.emoji) || "\u{2728}"}</span>
              <span className="capitalize">{pm.name}</span>
              <span className="text-[10px] opacity-50">new</span>
              <button
                onClick={() => removePendingMood(pm.name)}
                className="ml-0.5 opacity-60 transition-opacity hover:opacity-100"
                aria-label={`Remove ${pm.name}`}
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M3 3L9 9M9 3L3 9" />
                </svg>
              </button>
            </span>
          ))}
          {/* Tag pills */}
          {selectedCollections.map((col) => (
            <span
              key={col.id}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs whitespace-nowrap flex-shrink-0"
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
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M3 3L9 9M9 3L3 9" />
                </svg>
              </button>
            </span>
          ))}
        </div>

        {/* ── Content editor ──────────────────────────────── */}
        <RichTextEditor
          content={content}
          onChange={(html) => setContent(html)}
          placeholder="Start writing..."
        />

        {/* ── Footer ──────────────────────────────────────── */}
        <div
          className="mt-8 flex items-center gap-3 text-xs pt-4 border-t"
          style={{
            borderColor: "rgba(var(--border), 0.5)",
            color: "rgb(var(--copy-muted))",
          }}
        >
          <span>{wordCount} words</span>
          <span>·</span>
          <span>{readTime} min read</span>
        </div>
      </div>
    </div>
  );
};

export default CreateEntry;
