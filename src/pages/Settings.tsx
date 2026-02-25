import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "../hooks/useTheme";
import { useFont, fonts as fontOptions } from "../hooks/useFont";
import type { FontOption } from "../hooks/useFont";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import { updateProfile, logoutUser } from "../redux/authThunks";
import { GetAllNotes, GetAllChapter, GetAllTags, GetAllMood, DeleteAccount } from "../APIs";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";

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

// ─── Shared components ───────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-[rgb(var(--copy-muted))] uppercase tracking-widest mb-3">
      {children}
    </p>
  );
}

function Divider() {
  return <div className="h-px bg-[rgb(var(--border))] my-8" />;
}

function SettingRow({
  label,
  value,
  onClick,
}: {
  label: string;
  value?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between py-2.5 px-3 -mx-3 rounded-lg hover:bg-[rgb(var(--surface))] transition-colors text-left group"
    >
      <span className="text-sm text-[rgb(var(--copy-primary))]">{label}</span>
      <div className="flex items-center gap-2">
        {value && (
          <span className="text-sm text-[rgb(var(--copy-muted))]">{value}</span>
        )}
        <ChevronRight className="text-[rgb(var(--copy-muted))] group-hover:text-[rgb(var(--copy-secondary))] transition-colors" />
      </div>
    </button>
  );
}

function BackButton({ onClick, label = "Settings" }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-sm text-[rgb(var(--copy-secondary))] hover:text-[rgb(var(--copy-primary))] transition-colors mb-6"
    >
      <ChevronLeft />
      <span>{label}</span>
    </button>
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
        className={`relative w-full aspect-[3/2] rounded-md overflow-hidden border-2 transition-all duration-200 ${
          isSelected
            ? "border-[rgb(var(--cta))] ring-1 ring-[rgb(var(--cta))]/20"
            : "border-[rgb(var(--border))] group-hover:border-[rgb(var(--copy-muted))]/40"
        }`}
      >
        <div className="absolute inset-0 flex bg-[rgb(var(--background))]">
          <div className="w-[26%] h-full bg-[rgb(var(--card))] border-r border-[rgb(var(--border))] p-1.5 flex flex-col gap-1">
            <div className="w-2 h-2 rounded-sm bg-[rgb(var(--cta))] opacity-80" />
            <div className="mt-0.5 space-y-0.5">
              <div className="h-[2px] rounded-full bg-[rgb(var(--copy-primary))] opacity-20 w-4/5" />
              <div className="h-[2px] rounded-full bg-[rgb(var(--copy-muted))] opacity-25 w-3/5" />
              <div className="h-[2px] rounded-full bg-[rgb(var(--copy-muted))] opacity-25 w-full" />
            </div>
          </div>
          <div className="flex-1 p-1.5 flex flex-col gap-1">
            <div className="h-[3px] rounded-full bg-[rgb(var(--copy-primary))] opacity-35 w-2/3" />
            <div className="h-[2px] rounded-full bg-[rgb(var(--copy-muted))] opacity-20 w-full" />
            <div className="h-[2px] rounded-full bg-[rgb(var(--copy-muted))] opacity-20 w-5/6" />
          </div>
        </div>
        {isSelected && (
          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] flex items-center justify-center">
            <CheckIcon />
          </div>
        )}
      </div>
      <p className={`mt-1 text-[11px] truncate ${isSelected ? "font-medium text-[rgb(var(--copy-primary))]" : "text-[rgb(var(--copy-muted))]"}`}>
        {name}
      </p>
    </button>
  );
}

// ─── Theme picker sub-page ───────────────────────────────

