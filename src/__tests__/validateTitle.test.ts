import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateTitle } from '../utils/validateTitle';

describe('validateTitle', () => {
  // Example-based tests

  test('menerima judul yang valid', () => {
    const result = validateTitle('Belajar TypeScript');
    expect(result.valid).toBe(true);
  });

  test('menerima judul dengan satu karakter', () => {
    const result = validateTitle('A');
    expect(result.valid).toBe(true);
  });

  test('menerima judul tepat 200 karakter', () => {
    const title = 'a'.repeat(200);
    const result = validateTitle(title);
    expect(result.valid).toBe(true);
  });

  test('menolak string kosong', () => {
    const result = validateTitle('');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe('Judul tugas tidak boleh kosong');
    }
  });

  test('menolak string yang hanya berisi spasi', () => {
    const result = validateTitle('   ');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe('Judul tugas tidak boleh kosong');
    }
  });

  test('menolak string yang hanya berisi tab dan newline', () => {
    const result = validateTitle('\t\n\r');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe('Judul tugas tidak boleh kosong');
    }
  });

  test('menolak judul yang melebihi 200 karakter', () => {
    const title = 'a'.repeat(201);
    const result = validateTitle(title);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe('Judul tugas maksimal 200 karakter');
    }
  });

  test('menolak judul 500 karakter', () => {
    const title = 'x'.repeat(500);
    const result = validateTitle(title);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe('Judul tugas maksimal 200 karakter');
    }
  });

  // Property-based tests

  // Feature: todolist-app, Property 2: Input whitespace-only ditolak
  // Validates: Requirements 1.4
  test('menolak semua string whitespace-only', () => {
    fc.assert(
      fc.property(
        fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r')),
        (whitespace) => {
          const result = validateTitle(whitespace);
          expect(result.valid).toBe(false);
          if (!result.valid) {
            expect(result.error).toBe('Judul tugas tidak boleh kosong');
          }
        }
      )
    );
  });

  // Feature: todolist-app, Property 3: Validasi panjang judul (terlalu panjang)
  // Validates: Requirements 1.5, 1.6
  test('menolak semua judul dengan panjang > 200 karakter setelah trim', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 201, maxLength: 500 }).filter(s => s.trim().length > 200),
        (longTitle) => {
          const result = validateTitle(longTitle);
          expect(result.valid).toBe(false);
          if (!result.valid) {
            expect(result.error).toBe('Judul tugas maksimal 200 karakter');
          }
        }
      )
    );
  });

  // Feature: todolist-app, Property 3: Validasi panjang judul (valid)
  // Validates: Requirements 1.5
  test('menerima semua judul valid (non-whitespace, panjang ≤ 200 setelah trim)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0 && s.trim().length <= 200),
        (validTitle) => {
          const result = validateTitle(validTitle);
          expect(result.valid).toBe(true);
        }
      )
    );
  });
});
