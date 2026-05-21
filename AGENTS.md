## Universal Development Standards

### Architecture & Composition
- Maintain a strict functional composition model. Keep pure logic functions separate from interactive prompting and raw side effects (filesystem writes, external processes).
- Do not introduce complex inheritance trees. Use small, single-purpose helper modules combined with pure configuration schemas.
- Ensure proper encapsulation: the prompt layer must only capture and validate raw data; the resolver layer must only map it; the generator layer must only execute side effects.

### Git Conventions
- Follow standard semantic commit guidelines:
  - `feat: [description]` for new interactive prompts, templates, or options.
  - `fix: [description]` for fixing prompt validation, file copy glitches, or dependency resolver errors.
  - `test: [description]` for additions/modifications to vitest suites or property tests.
  - `refactor: [description]` for code cleanups without changing external CLI behaviors.
- Make highly atomic, clean commits. Avoid mixing refactors with feature implementations.
- Never commit directly to the `main` branch. Always work on a descriptive feature branch (e.g., `feature/add-svelte-template`).

### Security & Safety
- **Filesystem Traversal Prevention**: Never allow arbitrary path input from prompts to write outside of the target path. Sanitize and resolve all project names using standard node `path.resolve()` and validate safe boundaries.
- **Command Injection Prevention**: When executing git commands or package manager commands (`npm install`, `pnpm install`), use child-process utilities with arguments arrays rather than raw string execution in shells to prevent command injection vulnerabilities.
- **Secrets Protection**: Never bundle or hardcode credentials, private tokens, or test credentials. Use `.env.example` configurations where applicable.

### Error Handling & Resiliency
- Wrap all async operations in robust try/catch blocks.
- Provide highly descriptive, human-readable terminal messages using the local logging utility helpers.
- Never exit the process silently. Catch the error, log the context clearly with `logError`, and exit with process exit code `1`.
- Clean up partial scaffolding on failure: if the generation process crashes midway, ensure the partially written folder is either deleted or reported clearly to prevent leaving broken directories.

### Testing & Quality
- Write comprehensive unit tests for all resolvers, validators, and utility functions using `vitest`.
- Use property-based testing (via `fast-check`) to assert validator resilience against highly unexpected string inputs.
- Ensure that filesystem interactions in tests are safely sandboxed utilizing `memfs` or clean temporary testing paths.
- Maintain a target test coverage of >85% for all new code contributions.
