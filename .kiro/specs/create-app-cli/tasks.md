# Implementation Plan: create-app-cli (v2 — Production-Grade)

## Overview

This plan builds a production-grade CLI scaffolding tool. Every task is atomic, references specific requirements, and builds directly on the previous task's output. The plan is structured so that Kiro can execute tasks one at a time with clear acceptance criteria for each.

**Critical implementation rules (read before starting any task):**
- Every task MUST compile without TypeScript errors before the next task starts
- Named exports only — no default exports except React components
- All modules under 150 lines where possible
- No placeholder/TODO comments in implementation — write the actual code
- Templates must contain REAL, runnable code — not empty files

---

## Tasks

---

- [ ] 1. Project scaffolding and configuration

  Create the complete project skeleton with all configuration files and dependency installation.

  **Deliverables:**
  - `package.json`:
    ```json
    {
      "name": "create-app",
      "version": "1.0.0",
      "description": "Production-grade project scaffolding CLI",
      "bin": { "create-app": "./dist/index.js" },
      "files": ["dist", "src/templates"],
      "engines": { "node": ">=18" },
      "scripts": {
        "build": "tsup",
        "dev": "ts-node src/index.ts",
        "test": "vitest run",
        "test:watch": "vitest"
      },
      "dependencies": {
        "commander": "^12.0.0",
        "inquirer": "^9.0.0",
        "chalk": "^5.0.0",
        "ora": "^8.0.0"
      },
      "devDependencies": {
        "typescript": "^5.0.0",
        "tsup": "^8.0.0",
        "@types/node": "^20.0.0",
        "ts-node": "^10.0.0",
        "vitest": "^1.0.0",
        "fast-check": "^3.0.0"
      }
    }
    ```
  - `tsconfig.json`: strict true, module commonjs, target ES2020, outDir dist, rootDir src, esModuleInterop true, resolveJsonModule true, skipLibCheck true
  - `tsup.config.ts`: entry src/index.ts, format cjs, clean true, outDir dist, target node18, shims true, banner `{ js: '#!/usr/bin/env node' }`
  - Directory tree: `src/prompts/`, `src/core/`, `src/utils/`, `src/templates/`, `tests/unit/`, `tests/property/`
  - Run `npm install`

  _Requirements: 20.1, 20.2, 20.3, 20.5, 20.6, 20.7, 20.8_

---

- [ ] 2. Logger utility — `src/utils/logger.ts`

  Write the complete logger module. This is the foundation all other modules depend on.

  **Deliverables — implement ALL of the following named exports:**

  ```typescript
  import chalk from 'chalk';
  import ora, { Ora } from 'ora';
  import { ResolvedConfig } from '../core/resolver';

  export function logInfo(message: string): void
  export function logSuccess(message: string): void
  export function logWarning(message: string): void
  export function logError(message: string): void
  export function stepHeader(n: number, message: string): void
  export function createSpinner(text: string): Ora
  export function stopSpinner(spinner: Ora, status: 'succeed' | 'fail' | 'warn', message: string): void
  export function displayNextSteps(config: ResolvedConfig): void
  ```

  **`displayNextSteps` must be project-type-aware:**
  - All types: `cd <projectName>`
  - react-vite, nextjs (frontend), express: `<pm> run dev`
  - mern: `<pm> run dev` (from root, runs both client and server via concurrently)
  - next-fullstack: `<pm> run dev`
  - Express backend: also show "Make sure MongoDB is running" and "Update .env with your DATABASE_URL"

  Colors: blue=info, green=success, yellow=warning, red=error, cyan=stepHeader bold

  _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7_

---

- [ ] 3. Validators — `src/prompts/validators.ts`

  ```typescript
  export function validateProjectName(name: string): true | string {
    if (!name || name.trim() === '') return 'Project name cannot be empty';
    if (/\s/.test(name)) return 'Project name cannot contain spaces';
    if (/[A-Z]/.test(name)) return 'Project name must be lowercase';
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) return 'Only lowercase letters, numbers, and hyphens are allowed';
    return true;
  }
  ```

  **Write unit tests `tests/unit/validators.test.ts`:**
  - Valid: `'my-app'`, `'app123'`, `'my-app-2'`, `'a'`, `'todo-app-2024'`
  - Invalid: `'My-App'`, `'my app'`, `'my_app'`, `'my@app'`, `''`, `'  '`, `'-app'`, `'app-'`

  **Write property test `tests/property/validation.property.test.ts`:**
  ```
  // Feature: create-app-cli, Property 1: Valid names pass validation
  // Generate strings matching /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/ → assert returns true
  // Feature: create-app-cli, Property 2: Invalid names are rejected
  // Generate strings with uppercase/spaces/specials → assert returns string (error)
  ```

  _Requirements: 2.1, 2.2, 2.3, 2.4_

---

