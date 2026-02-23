import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaStar, FaEdit, FaTrash, FaHeart } from "react-icons/fa";
import { formatDate } from "../utilities/formatDate";
import { getEmojiFromShortcode } from "../utilities/emoji";
import { countWords, estimateReadTime } from "../utilities/text";
import { DeleteEntry, FavouriteEntry } from "../APIs";
import ConfirmModal from "../components/ConfirmModal";
import toast from "react-hot-toast";

/**
 * Resolve a field that may arrive in camelCase or PascalCase depending on
 * the navigation source.  Returns the first defined value found.
 */
function resolve<T>(...candidates: (T | undefined | null)[]): T | undefined {
  return candidates.find((v) => v !== undefined && v !== null) as T | undefined;
}

const EntryView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const entry = location.state?.entry;

  const [isFav, setIsFav] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBack = () => navigate(-1);

  /* ------------------------------------------------------------------ */
  /*  No note – minimal "not found" state                                */
  /* ------------------------------------------------------------------ */
  if (!entry) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[rgb(var(--background))] px-4">
        <h2 className="text-lg font-serif text-[rgb(var(--copy-primary))] mb-2">
          Note not found
        </h2>
        <p className="text-sm text-[rgb(var(--copy-secondary))] mb-6">
          The note you're looking for doesn't exist or couldn't be loaded.
        </p>
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg
                     bg-[rgb(var(--card))] text-[rgb(var(--copy-primary))]
                     border border-[rgb(var(--border))] hover:bg-[rgb(var(--surface))]
                     transition-colors"
        >
          <FaArrowLeft size={12} />
          Go back
        </button>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  Normalise camelCase / PascalCase fields                            */
  /* ------------------------------------------------------------------ */
  const title: string = resolve(entry.title, entry.Title) ?? "Untitled";
  const content: string = resolve(entry.content, entry.Content) ?? "";
  const chapter = entry.chapter; // always nested object
  const mood = entry.mood; // always nested object
  const tags: any[] = resolve(entry.tags, entry.Collections, entry.collection) ?? [];
  const isFavourite: boolean = isFav || (resolve(entry.is_favourite, entry.IsFavourite) ?? false);
  const updatedAt: string | undefined = resolve(entry.updated_at, entry.UpdatedAt, entry.lastModified);
  const createdAt: string | undefined = resolve(entry.createdAt, entry.CreatedAt);
  const entryId = resolve(entry.id, entry.ID);

  const words = entry.wordCount ?? countWords(content);
  const readTime = entry.readTime ?? estimateReadTime(words);

  // Initialize fav state from entry data once
  if (!isFav && (resolve(entry.is_favourite, entry.IsFavourite) ?? false) && isFav === false) {
    // Already handled by the isFavourite derivation above
  }

  /* ── Actions ─────────────────────────────────────────────────────── */
  const handleEdit = () => {
    navigate("/new-note", {
      state: {
        ...entry,
        update: true,
        id: entryId,
      },
    });
  };

  const handleToggleFavorite = async () => {
    if (!entryId) return;
    const newVal = !isFavourite;
    const success = await FavouriteEntry(Number(entryId), newVal);
    if (success) {
      setIsFav(newVal);
      toast.success(newVal ? "Added to favorites" : "Removed from favorites");
    } else {
      toast.error("Failed to update favorite status.");
    }
  };

  const handleDelete = async () => {
    if (!entryId) return;
    setIsDeleting(true);
    const success = await DeleteEntry(Number(entryId));
    setIsDeleting(false);
    if (success) {
      toast.success("Note deleted successfully.");
      navigate("/notes");
    } else {
      toast.error("Failed to delete note.");
      setShowDeleteModal(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Note"
        message="This note will be permanently deleted. This action cannot be undone."
        itemName={title}
        isProcessing={isDeleting}
        confirmText="Delete"
        variant="danger"
      />

      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* ── Top bar: Back + Actions ─────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--copy-secondary))]
                       hover:text-[rgb(var(--copy-primary))] transition-colors"
            aria-label="Go back"
          >
            <FaArrowLeft size={12} />
            <span>Back</span>
          </button>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleFavorite}
              className="p-2 rounded-lg hover:bg-[rgb(var(--surface))] transition-colors"
              aria-label={isFavourite ? "Remove from favorites" : "Add to favorites"}
              title={isFavourite ? "Remove from favorites" : "Add to favorites"}
            >
              <FaHeart
                size={14}
                className={isFavourite ? "text-[rgb(var(--accent))]" : "text-[rgb(var(--copy-muted))]"}
              />
            </button>
            <button
              onClick={handleEdit}
              className="p-2 rounded-lg hover:bg-[rgb(var(--surface))] transition-colors"
              aria-label="Edit note"
              title="Edit note"
            >
              <FaEdit size={14} className="text-[rgb(var(--copy-muted))]" />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 rounded-lg hover:bg-red-50 transition-colors"
              aria-label="Delete note"
              title="Delete note"
            >
              <FaTrash size={13} className="text-[rgb(var(--copy-muted))] hover:text-red-500" />
            </button>
          </div>
        </div>

        {/* ── Title ───────────────────────────────────────────────── */}
        <h1 className="text-2xl font-serif font-bold text-[rgb(var(--copy-primary))] leading-snug capitalize mb-2">
          {title}
          {isFavourite && (
            <FaStar
              className="inline-block ml-2 text-[rgb(var(--accent))] align-middle"
              size={14}
            />
          )}
        </h1>

        {/* ── Meta row: chapter · mood · date ─────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 text-sm mb-8">
          {chapter && (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${chapter.color}18`,
                color: chapter.color,
              }}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: chapter.color }}
              />
              {chapter.name ?? chapter.title}
            </span>
          )}

          {mood && (
            <span className="inline-flex items-center gap-1.5 text-xs text-[rgb(var(--copy-secondary))]">
              <span className="text-base leading-none">
                {getEmojiFromShortcode(mood.emoji)}
              </span>
              <span style={{ color: mood.color }}>{mood.name}</span>
            </span>
          )}

          {updatedAt && (
            <span className="text-xs text-[rgb(var(--copy-muted))]">
              {formatDate(updatedAt)}
            </span>
          )}

          <span className="text-xs text-[rgb(var(--copy-muted))]">
            {readTime}
          </span>
        </div>

        {/* ── Divider ─────────────────────────────────────────────── */}
        <hr className="border-[rgb(var(--border))] mb-8" />

        {/* ── Content ─────────────────────────────────────────────── */}
        <article className="text-[rgb(var(--copy-primary))] text-base leading-[1.8] whitespace-pre-wrap mb-10">
          {content}
        </article>

        {/* ── Tags ────────────────────────────────────────────────── */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {tags.map((tag: any) => (
              <span
                key={tag.id ?? tag.name}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs
                           text-[rgb(var(--copy-secondary))] bg-[rgb(var(--surface))]"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* ── Footer ──────────────────────────────────────────────── */}
        <hr className="border-[rgb(var(--border))] mb-4" />
        <div className="flex flex-wrap items-center gap-3 text-xs text-[rgb(var(--copy-muted))]">
          {createdAt && <span>Created {formatDate(createdAt)}</span>}
          {updatedAt && createdAt && updatedAt !== createdAt && (
            <span>· Updated {formatDate(updatedAt)}</span>
          )}
          {updatedAt && !createdAt && <span>Updated {formatDate(updatedAt)}</span>}
          <span>· {words} {words === 1 ? "word" : "words"}</span>
        </div>
      </div>
    </div>
  );
};

export default EntryView;
