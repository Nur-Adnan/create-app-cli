import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateProject } from '../../src/core/generator.js';
import { spawn } from 'child_process';
import type { ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import type { ResolvedConfig } from '../../src/utils/logger.js';

// Mock all dependencies
vi.mock('child_process', () => ({
  spawn: vi.fn(),
}));

vi.mock('../../src/utils/copy.js', () => ({
  copyTemplate: vi.fn(),
  replacePlaceholders: vi.fn(),
  createEnvFile: vi.fn(),
}));

vi.mock('../../src/utils/install.js', () => ({
  installDependencies: vi.fn(),
}));

vi.mock('../../src/utils/git.js', () => ({
  initGit: vi.fn(),
}));

vi.mock('../../src/utils/logger.js', async () => {
  const actual = await vi.importActual<typeof import('../../src/utils/logger.js')>('../../src/utils/logger.js');
  return {
    ...actual,
    stepHeader: vi.fn(),
    createSpinner: vi.fn(() => ({
      start: vi.fn(),
      succeed: vi.fn(),
      fail: vi.fn(),
      warn: vi.fn(),
    })),
    displayNextSteps: vi.fn(),
    logWarning: vi.fn(),
  };
});

vi.mock('fs', () => ({
  promises: {
    access: vi.fn(),
  },
}));

// Import mocked modules
import { copyTemplate, replacePlaceholders, createEnvFile } from '../../src/utils/copy.js';
import { installDependencies } from '../../src/utils/install.js';
import { initGit } from '../../src/utils/git.js';
import {
  stepHeader,
  createSpinner,
  displayNextSteps,
  logWarning,
} from '../../src/utils/logger.js';
import { promises as fs } from 'fs';

describe('generator module', () => {
  let mockSpawn: ReturnType<typeof vi.fn>;
  let mockCopyTemplate: ReturnType<typeof vi.fn>;
  let mockReplacePlaceholders: ReturnType<typeof vi.fn>;
  let mockCreateEnvFile: ReturnType<typeof vi.fn>;
  let mockInstallDependencies: ReturnType<typeof vi.fn>;
  let mockInitGit: ReturnType<typeof vi.fn>;
  let mockStepHeader: ReturnType<typeof vi.fn>;
  let mockCreateSpinner: ReturnType<typeof vi.fn>;
  let mockDisplayNextSteps: ReturnType<typeof vi.fn>;
  let mockLogWarning: ReturnType<typeof vi.fn>;
  let mockAccess: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Get references to mocked functions
    mockSpawn = spawn as unknown as ReturnType<typeof vi.fn>;
    mockCopyTemplate = copyTemplate as unknown as ReturnType<typeof vi.fn>;
    mockReplacePlaceholders = replacePlaceholders as unknown as ReturnType<typeof vi.fn>;
    mockCreateEnvFile = createEnvFile as unknown as ReturnType<typeof vi.fn>;
    mockInstallDependencies = installDependencies as unknown as ReturnType<typeof vi.fn>;
    mockInitGit = initGit as unknown as ReturnType<typeof vi.fn>;
    mockStepHeader = stepHeader as unknown as ReturnType<typeof vi.fn>;
    mockCreateSpinner = createSpinner as unknown as ReturnType<typeof vi.fn>;
    mockDisplayNextSteps = displayNextSteps as unknown as ReturnType<typeof vi.fn>;
    mockLogWarning = logWarning as unknown as ReturnType<typeof vi.fn>;
    mockAccess = fs.access as unknown as ReturnType<typeof vi.fn>;

    // Setup default mock implementations
    mockCopyTemplate.mockResolvedValue(undefined);
    mockReplacePlaceholders.mockResolvedValue(undefined);
    mockCreateEnvFile.mockResolvedValue(undefined);
    mockInstallDependencies.mockResolvedValue(undefined);
    mockInitGit.mockResolvedValue(undefined);

    // Mock createSpinner to return a mock spinner
    mockCreateSpinner.mockReturnValue({
      start: vi.fn(),
      succeed: vi.fn(),
      fail: vi.fn(),
      warn: vi.fn(),
    });
  });

  describe('generateProject - delegate path', () => {
    it('should spawn official CLI with correct command and args', async () => {
      const config: ResolvedConfig = {
        type: 'delegate',
        projectName: 'my-vite-app',
        packageManager: 'npm',
        framework: 'react-vite-ts',
        command: 'npm',
        args: ['create', 'vite@latest', 'my-vite-app', '--', '--template', 'react-ts'],
      };

      // Mock spawn to return a child process that succeeds
      mockSpawn.mockImplementation(() => {
        const mockChild = new EventEmitter();
        process.nextTick(() => {
          mockChild.emit('exit', 0);
        });
        return mockChild as ChildProcess;
      });

      await generateProject(config);

      // Verify spawn was called with correct command and args
      expect(mockSpawn).toHaveBeenCalledWith(
        'npm',
        ['create', 'vite@latest', 'my-vite-app', '--', '--template', 'react-ts'],
        {
          stdio: 'inherit',
          shell: true,
        }
      );
    });

    it('should call installDependencies after spawn succeeds', async () => {
      const config: ResolvedConfig = {
        type: 'delegate',
        projectName: 'my-next-app',
        packageManager: 'yarn',
        framework: 'next-ts',
        command: 'npx',
        args: ['create-next-app@latest', 'my-next-app', '--typescript'],
      };

      // Mock spawn to succeed
      mockSpawn.mockImplementation(() => {
        const mockChild = new EventEmitter();
        process.nextTick(() => {
          mockChild.emit('exit', 0);
        });
        return mockChild as ChildProcess;
      });

      await generateProject(config);

      // Verify installDependencies was called
      expect(mockInstallDependencies).toHaveBeenCalledWith(
        expect.stringContaining('my-next-app'),
        'yarn'
      );
    });

    it('should call initGit after installDependencies succeeds', async () => {
      const config: ResolvedConfig = {
        type: 'delegate',
        projectName: 'test-app',
        packageManager: 'pnpm',
        framework: 'react-vite-js',
        command: 'pnpm',
        args: ['create', 'vite', 'test-app'],
      };

      // Mock spawn to succeed
      mockSpawn.mockImplementation(() => {
        const mockChild = new EventEmitter();
        process.nextTick(() => {
          mockChild.emit('exit', 0);
        });
        return mockChild as ChildProcess;
      });

      await generateProject(config);

      // Verify initGit was called
      expect(mockInitGit).toHaveBeenCalledWith(
        expect.stringContaining('test-app')
      );
    });
  });

  describe('generateProject - template path', () => {
    it('should call validateTemplate, copy, replacePlaceholders, and createEnvFile', async () => {
      const config: ResolvedConfig = {
        type: 'template',
        projectName: 'my-express-app',
        packageManager: 'npm',
        framework: 'express-ts',
        templateName: 'express-ts',
        templatePath: '/templates/express-ts',
      };

      // Mock access to succeed for all validation checks
      mockAccess.mockResolvedValue(undefined);

      await generateProject(config);

      // Verify validateTemplate was called (via access)
      expect(mockAccess).toHaveBeenCalledWith('/templates/express-ts');
      expect(mockAccess).toHaveBeenCalledWith('/templates/express-ts/package.json');
      expect(mockAccess).toHaveBeenCalledWith('/templates/express-ts/README.md');

      // Verify copy operations were called
      expect(mockCopyTemplate).toHaveBeenCalledWith(
        '/templates/express-ts',
        expect.stringContaining('my-express-app')
      );
      expect(mockReplacePlaceholders).toHaveBeenCalledWith(
        expect.stringContaining('my-express-app'),
        'my-express-app'
      );
      expect(mockCreateEnvFile).toHaveBeenCalledWith(
        expect.stringContaining('my-express-app')
      );
    });

    it('should call installDependencies and initGit after template operations', async () => {
      const config: ResolvedConfig = {
        type: 'template',
        projectName: 'mern-app',
        packageManager: 'yarn',
        framework: 'mern-ts',
        templateName: 'mern-ts',
        templatePath: '/templates/mern-ts',
      };

      // Mock access to succeed for all validation checks
      mockAccess.mockResolvedValue(undefined);

      await generateProject(config);

      // Verify install and git were called
      expect(mockInstallDependencies).toHaveBeenCalledWith(
        expect.stringContaining('mern-app'),
        'yarn'
      );
      expect(mockInitGit).toHaveBeenCalledWith(
        expect.stringContaining('mern-app')
      );
    });
  });

  describe('generateProject - install failure', () => {
    it('should call logWarning when installDependencies fails', async () => {
      const config: ResolvedConfig = {
        type: 'template',
        projectName: 'test-app',
        packageManager: 'npm',
        framework: 'express-js',
        templateName: 'express-js',
        templatePath: '/templates/express-js',
      };

      // Mock access to succeed for validation
      mockAccess.mockResolvedValue(undefined);

      // Mock installDependencies to fail
      mockInstallDependencies.mockRejectedValue(new Error('npm install failed'));

      await generateProject(config);

      // Verify logWarning was called
      expect(mockLogWarning).toHaveBeenCalledWith(
        expect.stringContaining('Failed to install dependencies')
      );
    });

    it('should still call initGit after install failure', async () => {
      const config: ResolvedConfig = {
        type: 'delegate',
        projectName: 'app-with-install-fail',
        packageManager: 'pnpm',
        framework: 'next-js',
        command: 'npx',
        args: ['create-next-app', 'app-with-install-fail'],
      };

      // Mock spawn to succeed
      mockSpawn.mockImplementation(() => {
        const mockChild = new EventEmitter();
        process.nextTick(() => {
          mockChild.emit('exit', 0);
        });
        return mockChild as ChildProcess;
      });

      // Mock installDependencies to fail
      mockInstallDependencies.mockRejectedValue(new Error('Install failed'));

      await generateProject(config);

      // Verify initGit was still called
      expect(mockInitGit).toHaveBeenCalledWith(
        expect.stringContaining('app-with-install-fail')
      );
    });
  });

  describe('generateProject - git failure', () => {
    it('should call logWarning when initGit fails', async () => {
      const config: ResolvedConfig = {
        type: 'template',
        projectName: 'git-fail-app',
        packageManager: 'npm',
        framework: 'express-ts',
        templateName: 'express-ts',
        templatePath: '/templates/express-ts',
      };

      // Mock access to succeed for validation
      mockAccess.mockResolvedValue(undefined);

      // Mock initGit to fail
      mockInitGit.mockRejectedValue(new Error('git init failed'));

      await generateProject(config);

      // Verify logWarning was called
      expect(mockLogWarning).toHaveBeenCalledWith(
        expect.stringContaining('Git initialization failed')
      );
    });

    it('should still call displayNextSteps after git failure', async () => {
      const config: ResolvedConfig = {
        type: 'delegate',
        projectName: 'app-with-git-fail',
        packageManager: 'yarn',
        framework: 'react-vite-ts',
        command: 'yarn',
        args: ['create', 'vite', 'app-with-git-fail'],
      };

      // Mock spawn to succeed
      mockSpawn.mockImplementation(() => {
        const mockChild = new EventEmitter();
        process.nextTick(() => {
          mockChild.emit('exit', 0);
        });
        return mockChild as ChildProcess;
      });

      // Mock initGit to fail
      mockInitGit.mockRejectedValue(new Error('Git failed'));

      await generateProject(config);

      // Verify displayNextSteps was still called
      expect(mockDisplayNextSteps).toHaveBeenCalledWith(config);
    });
  });

  describe('generateProject - template validation errors', () => {
    it('should throw error when template directory not found', async () => {
      const config: ResolvedConfig = {
        type: 'template',
        projectName: 'missing-template-app',
        packageManager: 'npm',
        framework: 'express-ts',
        templateName: 'express-ts',
        templatePath: '/templates/nonexistent',
      };

      // Mock access to fail for template directory
      mockAccess.mockRejectedValue(new Error('ENOENT'));

      await expect(generateProject(config)).rejects.toThrow(
        'Template directory not found: /templates/nonexistent'
      );
    });

    it('should throw error when package.json missing in template', async () => {
      const config: ResolvedConfig = {
        type: 'template',
        projectName: 'no-package-json-app',
        packageManager: 'npm',
        framework: 'express-js',
        templateName: 'express-js',
        templatePath: '/templates/express-js',
      };

      // Mock access to succeed for directory and README, fail for package.json
      mockAccess.mockImplementation((path: string) => {
        if (path.includes('package.json')) {
          return Promise.reject(new Error('ENOENT'));
        }
        return Promise.resolve();
      });

      await expect(generateProject(config)).rejects.toThrow(
        'Missing required file: package.json in /templates/express-js'
      );
    });
  });
});
