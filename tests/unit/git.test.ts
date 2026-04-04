import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initGit } from '../../src/utils/git.js';
import { spawn } from 'child_process';
import type { ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

// Mock child_process
vi.mock('child_process', () => ({
  spawn: vi.fn(),
}));

describe('git module', () => {
  let mockSpawn: ReturnType<typeof vi.fn>;
  let mockChildProcesses: EventEmitter[];

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
    // Get reference to mocked spawn
    mockSpawn = spawn as unknown as ReturnType<typeof vi.fn>;
    
    // Create array to hold multiple mock child processes
    mockChildProcesses = [];
  });

  describe('initGit', () => {
    it('should run git init, git add, and git commit in sequence', async () => {
      const targetPath = '/path/to/project';

      // Mock spawn to return child processes that immediately succeed
      mockSpawn.mockImplementation(() => {
        const mockChild = new EventEmitter() as EventEmitter & { stderr: EventEmitter };
        mockChild.stderr = new EventEmitter();
        
        // Immediately emit exit 0 on next tick
        process.nextTick(() => {
          mockChild.emit('exit', 0);
        });
        
        return mockChild as ChildProcess;
      });

      // Execute
      await initGit(targetPath);

      // Verify all three git commands were called in sequence
      expect(mockSpawn).toHaveBeenCalledTimes(3);
      
      // Verify git init
      expect(mockSpawn).toHaveBeenNthCalledWith(1, 'git', ['init'], {
        cwd: targetPath,
        stdio: 'pipe',
        shell: true,
      });

      // Verify git add .
      expect(mockSpawn).toHaveBeenNthCalledWith(2, 'git', ['add', '.'], {
        cwd: targetPath,
        stdio: 'pipe',
        shell: true,
      });

      // Verify git commit
      expect(mockSpawn).toHaveBeenNthCalledWith(3, 'git', ['commit', '-m', 'Initial commit from create-app'], {
        cwd: targetPath,
        stdio: 'pipe',
        shell: true,
      });
    });

    it('should reject with error when git init fails', async () => {
      const targetPath = '/path/to/project';

      // Mock spawn to return a child process that fails
      mockSpawn.mockImplementation(() => {
        const mockChild = new EventEmitter() as EventEmitter & { stderr: EventEmitter };
        mockChild.stderr = new EventEmitter();
        
        // Immediately emit exit 128 on next tick
        process.nextTick(() => {
          mockChild.emit('exit', 128);
        });
        
        return mockChild as ChildProcess;
      });

      // Verify promise rejects with correct error message
      await expect(initGit(targetPath)).rejects.toThrow('git init failed with exit code 128');
      
      // Verify only git init was called (sequence stopped after failure)
      expect(mockSpawn).toHaveBeenCalledTimes(1);
    });

    it('should reject with error when git commit fails', async () => {
      const targetPath = '/path/to/project';

      let callCount = 0;
      
      // Mock spawn to succeed for first two calls, fail on third
      mockSpawn.mockImplementation(() => {
        const mockChild = new EventEmitter() as EventEmitter & { stderr: EventEmitter };
        mockChild.stderr = new EventEmitter();
        
        callCount++;
        const currentCall = callCount;
        
        // Immediately emit exit on next tick
        process.nextTick(() => {
          if (currentCall < 3) {
            mockChild.emit('exit', 0); // Success for git init and git add
          } else {
            mockChild.emit('exit', 1); // Failure for git commit
          }
        });
        
        return mockChild as ChildProcess;
      });

      // Verify promise rejects with correct error message
      await expect(initGit(targetPath)).rejects.toThrow('git commit failed with exit code 1');
      
      // Verify all three commands were attempted
      expect(mockSpawn).toHaveBeenCalledTimes(3);
    });
  });
});
