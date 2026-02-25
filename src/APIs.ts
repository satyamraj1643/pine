import { GENERAL_BACKEND_BASE_URL } from "./constants";
import type { Collection, Mood } from "./types";

/**
 * Get auth token fresh from localStorage on every call.
 * This fixes the stale token bug where the module-level const
 * would capture null on first load and never update.
 */
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("auth_token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// ─── Tags (Collections) ──────────────────────────────────

export const createTag = async (tag: Collection): Promise<any> => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/collections/create-new`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ name: tag.name, color: tag.color }),
    });
    if (!response.ok) return response.statusText;
    return await response.json();
  } catch (error) {
    return error;
  }
};
// Backward compat alias
export const createCollection = createTag;

export const GetAllTags = async (): Promise<any> => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/collections/all`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) return response.statusText;
    const data = await response.json();
    return { data: data.collections };
  } catch (error) {
    return error;
  }
};
export const GetAllCollections = GetAllTags;

export const DeleteTag = async (id: number) => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/collections/delete/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify({}),
    });
    return response?.status === 200;
  } catch {
    return false;
  }
};
export const DeleteCollection = DeleteTag;

export const UpdateTag = async (id: number, tag: { name: string; color: string }): Promise<any> => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/collections/update/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(tag),
    });
    if (!response.ok) return { updated: false, detail: response.statusText };
    return await response.json();
  } catch {
    return { updated: false };
  }
};
export const UpdateCollection = UpdateTag;

// ─── Moods ────────────────────────────────────────────────

export const CreateMood = async (mood: Mood): Promise<any> => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/moods/create-new`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(mood),
    });
    if (!response.ok) return false;
    return response.status === 201;
  } catch {
    return false;
  }
};

export const GetAllMood = async () => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/moods/all`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response || response.status !== 200) return { fetched: false };
    const data = await response.json();
    return { fetched: true, data: data.moods };
  } catch {
    return { fetched: false };
  }
};

export const DeleteMood = async (id: number) => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/moods/delete/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      body: JSON.stringify({}),
    });
    return response?.status === 200;
  } catch {
    return false;
  }
};

export const UpdateMood = async (id: number, mood: { name: string; emoji: string; color: string }): Promise<any> => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/moods/update/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(mood),
    });
    if (!response.ok) return { updated: false, detail: response.statusText };
    return await response.json();
  } catch {
    return { updated: false };
  }
};

// ─── Notes (Entries) ─────────────────────────────────────

export const CreateNewNote = async (note: any): Promise<any> => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/entries/create-new`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        title: note.title,
        content: note.content,
        collection: note.collection,
        mood: note.mood,
        chapter: note.chapter,
      }),
    });
    if (!response.ok) return { created: false, detail: response.statusText };
    if (response.status === 201) return { created: true };
  } catch (error) {
    return { created: false, detail: error };
  }
};
export const CreateNewEntry = CreateNewNote;

export const UpdateNote = async (id: number, updatedNote: any): Promise<any> => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/entries/details/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(updatedNote),
    });
    if (!response.ok) return { updated: false, detail: response.statusText };
    if (response.status === 200) return { updated: true };
  } catch (error) {
    return { updated: false, detail: error };
  }
};
export const UpdateEntry = UpdateNote;

export const GetAllNotes = async () => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/entries/all`, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });
    if (!response || response.status !== 200) return { fetched: false };
    const data = await response.json();
    return { fetched: true, data: data.data };
  } catch {
    return { fetched: false };
  }
};
export const GetAllEntries = GetAllNotes;

export const DeleteNote = async (id: number) => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/entries/delete/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify({}),
    });
    return response?.status === 204;
  } catch {
    return false;
  }
};
export const DeleteEntry = DeleteNote;

export const ArchiveNote = async (id: number, is_archived: boolean) => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/entries/archive/${id}`, {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify({ is_archived }),
    });
    return response?.ok && response.status === 200;
  } catch {
    return false;
  }
};
export const ArchiveEntry = ArchiveNote;

export const FavouriteNote = async (id: number, is_favourite: boolean) => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/entries/mark-favourite/${id}`, {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify({ is_favourite }),
    });
    return response?.ok && response.status === 200;
  } catch {
    return false;
  }
};
export const FavouriteEntry = FavouriteNote;

// ─── Notebooks (Chapters) ────────────────────────────────

export const CreateNewNotebook = async (notebook: any): Promise<any> => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/chapters/create-new`, {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify({
        color: notebook.color,
        title: notebook.title,
        description: notebook.description,
        collection: notebook.collection,
      }),
    });
    if (!response.ok) return { created: false, detail: response.statusText };
    if (response.status === 201) return { created: true };
  } catch (error) {
    return { created: false, detail: error };
  }
};
export const CreateNewChapter = CreateNewNotebook;

export const GetAllNotebooks = async () => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/chapters/all`, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });
    if (!response || response.status !== 200) return { fetched: false };
    const data = await response.json();
    return { fetched: true, data: data.chapters };
  } catch {
    return { fetched: false };
  }
};
export const GetAllChapter = GetAllNotebooks;

export const DeleteNotebook = async (id: number) => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/chapters/delete/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response?.ok && response.status === 200;
  } catch {
    return false;
  }
};
export const DeleteChapter = DeleteNotebook;

