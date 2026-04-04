# Design Document: create-app-cli (v2 — Production-Grade)

## Overview

The `create-app-cli` scaffolds complete, immediately runnable projects. It uses official CLIs for React Vite and Next.js (standalone), then applies a **post-processing pipeline** that injects feature-based folder structure, Tailwind CSS, and a full working Todo application. Backend and fullstack projects are served via rich internal templates containing a complete MVC Express Todo API, MongoDB/Mongoose integration, Zod validation, JWT auth boilerplate, and a connected React client (MERN) or Next.js App Router implementation (Next.js Full Stack).

### What Changed from v1

| Area | v1 | v2 |
|---|---|---|
| Frontend structure | Empty folders | Feature-based + Atomic design injected |
| Frontend app | No app | Working Todo UI (Tailwind, hooks, components) |
| Backend structure | Basic Express | Full MVC: controller/service/model/route/middleware/validation/config |
| Backend app | No app | Complete Todo CRUD API with Mongoose + Zod + JWT |
| MERN client | Instructions only | Working React+Vite client connected to Express API |
| Next.js Fullstack | Basic page | App Router + API routes + Mongoose + Todo system |
| Database | Not prompted | MongoDB prompted, configured, and connected |
| Post-processing | None | Dedicated PostProcessor layer |

---

## Architecture

### Pipeline Overview

```
User Input
  → Prompt Flow (per-type modules)
  → Directory Collision Check
  → Resolver (pure: PromptAnswers → ResolvedConfig)
  → Generator
      ├── if delegate: spawn Official_CLI
      └── if template: validateTemplate → copyTemplate → replacePlaceholders → createEnvFile
  → PostProcessor (frontend only)
      ├── injectFolderStructure()
      ├── setupTailwind()
      └── injectTodoApp()
  → installDependencies()
  → initGit()
  → displayNextSteps()
```

---

### Module Structure

```
create-app-cli/
├── src/
│   ├── index.ts                          # #!/usr/bin/env node + Commander entry
│   ├── cli.ts                            # Orchestrates: prompts → resolver → generator → post
│   │
│   ├── prompts/
│   │   ├── main.prompt.ts                # Step 1: Project_Type
│   │   ├── frontend.prompt.ts            # Frontend: framework + language
│   │   ├── backend.prompt.ts             # Backend: language (Express implied)
│   │   └── fullstack.prompt.ts           # Full Stack: stack + language
│   │
│   ├── core/
│   │   ├── resolver.ts                   # Pure: PromptAnswers → ResolvedConfig
│   │   ├── generator.ts                  # Orchestrates copy/delegate + calls postprocessor
│   │   └── postprocessor.ts              # Frontend enrichment pipeline
│   │
│   └── utils/
│       ├── copy.ts                       # fs.cp + replacePlaceholders + createEnvFile
│       ├── install.ts                    # npm/yarn/pnpm install
│       ├── git.ts                        # git init + add + commit
│       └── logger.ts                     # chalk + ora + nextSteps
│
├── src/templates/
│   ├── express-ts/                       # Full MVC Express (TypeScript)
│   ├── express-js/                       # Full MVC Express (JavaScript)
│   ├── mern-ts/                          # MERN monorepo (TypeScript)
│   ├── mern-js/                          # MERN monorepo (JavaScript)
│   ├── next-fullstack-ts/                # Next.js App Router + Mongoose (TypeScript)
│   └── next-fullstack-js/                # Next.js App Router + Mongoose (JavaScript)
│
├── dist/                                 # tsup CJS output
├── package.json                          # bin + files fields
├── tsconfig.json
└── tsup.config.ts
```

---

## TypeScript Interfaces

```typescript
// All prompt answers merged
export interface PromptAnswers {
  projectType: 'frontend' | 'backend' | 'fullstack';
  framework: 'react-vite' | 'nextjs' | 'express' | 'mern' | 'next-fullstack';
  language: 'typescript' | 'javascript';
  database: 'mongodb';
  projectName: string;
  packageManager: 'npm' | 'yarn' | 'pnpm';
}

// Output of resolver — consumed by generator and postprocessor
export interface ResolvedConfig {
  type: 'delegate' | 'template';
  projectType: 'frontend' | 'backend' | 'fullstack';
  framework: string;
  language: 'typescript' | 'javascript';
  database: 'mongodb';
  projectName: string;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  targetPath: string;              // absolute path: cwd/projectName

  // delegate only
  command?: string;
  args?: string[];

  // template only
  templateName?: string;
  templatePath?: string;
}
```

