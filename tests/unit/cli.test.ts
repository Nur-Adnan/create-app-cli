import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApp } from '../../src/cli.js';
import * as mainPrompt from '../../src/prompts/main.prompt.js';
import * as frontendPrompt from '../../src/prompts/frontend.prompt.js';
import * as backendPrompt from '../../src/prompts/backend.prompt.js';
import * as fullstackPrompt from '../../src/prompts/fullstack.prompt.js';
import * as resolver from '../../src/core/resolver.js';
import * as generator from '../../src/core/generator.js';
import inquirer from 'inquirer';
import { promises as fs } from 'fs';

// Mock all dependencies
vi.mock('inquirer');
vi.mock('fs', async () => {
  const actual = await vi.importActual<typeof import('fs')>('fs');
  return {
    ...actual,
    promises: {
      ...actual.promises,
      access: vi.fn(),
      rm: vi.fn(),
    },
  };
});

vi.mock('../../src/prompts/main.prompt.js');
vi.mock('../../src/prompts/frontend.prompt.js');
vi.mock('../../src/prompts/backend.prompt.js');
vi.mock('../../src/prompts/fullstack.prompt.js');
vi.mock('../../src/core/resolver.js');
vi.mock('../../src/core/generator.js');
vi.mock('../../src/utils/logger.js', () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
  stepHeader: vi.fn(),
}));

