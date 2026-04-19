import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateDescription } from '../utils/validateDescription';

describe('validateDescription', () => {
  // Example-based tests

  test('menerima deskripsi yang valid', () => {
    const result = validateDescription('Belajar TypeScript dasar');
    expect(result.valid).toBe(true);
  });

  test('menerima deskripsi tepat 3 karakter', () => {
    const result = validateDescription('abc');
    expect(result.valid).toBe(true);
  });

  test('menerima deskripsi tepat 50 karakter', () => {
    const result = validateDescription('a'.repeat(50));
    expect(result.valid).toBe(true);
  });

  test('menolak string kosong', () => {
    const result = validateDescription('');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe('Deskripsi tugas tidak boleh kosong');
    }
  });

  test('menolak string yang hanya berisi spasi', () => {
    const result = validateDescription('   ');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe('Deskripsi tugas tidak boleh kosong');
    }
  });

  test('menolak string yang hanya berisi tab dan newline', () => {
    const result = validateDescription('\t\n\r');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe('Deskripsi tugas tidak boleh kosong');
    }
  });

  test('menolak deskripsi kurang dari 3 karakter', () => {
    const result = validateDescription('ab');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe('Deskripsi tugas minimal 3 karakter');
    }
  });

  test('menolak deskripsi 1 karakter', () => {
    const result = validateDescription('x');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe('Deskripsi tugas minimal 3 karakter');
    }
  });

  test('menolak deskripsi lebih dari 50 karakter', () => {
    const result = validateDescription('a'.repeat(51));
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe('Deskripsi tugas maksimal 50 karakter');
    }
  });

  test('menolak deskripsi 100 karakter', () => {
    const result = validateDescription('x'.repeat(100));
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBe('Deskripsi tugas maksimal 50 karakter');
    }
  });

  // Property-based tests

  // Feature: todolist-app, Property 2b: Input whitespace-only ditolak
  // Validates: Requirements 1.8
  test('menolak semua string whitespace-only', () => {
    fc.assert(
      fc.property(
        fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r')),
        (whitespace) => {
          const result = validateDescription(whitespace);
          expect(result.valid).toBe(false);
          if (!result.valid) {
            expect(result.error).toBe('Deskripsi tugas tidak boleh kosong');
          }
        }
      )
    );
  });

  // Feature: todolist-app, Property 3b: Validasi panjang deskripsi (terlalu pendek)
  // Validates: Requirements 1.9
  test('menolak semua deskripsi dengan panjang trimmed < 3 (non-whitespace)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 2 }).filter(s => s.trim().length > 0 && s.trim().length < 3),
        (shortDesc) => {
          const result = validateDescription(shortDesc);
          expect(result.valid).toBe(false);
          if (!result.valid) {
            expect(result.error).toBe('Deskripsi tugas minimal 3 karakter');
          }
        }
      )
    );
  });

  // Feature: todolist-app, Property 3b: Validasi panjang deskripsi (terlalu panjang)
  // Validates: Requirements 1.10
  test('menolak semua deskripsi dengan panjang trimmed > 50', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 51, maxLength: 200 }).filter(s => s.trim().length > 50),
        (longDesc) => {
          const result = validateDescription(longDesc);
          expect(result.valid).toBe(false);
          if (!result.valid) {
            expect(result.error).toBe('Deskripsi tugas maksimal 50 karakter');
          }
        }
      )
    );
  });

  // Feature: todolist-app, Property 3b: Validasi panjang deskripsi (valid)
  // Validates: Requirements 1.9, 1.10
  test('menerima semua deskripsi valid (non-whitespace, panjang trimmed 3–50)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 3, maxLength: 50 }).filter(s => s.trim().length >= 3 && s.trim().length <= 50),
        (validDesc) => {
          const result = validateDescription(validDesc);
          expect(result.valid).toBe(true);
        }
      )
    );
  });
});
