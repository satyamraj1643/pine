import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaFileAlt,
  FaClock,
  FaEllipsisH,
  FaStar,
} from "react-icons/fa";
import toast from "react-hot-toast";
import emoji from "emoji-datasource/emoji.json"
// Emoji utility function
const getEmojiFromShortcode = (shortcode) => {
  const emojiData = emoji.find((e) => e.short_name === shortcode);
  if (emojiData && emojiData.unified) {
    return String.fromCodePoint(parseInt(emojiData.unified, 16));
  }
  return "😐";
};

// Format date utility
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
    // @ts-ignore
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  } else if (diffInMinutes < 10080) {
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
};



const EntryView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const entry = location.state?.entry || [];
  console.log("entry in view", entry)
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleView = () => {
    // Since we're already in EntryView, this could refresh or navigate to itself
    
    setShowMenu(false);
  };

  if (!entry) {
    return (
      <div className="min-h-screen px-4 py-8 bg-[rgb(var(--background))]">
        <div className="max-w-3xl mx-auto text-center py-12">
          <div className="relative inline-block mb-4">
            <div className="absolute -top-1 -left-1 w-full h-full bg-[rgb(var(--accent-subtle))] rounded-full transform rotate-12 opacity-60"></div>
            <div className="relative p-4 rounded-full bg-[rgb(var(--card))] shadow-sm border border-[rgb(var(--border))]">
              <FaFileAlt className="text-xl text-[rgb(var(--cta))]" />
            </div>
          </div>
          <h2 className="text-lg font-serif text-[rgb(var(--copy-primary))] mb-2">Entry Not Found</h2>
          <p className="text-[rgb(var(--copy-secondary))] text-sm mb-4">
            The entry you're looking for doesn't exist or couldn't be loaded.
          </p>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-[rgb(var(--card))] text-[rgb(var(--copy-primary))] hover:bg-[rgb(var(--surface))] hover:text-[rgb(var(--cta))] rounded-lg border border-[rgb(var(--border))]"
            aria-label="Go back"
          >
            <FaArrowLeft size={14} />
            <span className="font-medium">Back to Chapter</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg bg-[rgb(var(--card))] text-[rgb(var(--copy-primary))] hover:bg-[rgb(var(--surface))] hover:text-[rgb(var(--cta))] transition-all duration-200 border border-[rgb(var(--border))]"
              aria-label="Go back"
            >
              <FaArrowLeft size={14} />
            </button>
            <div
              className="p-2 rounded-lg shadow-sm border border-[rgb(var(--border))]"
              style={{ backgroundColor: `${entry.chapter.color}20` }}
            >
              <FaFileAlt className="text-sm" style={{ color: entry.chapter.color }} />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-serif text-[rgb(var(--copy-primary))] font-semibold capitalize">
                {entry.title}
              </h1>
              <p className="text-[rgb(var(--copy-secondary))] text-sm">
                {entry.chapter.name}
              </p>
            </div>
            {/* Mood Emoji Display */}
            {entry.mood && (
              <div 
                className="p-2 rounded-full shadow-sm border border-[rgb(var(--border))] text-lg"
                style={{ backgroundColor: `${entry.mood.color}20` }}
                title={`Mood: ${entry.mood.name}`}
              >
                {getEmojiFromShortcode(entry.mood.emoji)}
              </div>
            )}
            {entry.is_favourite && (
              <FaStar className="text-xs text-[rgb(var(--accent))]" />
            )}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded hover:bg-[rgb(var(--surface))] transition-all duration-200"
                aria-label="Entry options"
              >
                <FaEllipsisH className="text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-primary))] text-xs" />
              </button>
              {showMenu && (
                <div
                  className="absolute right-0 top-full mt-1 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg shadow-md p-2 z-20 min-w-[140px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={handleView}
                    className="flex items-center gap-2 px-2 py-1 text-xs w-full hover:bg-[rgb(var(--surface))] text-[rgb(var(--copy-primary))] rounded"
                    aria-label="View entry"
                  >
                    <FaFileAlt className="text-[rgb(var(--copy-muted))]" /> View Entry
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Entry Card */}
        <div
          className="rounded-xl overflow-hidden bg-[rgb(var(--card))] transition-all duration-200 border border-[rgb(var(--border))] shadow-sm"
          style={{ backgroundColor: `${entry.chapter.color}15` }}
        >
          {/* Color accent bar*/}
          <div 
            className="h-1.5"
            style={{ backgroundColor: entry.chapter.color }} 
          />

          {/* Content Section */}
          <div className="p-3 bg-[rgb(var(--card))]">
            {/* Mood indicator at top of content */}
            {entry.mood && (
              <div className="flex items-center gap-2 mb-3 p-2 rounded-lg" style={{ backgroundColor: `${entry.mood.color}10` }}>
                <span className="text-lg">{getEmojiFromShortcode(entry.mood.emoji)}</span>
                <span className="text-xs font-medium text-[rgb(var(--copy-secondary))]" style={{ color: entry.mood.color }}>
                  Feeling {entry.mood.name}
                </span>
              </div>
            )}

            <div className="text-sm text-[rgb(var(--copy-primary))] leading-relaxed whitespace-pre-wrap">
              {entry.content}
            </div>

            {/* Collection (Tags) */}
            {entry.tags?.length > 0 && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-1">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-1.5 py-0.5 text-xs font-medium rounded-full text-[rgb(var(--cta-text))]"
                      style={{ backgroundColor: tag.color }}
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 flex justify-between items-center border-t border-[rgb(var(--border))]">
            <div className="flex items-center gap-2 text-[rgb(var(--copy-muted))] text-xs">
              <FaClock className="text-xs" />
              <span>Updated {formatDate(entry.lastModified)}</span>
              {entry.createdAt !== entry.lastModified && (
                <span className="text-[rgb(var(--copy-muted))]">
                  • Created {formatDate(entry.createdAt)}
                </span>
              )}
              {/* Read time and word count */}
              <span className="text-[rgb(var(--copy-muted))]">
                • {entry.readTime} • {entry.wordCount} words
              </span>
            </div>
            <div className="flex items-center gap-1 text-[rgb(var(--copy-muted))] text-xs">
              {entry.mood && (
                <span 
                  className="px-1.5 py-0.5 text-xs font-medium rounded-full flex items-center gap-1"
                  style={{ backgroundColor: `${entry.mood.color}20`, color: entry.mood.color }}
                >
                  {getEmojiFromShortcode(entry.mood.emoji)}
                  <span>{entry.mood.name}</span>
                </span>
              )}
              {entry.collection?.length > 0 && (
                <span
                  className="px-1.5 py-0.5 text-xs font-medium rounded-full text-[rgb(var(--cta-text))]"
                  style={{ backgroundColor: entry.collection[0].color }}
                >
                  #{entry.collection[0].name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryView;