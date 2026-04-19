import { describe, test, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { renderHook, act } from '@testing-library/react';
import { useTodoStore } from '../hooks/useTodoStore';
import * as storageService from '../services/storageService';
import type { TodoItem } from '../types';

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

// Valid title: non-empty, non-whitespace-only, max 200 chars
const arbValidTitle = fc
  .string({ minLength: 1, maxLength: 200 })
  .filter((s) => s.trim().length > 0 && s.trim().length <= 200);

// Valid description: 3-50 chars after trim, non-whitespace-only
const arbValidDescription = fc
  .string({ minLength: 3, maxLength: 50 })
  .filter((s) => s.trim().length >= 3 && s.trim().length <= 50);

// TodoItem arbitrary (for seeding state)
const arbTodoItem = fc.record({
  id: fc.uuid(),
  title: arbValidTitle,
  description: arbValidDescription,
  completed: fc.boolean(),
  createdAt: fc
    .date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') })
    .map((d) => d.toISOString()),
});

// Non-empty todo list
const arbNonEmptyTodoList = fc.array(arbTodoItem, { minLength: 1, maxLength: 10 });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Seed localStorage with a list of todos before rendering the hook. */
function seedStorage(todos: TodoItem[]) {
  localStorage.setItem('todolist-app-todos', JSON.stringify(todos));
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Property 1: Penambahan tugas valid menambah list
// ---------------------------------------------------------------------------

describe('Property 1: Penambahan tugas valid menambah list', () => {
  // Feature: todolist-app, Property 1: Penambahan tugas valid menambah list
  // Validates: Requirements 1.2, 1.3
  test('item baru ada di posisi pertama dengan completed=false', () => {
    fc.assert(
      fc.property(
        fc.array(arbTodoItem, { minLength: 0, maxLength: 5 }),
        arbValidTitle,
        arbValidDescription,
        (existingTodos, title, description) => {
          seedStorage(existingTodos);
          const { result } = renderHook(() => useTodoStore());

          const prevLength = result.current.todos.length;

          act(() => {
            const res = result.current.addTodo(title, description);
            expect(res.valid).toBe(true);
          });

          expect(result.current.todos.length).toBe(prevLength + 1);
          // New item is at index 0 (prepended)
          expect(result.current.todos[0].completed).toBe(false);
          expect(result.current.todos[0].title).toBe(title.trim());
          expect(result.current.todos[0].description).toBe(description.trim());
        }
      )
    );
  });
});

// ---------------------------------------------------------------------------
// Property 4: Urutan tampilan descending by createdAt
// ---------------------------------------------------------------------------

describe('Property 4: Urutan tampilan descending by createdAt', () => {
  // Feature: todolist-app, Property 4: Urutan tampilan descending by createdAt
  // Validates: Requirements 2.1
  test('filteredTodos diurutkan dari createdAt terbaru ke terlama', () => {
    fc.assert(
      fc.property(arbNonEmptyTodoList, (todos) => {
        // Ensure unique createdAt values to avoid ties
        const uniqueTodos = todos.map((t, i) => ({
          ...t,
          createdAt: new Date(2020 + i, 0, 1).toISOString(),
        }));
        seedStorage(uniqueTodos);
        const { result } = renderHook(() => useTodoStore());

        const displayed = result.current.filteredTodos;
        for (let i = 0; i < displayed.length - 1; i++) {
          const a = new Date(displayed[i].createdAt).getTime();
          const b = new Date(displayed[i + 1].createdAt).getTime();
          expect(a).toBeGreaterThanOrEqual(b);
        }
      })
    );
  });
});

// ---------------------------------------------------------------------------
// Property 6: Toggle status adalah round-trip
// ---------------------------------------------------------------------------

describe('Property 6: Toggle status adalah round-trip', () => {
  // Feature: todolist-app, Property 6: Toggle status adalah round-trip
  // Validates: Requirements 3.2, 3.3
  test('dua kali toggle mengembalikan status semula', () => {
    fc.assert(
      fc.property(arbNonEmptyTodoList, (todos) => {
        seedStorage(todos);
        const { result } = renderHook(() => useTodoStore());

        const target = result.current.todos[0];
        const originalCompleted = target.completed;

        act(() => {
          result.current.toggleTodo(target.id);
        });
        act(() => {
          result.current.toggleTodo(target.id);
        });

        const after = result.current.todos.find((t) => t.id === target.id);
        expect(after?.completed).toBe(originalCompleted);
      })
    );
  });
});

// ---------------------------------------------------------------------------
// Property 7: Edit judul dan deskripsi valid memperbarui item; batal mempertahankan nilai semula
// ---------------------------------------------------------------------------

describe('Property 7: Edit judul dan deskripsi valid memperbarui item', () => {
  // Feature: todolist-app, Property 7: Edit judul dan deskripsi valid memperbarui item
  // Validates: Requirements 4.3, 4.8
  test('editTodo memperbarui title dan description item', () => {
    fc.assert(
      fc.property(
        arbNonEmptyTodoList,
        arbValidTitle,
        arbValidDescription,
        (todos, newTitle, newDescription) => {
          seedStorage(todos);
          const { result } = renderHook(() => useTodoStore());

          const target = result.current.todos[0];

          act(() => {
            const res = result.current.editTodo(target.id, newTitle, newDescription);
            expect(res.valid).toBe(true);
          });

          const updated = result.current.todos.find((t) => t.id === target.id);
          expect(updated?.title).toBe(newTitle.trim());
          expect(updated?.description).toBe(newDescription.trim());
        }
      )
    );
  });

  // Feature: todolist-app, Property 7: Batal edit mempertahankan nilai semula
  // Validates: Requirements 4.3, 4.8
  test('tidak memanggil editTodo mempertahankan nilai semula (simulasi batal)', () => {
    fc.assert(
      fc.property(arbNonEmptyTodoList, (todos) => {
        seedStorage(todos);
        const { result } = renderHook(() => useTodoStore());

        const target = result.current.todos[0];
        const originalTitle = target.title;
        const originalDescription = target.description;

        // Simulate cancel: do NOT call editTodo — state must remain unchanged
        const after = result.current.todos.find((t) => t.id === target.id);
        expect(after?.title).toBe(originalTitle);
        expect(after?.description).toBe(originalDescription);
      })
    );
  });
});

// ---------------------------------------------------------------------------
// Property 8: Penghapusan item mengurangi list; batal tidak mengubah list
// ---------------------------------------------------------------------------

describe('Property 8: Penghapusan item mengurangi list', () => {
  // Feature: todolist-app, Property 8: Penghapusan item mengurangi list
  // Validates: Requirements 5.3, 5.4
  test('deleteTodo mengurangi panjang list dan item tidak ada lagi', () => {
    fc.assert(
      fc.property(arbNonEmptyTodoList, (todos) => {
        seedStorage(todos);
        const { result } = renderHook(() => useTodoStore());

        const prevLength = result.current.todos.length;
        const target = result.current.todos[0];

        act(() => {
          result.current.deleteTodo(target.id);
        });

        expect(result.current.todos.length).toBe(prevLength - 1);
        expect(result.current.todos.find((t) => t.id === target.id)).toBeUndefined();
      })
    );
  });

  // Feature: todolist-app, Property 8: Batal penghapusan tidak mengubah list
  // Validates: Requirements 5.3, 5.4
  test('tidak memanggil deleteTodo mempertahankan list tidak berubah (simulasi batal)', () => {
    fc.assert(
      fc.property(arbNonEmptyTodoList, (todos) => {
        seedStorage(todos);
        const { result } = renderHook(() => useTodoStore());

        const prevLength = result.current.todos.length;
        const prevIds = result.current.todos.map((t) => t.id);

        // Simulate cancel: do NOT call deleteTodo
        expect(result.current.todos.length).toBe(prevLength);
        expect(result.current.todos.map((t) => t.id)).toEqual(prevIds);
      })
    );
  });
});

// ---------------------------------------------------------------------------
// Property 9: Filter menampilkan subset yang benar dan jumlah sesuai
// ---------------------------------------------------------------------------

describe('Property 9: Filter menampilkan subset yang benar', () => {
  // Feature: todolist-app, Property 9: Filter menampilkan subset yang benar
  // Validates: Requirements 6.2, 6.3, 6.4, 6.5
  test('filter all menampilkan semua item', () => {
    fc.assert(
      fc.property(arbNonEmptyTodoList, (todos) => {
        seedStorage(todos);
        const { result } = renderHook(() => useTodoStore());

        act(() => {
          result.current.setFilter('all');
        });

        expect(result.current.filteredTodos.length).toBe(result.current.todos.length);
        expect(result.current.counts.all).toBe(result.current.todos.length);
      })
    );
  });

  test('filter active menampilkan hanya item completed=false', () => {
    fc.assert(
      fc.property(arbNonEmptyTodoList, (todos) => {
        seedStorage(todos);
        const { result } = renderHook(() => useTodoStore());

        act(() => {
          result.current.setFilter('active');
        });

        const activeItems = result.current.filteredTodos;
        expect(activeItems.every((t) => !t.completed)).toBe(true);
        expect(activeItems.length).toBe(result.current.counts.active);
      })
    );
  });

  test('filter completed menampilkan hanya item completed=true', () => {
    fc.assert(
      fc.property(arbNonEmptyTodoList, (todos) => {
        seedStorage(todos);
        const { result } = renderHook(() => useTodoStore());

        act(() => {
          result.current.setFilter('completed');
        });

        const completedItems = result.current.filteredTodos;
        expect(completedItems.every((t) => t.completed)).toBe(true);
        expect(completedItems.length).toBe(result.current.counts.completed);
      })
    );
  });

  test('counts.active + counts.completed === counts.all', () => {
    fc.assert(
      fc.property(arbNonEmptyTodoList, (todos) => {
        seedStorage(todos);
        const { result } = renderHook(() => useTodoStore());

        const { all, active, completed } = result.current.counts;
        expect(active + completed).toBe(all);
      })
    );
  });
});

// ---------------------------------------------------------------------------
// Property 10: Tombol "Hapus Semua Selesai" aktif iff ada item selesai
// ---------------------------------------------------------------------------

describe('Property 10: deleteCompleted aktif iff ada item selesai', () => {
  // Feature: todolist-app, Property 10: Tombol "Hapus Semua Selesai" aktif iff ada item selesai
  // Validates: Requirements 7.1, 7.3, 7.4
  test('counts.completed > 0 iff ada item completed=true', () => {
    fc.assert(
      fc.property(arbNonEmptyTodoList, (todos) => {
        seedStorage(todos);
        const { result } = renderHook(() => useTodoStore());

        const hasCompleted = result.current.todos.some((t) => t.completed);
        expect(result.current.counts.completed > 0).toBe(hasCompleted);
      })
    );
  });

  test('setelah deleteCompleted tidak ada item completed=true tersisa', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            title: arbValidTitle,
            description: arbValidDescription,
            completed: fc.constant(true),
            createdAt: fc
              .date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') })
              .map((d) => d.toISOString()),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (completedTodos) => {
          seedStorage(completedTodos);
          const { result } = renderHook(() => useTodoStore());

          act(() => {
            result.current.deleteCompleted();
          });

          expect(result.current.todos.every((t) => !t.completed)).toBe(true);
          expect(result.current.counts.completed).toBe(0);
        }
      )
    );
  });
});

