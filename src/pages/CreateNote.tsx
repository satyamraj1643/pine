import React, { useState, useEffect, useCallback } from "react";
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

  // AI mood suggestions that don't exist yet (pending creation on save)
  const [pendingMoods, setPendingMoods] = useState<{ name: string; emoji: string }[]>([]);

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

  // Save draft periodically (debounced 2s)
  useEffect(() => {
    if (isEditMode || isSaving) return;
    const timer = setTimeout(() => {
      if (title.trim() || content.trim()) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, content }));
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [title, content, isEditMode, isSaving]);

  // Clear draft on successful save
  const clearDraft = () => localStorage.removeItem(DRAFT_KEY);

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
  const availableCollections = collections.filter(
    (c) => !selectedCollections.some((s) => s.id === c.id),
  );

  const totalMoodCount = selectedMoods.length + pendingMoods.length;

  // FIXED: notebook is now OPTIONAL — only title + content required
  const isFormValid = title.trim() && content.trim() && content !== "<p></p>";

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

  const handleSave = async () => {
    if (!isFormValid || isSaving) return;

    setIsSaving(true);

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

    try {
      if (isEditMode) {
        const res = await UpdateEntry(st.id ?? st.ID ?? st.entry?.id, payload);
        if (res?.updated) {
          clearDraft();
          toast.success("Note updated");
          navigate("/notes");
        } else {
          toast.error(res?.detail || "Couldn't update note");
          setIsSaving(false);
        }
      } else {
        const res = await CreateNewEntry(payload);
        if (res?.created) {
          clearDraft();
          toast.success("Note created");
          navigate("/notes");
        } else {
          toast.error(res?.detail || "Couldn't create note");
          setIsSaving(false);
        }
      }
    } catch {
      toast.error("Something went wrong");
      setIsSaving(false);
    }
  };

  // ── Keyboard shortcuts ──────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }); // intentionally no deps — always uses latest handleSave

  // ── Render ─────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "rgb(var(--background))" }}
    >
      <div         className="mx-auto max-w-2xl px-4 py-10">
        {/* ── Header ──────────────────────────────────────── */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-primary))] transition-colors mb-8"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Notes
        </button>
        <h1
          className="text-xl font-semibold mb-10"
          style={{ color: "rgb(var(--copy-primary))" }}
        >
          {isEditMode ? "Edit Note" : "New Note"}
        </h1>

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

          {/* Mood selector (multi-select, like tags) */}
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
                  <span>
                    {totalMoodCount} mood{totalMoodCount !== 1 ? "s" : ""}
                  </span>
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
                    <span className="text-lg">{getEmojiFromShortcode(m.emoji) || "\u{1F610}"}</span>
                    <span className="flex-1 capitalize truncate">{m.name}</span>
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
              {moods.length === 0 && (
                <DropdownEmpty>No moods yet</DropdownEmpty>
              )}
            </DropdownContent>
          </SmartDropdown>

          {/* AI mood suggestion (additive — adds to selected moods) */}
          <button
            type="button"
            onClick={async () => {
              if (!content || content.length < 20) {
                toast("Write a bit more first");
                return;
              }
              toast.loading("Detecting mood...", { id: "mood-suggest" });
              try {
                const res = await AISuggestMood(content);
                toast.dismiss("mood-suggest");
                if (res.mood_name) {
                  if (res.is_new === false && res.mood_id) {
                    // Existing mood — auto-add
                    const found = moods.find((m) => String(m.id) === String(res.mood_id));
                    if (found) {
                      const alreadySelected = selectedMoods.some((m) => String(m.id) === String(found.id));
                      if (!alreadySelected) {
                        setSelectedMoods((prev) => [...prev, found]);
                      }
                      toast.success(`Matched: ${res.mood_name}`);
                    } else {
                      // ID not in our local list — double-check by name
                      const byName = moods.find((m) => m.name.toLowerCase() === res.mood_name!.toLowerCase());
                      if (byName) {
                        const alreadySelected = selectedMoods.some((m) => String(m.id) === String(byName.id));
                        if (!alreadySelected) setSelectedMoods((prev) => [...prev, byName]);
                        toast.success(`Matched: ${byName.name}`);
                      } else {
                        // Truly not found — ask user
                        toast(
                          (t) => (
                            <span className="flex items-center gap-2 text-sm">
                              <span>No match. Add <b className="capitalize">{res.mood_name}</b>?</span>
                              <button
                                className="font-medium px-2 py-0.5 rounded text-xs"
                                style={{ backgroundColor: "rgb(var(--cta))", color: "rgb(var(--cta-text))" }}
                                onClick={() => {
                                  setPendingMoods((prev) => [...prev, { name: res.mood_name!, emoji: res.mood_emoji || "neutral_face" }]);
                                  toast.dismiss(t.id);
                                  toast.success(`${res.mood_name} added`);
                                }}
                              >
                                Add
                              </button>
                              <button
                                className="text-xs opacity-50 hover:opacity-100"
                                onClick={() => toast.dismiss(t.id)}
                              >
                                Skip
                              </button>
                            </span>
                          ),
                          { duration: 6000 },
                        );
                      }
                    }
                  } else {
                    // New mood — check by name first (AI might be wrong about is_new)
                    const existingMatch = moods.find((m) => m.name.toLowerCase() === res.mood_name!.toLowerCase());
                    if (existingMatch) {
                      const alreadySelected = selectedMoods.some((m) => String(m.id) === String(existingMatch.id));
                      if (!alreadySelected) setSelectedMoods((prev) => [...prev, existingMatch]);
                      toast.success(`Matched: ${existingMatch.name}`);
                    } else {
                      // Actually new — confirm with user
                      const alreadyPending = pendingMoods.some((m) => m.name.toLowerCase() === res.mood_name!.toLowerCase());
                      if (alreadyPending) {
                        toast(`${res.mood_name} already added`);
                      } else {
                        toast(
                          (t) => (
                            <span className="flex items-center gap-2 text-sm">
                              <span>No match. Create <b className="capitalize">{res.mood_name}</b>?</span>
                              <button
                                className="font-medium px-2 py-0.5 rounded text-xs"
                                style={{ backgroundColor: "rgb(var(--cta))", color: "rgb(var(--cta-text))" }}
                                onClick={() => {
                                  setPendingMoods((prev) => [...prev, { name: res.mood_name!, emoji: res.mood_emoji || "neutral_face" }]);
                                  toast.dismiss(t.id);
                                  toast.success(`${res.mood_name} added`);
                                }}
                              >
                                Create
                              </button>
                              <button
                                className="text-xs opacity-50 hover:opacity-100"
                                onClick={() => toast.dismiss(t.id)}
                              >
                                Skip
                              </button>
                            </span>
                          ),
                          { duration: 6000 },
                        );
                      }
                    }
                  }
                } else {
                  toast.error(res.error || "Couldn't detect mood");
                }
              } catch {
                toast.dismiss("mood-suggest");
                toast.error("Something went wrong detecting mood");
              }
            }}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs transition-colors hover:opacity-80"
            style={{
              backgroundColor: "rgba(var(--cta), 0.08)",
              color: "rgb(var(--cta))",
            }}
            title="Detect mood from your writing"
            aria-label="Detect mood from your writing"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" />
            </svg>
            Detect mood
          </button>

          
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
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
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

        {/* ── Selected mood pills ─────────────────────────── */}
        {(selectedMoods.length > 0 || pendingMoods.length > 0) && (
          <div className="mb-6 flex flex-wrap items-center gap-1.5">
            {selectedMoods.map((m) => (
              <span
                key={m.id}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs"
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
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M3 3L9 9M9 3L3 9" />
                  </svg>
                </button>
              </span>
            ))}
            {pendingMoods.map((pm) => (
              <span
                key={`pending-${pm.name}`}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs border border-dashed"
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
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M3 3L9 9M9 3L3 9" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}

        {/* ── Content editor ─────────────────────────────── */}
        <RichTextEditor
          content={content}
          onChange={(html) => setContent(html)}
          placeholder="Start writing..."
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