- [ ] 4. Prompt modules — one file per project type

  Create all four prompt files. Each file handles ONLY its project type's questions.

  **4.1 `src/prompts/main.prompt.ts`**
  ```typescript
  export interface MainAnswers { projectType: 'frontend' | 'backend' | 'fullstack' }
  export async function runMainPrompt(): Promise<MainAnswers>
  ```
  - Display welcome banner: chalk.bold.cyan('\n🚀 Welcome to create-app CLI\n')
  - stepHeader(1, 'Select Project Type')
  - Inquirer list: Frontend | Backend | Full Stack → map to 'frontend' | 'backend' | 'fullstack'

  **4.2 `src/prompts/frontend.prompt.ts`**
  ```typescript
  export interface FrontendAnswers { framework: 'react-vite' | 'nextjs'; language: 'typescript' | 'javascript' }
  export async function runFrontendPrompts(): Promise<FrontendAnswers>
  ```
  - stepHeader(2, 'Frontend Configuration')
  - list: "React (Vite-based)" → 'react-vite', "Next.js" → 'nextjs'
  - list: "TypeScript" → 'typescript', "JavaScript" → 'javascript'

  **4.3 `src/prompts/backend.prompt.ts`**
  ```typescript
  export interface BackendAnswers { framework: 'express'; language: 'typescript' | 'javascript' }
  export async function runBackendPrompts(): Promise<BackendAnswers>
  ```
  - stepHeader(2, 'Backend Configuration')
  - logInfo('Framework: Express.js (only option)')
  - list: language only
  - Return `{ framework: 'express', language }`

  **4.4 `src/prompts/fullstack.prompt.ts`**
  ```typescript
  export interface FullstackAnswers { framework: 'mern' | 'next-fullstack'; language: 'typescript' | 'javascript' }
  export async function runFullstackPrompts(): Promise<FullstackAnswers>
  ```
  - stepHeader(2, 'Full Stack Configuration')
  - list: "MERN (MongoDB + Express + React + Node)" → 'mern', "Next.js Full Stack" → 'next-fullstack'
  - list: language

  _Requirements: 1.1–1.12, 20.3_

---

- [ ] 5. Resolver — `src/core/resolver.ts`

  Pure mapping function. No I/O, no side effects. Must handle all 10 project combinations plus database config.

  **Interfaces (export both):**
  ```typescript
  export interface PromptAnswers {
    projectType: 'frontend' | 'backend' | 'fullstack';
    framework: string;
    language: 'typescript' | 'javascript';
    database: 'mongodb';
    projectName: string;
    packageManager: 'npm' | 'yarn' | 'pnpm';
  }

  export interface ResolvedConfig {
    type: 'delegate' | 'template';
    projectType: 'frontend' | 'backend' | 'fullstack';
    framework: string;
    language: 'typescript' | 'javascript';
    database: 'mongodb';
    projectName: string;
    packageManager: 'npm' | 'yarn' | 'pnpm';
    targetPath: string;
    command?: string;
    args?: string[];
    templateName?: string;
    templatePath?: string;
  }

  export function resolveConfig(answers: PromptAnswers): ResolvedConfig
  ```

  **Implement the full resolution table from design.md.** For Next.js delegation always add `--use-<pm>` and `--no-git` and `--app` flags. Set `targetPath = path.join(process.cwd(), projectName)` and `templatePath = path.join(__dirname, '..', 'templates', templateName)`.

  **Unit tests `tests/unit/resolver.test.ts`** — test all 10 combinations:
  - react-vite + ts → type: 'delegate', command includes 'react-ts'
  - react-vite + js → type: 'delegate', command includes 'react' (not react-ts)
  - nextjs + ts + pnpm → args include '--use-pnpm', '--no-git', '--app', '--typescript'
  - nextjs + js + yarn → args include '--use-yarn', '--no-typescript'
  - express + ts → type: 'template', templateName: 'express-ts'
  - express + js → type: 'template', templateName: 'express-js'
  - mern + ts → type: 'template', templateName: 'mern-ts'
  - mern + js → type: 'template', templateName: 'mern-js'
  - next-fullstack + ts → type: 'template', templateName: 'next-fullstack-ts'
  - next-fullstack + js → type: 'template', templateName: 'next-fullstack-js'

  **Property test `tests/property/delegation.property.test.ts`:**
  ```
  // Feature: create-app-cli, Property 3: projectName always in delegation command string
  ```

  _Requirements: 3.1–3.7, 4.1–4.6, 14.1–14.4_

---

- [ ] 6. CHECKPOINT — all tests must pass
  Run `npm test`. Fix any TypeScript or test errors before proceeding. Ask if anything is unclear.

---

