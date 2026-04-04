import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { vol } from 'memfs';
import { replacePlaceholders } from '../../src/utils/copy.js';

// Mock fs/promises module with memfs
vi.mock('fs', async () => {
  const { vol } = await import('memfs');
  return {
    promises: vol.promises,
    default: vol
  };
});

describe('Placeholder Replacement - Property-Based Tests', () => {
  beforeEach(() => {
    vol.reset();
  });

  afterEach(() => {
    vol.reset();
  });

  // Feature: create-app-cli, Property 4: All PROJECT_NAME replaced after replacePlaceholders
  // **Validates: Requirements 5.1, 5.2**
  it('Property 4: Placeholder replacement completeness - zero PROJECT_NAME occurrences remain after replacePlaceholders', async () => {
    // Generator for valid project names (lowercase, numbers, hyphens)
    const validProjectNameArbitrary = fc.array(
      fc.stringOf(
        fc.oneof(
          fc.integer({ min: 97, max: 122 }).map(code => String.fromCharCode(code)), // a-z
          fc.integer({ min: 48, max: 57 }).map(code => String.fromCharCode(code))   // 0-9
        ),
        { minLength: 1, maxLength: 10 }
      ),
      { minLength: 1, maxLength: 5 }
    ).map(segments => segments.join('-'));

    // Generator for number of PROJECT_NAME occurrences (1-10)
    const occurrenceCountArbitrary = fc.integer({ min: 1, max: 10 });

    // Generator for file content with multiple PROJECT_NAME placeholders
    const contentWithPlaceholdersArbitrary = fc.tuple(
      occurrenceCountArbitrary,
      fc.array(fc.string(), { minLength: 0, maxLength: 5 })
    ).map(([count, fillers]) => {
      // Create content with exactly 'count' PROJECT_NAME occurrences
      const parts: string[] = [];
      for (let i = 0; i < count; i++) {
        parts.push(fillers[i % fillers.length] || '');
        parts.push('PROJECT_NAME');
      }
      parts.push(fillers[count % fillers.length] || '');
      return parts.join(' ');
    });

    await fc.assert(
      fc.asyncProperty(
        validProjectNameArbitrary,
        contentWithPlaceholdersArbitrary,
        contentWithPlaceholdersArbitrary,
        async (projectName, packageJsonContent, readmeContent) => {
          // Setup: Create in-memory package.json and README.md with PROJECT_NAME placeholders
          const targetPath = '/test-project';
          vol.mkdirSync(targetPath, { recursive: true });
          vol.writeFileSync(`${targetPath}/package.json`, packageJsonContent, { encoding: 'utf8' });
          vol.writeFileSync(`${targetPath}/README.md`, readmeContent, { encoding: 'utf8' });

          // Action: Call replacePlaceholders
          await replacePlaceholders(targetPath, projectName);

          // Assert: Zero occurrences of 'PROJECT_NAME' remain in both files
          const updatedPackageJson = vol.readFileSync(`${targetPath}/package.json`, 'utf8') as string;
          const updatedReadme = vol.readFileSync(`${targetPath}/README.md`, 'utf8') as string;

          const packageJsonMatches = (updatedPackageJson.match(/PROJECT_NAME/g) || []).length;
          const readmeMatches = (updatedReadme.match(/PROJECT_NAME/g) || []).length;

          expect(packageJsonMatches).toBe(0);
          expect(readmeMatches).toBe(0);

          // Cleanup for next iteration
          vol.reset();
        }
      ),
      { numRuns: 20 }
    );
  });
});
