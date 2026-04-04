# Requirements Document

## Introduction

The `create-app-cli` is a production-grade Node.js CLI tool that scaffolds complete, immediately runnable projects using a hybrid architecture. The tool asks the developer a series of questions, then either delegates to official framework CLIs for frontend projects or copies internal templates for backend and fullstack projects. After scaffolding, a **post-processing pipeline** enriches every project type with production-ready folder structure, a working end-to-end Todo application, database integration, environment configuration, and Zod validation. Every generated project runs with zero additional setup.

## Glossary

- **CLI_Tool**: The `create-app` command-line interface
- **User**: The developer running the CLI
- **Project_Type**: Frontend | Backend | Full Stack
- **Framework**: React Vite | Next.js | Express.js | MERN | Next.js Full Stack
- **Language**: TypeScript | JavaScript
- **Database**: The persistence layer chosen by the user (currently: MongoDB)
- **Package_Manager**: npm | yarn | pnpm
- **Project_Name**: User-provided name — lowercase, numbers, hyphens only
- **Template**: Pre-built project in `src/templates/`
- **Official_CLI**: `create-vite` or `create-next-app`
- **Post_Processor**: The layer that runs after delegation or template copy to inject files, folders, and working application code
- **Placeholder**: The string `PROJECT_NAME` inside template files, replaced at generation time
- **Spinner**: An ora animated loading indicator
- **Target_Directory**: `<cwd>/<Project_Name>` — where the new project is created
- **Shebang**: `#!/usr/bin/env node` — first line of the CLI entry point
- **Todo_App**: The sample end-to-end application injected into every generated project
- **Atomic_Structure**: UI component hierarchy: atoms / molecules / organisms
- **MVC_Structure**: Controller / Service / Model / Route / Middleware / Validation layers

---

## Requirements

---

### Requirement 1: Interactive Prompt Flow

**User Story:** As a developer, I want to answer a series of guided questions about my project so the CLI can scaffold the exact project structure I need.

#### Acceptance Criteria

1. WHEN the CLI_Tool starts, THE CLI_Tool SHALL display a welcome banner and prompt for Project_Type with options: Frontend, Backend, Full Stack
2. WHEN the User selects Frontend, THE CLI_Tool SHALL prompt for Framework: React (Vite-based) | Next.js
3. WHEN the User selects Backend, THE CLI_Tool SHALL inform the User that Express.js is the framework and skip framework selection
4. WHEN the User selects Full Stack, THE CLI_Tool SHALL prompt for Stack: MERN | Next.js Full Stack
5. WHEN a Framework or Stack is selected, THE CLI_Tool SHALL prompt for Language: TypeScript | JavaScript
6. WHEN the User selects Backend or Full Stack AND Language is selected, THE CLI_Tool SHALL prompt for Database with options: MongoDB
7. WHEN the User selects Frontend, THE CLI_Tool SHALL skip the Database prompt entirely and proceed directly to Project_Name
8. WHEN Database is selected (Backend/Full Stack), THE CLI_Tool SHALL prompt for Project_Name as free text input with inline validation
9. WHEN the User selects Frontend AND Language is selected, THE CLI_Tool SHALL prompt for Project_Name as free text input with inline validation
10. WHEN Project_Name is valid, THE CLI_Tool SHALL prompt for Package_Manager: npm | yarn | pnpm
11. THE CLI_Tool SHALL display a colored step header before each prompt group
12. WHEN the User selects Frontend, THE CLI_Tool SHALL route to `src/prompts/frontend.prompt.ts`
13. WHEN the User selects Backend, THE CLI_Tool SHALL route to `src/prompts/backend.prompt.ts`
14. WHEN the User selects Full Stack, THE CLI_Tool SHALL route to `src/prompts/fullstack.prompt.ts`

---

### Requirement 2: Project Name Validation

**User Story:** As a developer, I want my project name validated immediately so that filesystem and package.json compatibility issues are caught before any work begins.

#### Acceptance Criteria

1. WHEN the User provides a Project_Name, THE CLI_Tool SHALL validate it contains only lowercase letters, numbers, and hyphens
2. WHEN the User provides a Project_Name, THE CLI_Tool SHALL validate it is not empty
3. WHEN the User provides a Project_Name, THE CLI_Tool SHALL validate it contains no spaces or uppercase letters
4. IF the Project_Name is invalid, THE CLI_Tool SHALL display an inline error message and re-prompt without advancing
5. WHEN the Project_Name is valid, THE CLI_Tool SHALL proceed to Package_Manager selection

