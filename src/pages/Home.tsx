import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaStar } from "react-icons/fa";
import { GetAllNotes, GetAllChapter } from "../APIs";

import { formatDate, formatFullDate } from "../utilities/formatDate";
import type { RootState } from "../redux/store";
import toast from "react-hot-toast";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const userName = useSelector((state: RootState) => state.auth.name);
  const [notes, setNotes] = useState<any[]>([]);
  const [notebooks, setNotebooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([GetAllNotes(), GetAllChapter()]).then(([notesRes, chapRes]) => {
      if (notesRes?.fetched) {
        setNotes(
          (notesRes.data || [])
            .filter((n: any) => !(n.IsArchived ?? n.is_archived))
            .sort((a: any, b: any) => new Date(b.UpdatedAt ?? b.updated_at ?? 0).getTime() - new Date(a.UpdatedAt ?? a.updated_at ?? 0).getTime())
            .slice(0, 5)
        );
      }
      if (chapRes?.data) {
        setNotebooks(
          (chapRes.data || [])
            .filter((c: any) => !(c.IsArchived ?? c.is_archived))
            .sort((a: any, b: any) => new Date(b.UpdatedAt ?? b.updated_at ?? 0).getTime() - new Date(a.UpdatedAt ?? a.updated_at ?? 0).getTime())
            .slice(0, 5)
        );
      }
    }).catch(() => {
      toast.error("Failed to load data");
    }).finally(() => setIsLoading(false));
  }, []);

  const greeting = userName ? `${getGreeting()}, ${userName}` : getGreeting();

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Greeting */}
        <div className="mb-10">
          <h1 className="text-xl font-serif font-bold text-[rgb(var(--copy-primary))]">{greeting}</h1>
          <p className="text-[12px] text-[rgb(var(--copy-muted))] mt-0.5">{formatFullDate(new Date().toISOString())}</p>
        </div>

        {/* Quick write */}
        <button
          onClick={() => navigate("/new-note")}
          className="w-full flex items-center gap-3 px-4 py-3 mb-10 rounded-lg border border-dashed border-[rgb(var(--border))] text-[13px] text-[rgb(var(--copy-muted))] hover:border-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-secondary))] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          Write a new note...
        </button>

        {/* Content */}
        {isLoading ? (
          <div className="animate-pulse">
            {/* Recent notes skeleton */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div className="h-3 w-24 bg-[rgb(var(--surface))] rounded" />
                <div className="h-3 w-14 bg-[rgb(var(--surface))] rounded" />
              </div>
              <div className="space-y-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 px-3">
                    <div className="w-3.5 h-3.5 bg-[rgb(var(--surface))] rounded flex-shrink-0" />
                    <div className="flex-1 h-3.5 bg-[rgb(var(--surface))] rounded" />
                    <div className="w-14 h-3 bg-[rgb(var(--surface))] rounded flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Notebooks skeleton */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="h-3 w-20 bg-[rgb(var(--surface))] rounded" />
                <div className="h-3 w-14 bg-[rgb(var(--surface))] rounded" />
              </div>
              <div className="space-y-0.5">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 px-3">
                    <div className="w-2.5 h-2.5 bg-[rgb(var(--surface))] rounded-full flex-shrink-0" />
                    <div className="flex-1 h-3.5 bg-[rgb(var(--surface))] rounded" />
                    <div className="w-16 h-3 bg-[rgb(var(--surface))] rounded flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Recent notes */}
            {notes.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[11px] font-semibold text-[rgb(var(--copy-muted))] uppercase tracking-wider">Recent notes</h2>
                  <button onClick={() => navigate("/notes")} className="text-[11px] text-[rgb(var(--cta))] hover:text-[rgb(var(--cta-active))] transition-colors">
                    View all
                  </button>
                </div>
                <div>
                  {notes.map((note) => {
                    const title = note?.Title ?? note?.title ?? "Untitled";
                    const isFav = note?.IsFavourite ?? note?.is_favourite;
                    const updated = note?.UpdatedAt ?? note?.updated_at;
                    const chapterName = note?.Chapter?.Title ?? note?.Chapter?.Name ?? note?.chapter?.title ?? note?.chapter?.name;
                    return (
                      <button
                        key={note?.ID ?? note?.id}
                        onClick={() => navigate(`/note?id=${note?.ID ?? note?.id}`, { state: { entry: note } })}
                        className="w-full group flex items-center gap-3 py-2.5 px-3 rounded-md hover:bg-[rgb(var(--surface))] transition-colors text-left"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--copy-muted))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span className="flex-1 min-w-0 text-[13px] text-[rgb(var(--copy-primary))] truncate">{title}</span>
                        {isFav && <FaStar className="text-[10px] text-[rgb(var(--accent))] flex-shrink-0" />}
                        {chapterName && (
                          <span className="text-[11px] text-[rgb(var(--copy-muted))] flex-shrink-0 max-w-[100px] truncate">
                            {chapterName}
                          </span>
                        )}
                        <span className="text-[11px] text-[rgb(var(--copy-muted))] flex-shrink-0">{updated ? formatDate(updated) : ""}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notebooks */}
            {notebooks.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[11px] font-semibold text-[rgb(var(--copy-muted))] uppercase tracking-wider">Notebooks</h2>
                  <button onClick={() => navigate("/notebooks")} className="text-[11px] text-[rgb(var(--cta))] hover:text-[rgb(var(--cta-active))] transition-colors">
                    View all
                  </button>
                </div>
                <div>
                  {notebooks.map((ch) => {
                    const id = ch?.ID ?? ch?.id;
                    const title = ch?.Title ?? ch?.title ?? "Untitled";
                    const color = ch?.Color ?? ch?.color;
                    const isFav = ch?.IsFavourite ?? ch?.is_favourite;
                    const noteCount = (ch?.Entries || []).filter((e: any) => !(e.IsArchived ?? e.is_archived)).length;
                    return (
                      <button
                        key={id}
                        onClick={() => navigate(`/notebook?id=${id}`, { state: { chapter: ch } })}
                        className="w-full group flex items-center gap-3 py-2.5 px-3 rounded-md hover:bg-[rgb(var(--surface))] transition-colors text-left"
                      >
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color || "rgb(var(--copy-muted))" }} />
                        <span className="flex-1 min-w-0 text-[13px] text-[rgb(var(--copy-primary))] truncate capitalize">{title}</span>
                        {isFav && <FaStar className="text-[10px] text-[rgb(var(--accent))] flex-shrink-0" />}
                        <span className="text-[11px] text-[rgb(var(--copy-muted))] flex-shrink-0">
                          {noteCount} {noteCount === 1 ? "note" : "notes"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {notes.length === 0 && notebooks.length === 0 && (
              <div className="text-center py-16">
                <p className="text-sm text-[rgb(var(--copy-muted))]">No notes yet. Start writing to capture your thoughts.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
