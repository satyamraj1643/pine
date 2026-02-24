import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "../hooks/useTheme";
import { useFont, fonts as fontOptions, getFontName } from "../hooks/useFont";
import type { FontOption } from "../hooks/useFont";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import { updateProfile } from "../redux/authThunks";
import { GetAllNotes, GetAllChapter, GetAllTags, GetAllMood } from "../APIs";
import toast from "react-hot-toast";

// ─── Theme data ──────────────────────────────────────────

const themes = [
  { id: "theme-light", name: "Clean Girl", category: "light", featured: true },
  { id: "theme-notion-light", name: "Notion Light", category: "light", featured: true },
  { id: "theme-notion-dark", name: "Notion Dark", category: "dark", featured: true },
  { id: "theme-github-dark", name: "GitHub Dark", category: "dark", featured: true },
  { id: "theme-light-warm", name: "Cottagecore", category: "light" },
  { id: "theme-dark", name: "Y2K Dark", category: "dark" },
  { id: "theme-dark-purple", name: "Dark Academia", category: "dark" },
  { id: "theme-github-light", name: "GitHub Light", category: "light" },
  { id: "theme-github-dimmed", name: "GitHub Dimmed", category: "dark" },
  { id: "theme-paper", name: "Paper", category: "light" },
  { id: "theme-snow", name: "Snow", category: "light" },
  { id: "theme-true-black", name: "True Black", category: "dark" },
  { id: "theme-ivory", name: "Vanilla Latte", category: "light" },
  { id: "theme-sage", name: "Soft Sage", category: "light" },
  { id: "theme-twilight", name: "After Hours", category: "dark" },
  { id: "theme-lavender", name: "Soft Lilac", category: "light" },
  { id: "theme-honey", name: "Golden Hour", category: "light" },
  { id: "theme-midnight", name: "Midnight Blue", category: "dark" },
  { id: "theme-blush", name: "Y2K Pink", category: "light" },
  { id: "theme-ocean", name: "Y2K Blue", category: "light" },
  { id: "theme-autumn", name: "Pumpkin Spice", category: "light" },
  { id: "theme-forest", name: "Moss & Stone", category: "dark" },
  { id: "theme-sunset", name: "Peach Fuzz", category: "light" },
  { id: "theme-plum", name: "Grape Soda", category: "dark" },
  { id: "theme-mint", name: "Matcha", category: "light" },
  { id: "theme-coral", name: "Strawberry Glaze", category: "light" },
  { id: "theme-slate", name: "Carbon", category: "dark" },
];

function getThemeName(id: string): string {
  return themes.find((t) => t.id === id)?.name ?? "Clean Girl";
}

// ─── Inline SVG icons ────────────────────────────────────

