import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFileAlt,
  FaTag,
  FaBookOpen,
  FaClock,
  FaPlusCircle,
  FaHeart,
  FaCalendarAlt,
  FaQuoteLeft,
  FaStar,
  FaSmile,
  FaGrin,
  FaMeh,
  FaArrowRight,
  FaArchive,
  FaCopy,
  FaPlus,
} from "react-icons/fa";
import { GetAllEntries, GetAllCollections, GetAllChapter } from "../APIs";
import emoji from "emoji-datasource/emoji.json";
import { FaPenNib } from "react-icons/fa6";

// Mood options matching CreateEntry.tsx
const moodOptions = [
  { id: "happy", icon: FaGrin, label: "Happy", color: "rgb(var(--warning))" },
  {
    id: "peaceful",
    icon: FaSmile,
    label: "Peaceful",
    color: "rgb(var(--success))",
  },
  {
    id: "contemplative",
    icon: FaMeh,
    label: "Contemplative",
    color: "rgb(var(--copy-muted))",
  },
];

const initialTopics = [
  {
    id: 1,
    title: "Daily Gratitude",
    entries: [
      {
        id: "entry-1",
        title: "Morning Reflections",
        content: "Today started with the most beautiful sunrise...",
        createdAt: "2024-06-15T08:30:00Z",
        wordCount: 150,
        tags: [{ name: "morning", color: "rgb(var(--warning))" }],
        mood: "peaceful",
      },
    ],
    isFavorite: true,
    color: "rgb(var(--accent))",
    entryCount: 1,
    createdAt: "2024-06-15T08:00:00Z",
    lastModified: "2024-06-15T08:30:00Z",
    mood: "peaceful",
  },
  {
    id: 2,
    title: "Creative Projects",
    entries: [
      {
        id: "entry-2",
        title: "Weekend Adventures",
        content: "Explored the local farmers market today...",
        createdAt: "2024-06-14T16:45:00Z",
        wordCount: 250,
        tags: [{ name: "travel", color: "rgb(var(--cta))" }],
        mood: "happy",
      },
    ],
    isFavorite: false,
    color: "rgb(var(--copy-secondary))",
    entryCount: 1,
    createdAt: "2024-06-14T16:00:00Z",
    lastModified: "2024-06-14T16:45:00Z",
    mood: "happy",
  },
  {
    id: 3,
    title: "Life Lessons",
    entries: [
      {
        id: "entry-3",
        title: "Learning Journey",
        content: "Started reading a fascinating book about mindfulness...",
        createdAt: "2024-06-13T20:15:00Z",
        wordCount: 200,
        tags: [{ name: "mindfulness", color: "rgb(var(--success))" }],
        mood: "contemplative",
      },
    ],
    isFavorite: true,
    color: "rgb(var(--success))",
    entryCount: 1,
    createdAt: "2024-06-13T20:00:00Z",
    lastModified: "2024-06-13T20:15:00Z",
    mood: "contemplative",
  },
];

// Helper function to get text color based on background
const getTextColor = (backgroundColor: string): string => {
  if (
    backgroundColor.includes("--background") ||
    backgroundColor.includes("--surface") ||
    backgroundColor.includes("--card")
  ) {
    return "rgb(var(--copy-primary))";
  }
  if (
    backgroundColor.includes("--copy-primary") ||
    backgroundColor.includes("--copy-secondary")
  ) {
    return "rgb(var(--cta-text))";
  }
  return "rgb(var(--cta-text))";
};

// Utility function to format dates
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h ago`;
  } else if (diffInMinutes < 10080) {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days}d ago`;
  } else {
    // Format as "22 June 2025"
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
};