---

### Requirement 3: Frontend Delegation to Official CLIs

**User Story:** As a developer, I want frontend projects to be scaffolded by official tools so that I get the most compatible and up-to-date starting point.

#### Acceptance Criteria

1. WHEN the User selects React Vite + TypeScript, THE CLI_Tool SHALL execute `npm create vite@latest <Project_Name> -- --template react-ts`
2. WHEN the User selects React Vite + JavaScript, THE CLI_Tool SHALL execute `npm create vite@latest <Project_Name> -- --template react`
3. WHEN the User selects Next.js + TypeScript, THE CLI_Tool SHALL execute `npx create-next-app@latest <Project_Name> --typescript --eslint --no-git --app`
4. WHEN the User selects Next.js + JavaScript, THE CLI_Tool SHALL execute `npx create-next-app@latest <Project_Name> --no-typescript --eslint --no-git --app`
5. WHEN delegating to Next.js, THE CLI_Tool SHALL pass `--use-npm`, `--use-yarn`, or `--use-pnpm` matching the selected Package_Manager
6. WHEN delegating to Next.js, THE CLI_Tool SHALL always pass `--no-git` so that git is managed by the CLI_Tool
7. WHEN delegation succeeds, THE CLI_Tool SHALL proceed to the frontend Post_Processor immediately
8. WHEN delegation fails with a non-zero exit code, THE CLI_Tool SHALL display the error and exit with code 1

---

### Requirement 4: Frontend Post-Processing — Folder Structure Injection

**User Story:** As a developer, I want a production-ready feature-based folder structure injected after official CLI scaffolding so that I start with clean architecture rather than empty folders.

#### Acceptance Criteria

1. WHEN a Frontend project is delegated and completes, THE Post_Processor SHALL create the following directories inside Target_Directory/src/:
   - `features/todo/`
   - `components/atoms/`
   - `components/molecules/`
   - `components/organisms/`
   - `hooks/`
   - `lib/`
   - `types/`
2. WHEN the Post_Processor creates these directories, it SHALL place a `.gitkeep` file in each empty leaf directory so git tracks them
3. WHEN the project is React Vite, ALL directories SHALL be created under `<Target_Directory>/src/`
4. WHEN the project is Next.js, feature directories SHALL be created under `<Target_Directory>/src/` and component directories under `<Target_Directory>/src/components/`

---

### Requirement 5: Frontend Post-Processing — Tailwind CSS Setup

**User Story:** As a developer, I want Tailwind CSS configured automatically so that I can use utility classes without any manual setup.

#### Acceptance Criteria

1. WHEN the Frontend Post_Processor runs, THE CLI_Tool SHALL install `tailwindcss`, `postcss`, and `autoprefixer` as dev dependencies using the selected Package_Manager
2. WHEN Tailwind is installed, THE CLI_Tool SHALL create `tailwind.config.js` (or `.ts` for TypeScript projects) at the project root with content paths set to `./src/**/*.{js,jsx,ts,tsx}` (and `./app/**/*` for Next.js)
3. WHEN Tailwind is installed, THE CLI_Tool SHALL create `postcss.config.js` at the project root
4. WHEN the project is React Vite, THE CLI_Tool SHALL overwrite `src/index.css` with the three Tailwind directives (`@tailwind base`, `@tailwind components`, `@tailwind utilities`)
5. WHEN the project is Next.js, THE CLI_Tool SHALL overwrite `app/globals.css` with the three Tailwind directives
6. WHEN Tailwind setup completes, THE CLI_Tool SHALL log a success message

---

### Requirement 6: Frontend Post-Processing — Todo Application Injection

**User Story:** As a developer, I want a working end-to-end Todo application injected into my frontend so that I have a real, runnable example demonstrating best practices from day one.

#### Acceptance Criteria

