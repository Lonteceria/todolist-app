import { describe, test, expect, beforeEach, vi } from 'vitest';
import { load, save, storageService } from '../services/storageService';
import type { TodoItem } from '../types';

const STORAGE_KEY = 'todolist-app-todos';

const validItem: TodoItem = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Belajar TypeScript',
  description: 'Pelajari dasar-dasar TypeScript',
  completed: false,
  createdAt: '2024-01-15T10:30:00.000Z',
};

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('load()', () => {
  test('returns [] when localStorage is empty', () => {
    expect(load()).toEqual([]);
  });

  test('returns parsed todos when data is valid', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([validItem]));
    expect(load()).toEqual([validItem]);
  });

  test('returns [] when JSON is corrupt', () => {
    localStorage.setItem(STORAGE_KEY, 'not-valid-json{{{');
    expect(load()).toEqual([]);
  });

  test('returns [] when stored value is not an array', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: '1' }));
    expect(load()).toEqual([]);
  });

  test('filters out items missing required fields', () => {
    const invalid = { id: '1', title: 'No description or completed' };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([validItem, invalid]));
    expect(load()).toEqual([validItem]);
  });

  test('filters out items with empty title', () => {
    const emptyTitle = { ...validItem, title: '' };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([emptyTitle]));
    expect(load()).toEqual([]);
  });

  test('returns [] when localStorage throws (e.g. private mode)', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Access denied');
    });
    expect(load()).toEqual([]);
  });
});

describe('save()', () => {
  test('persists todos to localStorage', () => {
    save([validItem]);
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(JSON.parse(raw!)).toEqual([validItem]);
  });

  test('overwrites existing data', () => {
    save([validItem]);
    const updated = { ...validItem, completed: true };
    save([updated]);
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(JSON.parse(raw!)).toEqual([updated]);
  });

  test('saves empty array', () => {
    save([]);
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(JSON.parse(raw!)).toEqual([]);
  });

  test('emits storage-quota-exceeded event on QuotaExceededError', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError', 'QuotaExceededError');
    });

    const listener = vi.fn();
    window.addEventListener('storage-quota-exceeded', listener);
    save([validItem]);
    window.removeEventListener('storage-quota-exceeded', listener);

    expect(listener).toHaveBeenCalledOnce();
  });

  test('does not emit event for non-quota errors', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('SecurityError', 'SecurityError');
    });

    const listener = vi.fn();
    window.addEventListener('storage-quota-exceeded', listener);
    save([validItem]);
    window.removeEventListener('storage-quota-exceeded', listener);

    expect(listener).not.toHaveBeenCalled();
  });

  test('does not throw when localStorage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('localStorage unavailable');
    });
    expect(() => save([validItem])).not.toThrow();
  });
});

describe('storageService named export', () => {
  test('exposes load and save methods', () => {
    expect(typeof storageService.load).toBe('function');
    expect(typeof storageService.save).toBe('function');
  });

  test('load and save work via named export', () => {
    storageService.save([validItem]);
    expect(storageService.load()).toEqual([validItem]);
  });
});
