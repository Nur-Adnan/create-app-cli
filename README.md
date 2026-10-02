# create-app

> Scaffold production-ready projects instantly with an interactive CLI.

`create-app` is a zero-config scaffolding tool that generates fully structured projects for frontend, backend, and fullstack development. Every generated project includes real, runnable code — no placeholder files, no empty stubs.

---

## Quick Start

The CLI is not published to npm yet (the `create-app` name on the registry belongs to an unrelated package), so run it from source:

```bash
git clone https://github.com/Nur-Adnan/create-app-cli.git
cd create-app-cli
npm install
npm run build
npm link        # exposes the `create-app` command locally
create-app
```

**Requirements:** Node.js >= 18

---

## What It Does

Run the CLI and answer a few prompts:

```
Step 1 — Project Type:    Frontend / Backend / Full Stack
Step 2 — Framework:       (depends on type)
Step 3 — Database:        MongoDB  (backend/fullstack only)
Step 4 — Project Name:    my-app
Step 5 — Package Manager: npm / yarn / pnpm
```

The CLI then:
1. Scaffolds the project (copies template or delegates to official CLI)
2. Injects folder structure + Tailwind CSS (frontend projects)
3. Installs dependencies
4. Initializes a git repository with an initial commit
5. Prints next steps

---

## Templates & Frameworks

### Frontend

| Choice | How it's scaffolded |
|---|---|
| React (Vite) | Delegates to `create-vite` — then injects Tailwind + Todo UI |
| Next.js (frontend-only) | Delegates to `create-next-app` — then injects Tailwind + Todo UI |

Frontend projects get a full atomic design folder structure injected automatically:

```
src/
  components/
    atoms/
    molecules/
    organisms/
  features/
    todo/          ← TodoForm, TodoItem, TodoList, useTodos hook
  hooks/
  lib/
  types/
```

### Backend

| Template | Stack |
|---|---|
| `express-ts` | Express.js + TypeScript + Mongoose + Zod + JWT |
| `express-js` | Express.js + JavaScript + Mongoose + Zod + JWT |

Full MVC structure out of the box:

```
src/
  controllers/
  services/
  models/
  routes/
  middlewares/
  validations/
  config/
```

Includes a complete Todo CRUD API with authentication middleware, async error handling, and Zod validation.

### Full Stack

| Template | Stack |
|---|---|
| `mern-ts` | MongoDB + Express + React (Vite) + Node — TypeScript |
| `mern-js` | MongoDB + Express + React (Vite) + Node — JavaScript |
| `next-fullstack-ts` | Next.js App Router + Mongoose — TypeScript |
| `next-fullstack-js` | Next.js App Router + Mongoose — JavaScript |

MERN templates include a `server/` (mirrors express template) and a `client/` (React + Vite + Tailwind) with a `useTodos` hook wired to the Express API via `fetch`.

Next.js fullstack templates use App Router only — no `pages/` directory. API routes live in `app/api/`.

---

## Generated Project Structure

### Express (backend)

```
my-app/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/         database.ts, jwt.ts
│   ├── controllers/    todo.controller.ts
│   ├── services/       todo.service.ts
│   ├── models/         todo.model.ts
│   ├── routes/         index.ts, todo.routes.ts
│   ├── middlewares/    auth.ts, errorHandler.ts, validate.ts, asyncHandler.ts
│   └── validations/    todo.validation.ts
├── .env.example
├── package.json
└── README.md
```

### MERN

```
my-app/
├── client/             React + Vite + Tailwind
│   └── src/
│       ├── features/todo/
│       ├── hooks/useTodos.ts   ← fetches from Express API
│       └── lib/api.ts
├── server/             Express MVC (same as express template)
└── package.json        (root workspace)
```

### Next.js Fullstack

```
my-app/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── api/todos/
│       ├── route.ts        GET all, POST
│       └── [id]/route.ts   PUT, DELETE
├── components/
│   ├── TodoForm.tsx
│   ├── TodoItem.tsx
│   └── TodoList.tsx
├── lib/
│   ├── db.ts
│   ├── models/todo.model.ts
│   └── validations/todo.validation.ts
└── .env.example
```

---

## Tech Stack (CLI itself)

| Tool | Purpose |
|---|---|
| Commander.js | CLI command parsing |
| Inquirer.js v9 | Interactive prompts |
| chalk v5 | Colored output |
| ora v8 | Spinners |
| tsup | Build (CJS output) |
| vitest + fast-check | Unit + property-based tests |

---

## Development

```bash
# Clone and install
git clone https://github.com/Nur-Adnan/create-app-cli.git
cd create-app-cli
npm install

# Run in dev mode
npm run dev

# Build
npm run build

# Run tests
npm test
```

---

## Package Manager Support

The CLI detects whether your chosen package manager is installed. If it isn't, it falls back to `npm` with a warning.

Supported: `npm`, `yarn`, `pnpm`

---

## Directory Collision Handling

If the target directory already exists, the CLI prompts you to either **overwrite** it or **cancel** — no silent data loss.

---

## License

MIT
