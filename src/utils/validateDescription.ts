import type { ValidationResult } from '../types';

const MIN_DESCRIPTION_LENGTH = 3;
const MAX_DESCRIPTION_LENGTH = 50;

export function validateDescription(description: string): ValidationResult {
  const trimmed = description.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Deskripsi tugas tidak boleh kosong' };
  }
  if (trimmed.length < MIN_DESCRIPTION_LENGTH) {
    return { valid: false, error: `Deskripsi tugas minimal ${MIN_DESCRIPTION_LENGTH} karakter` };
  }
  if (trimmed.length > MAX_DESCRIPTION_LENGTH) {
    return { valid: false, error: `Deskripsi tugas maksimal ${MAX_DESCRIPTION_LENGTH} karakter` };
  }
  return { valid: true };
}
