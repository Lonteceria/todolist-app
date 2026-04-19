import React, { useState } from 'react';
import type { TodoItem as TodoItemType } from '../types';
import { validateTitle } from '../utils/validateTitle';
import { validateDescription } from '../utils/validateDescription';
import { ConfirmDialog } from './ConfirmDialog';
import styles from './TodoItem.module.css';

interface TodoItemProps {
  item: TodoItemType;
  onToggle: (id: string) => void;
  onEdit: (id: string, newTitle: string, newDescription: string) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ item, onToggle, onEdit, onDelete }: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.title);
  const [editDesc, setEditDesc] = useState(item.description);
  const [editError, setEditError] = useState('');
  const [editDescError, setEditDescError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const createdAt = new Date(item.createdAt).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  function handleEditStart() {
    setEditValue(item.title);
    setEditDesc(item.description);
    setEditError('');
    setEditDescError('');
    setEditing(true);
  }

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEditValue(e.target.value);
    if (editError) setEditError('');
  }

  function handleEditDescChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEditDesc(e.target.value);
    if (editDescError) setEditDescError('');
  }

  function handleEditSave() {
    const titleResult = validateTitle(editValue);
    const descResult = validateDescription(editDesc);
    if (!titleResult.valid) setEditError(titleResult.error);
    if (!descResult.valid) setEditDescError(descResult.error);
    if (!titleResult.valid || !descResult.valid) return;
    onEdit(item.id, editValue.trim(), editDesc.trim());
    setEditing(false);
    setEditError('');
    setEditDescError('');
  }

  function handleEditCancel() {
    setEditing(false);
    setEditValue(item.title);
    setEditDesc(item.description);
    setEditError('');
    setEditDescError('');
  }

  function handleEditKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleEditSave();
    if (e.key === 'Escape') handleEditCancel();
  }

  return (
    <>
      <li className={styles.item}>
        <input
          type="checkbox"
          checked={item.completed}
          onChange={() => onToggle(item.id)}
          aria-label={`Tandai "${item.title}" sebagai ${item.completed ? 'belum selesai' : 'selesai'}`}
          className={styles.checkbox}
        />

        <div className={styles.content}>
          {editing ? (
            <div>
              <input
                type="text"
                value={editValue}
                onChange={handleEditChange}
                onKeyDown={handleEditKeyDown}
                autoFocus
                aria-label="Edit judul tugas"
                className={[styles.editInput, editError ? styles.editInputError : ''].filter(Boolean).join(' ')}
              />
              {editError && (
                <p role="alert" className={styles.errorMsg}>
                  {editError}
                </p>
              )}
              <input
                type="text"
                value={editDesc}
                onChange={handleEditDescChange}
                onKeyDown={handleEditKeyDown}
                placeholder="Deskripsi (3–50 karakter)"
                aria-label="Edit deskripsi tugas"
                className={[styles.editInput, editDescError ? styles.editInputError : ''].filter(Boolean).join(' ')}
              />
              {editDescError && (
                <p role="alert" className={styles.errorMsg}>
                  {editDescError}
                </p>
              )}
              <div className={styles.editActions}>
                <button onClick={handleEditSave} className={styles.saveBtn}>
                  Simpan
                </button>
                <button onClick={handleEditCancel} className={styles.cancelBtn}>
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <>
              <span className={[styles.title, item.completed ? styles.titleCompleted : ''].filter(Boolean).join(' ')}>
                {item.title}
              </span>
              <span className={styles.description}>
                {item.description}
              </span>
              <time dateTime={item.createdAt} className={styles.time}>
                {createdAt}
              </time>
            </>
          )}
        </div>

        {!editing && (
          <div className={styles.actions}>
            <button
              onClick={handleEditStart}
              aria-label={`Edit tugas "${item.title}"`}
              className={styles.iconBtn}
            >
              ✏️
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              aria-label={`Hapus tugas "${item.title}"`}
              className={styles.iconBtn}
            >
              🗑️
            </button>
          </div>
        )}
      </li>

      {showConfirm && (
        <ConfirmDialog
          message={`Hapus tugas "${item.title}"?`}
          onConfirm={() => {
            setShowConfirm(false);
            onDelete(item.id);
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
