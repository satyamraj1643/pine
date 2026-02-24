import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { GetAllNotes, GetAllChapter, GetAllTags, GetAllMood } from "../APIs";
import toast from "react-hot-toast";

// ─── Helpers ─────────────────────────────────────────────

const LAST_EXPORT_KEY = "pine_last_exported";

function getDateString(): string {
  return new Date().toISOString().split("T")[0];
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function estimateSize(str: string): string {
  const bytes = new Blob([str]).size;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

// ─── Read fields from mixed-case API objects ─────────────

function str(obj: any, ...keys: string[]): string {
  if (!obj) return "";
  for (const k of keys) {
    if (obj[k]) return String(obj[k]);
  }
  return "";
}

// ─── Build JSON export ───────────────────────────────────

function buildJsonExport(notes: any[], chapters: any[], tags: any[], moods: any[]): string {
  return JSON.stringify(
    {
      exported_at: new Date().toISOString(),
      notes,
      notebooks: chapters,
      tags,
      moods,
    },
    null,
    2,
  );
}

// ─── Build Markdown export ───────────────────────────────

function buildMarkdownExport(notes: any[]): string {
  if (notes.length === 0) return "# Pine Journal\n\nNo notes yet.\n";

  const sections = notes.map((note) => {
    const title = str(note, "title", "Title") || "Untitled";
    const content = str(note, "content", "Content");
    const createdAt = str(note, "created_at", "CreatedAt");
    const date = createdAt ? createdAt.split("T")[0] : "";

    // Chapter is an object on the note, not an ID
    const chapter = note?.chapter ?? note?.Chapter;
    const notebook = str(chapter, "title", "Title", "name", "Name");

    // Collection is an array of tag objects on the note
    const collection = note?.collection ?? note?.Collections ?? [];
    const tagNames: string[] = Array.isArray(collection)
      ? collection.map((t: any) => str(t, "name", "Name")).filter(Boolean)
      : [];

    // Moods is now an array on the note
    const moods = note?.Moods ?? note?.moods ?? [];
    const moodStrs: string[] = (Array.isArray(moods) ? moods : [])
      .map((m: any) => {
        const name = str(m, "name", "Name");
        const emoji = str(m, "emoji", "Emoji");
        return emoji && name ? `${emoji} ${name}` : name;
      })
      .filter(Boolean);
    const moodStr = moodStrs.join(", ");

    const lines = ["---", `title: "${title.replace(/"/g, '\\"')}"`];
    if (date) lines.push(`date: ${date}`);
    if (notebook) lines.push(`notebook: "${notebook.replace(/"/g, '\\"')}"`);
    if (tagNames.length) lines.push(`tags: [${tagNames.map((t) => `"${t}"`).join(", ")}]`);
    if (moodStr) lines.push(`mood: "${moodStr}"`);
    lines.push("---");

    return lines.join("\n") + "\n\n" + content;
  });

  return sections.join("\n\n---\n\n") + "\n";
}

// ─── Inline icons ────────────────────────────────────────

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v8m0 0l-3-3m3 3l3-3" />
      <path d="M3 12h10" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="animate-spin">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="8" strokeLinecap="round" />
    </svg>
  );
}

// ─── Main component ──────────────────────────────────────

