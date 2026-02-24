import React, { useState, useEffect, useRef, useMemo } from "react";
import { CreateMood, GetAllMood, DeleteMood } from "../APIs";
import EmptyState from "../components/EmptyState";
import toast from "react-hot-toast";
import ConfirmModal from "../components/ConfirmModal";

interface MoodData { ID: number; Name: string; Emoji: string; Color: string; CreatedAt: string; }

// ─── Curated mood emoji set ─────────────────────────────────

type MoodEmoji = { id: string; emoji: string; label: string; tags: string[] };

const MOOD_EMOJIS: { category: string; emojis: MoodEmoji[] }[] = [
  {
    category: "Happy",
    emojis: [
      { id: "grinning", emoji: "😀", label: "Grinning", tags: ["happy", "joy", "joyful", "cheerful", "good", "great", "glad", "delighted", "pleased", "wonderful", "awesome", "fantastic", "merry", "jolly", "bright", "positive", "upbeat", "yay", "nice"] },
      { id: "smile", emoji: "😊", label: "Smiling", tags: ["happy", "warm", "content", "pleased", "satisfied", "gentle", "kind", "soft", "sweet", "grateful", "appreciative", "tender", "cozy", "comfortable", "at ease"] },
      { id: "blush", emoji: "😊", label: "Blushing", tags: ["shy", "flattered", "sweet", "bashful", "modest", "cute", "awkward", "flustered", "embarrassed", "complimented", "touched"] },
      { id: "star-struck", emoji: "🤩", label: "Amazed", tags: ["excited", "wow", "thrilled", "amazing", "incredible", "astonished", "starstruck", "impressed", "awestruck", "mind blown", "stunned", "spectacular", "stoked", "hyped", "pumped", "ecstatic", "elated", "euphoric", "overjoyed", "giddy"] },
      { id: "laughing", emoji: "😆", label: "Laughing", tags: ["funny", "lol", "hilarious", "amused", "giggly", "silly", "goofy", "playful", "lmao", "cracking up", "humor", "joke", "witty", "entertained"] },
      { id: "joy", emoji: "😂", label: "Tears of joy", tags: ["laughing", "funny", "crying laughing", "hilarious", "lmao", "dying", "dead", "so funny", "can't stop", "hysterical"] },
      { id: "sunglasses", emoji: "😎", label: "Cool", tags: ["confident", "chill", "relaxed", "swag", "smooth", "suave", "unbothered", "nonchalant", "boss", "slay", "winning", "badass", "swagger", "flex", "vibing"] },
      { id: "partying_face", emoji: "🥳", label: "Celebrating", tags: ["party", "celebration", "birthday", "fun", "festive", "woohoo", "cheers", "milestone", "achievement", "victory", "win", "accomplished", "proud", "success", "graduated", "promoted"] },
      { id: "smiling_face_with_3_hearts", emoji: "🥰", label: "Loved", tags: ["love", "adored", "affection", "hearts", "cherished", "appreciated", "valued", "special", "blessed", "lucky", "smitten", "in love", "romantic", "swooning"] },
      { id: "innocent", emoji: "😇", label: "Blessed", tags: ["grateful", "angel", "blessed", "pure", "thankful", "gracious", "humble", "divine", "spiritual", "at peace", "serene", "holy", "good vibes", "counting blessings", "appreciation"] },
    ],
  },
  {
    category: "Calm",
    emojis: [
      { id: "relieved", emoji: "😌", label: "Peaceful", tags: ["calm", "relaxed", "serene", "peace", "zen", "tranquil", "soothing", "gentle", "still", "composed", "easygoing", "laid back", "unbothered", "mellow", "chill", "chilled", "chilling", "quiet mind", "inner peace"] },
      { id: "slightly_smiling_face", emoji: "🙂", label: "Content", tags: ["okay", "fine", "alright", "neutral", "meh", "so-so", "decent", "normal", "regular", "average", "stable", "steady", "moderate", "mild", "whatever", "not bad", "surviving"] },
      { id: "sleeping", emoji: "😴", label: "Sleepy", tags: ["tired", "rest", "sleep", "drowsy", "nap", "exhausted", "fatigued", "drained", "wiped", "zonked", "groggy", "lethargic", "lazy", "snooze", "bedtime", "worn out", "beat", "spent", "knackered"] },
      { id: "cloud", emoji: "☁️", label: "Dreamy", tags: ["daydream", "floaty", "hazy", "soft", "ethereal", "whimsical", "imaginative", "fantasy", "drifting", "spacey", "head in clouds", "absent minded", "zoned out", "detached", "wistful"] },
      { id: "herb", emoji: "🌿", label: "Grounded", tags: ["nature", "calm", "centered", "mindful", "present", "rooted", "stable", "balanced", "aware", "connected", "earthy", "organic", "wholesome", "meditative", "meditation", "breathing", "yoga"] },
      { id: "coffee", emoji: "☕", label: "Cozy", tags: ["warm", "comfort", "homey", "snug", "hygge", "cozy", "comfortable", "relaxing", "domestic", "safe", "secure", "sheltered", "nestled", "rainy day", "blanket", "reading"] },
      { id: "crescent_moon", emoji: "🌙", label: "Quiet", tags: ["night", "still", "reflective", "evening", "late", "midnight", "moonlit", "nocturnal", "silent", "solitude", "alone time", "introspective", "winding down", "nighttime"] },
      { id: "dove_of_peace", emoji: "🕊️", label: "At peace", tags: ["harmony", "tranquil", "still", "balanced", "acceptance", "surrender", "letting go", "resolved", "closure", "forgiveness", "free", "liberated", "released", "healed", "recovered"] },
    ],
  },
  {
    category: "Sad",
    emojis: [
      { id: "pensive", emoji: "😔", label: "Down", tags: ["sad", "low", "bummed", "unhappy", "blue", "depressed", "gloomy", "somber", "heavy", "weighed down", "flat", "deflated", "dejected", "disheartened", "downcast", "glum", "morose", "melancholic", "in a funk", "off"] },
      { id: "cry", emoji: "😢", label: "Crying", tags: ["sad", "tears", "upset", "hurt", "weeping", "emotional", "moved", "touched", "teary", "watery eyes", "sob", "bawling", "welling up", "broken", "shattered"] },
      { id: "disappointed", emoji: "😞", label: "Disappointed", tags: ["let down", "bummed", "sad", "failed", "failure", "underwhelmed", "dissatisfied", "unfulfilled", "regret", "remorse", "gutted", "crushed", "disenchanted", "disillusioned", "defeated"] },
      { id: "pleading_face", emoji: "🥺", label: "Vulnerable", tags: ["fragile", "soft", "sensitive", "emotional", "tender", "delicate", "exposed", "open", "raw", "unguarded", "helpless", "needy", "please", "puppy eyes", "begging"] },
      { id: "broken_heart", emoji: "💔", label: "Heartbroken", tags: ["breakup", "loss", "pain", "grief", "heartache", "devastated", "shattered", "crushed", "abandoned", "rejected", "betrayed", "cheated", "dumped", "left", "alone", "missing someone", "longing", "mourning", "widow"] },
      { id: "cloud_with_rain", emoji: "🌧️", label: "Gloomy", tags: ["rainy", "grey", "melancholy", "bleak", "dark", "overcast", "dreary", "dismal", "sorrow", "sorrowful", "weary", "numb", "empty inside", "void", "hollow"] },
      { id: "wilted_flower", emoji: "🥀", label: "Drained", tags: ["exhausted", "withered", "empty", "burnt out", "burnout", "depleted", "worn", "fading", "dying inside", "lifeless", "no energy", "running on empty", "used up", "spent", "done"] },
      { id: "loudly_crying_face", emoji: "😭", label: "Sobbing", tags: ["very sad", "devastated", "bawling", "overwhelmed", "inconsolable", "wailing", "distraught", "beside myself", "falling apart", "breaking down", "can't stop crying", "ugly crying", "mess"] },
      { id: "face_holding_back_tears", emoji: "🥹", label: "Holding back", tags: ["trying not to cry", "emotional", "bittersweet", "nostalgic", "sentimental", "homesick", "missing", "longing", "yearning", "wistful", "poignant", "touching", "moved", "reminiscing"] },
    ],
  },
  {
    category: "Angry",
    emojis: [
      { id: "angry", emoji: "😠", label: "Angry", tags: ["mad", "frustrated", "pissed", "upset", "annoyed", "aggravated", "cross", "irate", "indignant", "outraged", "offended", "resentful", "bitter", "hostile", "agitated", "ticked off", "triggered"] },
      { id: "rage", emoji: "🤬", label: "Furious", tags: ["rage", "angry", "livid", "swearing", "cursing", "enraged", "seething", "fuming", "incensed", "explosive", "volcanic", "seeing red", "beside myself", "lost it", "snapped"] },
      { id: "face_with_steam_from_nose", emoji: "😤", label: "Frustrated", tags: ["annoyed", "huffing", "irritated", "fed up", "exasperated", "impatient", "restless", "stuck", "blocked", "thwarted", "hindered", "struggling", "trying", "ugh", "argh", "grr"] },
      { id: "unamused", emoji: "😒", label: "Unamused", tags: ["bored", "annoyed", "meh", "unimpressed", "whatever", "over it", "done", "disinterested", "apathetic", "indifferent", "dull", "tedious", "monotonous", "blah", "not feeling it", "side eye"] },
      { id: "rolling_eyes", emoji: "🙄", label: "Eye roll", tags: ["annoyed", "sarcastic", "whatever", "done", "exasperated", "dismissive", "condescending", "patronizing", "seriously", "really", "oh please", "give me a break", "ugh", "cringe", "ick"] },
      { id: "fire", emoji: "🔥", label: "Fired up", tags: ["intense", "passionate", "heated", "burning", "lit", "on fire", "blazing", "fierce", "feisty", "aggressive", "competitive", "determined", "riled up", "battle mode", "war"] },
      { id: "face_with_symbols_on_mouth", emoji: "🤬", label: "Swearing", tags: ["profanity", "cursing", "expletive", "wtf", "damn", "hell", "furious", "enraged", "obscene", "inappropriate", "vulgar"] },
    ],
  },
  {
    category: "Anxious",
    emojis: [
      { id: "worried", emoji: "😟", label: "Worried", tags: ["anxious", "nervous", "concerned", "uneasy", "apprehensive", "dreading", "uncertain", "insecure", "doubtful", "hesitant", "wary", "cautious", "on edge", "unsettled", "troubled", "bothered"] },
      { id: "fearful", emoji: "😨", label: "Scared", tags: ["afraid", "fear", "terrified", "panic", "frightened", "alarmed", "startled", "shocked", "horror", "dread", "phobia", "trembling", "shaking", "petrified", "spooked", "creeped out"] },
      { id: "cold_sweat", emoji: "😰", label: "Stressed", tags: ["anxious", "pressure", "tense", "overwhelmed", "stress", "stressful", "deadline", "crunch", "under pressure", "swamped", "drowning", "stretched thin", "overworked", "burnt", "maxed out", "can't breathe"] },
      { id: "confounded", emoji: "😖", label: "Overwhelmed", tags: ["too much", "can't cope", "frazzled", "overloaded", "chaotic", "hectic", "scattered", "pulled apart", "drowning", "suffocating", "crushing", "breaking", "at my limit", "sensory overload", "overstimulated"] },
      { id: "dizzy_face", emoji: "😵", label: "Dizzy", tags: ["confused", "spinning", "lost", "disoriented", "bewildered", "dazed", "foggy", "brain fog", "unclear", "muddled", "mixed up", "perplexed", "baffled", "stumped", "clueless", "wtf"] },
      { id: "swirl", emoji: "🌀", label: "Spiraling", tags: ["overthinking", "anxious", "looping", "restless", "racing thoughts", "ruminating", "obsessing", "fixating", "can't stop thinking", "intrusive thoughts", "mental loop", "going crazy", "losing it"] },
      { id: "face_with_spiral_eyes", emoji: "😵‍💫", label: "Overwhelmed", tags: ["out of it", "hungover", "woozy", "faint", "lightheaded", "unwell", "sick", "nauseous", "queasy", "motion sick", "disoriented", "spaced out"] },
    ],
  },
  {
    category: "Thoughtful",
    emojis: [
      { id: "thinking", emoji: "🤔", label: "Thinking", tags: ["pondering", "wondering", "curious", "hmm", "contemplating", "considering", "deliberating", "analyzing", "processing", "reflecting", "mulling", "weighing", "debating", "questioning", "unsure", "deciding", "indecisive"] },
      { id: "nerd_face", emoji: "🤓", label: "Nerdy", tags: ["focused", "studying", "learning", "smart", "intellectual", "geeky", "academic", "scholarly", "bookish", "brainy", "knowledgeable", "wise", "educated", "researcher", "analyst"] },
      { id: "monocle_face", emoji: "🧐", label: "Curious", tags: ["investigating", "intrigued", "examining", "questioning", "skeptical", "suspicious", "doubtful", "analytical", "critical", "scrutinizing", "probing", "nosy", "interested", "fascinated", "captivated"] },
      { id: "books", emoji: "📚", label: "Studious", tags: ["reading", "learning", "studying", "academic", "homework", "research", "knowledge", "education", "library", "cramming", "exam", "test", "school", "college", "university"] },
      { id: "bulb", emoji: "💡", label: "Inspired", tags: ["idea", "lightbulb", "creative", "eureka", "breakthrough", "innovation", "invention", "aha moment", "epiphany", "revelation", "discovery", "insight", "clarity", "vision", "brainstorm"] },
      { id: "sparkles", emoji: "✨", label: "Creative", tags: ["magic", "creative", "spark", "motivation", "inspiration", "artistic", "imaginative", "visionary", "innovative", "original", "unique", "special", "aesthetic", "beautiful", "stunning", "gorgeous", "vibes", "manifesting"] },
      { id: "crystal_ball", emoji: "🔮", label: "Reflective", tags: ["introspective", "deep", "philosophical", "contemplative", "mystic", "mysterious", "spiritual", "intuitive", "prophetic", "fortune", "destiny", "fate", "meaning", "purpose", "existential", "soul searching"] },
    ],
  },
  {
    category: "Energetic",
    emojis: [
      { id: "zap", emoji: "⚡", label: "Energized", tags: ["energetic", "pumped", "electric", "hyper", "motivated", "charged", "wired", "alert", "awake", "alive", "buzzing", "vibrant", "dynamic", "active", "ready", "lets go", "game on"] },
      { id: "rocket", emoji: "🚀", label: "Unstoppable", tags: ["driven", "ambitious", "productive", "going far", "launching", "taking off", "skyrocketing", "soaring", "flying", "momentum", "progress", "advancing", "rising", "climbing", "grinding", "hustle", "grind"] },
      { id: "muscle", emoji: "💪", label: "Strong", tags: ["powerful", "determined", "resilient", "tough", "strength", "brave", "courageous", "bold", "fearless", "empowered", "capable", "confident", "unbreakable", "warrior", "fighter", "gym", "workout", "exercise", "fit"] },
      { id: "sun_with_face", emoji: "🌞", label: "Radiant", tags: ["bright", "sunny", "glowing", "positive", "warm", "cheerful", "beaming", "shining", "luminous", "vibrant", "fresh", "morning", "sunrise", "new day", "optimistic", "hopeful"] },
      { id: "rainbow", emoji: "🌈", label: "Hopeful", tags: ["optimistic", "bright", "colorful", "promise", "hope", "possibility", "better days", "looking up", "silver lining", "light at end", "faith", "belief", "trust", "expecting good", "after the storm", "pride", "lgbtq"] },
      { id: "heart_on_fire", emoji: "❤️‍🔥", label: "Passionate", tags: ["intense", "burning", "desire", "driven", "passionate", "obsessed", "devoted", "dedicated", "committed", "all in", "consumed", "fervent", "zealous", "ardent", "fiery", "hot"] },
      { id: "tada", emoji: "🎉", label: "Winning", tags: ["success", "achievement", "accomplished", "nailed it", "crushed it", "killed it", "slayed", "slay", "aced", "smashed", "dominated", "champion", "winner", "celebration", "confetti", "reward"] },
    ],
  },
  {
    category: "Love",
    emojis: [
      { id: "heart", emoji: "❤️", label: "Love", tags: ["love", "heart", "caring", "affection", "adore", "cherish", "devotion", "passion", "romance", "beloved", "dear", "precious", "treasure", "warmth", "fondness", "tenderness"] },
      { id: "two_hearts", emoji: "💕", label: "In love", tags: ["romance", "couple", "crushing", "smitten", "infatuated", "dating", "relationship", "together", "partner", "significant other", "bae", "boo", "lover", "honeymoon", "falling for"] },
      { id: "hugging_face", emoji: "🤗", label: "Warm", tags: ["hug", "welcoming", "friendly", "affectionate", "supportive", "comforting", "embracing", "open arms", "accepting", "inclusive", "compassionate", "empathetic", "understanding", "nurturing", "motherly", "fatherly"] },
      { id: "kissing_heart", emoji: "😘", label: "Loving", tags: ["kiss", "affection", "sweet", "caring", "smooch", "xoxo", "mwah", "flirty", "flirting", "charming", "attractive", "adoring", "doting", "devoted", "attentive"] },
      { id: "butterfly", emoji: "🦋", label: "Butterflies", tags: ["crush", "nervous excitement", "flutter", "new love", "anticipation", "giddy", "tingly", "first date", "sparks", "chemistry", "attraction", "magnetic", "drawn to", "falling", "head over heels"] },
      { id: "revolving_hearts", emoji: "💞", label: "Connected", tags: ["bond", "together", "soulmate", "close", "intimate", "deep connection", "kindred spirit", "unity", "belonging", "community", "friendship", "best friend", "ride or die", "loyal", "trust", "family"] },
      { id: "hand_heart", emoji: "🫶", label: "Appreciative", tags: ["thankful", "grateful", "appreciation", "support", "care", "kindness", "generosity", "giving", "receiving", "touched", "moved", "heartfelt", "meaningful", "thoughtful", "considerate"] },
    ],
  },
  {
    category: "Misc",
    emojis: [
      { id: "skull", emoji: "💀", label: "Dead", tags: ["dead", "dying", "i can't", "lmao", "hilarious", "embarrassed", "cringe", "mortified", "expired", "done for", "finished"] },
      { id: "clown", emoji: "🤡", label: "Clown", tags: ["foolish", "silly", "dumb", "played myself", "embarrassing", "ridiculous", "absurd", "joke", "laughable", "naive", "gullible", "duped"] },
      { id: "alien", emoji: "👽", label: "Alien", tags: ["weird", "strange", "different", "outcast", "misunderstood", "outsider", "don't belong", "alienated", "isolated", "unique", "eccentric", "unconventional"] },
      { id: "ghost", emoji: "👻", label: "Ghosted", tags: ["ghosted", "invisible", "ignored", "forgotten", "disappeared", "vanished", "unseen", "unnoticed", "overlooked", "left on read", "no reply"] },
      { id: "yawning", emoji: "🥱", label: "Bored", tags: ["bored", "boring", "tedious", "uninterested", "dull", "monotonous", "repetitive", "stale", "flat", "meh", "nothing to do", "restless", "unstimulated"] },
      { id: "face_exhaling", emoji: "😮‍💨", label: "Relieved", tags: ["sigh", "relief", "finally", "exhale", "phew", "weight off", "stress relief", "relaxing", "decompressing", "unwinding", "letting go", "done with it", "over it"] },
      { id: "melting", emoji: "🫠", label: "Melting", tags: ["melting", "embarrassed", "awkward", "uncomfortable", "cringe", "dying inside", "sinking", "disappearing", "hot", "overwhelmed", "swooning", "flustered"] },
    ],
  },
];

