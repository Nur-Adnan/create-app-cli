import { describe, it, expect, vi, beforeEach } from 'vitest';
import { installDependencies } from '../../src/utils/install.js';
import { spawn } from 'child_process';
import type { ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

// Mock child_process
vi.mock('child_process', () => ({
  spawn: vi.fn(),
}));

describe('install module', () => {
  let mockSpawn: ReturnType<typeof vi.fn>;
  let mockChildProcess: EventEmitter;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
    // Get reference to mocked spawn
    mockSpawn = spawn as unknown as ReturnType<typeof vi.fn>;
    
    // Create a mock child process that extends EventEmitter
    mockChildProcess = new EventEmitter();
    mockSpawn.mockReturnValue(mockChildProcess as ChildProcess);
  });

  describe('installDependencies', () => {
    it('should spawn npm install with correct cwd for npm', async () => {
      const targetPath = '/path/to/project';
      const packageManager = 'npm';

      // Start the installation
      const installPromise = installDependencies(targetPath, packageManager);

      // Simulate successful exit
      mockChildProcess.emit('exit', 0);

      await installPromise;

      // Verify spawn was called with correct arguments
      expect(mockSpawn).toHaveBeenCalledWith('npm', ['install'], {
        cwd: targetPath,
        stdio: 'inherit',
        shell: true,
      });
    });

    it('should spawn yarn install with correct cwd for yarn', async () => {
      const targetPath = '/path/to/project';
      const packageManager = 'yarn';

      // Start the installation
      const installPromise = installDependencies(targetPath, packageManager);

      // Simulate successful exit
      mockChildProcess.emit('exit', 0);

      await installPromise;

      // Verify spawn was called with correct arguments
      expect(mockSpawn).toHaveBeenCalledWith('yarn', ['install'], {
        cwd: targetPath,
        stdio: 'inherit',
        shell: true,
      });
    });

    it('should spawn pnpm install with correct cwd for pnpm', async () => {
      const targetPath = '/path/to/project';
      const packageManager = 'pnpm';

      // Start the installation
      const installPromise = installDependencies(targetPath, packageManager);

      // Simulate successful exit
      mockChildProcess.emit('exit', 0);

      await installPromise;

      // Verify spawn was called with correct arguments
      expect(mockSpawn).toHaveBeenCalledWith('pnpm', ['install'], {
        cwd: targetPath,
        stdio: 'inherit',
        shell: true,
      });
    });

    it('should reject promise when exit code is non-zero', async () => {
      const targetPath = '/path/to/project';
      const packageManager = 'npm';

      // Start the installation
      const installPromise = installDependencies(targetPath, packageManager);

      // Simulate failed exit
      mockChildProcess.emit('exit', 1);

      // Verify promise rejects with correct error message
      await expect(installPromise).rejects.toThrow('npm install failed with exit code 1');
    });

    it('should reject promise when spawn emits error event', async () => {
      const targetPath = '/path/to/project';
      const packageManager = 'yarn';

      // Start the installation
      const installPromise = installDependencies(targetPath, packageManager);

      // Simulate spawn error
      const spawnError = new Error('Command not found');
      mockChildProcess.emit('error', spawnError);

      // Verify promise rejects with correct error message
      await expect(installPromise).rejects.toThrow('Failed to spawn yarn: Command not found');
    });
  });
});