- [ ] 7. Utility modules

  **7.1 `src/utils/copy.ts`**

  ```typescript
  export async function copyTemplate(templatePath: string, targetPath: string): Promise<void>
  export async function replacePlaceholders(targetPath: string, projectName: string): Promise<void>
  export async function createEnvFile(targetPath: string): Promise<void>
  export async function validateTemplate(templatePath: string): Promise<void>
  ```

  - `copyTemplate`: `fs.cp(src, dest, { recursive: true })` — Node 18+
  - `replacePlaceholders`: read package.json + README.md with `{ encoding: 'utf8' }`, `replaceAll('PROJECT_NAME', projectName)`, write back
  - `createEnvFile`: check `.env.example` exists → `fs.copyFile` to `.env`
  - `validateTemplate`: check directory exists, check package.json exists, check README.md exists — throw descriptive Error for each missing item

  **Unit tests `tests/unit/copy.test.ts`** using memfs or tmp dirs.

  **Property tests `tests/property/placeholder.property.test.ts`:**
  ```
  // Feature: create-app-cli, Property 4: Zero PROJECT_NAME remain after replacePlaceholders
  // Feature: create-app-cli, Property 5: File encoding preserved during replacement
  // Feature: create-app-cli, Property 6: .env content equals .env.example after createEnvFile
  ```

  _Requirements: 4.7–4.9, 5.1–5.4, 6.1–6.3, 14.1–14.4_

  ---

  **7.2 `src/utils/install.ts`**

  ```typescript
  export async function installDependencies(targetPath: string, packageManager: 'npm' | 'yarn' | 'pnpm'): Promise<void>
  export async function installDevDependencies(targetPath: string, packageManager: string, packages: string[]): Promise<void>
  ```

  Both use `child_process.spawn` with `{ cwd: targetPath, stdio: 'inherit', shell: true }`. Resolve on exit 0, reject otherwise.

  Note: `installDevDependencies` is used by the post-processor to install Tailwind dev deps into the frontend project.

  **Unit tests `tests/unit/install.test.ts`**: mock spawn, test each pm, test error path.

  _Requirements: 16.1–16.6_

  ---

  **7.3 `src/utils/git.ts`**

  ```typescript
  export async function initGit(targetPath: string): Promise<void>
  ```

  Runs sequentially: `git init` → `git add .` → `git commit -m "Initial commit from create-app"`. Use `stdio: 'pipe'` to suppress git output. Reject if any step fails.

  **Unit tests `tests/unit/git.test.ts`**: mock spawn, test sequence, test failure.

  _Requirements: 17.1–17.5_

---

- [x] 8. Todo code strings — `src/core/todoTemplates.ts`

  This module stores the exact code for every file the post-processor writes into frontend projects. Storing them here (rather than inline in postprocessor.ts) keeps postprocessor.ts under 150 lines.

  Export one function per file to be written. Each function takes `(language: 'typescript' | 'javascript')` and returns the file content string.

  **Export all of the following:**

  ```typescript
  export function getTodoTypeContent(language: string): string
  export function getUseTodosContent(language: string): string
  export function getTodoItemContent(language: string): string
  export function getTodoFormContent(language: string): string
  export function getTodoListContent(language: string): string
  export function getTodoIndexContent(language: string): string
  export function getAppContent(language: string): string        // React Vite App.tsx replacement
  export function getNextPageContent(language: string): string   // Next.js page.tsx replacement
  export function getTailwindConfig(framework: string, language: string): string
  export function getPostcssConfig(): string
  export function getTailwindCSS(): string                       // @tailwind base/components/utilities
  ```

  **Write the EXACT code for each file.** Use the code from the design document exactly — do not truncate, simplify, or use placeholders. The TypeScript versions must be properly typed (no `any`). The JavaScript versions use the same JSX structure but without type annotations and with `@param` JSDoc where needed.

  _Requirements: 6.1–6.8_

---

