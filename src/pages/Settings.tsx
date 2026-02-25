import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "../hooks/useTheme";
import { useFont, fonts as fontOptions, getFontName } from "../hooks/useFont";
import type { FontOption } from "../hooks/useFont";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import { updateProfile, logoutUser } from "../redux/authThunks";
import { GetAllNotes, GetAllChapter, GetAllTags, GetAllMood, DeleteAccount } from "../APIs";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

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

// ─── Data export helpers ─────────────────────────────────

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

// ─── Setting row component ───────────────────────────────

function SettingRow({
  label,
  value,
  onClick,
  hasChevron = true,
}: {
  label: string;
  value?: string;
  onClick?: () => void;
  hasChevron?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between py-3 group text-left"
    >
      <span className="text-sm text-[rgb(var(--copy-primary))]">{label}</span>
      <div className="flex items-center gap-2">
        {value && (
          <span className="text-sm text-[rgb(var(--copy-muted))]">{value}</span>
        )}
        {hasChevron && (
          <ChevronRight className="text-[rgb(var(--copy-muted))] opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    </button>
  );
}

function Divider() {
  return <div className="h-px bg-[rgb(var(--border))]" />;
}

// ─── Delete account modal ────────────────────────────────

function DeleteAccountModal({
  open,
  onClose,
  onConfirm,
  deleting,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  deleting: boolean;
}) {
  const [typed, setTyped] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <h2 className="text-lg font-serif font-bold text-[rgb(var(--copy-primary))] mb-2">
          Delete your account?
        </h2>
        <p className="text-sm text-[rgb(var(--copy-secondary))] mb-4 leading-relaxed">
          This will permanently delete all your notes, notebooks, tags, moods, and account data. This action cannot be undone.
        </p>
        <label className="block text-xs text-[rgb(var(--copy-muted))] mb-1.5">
          Type <span className="font-medium text-[rgb(var(--error))]">delete my account</span> to confirm
        </label>
        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder="delete my account"
          disabled={deleting}
          className="w-full px-3 py-2 rounded-lg text-sm bg-[rgb(var(--background))] border border-[rgb(var(--border))] text-[rgb(var(--copy-primary))] placeholder:text-[rgb(var(--copy-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--error))]/30 disabled:opacity-50 mb-4"
        />
        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 py-2 rounded-lg text-sm font-medium text-[rgb(var(--copy-secondary))] hover:bg-[rgb(var(--surface))] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={typed !== "delete my account" || deleting}
            className="flex-1 py-2 rounded-lg text-sm font-medium bg-[rgb(var(--error))] text-white hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {deleting ? "Deleting..." : "Delete forever"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Request Data section ────────────────────────────────

type ExportFormat = "json" | "markdown" | "csv";

function ExportPicker({ onBack }: { onBack: () => void }) {
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
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-[rgb(var(--copy-secondary))] hover:text-[rgb(var(--copy-primary))] transition-colors mb-6"
      >
        <ChevronLeft />
        <span>Settings</span>
      </button>

      <h1 className="text-2xl font-serif font-bold text-[rgb(var(--copy-primary))] tracking-tight mb-1">
        Export your data
      </h1>
      <p className="text-sm text-[rgb(var(--copy-muted))] mb-8">
        Download a copy of everything you've written. Pick a format below.
      </p>

      <div className="space-y-2 mb-6">
        {formats.map(f => (
          <button
            key={f.id}
            onClick={() => setFormat(f.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
              format === f.id
                ? "bg-[rgb(var(--surface))] ring-1 ring-[rgb(var(--cta))]"
                : "bg-[rgb(var(--surface))]/50 hover:bg-[rgb(var(--surface))]"
            }`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              format === f.id ? "border-[rgb(var(--cta))]" : "border-[rgb(var(--border))]"
            }`}>
              {format === f.id && <div className="w-2 h-2 rounded-full bg-[rgb(var(--cta))]" />}
            </div>
            <div>
              <p className={`text-sm ${format === f.id ? "font-medium text-[rgb(var(--copy-primary))]" : "text-[rgb(var(--copy-secondary))]"}`}>{f.label}</p>
              <p className="text-[11px] text-[rgb(var(--copy-muted))]">{f.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={handleExport}
        disabled={exporting}
        className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] hover:bg-[rgb(var(--cta-active))] transition-colors disabled:opacity-50"
      >
        {exporting ? "Preparing..." : `Download .${format === "markdown" ? "md" : format}`}
      </button>
    </div>
  );
}

// ─── Inline edit for name ────────────────────────────────

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
    if (e.key === "Escape") { setEditing(false); setDraft(name || ""); }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2 py-3">
        <span className="text-sm text-[rgb(var(--copy-primary))] flex-shrink-0">Name</span>
        <div className="flex-1 flex items-center gap-2 justify-end">
          <input
            autoFocus
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={200}
            disabled={saving}
            className="w-48 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg px-3 py-1.5 text-sm text-[rgb(var(--copy-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--cta))]/30 disabled:opacity-50 text-right"
          />
          <button
            onClick={() => { setEditing(false); setDraft(name || ""); }}
            disabled={saving}
            className="text-xs text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-primary))]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !draft.trim() || draft.trim() === name}
            className="text-xs font-medium text-[rgb(var(--cta))] hover:text-[rgb(var(--cta-active))] disabled:opacity-40"
          >
            {saving ? "..." : "Save"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => { setDraft(name || ""); setEditing(true); }}
      className="w-full flex items-center justify-between py-3 group text-left"
    >
      <span className="text-sm text-[rgb(var(--copy-primary))]">Name</span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-[rgb(var(--copy-muted))]">{name || "---"}</span>
        <span className="text-xs text-[rgb(var(--cta))] opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>
      </div>
    </button>
  );
}

// ─── Main Settings page ──────────────────────────────────

type SettingsView = "main" | "theme" | "font" | "export";

export default function Settings() {
  const [view, setView] = useState<SettingsView>("main");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { currentTheme } = useTheme();
  const { currentFontOption } = useFont();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { name, email } = useSelector((state: RootState) => state.auth);

  const handleSaveName = async (newName: string) => {
    try {
      const result = await dispatch(updateProfile({ name: newName })).unwrap();
      toast.success(`Name updated to "${result.name}"`);
    } catch (err: any) {
      toast.error(err?.detail || "Failed to update name");
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    const res = await DeleteAccount();
    if (res.deleted) {
      toast.success("Account deleted");
      localStorage.removeItem("auth_token");
      dispatch(logoutUser());
      navigate("/");
    } else {
      toast.error(res.detail || "Failed to delete account");
    }
    setDeleting(false);
    setDeleteOpen(false);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/");
  };

  const initial = (name || email || "?").charAt(0).toUpperCase();

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

  if (view === "export") {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <ExportPicker onBack={() => setView("main")} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <div className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-2xl font-serif font-bold text-[rgb(var(--copy-primary))] tracking-tight mb-8">
          Settings
        </h1>

        {/* ── Profile ── */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-full bg-[rgb(var(--cta))]/10 flex items-center justify-center text-base font-semibold text-[rgb(var(--cta))] flex-shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[rgb(var(--copy-primary))] truncate">{name || "---"}</p>
            <p className="text-xs text-[rgb(var(--copy-muted))] truncate">{email || "---"}</p>
          </div>
        </div>

        {/* ── Account ── */}
        <p className="text-[11px] font-semibold text-[rgb(var(--copy-muted))] uppercase tracking-wider mb-1">
          Account
        </p>
        <div className="rounded-xl bg-[rgb(var(--card))] border border-[rgb(var(--border))] px-4 mb-5">
          <EditableNameRow name={name} onSave={handleSaveName} />
          <Divider />
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-[rgb(var(--copy-primary))]">Email</span>
            <span className="text-sm text-[rgb(var(--copy-muted))]">{email || "---"}</span>
          </div>
        </div>

        {/* ── Appearance ── */}
        <p className="text-[11px] font-semibold text-[rgb(var(--copy-muted))] uppercase tracking-wider mb-1">
          Appearance
        </p>
        <div className="rounded-xl bg-[rgb(var(--card))] border border-[rgb(var(--border))] px-4 mb-5">
          <SettingRow label="Theme" value={getThemeName(currentTheme)} onClick={() => setView("theme")} />
          <Divider />
          <SettingRow label="Font" value={currentFontOption.name} onClick={() => setView("font")} />
        </div>

        {/* ── Data ── */}
        <p className="text-[11px] font-semibold text-[rgb(var(--copy-muted))] uppercase tracking-wider mb-1">
          Data
        </p>
        <div className="rounded-xl bg-[rgb(var(--card))] border border-[rgb(var(--border))] px-4 mb-5">
          <SettingRow label="Export your data" onClick={() => setView("export")} />
        </div>

        {/* ── Session ── */}
        <div className="rounded-xl bg-[rgb(var(--card))] border border-[rgb(var(--border))] px-4 mb-5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center py-3 text-left"
          >
            <span className="text-sm font-medium text-[rgb(var(--error))]">Sign out</span>
          </button>
        </div>

        {/* ── Danger zone ── */}
        <p className="text-[11px] font-semibold text-[rgb(var(--copy-muted))] uppercase tracking-wider mb-1">
          Danger zone
        </p>
        <div className="rounded-xl bg-[rgb(var(--card))] border border-[rgb(var(--error))]/20 px-4">
          <button
            onClick={() => setDeleteOpen(true)}
            className="w-full flex items-center justify-between py-3 text-left group"
          >
            <div>
              <p className="text-sm font-medium text-[rgb(var(--error))]">Delete account</p>
              <p className="text-[11px] text-[rgb(var(--copy-muted))]">Permanently remove your account and all data</p>
            </div>
            <ChevronRight className="text-[rgb(var(--error))] opacity-50 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        {/* ── Footer ── */}
        <p className="text-center text-[11px] text-[rgb(var(--copy-muted))] mt-8">Pine v2.0</p>
      </div>

      <DeleteAccountModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
        deleting={deleting}
      />
    </div>
  );
}