1. WHEN the Frontend Post_Processor runs, THE CLI_Tool SHALL write the following files into the scaffolded project:
   - `src/types/todo.ts` (or `.js`) — Todo interface/type definition
   - `src/hooks/useTodos.ts` (or `.js`) — custom hook with add, toggle, delete logic using useState
   - `src/features/todo/TodoItem.tsx` (or `.jsx`) — atomic component: checkbox + text + delete button, styled with Tailwind
   - `src/features/todo/TodoForm.tsx` (or `.jsx`) — form component: controlled input + submit, styled with Tailwind
   - `src/features/todo/TodoList.tsx` (or `.jsx`) — list component: maps useTodos, renders TodoItem and TodoForm
   - `src/features/todo/index.ts` — barrel export of all todo components
2. WHEN the project is React Vite, THE CLI_Tool SHALL replace `src/App.tsx` (or `App.jsx`) with a clean component that imports and renders `TodoList`
3. WHEN the project is React Vite, THE CLI_Tool SHALL remove `src/App.css` and `src/assets/react.svg` (default Vite boilerplate) if they exist
4. WHEN the project is Next.js, THE CLI_Tool SHALL replace `app/page.tsx` (or `page.js`) with a page component that imports and renders `TodoList`
5. THE Todo UI SHALL support: add a new task, toggle a task complete/incomplete, delete a task
6. ALL Todo components SHALL use functional components and React hooks only — no class components
7. ALL Todo components SHALL use Tailwind CSS classes for styling — no CSS modules or inline styles
8. IF the project is TypeScript, ALL Todo files SHALL be properly typed with no `any` types

---

### Requirement 7: Backend Template — Modular MVC Structure

**User Story:** As a developer, I want the Express backend template to follow a clean MVC architecture so that the codebase is maintainable and scalable from day one.

#### Acceptance Criteria

1. WHEN the User selects Backend (Express), THE CLI_Tool SHALL copy the matching internal template (`express-ts` or `express-js`) to Target_Directory
2. THE template SHALL contain the following directory structure under `src/`:
   - `controllers/` — request handlers only, no business logic
   - `routes/` — route definitions, imports controllers and middlewares
   - `services/` — business logic only, no Express req/res objects
   - `models/` — Mongoose schema definitions
   - `middlewares/` — error handler, auth middleware, async wrapper
   - `validations/` — Zod schemas for request body/params/query validation
   - `config/` — database connection and environment config
   - `types/` — shared TypeScript interfaces (TS template only)
3. THE template SHALL include a working `src/app.ts` (or `app.js`) that creates and configures the Express app
4. THE template SHALL include a `src/server.ts` (or `server.js`) that imports `app` and calls `app.listen`
5. ALL directories SHALL contain at minimum the Todo-related implementation files (not empty)

---

### Requirement 8: Backend Template — Todo CRUD API

**User Story:** As a developer, I want a fully working Todo REST API in the backend template so that I have a real, runnable example of the complete MVC stack.

#### Acceptance Criteria

1. THE backend template SHALL include `src/models/todo.model.ts` (or `.js`) defining a Mongoose schema with fields: `title` (String, required), `completed` (Boolean, default false), `createdAt` (Date, auto)
2. THE backend template SHALL include `src/validations/todo.validation.ts` (or `.js`) defining Zod schemas for: create todo (title required), update todo (title optional, completed optional)
3. THE backend template SHALL include `src/services/todo.service.ts` (or `.js`) with functions: `getAllTodos`, `getTodoById`, `createTodo`, `updateTodo`, `deleteTodo` — each returning a Promise
4. THE backend template SHALL include `src/controllers/todo.controller.ts` (or `.js`) with handler functions for each CRUD operation that call the service layer and return JSON responses
5. THE backend template SHALL include `src/routes/todo.routes.ts` (or `.js`) defining:
   - `GET /api/todos` — list all todos
   - `GET /api/todos/:id` — get one todo
   - `POST /api/todos` — create todo (validates body with Zod schema)
   - `PUT /api/todos/:id` — update todo (validates body with Zod schema)
   - `DELETE /api/todos/:id` — delete todo
6. THE backend template SHALL include `src/routes/index.ts` (or `.js`) that mounts todo routes under `/api`
7. ALL routes SHALL respond with `{ success: boolean, data: any, message: string }` shaped JSON
8. ALL routes SHALL return appropriate HTTP status codes (200, 201, 400, 404, 500)

---

### Requirement 9: Backend Template — Middleware Layer

