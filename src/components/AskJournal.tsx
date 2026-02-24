import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AIAsk } from "../APIs";

export function AskJournal() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<{ q: string; a: string }[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Global shortcut: Cmd+J
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuestion("");
      setAnswer("");
      setError("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  // Scroll to bottom when new answer arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, answer, loading]);

  const handleAsk = async () => {
    const q = question.trim();
    if (!q || loading) return;

    setLoading(true);
    setError("");
    setAnswer("");

    const res = await AIAsk(q);
    setLoading(false);

    if (res.answer) {
      setHistory((prev) => [...prev, { q, a: res.answer! }]);
      setQuestion("");
    } else {
      setError(res.error || "Something went wrong");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  const isMac = navigator.platform?.toUpperCase().includes("MAC");
  const modKey = isMac ? "\u2318" : "Ctrl";

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh]"
      onClick={() => setIsOpen(false)}
      style={{ animation: "cp-fade-in 150ms ease-out" }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-lg mx-4 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "cp-scale-in 150ms ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[rgb(var(--border))]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[rgb(var(--copy-muted))] flex-shrink-0">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <span className="text-sm font-medium text-[rgb(var(--copy-primary))]">Search your journal</span>
          <span className="ml-auto text-[10px] text-[rgb(var(--copy-muted))]">{modKey}+J</span>
        </div>

        {/* Conversation area */}
        <div ref={scrollRef} className="max-h-[45vh] overflow-y-auto overscroll-contain px-4 py-4 space-y-4">
          {history.length === 0 && !loading && (
            <div className="text-center py-6">
              <p className="text-sm text-[rgb(var(--copy-muted))] mb-3">
                Ask anything about your past entries
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {["When did I last feel happy?", "What did I write about this month?", "What are my recurring themes?"].map((ex) => (
                  <button
                    key={ex}
                    onClick={() => { setQuestion(ex); inputRef.current?.focus(); }}
                    className="px-3 py-1.5 text-xs rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface))] text-[rgb(var(--copy-secondary))] hover:text-[rgb(var(--copy-primary))] hover:border-[rgb(var(--cta))]/30 transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {history.map((item, i) => (
            <div key={i} className="space-y-2.5">
              {/* User question */}
              <div className="flex justify-end">
                <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-br-md bg-[rgb(var(--cta))]/10 text-sm text-[rgb(var(--copy-primary))]">
                  {item.q}
                </div>
              </div>
              {/* AI answer */}
              <div className="flex justify-start">
                <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-[rgb(var(--surface))] text-sm text-[rgb(var(--copy-secondary))] leading-relaxed">
                  {item.a}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-[rgb(var(--surface))]">
                <div className="w-3.5 h-3.5 border-2 border-[rgb(var(--cta))]/30 border-t-[rgb(var(--cta))] rounded-full animate-spin" />
                <span className="text-sm text-[rgb(var(--copy-muted))]">Searching your journal...</span>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-[rgb(var(--error))] text-center">{error}</p>
          )}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-[rgb(var(--border))]">
          <input
            ref={inputRef}
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            disabled={loading}
            className="flex-1 bg-transparent text-sm text-[rgb(var(--copy-primary))] placeholder:text-[rgb(var(--copy-muted))] outline-none disabled:opacity-50"
          />
          <button
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] hover:bg-[rgb(var(--cta-active))] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Ask
          </button>
        </div>
      </div>

      <style>{`
        @keyframes cp-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cp-scale-in {
          from { opacity: 0; transform: scale(0.96) translateY(-8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
}

export default AskJournal;
