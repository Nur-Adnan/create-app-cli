# Contributing to create-app

Thank you for your interest in contributing! This guide will help you get started.

## Local Setup

```bash
# Clone the repository
git clone https://github.com/Nur-Adnan/npm-package.git
cd npm-package

# Install dependencies
npm install

# Run in development mode (watches for changes)
npm run dev
```

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start tsup in watch mode |
| `npm run build` | Production build |
| `npm run test` | Run tests in watch mode |
| `npx vitest run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run typecheck` | TypeScript type checking |

## Project Structure

```
src/
├── index.ts            CLI entrypoint (Commander setup)
├── cli.ts              Orchestrator (prompts → resolve → generate)
├── core/
│   ├── resolver.ts     Maps PromptAnswers → ResolvedConfig
│   └── generator.ts    Executes scaffolding pipeline
├── prompts/
│   ├── main.prompt.ts      Project type
│   ├── frontend.prompt.ts  Framework + language
│   ├── backend.prompt.ts   Language (framework hardcoded)
│   ├── fullstack.prompt.ts Stack + language
│   └── validators.ts       Project name validation
└── utils/
    ├── copy.ts         Template copying and placeholder replacement
    ├── git.ts          Git initialization
    ├── install.ts      Package manager detection and dependency install
    └── logger.ts       Terminal output helpers
```

## Pull Request Expectations

1. **Branch from `main`**: Create a descriptive feature branch (e.g., `feature/add-svelte-template`)
2. **Follow commit conventions**: Use semantic commits (`feat:`, `fix:`, `test:`, `refactor:`)
3. **Add tests**: Every change should include or update relevant tests
4. **Maintain coverage**: Coverage must stay above 85%
5. **Type safety**: No `any` — use `unknown` and narrow. `tsc --noEmit` must pass
6. **No dead code**: Don't export functions that aren't imported anywhere
7. **Document**: Exported functions need JSDoc with `@param`, `@returns`, `@throws`

## Testing

Tests live in `tests/` with two categories:
- `tests/unit/` — Unit tests for individual modules
- `tests/property/` — Property-based tests using fast-check
- `tests/smoke/` — Post-build smoke tests (require `npm run build` first)

```bash
# Run all unit and property tests
npx vitest run

# Run smoke tests (build first)
npm run build
npx vitest run tests/smoke/
```

## Adding a New Template

See the `new-template` skill in `.agents/skills/new-template/SKILL.md` for the full workflow.

## Questions?

Open a [GitHub issue](https://github.com/Nur-Adnan/npm-package/issues) for questions or discussion.