function ChevronRight({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronLeft({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Theme preview card ──────────────────────────────────

function ThemeCard({
  id,
  name,
  isSelected,
  onSelect,
}: {
  id: string;
  name: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`group text-left w-full ${id}`}
      title={name}
    >
      <div
        className={`relative w-full aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all duration-200 ${
          isSelected
            ? "border-[rgb(var(--cta))] shadow-md ring-2 ring-[rgb(var(--cta))]/20"
            : "border-[rgb(var(--border))] group-hover:border-[rgb(var(--copy-muted))]/50 group-hover:shadow-sm"
        }`}
      >
        <div className="absolute inset-0 flex bg-[rgb(var(--background))]">
          <div className="w-[28%] h-full bg-[rgb(var(--card))] border-r border-[rgb(var(--border))] p-2 flex flex-col gap-1.5">
            <div className="w-3 h-3 rounded bg-[rgb(var(--cta))] opacity-80" />
            <div className="mt-1 space-y-1">
              <div className="h-1 rounded-full bg-[rgb(var(--copy-primary))] opacity-20 w-4/5" />
              <div className="h-1 rounded-full bg-[rgb(var(--copy-muted))] opacity-30 w-3/5" />
              <div className="h-1 rounded-full bg-[rgb(var(--copy-muted))] opacity-30 w-full" />
              <div className="h-1 rounded-full bg-[rgb(var(--copy-muted))] opacity-20 w-2/3" />
            </div>
          </div>
          <div className="flex-1 p-2.5 flex flex-col gap-1.5">
            <div className="h-1.5 rounded-full bg-[rgb(var(--copy-primary))] opacity-40 w-2/3" />
            <div className="h-1 rounded-full bg-[rgb(var(--copy-muted))] opacity-25 w-full" />
            <div className="h-1 rounded-full bg-[rgb(var(--copy-muted))] opacity-25 w-5/6" />
            <div className="mt-auto flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--cta))]" />
              <div className="h-1 rounded-full bg-[rgb(var(--copy-muted))] opacity-20 w-1/4" />
            </div>
          </div>
        </div>
        {isSelected && (
          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] flex items-center justify-center shadow-sm">
            <CheckIcon />
          </div>
        )}
      </div>
      <div className="mt-2 px-0.5">
        <span className={`text-[13px] leading-tight ${isSelected ? "font-medium text-[rgb(var(--copy-primary))]" : "text-[rgb(var(--copy-secondary))]"}`}>
          {name}
        </span>
      </div>
    </button>
  );
}

// ─── Theme picker sub-page ───────────────────────────────

function ThemePicker({ onBack }: { onBack: () => void }) {
  const { setTheme, currentTheme } = useTheme();
  const [filter, setFilter] = useState<"all" | "light" | "dark">("all");

  const featuredThemes = themes.filter((t) => t.featured);
  const rest =
    filter === "all"
      ? themes.filter((t) => !t.featured)
      : themes.filter((t) => t.category === filter && !t.featured);

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-[rgb(var(--copy-secondary))] hover:text-[rgb(var(--copy-primary))] transition-colors mb-6"
      >
        <ChevronLeft />
        <span>Settings</span>
      </button>

      <h1 className="text-2xl font-serif font-bold text-[rgb(var(--copy-primary))] tracking-tight mb-1">
        Theme
      </h1>
      <p className="text-sm text-[rgb(var(--copy-muted))] mb-8">
        Choose how Pine looks. Currently using{" "}
        <span className="font-medium text-[rgb(var(--copy-secondary))]">
          {getThemeName(currentTheme)}
        </span>
        .
      </p>

      <div className="mb-8">
        <p className="text-xs font-medium text-[rgb(var(--copy-muted))] mb-3">Recommended</p>
        <div className="grid grid-cols-4 gap-3">
          {featuredThemes.map((t) => (
            <ThemeCard key={t.id} id={t.id} name={t.name} isSelected={currentTheme === t.id} onSelect={() => setTheme(t.id)} />
          ))}
        </div>
      </div>

      <div className="h-px bg-[rgb(var(--border))] mb-6" />

      <div className="flex items-center gap-1 mb-5">
        {(["all", "light", "dark"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              filter === f
                ? "bg-[rgb(var(--card))] text-[rgb(var(--copy-primary))] shadow-sm"
                : "text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-secondary))]"
            }`}
          >
            {f === "all" ? "All themes" : f === "light" ? "Light" : "Dark"}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-[rgb(var(--copy-muted))]">
          {rest.length} {rest.length === 1 ? "theme" : "themes"}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-8">
        {rest.map((t) => (
          <ThemeCard key={t.id} id={t.id} name={t.name} isSelected={currentTheme === t.id} onSelect={() => setTheme(t.id)} />
        ))}
      </div>

      <p className="text-xs text-[rgb(var(--copy-muted))]">
        Changes apply immediately and persist across sessions.
      </p>
    </div>
  );
}

// ─── Font card ───────────────────────────────────────────

function FontCard({
  font,
  isSelected,
  onSelect,
}: {
  font: FontOption;
  isSelected: boolean;
  onSelect: () => void;
}) {
  // Load the Google Font for preview
  useEffect(() => {
    if (font.id === "plus-jakarta-sans") return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${font.googleFamily}:wght@400;600&display=swap`;
    document.head.appendChild(link);
  }, [font]);

  return (
    <button
      onClick={onSelect}
      className={`group relative text-left w-full rounded-xl border-2 transition-all duration-200 overflow-hidden ${
        isSelected
          ? "border-[rgb(var(--cta))] shadow-md ring-2 ring-[rgb(var(--cta))]/20"
          : "border-[rgb(var(--border))] hover:border-[rgb(var(--copy-muted))]/50 hover:shadow-sm"
      }`}
    >
      <div className="px-4 py-4">
        {/* Font preview text */}
        <p
          className="text-[22px] font-semibold text-[rgb(var(--copy-primary))] leading-tight mb-1 truncate"
          style={{ fontFamily: font.family }}
        >
          Aa
        </p>
        <p
          className="text-sm text-[rgb(var(--copy-secondary))] mb-2 truncate"
          style={{ fontFamily: font.family }}
        >
          The quick brown fox
        </p>
        {/* Font name & tag */}
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[13px] leading-tight ${isSelected ? "font-medium text-[rgb(var(--copy-primary))]" : "text-[rgb(var(--copy-secondary))]"}`}>
            {font.name}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[rgb(var(--surface))] text-[rgb(var(--copy-muted))]">
            {font.category === "sans" ? "Sans" : font.category === "serif" ? "Serif" : font.category === "rounded" ? "Round" : "Fun"}
          </span>
        </div>
        <p className="text-[11px] text-[rgb(var(--copy-muted))] mt-0.5">{font.preview}</p>
      </div>
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] flex items-center justify-center shadow-sm">
          <CheckIcon />
        </div>
      )}
    </button>
  );
}

// ─── Font picker sub-page ────────────────────────────────

function FontPicker({ onBack }: { onBack: () => void }) {
  const { setFont, currentFont, currentFontOption } = useFont();
  const [filter, setFilter] = useState<"all" | "sans" | "serif" | "rounded" | "display">("all");

  const filtered =
    filter === "all"
      ? fontOptions
      : fontOptions.filter((f) => f.category === filter);

  const categories = [
    { key: "all" as const, label: "All" },
    { key: "sans" as const, label: "Sans" },
    { key: "rounded" as const, label: "Rounded" },
    { key: "serif" as const, label: "Serif" },
    { key: "display" as const, label: "Fun" },
  ];

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-[rgb(var(--copy-secondary))] hover:text-[rgb(var(--copy-primary))] transition-colors mb-6"
      >
        <ChevronLeft />
        <span>Settings</span>
      </button>

      <h1 className="text-2xl font-serif font-bold text-[rgb(var(--copy-primary))] tracking-tight mb-1">
        Font
      </h1>
      <p className="text-sm text-[rgb(var(--copy-muted))] mb-8">
        Choose your writing font. Currently using{" "}
        <span className="font-medium text-[rgb(var(--copy-secondary))]">
          {currentFontOption.name}
        </span>
        .
      </p>

      {/* Category filter */}
      <div className="flex items-center gap-1 mb-5">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              filter === c.key
                ? "bg-[rgb(var(--card))] text-[rgb(var(--copy-primary))] shadow-sm"
                : "text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-secondary))]"
            }`}
          >
            {c.label}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-[rgb(var(--copy-muted))]">
          {filtered.length} {filtered.length === 1 ? "font" : "fonts"}
        </span>
      </div>

      {/* Font grid */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {filtered.map((font) => (
          <FontCard
            key={font.id}
            font={font}
            isSelected={currentFont === font.id}
            onSelect={() => setFont(font.id)}
          />
        ))}
      </div>

      <p className="text-xs text-[rgb(var(--copy-muted))]">
        Changes apply immediately and persist across sessions.
      </p>
    </div>
  );
}

// ─── Inline edit row for name ────────────────────────────

function EditableNameRow({
  name,
  onSave,
}: {
  name: string | null;
  onSave: (newName: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name || "");
  const [saving, setSaving] = useState(false);

  const handleStartEdit = () => {
    setDraft(name || "");
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setDraft(name || "");
  };

  const handleSave = async () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === name) {
      setEditing(false);
      return;
    }
    setSaving(true);
    await onSave(trimmed);
    setSaving(false);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  if (editing) {
    return (
      <div className="py-2.5">
        <div className="flex items-center gap-3">
          <input
            autoFocus
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={200}
            disabled={saving}
            className="flex-1 min-w-0 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg px-3 py-1.5 text-sm text-[rgb(var(--copy-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--cta))]/30 focus:border-[rgb(var(--cta))]/50 placeholder:text-[rgb(var(--copy-muted))] disabled:opacity-50"
            placeholder="Your name"
          />
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-3 py-1.5 text-xs text-[rgb(var(--copy-secondary))] hover:text-[rgb(var(--copy-primary))] transition-colors rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !draft.trim() || draft.trim() === name}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] hover:bg-[rgb(var(--cta-active))] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-[rgb(var(--copy-primary))]">Display name</span>
      <div className="flex items-center gap-3">
        <span className="text-sm text-[rgb(var(--copy-muted))]">{name || "---"}</span>
        <button
          onClick={handleStartEdit}
          className="text-xs text-[rgb(var(--cta))] hover:text-[rgb(var(--cta-active))] transition-colors flex-shrink-0"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

// ─── Data export helpers (moved from Backup page) ────────

function getDateString(): string {
  return new Date().toISOString().split("T")[0];
}

function str(obj: any, ...keys: string[]): string {
  if (!obj) return "";
  for (const k of keys) { if (obj[k]) return String(obj[k]); }
  return "";
}

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function buildJsonExport(notes: any[], chapters: any[], tags: any[], moods: any[]): string {
  return JSON.stringify({ exported_at: new Date().toISOString(), notes, notebooks: chapters, tags, moods }, null, 2);
}

function buildMarkdownExport(notes: any[]): string {
  if (notes.length === 0) return "# Pine Journal\n\nNo notes yet.\n";
  return notes.map(note => {
    const title = str(note, "title", "Title") || "Untitled";
    const content = str(note, "content", "Content");
    const date = (str(note, "created_at", "CreatedAt") || "").split("T")[0];
    const chapter = note?.chapter ?? note?.Chapter;
    const notebook = str(chapter, "title", "Title", "name", "Name");
    const collection = note?.collection ?? note?.Collections ?? [];
    const tagNames: string[] = Array.isArray(collection) ? collection.map((t: any) => str(t, "name", "Name")).filter(Boolean) : [];
    const moods = note?.Moods ?? note?.moods ?? [];
    const moodStrs: string[] = (Array.isArray(moods) ? moods : []).map((m: any) => { const n = str(m, "name", "Name"); const e = str(m, "emoji", "Emoji"); return e && n ? `${e} ${n}` : n; }).filter(Boolean);
    const moodStr = moodStrs.join(", ");
    const lines = ["---", `title: "${title.replace(/"/g, '\\"')}"`];
    if (date) lines.push(`date: ${date}`);
    if (notebook) lines.push(`notebook: "${notebook.replace(/"/g, '\\"')}"`);
    if (tagNames.length) lines.push(`tags: [${tagNames.map(t => `"${t}"`).join(", ")}]`);
    if (moodStr) lines.push(`mood: "${moodStr}"`);
    lines.push("---");
    return lines.join("\n") + "\n\n" + content;
  }).join("\n\n---\n\n") + "\n";
}

function buildCsvExport(notes: any[]): string {
  const escape = (s: string) => `"${(s || "").replace(/"/g, '""').replace(/\n/g, " ")}"`;
  const header = "Title,Date,Notebook,Mood,Tags,Content";
  const rows = notes.map(note => {
    const title = str(note, "title", "Title") || "Untitled";
    const date = (str(note, "created_at", "CreatedAt") || "").split("T")[0];
    const chapter = note?.chapter ?? note?.Chapter;
    const notebook = str(chapter, "title", "Title", "name", "Name");
    const moods = note?.Moods ?? note?.moods ?? [];
    const moodName = (Array.isArray(moods) ? moods : []).map((m: any) => str(m, "name", "Name")).filter(Boolean).join(", ");
    const collection = note?.collection ?? note?.Collections ?? [];
    const tagNames = Array.isArray(collection) ? collection.map((t: any) => str(t, "name", "Name")).filter(Boolean).join("; ") : "";
    const content = str(note, "content", "Content").replace(/<[^>]*>/g, "");
    return [escape(title), date, escape(notebook), escape(moodName), escape(tagNames), escape(content)].join(",");
  });
  return [header, ...rows].join("\n");
}

// ─── Request Data section ────────────────────────────────

type ExportFormat = "json" | "markdown" | "csv";

function RequestDataSection() {
  const [format, setFormat] = useState<ExportFormat>("json");
  const [exporting, setExporting] = useState(false);

  const formats: { id: ExportFormat; label: string; desc: string }[] = [
    { id: "json", label: "JSON", desc: "Full backup, all data" },
    { id: "markdown", label: "Markdown", desc: "Notes as readable text" },
    { id: "csv", label: "CSV", desc: "Spreadsheet-friendly" },
  ];

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const [notesRes, chapRes, tagsRes, moodsRes] = await Promise.all([
        GetAllNotes(), GetAllChapter(), GetAllTags(), GetAllMood(),
      ]);
      const notes = notesRes?.fetched && Array.isArray(notesRes.data) ? notesRes.data : [];
      const chapters = chapRes?.fetched && Array.isArray(chapRes.data) ? chapRes.data : [];
      const tags = Array.isArray(tagsRes?.data) ? tagsRes.data : [];
      const moods = moodsRes?.fetched && Array.isArray(moodsRes.data) ? moodsRes.data : [];
      const dateStr = getDateString();

      if (format === "json") {
        triggerDownload(buildJsonExport(notes, chapters, tags, moods), `pine-backup-${dateStr}.json`, "application/json");
      } else if (format === "markdown") {
        triggerDownload(buildMarkdownExport(notes), `pine-export-${dateStr}.md`, "text/markdown");
      } else {
        triggerDownload(buildCsvExport(notes), `pine-export-${dateStr}.csv`, "text/csv");
      }
      toast.success("Download started");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setExporting(false);
    }
  }, [format]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {formats.map(f => (
          <button
            key={f.id}
            onClick={() => setFormat(f.id)}
            className={`px-3 py-2 rounded-lg text-left transition-all ${
              format === f.id
                ? "bg-[rgb(var(--surface))] ring-1 ring-[rgb(var(--cta))]"
                : "bg-[rgb(var(--surface))]/50 hover:bg-[rgb(var(--surface))]"
            }`}
          >
            <p className={`text-sm ${format === f.id ? "font-medium text-[rgb(var(--copy-primary))]" : "text-[rgb(var(--copy-secondary))]"}`}>{f.label}</p>
            <p className="text-[11px] text-[rgb(var(--copy-muted))]">{f.desc}</p>
          </button>
        ))}
      </div>
      <button
        onClick={handleExport}
        disabled={exporting}
        className="text-sm text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-primary))] transition-colors disabled:opacity-50"
      >
        {exporting ? "Preparing..." : `Download as .${format === "markdown" ? "md" : format}`}
      </button>
    </div>
  );
}

