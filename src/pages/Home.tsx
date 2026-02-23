import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaPlus,
  FaArrowRight,
  FaStar,
  FaBookOpen,
  FaPen,
  FaBook,
  FaTag,
  FaFileAlt,
  FaTags,
} from "react-icons/fa";
import { GetAllNotes, GetAllTags, GetAllNotebooks } from "../APIs";
import { getEmojiFromShortcode } from "../utilities/emoji";
import { formatDate, formatFullDate } from "../utilities/formatDate";
import { countWords, estimateReadTime } from "../utilities/text";
import PageHeader from "../components/PageHeader";
import type { RootState } from "../redux/store";

// ─── Helpers ─────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Main Component ──────────────────────────────────────

const Home: React.FC = () => {
  const navigate = useNavigate();
  const userName = useSelector((state: RootState) => state.auth.name);

  const [tags, setTags] = useState<any[]>([]);
  const [notebooks, setNotebooks] = useState<any[]>([]);
  const [recentNotes, setRecentNotes] = useState<any[]>([]);

  const totalNotes = recentNotes.length;
  const totalNotebooks = notebooks.length;
  const totalTags = tags.length;

  useEffect(() => {
    const loadData = async () => {
      const [notesRes, tagsRes, notebooksRes] = await Promise.all([
        GetAllNotes(),
        GetAllTags(),
        GetAllNotebooks(),
      ]);
      if (notesRes?.fetched) setRecentNotes(notesRes.data?.slice(0, 5) || []);
      if (tagsRes?.data) setTags(tagsRes.data);
      if (notebooksRes?.fetched) setNotebooks(notebooksRes.data || []);
    };
    loadData();
  }, []);

  const greeting = userName
    ? `${getGreeting()}, ${userName}`
    : getGreeting();

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <PageHeader
        title={greeting}
        subtitle={formatFullDate(new Date().toISOString())}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        <button
          onClick={() => navigate("/notes")}
          className="group flex items-center gap-3 rounded-lg px-4 py-3 bg-[rgb(var(--surface))] hover:bg-[rgb(var(--card))] border border-[rgb(var(--border))] transition-colors text-left"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[rgb(var(--card))] text-[rgb(var(--copy-muted))] group-hover:text-[rgb(var(--cta))] transition-colors">
            <FaFileAlt className="text-sm" />
          </div>
          <div>
            <div className="text-lg font-bold text-[rgb(var(--copy-primary))] leading-tight">
              {totalNotes}
            </div>
            <div className="text-xs text-[rgb(var(--copy-muted))]">
              {totalNotes === 1 ? "Note" : "Notes"}
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate("/notebooks")}
          className="group flex items-center gap-3 rounded-lg px-4 py-3 bg-[rgb(var(--surface))] hover:bg-[rgb(var(--card))] border border-[rgb(var(--border))] transition-colors text-left"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[rgb(var(--card))] text-[rgb(var(--copy-muted))] group-hover:text-[rgb(var(--cta))] transition-colors">
            <FaBook className="text-sm" />
          </div>
          <div>
            <div className="text-lg font-bold text-[rgb(var(--copy-primary))] leading-tight">
              {totalNotebooks}
            </div>
            <div className="text-xs text-[rgb(var(--copy-muted))]">
              {totalNotebooks === 1 ? "Notebook" : "Notebooks"}
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate("/tags")}
          className="group flex items-center gap-3 rounded-lg px-4 py-3 bg-[rgb(var(--surface))] hover:bg-[rgb(var(--card))] border border-[rgb(var(--border))] transition-colors text-left"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[rgb(var(--card))] text-[rgb(var(--copy-muted))] group-hover:text-[rgb(var(--cta))] transition-colors">
            <FaTags className="text-sm" />
          </div>
          <div>
            <div className="text-lg font-bold text-[rgb(var(--copy-primary))] leading-tight">
              {totalTags}
            </div>
            <div className="text-xs text-[rgb(var(--copy-muted))]">
              {totalTags === 1 ? "Tag" : "Tags"}
            </div>
          </div>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-10">
        <button
          onClick={() => navigate("/new-note")}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] hover:bg-[rgb(var(--cta-active))] transition-colors"
        >
          <FaPen className="text-xs" />
          Write a Note
        </button>
        <button
          onClick={() => navigate("/new-notebook")}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border border-[rgb(var(--border))] bg-[rgb(var(--surface))] text-[rgb(var(--copy-secondary))] hover:bg-[rgb(var(--card))] transition-colors"
        >
          <FaBook className="text-xs" />
          Create Notebook
        </button>
        <button
          onClick={() => navigate("/new-tag")}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border border-[rgb(var(--border))] bg-[rgb(var(--surface))] text-[rgb(var(--copy-secondary))] hover:bg-[rgb(var(--card))] transition-colors"
        >
          <FaTag className="text-xs" />
          Add Tag
        </button>
      </div>

      {/* Recent Notes */}
      <section className="mb-10">
        <SectionTitle
          title="Recent Notes"
          actionLabel="New note"
          onAction={() => navigate("/new-note")}
          viewAllLabel="View all"
          onViewAll={() => navigate("/notes")}
        />
        {recentNotes.length > 0 ? (
          <div className="space-y-0.5">
            {recentNotes.map((note) => (
              <NoteRow key={note.id || note.ID} note={note} navigate={navigate} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[rgb(var(--border))] px-5 py-8 text-center">
            <FaPen className="mx-auto mb-2 text-lg text-[rgb(var(--copy-muted))]" />
            <p className="text-sm text-[rgb(var(--copy-muted))]">
              No notes yet. Start writing to capture your thoughts.
            </p>
            <button
              onClick={() => navigate("/new-note")}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[rgb(var(--cta))] hover:underline"
            >
              <FaPlus className="text-[10px]" />
              Write your first note
            </button>
          </div>
        )}
      </section>

      {/* Tags */}
      <section className="mb-10">
        <SectionTitle
          title="Tags"
          actionLabel="New tag"
          onAction={() => navigate("/new-tag")}
        />
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag?.id || tag?.ID}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-[rgb(var(--border))] bg-[rgb(var(--surface))] text-[rgb(var(--copy-secondary))] hover:bg-[rgb(var(--card))] transition-colors cursor-default"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tag?.color || tag?.Color }}
                />
                {tag?.name || tag?.Name}
                {tag?.entries_count != null && (
                  <span className="text-[rgb(var(--copy-muted))]">
                    {tag.entries_count}
                  </span>
                )}
              </span>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[rgb(var(--border))] px-5 py-6 text-center">
            <FaTag className="mx-auto mb-2 text-lg text-[rgb(var(--copy-muted))]" />
            <p className="text-sm text-[rgb(var(--copy-muted))]">
              Tags help you organize and find notes quickly.
            </p>
          </div>
        )}
      </section>

      {/* Notebooks */}
      <section className="mb-10">
        <SectionTitle
          title="Notebooks"
          actionLabel="New notebook"
          onAction={() => navigate("/new-notebook")}
          viewAllLabel={notebooks.length > 0 ? "View all" : undefined}
          onViewAll={notebooks.length > 0 ? () => navigate("/notebooks") : undefined}
        />
        {notebooks.length > 0 ? (
          <div className="space-y-0.5">
            {notebooks.slice(0, 5).map((notebook) => (
              <NotebookRow
                key={notebook?.id || notebook?.ID}
                notebook={notebook}
                navigate={navigate}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[rgb(var(--border))] px-5 py-6 text-center">
            <FaBook className="mx-auto mb-2 text-lg text-[rgb(var(--copy-muted))]" />
            <p className="text-sm text-[rgb(var(--copy-muted))]">
              Group related notes into notebooks for better organization.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

// ─── Sub-components ──────────────────────────────────────

function SectionTitle({
  title,
  actionLabel,
  onAction,
  viewAllLabel,
  onViewAll,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  viewAllLabel?: string;
  onViewAll?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xs font-semibold text-[rgb(var(--copy-muted))] uppercase tracking-widest">
        {title}
      </h2>
      <div className="flex items-center gap-3">
        {viewAllLabel && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-secondary))] transition-colors"
          >
            {viewAllLabel}
          </button>
        )}
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="flex items-center gap-1 text-xs text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-primary))] transition-colors"
          >
            <FaPlus className="text-[10px]" />
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

function NoteRow({ note, navigate }: { note: any; navigate: any }) {
  const title = note?.title || note?.Title || "Untitled";
  const content = note?.content || note?.Content || "";
  const notebookColor =
    note?.chapter?.color || note?.Chapter?.Color || "rgb(var(--border))";
  const notebookName =
    note?.chapter?.name || note?.chapter?.title || note?.Chapter?.Name || "";
  const moodEmoji = getEmojiFromShortcode(
    note?.mood?.emoji || note?.Mood?.Emoji,
  );
  const isFav = note?.is_favourite || note?.IsFavourite;
  const updated = note?.updated_at || note?.UpdatedAt;
  const words = countWords(content);

  return (
    <button
      onClick={() => navigate("/note", { state: { entry: note } })}
      className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-md hover:bg-[rgb(var(--surface))] transition-colors text-left group"
    >
      <span
        className="w-1 h-8 rounded-full flex-shrink-0"
        style={{ backgroundColor: notebookColor }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[rgb(var(--copy-primary))] truncate">
            {title}
          </span>
          {isFav && (
            <FaStar className="text-[10px] text-[rgb(var(--warning))] flex-shrink-0" />
          )}
          {moodEmoji && <span className="text-xs flex-shrink-0">{moodEmoji}</span>}
        </div>
        <div className="flex items-center gap-2 text-xs text-[rgb(var(--copy-muted))] mt-0.5">
          {notebookName && <span>{notebookName}</span>}
          {notebookName && updated && <span>·</span>}
          {updated && <span>{formatDate(updated)}</span>}
          {words > 0 && (
            <span>
              · {words} {words === 1 ? "word" : "words"}
            </span>
          )}
        </div>
      </div>
      <FaArrowRight className="text-[10px] text-[rgb(var(--copy-muted))] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </button>
  );
}

function NotebookRow({
  notebook,
  navigate,
}: {
  notebook: any;
  navigate: any;
}) {
  const title = notebook?.title || notebook?.Title || "Untitled";
  const color = notebook?.color || notebook?.Color || "rgb(var(--border))";
  const noteCount =
    notebook?.entries?.length || notebook?.Entries?.length || 0;
  const isFav = notebook?.is_favourite || notebook?.IsFavourite;
  const updated = notebook?.updated_at || notebook?.UpdatedAt;

  return (
    <button
      onClick={() => navigate("/notebook", { state: { chapter: notebook } })}
      className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-md hover:bg-[rgb(var(--surface))] transition-colors text-left group"
    >
      <span
        className="w-1 h-8 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[rgb(var(--copy-primary))] truncate">
            {title}
          </span>
          {isFav && (
            <FaStar className="text-[10px] text-[rgb(var(--warning))] flex-shrink-0" />
          )}
        </div>
        <div className="text-xs text-[rgb(var(--copy-muted))] mt-0.5">
          {noteCount} {noteCount === 1 ? "note" : "notes"}
          {updated && <span> · {formatDate(updated)}</span>}
        </div>
      </div>
      <FaArrowRight className="text-[10px] text-[rgb(var(--copy-muted))] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </button>
  );
}

export default Home;
