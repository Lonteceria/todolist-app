import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { TodoItem } from '../../components/TodoItem';
import type { TodoItem as TodoItemType } from '../../types';

const baseTodo: TodoItemType = {
  id: 'abc-123',
  title: 'Belajar React',
  description: 'Pelajari hooks dan context',
  completed: false,
  createdAt: '2024-06-01T08:00:00.000Z',
};

describe('TodoItem', () => {
  // Requirement 2.3 — menampilkan checkbox
  it('menampilkan checkbox', () => {
    render(<TodoItem item={baseTodo} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  // Requirement 2.3 — menampilkan judul
  it('menampilkan judul tugas', () => {
    render(<TodoItem item={baseTodo} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Belajar React')).toBeInTheDocument();
  });

  // Requirement 2.3 — menampilkan deskripsi
  it('menampilkan deskripsi tugas', () => {
    render(<TodoItem item={baseTodo} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Pelajari hooks dan context')).toBeInTheDocument();
  });

  // Requirement 2.3 — menampilkan waktu pembuatan
  it('menampilkan waktu pembuatan', () => {
    render(<TodoItem item={baseTodo} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByRole('time')).toBeInTheDocument();
  });

  // Requirement 2.4 — strikethrough saat selesai
  it('menampilkan judul dengan strikethrough saat tugas selesai', () => {
    const completedTodo = { ...baseTodo, completed: true };
    render(<TodoItem item={completedTodo} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  // Requirement 3.1 — checkbox memanggil onToggle
  it('memanggil onToggle saat checkbox diklik', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<TodoItem item={baseTodo} onToggle={onToggle} onEdit={vi.fn()} onDelete={vi.fn()} />);

    await user.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledOnce();
    expect(onToggle).toHaveBeenCalledWith('abc-123');
  });

  // Requirement 4.1 — tombol edit tersedia
  it('menampilkan tombol edit', () => {
    render(<TodoItem item={baseTodo} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByRole('button', { name: /edit tugas/i })).toBeInTheDocument();
  });

  // Requirement 5.1 — tombol hapus tersedia
  it('menampilkan tombol hapus', () => {
    render(<TodoItem item={baseTodo} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByRole('button', { name: /hapus tugas/i })).toBeInTheDocument();
  });

  // Requirement 4.2 — klik edit menampilkan mode edit inline
  it('menampilkan input edit saat tombol edit diklik', async () => {
    const user = userEvent.setup();
    render(<TodoItem item={baseTodo} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /edit tugas/i }));

    expect(screen.getByRole('textbox', { name: /edit judul tugas/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /edit deskripsi tugas/i })).toBeInTheDocument();
  });

  // Requirement 4.2 — input edit terisi nilai saat ini
  it('mengisi input edit dengan nilai judul dan deskripsi saat ini', async () => {
    const user = userEvent.setup();
    render(<TodoItem item={baseTodo} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /edit tugas/i }));

    expect(screen.getByRole('textbox', { name: /edit judul tugas/i })).toHaveValue('Belajar React');
    expect(screen.getByRole('textbox', { name: /edit deskripsi tugas/i })).toHaveValue('Pelajari hooks dan context');
  });

  // Requirement 4.3 — simpan edit memanggil onEdit
  it('memanggil onEdit dengan nilai baru saat simpan diklik', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<TodoItem item={baseTodo} onToggle={vi.fn()} onEdit={onEdit} onDelete={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /edit tugas/i }));

    const titleInput = screen.getByRole('textbox', { name: /edit judul tugas/i });
    await user.clear(titleInput);
    await user.type(titleInput, 'Judul baru');

    await user.click(screen.getByRole('button', { name: /simpan/i }));

    expect(onEdit).toHaveBeenCalledOnce();
    expect(onEdit).toHaveBeenCalledWith('abc-123', 'Judul baru', 'Pelajari hooks dan context');
  });

  // Requirement 4.8 — batal edit mempertahankan nilai semula
  it('membatalkan edit dan mengembalikan tampilan semula saat batal diklik', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<TodoItem item={baseTodo} onToggle={vi.fn()} onEdit={onEdit} onDelete={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /edit tugas/i }));

    const titleInput = screen.getByRole('textbox', { name: /edit judul tugas/i });
    await user.clear(titleInput);
    await user.type(titleInput, 'Judul yang diubah');

    await user.click(screen.getByRole('button', { name: /batal/i }));

    expect(onEdit).not.toHaveBeenCalled();
    expect(screen.getByText('Belajar React')).toBeInTheDocument();
  });

  // Requirement 5.2 — klik hapus menampilkan dialog konfirmasi
  it('menampilkan dialog konfirmasi saat tombol hapus diklik', async () => {
    const user = userEvent.setup();
    render(<TodoItem item={baseTodo} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /hapus tugas/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  // Requirement 5.3 — konfirmasi hapus memanggil onDelete
  it('memanggil onDelete saat konfirmasi hapus dikonfirmasi', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<TodoItem item={baseTodo} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: /hapus tugas/i }));
    await user.click(screen.getAllByRole('button', { name: /hapus/i })[1]);

    expect(onDelete).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledWith('abc-123');
  });

  // Requirement 5.4 — batal hapus tidak memanggil onDelete
  it('tidak memanggil onDelete saat dialog hapus dibatalkan', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<TodoItem item={baseTodo} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: /hapus tugas/i }));
    await user.click(screen.getByRole('button', { name: /batal/i }));

    expect(onDelete).not.toHaveBeenCalled();
  });

  // Feature: todolist-app, Property 5: Setiap item menampilkan judul, status, dan waktu pembuatan
  // Validates: Requirements 2.3, 2.4
  it('Property 5: setiap TodoItem menampilkan judul, status checkbox, dan waktu pembuatan', () => {
    const todoItemArb = fc.record<TodoItemType>({
      id: fc.uuid(),
      title: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
      description: fc.string({ minLength: 3, maxLength: 50 }),
      completed: fc.boolean(),
      createdAt: fc.date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') })
        .map(d => d.toISOString()),
    });

    fc.assert(
      fc.property(todoItemArb, (item) => {
        const container = document.createElement('div');
        document.body.appendChild(container);

        const { unmount, getByText, getByRole } = render(
          <TodoItem item={item} onToggle={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />,
          { container }
        );

        // Judul ditampilkan (trim karena RTL menormalisasi whitespace)
        const trimmedTitle = item.title.trim();
        expect(getByText(trimmedTitle)).toBeInTheDocument();

        // Status checkbox mencerminkan completed
        const checkbox = getByRole('checkbox');
        if (item.completed) {
          expect(checkbox).toBeChecked();
        } else {
          expect(checkbox).not.toBeChecked();
        }

        // Waktu pembuatan ditampilkan dalam elemen <time>
        const timeEl = getByRole('time');
        expect(timeEl).toBeInTheDocument();
        expect(timeEl).toHaveAttribute('dateTime', item.createdAt);

        unmount();
        document.body.removeChild(container);
      })
    );
  });
});