---

## Module Specifications

### src/index.ts

- First line: `#!/usr/bin/env node`
- Imports Commander, sets `.name('create-app').version('1.0.0').description(...)`
- Defines `create` command, action calls `createApp()` from cli.ts
- Sets `create` as default command (bare `create-app` invokes it)
- Calls `program.parse(process.argv)`

---

### src/cli.ts — `createApp()`

Orchestrates the entire flow. Zero business logic.

```
1. runMainPrompt()                    → { projectType }
2. runSubPrompt(projectType)          → { framework, language }
3. Inquirer: database prompt          → { database: 'mongodb' }
4. Inquirer: projectName (validated)  → { projectName }
5. Inquirer: packageManager           → { packageManager }
6. Merge → PromptAnswers
7. Check directory collision → overwrite/cancel prompt
8. resolveConfig(answers)             → ResolvedConfig
9. generateProject(config)            → (handles everything below)
10. catch: logError → process.exit(1)
```

---

### src/prompts/main.prompt.ts

```typescript
export interface MainAnswers { projectType: 'frontend' | 'backend' | 'fullstack' }
export async function runMainPrompt(): Promise<MainAnswers>
```

Single `list` question. `stepHeader(1, 'Project Type')`.

---

### src/prompts/frontend.prompt.ts

```typescript
export interface FrontendAnswers { framework: 'react-vite' | 'nextjs'; language: 'typescript' | 'javascript' }
export async function runFrontendPrompts(): Promise<FrontendAnswers>
```

Two `list` questions: framework then language. `stepHeader(2, 'Frontend Configuration')`.

---

### src/prompts/backend.prompt.ts

```typescript
export interface BackendAnswers { framework: 'express'; language: 'typescript' | 'javascript' }
export async function runBackendPrompts(): Promise<BackendAnswers>
```

Logs: `logInfo('Framework: Express.js')`. One `list` question: language. Returns `framework: 'express'` hardcoded.

---

### src/prompts/fullstack.prompt.ts

```typescript
export interface FullstackAnswers { framework: 'mern' | 'next-fullstack'; language: 'typescript' | 'javascript' }
export async function runFullstackPrompts(): Promise<FullstackAnswers>
```

Two `list` questions: stack then language. `stepHeader(2, 'Full Stack Configuration')`.

---

### src/core/resolver.ts — `resolveConfig(answers): ResolvedConfig`

Pure function. No I/O.

**Resolution table:**

| framework | language | type | value |
|---|---|---|---|
| react-vite | typescript | delegate | `npm create vite@latest <n> -- --template react-ts` |
| react-vite | javascript | delegate | `npm create vite@latest <n> -- --template react` |
| nextjs | typescript | delegate | `npx create-next-app@latest <n> --typescript --eslint --no-git --app --use-<pm>` |
| nextjs | javascript | delegate | `npx create-next-app@latest <n> --no-typescript --eslint --no-git --app --use-<pm>` |
| express | typescript | template | `express-ts` |
| express | javascript | template | `express-js` |
| mern | typescript | template | `mern-ts` |
| mern | javascript | template | `mern-js` |
| next-fullstack | typescript | template | `next-fullstack-ts` |
| next-fullstack | javascript | template | `next-fullstack-js` |

Sets `targetPath = path.join(process.cwd(), projectName)`.
Sets `templatePath = path.join(__dirname, '..', 'templates', templateName)`.

---

### src/core/generator.ts — `generateProject(config): Promise<void>`

```
[Step 1] Scaffold
  spinner "Setting up project..."
  if delegate: spawn command+args, stdio:'inherit', exit 0 = success, else throw
  if template: validateTemplate → copyTemplate → replacePlaceholders → createEnvFile

[Step 2] Post-Process (frontend only)
  if config.projectType === 'frontend':
    await runPostProcessing(config)

[Step 3] Install dependencies
  try: installDependencies(targetPath, packageManager)
  catch: logWarning + hint, continue

[Step 4] Git
  try: initGit(targetPath)
  catch: logWarning, continue

[Step 5] Next steps
  displayNextSteps(config)
```

---

### src/core/postprocessor.ts — `runPostProcessing(config): Promise<void>`

Called only for frontend projects after delegation completes.

```typescript
export async function runPostProcessing(config: ResolvedConfig): Promise<void> {
  await injectFolderStructure(config);
  await setupTailwind(config);
  await injectTodoApp(config);
}
```