- [x] 9. Post-processor — `src/core/postprocessor.ts`

  The post-processor runs after delegation completes for frontend projects. It injects folder structure, Tailwind, and the Todo application.

  **Export:**
  ```typescript
  export async function runPostProcessing(config: ResolvedConfig): Promise<void>
  ```

  **Internal structure:**
  ```typescript
  async function injectFolderStructure(config: ResolvedConfig): Promise<void>
  async function setupTailwind(config: ResolvedConfig): Promise<void>
  async function injectTodoApp(config: ResolvedConfig): Promise<void>
  ```

  **`injectFolderStructure` implementation:**
  - Create dirs (using `fs.mkdir({ recursive: true })`):
    ```
    src/features/todo
    src/components/atoms
    src/components/molecules
    src/components/organisms
    src/hooks
    src/lib
    src/types
    ```
  - Write `.gitkeep` in each leaf dir

  **`setupTailwind` implementation:**
  - Call `installDevDependencies(targetPath, pm, ['tailwindcss', 'postcss', 'autoprefixer'])`
  - Write `tailwind.config.js` (or `.ts` if TypeScript) using `getTailwindConfig(framework, language)` from todoTemplates.ts
  - Write `postcss.config.js` using `getPostcssConfig()`
  - If react-vite: overwrite `src/index.css` with `getTailwindCSS()`
  - If nextjs: overwrite `app/globals.css` with `getTailwindCSS()`
  - Log each step with spinner

  **`injectTodoApp` implementation:**
  - Determine ext = `ts` or `js`, jsx = `tsx` or `jsx`
  - Write files using content from `todoTemplates.ts`:
    - `src/types/todo.{ext}` ← `getTodoTypeContent(language)`
    - `src/hooks/useTodos.{ext}` ← `getUseTodosContent(language)`
    - `src/features/todo/TodoItem.{jsx}` ← `getTodoItemContent(language)`
    - `src/features/todo/TodoForm.{jsx}` ← `getTodoFormContent(language)`
    - `src/features/todo/TodoList.{jsx}` ← `getTodoListContent(language)`
    - `src/features/todo/index.{ext}` ← `getTodoIndexContent(language)`
  - If react-vite: OVERWRITE `src/App.{jsx}` ← `getAppContent(language)`; delete `src/App.css` and `src/assets/react.svg` if they exist
  - If nextjs: OVERWRITE `app/page.{jsx}` ← `getNextPageContent(language)`; create `components/` dir; write `components/TodoList.{jsx}` with the client component version

  **Unit tests `tests/unit/postprocessor.test.ts`:**
  - Mock fs, installDevDependencies
  - Test react-vite + ts: all dirs created, tailwind files written, todo files written, App.tsx overwritten
  - Test nextjs + js: globals.css overwritten, page.js overwritten, components dir created
  - Test that App.css is deleted after injection
  - Test that src/features/todo/ has all 4 files after injection

  _Requirements: 4.1–4.8, 5.1–5.8, 21.1–21.6_

---

- [x] 10. Generator — `src/core/generator.ts`

  Orchestrates the full pipeline. No business logic — calls other modules.

  **Export:**
  ```typescript
  export async function generateProject(config: ResolvedConfig): Promise<void>
  ```

  **Full pipeline:**

  ```typescript
  export async function generateProject(config: ResolvedConfig): Promise<void> {
    // Step 1: Scaffold
    stepHeader(1, 'Scaffolding project');
    const spinner = createSpinner('Setting up...');
    try {
      if (config.type === 'delegate') {
        // spawn config.command with config.args, stdio: 'inherit', cwd: process.cwd()
        // throw if exit code !== 0
        stopSpinner(spinner, 'succeed', 'Project scaffolded via official CLI');
      } else {
        await validateTemplate(config.templatePath!);
        spinner.text = 'Copying template...';
        await copyTemplate(config.templatePath!, config.targetPath);
        await replacePlaceholders(config.targetPath, config.projectName);
        await createEnvFile(config.targetPath);
        stopSpinner(spinner, 'succeed', 'Template copied and configured');
      }
    } catch (err) {
      stopSpinner(spinner, 'fail', String(err));
      throw err;
    }

    // Step 2: Post-process (frontend only)
    if (config.projectType === 'frontend') {
      stepHeader(2, 'Enhancing project structure');
      await runPostProcessing(config);
    }

    // Step 3: Install dependencies
    stepHeader(3, 'Installing dependencies');
    const spinner2 = createSpinner(`Running ${config.packageManager} install...`);
    try {
      await installDependencies(config.targetPath, config.packageManager);
      stopSpinner(spinner2, 'succeed', 'Dependencies installed');
    } catch (err) {
      stopSpinner(spinner2, 'warn', 'Dependency installation failed');
      logWarning(`Run manually: cd ${config.projectName} && ${config.packageManager} install`);
    }

    // Step 4: Git init
    stepHeader(4, 'Initializing git repository');
    const spinner3 = createSpinner('git init + initial commit...');
    try {
      await initGit(config.targetPath);
      stopSpinner(spinner3, 'succeed', 'Git initialized with initial commit');
    } catch (err) {
      stopSpinner(spinner3, 'warn', 'Git initialization failed — run manually');
    }

    // Step 5: Display next steps
    displayNextSteps(config);
  }
  ```

  **Unit tests `tests/unit/generator.test.ts`:**
  - Mock copy.ts, install.ts, git.ts, postprocessor.ts, child_process
  - Test: delegate path calls spawn, then runPostProcessing (if frontend), then install, then git
  - Test: template path calls validateTemplate + copy + replace + env, then install, then git
  - Test: install failure logs warning, git still called
  - Test: git failure logs warning, displayNextSteps still called
  - Test: missing template → throws before install

  _Requirements: 3.7, 3.8, 7.6, 8.4, 11.1, 19.1–19.5, 21.3, 21.4_