function ThemePicker({ onBack }: { onBack: () => void }) {
  const { setTheme, currentTheme } = useTheme();
  const [filter, setFilter] = useState<"all" | "light" | "dark">("all");

  const filtered = filter === "all" ? themes : themes.filter((t) => t.category === filter);

  return (
    <div>
      <BackButton onClick={onBack} />

      <h1 className="text-xl font-semibold text-[rgb(var(--copy-primary))] mb-1">Theme</h1>
      <p className="text-sm text-[rgb(var(--copy-muted))] mb-6">
        Currently using <span className="text-[rgb(var(--copy-secondary))]">{getThemeName(currentTheme)}</span>
      </p>

      <div className="flex items-center gap-1 mb-5">
        {(["all", "light", "dark"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              filter === f
                ? "bg-[rgb(var(--surface))] text-[rgb(var(--copy-primary))]"
                : "text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-secondary))]"
            }`}
          >
            {f === "all" ? "All" : f === "light" ? "Light" : "Dark"}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-[rgb(var(--copy-muted))]">
          {filtered.length} themes
        </span>
      </div>

      <div className="grid grid-cols-5 gap-3 items-start">
        {filtered.map((t) => (
          <ThemeCard key={t.id} id={t.id} name={t.name} isSelected={currentTheme === t.id} onSelect={() => setTheme(t.id)} />
        ))}
      </div>

      <p className="text-xs text-[rgb(var(--copy-muted))] mt-6">
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
      className={`group relative text-left w-full rounded-lg border-2 transition-all duration-200 overflow-hidden ${
        isSelected
          ? "border-[rgb(var(--cta))] ring-2 ring-[rgb(var(--cta))]/20"
          : "border-[rgb(var(--border))] hover:border-[rgb(var(--copy-muted))]/50"
      }`}
    >
      <div className="px-4 py-3">
        <p
          className="text-xl font-semibold text-[rgb(var(--copy-primary))] leading-tight mb-0.5 truncate"
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
          <span className={`text-xs ${isSelected ? "font-medium text-[rgb(var(--copy-primary))]" : "text-[rgb(var(--copy-muted))]"}`}>
            {font.name}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[rgb(var(--surface))] text-[rgb(var(--copy-muted))]">
            {font.category === "sans" ? "Sans" : font.category === "serif" ? "Serif" : font.category === "rounded" ? "Round" : "Fun"}
          </span>
        </div>
      </div>
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] flex items-center justify-center">
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
      <BackButton onClick={onBack} />

      <h1 className="text-xl font-semibold text-[rgb(var(--copy-primary))] mb-1">Font</h1>
      <p className="text-sm text-[rgb(var(--copy-muted))] mb-6">
        Currently using <span className="text-[rgb(var(--copy-secondary))]">{currentFontOption.name}</span>
      </p>

      <div className="flex items-center gap-1 mb-5">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              filter === c.key
                ? "bg-[rgb(var(--surface))] text-[rgb(var(--copy-primary))]"
                : "text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-secondary))]"
            }`}
          >
            {c.label}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-[rgb(var(--copy-muted))]">
          {filtered.length} fonts
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 items-start">
        {filtered.map((font) => (
          <FontCard
            key={font.id}
            font={font}
            isSelected={currentFont === font.id}
            onSelect={() => setFont(font.id)}
          />
        ))}
      </div>

      <p className="text-xs text-[rgb(var(--copy-muted))] mt-6">
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

// ─── Export sub-page ─────────────────────────────────────

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
      <BackButton onClick={onBack} />

      <h1 className="text-xl font-semibold text-[rgb(var(--copy-primary))] mb-1">Export your data</h1>
      <p className="text-sm text-[rgb(var(--copy-muted))] mb-6">
        Download a copy of everything you've written.
      </p>

      <div className="space-y-1 mb-6">
        {formats.map(f => (
          <button
            key={f.id}
            onClick={() => setFormat(f.id)}
            className={`w-full flex items-center gap-3 py-2.5 px-3 -mx-3 rounded-lg text-left transition-colors ${
              format === f.id ? "bg-[rgb(var(--surface))]" : "hover:bg-[rgb(var(--surface))]"
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              format === f.id ? "border-[rgb(var(--cta))]" : "border-[rgb(var(--border))]"
            }`}>
              {format === f.id && <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--cta))]" />}
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
        className="px-4 py-2 rounded-lg text-sm font-medium bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] hover:bg-[rgb(var(--cta-active))] transition-colors disabled:opacity-50"
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
      <div className="flex items-center justify-between py-2.5 px-3 -mx-3">
        <span className="text-sm text-[rgb(var(--copy-primary))] flex-shrink-0">Display name</span>
        <div className="flex items-center gap-2">
          <input
            autoFocus
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={200}
            disabled={saving}
            className="w-40 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg px-2.5 py-1 text-sm text-[rgb(var(--copy-primary))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--cta))]/30 disabled:opacity-50 text-right"
          />
          <button onClick={() => { setEditing(false); setDraft(name || ""); }} disabled={saving} className="text-xs text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-primary))]">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || !draft.trim() || draft.trim() === name} className="text-xs font-medium text-[rgb(var(--cta))] disabled:opacity-40">
            {saving ? "..." : "Save"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => { setDraft(name || ""); setEditing(true); }}
      className="w-full flex items-center justify-between py-2.5 px-3 -mx-3 rounded-lg hover:bg-[rgb(var(--surface))] transition-colors text-left group"
    >
      <span className="text-sm text-[rgb(var(--copy-primary))]">Display name</span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-[rgb(var(--copy-muted))]">{name || "---"}</span>
        <span className="text-xs text-[rgb(var(--cta))] opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>
      </div>
    </button>
  );
}

// ─── Profile avatar with upload ──────────────────────────

function ProfileAvatar({
  profilePicture,
  initial,
  name,
  email,
  onUpload,
}: {
  profilePicture: string | null;
  initial: string;
  name: string | null;
  email: string | null;
  onUpload: (base64: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 500 * 1024) {
      toast.error("Image must be under 500KB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onUpload(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="flex items-center gap-3.5 mb-8">
      <button
        onClick={() => fileRef.current?.click()}
        className="relative group flex-shrink-0"
        title="Change profile picture"
      >
        {profilePicture ? (
          <img
            src={profilePicture}
            alt=""
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[rgb(var(--surface))] flex items-center justify-center text-lg font-semibold text-[rgb(var(--copy-secondary))]">
            {initial}
          </div>
        )}
        <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </button>
      <div className="min-w-0">
        <p className="text-sm font-medium text-[rgb(var(--copy-primary))] truncate">{name || "---"}</p>
        <p className="text-xs text-[rgb(var(--copy-muted))] truncate">{email || "---"}</p>
      </div>
    </div>
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
  const { name, email, profilePicture } = useSelector((state: RootState) => state.auth);

  const handleSaveName = async (newName: string) => {
    try {
      const result = await dispatch(updateProfile({ name: newName })).unwrap();
      toast.success(`Name updated to "${result.name}"`);
    } catch (err: any) {
      toast.error(err?.detail || "Failed to update name");
    }
  };

  const handleUploadPicture = async (base64: string) => {
    const toastId = toast.loading("Uploading picture...");
    try {
      await dispatch(updateProfile({ name: name || "", profile_picture: base64 })).unwrap();
      toast.success("Profile picture updated", { id: toastId });
    } catch (err: any) {
      toast.error(err?.detail || "Failed to upload picture", { id: toastId });
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

  // Sub-pages
  if (view === "theme") {
    return (
      <div className="min-h-screen bg-[rgb(var(--background))]">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <ThemePicker onBack={() => setView("main")} />
        </div>
      </div>
    );
  }

  if (view === "font") {
    return (
      <div className="min-h-screen bg-[rgb(var(--background))]">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <FontPicker onBack={() => setView("main")} />
        </div>
      </div>
    );
  }

  if (view === "export") {
    return (
      <div className="min-h-screen bg-[rgb(var(--background))]">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <ExportPicker onBack={() => setView("main")} />
        </div>
      </div>
    );
  }

  // Main settings
  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-xl font-semibold text-[rgb(var(--copy-primary))] mb-8">Settings</h1>

        {/* ── Profile ── */}
        <ProfileAvatar
          profilePicture={profilePicture}
          initial={initial}
          name={name}
          email={email}
          onUpload={handleUploadPicture}
        />

        {/* ── Account ── */}
        <SectionLabel>Account</SectionLabel>
        <EditableNameRow name={name} onSave={handleSaveName} />
        <div className="flex items-center justify-between py-2.5 px-3 -mx-3">
          <span className="text-sm text-[rgb(var(--copy-primary))]">Email</span>
          <span className="text-sm text-[rgb(var(--copy-muted))]">{email || "---"}</span>
        </div>

        <Divider />

        {/* ── Appearance ── */}
        <SectionLabel>Appearance</SectionLabel>
        <SettingRow label="Theme" value={getThemeName(currentTheme)} onClick={() => setView("theme")} />
        <SettingRow label="Font" value={currentFontOption.name} onClick={() => setView("font")} />

        <Divider />

        {/* ── Data ── */}
        <SectionLabel>Data</SectionLabel>
        <SettingRow label="Export your data" onClick={() => setView("export")} />

        <Divider />

        {/* ── Sign out ── */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center py-2.5 px-3 -mx-3 rounded-lg hover:bg-[rgb(var(--surface))] transition-colors text-left"
        >
          <span className="text-sm text-[rgb(var(--error))]">Sign out</span>
        </button>

        <Divider />

        {/* ── Danger ── */}
        <button
          onClick={() => setDeleteOpen(true)}
          className="w-full flex items-center justify-between py-2.5 px-3 -mx-3 rounded-lg hover:bg-[rgb(var(--surface))] transition-colors text-left group"
        >
          <div>
            <p className="text-sm text-[rgb(var(--error))]">Delete account</p>
            <p className="text-[11px] text-[rgb(var(--copy-muted))]">Permanently remove your account and all data</p>
          </div>
          <ChevronRight className="text-[rgb(var(--error))] opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* ── Footer ── */}
        <p className="text-center text-[11px] text-[rgb(var(--copy-muted))] mt-10">Pine v2.0</p>
      </div>

      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete account"
        message="This will permanently delete all your notes, notebooks, tags, moods, and account data. This action cannot be undone."
        isProcessing={deleting}
        confirmText="Delete forever"
        variant="danger"
      />
    </div>
  );
}