#### `injectFolderStructure(config)`

Creates directories under `config.targetPath/src/`:
```
features/todo/
components/atoms/
components/molecules/
components/organisms/
hooks/
lib/
types/
```
Uses `fs.mkdir(path, { recursive: true })` for each.
Writes `.gitkeep` in each leaf directory.

#### `setupTailwind(config)`

1. Installs `tailwindcss postcss autoprefixer` as dev deps:
   `spawn('<pm>', ['install', '-D', 'tailwindcss', 'postcss', 'autoprefixer'], { cwd: targetPath })`

2. Writes `tailwind.config.js` (or `.ts` for TypeScript) at project root:
   ```js
   /** @type {import('tailwindcss').Config} */
   export default {
     content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],  // react-vite
     // or: ['./src/**/*.{js,jsx,ts,tsx}', './app/**/*.{js,jsx,ts,tsx}']  // nextjs
     theme: { extend: {} },
     plugins: [],
   }
   ```

3. Writes `postcss.config.js`:
   ```js
   export default { plugins: { tailwindcss: {}, autoprefixer: {} } }
   ```

4. For React Vite: overwrites `src/index.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

5. For Next.js: overwrites `app/globals.css` with same three directives.

#### `injectTodoApp(config)`

Writes the following files. The ext variable = `ts` or `js`, jsx = `tsx` or `jsx`.

**`src/types/todo.{ts|js}`**
```typescript
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
}
```
(JS version: uses JSDoc `@typedef` instead of interface)

**`src/hooks/useTodos.{ts|js}`**
```typescript
import { useState } from 'react';
import { Todo } from '../types/todo';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = (title: string) => {
    if (!title.trim()) return;
    setTodos(prev => [...prev, { id: Date.now().toString(), title: title.trim(), completed: false }]);
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  return { todos, addTodo, toggleTodo, deleteTodo };
}
```

**`src/features/todo/TodoItem.{tsx|jsx}`**
```tsx
import { Todo } from '../../types/todo';

interface Props { todo: Todo; onToggle: (id: string) => void; onDelete: (id: string) => void; }

export function TodoItem({ todo, onToggle, onDelete }: Props) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="w-4 h-4 accent-blue-500 cursor-pointer"
      />
      <span className={`flex-1 text-gray-800 ${todo.completed ? 'line-through text-gray-400' : ''}`}>
        {todo.title}
      </span>
      <button
        onClick={() => onDelete(todo.id)}
        className="text-red-400 hover:text-red-600 text-sm font-medium transition-colors"
      >
        Delete
      </button>
    </div>
  );
}
```

**`src/features/todo/TodoForm.{tsx|jsx}`**
```tsx
import { useState } from 'react';

interface Props { onAdd: (title: string) => void; }

export function TodoForm({ onAdd }: Props) {
  const [value, setValue] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(value);
    setValue('');
  };
  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Add a new task..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
        Add
      </button>
    </form>
  );
}
```

**`src/features/todo/TodoList.{tsx|jsx}`**
```tsx
import { useTodos } from '../../hooks/useTodos';
import { TodoForm } from './TodoForm';
import { TodoItem } from './TodoItem';

export function TodoList() {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">My Todos</h1>
        <TodoForm onAdd={addTodo} />
        <div className="flex flex-col gap-2">
          {todos.length === 0 && (
            <p className="text-center text-gray-400 py-8">No tasks yet. Add one above!</p>
          )}
          {todos.map(todo => (
            <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
          ))}
        </div>
        {todos.length > 0 && (
          <p className="text-center text-sm text-gray-400 mt-4">
            {todos.filter(t => t.completed).length}/{todos.length} completed
          </p>
        )}
      </div>
    </div>
  );
}
```

**`src/features/todo/index.{ts|js}`**
```typescript
export { TodoList } from './TodoList';
export { TodoForm } from './TodoForm';
export { TodoItem } from './TodoItem';
```

**`src/App.{tsx|jsx}` (React Vite only — REPLACES existing file)**
```tsx
import { TodoList } from './features/todo';

function App() {
  return <TodoList />;
}

export default App;
```

**`app/page.{tsx|jsx}` (Next.js only — REPLACES existing file)**
```tsx
import { TodoList } from '@/components/TodoList';

