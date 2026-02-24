/**
 * Strip HTML tags and return plain text.
 */
export function stripHtml(html: string | undefined | null): string {
  if (!html) return "";
  // Works in the browser -- fast and reliable
  if (typeof document !== "undefined") {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }
  // Fallback: naive regex strip
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Count words in a string (handles both plain text and HTML).
 */
export function countWords(text: string | undefined | null): number {
  if (!text) return 0;
  const plain = text.includes("<") ? stripHtml(text) : text;
  return plain.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

/**
 * Estimate read time in minutes from word count.
 */
export function estimateReadTime(wordCount: number): string {
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}
