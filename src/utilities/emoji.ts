import emojiDataset from "emoji-datasource/emoji.json";

// Fallback map for curated mood emojis whose shortcodes may not
// exist in emoji-datasource (newer emojis, custom IDs, etc.)
const FALLBACK: Record<string, string> = {
  "star-struck": "🤩",
  "star_struck": "🤩",
  "smiling_face_with_3_hearts": "🥰",
  "smiling_face_with_three_hearts": "🥰",
  "pleading_face": "🥺",
  "partying_face": "🥳",
  "cloud_with_rain": "🌧️",
  "wilted_flower": "🥀",
  "loudly_crying_face": "😭",
  "face_with_steam_from_nose": "😤",
  "face_with_symbols_on_mouth": "🤬",
  "face_holding_back_tears": "🥹",
  "face_with_spiral_eyes": "😵‍💫",
  "face_exhaling": "😮‍💨",
  "monocle_face": "🧐",
  "hugging_face": "🤗",
  "heart_on_fire": "❤️‍🔥",
  "dove_of_peace": "🕊️",
  "swirl": "🌀",
  "thinking": "🤔",
  "hand_heart": "🫶",
  "melting": "🫠",
  "tada": "🎉",
  "yawning": "🥱",
  "clown": "🤡",
  "alien": "👽",
  "ghost": "👻",
  "skull": "💀",
};

/**
 * Convert an emoji shortcode (e.g. "grinning") to a native emoji character.
 */
export function getEmojiFromShortcode(shortcode: string | undefined | null): string {
  if (!shortcode) return "";
  // Strip colons if present (AI may return ":smile:" instead of "smile")
  const clean = shortcode.replace(/^:+|:+$/g, "");
  if (!clean) return "";
  // If the input is already a native emoji character, return it as-is
  if (/\p{Emoji_Presentation}/u.test(clean)) return clean;
  // Try emoji-datasource first
  const emojiData = emojiDataset.find((e: any) => e.short_name === clean);
  if (emojiData && emojiData.unified) {
    const codePoints = emojiData.unified.split("-").map((u: string) => parseInt(u, 16));
    return String.fromCodePoint(...codePoints);
  }
  // Fallback for curated mood emojis
  return FALLBACK[clean] ?? "";
}
