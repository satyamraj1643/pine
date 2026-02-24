import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FaSearch, FaEllipsisH, FaStar, FaRegStar, FaEdit, FaArchive, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { GetAllChapter, ArchiveChapter, DeleteChapter, FavouriteChapter } from "../APIs";
import toast from "react-hot-toast";
import { formatDate } from "../utilities/formatDate";
import ConfirmModal from "../components/ConfirmModal";
import EmptyState from "../components/EmptyState";
import { SmartDropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator } from "../components/SmartDropdown";

interface ChapterData { ID: number; Title: string; Description: string; Color: string; Entries: any[]; Collections: any[] | null; IsFavourite: boolean; IsArchived: boolean; UpdatedAt: string; }

export default function Chapters() {
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [confirm, setConfirm] = useState<{ open: boolean; chapter: ChapterData | null; processing: boolean }>({ open: false, chapter: null, processing: false });

  const fetch_ = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await GetAllChapter();
      if (res && Array.isArray(res.data)) setChapters(res.data.filter((c: ChapterData) => !c.IsArchived));
      else setChapters([]);
    } catch { setChapters([]); toast.error("Failed to load notebooks"); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const filtered = useMemo(() => {
    let r = chapters;
    if (search.trim()) { const q = search.toLowerCase(); r = r.filter(c => c.Title.toLowerCase().includes(q) || (c.Description || "").toLowerCase().includes(q)); }
    return r.sort((a, b) => new Date(b.UpdatedAt).getTime() - new Date(a.UpdatedAt).getTime());
  }, [chapters, search]);

  const INITIAL = 15;
  const visible = showAll || search.trim() ? filtered : filtered.slice(0, INITIAL);
  const hasMore = !showAll && !search.trim() && filtered.length > INITIAL;

  const confirmAction = async () => {
    if (!confirm.chapter) return;
    setConfirm(p => ({ ...p, processing: true }));
    const ok = await DeleteChapter(confirm.chapter.ID);
    if (ok) { toast.success("Notebook deleted"); fetch_(); }
    else toast.error("Failed to delete notebook");
    setConfirm({ open: false, chapter: null, processing: false });
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <ConfirmModal isOpen={confirm.open} onClose={() => !confirm.processing && setConfirm({ open: false, chapter: null, processing: false })} onConfirm={confirmAction} title="Delete Notebook" message="This notebook and all its notes will be permanently deleted." itemName={confirm.chapter?.Title || ""} isProcessing={confirm.processing} confirmText="Delete" variant="danger" />

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-baseline justify-between mb-8">
          <h1 className="text-xl font-semibold text-[rgb(var(--copy-primary))]">
            Notebooks
            {!isLoading && chapters.length > 0 && <span className="text-sm font-normal text-[rgb(var(--copy-muted))] ml-2">{chapters.length}</span>}
          </h1>
          <button onClick={() => navigate("/new-notebook")} className="p-1 rounded-md text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-secondary))] hover:bg-[rgb(var(--surface))] transition-colors" aria-label="Create new notebook">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>

        {!isLoading && chapters.length > 3 && (
          <div className="mb-6">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--copy-muted))] text-[11px]" />
              <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-8 pr-3 py-1.5 bg-transparent border border-[rgb(var(--border))] rounded-lg text-sm text-[rgb(var(--copy-primary))] placeholder-[rgb(var(--copy-muted))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--cta))] transition-colors" />
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-1">{Array.from({ length: 5 }, (_, i) => <div key={i} className="flex items-center gap-3 py-2.5 px-3 animate-pulse"><div className="w-3 h-3 bg-[rgb(var(--surface))] rounded" /><div className="h-4 bg-[rgb(var(--surface))] rounded w-1/3" /><div className="h-3 bg-[rgb(var(--surface))] rounded w-14 ml-auto" /></div>)}</div>
        ) : visible.length > 0 ? (
          <div>
            {visible.map(ch => <NotebookRow key={ch.ID} chapter={ch} navigate={navigate} onRefresh={fetch_} onConfirm={setConfirm} />)}
            {hasMore && <button onClick={() => setShowAll(true)} className="w-full py-3 mt-2 text-sm text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-secondary))] transition-colors">Show all {filtered.length} notebooks</button>}
          </div>
        ) : (
          <EmptyState title={search.trim() ? "No matching notebooks" : "No notebooks yet"} description={search.trim() ? "Try a different search." : "Create a notebook to organize your notes."} action={!search.trim() ? <button onClick={() => navigate("/new-notebook")} className="flex items-center gap-1.5 text-sm text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-secondary))] transition-colors mt-2"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>Create your first notebook</button> : undefined} />
        )}
      </div>
    </div>
  );
}

