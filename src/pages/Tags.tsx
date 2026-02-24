import React, { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { FaSearch } from "react-icons/fa";
import { GetAllCollections, DeleteCollection, createCollection } from "../APIs";
import EmptyState from "../components/EmptyState";
import ConfirmModal from "../components/ConfirmModal";

interface Tag { ID: number; Name: string; Color: string; Chapters: number; Entries: number; }

const COLORS = [
  "#FF5722", "#007BFF", "#28A745", "#DC3545",
  "#6F42C1", "#6C757D", "#ADBE98", "#f4a261",
];

const Collections: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  // Inline create
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(() => COLORS[Math.floor(Math.random() * COLORS.length)]);
  const [isCreating, setIsCreating] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await GetAllCollections();
      if (res && Array.isArray(res.data)) setTags(res.data);
    } catch { toast.error("Failed to load tags"); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchTags(); }, [fetchTags]);

  const filtered = tags
    .filter(t => t.Name.toLowerCase().includes(search.toLowerCase().trim()))
    .sort((a, b) => a.Name.localeCompare(b.Name));

  const INITIAL = 15;
  const visible = showAll || search.trim() ? filtered : filtered.slice(0, INITIAL);
  const hasMore = !showAll && !search.trim() && filtered.length > INITIAL;

  const handleCreate = async () => {
    const t = newName.trim();
    if (!t || isCreating) return;
    setIsCreating(true);
    try {
      const result = await createCollection({ name: t, color: newColor, slug: null });
      if (typeof result === "string" || result instanceof Error) {
        toast.error(typeof result === "string" ? result : "Failed to create tag");
      } else {
        toast.success(`"${t}" created`);
        setNewName("");
        setNewColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
        setShowForm(false);
        fetchTags();
      }
    } catch {
      toast.error("Something went wrong");
    }
    setIsCreating(false);
  };

  const openForm = () => {
    setShowForm(true);
    setTimeout(() => nameRef.current?.focus(), 50);
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-baseline justify-between mb-8">
          <h1 className="text-xl font-semibold text-[rgb(var(--copy-primary))]">
            Tags
            {!isLoading && tags.length > 0 && (
              <span className="text-sm font-normal text-[rgb(var(--copy-muted))] ml-2">{tags.length}</span>
            )}
          </h1>
          {!showForm && (
            <button
              onClick={openForm}
              className="p-1 rounded-md text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-secondary))] hover:bg-[rgb(var(--surface))] transition-colors"
              aria-label="Create new tag"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          )}
        </div>

        {/* Inline create */}
        {showForm && (
          <div className="mb-8">
            <div className="flex items-center gap-2">
              <span
                className="flex-shrink-0 w-3.5 h-3.5 rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: newColor }}
              />
              <input
                ref={nameRef}
                type="text"
                placeholder="Tag name..."
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && newName.trim()) handleCreate();
                  if (e.key === "Escape") { setShowForm(false); setNewName(""); }
                }}
                disabled={isCreating}
                className="flex-1 px-3 py-2 text-sm bg-transparent border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--copy-primary))] placeholder-[rgb(var(--copy-muted))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--cta))] disabled:opacity-50 transition-colors"
              />
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || isCreating}
                className="flex-shrink-0 px-4 py-2 text-xs font-medium rounded-lg bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] disabled:opacity-40 transition-colors"
              >
                {isCreating ? "Adding..." : "Add"}
              </button>
            </div>
            <div className="flex items-center gap-1.5 mt-2 ml-5">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className={`w-5 h-5 rounded-full transition-all hover:scale-110 ${newColor === c ? "ring-2 ring-[rgb(var(--cta))] ring-offset-1 ring-offset-[rgb(var(--background))]" : "ring-1 ring-black/10"}`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        {!isLoading && tags.length > 3 && (
          <div className="relative mb-6">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--copy-muted))] text-[11px]" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-transparent border border-[rgb(var(--border))] rounded-lg text-sm text-[rgb(var(--copy-primary))] placeholder-[rgb(var(--copy-muted))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--cta))] transition-colors"
            />
          </div>
        )}

        {/* List */}
        {isLoading ? (
          <div className="space-y-1">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 px-3 animate-pulse">
                <div className="w-2.5 h-2.5 bg-[rgb(var(--surface))] rounded-full" />
                <div className="h-4 bg-[rgb(var(--surface))] rounded w-24" />
              </div>
            ))}
          </div>
        ) : visible.length > 0 ? (
          <div className="divide-y divide-[rgb(var(--border))]/40">
            {visible.map(t => (
              <div key={t.ID} className="group flex items-center gap-3 py-2.5 px-3 -mx-3 hover:bg-[rgb(var(--surface))] transition-colors">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.Color }} />
                <span className="flex-1 min-w-0 text-sm text-[rgb(var(--copy-primary))] truncate capitalize">{t.Name}</span>
                <span className="text-xs text-[rgb(var(--copy-muted))] flex-shrink-0">
                  {t.Entries || 0} {(t.Entries || 0) === 1 ? "note" : "notes"}
                </span>
                <button
                  onClick={() => setDeleteTarget(t)}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--error))] transition-all"
                  aria-label={`Delete tag "${t.Name}"`}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M8 2L2 8M2 2l6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
            {hasMore && (
              <button
                onClick={() => setShowAll(true)}
                className="w-full py-3 mt-2 text-sm text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-secondary))] transition-colors"
              >
                Show all {filtered.length} tags
              </button>
            )}
          </div>
        ) : (
          <EmptyState
            title={search ? "No matching tags" : "No tags yet"}
            description={search ? "Try a different search." : "Tags help you organize your notes."}
            action={
              !search && !showForm ? (
                <button
                  onClick={openForm}
                  className="flex items-center gap-1.5 text-sm text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-secondary))] transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  Create your first tag
                </button>
              ) : undefined
            }
          />
        )}
        <ConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={async () => {
            if (!deleteTarget) return;
            setDeletingId(deleteTarget.ID);
            const ok = await DeleteCollection(deleteTarget.ID);
            setDeletingId(null);
            if (ok) { toast.success(`"${deleteTarget.Name}" deleted`); setDeleteTarget(null); fetchTags(); }
            else toast.error("Failed to delete");
          }}
          title="Delete tag"
          message="This will remove the tag from all notes. This action cannot be undone."
          itemName={deleteTarget?.Name}
          isProcessing={deletingId === deleteTarget?.ID}
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </div>
  );
};

export default Collections;