// Flatten for lookup
const ALL_MOOD_EMOJIS = MOOD_EMOJIS.flatMap(c => c.emojis);
function getEmoji(sc: string) {
  return ALL_MOOD_EMOJIS.find(e => e.id === sc)?.emoji ?? sc;
}

// ─── Scored emoji matching ───────────────────────────────────
// Bidirectional substring + starts-with scoring so "happiness"
// still matches the tag "happy" and vice-versa.

function getMatchingEmojis(query: string): MoodEmoji[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();

  const scored = ALL_MOOD_EMOJIS.map(e => {
    let score = 0;
    const cat = MOOD_EMOJIS.find(c => c.emojis.includes(e))?.category.toLowerCase() || "";

    // Label matching
    const lab = e.label.toLowerCase();
    if (lab === q) score += 100;
    else if (lab.startsWith(q)) score += 60;
    else if (q.startsWith(lab)) score += 45;
    else if (lab.includes(q)) score += 35;
    else if (q.includes(lab)) score += 20;

    // Tag matching (best tag wins)
    for (const t of e.tags) {
      let ts = 0;
      if (t === q) ts = 80;
      else if (t.startsWith(q)) ts = 50;
      else if (q.startsWith(t)) ts = 40;
      else if (t.includes(q)) ts = 25;
      else if (q.includes(t)) ts = 15;
      if (ts > score) score = ts; // take the best match overall
    }

    // Category matching
    if (cat === q) score = Math.max(score, 70);
    else if (cat.startsWith(q)) score = Math.max(score, 30);
    else if (q.startsWith(cat)) score = Math.max(score, 25);
    else if (cat.includes(q)) score = Math.max(score, 18);

    return { emoji: e, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(s => s.emoji);
}

// ─── Emoji picker ────────────────────────────────────────────

function MoodEmojiPicker({ onSelect, onClose, selected }: { onSelect: (id: string) => void; onClose: () => void; selected: string }) {
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return MOOD_EMOJIS;
    // Use scored matching for picker search too
    const matched = getMatchingEmojis(q);
    const matchedIds = new Set(matched.map(e => e.id));
    return MOOD_EMOJIS
      .map(c => ({
        ...c,
        emojis: c.emojis.filter(e => matchedIds.has(e.id)),
      }))
      .filter(c => c.emojis.length > 0);
  }, [search]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div ref={ref} className="bg-[rgb(var(--card))] rounded-xl border border-[rgb(var(--border))] shadow-lg max-w-sm w-full mx-4 max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[rgb(var(--border))]">
          <h3 className="text-sm font-medium text-[rgb(var(--copy-primary))]">How are you feeling?</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-[rgb(var(--surface))] text-[rgb(var(--copy-muted))]" aria-label="Close emoji picker">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div className="px-4 pt-3 pb-2">
          <input
            type="text"
            placeholder="Search a feeling..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
            className="w-full px-3 py-1.5 text-sm bg-transparent border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--copy-primary))] placeholder-[rgb(var(--copy-muted))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--cta))]"
          />
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-3 scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-[rgb(var(--copy-muted))] py-8">No match found.</p>
          ) : filtered.map(cat => (
            <div key={cat.category} className="mb-4">
              <p className="text-[10px] font-medium text-[rgb(var(--copy-muted))] mb-2 uppercase tracking-wider">{cat.category}</p>
              <div className="flex flex-wrap gap-1">
                {cat.emojis.map(em => (
                  <button
                    key={em.id}
                    onClick={() => { onSelect(em.id); onClose(); }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors ${selected === em.id ? "bg-[rgb(var(--surface))] ring-1 ring-[rgb(var(--cta))]" : "hover:bg-[rgb(var(--surface))]"}`}
                    title={em.tags.join(", ")}
                  >
                    <span className="text-base">{em.emoji}</span>
                    <span className="text-xs text-[rgb(var(--copy-secondary))]">{em.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────

export default function Mood() {
  const [moods, setMoods] = useState<MoodData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Create form
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("smile");
  const [showPicker, setShowPicker] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<MoodData | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Dynamic emoji matching
  const suggestions = useMemo(() => getMatchingEmojis(name).slice(0, 8), [name]);

  useEffect(() => {
    if (!name.trim()) { setEmoji("smile"); return; }
    const matches = getMatchingEmojis(name);
    if (matches.length > 0) setEmoji(matches[0].id);
  }, [name]);

  const fetchMoods = async () => {
    setIsLoading(true);
    try { const r = await GetAllMood(); if (r.fetched) setMoods(r.data ?? []); } catch { toast.error("Failed to load moods"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchMoods(); }, []);

  const sorted = useMemo(() => [...moods].sort((a, b) => (a.Name ?? "").localeCompare(b.Name ?? "")), [moods]);

  const handleCreate = async () => {
    const t = name.trim();
    if (!t || isCreating) return;
    setIsCreating(true);
    const ok = await CreateMood({ name: t, emoji, color: "#6b7280" });
    if (ok === true) {
      toast.success(`"${t}" created`);
      setName("");
      setEmoji("smile");
      setShowForm(false);
      fetchMoods();
    } else {
      toast.error(`Failed to create "${t}"`);
    }
    setIsCreating(false);
  };

  const openForm = () => {
    setShowForm(true);
    setTimeout(() => nameRef.current?.focus(), 50);
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-baseline justify-between mb-8">
          <h1 className="text-xl font-semibold text-[rgb(var(--copy-primary))]">
            Moods
            {!isLoading && moods.length > 0 && (
              <span className="text-sm font-normal text-[rgb(var(--copy-muted))] ml-2">{moods.length}</span>
            )}
          </h1>
          {!showForm && (
            <button
              onClick={openForm}
              className="p-1 rounded-md text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-secondary))] hover:bg-[rgb(var(--surface))] transition-colors"
              aria-label="Create new mood"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          )}
        </div>

        {/* Create form */}
        {showForm && (
          <div className="mb-8">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPicker(true)}
                disabled={isCreating}
                className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-xl rounded-lg border border-[rgb(var(--border))] hover:bg-[rgb(var(--surface))] transition-colors disabled:opacity-50"
                aria-label="Choose emoji"
              >
                {getEmoji(emoji)}
              </button>
              <input
                ref={nameRef}
                type="text"
                placeholder="Mood name..."
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && name.trim()) handleCreate();
                  if (e.key === "Escape") { setShowForm(false); setName(""); }
                }}
                disabled={isCreating}
                className="flex-1 px-3 py-2 text-sm bg-transparent border border-[rgb(var(--border))] rounded-lg text-[rgb(var(--copy-primary))] placeholder-[rgb(var(--copy-muted))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--cta))] disabled:opacity-50 transition-colors"
              />
              <button
                onClick={handleCreate}
                disabled={!name.trim() || isCreating}
                className="flex-shrink-0 px-4 py-2 text-xs font-medium rounded-lg bg-[rgb(var(--cta))] text-[rgb(var(--cta-text))] disabled:opacity-40 transition-colors"
              >
                {isCreating ? "Adding..." : "Add"}
              </button>
            </div>
            {/* Dynamic emoji suggestions */}
            {name.trim() && suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2 ml-11">
                {suggestions.map(em => (
                  <button
                    key={em.id}
                    onClick={() => setEmoji(em.id)}
                    className={`px-2 py-1 rounded-lg text-base transition-colors ${emoji === em.id ? "bg-[rgb(var(--surface))] ring-1 ring-[rgb(var(--cta))]" : "hover:bg-[rgb(var(--surface))]"}`}
                    title={em.label}
                    aria-label={`Select ${em.label} emoji`}
                  >
                    {em.emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* List */}
        {isLoading ? (
          <div className="space-y-1">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 px-3 animate-pulse">
                <div className="w-5 h-5 bg-[rgb(var(--surface))] rounded" />
                <div className="h-4 bg-[rgb(var(--surface))] rounded w-20" />
              </div>
            ))}
          </div>
        ) : sorted.length > 0 ? (
          <div className="divide-y divide-[rgb(var(--border))]/40">
            {sorted.map(m => (
              <div key={m.ID} className="group flex items-center gap-3 py-2.5 px-3 -mx-3 hover:bg-[rgb(var(--surface))] transition-colors">
                <span className="text-base leading-none flex-shrink-0">{getEmoji(m.Emoji)}</span>
                <span className="flex-1 min-w-0 text-sm text-[rgb(var(--copy-primary))] truncate capitalize">{m.Name}</span>
                <button
                  onClick={() => setDeleteTarget(m)}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--error))] transition-all"
                  aria-label={`Delete mood "${m.Name}"`}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M8 2L2 8M2 2l6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No moods yet"
            description="Create moods to track how you feel when writing."
            action={
               !showForm ? (
                <button
                  onClick={openForm}
                  className="flex items-center gap-1.5 text-sm text-[rgb(var(--copy-muted))] hover:text-[rgb(var(--copy-secondary))] transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  Create your first mood
                </button>
              ) : undefined
            }
          />
        )}

        {showPicker && <MoodEmojiPicker onSelect={setEmoji} onClose={() => setShowPicker(false)} selected={emoji} />}
        <ConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={async () => {
            if (!deleteTarget) return;
            setDeletingId(deleteTarget.ID);
            const ok = await DeleteMood(deleteTarget.ID);
            setDeletingId(null);
            if (ok) { toast.success(`"${deleteTarget.Name}" deleted`); setDeleteTarget(null); fetchMoods(); }
            else toast.error("Failed to delete");
          }}
          title="Delete mood"
          message="This will remove the mood. Notes with this mood won't be affected."
          itemName={deleteTarget?.Name}
          isProcessing={deletingId === deleteTarget?.ID}
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </div>
  );
}
