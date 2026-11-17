import { COLUMNS, DEFAULT_VISIBLE_COLUMNS } from "./columns";

const KEY = "zhcc.columns.v1";
const KNOWN = new Set(COLUMNS.map((column) => column.id));

export function loadColumnPrefs(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(parsed)) return DEFAULT_VISIBLE_COLUMNS;
    const valid = parsed.filter((id): id is string => typeof id === "string" && KNOWN.has(id));
    return valid.length ? valid : DEFAULT_VISIBLE_COLUMNS;
  } catch {
    return DEFAULT_VISIBLE_COLUMNS;
  }
}

export function saveColumnPrefs(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // Storage is optional; the table still works with in-memory preferences.
  }
}
