import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "pine-font";
const DEFAULT_FONT = "plus-jakarta-sans";

// ─── Font definitions ────────────────────────────────────
// Each font has an id, display name, Google Fonts family string,
// CSS font-family stack, and a category for filtering.

export interface FontOption {
  id: string;
  name: string;
  family: string;          // CSS font-family value
  googleFamily: string;    // Google Fonts API family name (for URL)
  category: "sans" | "serif" | "rounded" | "display";
  preview: string;         // Short preview sentence
  weights: string;         // Google Fonts weight string
}

export const fonts: FontOption[] = [
  // ── Sans-serif (clean, modern) ──
  {
    id: "plus-jakarta-sans",
    name: "Jakarta",
    family: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    googleFamily: "Plus+Jakarta+Sans",
    category: "sans",
    preview: "Clean and modern",
    weights: "400;500;600;700",
  },
  {
    id: "inter",
    name: "Inter",
    family: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    googleFamily: "Inter",
    category: "sans",
    preview: "Sharp and precise",
    weights: "400;500;600;700",
  },
  {
    id: "dm-sans",
    name: "DM Sans",
    family: '"DM Sans", -apple-system, sans-serif',
    googleFamily: "DM+Sans",
    category: "sans",
    preview: "Soft and geometric",
    weights: "400;500;600;700",
  },
  {
    id: "outfit",
    name: "Outfit",
    family: '"Outfit", -apple-system, sans-serif',
    googleFamily: "Outfit",
    category: "sans",
    preview: "Trendy and geometric",
    weights: "400;500;600;700",
  },
  {
    id: "sora",
    name: "Sora",
    family: '"Sora", -apple-system, sans-serif',
    googleFamily: "Sora",
    category: "sans",
    preview: "Minimal and sleek",
    weights: "400;500;600;700",
  },
  {
    id: "space-grotesk",
    name: "Space Grotesk",
    family: '"Space Grotesk", -apple-system, sans-serif',
    googleFamily: "Space+Grotesk",
    category: "sans",
    preview: "Techy and cool",
    weights: "400;500;600;700",
  },
  {
    id: "manrope",
    name: "Manrope",
    family: '"Manrope", -apple-system, sans-serif',
    googleFamily: "Manrope",
    category: "sans",
    preview: "Modern and versatile",
    weights: "400;500;600;700",
  },

  // ── Rounded (soft, friendly) ──
  {
    id: "nunito",
    name: "Nunito",
    family: '"Nunito", -apple-system, sans-serif',
    googleFamily: "Nunito",
    category: "rounded",
    preview: "Soft and friendly",
    weights: "400;500;600;700",
  },
  {
    id: "poppins",
    name: "Poppins",
    family: '"Poppins", -apple-system, sans-serif',
    googleFamily: "Poppins",
    category: "rounded",
    preview: "Bubbly and fun",
    weights: "400;500;600;700",
  },
  {
    id: "quicksand",
    name: "Quicksand",
    family: '"Quicksand", -apple-system, sans-serif',
    googleFamily: "Quicksand",
    category: "rounded",
    preview: "Cute and rounded",
    weights: "400;500;600;700",
  },
  {
    id: "comfortaa",
    name: "Comfortaa",
    family: '"Comfortaa", -apple-system, sans-serif',
    googleFamily: "Comfortaa",
    category: "rounded",
    preview: "Rounded and cozy",
    weights: "400;500;600;700",
  },
  {
    id: "varela-round",
    name: "Varela Round",
    family: '"Varela Round", -apple-system, sans-serif',
    googleFamily: "Varela+Round",
    category: "rounded",
    preview: "Simple and round",
    weights: "400",
  },

  // ── Serif (editorial, literary) ──
  {
    id: "lora",
    name: "Lora",
    family: '"Lora", Georgia, serif',
    googleFamily: "Lora",
    category: "serif",
    preview: "Classic and literary",
    weights: "400;500;600;700",
  },
  {
    id: "source-serif",
    name: "Source Serif",
    family: '"Source Serif 4", Georgia, serif',
    googleFamily: "Source+Serif+4",
    category: "serif",
    preview: "Clean editorial",
    weights: "400;500;600;700",
  },
  {
    id: "libre-baskerville",
    name: "Libre Baskerville",
    family: '"Libre Baskerville", Georgia, serif',
    googleFamily: "Libre+Baskerville",
    category: "serif",
    preview: "Elegant and refined",
    weights: "400;700",
  },
  {
    id: "crimson-text",
    name: "Crimson Text",
    family: '"Crimson Text", Georgia, serif',
    googleFamily: "Crimson+Text",
    category: "serif",
    preview: "Warm book feel",
    weights: "400;600;700",
  },

  // ── Display (fun, personal) ──
  {
    id: "caveat",
    name: "Caveat",
    family: '"Caveat", cursive',
    googleFamily: "Caveat",
    category: "display",
    preview: "Handwritten diary",
    weights: "400;500;600;700",
  },
  {
    id: "architects-daughter",
    name: "Architects Daughter",
    family: '"Architects Daughter", cursive',
    googleFamily: "Architects+Daughter",
    category: "display",
    preview: "Sketchy and casual",
    weights: "400",
  },
  {
    id: "satisfy",
    name: "Satisfy",
    family: '"Satisfy", cursive',
    googleFamily: "Satisfy",
    category: "display",
    preview: "Elegant handwriting",
    weights: "400",
  },
];

