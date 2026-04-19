import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TodoList } from '../../components/TodoList';
import type { TodoItem } from '../../types';

const makeTodo = (overrides: Partial<TodoItem> = {}): TodoItem => ({
  id: '1',
  title: 'Tugas contoh',
  description: 'Deskripsi contoh',
  completed: false,
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe('TodoList', () => {
  // Requirement 2.2 — pesan empty state saat list kosong
  it('menampilkan pesan empty state saat list kosong', () => {
    render(
      <TodoList items={[]} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />
    );
    expect(
      screen.getByText('Belum ada tugas. Tambahkan tugas pertama Anda!')
    ).toBeInTheDocument();
  });

  // Requirement 2.1 — menampilkan daftar item
  it('merender daftar item saat list tidak kosong', () => {
    const items = [
      makeTodo({ id: '1', title: 'Tugas pertama' }),
      makeTodo({ id: '2', title: 'Tugas kedua' }),
    ];
    render(
      <TodoList items={items} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />
    );

    expect(screen.getByText('Tugas pertama')).toBeInTheDocument();
    expect(screen.getByText('Tugas kedua')).toBeInTheDocument();
  });

  // Tidak menampilkan empty state saat ada item
  it('tidak menampilkan pesan empty state saat ada item', () => {
    const items = [makeTodo({ id: '1', title: 'Tugas ada' })];
    render(
      <TodoList items={items} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />
    );

    expect(
      screen.queryByText('Belum ada tugas. Tambahkan tugas pertama Anda!')
    ).not.toBeInTheDocument();
  });

  // Menampilkan semua item yang diberikan
  it('merender jumlah item yang sesuai', () => {
    const items = [
      makeTodo({ id: '1', title: 'Tugas A' }),
      makeTodo({ id: '2', title: 'Tugas B' }),
      makeTodo({ id: '3', title: 'Tugas C' }),
    ];
    render(
      <TodoList items={items} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });
});
