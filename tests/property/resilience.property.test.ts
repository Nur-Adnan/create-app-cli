// resilience.property.test.ts — Property tests: generator resilience against install/git failures
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { generateProject } from '../../src/core/generator.js';
import type { TemplateConfig } from '../../src/core/resolver.js';

// Mock all generator dependencies
vi.mock('child_process', () => ({
  spawn: vi.fn(),
}));

vi.mock('../../src/utils/copy.js', () => ({
  copyTemplate: vi.fn().mockResolvedValue(undefined),
  replacePlaceholders: vi.fn().mockResolvedValue(undefined),
  createEnvFile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../src/utils/install.js', () => ({
  installDependencies: vi.fn(),
}));

vi.mock('../../src/utils/git.js', () => ({
  initGit: vi.fn(),
}));

vi.mock('../../src/utils/logger.js', () => ({
  stepHeader: vi.fn(),
  createSpinner: vi.fn(() => ({
    start: vi.fn(),
    succeed: vi.fn(),
    fail: vi.fn(),
    warn: vi.fn(),
  })),
  logWarning: vi.fn(),
  logSuccess: vi.fn(),
  logInfo: vi.fn(),
}));

vi.mock('fs', () => ({
  promises: {
    access: vi.fn().mockResolvedValue(undefined),
  },
}));

import { installDependencies } from '../../src/utils/install.js';
import { initGit } from '../../src/utils/git.js';
import { logSuccess } from '../../src/utils/logger.js';

describe('Resilience - Property-Based Tests', () => {
  let mockInstallDependencies: ReturnType<typeof vi.fn>;
  let mockInitGit: ReturnType<typeof vi.fn>;
  let mockLogSuccess: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockInstallDependencies = installDependencies as unknown as ReturnType<typeof vi.fn>;
    mockInitGit = initGit as unknown as ReturnType<typeof vi.fn>;
    mockLogSuccess = logSuccess as unknown as ReturnType<typeof vi.fn>;
  });

  // Generator for template configs with varying package managers
  const templateConfigArbitrary = fc.constantFrom('npm', 'yarn', 'pnpm').map(
    (pm): TemplateConfig => ({
      type: 'template',
      projectName: 'test-project',
      packageManager: pm as 'npm' | 'yarn' | 'pnpm',
      framework: 'express',
      language: 'typescript',
      database: 'mongodb',
      targetPath: '/path/to/test-project',
      templateName: 'express-ts',
      templatePath: '/templates/express-ts',
    })
  );

  // Feature: create-app-cli, Property 7: Install failure does not abort git init
  // **Validates: Requirements 7.6**
  it('Property 7: Install failure is non-fatal - generator still calls initGit after install failure', async () => {
    await fc.assert(
      fc.asyncProperty(templateConfigArbitrary, async (config) => {
        vi.clearAllMocks();

        // Mock install to always fail
        mockInstallDependencies.mockRejectedValue(new Error('install failed'));
        // Mock git to succeed
        mockInitGit.mockResolvedValue(undefined);

        await generateProject(config);

        // initGit must still have been called despite install failure
        expect(mockInitGit).toHaveBeenCalledWith(config.targetPath);
      }),
      { numRuns: 20 }
    );
  });

  // Feature: create-app-cli, Property 8: Git failure does not abort next steps display
  // **Validates: Requirements 8.5**
  it('Property 8: Git failure is non-fatal - displayNextSteps is still called after git failure', async () => {
    await fc.assert(
      fc.asyncProperty(templateConfigArbitrary, async (config) => {
        vi.clearAllMocks();

        // Mock install to succeed, git to fail
        mockInstallDependencies.mockResolvedValue(undefined);
        mockInitGit.mockRejectedValue(new Error('git init failed'));

        await generateProject(config);

        // logSuccess (called by displayNextSteps) must still fire
        expect(mockLogSuccess).toHaveBeenCalledWith(
          expect.stringContaining(config.projectName)
        );
      }),
      { numRuns: 20 }
    );
  });
});