// ─── Google Fonts loader ─────────────────────────────────

const loadedFonts = new Set<string>();

function loadGoogleFont(font: FontOption) {
  if (loadedFonts.has(font.id)) return;
  // Plus Jakarta Sans and Fraunces are already in index.html
  if (font.id === "plus-jakarta-sans") {
    loadedFonts.add(font.id);
    return;
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${font.googleFamily}:wght@${font.weights}&display=swap`;
  document.head.appendChild(link);
  loadedFonts.add(font.id);
}

// Pre-load current font on module init
function preloadSavedFont() {
  if (typeof window === "undefined") return;
  const saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_FONT;
  const font = fonts.find((f) => f.id === saved);
  if (font) loadGoogleFont(font);
}
preloadSavedFont();

// ─── Shared listener pattern (same as useTheme) ─────────

const listeners = new Set<(fontId: string) => void>();

export interface UseFontReturn {
  setFont: (fontId: string) => void;
  currentFont: string;
  currentFontOption: FontOption;
}

export function useFont(): UseFontReturn {
  const [currentFont, setCurrentFont] = useState<string>(() => {
    if (typeof window === "undefined") return DEFAULT_FONT;
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_FONT;
  });

  // Register this instance's setter
  useEffect(() => {
    listeners.add(setCurrentFont);
    return () => { listeners.delete(setCurrentFont); };
  }, []);

  // Apply font to document root whenever it changes
  useEffect(() => {
    const font = fonts.find((f) => f.id === currentFont);
    if (font) {
      loadGoogleFont(font);
      document.documentElement.style.setProperty("--font-active", font.family);
      document.documentElement.style.fontFamily = font.family;
    }
  }, [currentFont]);

  const setFont = useCallback((fontId: string) => {
    const font = fonts.find((f) => f.id === fontId);
    if (!font) return;
    localStorage.setItem(STORAGE_KEY, fontId);
    loadGoogleFont(font);
    document.documentElement.style.setProperty("--font-active", font.family);
    document.documentElement.style.fontFamily = font.family;
    // Notify ALL hook instances
    listeners.forEach((fn) => fn(fontId));
  }, []);

  const currentFontOption = fonts.find((f) => f.id === currentFont) || fonts[0];

  return { setFont, currentFont, currentFontOption };
}

// Helper to get font name by id
export function getFontName(id: string): string {
  return fonts.find((f) => f.id === id)?.name ?? "Jakarta";
}
