import type { ValidationResult } from '../types';

const MAX_TITLE_LENGTH = 200;

export function validateTitle(title: string): ValidationResult {
  if (title.trim().length === 0) {
    return { valid: false, error: 'Judul tugas tidak boleh kosong' };
  }
  if (title.trim().length > MAX_TITLE_LENGTH) {
    return { valid: false, error: 'Judul tugas maksimal 200 karakter' };
  }
  return { valid: true };
}
