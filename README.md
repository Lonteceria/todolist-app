# Todolist App

A client-side personal task management web application. Users can add, view, edit, delete, and filter tasks. No backend — all data is persisted in the browser's `localStorage`.

---

## Key Features

- Add tasks with a title (max. 200 characters) and description (3–50 characters)
- Real-time input validation with inline error messages
- Mark tasks as complete or incomplete (toggle)
- Edit task title and description inline
- Delete individual tasks with a confirmation dialog
- Bulk-delete all completed tasks at once
- Filter tasks by status: All / Active / Completed
- Task counter per filter category
- Data is automatically saved to `localStorage` and persists after page refresh
- Task list sorted by most recently created

---

## Installation and Running the Project

### Prerequisites

- Node.js version 18 or higher
- npm

### Installation Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd todolist-app

# 2. Install dependencies
npm install
```

### Running the Application

```bash
# Development mode
npm run dev
```

Open your browser and copy the localhost address shown in your terminal.
For example:
```bash
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Other Commands

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Run all tests (single pass)
npm test

# Run tests with interactive UI
npm run test:ui

# Lint code
npm run lint
```

---

## Folder Structure

```
src/
├── types/
│   └── index.ts              # Data types: TodoItem, FilterType, FilterCounts, ValidationResult
├── utils/
│   ├── validateTitle.ts      # Title validation logic
│   └── validateDescription.ts# Description validation logic
├── services/
│   └── storageService.ts     # localStorage adapter (load/save)
├── hooks/
│   └── useTodoStore.ts       # Centralized state management (reducer + action creators)
├── components/
│   ├── TodoInput.tsx          # Add new task form
│   ├── TodoList.tsx           # Filtered task list or empty state
│   ├── TodoItem.tsx           # Single task row with inline edit mode
│   ├── FilterBar.tsx          # Filter buttons: All / Active / Completed
│   ├── ActionBar.tsx          # "Delete All Completed" button
│   └── ConfirmDialog.tsx      # Generic confirmation modal
├── __tests__/
│   ├── validateTitle.test.ts
│   ├── validateDescription.test.ts
│   ├── storageService.test.ts
│   ├── useTodoStore.test.ts
│   └── components/            # Per-component test files
└── App.tsx                    # Root component
```

---

## Technologies Used

| Category | Technology |
|---|---|
| Language | TypeScript 5.7 |
| UI Framework | React 19 |
| Build Tool | Vite 6 |
| Styling | CSS Modules |
| Test Runner | Vitest 3 (jsdom) |
| Component Testing | React Testing Library + @testing-library/user-event |
| Property-Based Testing | fast-check (100 runs per property) |
| Persistence | Browser localStorage |
