import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { GetAllNotes, GetAllChapter } from "../APIs";
import { formatDate } from "../utilities/formatDate";
import EmptyState from "../components/EmptyState";
import toast from "react-hot-toast";

function v(item: any, ...keys: string[]) { for (const k of keys) { if (item?.[k] !== undefined && item?.[k] !== null) return item[k]; } return undefined; }

export default function Favorites() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [notesRes, chaptersRes] = await Promise.all([GetAllNotes(), GetAllChapter()]);
      const favNotes = (notesRes?.data || []).filter((e: any) => (v(e, "IsFavourite", "is_favourite")) && !(v(e, "IsArchived", "is_archived"))).map((e: any) => ({ ...e, _type: "note" }));
      const favChapters = (chaptersRes?.data || []).filter((c: any) => (v(c, "IsFavourite", "is_favourite")) && !(v(c, "IsArchived", "is_archived"))).map((c: any) => ({ ...c, _type: "notebook" }));
      setItems([...favNotes, ...favChapters]);
    } catch { setItems([]); toast.error("Failed to load favorites"); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <button onClick={() => navigate("/")} className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-primary))] transition-colors mb-8">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Home
        </button>

        <h1 className="text-xl font-semibold text-[rgb(var(--copy-primary))] mb-1">Favorites</h1>
        {!isLoading && items.length > 0 && <p className="text-sm text-[rgb(var(--copy-muted))] mb-8">{items.length} {items.length === 1 ? "item" : "items"}</p>}
        {!isLoading && items.length === 0 && <div className="mb-8" />}

        {isLoading ? (
          <div className="space-y-1">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 px-3 animate-pulse">
                <div className="w-5 h-5 bg-[rgb(var(--surface))] rounded flex-shrink-0" />
                <div className="flex-1 h-3.5 bg-[rgb(var(--surface))] rounded" />
                <div className="w-10 h-3 bg-[rgb(var(--surface))] rounded flex-shrink-0" />
                <div className="w-14 h-3 bg-[rgb(var(--surface))] rounded flex-shrink-0" />
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div>
            {items.map((item, i) => {
              const isNote = item._type === "note";
              const title = v(item, "Title", "title") || "Untitled";
              const updated = v(item, "UpdatedAt", "updated_at");
              const color = isNote ? (v(item, "Chapter", "chapter")?.Color ?? v(item, "Chapter", "chapter")?.color) : (v(item, "Color", "color"));

              return (
                <button
                  key={`${item._type}-${v(item, "ID", "id")}`}
                  onClick={() => isNote ? navigate(`/note?id=${v(item, "ID", "id")}`, { state: { entry: item } }) : navigate(`/notebook?id=${v(item, "ID", "id")}`, { state: { chapter: item } })}
                  className="w-full group flex items-center gap-3 py-2 px-3 -mx-3 rounded-lg hover:bg-[rgb(var(--surface))] transition-colors text-left"
                >
                  {isNote ? (
                    <span className="w-5 text-center text-sm flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[rgb(var(--copy-muted))] inline"><path d="M4 2h8a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" /><path d="M5.5 5h5M5.5 7.5h3.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /></svg>
                    </span>
                  ) : (
                    <div className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: color || "rgb(var(--copy-muted))" }} />
                  )}
                  <span className="flex-1 min-w-0 text-sm text-[rgb(var(--copy-primary))] truncate">{title}</span>
                  <FaStar className="text-[10px] text-[rgb(var(--accent))] flex-shrink-0" />
                  <span className="text-xs text-[rgb(var(--copy-muted))] flex-shrink-0 capitalize">{item._type}</span>
                  {updated && <span className="text-xs text-[rgb(var(--copy-muted))] flex-shrink-0">{formatDate(updated)}</span>}
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyState title="No favorites yet" description="Star a note or notebook to see it here." />
        )}
      </div>
    </div>
  );
}
