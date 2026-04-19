import { useReducer, useEffect, useMemo } from 'react';
import type { TodoItem, FilterType, FilterCounts, ValidationResult } from '../types';
import { validateTitle } from '../utils/validateTitle';
import { validateDescription } from '../utils/validateDescription';
import { load, save } from '../services/storageService';

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type Action =
  | { type: 'ADD_TODO'; payload: { title: string; description: string } }
  | { type: 'TOGGLE_TODO'; payload: { id: string } }
  | { type: 'EDIT_TODO'; payload: { id: string; newTitle: string; newDescription: string } }
  | { type: 'DELETE_TODO'; payload: { id: string } }
  | { type: 'DELETE_COMPLETED' }
  | { type: 'SET_FILTER'; payload: { filter: FilterType } };

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface State {
  todos: TodoItem[];
  filter: FilterType;
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TODO': {
      const { title, description } = action.payload;
      const newItem: TodoItem = {
        id: crypto.randomUUID(),
        title: title.trim(),
        description: description.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      };
      return { ...state, todos: [newItem, ...state.todos] };
    }

    case 'TOGGLE_TODO': {
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.payload.id ? { ...t, completed: !t.completed } : t
        ),
      };
    }

    case 'EDIT_TODO': {
      const { id, newTitle, newDescription } = action.payload;
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === id
            ? { ...t, title: newTitle.trim(), description: newDescription.trim() }
            : t
        ),
      };
    }

    case 'DELETE_TODO': {
      return {
        ...state,
        todos: state.todos.filter((t) => t.id !== action.payload.id),
      };
    }

    case 'DELETE_COMPLETED': {
      return {
        ...state,
        todos: state.todos.filter((t) => !t.completed),
      };
    }

    case 'SET_FILTER': {
      return { ...state, filter: action.payload.filter };
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTodoStore() {
  const [state, dispatch] = useReducer(reducer, undefined, (): State => ({
    todos: load(),
    filter: 'all',
  }));

  // Persist on every todos mutation
  useEffect(() => {
    save(state.todos);
  }, [state.todos]);

  // filteredTodos — sorted descending by createdAt
  const filteredTodos = useMemo((): TodoItem[] => {
    const sorted = [...state.todos].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (state.filter === 'active') return sorted.filter((t) => !t.completed);
    if (state.filter === 'completed') return sorted.filter((t) => t.completed);
    return sorted;
  }, [state.todos, state.filter]);

  // counts
  const counts = useMemo((): FilterCounts => {
    const completed = state.todos.filter((t) => t.completed).length;
    return {
      all: state.todos.length,
      active: state.todos.length - completed,
      completed,
    };
  }, [state.todos]);

  // ---------------------------------------------------------------------------
  // Action creators with validation
  // ---------------------------------------------------------------------------

  function addTodo(title: string, description: string): ValidationResult {
    const titleResult = validateTitle(title);
    if (!titleResult.valid) return titleResult;

    const descResult = validateDescription(description);
    if (!descResult.valid) return descResult;

    dispatch({ type: 'ADD_TODO', payload: { title, description } });
    return { valid: true };
  }

  function toggleTodo(id: string): void {
    dispatch({ type: 'TOGGLE_TODO', payload: { id } });
  }

  function editTodo(id: string, newTitle: string, newDescription: string): ValidationResult {
    const titleResult = validateTitle(newTitle);
    if (!titleResult.valid) return titleResult;

    const descResult = validateDescription(newDescription);
    if (!descResult.valid) return descResult;

    dispatch({ type: 'EDIT_TODO', payload: { id, newTitle, newDescription } });
    return { valid: true };
  }

  function deleteTodo(id: string): void {
    dispatch({ type: 'DELETE_TODO', payload: { id } });
  }

  function deleteCompleted(): void {
    dispatch({ type: 'DELETE_COMPLETED' });
  }

  function setFilter(filter: FilterType): void {
    dispatch({ type: 'SET_FILTER', payload: { filter } });
  }

  return {
    todos: state.todos,
    filter: state.filter,
    filteredTodos,
    counts,
    addTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
    deleteCompleted,
    setFilter,
  };
}
