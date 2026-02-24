import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { GetAllNotes, GetAllMood, GetAllChapter, AIWeeklyRecap, GetJournalInsights, AIPersonality } from "../APIs";
import type { JournalInsights, PersonalityResult } from "../APIs";
import { getEmojiFromShortcode } from "../utilities/emoji";
import { countWords } from "../utilities/text";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────

interface ApiMood { ID: number; Name: string; Emoji: string; Color: string; }
interface ApiChapter { ID: number; Name: string; Title?: string; Color: string; }
interface ApiEntry {
  ID: number; Title: string; Content: string; CreatedAt: string; UpdatedAt: string;
  IsArchived: boolean; IsFavourite: boolean; Moods: ApiMood[] | null;
  Chapter: ApiChapter | null; Collections: { ID: number; Name: string; Color: string }[] | null;
}

// ─── Helpers ──────────────────────────────────────────────

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function computeCurrentStreak(entries: ApiEntry[]): number {
  if (entries.length === 0) return 0;
  const daySet = new Set<string>();
  for (const e of entries) { const d = new Date(e.CreatedAt); if (!isNaN(d.getTime())) daySet.add(toDateKey(d)); }
  if (daySet.size === 0) return 0;
  const today = new Date();
  let check = new Date(today);
  if (!daySet.has(toDateKey(check))) { check.setDate(check.getDate() - 1); if (!daySet.has(toDateKey(check))) return 0; }
  let streak = 0;
  while (daySet.has(toDateKey(check))) { streak++; check.setDate(check.getDate() - 1); }
  return streak;
}

function countInRange(entries: ApiEntry[], start: Date, end: Date): number {
  const s = toDateKey(start), e = toDateKey(end);
  return entries.filter((entry) => { const d = new Date(entry.CreatedAt); if (isNaN(d.getTime())) return false; const k = toDateKey(d); return k >= s && k <= e; }).length;
}

function wordsInRange(entries: ApiEntry[], start: Date, end: Date): number {
  const s = toDateKey(start), e = toDateKey(end);
  return entries.filter((entry) => { const d = new Date(entry.CreatedAt); if (isNaN(d.getTime())) return false; const k = toDateKey(d); return k >= s && k <= e; }).reduce((sum, entry) => sum + countWords(entry.Content), 0);
}

type TimeOfDay = "morning" | "afternoon" | "evening" | "night";
function getTimeOfDay(date: Date): TimeOfDay {
  const h = date.getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

const TIME_LABELS: Record<TimeOfDay, string> = {
  morning: "Morning", afternoon: "Afternoon", evening: "Evening", night: "Night",
};
const TIME_EMOJI: Record<TimeOfDay, string> = {
  morning: "\u2600\uFE0F", afternoon: "\u{1F324}\uFE0F", evening: "\u{1F305}", night: "\u{1F319}",
};
const TIME_DESC: Record<TimeOfDay, string> = {
  morning: "You tend to write in the morning, before the day gets going.",
  afternoon: "You tend to write during the day, when thoughts are fresh.",
  evening: "You tend to write in the evening, winding down with your thoughts.",
  night: "You're a night owl -- your best writing comes late.",
};

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_NAMES_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
function getDayIndex(date: Date): number { return date.getDay() === 0 ? 6 : date.getDay() - 1; }

function buildDailyCountMap(entries: ApiEntry[], days: number): Map<string, number> {
  const map = new Map<string, number>();
  const now = new Date();
  for (let i = 0; i < days; i++) { const d = new Date(now); d.setDate(d.getDate() - i); map.set(toDateKey(d), 0); }
  for (const entry of entries) { const d = new Date(entry.CreatedAt); if (!isNaN(d.getTime())) { const key = toDateKey(d); if (map.has(key)) map.set(key, (map.get(key) || 0) + 1); } }
  return map;
}

// ─── Shared: section header ──────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-[rgb(var(--copy-muted))] uppercase tracking-widest mb-3">
      {children}
    </h2>
  );
}

