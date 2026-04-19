import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FilterBar } from '../../components/FilterBar';
import type { FilterCounts } from '../../types';

const counts: FilterCounts = { all: 5, active: 3, completed: 2 };

describe('FilterBar', () => {
  // Requirement 6.1 — tiga tombol filter tersedia
  it('menampilkan tiga tombol filter', () => {
    render(
      <FilterBar activeFilter="all" counts={counts} onFilterChange={vi.fn()} />
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    expect(screen.getByRole('button', { name: /semua/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /belum selesai/i })).toBeInTheDocument();
    // Use exact text to avoid matching "Belum Selesai"
    expect(screen.getByText('Selesai', { selector: 'button, button *' })).toBeInTheDocument();
  });

  // Requirement 6.5 — jumlah item ditampilkan per filter
  it('menampilkan jumlah item untuk setiap filter', () => {
    render(
      <FilterBar activeFilter="all" counts={counts} onFilterChange={vi.fn()} />
    );
    expect(screen.getByRole('button', { name: /semua/i })).toHaveTextContent('5');
    expect(screen.getByRole('button', { name: /belum selesai/i })).toHaveTextContent('3');
    // The "Selesai" button contains count 2
    const buttons = screen.getAllByRole('button');
    const selesaiBtn = buttons.find(b => b.textContent?.trim().startsWith('Selesai'));
    expect(selesaiBtn).toHaveTextContent('2');
  });

  // Filter aktif ditandai dengan aria-pressed
  it('menandai filter aktif dengan aria-pressed=true', () => {
    render(
      <FilterBar activeFilter="active" counts={counts} onFilterChange={vi.fn()} />
    );
    expect(screen.getByRole('button', { name: /belum selesai/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /semua/i })).toHaveAttribute('aria-pressed', 'false');
    const buttons = screen.getAllByRole('button');
    const selesaiBtn = buttons.find(b => b.textContent?.trim().startsWith('Selesai'));
    expect(selesaiBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('menandai filter "Selesai" aktif saat activeFilter=completed', () => {
    render(
      <FilterBar activeFilter="completed" counts={counts} onFilterChange={vi.fn()} />
    );
    const buttons = screen.getAllByRole('button');
    const selesaiBtn = buttons.find(b => b.textContent?.trim().startsWith('Selesai'));
    expect(selesaiBtn).toHaveAttribute('aria-pressed', 'true');
  });

  // Klik filter memanggil onFilterChange dengan key yang benar
  it('memanggil onFilterChange dengan "all" saat tombol Semua diklik', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    render(
      <FilterBar activeFilter="active" counts={counts} onFilterChange={onFilterChange} />
    );

    await user.click(screen.getByRole('button', { name: /semua/i }));
    expect(onFilterChange).toHaveBeenCalledWith('all');
  });

  it('memanggil onFilterChange dengan "active" saat tombol Belum Selesai diklik', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    render(
      <FilterBar activeFilter="all" counts={counts} onFilterChange={onFilterChange} />
    );

    await user.click(screen.getByRole('button', { name: /belum selesai/i }));
    expect(onFilterChange).toHaveBeenCalledWith('active');
  });

  it('memanggil onFilterChange dengan "completed" saat tombol Selesai diklik', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    render(
      <FilterBar activeFilter="all" counts={counts} onFilterChange={onFilterChange} />
    );

    await user.click(screen.getByRole('button', { name: /^selesai/i }));
    expect(onFilterChange).toHaveBeenCalledWith('completed');
  });
});