---

- [x] 11. CLI orchestration — `src/cli.ts` and `src/index.ts`

  **11.1 `src/cli.ts`**

  ```typescript
  export async function createApp(): Promise<void>
  ```

  Complete implementation:
  ```
  1. runMainPrompt()                              → { projectType }
  2. runSubPrompt based on projectType            → { framework, language }
  3. Inquirer list: "Database" options: ['MongoDB (recommended)']
     → map to { database: 'mongodb' }
     → display: stepHeader(3, 'Database')
  4. Inquirer input: "Project name" validate: validateProjectName
     → { projectName }
     → display: stepHeader(4, 'Project Name')
  5. Inquirer list: "Package manager" npm | yarn | pnpm
     → { packageManager }
     → display: stepHeader(5, 'Package Manager')
  6. Merge all → PromptAnswers
  7. Check directory: path.join(process.cwd(), projectName) exists?
     → if yes: Inquirer list "Overwrite or Cancel?"
       → Cancel: logInfo('Cancelled') + process.exit(0)
       → Overwrite: fs.rm(path, { recursive: true, force: true })
  8. resolveConfig(answers) → config
  9. await generateProject(config)
  ```

  Entire function wrapped in try/catch → `logError(err.message)` → `process.exit(1)`.

  **11.2 `src/index.ts`**

  ```typescript
  #!/usr/bin/env node
  import { program } from 'commander';
  import { createApp } from './cli';

  program
    .name('create-app')
    .version('1.0.0')
    .description('Scaffold production-ready projects instantly');

  const createCmd = program
    .command('create')
    .description('Create a new project')
    .action(createApp);

  program.addCommand(createCmd, { isDefault: true });
  program.parse(process.argv);
  ```

  **Unit test `tests/unit/cli.test.ts`:**
  - Mock all Inquirer prompts + generateProject
  - Test frontend → runFrontendPrompts called, database prompted, correct PromptAnswers built
  - Test backend → runBackendPrompts called
  - Test fullstack → runFullstackPrompts called
  - Test collision: directory exists → cancel → process.exit(0)
  - Test collision: directory exists → overwrite → fs.rm called → generateProject called

  _Requirements: 1.1–1.12, 2.4, 14.1, 15.1–15.4, 19.1–19.3_

---

- [ ] 12. CHECKPOINT — all tests must pass
  Run `npm test`. Run `npm run build`. Fix all TypeScript errors. Ask if anything is unclear.

---