**User Story:** As a developer, I want pre-built middleware so that error handling, validation, and auth are consistently enforced across all routes.

#### Acceptance Criteria

1. THE backend template SHALL include `src/middlewares/errorHandler.ts` (or `.js`) — a global Express error handler that catches errors and returns structured JSON with status code
2. THE backend template SHALL include `src/middlewares/asyncHandler.ts` (or `.js`) — a wrapper that catches async errors and passes them to next()
3. THE backend template SHALL include `src/middlewares/validate.ts` (or `.js`) — a middleware factory that accepts a Zod schema, validates `req.body`, and calls `next()` on success or returns 400 with error details on failure
4. THE backend template SHALL include `src/middlewares/auth.ts` (or `.js`) — a JWT verification middleware that reads `Authorization: Bearer <token>`, verifies it, and attaches the decoded payload to `req.user`
5. THE `errorHandler` middleware SHALL be registered as the last middleware in `src/app.ts`
6. THE `validate` middleware SHALL be used on all POST and PUT routes in `todo.routes.ts`

---

### Requirement 10: Backend Template — Database Configuration

**User Story:** As a developer, I want MongoDB configured and ready to use so that I can start writing data immediately after running the project.

#### Acceptance Criteria

1. THE backend template SHALL include `src/config/database.ts` (or `.js`) that exports a `connectDB` async function using `mongoose.connect(process.env.DATABASE_URL)`
2. THE `connectDB` function SHALL log "MongoDB connected" on success and throw on failure
3. THE `src/server.ts` (or `.js`) SHALL call `connectDB()` before `app.listen`
4. THE backend template `.env.example` SHALL include: `PORT=5000`, `DATABASE_URL=mongodb://localhost:27017/PROJECT_NAME`, `JWT_SECRET=changeme_replace_in_production`
5. THE backend template SHALL install dependencies: `express`, `mongoose`, `dotenv`, `zod`, `jsonwebtoken`, `cors`
6. THE backend template (TypeScript) SHALL install dev dependencies: `typescript`, `ts-node`, `nodemon`, `@types/express`, `@types/node`, `@types/jsonwebtoken`, `@types/cors`

---

### Requirement 11: Backend Template — JWT Auth Setup

**User Story:** As a developer, I want a basic JWT authentication layer pre-configured so that I can add protected routes without writing boilerplate from scratch.

#### Acceptance Criteria

1. THE backend template SHALL include `src/config/jwt.ts` (or `.js`) that exports `signToken(payload)` and `verifyToken(token)` helper functions using `jsonwebtoken`
2. THE `JWT_SECRET` SHALL be read from `process.env.JWT_SECRET` — never hardcoded
3. THE `auth` middleware SHALL use `verifyToken` from `src/config/jwt.ts`
4. IF the JWT token is missing or invalid, THE `auth` middleware SHALL return HTTP 401 with `{ success: false, message: 'Unauthorized' }`

---

### Requirement 12: MERN Full Stack Template

**User Story:** As a developer selecting MERN, I want a complete monorepo with both a working React frontend and Express backend, sharing a Todo application end-to-end.

#### Acceptance Criteria

1. WHEN the User selects MERN, THE CLI_Tool SHALL copy the `mern-ts` or `mern-js` internal template
2. THE MERN template SHALL contain: `client/` (React + Vite) and `server/` (Express + Mongoose), each as a separate npm workspace
3. THE `server/` SHALL contain the complete Express Todo API as defined in Requirements 7–11
4. THE `client/` SHALL contain a working React + Vite Todo UI as defined in Requirement 6, with Tailwind configured
5. THE `client/src/lib/api.ts` (or `.js`) SHALL export a typed API client with functions: `fetchTodos`, `createTodo`, `updateTodo`, `deleteTodo` — each calling the Express server via `fetch` or `axios`
6. THE `client/src/hooks/useTodos.ts` (or `.js`) SHALL use the API client (not local state) to perform CRUD operations against the Express backend
7. THE root `package.json` SHALL include scripts: `dev` (runs both client and server concurrently), `build` (builds both), `start` (starts server only)
8. THE root `.env.example` SHALL include all backend variables plus `VITE_API_URL=http://localhost:5000`
9. THE `client/` SHALL have its own `.env.example` with `VITE_API_URL=http://localhost:5000`

