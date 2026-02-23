import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaSearch, FaChevronUp, FaChevronDown, FaTimes } from "react-icons/fa";
import { GetAllCollections, DeleteCollection } from "../APIs";
import { formatDate } from "../utilities/formatDate";
import PageHeader from "../components/PageHeader";
import ConfirmModal from "../components/ConfirmModal";
import EmptyState from "../components/EmptyState";

// ── Types ──────────────────────────────────────────────────

interface CollectionItem {
  ID: number;
  Name: string;
  Color: string;
  Chapters: number;
  Entries: number;
  LastUsed: string;
}

type SortField = "name" | "chapters" | "entries";
type SortOrder = "asc" | "desc";

// ── Skeleton loader ────────────────────────────────────────

const SkeletonGrid: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="animate-pulse rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4 py-3"
      >
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[rgb(var(--border))]" />
          <div className="h-4 rounded bg-[rgb(var(--border))] w-28" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-3 rounded bg-[rgb(var(--border))] w-16" />
          <div className="h-3 rounded bg-[rgb(var(--border))] w-14" />
        </div>
      </div>
    ))}
  </div>
);

// ── Sort controls ──────────────────────────────────────────

const SORT_OPTIONS: { label: string; value: SortField }[] = [
  { label: "Alphabetical", value: "name" },
  { label: "Notebooks", value: "chapters" },
  { label: "Notes", value: "entries" },
];

// ── Component ──────────────────────────────────────────────

const Collections: React.FC = () => {
  const navigate = useNavigate();

  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const [deleteTarget, setDeleteTarget] = useState<CollectionItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Data fetching ──────────────────────────────────────

  const fetchCollections = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await GetAllCollections();
      if (response && Array.isArray(response.data)) {
        setCollections(response.data);
        setError(null);
      } else {
        setError("Failed to load tags: invalid data format.");
      }
    } catch {
      setError("Failed to load tags. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  // ── Delete handler ─────────────────────────────────────

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const ok = await DeleteCollection(deleteTarget.ID);
      if (ok) {
        toast.success(`"${deleteTarget.Name}" deleted.`);
        await fetchCollections();
      } else {
        toast.error("Failed to delete tag.");
      }
    } catch {
      toast.error("An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // ── Filtering & sorting ────────────────────────────────

  const filtered = collections
    .filter((c) =>
      c.Name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    )
    .sort((a, b) => {
      const dir = sortOrder === "asc" ? 1 : -1;
      switch (sortBy) {
        case "chapters":
          return ((a.Chapters || 0) - (b.Chapters || 0)) * dir;
        case "entries":
          return ((a.Entries || 0) - (b.Entries || 0)) * dir;
        case "name":
        default:
          return a.Name.localeCompare(b.Name) * dir;
      }
    });

  // ── Render ─────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <PageHeader
          title="Tags"
          subtitle="Label and organize your notes and notebooks."
          action={
            <button
              onClick={() => navigate("/new-tag")}
              className="px-3.5 py-1.5 text-sm font-medium rounded-md bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] hover:bg-[rgb(var(--cta-active))] transition-colors"
            >
              New Tag
            </button>
          }
        />

        {/* Search + Sort controls */}
        {!error && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-xs w-full">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--copy-muted))] text-xs" />
              <input
                type="text"
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isLoading}
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-transparent border border-[rgb(var(--border))] rounded-md text-[rgb(var(--copy-primary))] placeholder-[rgb(var(--copy-muted))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--cta))] focus:border-[rgb(var(--cta))] transition-colors disabled:opacity-50"
              />
            </div>

            {/* Sort pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  disabled={isLoading}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-colors disabled:opacity-50 ${
                    sortBy === opt.value
                      ? "border-[rgb(var(--cta))] text-[rgb(var(--cta))] bg-[rgb(var(--cta))]/5"
                      : "border-[rgb(var(--border))] text-[rgb(var(--copy-muted))] hover:border-[rgb(var(--copy-muted))]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}

              {/* Order toggle */}
              <button
                onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
                disabled={isLoading}
                className="p-1.5 rounded-md border border-[rgb(var(--border))] text-[rgb(var(--copy-muted))] hover:border-[rgb(var(--copy-muted))] transition-colors disabled:opacity-50"
                title={sortOrder === "asc" ? "Ascending" : "Descending"}
              >
                {sortOrder === "asc" ? (
                  <FaChevronUp className="text-xs" />
                ) : (
                  <FaChevronDown className="text-xs" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && <SkeletonGrid />}

        {/* Error */}
        {error && !isLoading && (
          <EmptyState
            title="Error loading tags"
            description={error}
            action={
              <button
                onClick={fetchCollections}
                className="px-3 py-1.5 text-sm rounded-md bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] hover:bg-[rgb(var(--cta-active))] transition-colors"
              >
                Retry
              </button>
            }
          />
        )}

        {/* Empty */}
        {!error && !isLoading && filtered.length === 0 && (
          <EmptyState
            title={searchTerm ? "No tags found" : "No tags yet"}
            description={
              searchTerm
                ? `Nothing matches "${searchTerm}".`
                : "Create your first tag to get started."
            }
          />
        )}

        {/* Grid */}
        {!error && !isLoading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((c) => (
              <div
                key={c.ID}
                className="group relative rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4 py-3 hover:border-[rgb(var(--copy-muted))]/40 transition-colors"
              >
                {/* Name row */}
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: c.Color }}
                  />
                  <span className="text-sm font-medium text-[rgb(var(--copy-primary))] truncate capitalize">
                    {c.Name}
                  </span>
                </div>

                {/* Stats */}
                <p className="text-xs text-[rgb(var(--copy-muted))] pl-5">
                  {c.Chapters || 0} notebook{(c.Chapters || 0) !== 1 ? "s" : ""}
                  {" · "}
                  {c.Entries || 0} note{(c.Entries || 0) !== 1 ? "s" : ""}
                </p>

                {/* Delete — visible on hover */}
                <button
                  onClick={() => setDeleteTarget(c)}
                  className="absolute top-2.5 right-2.5 p-1 rounded opacity-0 group-hover:opacity-100 text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--error))] hover:bg-[rgb(var(--surface))] transition-all"
                  title="Delete tag"
                  aria-label={`Delete ${c.Name}`}
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Delete confirmation */}
        <ConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          title="Delete tag"
          message="This action cannot be undone. All association with notebooks and notes will be removed."
          itemName={deleteTarget?.Name}
          isProcessing={isDeleting}
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </div>
  );
};

export default Collections;
