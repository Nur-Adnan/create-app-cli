import { spawn, execFileSync } from 'child_process';

/**
 * Checks whether a package manager binary is available on PATH.
 */
export function isPackageManagerAvailable(pm: string): boolean {
  try {
    execFileSync(pm, ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
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
    const child = spawn(packageManager, ['install'], {
      cwd: targetPath,
      stdio: 'inherit',
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