function NotebookRow({ chapter, navigate, onRefresh, onConfirm }: { chapter: ChapterData; navigate: any; onRefresh: () => void; onConfirm: any }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const noteCount = (chapter.Entries || []).filter(e => !e.IsArchived).length;

  const toggleFav = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (favLoading) return;
    setFavLoading(true);
    const ok = await FavouriteChapter(chapter.ID, !chapter.IsFavourite);
    if (ok) { toast.success(chapter.IsFavourite ? "Removed from favorites" : "Added to favorites"); onRefresh(); }
    setFavLoading(false);
  };

  return (
    <div className="group flex items-center gap-3 py-2 px-3 -mx-3 rounded-lg cursor-pointer hover:bg-[rgb(var(--surface))] transition-colors" onClick={() => navigate(`/notebook?id=${chapter.ID}`, { state: { chapter } })}>
      <div className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: chapter.Color || "rgb(var(--copy-muted))" }} />
      <span className="flex-1 min-w-0 text-sm text-[rgb(var(--copy-primary))] truncate capitalize">{chapter.Title}</span>
      {chapter.IsFavourite && <FaStar className="text-[10px] text-[rgb(var(--accent))] flex-shrink-0" />}
      <span className="text-xs text-[rgb(var(--copy-muted))] flex-shrink-0">{noteCount} {noteCount === 1 ? "note" : "notes"}</span>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={e => e.stopPropagation()}>
        <button onClick={toggleFav} className="p-1 rounded hover:bg-[rgb(var(--border))]/50 transition-colors" aria-label={chapter.IsFavourite ? "Remove from favorites" : "Add to favorites"}>
          {chapter.IsFavourite ? <FaStar className="text-[10px] text-[rgb(var(--accent))]" /> : <FaRegStar className="text-[10px] text-[rgb(var(--copy-muted))]" />}
        </button>
        <SmartDropdown open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownTrigger><button className="p-1 rounded hover:bg-[rgb(var(--border))]/50 transition-colors" aria-label="More actions"><FaEllipsisH className="text-[10px] text-[rgb(var(--copy-muted))]" /></button></DropdownTrigger>
          <DropdownContent title="Actions" align="end">
            <DropdownItem onClick={() => { setMenuOpen(false); navigate("/new-notebook", { state: { edit: true, id: chapter.ID, title: chapter.Title, description: chapter.Description, color: chapter.Color, entries: chapter.Entries, collection: chapter.Collections } }); }}><FaEdit className="text-xs" style={{ color: "rgb(var(--copy-muted))" }} /><span>Edit</span></DropdownItem>
            <DropdownItem onClick={async () => { setMenuOpen(false); const ok = await ArchiveChapter(chapter.ID, true); if (ok) { toast.success("Notebook archived"); onRefresh(); } else toast.error("Failed to archive"); }}><FaArchive className="text-xs" style={{ color: "rgb(var(--copy-muted))" }} /><span>Archive</span></DropdownItem>
            <DropdownSeparator />
            <DropdownItem destructive onClick={() => { setMenuOpen(false); onConfirm({ open: true, chapter, processing: false }); }}><FaTrash className="text-xs" /><span>Delete</span></DropdownItem>
          </DropdownContent>
        </SmartDropdown>
      </div>
    </div>
  );
}