---

### Requirement 13: Next.js Full Stack Template

**User Story:** As a developer selecting Next.js Full Stack, I want a complete Next.js application with App Router, API route handlers, MongoDB integration, and a working Todo system.

#### Acceptance Criteria

1. WHEN the User selects Next.js Full Stack, THE CLI_Tool SHALL copy the `next-fullstack-ts` or `next-fullstack-js` internal template
2. THE template SHALL use App Router exclusively — no `pages/` directory
3. THE template SHALL include `app/api/todos/route.ts` (or `.js`) handling GET and POST requests
4. THE template SHALL include `app/api/todos/[id]/route.ts` (or `.js`) handling GET, PUT, and DELETE requests
5. THE template SHALL include `lib/db.ts` (or `.js`) — a MongoDB connection singleton using Mongoose
6. THE template SHALL include `lib/models/todo.model.ts` (or `.js`) — Mongoose Todo schema
7. THE template SHALL include `lib/validations/todo.validation.ts` (or `.js`) — Zod schemas for create and update
8. THE template SHALL include `app/page.tsx` (or `.js`) as a Server Component that fetches todos from the API
9. THE template SHALL include `components/TodoList.tsx` (or `.jsx`) as a Client Component (`'use client'`) handling local state and CRUD operations via `fetch`
10. THE template `.env.example` SHALL include: `DATABASE_URL=mongodb://localhost:27017/PROJECT_NAME`, `NEXTAUTH_SECRET=changeme`
11. THE template SHALL install: `next`, `react`, `react-dom`, `mongoose`, `zod`
12. THE template (TypeScript) SHALL install: `typescript`, `@types/react`, `@types/node`, `@types/react-dom`

---

### Requirement 14: Database Prompt and Configuration

**User Story:** As a developer, I want to choose my database during scaffolding so that the correct driver, connection config, and environment variables are set up automatically.

#### Acceptance Criteria

1. WHEN the User selects Backend or Full Stack, THE CLI_Tool SHALL prompt for Database selection with option: MongoDB (with message "More databases coming soon")
2. WHEN the User selects Frontend, THE CLI_Tool SHALL NOT show the Database prompt — `database` SHALL be set to `'mongodb'` internally as a default
3. WHEN MongoDB is selected, THE CLI_Tool SHALL ensure `mongoose` is listed in the template's dependencies
4. WHEN MongoDB is selected, THE CLI_Tool SHALL ensure `DATABASE_URL=mongodb://localhost:27017/PROJECT_NAME` is present in `.env.example`
5. WHEN MongoDB is selected, THE CLI_Tool SHALL ensure a database config file (`src/config/database.ts` or `lib/db.ts`) is present and uses `mongoose.connect`
6. Frontend projects delegate to official CLIs (create-vite, create-next-app) and have no server-side database connection — the database field is stored in `PromptAnswers` for type consistency but the prompt is skipped in the UI

---

### Requirement 15: Directory Collision Handling

**User Story:** As a developer, I want to be warned if a directory already exists so I can choose to overwrite or cancel without losing work.

#### Acceptance Criteria

1. BEFORE any scaffolding, THE CLI_Tool SHALL check if `<cwd>/<Project_Name>` already exists
2. IF the Target_Directory exists, THE CLI_Tool SHALL prompt: "Directory already exists. Overwrite or Cancel?"
3. WHEN the User selects Overwrite, THE CLI_Tool SHALL delete the existing directory and proceed
4. WHEN the User selects Cancel, THE CLI_Tool SHALL display a message and exit with code 0

---

### Requirement 16: Dependency Installation

**User Story:** As a developer, I want all dependencies installed automatically so my project is runnable immediately after scaffolding.

#### Acceptance Criteria

1. WHEN all file generation and post-processing completes, THE CLI_Tool SHALL run the selected Package_Manager install command in Target_Directory
2. WHEN Package_Manager is npm, THE CLI_Tool SHALL run `npm install`
3. WHEN Package_Manager is yarn, THE CLI_Tool SHALL run `yarn install`
4. WHEN Package_Manager is pnpm, THE CLI_Tool SHALL run `pnpm install`
5. WHEN installing, THE CLI_Tool SHALL display a Spinner with status "Installing dependencies..."
6. IF installation fails, THE CLI_Tool SHALL log a warning with the manual install command and continue

