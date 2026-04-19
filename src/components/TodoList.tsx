import React from 'react';
import type { TodoItem as TodoItemType } from '../types';
import { TodoItem } from './TodoItem';
import styles from './TodoList.module.css';

interface TodoListProps {
  items: TodoItemType[];
  onToggle: (id: string) => void;
  onEdit: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
}

export function TodoList({ items, onToggle, onEdit, onDelete }: TodoListProps) {
  if (items.length === 0) {
    return (
      <p className={styles.empty}>Belum ada tugas. Tambahkan tugas pertama Anda!</p>
    );
  }

  return (
    <ul className={styles.list} aria-label="Daftar tugas">
      {items.map((item) => (
        <TodoItem
          key={item.id}
          item={item}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
