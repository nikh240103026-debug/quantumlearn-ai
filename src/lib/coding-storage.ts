export interface SavedCode {
  id: string;
  title: string;
  code: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface CodeHistoryItem {
  id: string;
  title: string;
  code: string;
  language: string;
  action: "saved" | "run";
  createdAt: string;
}

const SAVED_KEY = "quantumlearn_saved_code";
const HISTORY_KEY = "quantumlearn_code_history";

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readStorage<T>(key: string): T[] {
  if (typeof window === "undefined") return [];

  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

// Saved programs are stored in this browser. Cap the total so a large
// collection can't fill localStorage and break every later write.
const MAX_SAVED_PROGRAMS = 200;

// Returns false if the browser refused the write (quota exceeded or
// storage blocked) instead of throwing into the caller, which used to
// turn a successful code run into an "execution failed" error.
function writeStorage<T>(key: string, value: T[]): boolean {
  if (typeof window === "undefined") return false;

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn("[coding-storage] could not save to localStorage:", error);
    return false;
  }
}

/*
 * Programs and history live in localStorage, which every account on the
 * same browser shares. Remember which user owns them and clear them when
 * a different user signs in (or on sign-out), so one learner can't see
 * another's code on a shared computer.
 */
const OWNER_KEY = "quantumlearn_code_owner";

export function syncCodingStorageOwner(
  userId: string | null,
  signedOut = false,
) {
  if (typeof window === "undefined") return;

  try {
    const owner = localStorage.getItem(OWNER_KEY);

    if (signedOut || (userId && owner && owner !== userId)) {
      localStorage.removeItem(SAVED_KEY);
      localStorage.removeItem(HISTORY_KEY);
    }

    if (signedOut) {
      localStorage.removeItem(OWNER_KEY);
    } else if (userId) {
      localStorage.setItem(OWNER_KEY, userId);
    }
  } catch {
    // Storage unavailable: nothing is persisted, so nothing to clear.
  }
}

export function getSavedCode(): SavedCode[] {
  return readStorage<SavedCode>(SAVED_KEY);
}

export function saveCode(
  title: string,
  code: string,
  language = "Python"
): SavedCode {
  const existing = getSavedCode();

  const item: SavedCode = {
    id: createId(),
    title: title.trim() || "Untitled Quantum Program",
    code,
    language,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (
    !writeStorage(
      SAVED_KEY,
      [item, ...existing].slice(0, MAX_SAVED_PROGRAMS),
    )
  ) {
    throw new Error(
      "Couldn't save the program: this browser's storage is full or blocked.",
    );
  }

  return item;
}

export function updateSavedCode(
  id: string,
  title: string,
  code: string
): SavedCode | null {
  const existing = getSavedCode();

  const index = existing.findIndex((item) => item.id === id);

  if (index === -1) return null;

  const updated: SavedCode = {
    ...existing[index],
    title: title.trim() || "Untitled Quantum Program",
    code,
    updatedAt: new Date().toISOString(),
  };

  existing[index] = updated;

  writeStorage(SAVED_KEY, existing);

  return updated;
}

export function deleteSavedCode(id: string) {
  const existing = getSavedCode().filter((item) => item.id !== id);

  writeStorage(SAVED_KEY, existing);
}

export function clearSavedCode() {
  writeStorage<SavedCode>(SAVED_KEY, []);
}

export function getCodeHistory(): CodeHistoryItem[] {
  return readStorage<CodeHistoryItem>(HISTORY_KEY);
}

export function addCodeHistory(
  title: string,
  code: string,
  action: "saved" | "run",
  language = "Python"
) {
  const history = getCodeHistory();

  const item: CodeHistoryItem = {
    id: createId(),
    title: title.trim() || "Untitled Quantum Program",
    code,
    language,
    action,
    createdAt: new Date().toISOString(),
  };

  writeStorage(HISTORY_KEY, [item, ...history].slice(0, 100));

  return item;
}

export function deleteHistoryItem(id: string) {
  const history = getCodeHistory().filter((item) => item.id !== id);

  writeStorage(HISTORY_KEY, history);
}

export function clearCodeHistory() {
  writeStorage<CodeHistoryItem>(HISTORY_KEY, []);
}