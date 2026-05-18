# PROJECT_NAME

React + Vite + TypeScript with a clean feature-based architecture.

This template is organized to stay simple for beginners and scalable for production teams.

## Getting Started

```bash
npm install
npm run dev
```

## Structure

```
src/
  app/               # App bootstrap/composition (root shell)
  components/ui/     # Reusable shared UI building blocks
  features/todo/
    ui/              # Todo-specific UI components
    hooks/           # Todo state/business logic
    types/           # Todo domain types
    index.ts         # Public feature API
  lib/               # Shared utilities
  styles/            # Global styles and design tokens
```

## Working Rules

- Put reusable, cross-feature UI in `src/components/ui`.
- Keep feature-specific code inside its feature folder (`src/features/todo`).
- Export feature entry points from `src/features/todo/index.ts`.
- Use `@/*` imports across folders and short relative imports within the same feature.
- Avoid putting business logic in shared UI components.

## Add A New Feature

1. Create `src/features/<feature-name>/`.
2. Add `ui/`, `hooks/`, and `types/` inside that feature.
3. Expose only what other folders need through `index.ts`.
4. Use feature modules from `app/` instead of importing deep internal files.
