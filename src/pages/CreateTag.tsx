import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createCollection } from "../APIs";
import toast from "react-hot-toast";

const COLORS = [
  "#FF5722", "#007BFF", "#28A745", "#DC3545",
  "#6F42C1", "#6C757D", "#ADBE98", "#f4a261",
];

const CreateCollection: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState(typeof location.state === "string" ? location.state : "");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isCreating, setIsCreating] = useState(false);
  const colorRef = useRef<HTMLInputElement>(null);

  const handleCreate = async () => {
    if (!name.trim() || isCreating) return;
    setIsCreating(true);
    try {
      const result = await createCollection({ name: name.trim(), color: selectedColor, slug: null });
      if (typeof result === "string" || result instanceof Error) {
        toast.error(typeof result === "string" ? result : "Failed to create tag");
        setIsCreating(false);
      } else {
        toast.success(`"${name.trim()}" created`);
        navigate("/tags");
      }
    } catch {
      toast.error("Something went wrong");
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-primary))] transition-colors mb-8"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Tags
        </button>

        <h1 className="text-xl font-semibold text-[rgb(var(--copy-primary))] mb-10">New Tag</h1>

        {/* Color row */}
        <div className="flex items-center gap-1.5 mb-8">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setSelectedColor(c)}
              className={`w-6 h-6 rounded-full transition-all hover:scale-110 ${selectedColor === c ? "ring-2 ring-[rgb(var(--cta))] ring-offset-1 ring-offset-[rgb(var(--background))]" : ""}`}
              style={{ backgroundColor: c }}
            />
          ))}
          <div className="relative ml-1">
            <input
              ref={colorRef}
              type="color"
              value={selectedColor}
              onChange={e => setSelectedColor(e.target.value)}
              className="absolute inset-0 w-6 h-6 opacity-0 cursor-pointer"
            />
            <button
              onClick={() => colorRef.current?.click()}
              className="w-6 h-6 rounded-full border border-dashed border-[rgb(var(--copy-muted))] flex items-center justify-center text-[rgb(var(--copy-muted))] hover:scale-110 transition-transform text-[8px]"
            >
              +
            </button>
          </div>
        </div>

        {/* Name input */}
        <input
          type="text"
          placeholder="Tag name..."
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleCreate(); }}
          autoFocus
          className="mb-4 w-full border-none bg-transparent text-3xl font-medium outline-none text-[rgb(var(--copy-primary))] placeholder:opacity-30"
        />

        {/* Preview */}
        {name.trim() && (
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedColor }} />
            <span className="text-sm text-[rgb(var(--copy-secondary))] capitalize">{name.trim()}</span>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 flex items-center justify-between border-t border-[rgb(var(--border))]/50 pt-5">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm text-[rgb(var(--copy-secondary))] hover:opacity-70 transition-colors"
            disabled={isCreating}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {isCreating && (
              <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {isCreating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCollection;