describe('cli.ts - createApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should orchestrate frontend project creation flow', async () => {
    // Mock prompt responses
    vi.mocked(mainPrompt.runMainPrompt).mockResolvedValue({ projectType: 'frontend' });
    vi.mocked(frontendPrompt.runFrontendPrompts).mockResolvedValue({
      framework: 'react-vite',
      language: 'typescript',
    });
    
    vi.mocked(inquirer.prompt)
      .mockResolvedValueOnce({ projectName: 'my-app' })
      .mockResolvedValueOnce({ packageManager: 'npm' });

    // Mock directory does not exist
    vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));

    const mockConfig = {
      type: 'delegate' as const,
      projectName: 'my-app',
      packageManager: 'npm' as const,
      framework: 'react-vite',
      command: 'npm',
      args: ['create', 'vite@latest', 'my-app', '--', '--template', 'react-ts'],
    };
    vi.mocked(resolver.resolveConfig).mockReturnValue(mockConfig);
    vi.mocked(generator.generateProject).mockResolvedValue(undefined);

    await createApp();

    expect(mainPrompt.runMainPrompt).toHaveBeenCalledTimes(1);
    expect(frontendPrompt.runFrontendPrompts).toHaveBeenCalledTimes(1);
    expect(resolver.resolveConfig).toHaveBeenCalledWith({
      projectType: 'frontend',
      framework: 'react-vite',
      language: 'typescript',
      projectName: 'my-app',
      packageManager: 'npm',
    });
    expect(generator.generateProject).toHaveBeenCalledWith(mockConfig);
  });

  it('should orchestrate backend project creation flow', async () => {
    vi.mocked(mainPrompt.runMainPrompt).mockResolvedValue({ projectType: 'backend' });
    vi.mocked(backendPrompt.runBackendPrompts).mockResolvedValue({
      framework: 'express',
      language: 'typescript',
    });
    
    vi.mocked(inquirer.prompt)
      .mockResolvedValueOnce({ projectName: 'backend-app' })
      .mockResolvedValueOnce({ packageManager: 'yarn' });

    vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));

    const mockConfig = {
      type: 'template' as const,
      projectName: 'backend-app',
      packageManager: 'yarn' as const,
      framework: 'express',
      templateName: 'express-ts',
      templatePath: '/path/to/templates/express-ts',
    };
    vi.mocked(resolver.resolveConfig).mockReturnValue(mockConfig);
    vi.mocked(generator.generateProject).mockResolvedValue(undefined);

    await createApp();

    expect(mainPrompt.runMainPrompt).toHaveBeenCalledTimes(1);
    expect(backendPrompt.runBackendPrompts).toHaveBeenCalledTimes(1);
    expect(resolver.resolveConfig).toHaveBeenCalledWith({
      projectType: 'backend',
      framework: 'express',
      language: 'typescript',
      projectName: 'backend-app',
      packageManager: 'yarn',
    });
    expect(generator.generateProject).toHaveBeenCalledWith(mockConfig);
  });

  it('should orchestrate fullstack project creation flow', async () => {
    vi.mocked(mainPrompt.runMainPrompt).mockResolvedValue({ projectType: 'fullstack' });
    vi.mocked(fullstackPrompt.runFullstackPrompts).mockResolvedValue({
      framework: 'mern',
      language: 'javascript',
    });
    
    vi.mocked(inquirer.prompt)
      .mockResolvedValueOnce({ projectName: 'fullstack-app' })
      .mockResolvedValueOnce({ packageManager: 'pnpm' });

    vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));

    const mockConfig = {
      type: 'template' as const,
      projectName: 'fullstack-app',
      packageManager: 'pnpm' as const,
      framework: 'mern',
      templateName: 'mern-js',
      templatePath: '/path/to/templates/mern-js',
    };
    vi.mocked(resolver.resolveConfig).mockReturnValue(mockConfig);
    vi.mocked(generator.generateProject).mockResolvedValue(undefined);

    await createApp();

    expect(mainPrompt.runMainPrompt).toHaveBeenCalledTimes(1);
    expect(fullstackPrompt.runFullstackPrompts).toHaveBeenCalledTimes(1);
    expect(resolver.resolveConfig).toHaveBeenCalledWith({
      projectType: 'fullstack',
      framework: 'mern',
      language: 'javascript',
      projectName: 'fullstack-app',
      packageManager: 'pnpm',
    });
    expect(generator.generateProject).toHaveBeenCalledWith(mockConfig);
  });

  it('should handle directory collision with overwrite', async () => {
    vi.mocked(mainPrompt.runMainPrompt).mockResolvedValue({ projectType: 'frontend' });
    vi.mocked(frontendPrompt.runFrontendPrompts).mockResolvedValue({
      framework: 'nextjs',
      language: 'typescript',
    });
    
    vi.mocked(inquirer.prompt)
      .mockResolvedValueOnce({ projectName: 'existing-app' })
      .mockResolvedValueOnce({ packageManager: 'npm' })
      .mockResolvedValueOnce({ action: 'overwrite' });

    // Mock directory exists
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.rm).mockResolvedValue(undefined);

    const mockConfig = {
      type: 'delegate' as const,
      projectName: 'existing-app',
      packageManager: 'npm' as const,
      framework: 'nextjs',
      command: 'npx',
      args: ['create-next-app@latest', 'existing-app', '--typescript', '--eslint', '--no-git', '--use-npm'],
    };
    vi.mocked(resolver.resolveConfig).mockReturnValue(mockConfig);
    vi.mocked(generator.generateProject).mockResolvedValue(undefined);

    await createApp();

    expect(fs.access).toHaveBeenCalled();
    expect(fs.rm).toHaveBeenCalledWith(
      expect.stringContaining('existing-app'),
      { recursive: true, force: true }
    );
    expect(generator.generateProject).toHaveBeenCalledWith(mockConfig);
  });

  it('should handle directory collision with cancel', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
      // Don't actually exit, just record the call
    }) as any);

    vi.mocked(mainPrompt.runMainPrompt).mockResolvedValue({ projectType: 'frontend' });
    vi.mocked(frontendPrompt.runFrontendPrompts).mockResolvedValue({
      framework: 'react-vite',
      language: 'typescript',
    });
    
    vi.mocked(inquirer.prompt)
      .mockResolvedValueOnce({ projectName: 'existing-app' })
      .mockResolvedValueOnce({ packageManager: 'npm' })
      .mockResolvedValueOnce({ action: 'cancel' });

    // Mock directory exists
    vi.mocked(fs.access).mockResolvedValue(undefined);

    await createApp();

    expect(fs.access).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(generator.generateProject).not.toHaveBeenCalled();
  });

  it('should handle errors and exit with code 1', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
      // Don't actually exit, just record the call
    }) as any);

    vi.mocked(mainPrompt.runMainPrompt).mockRejectedValue(new Error('Test error'));

    await createApp();

    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