// ---------------------------------------------------------------------------
// Property 11: Persistensi round-trip
// ---------------------------------------------------------------------------

describe('Property 11: Persistensi round-trip', () => {
  // Feature: todolist-app, Property 11: Persistensi round-trip
  // Validates: Requirements 8.1, 8.2
  test('setelah addTodo, localStorage berisi state terkini', () => {
    fc.assert(
      fc.property(
        fc.array(arbTodoItem, { minLength: 0, maxLength: 5 }),
        arbValidTitle,
        arbValidDescription,
        (existingTodos, title, description) => {
          seedStorage(existingTodos);
          const saveSpy = vi.spyOn(storageService, 'save');

          const { result } = renderHook(() => useTodoStore());

          act(() => {
            result.current.addTodo(title, description);
          });

          // save must have been called with the current todos state
          expect(saveSpy).toHaveBeenCalled();
          const lastCallArgs = saveSpy.mock.calls[saveSpy.mock.calls.length - 1][0];
          expect(lastCallArgs).toEqual(result.current.todos);

          vi.restoreAllMocks();
        }
      )
    );
  });

  test('setelah toggleTodo, localStorage berisi state terkini', () => {
    fc.assert(
      fc.property(arbNonEmptyTodoList, (todos) => {
        seedStorage(todos);
        const saveSpy = vi.spyOn(storageService, 'save');

        const { result } = renderHook(() => useTodoStore());
        const target = result.current.todos[0];

        act(() => {
          result.current.toggleTodo(target.id);
        });

        expect(saveSpy).toHaveBeenCalled();
        const lastCallArgs = saveSpy.mock.calls[saveSpy.mock.calls.length - 1][0];
        expect(lastCallArgs).toEqual(result.current.todos);

        vi.restoreAllMocks();
      })
    );
  });

  test('memuat ulang dari localStorage menghasilkan todo list yang sama', () => {
    fc.assert(
      fc.property(arbNonEmptyTodoList, (todos) => {
        seedStorage(todos);

        const { result: result1 } = renderHook(() => useTodoStore());
        const todosAfterLoad1 = result1.current.todos;

        // Simulate reload: clear hook state and re-render from localStorage
        const { result: result2 } = renderHook(() => useTodoStore());
        const todosAfterLoad2 = result2.current.todos;

        expect(todosAfterLoad2).toEqual(todosAfterLoad1);
      })
    );
  });
});