function Divider() {
  return <div className="h-px bg-[rgb(var(--border))] my-8" />;
}

// ─── Row: label | value ──────────────────────────────────

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-[rgb(var(--copy-secondary))]">{label}</span>
      <span className="text-sm font-medium text-[rgb(var(--copy-primary))] tabular-nums">{value}</span>
    </div>
  );
}

// ─── Inline bar row ──────────────────────────────────────

function BarRow({ icon, label, value, pct, highlight }: { icon?: React.ReactNode; label: string; value: number | string; pct: number; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      {icon && <span className="flex-shrink-0 w-5 text-center text-sm">{icon}</span>}
      <span className={`text-xs w-20 flex-shrink-0 ${highlight ? "font-medium text-[rgb(var(--copy-primary))]" : "text-[rgb(var(--copy-muted))]"}`}>
        {label}
      </span>
      <div className="flex-1 h-[6px] bg-[rgb(var(--surface))] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.max(pct, 2)}%`,
            backgroundColor: highlight ? "rgb(var(--cta))" : "rgb(var(--border))",
            opacity: highlight ? 0.85 : 0.7,
          }}
        />
      </div>
      <span className="text-[11px] text-[rgb(var(--copy-muted))] w-6 text-right tabular-nums flex-shrink-0">
        {value}
      </span>
    </div>
  );
}

// ─── Summary (conversational) ────────────────────────────

function Summary({
  currentStreak, thisWeekCount, lastWeekCount,
}: {
  currentStreak: number; thisWeekCount: number; lastWeekCount: number;
}) {
  const diff = thisWeekCount - lastWeekCount;
  let weekMsg: string;
  if (thisWeekCount === 0) {
    weekMsg = "You haven't written this week yet -- how about starting now?";
  } else if (diff > 0) {
    weekMsg = `You wrote ${thisWeekCount} ${thisWeekCount === 1 ? "note" : "notes"} this week -- ${diff} more than last week.`;
  } else if (diff < 0) {
    weekMsg = `You wrote ${thisWeekCount} ${thisWeekCount === 1 ? "note" : "notes"} this week. A bit quieter than last week, and that's okay.`;
  } else if (lastWeekCount === 0) {
    weekMsg = `You wrote ${thisWeekCount} ${thisWeekCount === 1 ? "note" : "notes"} this week -- great start.`;
  } else {
    weekMsg = `You wrote ${thisWeekCount} ${thisWeekCount === 1 ? "note" : "notes"} this week -- same pace as last week. Consistent.`;
  }

  let streakMsg = "";
  if (currentStreak >= 7) streakMsg = `You're on a ${currentStreak}-day streak.`;
  else if (currentStreak >= 3) streakMsg = `${currentStreak}-day streak going.`;
  else if (currentStreak === 1) streakMsg = "You wrote today.";
  else if (currentStreak === 2) streakMsg = "2-day streak.";

  return (
    <div className="mb-8">
      <p className="text-[15px] text-[rgb(var(--copy-secondary))] leading-relaxed">
        {weekMsg}
        {streakMsg && <span className="text-[rgb(var(--copy-primary))] font-medium"> {streakMsg}</span>}
      </p>
    </div>
  );
}

// ─── Weekly recap (AI) ───────────────────────────────────

function WeeklyRecap() {
  const [recap, setRecap] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await AIWeeklyRecap();
      if (cancelled) return;
      setLoading(false);
      if (res.recap) setRecap(res.recap);
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div>
        <SectionHeader>Your week</SectionHeader>
        <div className="animate-pulse space-y-2">
          <div className="h-4 w-full bg-[rgb(var(--surface))] rounded" />
          <div className="h-4 w-2/3 bg-[rgb(var(--surface))] rounded" />
        </div>
      </div>
    );
  }

  if (!recap) return null;

  return (
    <div>
      <SectionHeader>Your week</SectionHeader>
      <p className="text-sm text-[rgb(var(--copy-secondary))] leading-relaxed">{recap}</p>
    </div>
  );
}