// ─── Main Settings page ──────────────────────────────────

type SettingsView = "main" | "theme" | "font";

export default function Settings() {
  const [view, setView] = useState<SettingsView>("main");
  const [dataOpen, setDataOpen] = useState(false);
  const { currentTheme } = useTheme();
  const { currentFontOption } = useFont();
  const dispatch = useDispatch<AppDispatch>();
  const { name, email } = useSelector((state: RootState) => state.auth);

  const handleSaveName = async (newName: string) => {
    try {
      const result = await dispatch(updateProfile({ name: newName })).unwrap();
      toast.success(`Name updated to "${result.name}"`);
    } catch (err: any) {
      toast.error(err?.detail || "Failed to update name");
    }
  };

  const firstName = name?.split(" ")[0] || "";
  const initial = (firstName || email || "?").charAt(0).toUpperCase();

  if (view === "theme") {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <ThemePicker onBack={() => setView("main")} />
      </div>
    );
  }

  if (view === "font") {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <FontPicker onBack={() => setView("main")} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-xl font-semibold text-[rgb(var(--copy-primary))] mb-10">Settings</h1>

      {/* ── Profile ── */}
      <section>
        <h2 className="text-xs font-semibold text-[rgb(var(--copy-muted))] uppercase tracking-widest mb-3">
          Profile
        </h2>

        {/* Avatar + identity */}
        <div className="flex items-center gap-3.5 py-2.5 px-3 -mx-3">
          <div className="w-10 h-10 rounded-full bg-[rgb(var(--surface))] flex items-center justify-center text-base font-semibold text-[rgb(var(--copy-secondary))] flex-shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[rgb(var(--copy-primary))] truncate">{name || "---"}</p>
            <p className="text-xs text-[rgb(var(--copy-muted))] truncate">{email || "---"}</p>
          </div>
        </div>

        <div className="h-px bg-[rgb(var(--border))]" />

        {/* Editable name */}
        <div className="px-3 -mx-3">
          <EditableNameRow name={name} onSave={handleSaveName} />
        </div>
      </section>

      <div className="h-px bg-[rgb(var(--border))] my-6" />

      {/* ── Appearance ── */}
      <section>
        <h2 className="text-xs font-semibold text-[rgb(var(--copy-muted))] uppercase tracking-widest mb-3">
          Appearance
        </h2>
        <button
          onClick={() => setView("theme")}
          className="w-full flex items-center justify-between gap-4 py-2.5 px-3 -mx-3 rounded-lg hover:bg-[rgb(var(--surface))] transition-colors text-left group"
        >
          <span className="text-sm text-[rgb(var(--copy-primary))]">Theme</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[rgb(var(--copy-muted))]">{getThemeName(currentTheme)}</span>
            <ChevronRight className="text-[rgb(var(--copy-muted))] group-hover:text-[rgb(var(--copy-secondary))] transition-colors" />
          </div>
        </button>
        <div className="h-px bg-[rgb(var(--border))]" />
        <button
          onClick={() => setView("font")}
          className="w-full flex items-center justify-between gap-4 py-2.5 px-3 -mx-3 rounded-lg hover:bg-[rgb(var(--surface))] transition-colors text-left group"
        >
          <span className="text-sm text-[rgb(var(--copy-primary))]">Font</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[rgb(var(--copy-muted))]">{currentFontOption.name}</span>
            <ChevronRight className="text-[rgb(var(--copy-muted))] group-hover:text-[rgb(var(--copy-secondary))] transition-colors" />
          </div>
        </button>
      </section>

      <div className="h-px bg-[rgb(var(--border))] my-6" />

      {/* ── Data & Export (collapsible toggle) ── */}
      <section>
        <button
          onClick={() => setDataOpen(!dataOpen)}
          className="w-full flex items-center justify-between gap-3 mb-1 text-left group"
        >
          <h2 className="text-xs font-semibold text-[rgb(var(--copy-muted))] uppercase tracking-widest">
            Data &amp; export
          </h2>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-[rgb(var(--copy-muted))] transition-transform duration-200 ${dataOpen ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {dataOpen && (
          <div className="pt-3 pb-1">
            <p className="text-xs text-[rgb(var(--copy-muted))] mb-4">
              Download a copy of everything you've written. Pick a format below.
            </p>
            <RequestDataSection />
          </div>
        )}
      </section>

      <div className="h-px bg-[rgb(var(--border))] my-6" />

      {/* ── About ── */}
      <section>
        <h2 className="text-xs font-semibold text-[rgb(var(--copy-muted))] uppercase tracking-widest mb-3">
          About
        </h2>
        <div className="flex items-center justify-between py-2.5 px-3 -mx-3">
          <span className="text-sm text-[rgb(var(--copy-primary))]">Version</span>
          <span className="text-sm text-[rgb(var(--copy-muted))]">2.0</span>
        </div>
      </section>
    </div>
    </div>
  );
}
