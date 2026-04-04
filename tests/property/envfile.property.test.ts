import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { vol } from 'memfs';
import { createEnvFile } from '../../src/utils/copy.js';

// Mock fs module with memfs
vi.mock('fs', async () => {
  const { vol } = await import('memfs');
  return {
    promises: vol.promises,
    existsSync: (path: string) => vol.existsSync(path),
    default: vol
  };
});

describe('Environment File Round-Trip - Property-Based Tests', () => {
  beforeEach(() => {
    vol.reset();
  });

  afterEach(() => {
    vol.reset();
  });

  // Feature: create-app-cli, Property 6: .env content identical to .env.example after copy
  // **Validates: Requirements 6.3**
  it('Property 6: .env content equals .env.example - content preserved exactly during copy', async () => {
    // Generator for random .env.example content
    // Simulate realistic env file content with key=value pairs
    const envContentArbitrary = fc.array(
      fc.tuple(
        // Environment variable name (uppercase letters, numbers, underscores)
        fc.stringOf(
          fc.oneof(
            fc.integer({ min: 65, max: 90 }).map(code => String.fromCharCode(code)), // A-Z
            fc.integer({ min: 48, max: 57 }).map(code => String.fromCharCode(code)), // 0-9
            fc.constant('_')
          ),
          { minLength: 1, maxLength: 20 }
        ),
        // Environment variable value (any printable characters)
        fc.string({ minLength: 0, maxLength: 50 })
      ),
      { minLength: 0, maxLength: 10 }
    ).map(pairs => {
      // Format as KEY=VALUE lines
      return pairs.map(([key, value]) => `${key}=${value}`).join('\n');
    });

    await fc.assert(
      fc.asyncProperty(
        envContentArbitrary,
        async (envExampleContent) => {
          // Setup: Create in-memory .env.example file
          const targetPath = '/test-project';
          vol.mkdirSync(targetPath, { recursive: true });
          vol.writeFileSync(`${targetPath}/.env.example`, envExampleContent, { encoding: 'utf8' });

          // Action: Call createEnvFile
          await createEnvFile(targetPath);

          // Assert: .env content === .env.example content exactly
          const envContent = vol.readFileSync(`${targetPath}/.env`, { encoding: 'utf8' }) as string;
          const envExampleContentRead = vol.readFileSync(`${targetPath}/.env.example`, { encoding: 'utf8' }) as string;

          expect(envContent).toBe(envExampleContentRead);
          expect(envContent).toBe(envExampleContent);

          // Cleanup for next iteration
          vol.reset();
        }
      ),
      { numRuns: 20 }
    );
  });
});