// ─── Journal Insights (AI) ───────────────────────────────

function JournalInsightsSection() {
  const [insights, setInsights] = useState<JournalInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await GetJournalInsights();
      if (cancelled) return;
      setLoading(false);
      if (res.data) setInsights(res.data);
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <>
        <Divider />
        <SectionHeader>About your writing</SectionHeader>
        <div className="animate-pulse space-y-2">
          <div className="h-4 w-full bg-[rgb(var(--surface))] rounded" />
          <div className="h-4 w-3/4 bg-[rgb(var(--surface))] rounded" />
          <div className="h-4 w-5/6 bg-[rgb(var(--surface))] rounded" />
        </div>
      </>
    );
  }

  if (!insights) return null;

  const maxThemeCount = Math.max(1, ...insights.themes.map((t) => t.count));

  return (
    <>
      {/* Overview */}
      {insights.summary && (
        <>
          <Divider />
          <SectionHeader>About your writing</SectionHeader>
          <p className="text-sm text-[rgb(var(--copy-secondary))] leading-relaxed">{insights.summary}</p>
        </>
      )}

      {/* Topics */}
      {insights.themes.length > 0 && (
        <>
          <Divider />
          <SectionHeader>What you write about</SectionHeader>
          <div>
            {insights.themes.map((theme, i) => (
              <BarRow
                key={theme.name}
                label={theme.name}
                value={theme.count}
                pct={(theme.count / maxThemeCount) * 100}
                highlight={i === 0}
              />
            ))}
          </div>
        </>
      )}

      {/* Tone */}
      <Divider />
      <SectionHeader>Overall tone</SectionHeader>
      <div>
        {[
          { label: "Positive", value: insights.sentiment.positive },
          { label: "Neutral", value: insights.sentiment.neutral },
          { label: "Negative", value: insights.sentiment.negative },
        ].map((s, i) => (
          <BarRow
            key={s.label}
            label={s.label}
            value={`${s.value}%`}
            pct={s.value}
            highlight={i === 0 && s.value > 0}
          />
        ))}
      </div>
    </>
  );
}

// ─── Writing time ────────────────────────────────────────

