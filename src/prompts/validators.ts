/**
 * Validates project name according to npm package naming rules
 * @param name - The project name to validate
 * @returns true if valid, error message string if invalid
 */
export function validateProjectName(name: string): true | string {
  // Check for empty string
  if (name.trim() === '') {
    return 'Project name cannot be empty';
  }

  // Check for spaces
  if (name.includes(' ')) {
    return 'Project name cannot contain spaces';
  }

  // Check for uppercase letters
  if (/[A-Z]/.test(name)) {
    return 'Project name must be lowercase';
  }

  // Check against the full regex pattern
  // Only lowercase letters, numbers, and hyphens are allowed
  // Must not start or end with hyphen, no consecutive hyphens
  const validPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  if (!validPattern.test(name)) {
    return 'Only lowercase letters, numbers, and hyphens are allowed';
  }

  return true;
}
