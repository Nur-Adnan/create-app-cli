---
description: Full workflow to implement a new feature from idea to tested code.
---

When the user types `/new-feature <description>`, execute the following workflow phases in order:

## 1. Spec Phase
- Review the request against the current architecture described in `GEMINI.md`.
- Draft a comprehensive design specification named `SPEC.md` at the project root containing:
  - What the new feature accomplishes and its underlying user benefit.
  - Detailed files to create and existing files to modify (highlighting exact lines or functions).
  - Potential edge cases, network/file I/O failures, and how they will be handled.
  - An exact automated and manual test plan.
- **STOP** and wait for the user to explicitly review and approve the `SPEC.md`. Do not write code or spawn git branches until approved.

## 2. Implementation Phase
Once approved:
- Create and check out a dedicated git feature branch: `feature/[short-name]`.
- Follow all code architecture and boundary principles detailed in `GEMINI.md` and `AGENTS.md`.
- Auto-load relevant custom skills (e.g., `new-template`, `new-cli-prompt`, `add-tests`) if the feature involves templates, inquirer prompts, or new validators.
- Document logic modifications with short, crisp comments for non-obvious flows.

## 3. Verification Phase
- Run the full test suite (`npm test`) to confirm that all existing logic and property assertions remain fully functional.
- Write new unit tests (`tests/unit/`) and property-based tests (`tests/property/`) matching the patterns in `add-tests`.
- Run the build tool (`npm run build`) to ensure the Dual ESM/CJS build outputs compile successfully.

## 4. Handoff Phase
- Provide a concise summary of the changes made and list the modified and created files.
- Mention any technical assumptions or design trade-offs chosen.
- Provide instructions on how the user can test the command-line flow manually.
