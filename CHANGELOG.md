# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-01

### Added

- Interactive CLI scaffolding for frontend, backend, and fullstack projects
- Frontend: React (Vite) and Next.js with Tailwind CSS injection
- Backend: Express.js templates (TypeScript and JavaScript) with full MVC structure
- Fullstack: MERN and Next.js fullstack templates
- Automatic dependency installation with npm/yarn/pnpm support
- Git repository initialization with initial commit
- Directory collision detection with overwrite/cancel prompt
- Package manager availability check with fallback to npm
- Project name validation (lowercase, numbers, hyphens only)
- `.env` file generation from `.env.example` templates
- Placeholder replacement in `package.json` and `README.md`

### Security

- `shell: false` on git and install spawns (explicit argument arrays)
- Project name validation prevents command injection via `/^[a-z0-9]+(-[a-z0-9]+)*$/`
- Template paths constructed from `__dirname` + hardcoded names (no user input in paths)