export const ArchiveNotebook = async (id: number, is_archived: boolean) => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/chapters/archive/${id}`, {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify({ is_archived }),
    });
    return response?.ok && response.status === 200;
  } catch {
    return false;
  }
};
export const ArchiveChapter = ArchiveNotebook;

export const FavouriteNotebook = async (id: number, is_favourite: boolean) => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/chapters/mark-favourite/${id}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_favourite }),
    });
    return response?.ok && response.status === 200;
  } catch {
    return false;
  }
};
export const FavouriteChapter = FavouriteNotebook;

export const UpdateNotebook = async (id: number, updatedNotebook: any) => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/chapters/update/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify({
        color: updatedNotebook.color,
        title: updatedNotebook.title,
        description: updatedNotebook.description,
        collection: updatedNotebook.collection,
      }),
    });
    return response?.ok && response.status === 200;
  } catch {
    return false;
  }
};
export const UpdateChapter = UpdateNotebook;

// ─── Profile ─────────────────────────────────────────────

export const UpdateProfile = async (name: string): Promise<{ updated: boolean; name?: string; detail?: string }> => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/auth/update-profile`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    if (!response.ok) return { updated: false, detail: data.detail || response.statusText };
    return { updated: true, name: data.name };
  } catch {
    return { updated: false, detail: "Network error" };
  }
};

export const DeleteAccount = async (): Promise<{ deleted: boolean; detail?: string }> => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/auth/delete-account`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      credentials: "include",
    });
    const data = await response.json();
    if (!response.ok) return { deleted: false, detail: data.detail || response.statusText };
    return { deleted: true };
  } catch {
    return { deleted: false, detail: "Network error" };
  }
};

// ─── AI Features ─────────────────────────────────────────

export const AIReflect = async (title: string, content: string): Promise<{ reflection?: string; error?: string }> => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/ai/reflect`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, content }),
    });
    const data = await response.json();
    if (!response.ok) return { error: data.detail || "Something went wrong" };
    return { reflection: data.reflection };
  } catch {
    return { error: "Couldn't connect" };
  }
};

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export const AIChat = async (
  title: string,
  content: string,
  messages: ChatMessage[],
): Promise<{ reply?: string; error?: string }> => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/ai/chat`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, content, messages }),
    });
    const data = await response.json();
    if (!response.ok) return { error: data.detail || "Something went wrong" };
    return { reply: data.reply };
  } catch {
    return { error: "Couldn't connect" };
  }
};

export const AISuggestMood = async (content: string): Promise<{ mood_id?: number; mood_name?: string; mood_emoji?: string; is_new?: boolean; error?: string }> => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/ai/suggest-mood`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    const data = await response.json();
    if (!response.ok) return { error: data.detail || "Something went wrong" };
    return { mood_id: data.mood_id, mood_name: data.mood_name, mood_emoji: data.mood_emoji, is_new: data.is_new };
  } catch {
    return { error: "Couldn't connect to AI" };
  }
};

export const AIAsk = async (question: string): Promise<{ answer?: string; error?: string }> => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/ai/ask`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ question }),
    });
    const data = await response.json();
    if (!response.ok) return { error: data.detail || "Something went wrong" };
    return { answer: data.answer };
  } catch {
    return { error: "Couldn't connect to AI" };
  }
};

export const AIWeeklyRecap = async (): Promise<{ recap?: string; entry_count?: number; error?: string }> => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/ai/weekly-recap`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) return { error: data.detail || "Something went wrong" };
    return { recap: data.recap, entry_count: data.entry_count };
  } catch {
    return { error: "Couldn't connect to AI" };
  }
};

export const AIHealth = async (): Promise<{ available: boolean }> => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/ai/health`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    return { available: data.available === true };
  } catch {
    return { available: false };
  }
};

export interface JournalInsights {
  themes: { name: string; count: number }[];
  sentiment: { positive: number; neutral: number; negative: number };
  patterns: string[];
  summary: string;
}

export const GetJournalInsights = async (): Promise<{ data?: JournalInsights; error?: string }> => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/ai/insights`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) return { error: data.detail || "Something went wrong" };
    return { data: data as JournalInsights };
  } catch {
    return { error: "Couldn't connect" };
  }
};

// ─── AI Personality ───────────────────────────────────────

export interface PersonalityResult {
  archetype: string;       // e.g. "The Midnight Philosopher"
  summary: string;         // casual paragraph about their writing personality
  traits: string[];        // e.g. ["introspective", "creative", "empathetic"]
  vibes: string[];         // fun one-liners: "you're the type who..."
  energy: string;          // e.g. "calm", "intense", "chaotic", "dreamy"
  patterns: string[];      // writing patterns noticed across entries
}

export const AIPersonality = async (): Promise<{ data?: PersonalityResult; error?: string }> => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/ai/personality`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) return { error: data.detail || "Something went wrong" };
    return { data: data as PersonalityResult };
  } catch {
    return { error: "Couldn't connect to AI" };
  }
};

// ─── Exports ─────────────────────────────────────────────

export const LogExport = async (format: string, sizeBytes: number): Promise<boolean> => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/exports/log`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ format, size_bytes: sizeBytes }),
    });
    return response.ok;
  } catch {
    return false;
  }
};

export const GetLatestExport = async (): Promise<{
  has_export: boolean;
  format?: string;
  size_bytes?: number;
  exported_at?: string;
} | null> => {
  try {
    const response = await fetch(`${GENERAL_BACKEND_BASE_URL}/exports/latest`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};