- [x] 13. Template: express-ts

  Create `src/templates/express-ts/` as a **complete, runnable Express + TypeScript + Mongoose + Zod + JWT project.**

  Write every file listed below with REAL, non-placeholder code:

  **File list (all paths relative to `src/templates/express-ts/`):**

  - `package.json`
    ```json
    {
      "name": "PROJECT_NAME",
      "version": "1.0.0",
      "scripts": {
        "dev": "nodemon",
        "build": "tsc",
        "start": "node dist/server.js"
      },
      "dependencies": {
        "express": "^4.18.0",
        "mongoose": "^8.0.0",
        "dotenv": "^16.0.0",
        "zod": "^3.22.0",
        "jsonwebtoken": "^9.0.0",
        "cors": "^2.8.5"
      },
      "devDependencies": {
        "typescript": "^5.0.0",
        "ts-node": "^10.0.0",
        "nodemon": "^3.0.0",
        "@types/express": "^4.17.0",
        "@types/node": "^20.0.0",
        "@types/jsonwebtoken": "^9.0.0",
        "@types/cors": "^2.8.0"
      }
    }
    ```

  - `tsconfig.json` — strict: true, module: commonjs, target: ES2020, rootDir: src, outDir: dist

  - `nodemon.json`
    ```json
    { "watch": ["src"], "ext": "ts", "exec": "ts-node src/server.ts" }
    ```

  - `.env.example`
    ```
    PORT=5000
    DATABASE_URL=mongodb://localhost:27017/PROJECT_NAME
    JWT_SECRET=changeme_replace_in_production
    ```

  - `.gitignore` — `node_modules/`, `dist/`, `.env`

  - `README.md` — `# PROJECT_NAME\n\nExpress + TypeScript REST API with MongoDB, Zod validation, and JWT auth.\n\n## Quick Start\n\n1. cp .env.example .env\n2. Update DATABASE_URL in .env\n3. npm run dev`

  - `src/server.ts`
    ```typescript
    import dotenv from 'dotenv';
    dotenv.config();
    import { app } from './app';
    import { connectDB } from './config/database';

    const PORT = process.env.PORT ?? 5000;

    async function main() {
      await connectDB();
      app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    }

    main().catch(console.error);
    ```

  - `src/app.ts`
    ```typescript
    import express from 'express';
    import cors from 'cors';
    import { router } from './routes';
    import { errorHandler } from './middlewares/errorHandler';

    export const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(router);
    app.use(errorHandler);
    ```

  - `src/config/database.ts`
    ```typescript
    import mongoose from 'mongoose';

    export async function connectDB(): Promise<void> {
      const uri = process.env.DATABASE_URL;
      if (!uri) throw new Error('DATABASE_URL is not defined in .env');
      await mongoose.connect(uri);
      console.log('✔ MongoDB connected');
    }
    ```

  - `src/config/jwt.ts`
    ```typescript
    import jwt from 'jsonwebtoken';

    const SECRET = process.env.JWT_SECRET ?? 'fallback-secret';

    export function signToken(payload: object, expiresIn = '7d'): string {
      return jwt.sign(payload, SECRET, { expiresIn } as jwt.SignOptions);
    }

    export function verifyToken(token: string): jwt.JwtPayload | string {
      return jwt.verify(token, SECRET);
    }
    ```

  - `src/models/todo.model.ts`
    ```typescript
    import mongoose, { Document, Schema } from 'mongoose';

    export interface ITodo extends Document {
      title: string;
      completed: boolean;
      createdAt: Date;
    }

    const TodoSchema = new Schema<ITodo>(
      {
        title: { type: String, required: true, trim: true },
        completed: { type: Boolean, default: false },
      },
      { timestamps: true }
    );

    export const Todo = mongoose.model<ITodo>('Todo', TodoSchema);
    ```

  - `src/validations/todo.validation.ts`
    ```typescript
    import { z } from 'zod';

    export const createTodoSchema = z.object({
      title: z.string().min(1, 'Title is required').max(200),
    });

    export const updateTodoSchema = z.object({
      title: z.string().min(1).max(200).optional(),
      completed: z.boolean().optional(),
    });

    export type CreateTodoInput = z.infer<typeof createTodoSchema>;
    export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
    ```

  - `src/services/todo.service.ts`
    ```typescript
    import { Todo } from '../models/todo.model';
    import { CreateTodoInput, UpdateTodoInput } from '../validations/todo.validation';

    export const getAllTodos = () => Todo.find().sort({ createdAt: -1 });
    export const getTodoById = (id: string) => Todo.findById(id);
    export const createTodo = (data: CreateTodoInput) => Todo.create(data);
    export const updateTodo = (id: string, data: UpdateTodoInput) =>
      Todo.findByIdAndUpdate(id, data, { new: true });
    export const deleteTodo = (id: string) => Todo.findByIdAndDelete(id);
    ```

  - `src/middlewares/asyncHandler.ts`
    ```typescript
    import { Request, Response, NextFunction, RequestHandler } from 'express';

    export const asyncHandler =
      (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
      (req, res, next) =>
        Promise.resolve(fn(req, res, next)).catch(next);
    ```

  - `src/middlewares/errorHandler.ts`
    ```typescript
    import { Request, Response, NextFunction } from 'express';

    export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
      console.error(err.stack);
      res.status(500).json({ success: false, message: err.message ?? 'Internal Server Error' });
    }
    ```

  - `src/middlewares/validate.ts`
    ```typescript
    import { ZodSchema } from 'zod';
    import { Request, Response, NextFunction } from 'express';

    export const validate =
      (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
          res.status(400).json({ success: false, message: 'Validation failed', errors: result.error.flatten() });
          return;
        }
        req.body = result.data;
        next();
      };
    ```

  - `src/middlewares/auth.ts`
    ```typescript
    import { Request, Response, NextFunction } from 'express';
    import { verifyToken } from '../config/jwt';

    export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
      const header = req.headers.authorization;
      if (!header?.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      try {
        const token = header.slice(7);
        const decoded = verifyToken(token);
        (req as Request & { user: unknown }).user = decoded;
        next();
      } catch {
        res.status(401).json({ success: false, message: 'Invalid token' });
      }
    }
    ```

  - `src/controllers/todo.controller.ts` — implement getAll, getOne, create, update, remove using asyncHandler and todoService (see design.md for exact code)

  - `src/routes/todo.routes.ts` — implement all 5 routes using validate middleware on POST and PUT

  - `src/routes/index.ts`
    ```typescript
    import { Router } from 'express';
    import todoRouter from './todo.routes';

    export const router = Router();
    router.use('/api', todoRouter);
    ```

  - `src/types/index.ts`
    ```typescript
    import { Request } from 'express';
    export interface AuthRequest extends Request { user?: unknown; }
    ```

  _Requirements: 7.1–7.8, 8.1–8.8, 9.1–9.6, 10.1–10.6, 11.1–11.4_

---