const getEmojiFromShortcode = (shortcode) => {
  const emojiData = emoji.find((e) => e.short_name === shortcode);
  if (emojiData && emojiData.unified) {
    return String.fromCodePoint(parseInt(emojiData.unified, 16));
  }
  return "😐";
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [chapters, setChapter] = useState([]);
  const [recentEntries, setRecentEntries] = useState([]);

  const favoriteEntriesCount = recentEntries.filter(
    (entry) => entry?.is_favourite
  ).length;
  const favoriteChaptersCount = chapters.filter(
    (topic) => topic?.is_favourite
  ).length;
  const archivedEntriesCount = recentEntries.filter(
    (entry) => entry?.is_archived
  ).length;
  const archivedChaptersCount = chapters.filter(
    (topic) => topic?.is_archived
  ).length;

  const totalEntriesCount = recentEntries.length;
  const totalChaptersCount = initialTopics.length;

  const getHomeDetails = async () => {
    const recentEntriesRequest = await GetAllEntries();
    const collections = await GetAllCollections();
    const chapters = await GetAllChapter();

    if (recentEntriesRequest.fetched) {
      const slicedEntries = recentEntriesRequest.data.slice(0, 3);
      console.log("in home", slicedEntries);
      setRecentEntries(slicedEntries);
    }

    if (collections?.data) {
      console.log("in getting collections", collections?.data);
      setCollections(collections?.data);
    }
    if (chapters?.fetched) {
      console.log("in get chapters", chapters?.data);

      setChapter(chapters?.data);
    }
  };

  useEffect(() => {
    getHomeDetails();
  }, []);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "rgb(var(--background))" }}
    >
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="p-2 rounded-lg shadow-sm border"
              style={{
                backgroundColor: "rgba(var(--warning), 0.1)",
                borderColor: "rgba(var(--warning), 0.2)",
              }}
            >
              <FaPlusCircle
                className="text-lg"
                style={{ color: "rgb(var(--warning))" }}
              />
            </div>
            <div>
              <h1
                className="text-xl font-serif font-semibold"
                style={{ color: "rgb(var(--copy-primary))" }}
              >
                Welcome Home
              </h1>
              <p
                className="text-sm flex items-center gap-2"
                style={{ color: "rgb(var(--copy-secondary))" }}
              >
                <FaCalendarAlt
                  className="text-xs"
                  style={{ color: "rgb(var(--copy-muted))" }}
                />
                {currentDate}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Tiles */}
        <section className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile
              icon={<FaFileAlt />}
              label="Total Entries"
              count={totalEntriesCount}
              onClick={() => navigate("/entries")}
              numberArchived={archivedEntriesCount}
              numberFavourite={favoriteEntriesCount}
              showArrow={false}
              showRightArrow={false}
              onArchivedClick={() => {}}
              onFavoriteClick={() => {}}
            />
            <StatTile
              icon={<FaPenNib />}
              label="Total Chapter"
              count={totalChaptersCount}
              onClick={() => navigate("/chapters")}
              numberArchived={archivedChaptersCount}
              numberFavourite={favoriteChaptersCount}
              showArrow={false}
              showRightArrow={false}
              onArchivedClick={() => {}}
              onFavoriteClick={() => {}}
            />
          </div>
        </section>

        {/* Recent Entries */}
        <section className="mb-12">
          <SectionHeader
            icon={<FaFileAlt />}
            title="Recent Reflections"
            subtitle="Your latest thoughts"
            buttonText="Write New"
            onButtonClick={() => navigate("/create-entry")}
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentEntries.map((entry, index) => (
              <EntryCard
                key={entry.id}
                entry={
                  recentEntries.filter(
                    (eachEntry) => eachEntry.id === entry.id
                  )[0]
                }
                index={index}
                navigate={navigate}
              />
            ))}
          </div>
        </section>

        {/* Memory Tags */}
        <section className="mb-12">
          <SectionHeader
            icon={<FaTag />}
            title="Memory Collection"
            subtitle="Themes in your story"
            buttonText="New Collection"
            onButtonClick={() => navigate("/create-collection")}
          />
          <div className="flex gap-3 flex-wrap">
            {collections.map((tag, index) => (
              <div
                key={tag?.id}
                className="group transform hover:scale-105 transition-all duration-200"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className="px-3 py-1.5 rounded-full text-xs font-medium shadow-sm"
                  style={{
                    backgroundColor: tag?.color,
                    color: getTextColor(tag?.color),
                  }}
                >
                  #{tag?.name}
                  <span
                    className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
                  >
                    {tag?.entries_count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Life Chapters */}
        <section className="mb-12">
          <SectionHeader
            icon={<FaBookOpen />}
            title="Life Chapters"
            subtitle="Meaningful moments"
            buttonText="New Chapter"
            onButtonClick={() => navigate("/create-chapter")}
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {chapters.map((chapter, index) => (
              <TopicCard
                key={chapter?.id}
                chapter={chapter}
                index={index}
                navigate={navigate}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const StatTile = ({
  icon,
  label,
  count,
  onClick,
  numberFavourite,
  numberArchived,
  showArrow,
  showRightArrow,
  onFavoriteClick,
  onArchivedClick,
}) => (
  <div
    className="p-4 rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer group"
    style={{
      backgroundColor: "rgb(var(--card))",
      borderColor: "rgb(var(--border))",
    }}
    onClick={onClick}
  >
    {/* Main Section */}
    <div className="flex items-center justify-between mb-3">
      <div
        className="p-2 rounded-lg"
        style={{ backgroundColor: "rgb(var(--surface))" }}
      >
        {React.cloneElement(icon as React.ReactElement, {
          //@ts-ignore
          className: "text-sm",
          style: { color: "rgb(var(--copy-muted))" },
        })}
      </div>
      {showArrow && (
        <FaArrowRight
          className="text-xs group-hover:translate-x-1 transition-transform"
          style={{ color: "rgb(var(--copy-muted))" }}
        />
      )}
    </div>

    <div
      className="text-lg font-semibold mb-1"
      style={{ color: "rgb(var(--copy-primary))" }}
    >
      {count}
    </div>

    <div
      className="text-xs mb-3"
      style={{ color: "rgb(var(--copy-secondary))" }}
    >
      {label}
    </div>

    {/* Divider - Only show if we have favorites or archived items */}
    {(numberFavourite > 0 || numberArchived > 0) && (
      <div
        className="border-t mb-3"
        style={{ borderColor: "rgb(var(--border))" }}
      />
    )}

    {/* Favorites and Archived Sections - Only show if there are items */}
    {(numberFavourite > 0 || numberArchived > 0) && (
      <div className="space-y-2">
        <div className="space-y-2">
          {/* Favorites Section - Only show if there are favorites */}
          {numberFavourite > 0 && (
            <div
              className="flex items-center justify-between p-2 rounded-lg hover:shadow-sm transition-all duration-150 cursor-pointer group/favorite"
              style={{ backgroundColor: "rgb(var(--surface))" }}
              onClick={(e) => {
                e.stopPropagation();
                onFavoriteClick?.();
              }}
            >
              <div className="flex items-center space-x-2">
                <FaHeart
                  className="text-xs"
                  style={{ color: "rgb(var(--copy-muted))" }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: "rgb(var(--copy-secondary))" }}
                >
                  Favorites
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span
                  className="text-xs font-semibold"
                  style={{ color: "rgb(var(--copy-primary))" }}
                >
                  {numberFavourite}
                </span>
                {showRightArrow && (
                  <FaArrowRight
                    className="text-xs group-hover/favorite:translate-x-0.5 transition-transform"
                    style={{ color: "rgb(var(--copy-muted))" }}
                  />
                )}
              </div>
            </div>
          )}

          {/* Archived Section - Only show if there are archived items */}
          {numberArchived > 0 && (
            <div
              className="flex items-center justify-between p-2 rounded-lg hover:shadow-sm transition-all duration-150 cursor-pointer group/archived"
              style={{ backgroundColor: "rgb(var(--surface))" }}
              onClick={(e) => {
                e.stopPropagation();
                onArchivedClick?.();
              }}
            >
              <div className="flex items-center space-x-2">
                <FaArchive
                  className="text-xs"
                  style={{ color: "rgb(var(--copy-muted))" }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: "rgb(var(--copy-secondary))" }}
                >
                  Archived
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span
                  className="text-xs font-semibold"
                  style={{ color: "rgb(var(--copy-primary))" }}
                >
                  {numberArchived}
                </span>
                {showRightArrow && (
                  <FaArrowRight
                    className="text-xs group-hover/archived:translate-x-0.5 transition-transform"
                    style={{ color: "rgb(var(--copy-muted))" }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);

// Entry Card Component

const EntryCard = ({ entry, index, navigate }) => {
  const moodIcon = getEmojiFromShortcode(entry?.mood?.emoji);

  const wordCount = entry?.content
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));
  return (
    <div
      className="group rounded-xl overflow-hidden border hover:shadow-md transition-all duration-200 cursor-pointer"
      style={{
        backgroundColor: "rgb(var(--card))",
        borderColor: "rgb(var(--border))",
        animationDelay: `${index * 100}ms`,
      }}
      onClick={() => {
        console.log("going to", entry);
        navigate("/entry-view", { state: { entry } });
      }}
    >
      <div
        className="h-1.5"
        style={{ backgroundColor: entry?.chapter?.color }}
      />
      <div className="p-4">
        <div className="mb-3">
          <div className="flex justify-between items-start">
            <h3
              className="font-serif font-semibold text-lg truncate"
              style={{ color: "rgb(var(--copy-primary))" }}
            >
              {entry.title}
            </h3>
            {entry?.is_favourite && (
              <FaStar
                className="text-xs"
                style={{ color: "rgb(var(--warning))" }}
              />
            )}
          </div>
          <div
            className="flex items-center gap-1 text-xs"
            style={{ color: "rgb(var(--copy-secondary))" }}
          >
            {moodIcon}
            <span>{entry?.mood?.name}</span>
          </div>
        </div>
        <div className="relative mb-3">
          <FaQuoteLeft
            className="text-xs mb-2"
            style={{ color: "rgb(var(--copy-muted))" }}
          />
          <p
            className="text-xs leading-relaxed line-clamp-2 pl-2 font-light"
            style={{ color: "rgb(var(--copy-secondary))" }}
          >
            {entry.content}
          </p>
        </div>
        <div
          className="flex items-center justify-between pt-2 border-t"
          style={{ borderColor: "rgb(var(--border))" }}
        >
          <div
            className="flex items-center gap-2 text-xs"
            style={{ color: "rgb(var(--copy-muted))" }}
          >
            <FaClock className="text-xs" />
            <span>{estimatedReadTime} min</span>
          </div>
          <div className="text-xs" style={{ color: "rgb(var(--copy-muted))" }}>
            {formatDate(entry?.updated_at)}
          </div>
        </div>
      </div>
    </div>
  );
};

// Topic Card Component
interface Topic {
  id: number;
  title: string;
  entries: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    wordCount: number;
    tags: { name: string; color: string }[];
    mood: string;
  }[];
  isFavorite: boolean;
  color: string;
  entryCount: number;
  createdAt: string;
  lastModified: string;
  mood: string;
}

const TopicCard = ({ chapter, index, navigate }) => (
  <div
    className="group rounded-xl overflow-hidden border hover:shadow-md transition-all duration-200 cursor-pointer"
    style={{
      backgroundColor: "rgb(var(--card))",
      borderColor: "rgb(var(--border))",
      animationDelay: `${index * 150}ms`,
    }}
    onClick={() => navigate("/chapter-view", { state: { chapter: chapter } })}
  >
    <div className="h-1.5" style={{ backgroundColor: chapter?.color }} />
    <div className="p-4">
      <div className="flex items-start gap-3 mb-3">
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: "rgb(var(--surface))" }}
        >
          <FaBookOpen
            className="text-sm"
            style={{ color: "rgb(var(--copy-muted))" }}
          />
        </div>
        <div className="flex-1 flex items-center gap-2">
          <h3
            className="font-serif font-semibold text-sm truncate"
            style={{ color: "rgb(var(--copy-primary))" }}
          >
            {chapter?.title}
          </h3>
          {chapter?.is_favourite && (
            <FaStar
              className="text-xs"
              style={{ color: "rgb(var(--warning))" }}
            />
          )}
        </div>
      </div>
      <div className="relative mb-3">
        <FaQuoteLeft
          className="text-xs mb-2"
          style={{ color: "rgb(var(--copy-muted))" }}
        />
        <p
          className="text-xs leading-relaxed line-clamp-2 pl-2 font-light"
          style={{ color: "rgb(var(--copy-secondary))" }}
        >
          {chapter?.entries[0]?.content || "Begin your new chapter here..."}
        </p>
      </div>
      <div
        className="flex items-center justify-between pt-2 border-t"
        style={{ borderColor: "rgb(var(--border))" }}
      >
        <span className="text-xs" style={{ color: "rgb(var(--copy-muted))" }}>
          {chapter.entries.length}{" "}
          {chapter.entries.length === 1 ? "entry" : "entries"}
        </span>
      </div>
    </div>
  </div>
);

// Section Header Component
interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  buttonText: string;
  onButtonClick: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  title,
  subtitle,
  buttonText,
  onButtonClick,
}) => (
  <div className="mb-6">
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-4">
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: "rgb(var(--surface))" }}
        >
          {React.cloneElement(icon as React.ReactElement, {
            //@ts-ignore
            className: "text-sm",
            style: { color: "rgb(var(--copy-muted))" },
          })}
        </div>
        <div>
          <h2
            className="text-lg font-serif font-semibold"
            style={{ color: "rgb(var(--copy-primary))" }}
          >
            {title}
          </h2>
          <p
            className="text-xs font-light"
            style={{ color: "rgb(var(--copy-secondary))" }}
          >
            {subtitle}
          </p>
        </div>
      </div>

      <button
        onClick={onButtonClick}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:opacity-80 transition-all"
        style={{
          backgroundColor: "rgba(var(--success), 0.1)",
          color: "rgb(var(--success))",
        }}
      >
        <FaPlus className="text-xs" />
        <span>{buttonText}</span>
      </button>
    </div>
  </div>
);

export default Home;
