## Project Identity
- Name: create-app
- Type: Interactive project scaffolding CLI tool
- Stage: Production MVP
- Description: Scaffold fully structured production-ready projects for frontend, backend, and fullstack development instantly with an interactive CLI.

## Tech Stack
- Language: TypeScript 5.x
- CLI Command Parsing: Commander.js (v12.x)
- Interactive Prompts: Inquirer.js (v9.x)
- Visual Feedback & Styling: Chalk (v5.x), Ora (v8.x)
- Build System: tsup (compiles to CJS/ESM formats)
- Testing Framework: Vitest (v2.x) + fast-check (v3.x) for property-based tests
- Package manager: npm / pnpm

## Code Style Rules
- Prefer functional components and modular functional design.
- Always use named exports for CLI routes, prompts, and utility helpers.
- Use explicit async/await patterns for prompt flow and file operations.
- Do NOT use plain `console.log` / `console.error`; always use the project's logging utility helpers in `src/utils/logger.ts`:
  - `logInfo(msg)` for standard informational logs
  - `logWarning(msg)` for warning states
  - `logError(msg)` for error alerts
  - `stepHeader(stepNum, title)` for rendering interactive step titles
- Directory Collision Guard: Always verify if target directories exist before running scaffold generators; prompt the user to "Overwrite" or "Cancel" using inquirer.
- Package Manager Verification: Always check target package manager availability using the helper in `src/utils/install.ts` before proceeding.

## Folder Architecture & Boundaries
The project is strictly separated into distinct layers. Maintain this separation at all times:
- `src/index.ts`: Executable CLI entrypoint (Commander config).
- `src/cli.ts`: Main interactive CLI orchestrator that chains prompts and invokes the generator.
- `src/prompts/`: Contains isolated Inquirer prompts per concern (e.g., `main.prompt.ts`, `frontend.prompt.ts`, `backend.prompt.ts`, `fullstack.prompt.ts`).
- `src/core/resolver.ts`: Takes raw prompt answers and resolves them into structured, concrete template-generation configurations.
- `src/core/generator.ts`: Executes actual template copying, text replacement, folder injection, git initialization, and package installation.
- `src/utils/`: Standard utility helpers (e.g., child-process installation helpers, logging utilities).
- `templates/`: Contains raw starter templates for Express backend, React, Next.js, and Fullstack apps.

## Do NOT Use / Do NOT Change
- Do not use: generic standard logging libraries or raw console functions.
- Do not modify: existing template files under `templates/` unless explicitly requested to update a starter template framework version.
- Do not add arbitrary external dependencies without validating compatibility with ES Modules / CommonJS.

## Agent Behavior
- Always build a written implementation plan and wait for explicit user approval before writing any code.
- Flag assumptions upfront; never silently guess user configuration choices.
- Ask before running destructive terminal commands (e.g., deleting or modifying files outside of the test suite).
- Use `vitest` along with mocked filesystem environments (via `memfs`) to test all utility or generator logic safely.
- When compilation or tests fail, analyze the compilation output and explain the exact root cause before proposing a fix.

## Model Assignment
- Use Gemini Flash for: writing prompt boilerplate, standard documentation, log additions, and routine test cases.
- Use Gemini Pro for: generator refactoring, file tree resolution logic, full integration testing, and core architectural reviews.