- [x] 14. Template: express-js

  Mirror `express-ts` but in JavaScript. ALL `.ts` files become `.js`. Use `require`/`module.exports` syntax throughout. No tsconfig. No `@types`. Use JSDoc for basic type hints where helpful.

  Key differences:
  - `package.json` scripts: `"dev": "nodemon src/server.js"`, `"start": "node src/server.js"`. No build script.
  - `nodemon.json`: `{ "exec": "node src/server.js", "ext": "js" }`
  - Remove `typescript`, `ts-node`, `@types/*` from devDependencies
  - All function signatures lose TypeScript annotations
  - Zod schemas remain identical (Zod works in JS)
  - Mongoose schema remains identical
  - `module.exports = { ... }` instead of `export const`

  _Requirements: 7.1–7.8, 8.1–8.8, 9.1–9.6, 10.1–10.6_

---

- [x] 15. Template: mern-ts

  Create the complete MERN TypeScript monorepo.

  **Root files:**
  - `package.json`:
    ```json
    {
      "name": "PROJECT_NAME",
      "private": true,
      "workspaces": ["client", "server"],
      "scripts": {
        "dev": "concurrently \"npm run dev --workspace=server\" \"npm run dev --workspace=client\"",
        "build": "npm run build --workspace=server && npm run build --workspace=client",
        "install:all": "npm install"
      },
      "devDependencies": { "concurrently": "^8.0.0" }
    }
    ```
  - `.env.example`: PORT=5000, DATABASE_URL=mongodb://localhost:27017/PROJECT_NAME, JWT_SECRET=changeme, VITE_API_URL=http://localhost:5000
  - `.gitignore`, `README.md`

  **`server/`** — identical to `express-ts` template (copy the full structure). `server/package.json` name = `PROJECT_NAME-server`.

  **`client/`** — React + Vite + TypeScript + Tailwind + API-connected Todo:
  - `package.json`: name = PROJECT_NAME-client, deps: react, react-dom; devDeps: vite, @vitejs/plugin-react, typescript, tailwindcss, postcss, autoprefixer, @types/react, @types/react-dom
  - `vite.config.ts`, `tsconfig.json`, `index.html`
  - `tailwind.config.ts`: content `['./src/**/*.{ts,tsx}', './index.html']`
  - `postcss.config.js`
  - `src/main.tsx`: React 18 createRoot
  - `src/index.css`: `@tailwind base; @tailwind components; @tailwind utilities;`
  - `src/App.tsx`: renders `<TodoList />`
  - `src/types/todo.ts`: `interface Todo { _id: string; title: string; completed: boolean; createdAt: string; }`
  - `src/lib/api.ts`: fetchTodos, createTodo, updateTodo, deleteTodo — all using `VITE_API_URL` from env (see design.md for exact code)
  - `src/hooks/useTodos.ts`: API-connected version using useEffect + api module (see design.md for exact code)
  - `src/features/todo/TodoItem.tsx`, `TodoForm.tsx`, `TodoList.tsx`, `index.ts` — full Tailwind-styled implementations (same as postprocessor injects, but with API-connected useTodos)
  - `src/components/atoms/.gitkeep`, `molecules/.gitkeep`, `organisms/.gitkeep`
  - `client/.env.example`: VITE_API_URL=http://localhost:5000

  _Requirements: 12.1–12.9_

---

- [x] 16. Template: mern-js

  Mirror `mern-ts` in JavaScript. Server uses CommonJS. Client uses `.jsx` files.
  - Remove all TypeScript config and types
  - Server: same as express-js template
  - Client: same structure with .jsx instead of .tsx

  _Requirements: 12.1–12.9_

---

- [x] 17. Template: next-fullstack-ts

  Create the complete Next.js Full Stack TypeScript template using App Router.

  **File list:**
  - `package.json`: name PROJECT_NAME; deps: next, react, react-dom, mongoose, zod; devDeps: typescript, @types/react, @types/node, @types/react-dom, tailwindcss, postcss, autoprefixer
  - `tsconfig.json`: Next.js standard (target: es5, lib: dom/esnext, jsx: preserve, strict: true, paths: { "@/*": ["./*"] })
  - `next.config.ts`: `import type { NextConfig } from 'next'; const config: NextConfig = {}; export default config;`
  - `tailwind.config.ts`: content `['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}']`
  - `postcss.config.js`
  - `.env.example`: DATABASE_URL=mongodb://localhost:27017/PROJECT_NAME, NEXTAUTH_SECRET=changeme
  - `.gitignore`: `.next/`, `node_modules/`, `.env`
  - `README.md`

  - `lib/db.ts` — Mongoose singleton (see design.md for exact code)
  - `lib/models/todo.model.ts` — Todo schema (same as express-ts version)
  - `lib/validations/todo.validation.ts` — Zod schemas (same as express-ts)

  - `app/globals.css` — `@tailwind base; @tailwind components; @tailwind utilities;`
  - `app/layout.tsx`:
    ```tsx
    import './globals.css';
    export default function RootLayout({ children }: { children: React.ReactNode }) {
      return <html lang="en"><body>{children}</body></html>;
    }
    ```
  - `app/page.tsx` — Server Component: calls connectDB, fetches todos, passes to `<TodoList initialTodos={todos} />`
  - `app/api/todos/route.ts` — GET + POST (see design.md for exact code)
  - `app/api/todos/[id]/route.ts` — GET + PUT + DELETE

  - `components/TodoList.tsx` — `'use client'` — full implementation with useState + fetch calls (see design.md for exact code)
  - `components/TodoItem.tsx` — `'use client'` — checkbox + delete with Tailwind
  - `components/TodoForm.tsx` — `'use client'` — input + submit with Tailwind

  _Requirements: 13.1–13.12_

