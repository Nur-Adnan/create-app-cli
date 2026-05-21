import { spawn } from 'child_process';

/**
 * Initializes a git repository in the target directory and creates an initial commit.
 * Runs three commands sequentially:
 * 1. git init
 * 2. git add .
 * 3. git commit -m "Initial commit from create-app"
 * 
 * Uses stdio: 'pipe' to suppress noisy git output.
 * 
 * @param targetPath - Absolute path to the project directory
 * @returns Promise that resolves when all git commands succeed (exit code 0)
 * @throws Error with descriptive message if any git command fails
 */
export async function initGit(targetPath: string): Promise<void> {
  const commands = [
    { cmd: 'git', args: ['init'], description: 'git init' },
    { cmd: 'git', args: ['add', '.'], description: 'git add .' },
    { cmd: 'git', args: ['commit', '-m', 'Initial commit from create-app'], description: 'git commit' },
  ];

  for (const { cmd, args, description } of commands) {
    await runGitCommand(cmd, args, targetPath, description);
  }
}

/**
 * Runs a single git command and returns a promise.
 * 
 * @param cmd - The command to run (e.g., 'git')
 * @param args - Command arguments
 * @param cwd - Working directory
 * @param description - Human-readable description for error messages
 */
function runGitCommand(
  cmd: string,
  args: string[],
  cwd: string,
  description: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd,
      stdio: 'pipe',
    });

    let stderr = '';

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${description} failed with exit code ${code}${stderr ? ': ' + stderr.trim() : ''}`));
      }
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to execute ${description}: ${err.message}`));
    });
  });
}
