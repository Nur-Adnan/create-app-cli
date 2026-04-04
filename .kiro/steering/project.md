# Project Steering: create-app-cli (v2)

## What Changed from v1
This is an upgrade. The existing CLI scaffolding skeleton is already built.
The following things are NEW and must be added without breaking existing code:

1. Post-processing pipeline for frontend projects (folder injection + Tailwind + Todo UI)
2. Database prompt added to the CLI flow
3. Full MVC structure in all backend/fullstack templates (not empty)
4. Complete Todo CRUD API in express templates (Mongoose + Zod + JWT)
5. MERN client connected to Express API via fetch (not local state)
6. Next.js Full Stack using App Router with real API routes + Mongoose

## DO NOT break or rewrite
- src/prompts/ structure (4 separate files already exist)
- src/core/resolver.ts (already maps all 10 combinations)
- src/utils/copy.ts, install.ts, git.ts, logger.ts (already working)
- src/index.ts and src/cli.ts (already wired)
- The existing template folder structure

## Tech Stack
- Runtime: Node.js 18+
- Language: TypeScript (strict mode, no any)
- CLI: Commander.js + Inquirer.js v9+
- Logging: chalk v5 + ora v8
- Build: tsup (CJS output)
- Test: vitest + fast-check

## Architecture Rules
- Named exports only (except React components which use default export)
- All modules under 150 lines where possible
- No placeholder code, no TODO comments — write real implementations
- src/index.ts MUST start with #!/usr/bin/env node as first line
- Template placeholder: PROJECT_NAME (replaced at generation time)
- templatePath resolves via: path.join(__dirname, '..', 'templates', templateName)

## New Modules to Add (v2)
- src/core/postprocessor.ts — runs after delegation for frontend projects
- src/core/todoTemplates.ts — holds exact Todo component code as template literals

## Template Rules
- Every template file must contain REAL runnable code
- No empty files in templates (use .gitkeep only for intentionally empty dirs)
- All templates must have: package.json (PROJECT_NAME), README.md, .env.example, .gitignore
- express-ts and express-js: full MVC with src/controllers/, services/, models/, routes/, middlewares/, validations/, config/
- mern-ts and mern-js: server/ mirrors express template, client/ is React+Vite+Tailwind with API-connected useTodos
- next-fullstack-ts and next-fullstack-js: App Router ONLY, no pages/ directory

## Coding Standards
- TypeScript: strict true, no implicit any, no unused variables
- Async: always use try/catch, never let unhandled rejections escape
- Spinners: always call succeed/fail/warn before function returns
- Errors: fatal errors → process.exit(1), non-fatal → log warning and continue