import type { TodoItem } from '../types';

const STORAGE_KEY = 'todolist-app-todos';

function isValidTodoItem(item: unknown): item is TodoItem {
  if (!item || typeof item !== 'object') return false;
  const obj = item as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    obj.title.length > 0 &&
    typeof obj.description === 'string' &&
    typeof obj.completed === 'boolean' &&
    typeof obj.createdAt === 'string'
  );
}

export function load(): TodoItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidTodoItem);
  } catch {
    return [];
  }
}

export function save(todos: TodoItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      window.dispatchEvent(new CustomEvent('storage-quota-exceeded'));
    }
  }
}

export const storageService = { load, save };
