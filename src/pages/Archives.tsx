import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaUndo, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import { GetAllChapter, GetAllEntries, DeleteEntry, DeleteChapter, ArchiveChapter, ArchiveEntry } from "../APIs";
import { formatDate } from "../utilities/formatDate";
import EmptyState from "../components/EmptyState";
import ConfirmModal from "../components/ConfirmModal";

function v(item: any, ...keys: string[]) { for (const k of keys) { if (item?.[k] !== undefined && item?.[k] !== null) return item[k]; } return undefined; }

export default function Archives() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "chapter" | "entry"; item: any } | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [cRes, eRes] = await Promise.all([GetAllChapter(), GetAllEntries()]);
      const chapters = (cRes?.data || []).filter((c: any) => v(c, "IsArchived", "is_archived")).map((c: any) => ({ ...c, _type: "notebook" }));
      const entries = (eRes?.data || []).filter((e: any) => v(e, "IsArchived", "is_archived")).map((e: any) => ({ ...e, _type: "note" }));
      setItems([...chapters, ...entries]);
    } catch { setItems([]); toast.error("Failed to load archives"); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAction = async (action: "unarchive" | "delete", type: "chapter" | "entry", item: any) => {
    const key = `${action}-${type}-${v(item, "ID", "id")}`;
    if (processingId) return;
    setProcessingId(key);
    const id = v(item, "ID", "id");
    let ok = false;
    if (action === "unarchive" && type === "chapter") ok = await ArchiveChapter(id, false);
    else if (action === "unarchive" && type === "entry") ok = await ArchiveEntry(id, false);
    else if (action === "delete" && type === "chapter") ok = await DeleteChapter(id);
    else if (action === "delete" && type === "entry") ok = await DeleteEntry(id);
    if (ok) { toast.success(`${action === "unarchive" ? "Restored" : "Deleted"}`); fetchAll(); }
    else toast.error(`Failed to ${action}`);
    setProcessingId(null);
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <button onClick={() => navigate("/")} className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-primary))] transition-colors mb-8">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Home
        </button>

        <h1 className="text-xl font-semibold text-[rgb(var(--copy-primary))] mb-1">Archives</h1>
        {!isLoading && items.length > 0 && <p className="text-sm text-[rgb(var(--copy-muted))] mb-8">{items.length} {items.length === 1 ? "item" : "items"}</p>}
        {!isLoading && items.length === 0 && <div className="mb-8" />}

        {isLoading ? (
          <div className="space-y-1">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 px-3 animate-pulse">
                <div className="w-4 h-4 bg-[rgb(var(--surface))] rounded flex-shrink-0" />
                <div className="flex-1 h-3.5 bg-[rgb(var(--surface))] rounded" />
                <div className="w-12 h-3 bg-[rgb(var(--surface))] rounded flex-shrink-0" />
                <div className="w-14 h-3 bg-[rgb(var(--surface))] rounded flex-shrink-0" />
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div>
            {items.map(item => {
              const isNotebook = item._type === "notebook";
              const title = v(item, "Title", "title") || "Untitled";
              const updated = v(item, "UpdatedAt", "updated_at");
              const color = isNotebook ? v(item, "Color", "color") : (v(item, "Chapter", "chapter")?.Color ?? v(item, "Chapter", "chapter")?.color);

              return (
                <div key={`${item._type}-${v(item, "ID", "id")}`} className="group flex items-center gap-3 py-2 px-3 -mx-3 rounded-lg hover:bg-[rgb(var(--surface))] transition-colors">
                  {isNotebook ? <div className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: color || "rgb(var(--copy-muted))" }} /> : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[rgb(var(--copy-muted))] flex-shrink-0"><path d="M4 2h8a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" /><path d="M5.5 5h5M5.5 7.5h3.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /></svg>
                  )}
                  <span className="flex-1 min-w-0 text-sm text-[rgb(var(--copy-primary))] truncate">{title}</span>
                  <span className="text-xs text-[rgb(var(--copy-muted))] flex-shrink-0 capitalize">{item._type}</span>
                  {updated && <span className="text-xs text-[rgb(var(--copy-muted))] flex-shrink-0">{formatDate(updated)}</span>}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => handleAction("unarchive", isNotebook ? "chapter" : "entry", item)} aria-label="Restore" className="flex items-center gap-1 px-2 py-1 text-xs text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-primary))] rounded transition-colors"><FaUndo className="text-[9px]" /> Restore</button>
                    <button onClick={() => setDeleteTarget({ type: isNotebook ? "chapter" : "entry", item })} aria-label="Delete permanently" className="flex items-center gap-1 px-2 py-1 text-xs text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--error))] rounded transition-colors"><FaTrash className="text-[9px]" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState title="Nothing archived" description="Archived notes and notebooks will appear here." />
        )}

        <ConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={async () => {
            if (!deleteTarget) return;
            await handleAction("delete", deleteTarget.type, deleteTarget.item);
            setDeleteTarget(null);
          }}
          title={`Delete ${deleteTarget?.type === "chapter" ? "notebook" : "note"} permanently`}
          message="This item is already archived. Deleting it permanently cannot be undone."
          itemName={v(deleteTarget?.item, "Title", "title") || "Untitled"}
          isProcessing={!!processingId}
          confirmText="Delete permanently"
          variant="danger"
        />
      </div>
    </div>
  );
}
