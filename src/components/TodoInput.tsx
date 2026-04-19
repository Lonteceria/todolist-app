import React, { useState } from 'react';
import { validateTitle } from '../utils/validateTitle';
import { validateDescription } from '../utils/validateDescription';
import styles from './TodoInput.module.css';

interface TodoInputProps {
  onAdd: (title: string, description: string) => void;
}

export function TodoInput({ onAdd }: TodoInputProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleError, setTitleError] = useState('');
  const [descError, setDescError] = useState('');

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
    if (titleError) setTitleError('');
  }

  function handleDescChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDescription(e.target.value);
    if (descError) setDescError('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const titleResult = validateTitle(title);
    const descResult = validateDescription(description);

    if (!titleResult.valid) setTitleError(titleResult.error);
    if (!descResult.valid) setDescError(descResult.error);
    if (!titleResult.valid || !descResult.valid) return;

    onAdd(title.trim(), description.trim());
    setTitle('');
    setDescription('');
    setTitleError('');
    setDescError('');
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.inputRow}>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Tambahkan tugas baru..."
          aria-label="Judul tugas baru"
          className={[styles.input, titleError ? styles.inputError : ''].filter(Boolean).join(' ')}
        />
        <button type="submit" className={styles.button}>
          Tambah
        </button>
      </div>
      {titleError && (
        <p role="alert" className={styles.errorMsg}>
          {titleError}
        </p>
      )}
      <div className={styles.inputRow}>
        <input
          type="text"
          value={description}
          onChange={handleDescChange}
          placeholder="Deskripsi tugas (3–50 karakter)..."
          aria-label="Deskripsi tugas baru"
          className={[styles.input, descError ? styles.inputError : ''].filter(Boolean).join(' ')}
        />
      </div>
      {descError && (
        <p role="alert" className={styles.errorMsg}>
          {descError}
        </p>
      )}
    </form>
  );
}
