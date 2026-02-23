import React, { useState, useEffect, useCallback } from "react";
import { FaUndo, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";

import {
  GetAllChapter,
  GetAllEntries,
  DeleteEntry,
  DeleteChapter,
  ArchiveChapter,
  ArchiveEntry,
} from "../APIs";
import { formatDate } from "../utilities/formatDate";
import { getEmojiFromShortcode } from "../utilities/emoji";
import PageHeader from "../components/PageHeader";
import ConfirmModal from "../components/ConfirmModal";
import EmptyState from "../components/EmptyState";

// ─── Helpers for mixed-case API data ─────────────────────

function getId(item: any): number {
  return item?.id ?? item?.ID ?? 0;
}

function getTitle(item: any): string {
  return item?.title ?? item?.Title ?? "";
}

function getColor(item: any): string {
  return item?.color ?? item?.Color ?? "#9ca3af";
}

function getEntries(chapter: any): any[] {
  return chapter?.entries ?? chapter?.Entries ?? [];
}

function getContent(entry: any): string {
  return entry?.content ?? entry?.Content ?? "";
}

function getUpdatedAt(item: any): string {
  return item?.updated_at ?? item?.UpdatedAt ?? "";
}

function isArchived(item: any): boolean {
  return item?.is_archived ?? item?.IsArchived ?? false;
}

function getCollections(entry: any): any[] {
  return entry?.collection ?? entry?.Collections ?? [];
}

function getMood(entry: any): any | null {
  return entry?.mood ?? entry?.Mood ?? null;
}

function getChapterColor(entry: any): string {
  const chapter = entry?.chapter ?? entry?.Chapter;
  return chapter?.color ?? chapter?.Color ?? "#9ca3af";
}

// ─── Types for modal state ───────────────────────────────

interface ModalState {
  isOpen: boolean;
  action: "unarchive" | "delete" | null;
  type: "chapter" | "entry" | null;
  item: any;
  isProcessing: boolean;
}

const initialModal: ModalState = {
  isOpen: false,
  action: null,
  type: null,
  item: null,
  isProcessing: false,
};

// ─── Section wrapper ─────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-serif font-semibold text-[rgb(var(--copy-primary))] mb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}

// ─── Chapter row ─────────────────────────────────────────

function ChapterRow({
  chapter,
  onUnarchive,
  onDelete,
}: {
  chapter: any;
  onUnarchive: (c: any) => void;
  onDelete: (c: any) => void;
}) {
  const entries = getEntries(chapter);
  const entryCount = entries.length;

  return (
    <div className="group flex items-stretch rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] hover:shadow-sm transition-shadow duration-150 overflow-hidden">
      {/* Color bar */}
      <div
        className="w-1 flex-shrink-0"
        style={{ backgroundColor: getColor(chapter) }}
      />

      {/* Content */}
      <div className="flex-1 flex items-center justify-between gap-4 px-4 py-3 min-w-0">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-[rgb(var(--copy-primary))] truncate">
            {getTitle(chapter)}
          </h3>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-[rgb(var(--copy-muted))]">
              {entryCount} {entryCount === 1 ? "note" : "notes"}
            </span>
            <span className="text-xs text-[rgb(var(--copy-muted))]">
              {formatDate(getUpdatedAt(chapter))}
            </span>
          </div>
        </div>

        {/* Hover actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
          <button
            onClick={() => onUnarchive(chapter)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[rgb(var(--copy-secondary))] hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Unarchive"
          >
            <FaUndo className="text-[10px]" />
            Unarchive
          </button>
          <button
            onClick={() => onDelete(chapter)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[rgb(var(--copy-secondary))] hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <FaTrash className="text-[10px]" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Entry row ───────────────────────────────────────────

function EntryRow({
  entry,
  onUnarchive,
  onDelete,
}: {
  entry: any;
  onUnarchive: (e: any) => void;
  onDelete: (e: any) => void;
}) {
  const content = getContent(entry);
  const preview = content.length > 120 ? content.slice(0, 120) + "…" : content;
  const mood = getMood(entry);
  const moodEmoji = mood ? getEmojiFromShortcode(mood.emoji) : "";
  const collections = getCollections(entry);

  return (
    <div className="group flex items-stretch rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] hover:shadow-sm transition-shadow duration-150 overflow-hidden">
      {/* Color bar */}
      <div
        className="w-1 flex-shrink-0"
        style={{ backgroundColor: getChapterColor(entry) }}
      />

      {/* Content */}
      <div className="flex-1 flex items-center justify-between gap-4 px-4 py-3 min-w-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-[rgb(var(--copy-primary))] truncate">
              {getTitle(entry)}
            </h3>
            {moodEmoji && (
              <span
                className="text-xs flex-shrink-0"
                title={mood?.name ?? ""}
              >
                {moodEmoji}
              </span>
            )}
          </div>

          {preview && (
            <p className="text-xs text-[rgb(var(--copy-secondary))] mt-0.5 line-clamp-1">
              {preview}
            </p>
          )}

          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {collections.map((tag: any) => {
              const tagName = tag?.name ?? tag?.Name ?? "";
              const tagColor = tag?.color ?? tag?.Color ?? "#6b7280";
              return (
                <span
                  key={tagName}
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: `${tagColor}20`,
                    color: tagColor,
                  }}
                >
                  #{tagName}
                </span>
              );
            })}
            <span className="text-xs text-[rgb(var(--copy-muted))]">
              {formatDate(getUpdatedAt(entry))}
            </span>
          </div>
        </div>

        {/* Hover actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
          <button
            onClick={() => onUnarchive(entry)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[rgb(var(--copy-secondary))] hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Unarchive"
          >
            <FaUndo className="text-[10px]" />
            Unarchive
          </button>
          <button
            onClick={() => onDelete(entry)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[rgb(var(--copy-secondary))] hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <FaTrash className="text-[10px]" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────

export default function Archives() {
  const [archivedEntries, setArchivedEntries] = useState<any[]>([]);
  const [archivedChapters, setArchivedChapters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>(initialModal);

  const fetchArchivedChapters = useCallback(async () => {
    try {
      const response = await GetAllChapter();
      if (response && Array.isArray(response.data)) {
        setArchivedChapters(response.data.filter((c: any) => isArchived(c)));
      }
    } catch {
      toast.error("Failed to load archived notebooks.");
    }
  }, []);

  const fetchArchivedEntries = useCallback(async () => {
    try {
      const response = await GetAllEntries();
      if (response && Array.isArray(response.data)) {
        setArchivedEntries(response.data.filter((e: any) => isArchived(e)));
      }
    } catch {
      toast.error("Failed to load archived notes.");
    }
  }, []);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      await Promise.all([fetchArchivedChapters(), fetchArchivedEntries()]);
      setIsLoading(false);
    }
    load();
  }, [fetchArchivedChapters, fetchArchivedEntries]);

  // ── Modal openers ────────────────────────────────────

  const openModal = (
    action: "unarchive" | "delete",
    type: "chapter" | "entry",
    item: any
  ) => {
    setModal({ isOpen: true, action, type, item, isProcessing: false });
  };

  const closeModal = () => {
    if (!modal.isProcessing) {
      setModal(initialModal);
    }
  };

  // ── Modal confirm handler ────────────────────────────

  const handleConfirm = async () => {
    const { action, type, item } = modal;
    if (!action || !type || !item) return;

    setModal((prev) => ({ ...prev, isProcessing: true }));
    const title = getTitle(item);
    const id = getId(item);

    try {
      let success = false;

      if (action === "unarchive" && type === "chapter") {
        success = await ArchiveChapter(id, false);
      } else if (action === "unarchive" && type === "entry") {
        success = await ArchiveEntry(id, false);
      } else if (action === "delete" && type === "chapter") {
        success = await DeleteChapter(id);
      } else if (action === "delete" && type === "entry") {
        success = await DeleteEntry(id);
      }

      if (success) {
        const verb = action === "unarchive" ? "unarchived" : "deleted";
        toast.success(`"${title}" has been ${verb}.`);
        setModal(initialModal);
        if (type === "chapter") await fetchArchivedChapters();
        else await fetchArchivedEntries();
      } else {
        toast.error(`Failed to ${action} "${title}".`);
        setModal((prev) => ({ ...prev, isProcessing: false }));
      }
    } catch {
      toast.error(`An error occurred while trying to ${action} "${title}".`);
      setModal((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  // ── Modal copy ───────────────────────────────────────

  function getModalProps() {
    const { action, type, item } = modal;
    const title = getTitle(item);

    if (action === "unarchive") {
      return {
        title: `Unarchive ${type === "chapter" ? "Notebook" : "Note"}`,
        message: `This will move it back to your active ${type === "chapter" ? "notebooks" : "notes"}.`,
        itemName: title,
        confirmText: "Unarchive",
        variant: "info" as const,
      };
    }

    return {
      title: `Delete ${type === "chapter" ? "Notebook" : "Note"}`,
      message:
        type === "chapter"
          ? "This action cannot be undone and will permanently remove the notebook and all its notes."
          : "This action cannot be undone.",
      itemName: title,
      confirmText: "Delete",
      variant: "danger" as const,
    };
  }

  // ── Render ───────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <PageHeader
          title="Archive"
          subtitle="Restored notes and notebooks"
        />

        {/* Archived Chapters */}
        <Section title="Archived Notebooks">
          {isLoading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-14 rounded-lg bg-[rgb(var(--card))] border border-[rgb(var(--border))] animate-pulse"
                />
              ))}
            </div>
          ) : archivedChapters.length > 0 ? (
            <div className="space-y-2">
              {archivedChapters.map((chapter) => (
                <ChapterRow
                  key={getId(chapter)}
                  chapter={chapter}
                  onUnarchive={(c) => openModal("unarchive", "chapter", c)}
                  onDelete={(c) => openModal("delete", "chapter", c)}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="No archived notebooks" />
          )}
        </Section>

        {/* Archived Entries */}
        <Section title="Archived Notes">
          {isLoading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-lg bg-[rgb(var(--card))] border border-[rgb(var(--border))] animate-pulse"
                />
              ))}
            </div>
          ) : archivedEntries.length > 0 ? (
            <div className="space-y-2">
              {archivedEntries.map((entry) => (
                <EntryRow
                  key={getId(entry)}
                  entry={entry}
                  onUnarchive={(e) => openModal("unarchive", "entry", e)}
                  onDelete={(e) => openModal("delete", "entry", e)}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="No archived notes" />
          )}
        </Section>

        {/* Single shared confirm modal */}
        <ConfirmModal
          isOpen={modal.isOpen}
          onClose={closeModal}
          onConfirm={handleConfirm}
          isProcessing={modal.isProcessing}
          {...getModalProps()}
        />
      </div>
    </div>
  );
}
