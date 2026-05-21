---
name: new-template
description: Add a new framework, language option, or starter template to the scaffolding CLI tool. Use when the user asks to add new templates or frameworks (e.g. Svelte, Astro, Vue).
---

## Overview
Adding a new scaffolding template to the `create-app` CLI requires configuring a folder under `templates/`, modifying the interactive prompts layer, registering the configuration in the resolver, and writing unit tests to prevent regressions.

---

## Detailed Implementation Steps

### 1. Create the Template Directory
- Create a new directory under `templates/[template-name]/` (e.g., `templates/svelte-ts/`).
- **Required Files**: The CLI generator validates template structure before copying. Your template MUST contain at minimum:
  - `package.json` (specifying starter scripts and dependencies)
  - `README.md` (detailing the starter project layout)
- Add standard starter files, configuration files (e.g. `tsconfig.json`, `vite.config.ts`), and the `src/` directory with a fully functioning starter app.

### 2. Update Interactive Prompts
Modify prompt definitions under `/src/prompts/` so the new template/framework is displayed to the user:
- If it's a frontend template, edit `src/prompts/frontend.prompt.ts`.
- If backend, edit `src/prompts/backend.prompt.ts`.
- If fullstack, edit `src/prompts/fullstack.prompt.ts`.
- Update choices in the inquirer prompt arrays, linking options using readable names and standard values.

### 3. Register Template in the Resolver
Update `src/core/resolver.ts` inside `resolveConfig`:
- Add a new block checking for your specific `projectType`, `framework`, and/or `language`.
- Return a `ResolvedConfig` mapping to your `templateName` and setting `templatePath: path.join(__dirname, '..', '..', 'templates', templateName)`.

### 4. Write Verification Tests
Verify the new template resolves and generates correctly:
- Add unit test cases in `tests/resolver.test.ts` to assert that correct inputs resolve to your new template config.
- Add test coverage in `tests/generator.test.ts` (using standard `memfs` or mock structures) to assert that template copying works.