export default function Backup() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [moods, setMoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [exportingJson, setExportingJson] = useState(false);
  const [exportingMd, setExportingMd] = useState(false);
  const [lastExported, setLastExported] = useState<string | null>(
    localStorage.getItem(LAST_EXPORT_KEY),
  );

  useEffect(() => {
    let cancelled = false;
    async function fetchAll() {
      setLoading(true);
      setFetchError(false);
      try {
        const [notesRes, chaptersRes, tagsRes, moodsRes] = await Promise.all([
          GetAllNotes(),
          GetAllChapter(),
          GetAllTags(),
          GetAllMood(),
        ]);
        if (cancelled) return;
        setNotes(notesRes?.fetched && Array.isArray(notesRes.data) ? notesRes.data : []);
        setChapters(chaptersRes?.fetched && Array.isArray(chaptersRes.data) ? chaptersRes.data : []);
        setTags(Array.isArray(tagsRes?.data) ? tagsRes.data : []);
        setMoods(moodsRes?.fetched && Array.isArray(moodsRes.data) ? moodsRes.data : []);
      } catch {
        if (!cancelled) setFetchError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchAll();
    return () => { cancelled = true; };
  }, []);

  const markExported = useCallback(() => {
    const now = new Date().toISOString();
    localStorage.setItem(LAST_EXPORT_KEY, now);
    setLastExported(now);
  }, []);

  const handleExportJson = useCallback(() => {
    setExportingJson(true);
    try {
      const content = buildJsonExport(notes, chapters, tags, moods);
      triggerDownload(content, `pine-backup-${getDateString()}.json`, "application/json");
      markExported();
      toast.success("Backup downloaded");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setExportingJson(false);
    }
  }, [notes, chapters, tags, moods, markExported]);

  const handleExportMarkdown = useCallback(() => {
    setExportingMd(true);
    try {
      const content = buildMarkdownExport(notes);
      triggerDownload(content, `pine-export-${getDateString()}.md`, "text/markdown");
      markExported();
      toast.success("Export downloaded");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setExportingMd(false);
    }
  }, [notes, markExported]);

  // Pre-compute sizes
  const jsonSize = !loading ? estimateSize(buildJsonExport(notes, chapters, tags, moods)) : "...";
  const mdSize = !loading ? estimateSize(buildMarkdownExport(notes)) : "...";

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-7 w-48 rounded bg-[rgb(var(--surface))] animate-pulse" />
          <div className="h-4 w-64 rounded bg-[rgb(var(--surface))] animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-[rgb(var(--surface))] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <PageHeader title="Export & Backup" subtitle="Download your journal" />
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-8 text-center">
          <p className="text-sm text-[rgb(var(--copy-secondary))] mb-3">
            Couldn't load your data. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--copy-secondary))] hover:text-[rgb(var(--copy-primary))] transition-colors mb-6"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Back
      </button>
      <PageHeader title="Export & Backup" subtitle="Download a copy of your journal" />

      {/* What you have */}
      <p className="text-sm text-[rgb(var(--copy-secondary))] mb-6">
        You have <strong>{notes.length}</strong> {notes.length === 1 ? "note" : "notes"},{" "}
        <strong>{chapters.length}</strong> {chapters.length === 1 ? "notebook" : "notebooks"},{" "}
        <strong>{tags.length}</strong> {tags.length === 1 ? "tag" : "tags"}, and{" "}
        <strong>{moods.length}</strong> {moods.length === 1 ? "mood" : "moods"}.
      </p>

      {lastExported && (
        <p className="text-[11px] text-[rgb(var(--copy-muted))] mb-6">
          Last downloaded {formatTimestamp(lastExported)}
        </p>
      )}

      {/* Export options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {/* Full backup */}
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-5 flex flex-col">
          <h3 className="text-sm font-semibold text-[rgb(var(--copy-primary))] mb-1">
            Full Backup
          </h3>
          <p className="text-xs text-[rgb(var(--copy-muted))] mb-4 leading-relaxed">
            Everything in one file. Use this to keep a safe copy or move to another app.
          </p>
          <div className="mt-auto flex items-center justify-between">
            <span className="text-[11px] text-[rgb(var(--copy-muted))]">{jsonSize}</span>
            <button
              onClick={handleExportJson}
              disabled={exportingJson}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] hover:bg-[rgb(var(--cta-active))] transition-colors disabled:opacity-50"
            >
              {exportingJson ? <><SpinnerIcon /> Downloading...</> : <><DownloadIcon /> Download .json</>}
            </button>
          </div>
        </div>

        {/* Readable export */}
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-5 flex flex-col">
          <h3 className="text-sm font-semibold text-[rgb(var(--copy-primary))] mb-1">
            Readable Export
          </h3>
          <p className="text-xs text-[rgb(var(--copy-muted))] mb-4 leading-relaxed">
            All your notes as a single text file you can open and read anywhere.
          </p>
          <div className="mt-auto flex items-center justify-between">
            <span className="text-[11px] text-[rgb(var(--copy-muted))]">{mdSize}</span>
            <button
              onClick={handleExportMarkdown}
              disabled={exportingMd}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] hover:bg-[rgb(var(--cta-active))] transition-colors disabled:opacity-50"
            >
              {exportingMd ? <><SpinnerIcon /> Downloading...</> : <><DownloadIcon /> Download .md</>}
            </button>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-[rgb(var(--copy-muted))]">
        Everything stays on your device. Nothing is sent anywhere.
      </p>
    </div>
  );
}
