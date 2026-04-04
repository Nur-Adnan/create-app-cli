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

describe('File Encoding Preservation - Property-Based Tests', () => {
  beforeEach(() => {
    vol.reset();
  });

  afterEach(() => {
    vol.reset();
  });

  // Feature: create-app-cli, Property 5: File encoding preserved during placeholder replacement
  // **Validates: Requirements 5.3**
  it('Property 5: File encoding preserved after replacement - UTF-8 characters and line endings remain unchanged', async () => {
    // Generator for valid project names (lowercase, numbers, hyphens)
    const validProjectNameArbitrary = fc.array(
      fc.string({ minLength: 1, maxLength: 10, unit: fc.oneof(
        fc.integer({ min: 97, max: 122 }).map(code => String.fromCharCode(code)), // a-z
        fc.integer({ min: 48, max: 57 }).map(code => String.fromCharCode(code))   // 0-9
      )}),
      { minLength: 1, maxLength: 5 }
    ).map(segments => segments.join('-'));

    // Generator for line ending type
    const lineEndingArbitrary = fc.constantFrom('\n', '\r\n');

    // Generator for UTF-8 content with PROJECT_NAME placeholders
    const utf8ContentArbitrary = fc.tuple(
      lineEndingArbitrary,
      fc.array(
        fc.oneof(
          fc.constant('PROJECT_NAME'),
          fc.string({ minLength: 1, maxLength: 20 }),
          // UTF-8 special characters
          fc.constantFrom('é', 'ñ', 'ü', 'ö', 'ä', '中', '文', '日', '本', '語', '🚀', '✨', '💻')
        ),
        { minLength: 3, maxLength: 10 }
      )
    ).map(([lineEnding, parts]) => {
      // Join parts with the chosen line ending
      return parts.join(lineEnding);
    });

    await fc.assert(
      fc.asyncProperty(
        validProjectNameArbitrary,
        utf8ContentArbitrary,
        utf8ContentArbitrary,
        lineEndingArbitrary,
        async (projectName, packageJsonContent, readmeContent, lineEnding) => {
          // Setup: Create in-memory package.json and README.md with UTF-8 content
          const targetPath = '/test-project';
          vol.mkdirSync(targetPath, { recursive: true });
          vol.writeFileSync(`${targetPath}/package.json`, packageJsonContent, { encoding: 'utf8' });
          vol.writeFileSync(`${targetPath}/README.md`, readmeContent, { encoding: 'utf8' });

          // Count line endings before replacement
          const packageJsonLineEndingsBefore = (packageJsonContent.match(/\r\n/g) || []).length;
          const packageJsonLFBefore = (packageJsonContent.match(/(?<!\r)\n/g) || []).length;
          const readmeLineEndingsBefore = (readmeContent.match(/\r\n/g) || []).length;
          const readmeLFBefore = (readmeContent.match(/(?<!\r)\n/g) || []).length;

          // Action: Call replacePlaceholders
          await replacePlaceholders(targetPath, projectName);

          // Assert: Read back and verify encoding preservation
          const updatedPackageJson = vol.readFileSync(`${targetPath}/package.json`, { encoding: 'utf8' }) as string;
          const updatedReadme = vol.readFileSync(`${targetPath}/README.md`, { encoding: 'utf8' }) as string;

          // Verify line endings are preserved
          const packageJsonLineEndingsAfter = (updatedPackageJson.match(/\r\n/g) || []).length;
          const packageJsonLFAfter = (updatedPackageJson.match(/(?<!\r)\n/g) || []).length;
          const readmeLineEndingsAfter = (updatedReadme.match(/\r\n/g) || []).length;
          const readmeLFAfter = (updatedReadme.match(/(?<!\r)\n/g) || []).length;

          expect(packageJsonLineEndingsAfter).toBe(packageJsonLineEndingsBefore);
          expect(packageJsonLFAfter).toBe(packageJsonLFBefore);
          expect(readmeLineEndingsAfter).toBe(readmeLineEndingsBefore);
          expect(readmeLFAfter).toBe(readmeLFBefore);

          // Verify UTF-8 characters are preserved (by checking that non-ASCII chars remain)
          const hasUTF8Before = /[^\x00-\x7F]/.test(packageJsonContent) || /[^\x00-\x7F]/.test(readmeContent);
          const hasUTF8After = /[^\x00-\x7F]/.test(updatedPackageJson) || /[^\x00-\x7F]/.test(updatedReadme);
          
          if (hasUTF8Before) {
            expect(hasUTF8After).toBe(true);
          }

          // Cleanup for next iteration
          vol.reset();
        }
      ),
      { numRuns: 20 }
    );
  });
});