---

### Requirement 17: Git Initialization

**User Story:** As a developer, I want git initialized with an initial commit so I can start committing changes immediately.

#### Acceptance Criteria

1. WHEN dependency installation completes, THE CLI_Tool SHALL run `git init` in Target_Directory
2. WHEN `git init` succeeds, THE CLI_Tool SHALL run `git add .`
3. WHEN `git add .` succeeds, THE CLI_Tool SHALL run `git commit -m "Initial commit from create-app"`
4. IF any git command fails, THE CLI_Tool SHALL display a warning and continue to next steps
5. THE git workflow SHALL run for all project types including delegated frontend projects

---

### Requirement 18: Next Steps Display

**User Story:** As a developer, I want to see clear, project-aware next steps so I know exactly how to run my new project.

#### Acceptance Criteria

1. WHEN all operations complete, THE CLI_Tool SHALL display a success banner with the Project_Name
2. THE next steps SHALL include `cd <Project_Name>`
3. WHEN the project is React Vite or Next.js (standalone), the next steps SHALL show `<pm> run dev`
4. WHEN the project is Express backend, the next steps SHALL show: set up MongoDB, update `.env`, run `<pm> run dev`
5. WHEN the project is MERN, the next steps SHALL show: update `.env`, run `<pm> run dev` from the root
6. WHEN the project is Next.js Full Stack, the next steps SHALL show: update `.env`, run `<pm> run dev`
7. ALL next steps SHALL use green colored text with chalk

---

### Requirement 19: Error Handling

**User Story:** As a developer, I want all errors handled gracefully so I understand what went wrong and what to do next.

#### Acceptance Criteria

1. WHEN a fatal error occurs, THE CLI_Tool SHALL stop the active Spinner in fail state, display an error in red, and exit with code 1
2. WHEN a non-fatal error occurs (install, git), THE CLI_Tool SHALL display a yellow warning with a manual command hint and continue
3. FOR ALL async operations, error handling SHALL be wrapped in try/catch
4. WHEN a template directory is not found, THE CLI_Tool SHALL display a clear error and exit
5. WHEN a required template file (package.json or README.md) is missing, THE CLI_Tool SHALL display a clear error naming the file and exit

---

### Requirement 20: TypeScript and Code Quality

**User Story:** As a developer maintaining the CLI, I want strict TypeScript and consistent code standards so the CLI is reliable and easy to extend.

#### Acceptance Criteria

1. THE CLI_Tool source SHALL compile with `"strict": true` in TypeScript
2. THE CLI_Tool SHALL have no implicit `any` types
3. ALL modules SHALL use named exports
4. ALL modules SHALL be under 150 lines of code where possible
5. THE CLI entry point `src/index.ts` SHALL begin with `#!/usr/bin/env node` as the very first line
6. THE CLI_Tool SHALL be buildable with `tsup` to `dist/` in CJS format
7. THE `package.json` `bin` field SHALL map `create-app` to `./dist/index.js`
8. THE `package.json` `files` field SHALL include both `dist` and `templates`

---

### Requirement 21: Post-Processing Layer Architecture

**User Story:** As a developer maintaining the CLI, I want the post-processing pipeline to be separate from the core generator so that each enhancement can be developed, tested, and extended independently.

#### Acceptance Criteria

1. THE CLI_Tool SHALL implement a dedicated post-processing module: `src/core/postprocessor.ts`
2. THE `postprocessor.ts` SHALL export `runPostProcessing(config: ResolvedConfig): Promise<void>`
3. THE post-processor SHALL be called by `generator.ts` after scaffolding (delegation or copy) completes and before dependency installation
4. THE post-processor SHALL call sub-processors based on project type:
   - Frontend: `injectFolderStructure()` → `setupTailwind()` → `injectTodoApp()`
   - Backend: no post-processing needed (templates are already complete)
   - MERN: no post-processing needed (templates are already complete)
   - Next.js Full Stack: no post-processing needed (templates are already complete)
5. EACH sub-processor SHALL be a separate exported async function within `postprocessor.ts` or in a `src/core/postprocessors/` subdirectory
6. THE post-processor SHALL use the Spinner and logger utilities for feedback during each step