function WritingTime({ entries }: { entries: ApiEntry[] }) {
  const timeCounts = useMemo(() => {
    const counts: Record<TimeOfDay, number> = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    for (const e of entries) { const d = new Date(e.CreatedAt); if (!isNaN(d.getTime())) counts[getTimeOfDay(d)]++; }
    return counts;
  }, [entries]);

  const dayCounts = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    for (const e of entries) { const d = new Date(e.CreatedAt); if (!isNaN(d.getTime())) counts[getDayIndex(d)]++; }
    return counts;
  }, [entries]);

  const timeOrder: TimeOfDay[] = ["morning", "afternoon", "evening", "night"];
  const maxTime = Math.max(1, ...Object.values(timeCounts));
  const peakTime = timeOrder.reduce((a, b) => (timeCounts[a] >= timeCounts[b] ? a : b));

  const maxDay = Math.max(1, ...dayCounts);
  const peakDayIdx = dayCounts.indexOf(Math.max(...dayCounts));

  return (
    <div>
      <SectionHeader>When you write</SectionHeader>
      <p className="text-sm text-[rgb(var(--copy-secondary))] leading-relaxed mb-4">
        {TIME_DESC[peakTime]} Your busiest day is {DAY_NAMES_FULL[peakDayIdx]}.
      </p>

      {/* Time of day */}
      <div className="mb-6">
        {timeOrder.map((t) => (
          <BarRow
            key={t}
            icon={TIME_EMOJI[t]}
            label={TIME_LABELS[t]}
            value={timeCounts[t]}
            pct={(timeCounts[t] / maxTime) * 100}
            highlight={t === peakTime}
          />
        ))}
      </div>

      {/* Day of week -- minimal dot chart */}
      <div className="flex gap-1">
        {DAY_NAMES.map((name, i) => {
          const pct = Math.max((dayCounts[i] / maxDay) * 100, 8);
          const isPeak = i === peakDayIdx;
          return (
            <div key={name} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full h-10 bg-[rgb(var(--surface))] rounded overflow-hidden flex items-end">
                <div
                  className="w-full rounded transition-all duration-500"
                  style={{
                    height: `${pct}%`,
                    backgroundColor: isPeak ? "rgb(var(--cta))" : "rgb(var(--border))",
                    opacity: isPeak ? 0.85 : 0.5,
                  }}
                />
              </div>
              <span className={`text-[10px] ${isPeak ? "font-medium text-[rgb(var(--copy-primary))]" : "text-[rgb(var(--copy-muted))]"}`}>
                {name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Mood summary ────────────────────────────────────────

function MoodSummary({ entries }: { entries: ApiEntry[] }) {
  const moodStats = useMemo(() => {
    const map = new Map<string, { name: string; emoji: string; count: number }>();
    for (const entry of entries) {
      const moods = entry.Moods;
      if (!moods || moods.length === 0) continue;
      for (const mood of moods) {
        if (!mood.Name) continue;
        const key = String(mood.ID);
        if (map.has(key)) map.get(key)!.count++;
        else map.set(key, { name: mood.Name, emoji: mood.Emoji || "", count: 1 });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [entries]);

  const recentMood = useMemo(() => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 14);
    const key = toDateKey(cutoff);
    const recent = entries.filter((e) => { const d = new Date(e.CreatedAt); return !isNaN(d.getTime()) && toDateKey(d) >= key && e.Moods && e.Moods.length > 0; });
    const map = new Map<string, { name: string; emoji: string; count: number }>();
    for (const e of recent) { for (const m of e.Moods!) { const k = String(m.ID); if (map.has(k)) map.get(k)!.count++; else map.set(k, { name: m.Name, emoji: m.Emoji || "", count: 1 }); } }
    const sorted = Array.from(map.values()).sort((a, b) => b.count - a.count);
    return sorted[0] || null;
  }, [entries]);

  if (moodStats.length === 0) {
    return (
      <div>
        <SectionHeader>How you feel</SectionHeader>
        <p className="text-sm text-[rgb(var(--copy-muted))]">
          Add moods to your notes to see how you've been feeling.
        </p>
      </div>
    );
  }

  const maxCount = moodStats[0].count;

  return (
    <div>
      <SectionHeader>How you feel</SectionHeader>

      {recentMood && (
        <p className="text-sm text-[rgb(var(--copy-secondary))] mb-4">
          Your vibe lately: <span className="font-medium text-[rgb(var(--copy-primary))] capitalize">{getEmojiFromShortcode(recentMood.emoji)} {recentMood.name}</span>
          <span className="text-[rgb(var(--copy-muted))]"> (last 2 weeks)</span>
        </p>
      )}

      <div>
        {moodStats.slice(0, 6).map((mood, i) => (
          <BarRow
            key={mood.name}
            icon={getEmojiFromShortcode(mood.emoji) || "?"}
            label={mood.name}
            value={mood.count}
            pct={(mood.count / maxCount) * 100}
            highlight={i === 0}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Personality (AI, gated on enough entries) ───────────

function PersonalitySection({ totalNotes }: { totalNotes: number }) {
  const [personality, setPersonality] = useState<PersonalityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState(false);

  // Don't show anything until the user has enough entries
  if (totalNotes < 5) return null;

  const handleReveal = async () => {
    setRevealed(true);
    setLoading(true);
    setError(false);
    const res = await AIPersonality();
    setLoading(false);
    if (res.data) setPersonality(res.data);
    else setError(true);
  };

  // Prompt state: hasn't been clicked yet
  if (!revealed) {
    return (
      <>
        <Divider />
        <div className="py-4">
          <p className="text-sm text-[rgb(var(--copy-secondary))] mb-3">
            Based on everything you've written, we can tell you what kind of writer you are.
          </p>
          <button
            onClick={handleReveal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
              bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] hover:opacity-90 active:scale-[0.98]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a7 7 0 017 7c0 3-2 5.5-4 7.5L12 22l-3-5.5C7 14.5 5 12 5 9a7 7 0 017-7z" />
              <circle cx="12" cy="9" r="2" />
            </svg>
            Reveal my writer personality
          </button>
        </div>
      </>
    );
  }

  // Loading state
  if (loading) {
    return (
      <>
        <Divider />
        <div className="py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-5 h-5 border-2 border-[rgb(var(--cta))] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[rgb(var(--copy-muted))]">Reading your journal...</span>
          </div>
          <div className="animate-pulse space-y-3">
            <div className="h-5 w-48 bg-[rgb(var(--surface))] rounded" />
            <div className="h-4 w-full bg-[rgb(var(--surface))] rounded" />
            <div className="h-4 w-3/4 bg-[rgb(var(--surface))] rounded" />
            <div className="flex gap-2 mt-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 w-20 bg-[rgb(var(--surface))] rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error || !personality) {
    return (
      <>
        <Divider />
        <div className="py-4">
          <p className="text-sm text-[rgb(var(--copy-muted))]">
            Couldn't figure you out this time.{" "}
            <button onClick={handleReveal} className="text-[rgb(var(--cta))] hover:underline">Try again</button>
          </p>
        </div>
      </>
    );
  }

  // ── Revealed personality ──
  const { archetype, summary, traits, vibes, energy, patterns } = personality;

  // Energy to color mapping (subtle)
  const energyColors: Record<string, string> = {
    calm: "var(--cta)",
    dreamy: "var(--accent)",
    intense: "var(--error)",
    chaotic: "var(--error)",
    chill: "var(--cta)",
    warm: "var(--accent)",
    bold: "var(--cta)",
    quiet: "var(--copy-muted)",
  };
  const accentColor = energyColors[energy?.toLowerCase()] || "var(--cta)";

  return (
    <>
      <Divider />

      {/* Archetype */}
      <div className="py-2 mb-2">
        <p className="text-[11px] text-[rgb(var(--copy-muted))] uppercase tracking-widest mb-2">Your writer personality</p>
        <h2
          className="text-2xl font-semibold leading-tight"
          style={{ color: `rgb(${accentColor})` }}
        >
          {archetype}
        </h2>
        {energy && (
          <span
            className="inline-block mt-2 px-2.5 py-0.5 text-[11px] font-medium rounded-full capitalize"
            style={{
              color: `rgb(${accentColor})`,
              backgroundColor: `rgba(${accentColor}, 0.1)`,
            }}
          >
            {energy} energy
          </span>
        )}
      </div>

      {/* Summary */}
      <p className="text-[15px] text-[rgb(var(--copy-secondary))] leading-relaxed mb-5">
        {summary}
      </p>

      {/* Traits as chips */}
      {traits.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {traits.map((trait) => (
            <span
              key={trait}
              className="px-3 py-1 text-xs font-medium rounded-full capitalize"
              style={{
                color: "rgb(var(--copy-secondary))",
                backgroundColor: "rgb(var(--surface))",
              }}
            >
              {trait}
            </span>
          ))}
        </div>
      )}

      {/* Vibes -- casual one-liners */}
      {vibes.length > 0 && (
        <div className="space-y-2">
          {vibes.map((vibe, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-sm mt-0.5 flex-shrink-0" style={{ color: `rgb(${accentColor})`, opacity: 0.7 }}>~</span>
              <p className="text-sm text-[rgb(var(--copy-secondary))] leading-relaxed">{vibe}</p>
            </div>
          ))}
        </div>
      )}

      {/* Patterns -- revealed alongside personality */}
      {patterns && patterns.length > 0 && (
        <div className="mt-6">
          <p className="text-[11px] text-[rgb(var(--copy-muted))] uppercase tracking-widest mb-2">Patterns we noticed</p>
          <div className="space-y-2">
            {patterns.map((pattern, i) => (
              <p key={i} className="text-sm text-[rgb(var(--copy-secondary))] leading-relaxed">{pattern}</p>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Activity heatmap (kept minimal) ─────────────────────

function Activity({ entries }: { entries: ApiEntry[] }) {
  const WEEKS = 12;
  const TOTAL_DAYS = WEEKS * 7;
  const dailyMap = useMemo(() => buildDailyCountMap(entries, TOTAL_DAYS), [entries]);
  const now = new Date();
  const grid: { key: string; count: number; date: Date }[][] = [];

  for (let w = WEEKS - 1; w >= 0; w--) {
    const weekCol: { key: string; count: number; date: Date }[] = [];
    for (let d = 0; d < 7; d++) {
      const linearDay = (WEEKS - 1 - w) * 7 + d;
      const linearDate = new Date(now);
      linearDate.setDate(linearDate.getDate() - (TOTAL_DAYS - 1 - linearDay));
      const key = toDateKey(linearDate);
      weekCol.push({ key, count: dailyMap.get(key) || 0, date: linearDate });
    }
    grid.push(weekCol);
  }

  const maxCount = Math.max(1, ...Array.from(dailyMap.values()));
  const activeDays = Array.from(dailyMap.values()).filter((c) => c > 0).length;

  function getCellStyle(count: number): React.CSSProperties {
    if (count === 0) return { backgroundColor: "rgb(var(--surface))" };
    const intensity = Math.min(count / Math.max(maxCount, 3), 1);
    const opacity = 0.25 + intensity * 0.75;
    return { backgroundColor: `rgba(var(--cta), ${opacity})` };
  }

  const HEATMAP_DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", ""];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <SectionHeader>Activity</SectionHeader>
        <span className="text-[11px] text-[rgb(var(--copy-muted))]">
          {activeDays} active {activeDays === 1 ? "day" : "days"} in 12 weeks
        </span>
      </div>
      <div className="flex gap-[3px]">
        <div className="flex flex-col gap-[3px] pr-1">
          {HEATMAP_DAY_LABELS.map((label, i) => (
            <div key={i} className="h-[13px] flex items-center text-[10px] text-[rgb(var(--copy-muted))] leading-none">{label}</div>
          ))}
        </div>
        <div className="flex gap-[3px] flex-1 overflow-hidden">
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px] flex-1">
              {week.map((day) => (
                <div
                  key={day.key}
                  className="aspect-square rounded-[2px]"
                  style={getCellStyle(day.count)}
                  title={`${day.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}: ${day.count} ${day.count === 1 ? "note" : "notes"}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end gap-1 mt-2">
        <span className="text-[10px] text-[rgb(var(--copy-muted))]">Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((opacity, i) => (
          <div
            key={i}
            className="w-[10px] h-[10px] rounded-[2px]"
            style={opacity === 0 ? { backgroundColor: "rgb(var(--surface))" } : { backgroundColor: `rgba(var(--cta), ${0.25 + opacity * 0.75})` }}
          />
        ))}
        <span className="text-[10px] text-[rgb(var(--copy-muted))]">More</span>
      </div>
    </div>
  );
}

// ─── Loading skeleton ────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="animate-pulse">
          <div className="h-4 w-16 bg-[rgb(var(--surface))] rounded mb-8" />
          <div className="h-6 w-32 bg-[rgb(var(--surface))] rounded mb-8" />
          <div className="space-y-3 mb-10">
            <div className="h-4 w-full bg-[rgb(var(--surface))] rounded" />
            <div className="h-4 w-2/3 bg-[rgb(var(--surface))] rounded" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="h-3.5 w-24 bg-[rgb(var(--surface))] rounded" />
                <div className="h-3.5 w-12 bg-[rgb(var(--surface))] rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────

const Statistics: React.FC = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<ApiEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const [notesRes] = await Promise.all([GetAllNotes(), GetAllMood(), GetAllChapter()]);
        if (notesRes?.fetched && Array.isArray(notesRes.data)) setEntries(notesRes.data as ApiEntry[]);
        else setEntries([]);
      } catch { setEntries([]); toast.error("Failed to load data"); }
      finally { setIsLoading(false); }
    })();
  }, []);

  // ── Computed ──

  const totalNotes = entries.length;
  const totalWords = useMemo(() => entries.reduce((sum, e) => sum + countWords(e.Content), 0), [entries]);
  const currentStreak = useMemo(() => computeCurrentStreak(entries), [entries]);
  const favoriteCount = useMemo(() => entries.filter((e) => e.IsFavourite).length, [entries]);

  const now = new Date();
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay() + (thisWeekStart.getDay() === 0 ? -6 : 1));
  thisWeekStart.setHours(0, 0, 0, 0);
  const lastWeekStart = new Date(thisWeekStart); lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(thisWeekStart); lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);

  const thisWeekCount = countInRange(entries, thisWeekStart, now);
  const lastWeekCount = countInRange(entries, lastWeekStart, lastWeekEnd);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthCount = countInRange(entries, thisMonthStart, now);
  const thisMonthWords = wordsInRange(entries, thisMonthStart, now);

  // ── Render ──

  if (isLoading) return <LoadingSkeleton />;

  if (totalNotes === 0) {
    return (
      <div className="min-h-screen bg-[rgb(var(--background))]">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <button onClick={() => navigate("/")} className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-primary))] transition-colors mb-8">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Home
          </button>
          <h1 className="text-xl font-semibold text-[rgb(var(--copy-primary))] mb-8">Reflect</h1>
          <div className="text-center py-16">
            <p className="text-sm text-[rgb(var(--copy-secondary))] mb-1">Nothing here yet</p>
            <p className="text-xs text-[rgb(var(--copy-muted))]">Write your first note and come back to see your story.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Back */}
        <button onClick={() => navigate("/")} className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-primary))] transition-colors mb-8">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Home
        </button>

        <h1 className="text-xl font-semibold text-[rgb(var(--copy-primary))] mb-6">Reflect</h1>

        {/* ── Summary (conversational) ── */}
        <Summary
          currentStreak={currentStreak}
          thisWeekCount={thisWeekCount}
          lastWeekCount={lastWeekCount}
        />

        {/* ── At a glance ── */}
        <SectionHeader>At a glance</SectionHeader>
        <div>
          <StatRow label="Notes" value={totalNotes} />
          <StatRow label="Words written" value={totalWords.toLocaleString()} />
          <StatRow label="Current streak" value={currentStreak === 0 ? "--" : `${currentStreak} ${currentStreak === 1 ? "day" : "days"}`} />
          <StatRow label="Favorites" value={favoriteCount} />
          {thisMonthCount > 0 && (
            <StatRow label="This month" value={`${thisMonthCount} ${thisMonthCount === 1 ? "note" : "notes"}, ${thisMonthWords.toLocaleString()} words`} />
          )}
        </div>

        {/* ── Week in review (AI) ── */}
        <Divider />
        <WeeklyRecap />

        {/* ── How you feel ── */}
        <Divider />
        <MoodSummary entries={entries} />

        {/* ── When you write ── */}
        <Divider />
        <WritingTime entries={entries} />

        {/* ── Activity heatmap ── */}
        <Divider />
        <Activity entries={entries} />

        {/* ── AI insights (overview, themes, tone, patterns) ── */}
        <JournalInsightsSection />

        {/* ── Writer personality (AI, gated on 5+ entries) ── */}
        <PersonalitySection totalNotes={totalNotes} />

        {/* Bottom breathing room */}
        <div className="h-10" />
      </div>
    </div>
  );
};

export default Statistics;
