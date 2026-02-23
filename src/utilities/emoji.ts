import emojiDataset from "emoji-datasource/emoji.json";

/**
 * Convert an emoji shortcode (e.g. "grinning") to a native emoji character.
 */
export function getEmojiFromShortcode(shortcode: string | undefined | null): string {
  if (!shortcode) return "";
  const emojiData = emojiDataset.find((e: any) => e.short_name === shortcode);
  if (emojiData && emojiData.unified) {
    const codePoints = emojiData.unified.split("-").map((u: string) => parseInt(u, 16));
    return String.fromCodePoint(...codePoints);
  }
  return "";
}

/**
 * Convert a unified code point string (e.g. "1F600") to a native emoji character.
 */
export function charFromUtf16(utf16: string): string {
  return String.fromCodePoint(...utf16.split("-").map((u) => parseInt("0x" + u, 16)));
}
