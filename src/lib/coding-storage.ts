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

function writeStorage<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;

  localStorage.setItem(key, JSON.stringify(value));
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

  writeStorage(SAVED_KEY, [item, ...existing]);

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