export interface TodoItem {
  id: string;          // UUID v4, unik dan immutable
  title: string;       // Judul tugas, 1–200 karakter (setelah trim)
  description: string; // Deskripsi tugas, 3–50 karakter (setelah trim)
  completed: boolean;  // false = belum selesai, true = selesai
  createdAt: string;   // ISO 8601 timestamp
}

export type FilterType = 'all' | 'active' | 'completed';

export interface FilterCounts {
  all: number;
  active: number;
  completed: number;
}

export type ValidationResult =
  | { valid: true }
  | { valid: false; error: string };
