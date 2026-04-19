import React from 'react';
import { TodoInput } from './components/TodoInput';
import { FilterBar } from './components/FilterBar';
import { ActionBar } from './components/ActionBar';
import { TodoList } from './components/TodoList';
import styles from './App.module.css';
import { useTodoStore } from './hooks/useTodoStore';

export default function App() {
  const {
    filteredTodos,
    filter,
    counts,
    addTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
    deleteCompleted,
    setFilter,
  } = useTodoStore();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.heading}>📝 Todolist App</h1>
        <TodoInput onAdd={addTodo} />
        <div className={styles.toolbar}>
          <FilterBar
            activeFilter={filter}
            counts={counts}
            onFilterChange={setFilter}
          />
          <ActionBar
            completedCount={counts.completed}
            onDeleteCompleted={deleteCompleted}
          />
        </div>
        <TodoList
          items={filteredTodos}
          onToggle={toggleTodo}
          onEdit={editTodo}
          onDelete={deleteTodo}
        />
      </div>
    </div>
  );
}
