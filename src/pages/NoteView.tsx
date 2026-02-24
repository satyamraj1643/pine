import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { FaHeart, FaEdit, FaTrash } from "react-icons/fa";
import { formatDate } from "../utilities/formatDate";
import { getEmojiFromShortcode } from "../utilities/emoji";
import { countWords, estimateReadTime } from "../utilities/text";
import { DeleteEntry, FavouriteEntry, AIChat, GetAllEntries } from "../APIs";
import type { ChatMessage } from "../APIs";
import toast from "react-hot-toast";
import ConfirmModal from "../components/ConfirmModal";

function r<T>(...c: (T | undefined | null)[]): T | undefined {
  return c.find((v) => v !== undefined && v !== null) as T | undefined;
}

// ─── Chat ────────────────────────────────────────────────

function ChatMessages({ messages, loading, scrollRef }: { messages: ChatMessage[]; loading: boolean; scrollRef: React.RefObject<HTMLDivElement> }) {
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, loading]);
  return (
    <div ref={scrollRef as React.RefObject<HTMLDivElement>} className="max-h-[300px] overflow-y-auto overscroll-contain px-3 py-3 space-y-2.5">
      {messages.filter(m => m.role !== "user" || m.text !== "Hey, I just wrote this. What do you think?").map((msg, i) => (
        <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
          <div className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed ${msg.role === "user" ? "rounded-2xl rounded-br-md bg-[rgb(var(--cta))]/10 text-[rgb(var(--copy-primary))]" : "rounded-2xl rounded-bl-md bg-[rgb(var(--surface))] text-[rgb(var(--copy-secondary))]"}`}>{msg.text}</div>
        </div>
      ))}
      {loading && (
        <div className="flex justify-start">
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-[rgb(var(--surface))]">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--copy-muted))] animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--copy-muted))] animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--copy-muted))] animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────

const EntryView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const stateEntry = location.state?.entry;
  const urlId = searchParams.get("id");

  const [entry, setEntry] = useState<any>(stateEntry || null);
  const [isLoadingEntry, setIsLoadingEntry] = useState(!stateEntry && !!urlId);
  const [isFav, setIsFav] = useState<boolean | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Fetch entry by ID when location.state is missing
  useEffect(() => {
    if (stateEntry || !urlId) return;
    let cancelled = false;
    setIsLoadingEntry(true);
    (async () => {
      try {
        const res = await GetAllEntries();
        if (cancelled) return;
        if (res && Array.isArray(res.data)) {
          const found = res.data.find((e: any) => String(e.ID ?? e.id) === urlId);
          if (found) { setEntry(found); }
        }
      } catch {
        if (!cancelled) toast.error("Failed to load note");
      } finally {
        if (!cancelled) setIsLoadingEntry(false);
      }
    })();
    return () => { cancelled = true; };
  }, [stateEntry, urlId]);

  if (isLoadingEntry) {
    return (
      <div className="min-h-screen bg-[rgb(var(--background))]">
        <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse">
          <div className="h-4 w-16 bg-[rgb(var(--surface))] rounded mb-8" />
          <div className="h-8 w-2/3 bg-[rgb(var(--surface))] rounded mb-3" />
          <div className="flex gap-3 mb-8">
            <div className="h-3 w-20 bg-[rgb(var(--surface))] rounded" />
            <div className="h-3 w-16 bg-[rgb(var(--surface))] rounded" />
          </div>
          <div className="space-y-3">
            <div className="h-4 w-full bg-[rgb(var(--surface))] rounded" />
            <div className="h-4 w-5/6 bg-[rgb(var(--surface))] rounded" />
            <div className="h-4 w-4/5 bg-[rgb(var(--surface))] rounded" />
            <div className="h-4 w-2/3 bg-[rgb(var(--surface))] rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[rgb(var(--background))]">
        <p className="text-sm text-[rgb(var(--copy-secondary))] mb-4">Note not found</p>
        <button onClick={() => navigate("/notes")} className="text-sm text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-primary))] transition-colors">Go back</button>
      </div>
    );
  }

  const title: string = r(entry.title, entry.Title) ?? "Untitled";
  const content: string = r(entry.content, entry.Content) ?? "";
  const chapter = entry.chapter ?? entry.Chapter;
  const mood = entry.mood ?? entry.Mood;
  const moods: any[] = Array.isArray(entry.Moods ?? entry.moods) ? (entry.Moods ?? entry.moods) : (mood ? [mood] : []);
  const entryFav = r(entry.is_favourite, entry.IsFavourite) ?? false;
  const isFavourite = isFav !== null ? isFav : entryFav;
  const updatedAt = r(entry.updated_at, entry.UpdatedAt);
  const entryId = r(entry.id, entry.ID);

  const sendChat = (msgs: ChatMessage[]) => {
    setChatLoading(true);
    setChatError(null);
    AIChat(title, content, msgs)
      .then(res => {
        setChatLoading(false);
        if (res.reply) {
          setChatMessages(p => [...p, { role: "model", text: res.reply! }]);
        } else {
          setChatError("No response received");
        }
      })
      .catch(() => {
        setChatLoading(false);
        setChatError("Failed to get a response. Try again.");
      });
  };

  const handleDeleteConfirm = async () => {
    if (!entryId) return;
    setIsDeleting(true);
    const ok = await DeleteEntry(Number(entryId));
    setIsDeleting(false);
    if (ok) {
      toast.success("Note deleted");
      setShowDeleteModal(false);
      navigate("/notes");
    } else {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate("/notes")} className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-primary))] transition-colors">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Notes
          </button>
          <div className="flex items-center gap-1">
            <button onClick={async () => { if (!entryId) return; const nv = !isFavourite; const ok = await FavouriteEntry(Number(entryId), nv); if (ok) { setIsFav(nv); toast.success(nv ? "Added to favorites" : "Removed from favorites"); } }} aria-label={isFavourite ? "Remove from favorites" : "Add to favorites"} className="p-2 rounded-lg hover:bg-[rgb(var(--surface))] transition-colors">
              <FaHeart size={14} className={isFavourite ? "text-[rgb(var(--accent))]" : "text-[rgb(var(--copy-muted))]"} />
            </button>
            <button onClick={() => navigate("/new-note", { state: { ...entry, update: true, id: entryId } })} aria-label="Edit note" className="p-2 rounded-lg hover:bg-[rgb(var(--surface))] transition-colors">
              <FaEdit size={14} className="text-[rgb(var(--copy-muted))]" />
            </button>
            <button onClick={() => setShowDeleteModal(true)} aria-label="Delete note" className="p-2 rounded-lg hover:bg-[rgb(var(--surface))] transition-colors">
              <FaTrash size={13} className="text-[rgb(var(--copy-muted))]" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-[rgb(var(--copy-primary))] leading-snug capitalize mb-3">{title}</h1>

        {/* Meta — only what's useful */}
        <div className="flex items-center gap-3 text-xs text-[rgb(var(--copy-muted))] mb-8">
          {chapter && <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: chapter.color ?? chapter.Color }} />{chapter.name ?? chapter.title ?? chapter.Title}</span>}
          {moods.length > 0 && moods.map((m: any, i: number) => <span key={i} className="inline-flex items-center gap-1">{getEmojiFromShortcode(m.emoji ?? m.Emoji)} {m.name ?? m.Name}</span>)}
          {updatedAt && <span>{formatDate(updatedAt)}</span>}
        </div>

        {/* Content */}
        <article className="pine-editor text-[rgb(var(--copy-primary))] text-base leading-[1.8] mb-10" dangerouslySetInnerHTML={{ __html: content }} />

        {/* Talk about this */}
        <div className="mb-6">
          {!chatOpen ? (
            <button onClick={() => { setChatOpen(true); if (chatMessages.length === 0) { const opener: ChatMessage = { role: "user", text: "Hey, I just wrote this. What do you think?" }; setChatMessages([opener]); sendChat([opener]); } setTimeout(() => chatInputRef.current?.focus(), 100); }} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-[rgb(var(--border))] text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-secondary))] hover:border-[rgb(var(--copy-muted))]/40 transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
              Talk about this
            </button>
          ) : (
            <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[rgb(var(--border))]">
                <span className="text-xs font-medium text-[rgb(var(--copy-muted))] uppercase tracking-wider">Chat</span>
                <button onClick={() => setChatOpen(false)} className="p-1 rounded hover:bg-[rgb(var(--surface))] transition-colors text-[rgb(var(--copy-muted))]" aria-label="Close chat">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
              <ChatMessages messages={chatMessages} loading={chatLoading} scrollRef={chatScrollRef} />
              {chatError && (
                <div className="px-3 py-2 text-xs text-[rgb(var(--error))]">{chatError}</div>
              )}
              <div className="flex items-center gap-2 px-3 py-2 border-t border-[rgb(var(--border))]">
                <input ref={chatInputRef} type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && chatInput.trim() && !chatLoading) { e.preventDefault(); const msg: ChatMessage = { role: "user", text: chatInput.trim() }; const upd = [...chatMessages, msg]; setChatMessages(upd); setChatInput(""); sendChat(upd); } }} placeholder="Say something..." disabled={chatLoading} className="flex-1 bg-transparent text-sm text-[rgb(var(--copy-primary))] placeholder:text-[rgb(var(--copy-muted))] outline-none disabled:opacity-50" />
                <button onClick={() => { if (!chatInput.trim() || chatLoading) return; const msg: ChatMessage = { role: "user", text: chatInput.trim() }; const upd = [...chatMessages, msg]; setChatMessages(upd); setChatInput(""); sendChat(upd); }} disabled={chatLoading || !chatInput.trim()} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] disabled:opacity-30 transition-opacity">Send</button>
              </div>
            </div>
          )}
        </div>
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete note"
          message="This action cannot be undone. The note will be permanently deleted."
          itemName={title}
          isProcessing={isDeleting}
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </div>
  );
};

export default EntryView;
