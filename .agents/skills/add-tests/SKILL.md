---
name: add-tests
description: Write or improve unit, integration, or property-based tests using Vitest and fast-check. Use this skill when asked to write tests, verify changes, or improve repository test coverage.
---

## Overview
This repository uses **Vitest** for testing and **fast-check** for property-based testing. To prevent writing files to the actual host disk during tests, file I/O operations must be mock-tested (e.g. using `memfs` or standard mock-fs structures).

---

## Testing Guidelines

### 1. Writing Standard Unit Tests
- Location: `/tests/unit/[module].test.ts`
- Import assertions: `import { describe, it, expect, vi } from 'vitest';`
- Group logical blocks using nested `describe` blocks (`describe('valid inputs', () => { ... })`).
- Write atomic, isolated assertions. Keep test cases readable and descriptive.

### 2. Testing Filesystem I/O safely
When testing generators, template copiers, or file actions, do NOT perform actual disk writes. Use one of the following mock practices:
- **`memfs` virtualization**: Use the virtual file system `memfs` to intercept `node:fs` calls.
- **Vitest Mocking**: Mock the `promises` API of `fs`:
  ```typescript
  import { vi } from 'vitest';
  
  vi.mock('fs/promises', () => ({
    promises: {
      access: vi.fn(),
      mkdir: vi.fn(),
      writeFile: vi.fn(),
      readFile: vi.fn(),
    }
  }));
  ```
- Clean up mocks after every run using `afterEach` or `beforeEach` with `vi.clearAllMocks()`.

### 3. Writing Property-Based Tests
- Location: `/tests/property/[feature].property.test.ts`
- Use `fast-check` to test the resilience of algorithms, validators, or parsers against infinite permutations of random inputs.
- Define a proper arbitrary generator using `fc` constructs:
  ```typescript
  import * as fc from 'fast-check';
  
  const alphanumericArbitrary = fc.stringOf(
    fc.oneof(
      fc.integer({ min: 97, max: 122 }).map(code => String.fromCharCode(code)), // a-z
      fc.integer({ min: 48, max: 57 }).map(code => String.fromCharCode(code))   // 0-9
    )
  );
  ```
- Run the property assertions using `fc.assert(fc.property(...))`. Limit runs to a reasonable number to keep local tests fast (e.g., `numRuns: 20` or `50`).

### 4. Running the Tests
- Run full test suite: `npm test` or `npx vitest run`.
- Run a single test file: `npx vitest run tests/unit/validators.test.ts`.