export default function Home() {
  return <main><TodoList /></main>;
}
```
(Next.js `TodoList` is a Client Component in `components/TodoList.tsx`)

---

## Template Specifications

### templates/express-ts/ and templates/express-js/

Complete file tree:

```
express-ts/
├── package.json                    PROJECT_NAME, all deps listed
├── tsconfig.json                   strict: true, module: commonjs, outDir: dist
├── .env.example                    PORT=5000, DATABASE_URL=..., JWT_SECRET=...
├── .gitignore                      node_modules/ dist/ .env
├── README.md                       # PROJECT_NAME
├── nodemon.json                    { "exec": "ts-node src/server.ts", "ext": "ts" }
└── src/
    ├── server.ts                   connectDB() then app.listen(PORT)
    ├── app.ts                      express(), cors, json, routes, errorHandler
    ├── config/
    │   ├── database.ts             connectDB(): mongoose.connect(DATABASE_URL)
    │   └── jwt.ts                  signToken(payload), verifyToken(token)
    ├── models/
    │   └── todo.model.ts           TodoSchema: title(String,req), completed(Bool,false), createdAt
    ├── validations/
    │   └── todo.validation.ts      createTodoSchema(Zod), updateTodoSchema(Zod)
    ├── services/
    │   └── todo.service.ts         getAllTodos, getTodoById, createTodo, updateTodo, deleteTodo
    ├── controllers/
    │   └── todo.controller.ts      getAll, getOne, create, update, remove handlers
    ├── routes/
    │   ├── index.ts                router.use('/api', todoRoutes)
    │   └── todo.routes.ts          GET/POST /todos, GET/PUT/DELETE /todos/:id
    ├── middlewares/
    │   ├── errorHandler.ts         global Express error handler
    │   ├── asyncHandler.ts         (fn) => (req,res,next) => fn(...).catch(next)
    │   ├── validate.ts             (schema) => middleware factory using Zod
    │   └── auth.ts                 JWT Bearer verification middleware
    └── types/
        └── index.ts                AuthRequest interface (extends Request with user)
```

**Key code in express-ts template:**

`src/app.ts`:
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { router } from './routes';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(router);
app.use(errorHandler);
export { app };
```

`src/middlewares/validate.ts`:
```typescript
import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: result.error.flatten() });
  }
  req.body = result.data;
  next();
};
```

`src/services/todo.service.ts`:
```typescript
import { Todo } from '../models/todo.model';

export const getAllTodos = () => Todo.find().sort({ createdAt: -1 });
export const getTodoById = (id: string) => Todo.findById(id);
export const createTodo = (data: { title: string }) => Todo.create(data);
export const updateTodo = (id: string, data: Partial<{ title: string; completed: boolean }>) =>
  Todo.findByIdAndUpdate(id, data, { new: true });
export const deleteTodo = (id: string) => Todo.findByIdAndDelete(id);
```

`src/controllers/todo.controller.ts`:
```typescript
import { Request, Response } from 'express';
import * as todoService from '../services/todo.service';
import { asyncHandler } from '../middlewares/asyncHandler';

export const getAll = asyncHandler(async (_req: Request, res: Response) => {
  const todos = await todoService.getAllTodos();
  res.json({ success: true, data: todos });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const todo = await todoService.getTodoById(req.params.id);
  if (!todo) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: todo });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const todo = await todoService.createTodo(req.body);
  res.status(201).json({ success: true, data: todo });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const todo = await todoService.updateTodo(req.params.id, req.body);
  if (!todo) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: todo });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await todoService.deleteTodo(req.params.id);
  res.json({ success: true, message: 'Deleted' });
});
```

The `express-js/` template mirrors all of the above using `.js` files and CommonJS (`require`/`module.exports`). No tsconfig. No `@types`.

---

### templates/mern-ts/ and templates/mern-js/

```
mern-ts/
├── package.json                    root: concurrently dev script, workspaces
├── .env.example                    PORT=5000, DATABASE_URL=..., JWT_SECRET=..., VITE_API_URL=http://localhost:5000
├── .gitignore
├── README.md                       # PROJECT_NAME — MERN Stack
│
├── server/                         ← identical to express-ts template structure above
│   ├── package.json                name: PROJECT_NAME-server
│   └── src/ ...
│
└── client/                         ← React + Vite (TypeScript)
    ├── package.json                name: PROJECT_NAME-client, deps: react, react-dom; devDeps: vite, @vitejs/plugin-react, typescript, tailwindcss, postcss, autoprefixer, @types/react, @types/react-dom
    ├── vite.config.ts              basic Vite react plugin
    ├── tailwind.config.ts          content: ['./src/**/*.{ts,tsx}', './index.html']
    ├── postcss.config.js
    ├── index.html
    ├── tsconfig.json
    ├── .env.example                VITE_API_URL=http://localhost:5000
    └── src/
        ├── main.tsx                React 18 createRoot
        ├── index.css               @tailwind base/components/utilities
        ├── App.tsx                 renders <TodoList />
        ├── types/
        │   └── todo.ts             Todo interface (matches server model)
        ├── hooks/
        │   └── useTodos.ts         uses API client (fetch-based), not local state
        ├── lib/
        │   └── api.ts              fetchTodos, createTodo, updateTodo, deleteTodo
        └── features/
            └── todo/
                ├── TodoItem.tsx
                ├── TodoForm.tsx
                ├── TodoList.tsx    uses useTodos hook (API-connected)
                └── index.ts
```

