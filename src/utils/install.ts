import { spawn, execSync } from 'child_process';

/**
 * Checks whether a package manager binary is available on PATH.
 */
export function isPackageManagerAvailable(pm: string): boolean {
  try {
    execSync(`${pm} --version`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns the first available package manager from the preference list,
 * falling back to 'npm' which ships with Node.js.
 */
export function resolveAvailablePackageManager(
  preferred: 'npm' | 'yarn' | 'pnpm'
): 'npm' | 'yarn' | 'pnpm' {
  if (isPackageManagerAvailable(preferred)) return preferred;
  // npm is always available with Node.js
  return 'npm';
}

/**
 * Installs dependencies in the target directory using the specified package manager.
 * 
 * @param targetPath - Absolute path to the project directory
 * @param packageManager - The package manager to use (npm, yarn, or pnpm)
 * @returns Promise that resolves on successful installation (exit code 0)
 * @throws Error if installation fails (non-zero exit code)
 */
export async function installDependencies(
  targetPath: string,
  packageManager: 'npm' | 'yarn' | 'pnpm'
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Map package manager to install command
    const commands: Record<'npm' | 'yarn' | 'pnpm', string> = {
      npm: 'npm install',
      yarn: 'yarn install',
      pnpm: 'pnpm install',
    };

    const command = commands[packageManager];
    const [cmd, ...args] = command.split(' ');

    const child = spawn(cmd, args, {
      cwd: targetPath,
      stdio: 'inherit',
      shell: true,
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${packageManager} install failed with exit code ${code}`));
      }
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to spawn ${packageManager}: ${err.message}`));
    });
  });
}
