---
description: Performs a professional code review on the current git diff or a specified file.
---

When the user types `/review [file or "diff"]`, execute the following instructions:

## 1. Context Assessment
- If the argument is `diff` (or left blank), read the current git diff using system commands (`git diff`).
- If a specific file path is given, view that file entirely using standard viewing tools.

## 2. Review Analysis
Evaluate the target code block against the core guidelines in `GEMINI.md` and `AGENTS.md`. Focus specifically on:
- **Correctness**: Do functional patterns, prompts, and resolvers execute as expected without runtime errors?
- **Architectural boundaries**: Are prompts isolated in `/src/prompts/` and generator concerns in `/src/core/generator.ts`?
- **Edge cases**: Are there filesystem collisions, empty names, or spacing problems handled safely?
- **Security**: Are commands spawned safely? Is filesystem traversal blocked?
- **Style**: Are local logging utility helpers used instead of raw `console.log`?
- **Test coverage**: Are comprehensive Vitest or property-based tests present and correctly sandboxed using mock filesystems?

## 3. Findings Output
Group findings into clear categories:
- **🔴 CRITICAL**: Architectural breaks, logic failures, security vulnerabilities, command injection risks, or missing error controls.
- **🟡 WARNING**: Missing tests, manual hardcoding, suboptimal type definitions, or improper logging functions.
- **🟢 SUGGESTION**: Code simplification opportunities, styling improvements, or potential optimizations.

## 4. Remediation
- For all **CRITICAL** findings, provide clean, exact code diffs demonstrating the proposed solution.
- Recommend running specific vitest commands to check and verify if modifications behave as expected.