**`client/src/lib/api.ts`:**
```typescript
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export const fetchTodos = async () => {
  const res = await fetch(`${BASE_URL}/api/todos`);
  const data = await res.json();
  return data.data;
};

export const createTodo = async (title: string) => {
  const res = await fetch(`${BASE_URL}/api/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  const data = await res.json();
  return data.data;
};

export const updateTodo = async (id: string, updates: Partial<{ title: string; completed: boolean }>) => {
  const res = await fetch(`${BASE_URL}/api/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  return data.data;
};

export const deleteTodo = async (id: string) => {
  await fetch(`${BASE_URL}/api/todos/${id}`, { method: 'DELETE' });
};
```

**`client/src/hooks/useTodos.ts` (API-connected version):**
```typescript
import { useState, useEffect } from 'react';
import * as api from '../lib/api';
import { Todo } from '../types/todo';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.fetchTodos().then(setTodos).finally(() => setLoading(false));
  }, []);

  const addTodo = async (title: string) => {
    if (!title.trim()) return;
    const todo = await api.createTodo(title.trim());
    setTodos(prev => [todo, ...prev]);
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    const todo = await api.updateTodo(id, { completed: !completed });
    setTodos(prev => prev.map(t => t.id === id ? todo : t));
  };

  const deleteTodo = async (id: string) => {
    await api.deleteTodo(id);
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  return { todos, loading, addTodo, toggleTodo, deleteTodo };
}
```

---

### templates/next-fullstack-ts/ and templates/next-fullstack-js/

```
next-fullstack-ts/
├── package.json                    name: PROJECT_NAME; deps: next, react, react-dom, mongoose, zod; devDeps: typescript, @types/react, @types/node, @types/react-dom, tailwindcss, postcss, autoprefixer
├── tsconfig.json                   Next.js standard tsconfig
├── next.config.ts
├── tailwind.config.ts              content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}']
├── postcss.config.js
├── .env.example                    DATABASE_URL=mongodb://localhost:27017/PROJECT_NAME\nNEXTAUTH_SECRET=changeme
├── .gitignore                      .next/ node_modules/ .env
├── README.md                       # PROJECT_NAME — Next.js Full Stack
│
├── lib/
│   ├── db.ts                       Mongoose singleton connection
│   ├── models/
│   │   └── todo.model.ts           Todo Mongoose schema
│   └── validations/
│       └── todo.validation.ts      Zod create/update schemas
│
├── app/
│   ├── globals.css                 @tailwind base/components/utilities
│   ├── layout.tsx                  Root layout
│   ├── page.tsx                    Server Component: fetches todos, passes to TodoList
│   └── api/
│       └── todos/
│           ├── route.ts            GET all + POST create
│           └── [id]/
│               └── route.ts        GET one + PUT update + DELETE
│
└── components/
    ├── TodoList.tsx                'use client' — manages local state + fetch calls
    ├── TodoItem.tsx                'use client' — checkbox + delete button
    └── TodoForm.tsx                'use client' — input + submit
```

**`lib/db.ts`:**
```typescript
import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;
  const uri = process.env.DATABASE_URL;
  if (!uri) throw new Error('DATABASE_URL is not defined');
  await mongoose.connect(uri);
  isConnected = true;
  console.log('MongoDB connected');
}
```

**`app/api/todos/route.ts`:**
```typescript
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Todo } from '@/lib/models/todo.model';
import { createTodoSchema } from '@/lib/validations/todo.validation';

export async function GET() {
  await connectDB();
  const todos = await Todo.find().sort({ createdAt: -1 });
  return NextResponse.json({ success: true, data: todos });
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const result = createTodoSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ success: false, errors: result.error.flatten() }, { status: 400 });
  const todo = await Todo.create(result.data);
  return NextResponse.json({ success: true, data: todo }, { status: 201 });
}
```

**`components/TodoList.tsx`:**
```typescript
'use client';
import { useState } from 'react';
import { TodoForm } from './TodoForm';
import { TodoItem } from './TodoItem';
import type { Todo } from '@/lib/models/todo.model';

export function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState(initialTodos);

  const addTodo = async (title: string) => {
    const res = await fetch('/api/todos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) });
    const { data } = await res.json();
    setTodos(prev => [data, ...prev]);
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    const res = await fetch(`/api/todos/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed: !completed }) });
    const { data } = await res.json();
    setTodos(prev => prev.map(t => (t._id?.toString() === id ? data : t)));
  };

  const deleteTodo = async (id: string) => {
    await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    setTodos(prev => prev.filter(t => t._id?.toString() !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">My Todos</h1>
        <TodoForm onAdd={addTodo} />
        <div className="flex flex-col gap-2">
          {todos.map(todo => (
            <TodoItem key={todo._id?.toString()} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## src/core/postprocessor.ts — Implementation Detail

```typescript
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { ResolvedConfig } from './resolver';

// Directories to inject relative to targetPath/src/
const FEATURE_DIRS = [
  'features/todo',
  'components/atoms',
  'components/molecules',
  'components/organisms',
  'hooks',
  'lib',
  'types',
];

export async function runPostProcessing(config: ResolvedConfig): Promise<void> {
  await injectFolderStructure(config);
  await setupTailwind(config);
  await injectTodoApp(config);
}

async function injectFolderStructure(config: ResolvedConfig) {
  const srcPath = path.join(config.targetPath, 'src');
  for (const dir of FEATURE_DIRS) {
    const fullPath = path.join(srcPath, dir);
    await fs.mkdir(fullPath, { recursive: true });
    await fs.writeFile(path.join(fullPath, '.gitkeep'), '');
  }
}

async function setupTailwind(config: ResolvedConfig) {
  // install tailwindcss postcss autoprefixer
  // write tailwind.config.js, postcss.config.js
  // overwrite index.css or globals.css
}

async function injectTodoApp(config: ResolvedConfig) {
  const { targetPath, framework, language } = config;
  const ext = language === 'typescript' ? 'ts' : 'js';
  const jsx = language === 'typescript' ? 'tsx' : 'jsx';
  const srcPath = path.join(targetPath, 'src');

  // Write all Todo files using the exact code strings from this design doc
  // types/todo.{ts|js}
  // hooks/useTodos.{ts|js}
  // features/todo/TodoItem.{tsx|jsx}
  // features/todo/TodoForm.{tsx|jsx}
  // features/todo/TodoList.{tsx|jsx}
  // features/todo/index.{ts|js}
  // Overwrite App.{tsx|jsx} or app/page.{tsx|jsx}
}
```

Each `writeFile` call uses the exact code strings defined in this design document.
The code strings are stored as template literals in `postprocessor.ts` or imported from `src/core/todoTemplates.ts`.

---

## Error Handling Strategy

| Scenario | Behavior |
|---|---|
| Delegation non-zero exit | spinner.fail → logError → process.exit(1) |
| Template not found | spinner.fail → logError → process.exit(1) |
| Missing package.json or README | spinner.fail → logError → process.exit(1) |
| Post-processor file write fails | spinner.fail → logError → process.exit(1) |
| Tailwind install fails | spinner.warn → logWarning + hint → continue |
| npm install fails | spinner.warn → logWarning + hint → continue |
| git init/add/commit fails | spinner.warn → logWarning → continue |

---

## Build Configuration

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "src/templates", "tests"]
}
```

### tsup.config.ts
```typescript
import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  clean: true,
  outDir: 'dist',
  target: 'node18',
  shims: true,
  banner: { js: '#!/usr/bin/env node' },
});
```

**Note on banner:** tsup's `banner` option ensures the shebang survives bundling. If not available in the tsup version, add `#!/usr/bin/env node` to the top of `src/index.ts` and configure tsup to not strip it.

### package.json key fields
```json
{
  "name": "create-app",
  "version": "1.0.0",
  "bin": { "create-app": "./dist/index.js" },
  "files": ["dist", "src/templates"],
  "engines": { "node": ">=18" },
  "scripts": {
    "build": "tsup",
    "dev": "ts-node src/index.ts",
    "test": "vitest"
  }
}
```