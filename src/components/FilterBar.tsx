import React from 'react';
import type { FilterType, FilterCounts } from '../types';
import styles from './FilterBar.module.css';

interface FilterBarProps {
  activeFilter: FilterType;
  counts: FilterCounts;
  onFilterChange: (filter: FilterType) => void;
}

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'active', label: 'Belum Selesai' },
  { key: 'completed', label: 'Selesai' },
];

export function FilterBar({ activeFilter, counts, onFilterChange }: FilterBarProps) {
  return (
    <div className={styles.bar} role="group" aria-label="Filter tugas">
      {FILTERS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onFilterChange(key)}
          aria-pressed={activeFilter === key}
          className={[styles.btn, activeFilter === key ? styles.active : ''].filter(Boolean).join(' ')}
        >
          {label}
          <span className={styles.count}>{counts[key]}</span>
        </button>
      ))}
    </div>
  );
}
