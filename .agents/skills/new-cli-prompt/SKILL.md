---
name: new-cli-prompt
description: Add a new step, choice, validation, or interactive configuration prompt to the CLI process. Use when asked to introduce new CLI options (e.g. adding lint choices, CSS choices, or custom Git toggles).
---

## Overview
The `create-app` interactive CLI uses standard **Inquirer.js** prompts layered in sequence. Adding a new prompt involves modifying the prompt module, updating CLI flow step numbers dynamically, modifying types, and passing values to the resolver.

---

## Detailed Implementation Steps

### 1. Update/Create Prompts Logic
- Locate prompt modules inside `src/prompts/` (e.g. `main.prompt.ts`, `frontend.prompt.ts`, etc.).
- If adding a new global concern, create a new prompt file `src/prompts/[prompt-name].prompt.ts`.
- In the prompt function:
  - Call `stepHeader(stepNumber, 'Prompt Title')` to render the modern colored step title.
  - Execute `inquirer.prompt` returning typed results.
  - Export the interface describing the answers.

### 2. Update Types & Config Interfaces
- Open `src/core/resolver.ts`.
- Modify `PromptAnswers` to incorporate your new prompt key and its allowed union type values.
- Modify `ResolvedConfig` if this value needs to be passed down to the project builder/generator.

### 3. Integrate into CLI Flow Orchestrator
- Open `src/cli.ts`.
- Import your prompt function and types.
- Invoke the prompt at the desired stage in `createApp()`.
- **Dynamic Step Indexing**: If your prompt is optional/conditional, compute the step numbers dynamically (similar to `const nameStep = projectType !== 'frontend' ? 4 : 3;`) to ensure beautiful, gapless numbering in the CLI output.
- Merge the prompt result into the final `answers` object.

### 4. Adjust Resolver and Generator
- If the new choice impacts file structures or template generations:
  - Modify `src/core/resolver.ts` to process the answer and update `ResolvedConfig`.
  - Modify `src/core/generator.ts` or utility functions in `src/utils/` to handle the resolved choice (e.g., conditionally copying files or editing generated configurations).

### 5. Write Prompts Unit Tests
- Create or update test cases under `tests/` using Vitest to mock user input and ensure validations (like validators in `src/prompts/validators.ts`) operate successfully.
