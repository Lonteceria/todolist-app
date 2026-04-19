import React, { useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import styles from './ActionBar.module.css';

interface ActionBarProps {
  completedCount: number;
  onDeleteCompleted: () => void;
}

export function ActionBar({ completedCount, onDeleteCompleted }: ActionBarProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const disabled = completedCount === 0;

  function handleClick() {
    if (!disabled) setShowConfirm(true);
  }

  function handleConfirm() {
    setShowConfirm(false);
    onDeleteCompleted();
  }

  return (
    <>
      <div className={styles.bar}>
        <button
          onClick={handleClick}
          disabled={disabled}
          className={[styles.btn, disabled ? styles.disabled : ''].filter(Boolean).join(' ')}
          aria-disabled={disabled}
        >
          Hapus Semua Selesai
          {completedCount > 0 && (
            <span className={styles.badge}>{completedCount}</span>
          )}
        </button>
      </div>
      {showConfirm && (
        <ConfirmDialog
          message={`Hapus semua ${completedCount} tugas yang sudah selesai?`}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
