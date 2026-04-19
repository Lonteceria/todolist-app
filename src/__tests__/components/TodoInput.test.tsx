import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TodoInput } from '../../components/TodoInput';

describe('TodoInput', () => {
  // Requirement 1.1 — input judul tersedia
  it('menampilkan input judul', () => {
    render(<TodoInput onAdd={vi.fn()} />);
    expect(screen.getByRole('textbox', { name: /judul tugas baru/i })).toBeInTheDocument();
  });

  // Requirement 1.2 — input deskripsi tersedia
  it('menampilkan input deskripsi', () => {
    render(<TodoInput onAdd={vi.fn()} />);
    expect(screen.getByRole('textbox', { name: /deskripsi tugas baru/i })).toBeInTheDocument();
  });

  // Requirement 1.3 — submit valid memanggil onAdd dengan judul dan deskripsi
  it('memanggil onAdd dengan judul dan deskripsi yang valid saat submit', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);

    await user.type(screen.getByRole('textbox', { name: /judul tugas baru/i }), 'Belajar TypeScript');
    await user.type(screen.getByRole('textbox', { name: /deskripsi tugas baru/i }), 'Belajar dasar TS');
    await user.click(screen.getByRole('button', { name: /tambah/i }));

    expect(onAdd).toHaveBeenCalledOnce();
    expect(onAdd).toHaveBeenCalledWith('Belajar TypeScript', 'Belajar dasar TS');
  });

  // Requirement 1.4 — input dikosongkan setelah submit berhasil
  it('mengosongkan input setelah submit berhasil', async () => {
    const user = userEvent.setup();
    render(<TodoInput onAdd={vi.fn()} />);

    const titleInput = screen.getByRole('textbox', { name: /judul tugas baru/i });
    const descInput = screen.getByRole('textbox', { name: /deskripsi tugas baru/i });

    await user.type(titleInput, 'Tugas baru');
    await user.type(descInput, 'Deskripsi tugas');
    await user.click(screen.getByRole('button', { name: /tambah/i }));

    expect(titleInput).toHaveValue('');
    expect(descInput).toHaveValue('');
  });

  // Requirement 1.5 — submit dengan judul kosong menampilkan error
  it('menampilkan error judul saat submit dengan judul kosong', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);

    await user.click(screen.getByRole('button', { name: /tambah/i }));

    expect(screen.getByText('Judul tugas tidak boleh kosong')).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  // Requirement 1.5 — submit dengan judul whitespace-only menampilkan error
  it('menampilkan error judul saat submit dengan judul hanya spasi', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);

    await user.type(screen.getByRole('textbox', { name: /judul tugas baru/i }), '   ');
    await user.click(screen.getByRole('button', { name: /tambah/i }));

    expect(screen.getByText('Judul tugas tidak boleh kosong')).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  // Requirement 1.6 — judul > 200 karakter menampilkan error
  it('menampilkan error saat judul melebihi 200 karakter', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);

    const longTitle = 'a'.repeat(201);
    await user.type(screen.getByRole('textbox', { name: /judul tugas baru/i }), longTitle);
    await user.type(screen.getByRole('textbox', { name: /deskripsi tugas baru/i }), 'Deskripsi valid');
    await user.click(screen.getByRole('button', { name: /tambah/i }));

    expect(screen.getByText('Judul tugas maksimal 200 karakter')).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  // Requirement 1.8 — submit dengan deskripsi kosong menampilkan error
  it('menampilkan error deskripsi saat submit dengan deskripsi kosong', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);

    await user.type(screen.getByRole('textbox', { name: /judul tugas baru/i }), 'Judul valid');
    await user.click(screen.getByRole('button', { name: /tambah/i }));

    expect(screen.getByText('Deskripsi tugas tidak boleh kosong')).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  // Requirement 1.9 — deskripsi < 3 karakter menampilkan error
  it('menampilkan error saat deskripsi kurang dari 3 karakter', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);

    await user.type(screen.getByRole('textbox', { name: /judul tugas baru/i }), 'Judul valid');
    await user.type(screen.getByRole('textbox', { name: /deskripsi tugas baru/i }), 'ab');
    await user.click(screen.getByRole('button', { name: /tambah/i }));

    expect(screen.getByText('Deskripsi tugas minimal 3 karakter')).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  // Requirement 1.10 — deskripsi > 50 karakter menampilkan error
  it('menampilkan error saat deskripsi melebihi 50 karakter', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);

    await user.type(screen.getByRole('textbox', { name: /judul tugas baru/i }), 'Judul valid');
    await user.type(screen.getByRole('textbox', { name: /deskripsi tugas baru/i }), 'a'.repeat(51));
    await user.click(screen.getByRole('button', { name: /tambah/i }));

    expect(screen.getByText('Deskripsi tugas maksimal 50 karakter')).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  // Error judul hilang saat mengetik kembali
  it('menghapus error judul saat pengguna mulai mengetik', async () => {
    const user = userEvent.setup();
    render(<TodoInput onAdd={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /tambah/i }));
    expect(screen.getByText('Judul tugas tidak boleh kosong')).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: /judul tugas baru/i }), 'T');
    expect(screen.queryByText('Judul tugas tidak boleh kosong')).not.toBeInTheDocument();
  });

  // Error deskripsi hilang saat mengetik kembali
  it('menghapus error deskripsi saat pengguna mulai mengetik', async () => {
    const user = userEvent.setup();
    render(<TodoInput onAdd={vi.fn()} />);

    await user.type(screen.getByRole('textbox', { name: /judul tugas baru/i }), 'Judul valid');
    await user.click(screen.getByRole('button', { name: /tambah/i }));
    expect(screen.getByText('Deskripsi tugas tidak boleh kosong')).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: /deskripsi tugas baru/i }), 'D');
    expect(screen.queryByText('Deskripsi tugas tidak boleh kosong')).not.toBeInTheDocument();
  });
});