---

- [x] 18. Template: next-fullstack-js

  Mirror `next-fullstack-ts` in JavaScript:
  - `.js`/`.jsx` files throughout
  - No tsconfig
  - `next.config.js` instead of `.ts`
  - `tailwind.config.js`
  - Remove @types packages
  - `lib/db.js`, `lib/models/todo.model.js`, etc.
  - `app/layout.js`, `app/page.js`, `app/api/todos/route.js`, `app/api/todos/[id]/route.js`
  - `components/TodoList.jsx`, `TodoItem.jsx`, `TodoForm.jsx`
  - **Uses App Router — no pages/ directory**

  _Requirements: 13.1–13.12_

---

- [ ] 19. Build verification and end-to-end test

  **19.1 Build:**
  - Run `npm run build`
  - Confirm `dist/index.js` exists
  - Confirm `dist/index.js` first line is `#!/usr/bin/env node`
  - If shebang missing: add `banner: { js: '#!/usr/bin/env node' }` to tsup.config.ts and rebuild

  **19.2 Link and test each flow:**
  - Run `npm link`
  - Test flow 1: `create-app` → Frontend → React Vite → TypeScript → MongoDB → my-react-app → npm
    - Verify: project created, Tailwind configured, `src/features/todo/` contains all files, `src/hooks/useTodos.ts` exists, `npm run dev` starts
  - Test flow 2: `create-app` → Frontend → Next.js → JavaScript → MongoDB → my-next-app → npm
    - Verify: `app/globals.css` has tailwind, `app/page.js` renders TodoList, `components/` created
  - Test flow 3: `create-app` → Backend → TypeScript → MongoDB → my-api → npm
    - Verify: `src/controllers/`, `src/services/`, `src/models/` all populated; `npm run dev` starts
  - Test flow 4: `create-app` → Full Stack → MERN → TypeScript → MongoDB → my-mern → npm
    - Verify: `client/` and `server/` both exist with full implementations; `npm run dev` starts both
  - Test flow 5: `create-app` → Full Stack → Next.js Full Stack → TypeScript → MongoDB → my-nextfs → npm
    - Verify: `app/api/todos/` exists, `lib/db.ts` exists, `components/TodoList.tsx` exists

  **19.3 Fix any issues found before marking complete.**

  _Requirements: all_

---

- [ ] 20. Final checkpoint — all tests green, build clean

  - Run `npm test` → all tests pass
  - Run `npm run build` → zero TypeScript errors
  - Review every template: confirm no placeholder code, no empty files, no TODO comments
  - Confirm all 6 templates have: `package.json` with `PROJECT_NAME`, `.env.example`, `.gitignore`, `README.md`
  - Ask if any questions arise

---

## Implementation Notes (read before every task)

1. **No placeholder code.** Every task must produce real, runnable implementation. If a function body says "implement this," Kiro must write the actual code.

2. **No empty template files.** Every file in every template must contain real code. The CLI generates these files into the user's project — empty files are unacceptable.

3. **Template naming.** Template files use `PROJECT_NAME` as the package name. The copy utility replaces it. Do not use any other placeholder format.

4. **TypeScript strictness.** Every `.ts` file in the CLI source must pass `tsc --strict` without errors. No `any` types allowed.

5. **Post-processor runs only for frontend.** Backend and fullstack templates are already complete — they do not need post-processing.

6. **MERN client uses API-connected hooks.** The MERN client's `useTodos` calls the Express server — not local state. This is different from the frontend-only version which uses local state.

7. **Next.js templates use App Router exclusively.** No `pages/` directory anywhere in `next-fullstack-ts` or `next-fullstack-js`.

8. **Git strategy.** Always: `git init` → `git add .` → `git commit`. Non-fatal on failure.

9. **Shebang line.** `src/index.ts` must start with `#!/usr/bin/env node`. tsup config must use `banner: { js: '#!/usr/bin/env node' }` to ensure it survives bundling.

10. **Template path resolution.** `templatePath = path.join(__dirname, '..', 'templates', templateName)` — this resolves correctly from `dist/index.js` to root `src/templates/`.