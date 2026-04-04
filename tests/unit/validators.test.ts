import { describe, it, expect } from 'vitest';
import { validateProjectName } from '../../src/prompts/validators.js';

describe('validateProjectName', () => {
  describe('valid names', () => {
    it('should accept lowercase letters only', () => {
      expect(validateProjectName('myproject')).toBe(true);
    });

    it('should accept lowercase letters with numbers', () => {
      expect(validateProjectName('myproject123')).toBe(true);
    });

    it('should accept lowercase letters with hyphens', () => {
      expect(validateProjectName('my-project')).toBe(true);
    });

    it('should accept complex valid names', () => {
      expect(validateProjectName('my-app-v2')).toBe(true);
      expect(validateProjectName('project-123-test')).toBe(true);
    });
  });

  describe('invalid names - empty', () => {
    it('should reject empty string', () => {
      expect(validateProjectName('')).toBe('Project name cannot be empty');
    });

    it('should reject whitespace only', () => {
      expect(validateProjectName('   ')).toBe('Project name cannot be empty');
    });
  });

  describe('invalid names - spaces', () => {
    it('should reject names with spaces', () => {
      expect(validateProjectName('my project')).toBe('Project name cannot contain spaces');
    });

    it('should reject names with multiple spaces', () => {
      expect(validateProjectName('my  project')).toBe('Project name cannot contain spaces');
    });
  });

  describe('invalid names - uppercase', () => {
    it('should reject names with uppercase letters', () => {
      expect(validateProjectName('MyProject')).toBe('Project name must be lowercase');
    });

    it('should reject names with single uppercase letter', () => {
      expect(validateProjectName('myProject')).toBe('Project name must be lowercase');
    });

    it('should reject all uppercase', () => {
      expect(validateProjectName('MYPROJECT')).toBe('Project name must be lowercase');
    });
  });

  describe('invalid names - special characters', () => {
    it('should reject names with underscores', () => {
      expect(validateProjectName('my_project')).toBe('Only lowercase letters, numbers, and hyphens are allowed');
    });

    it('should reject names with dots', () => {
      expect(validateProjectName('my.project')).toBe('Only lowercase letters, numbers, and hyphens are allowed');
    });

    it('should reject names with special characters', () => {
      expect(validateProjectName('my@project')).toBe('Only lowercase letters, numbers, and hyphens are allowed');
      expect(validateProjectName('my!project')).toBe('Only lowercase letters, numbers, and hyphens are allowed');
      expect(validateProjectName('my#project')).toBe('Only lowercase letters, numbers, and hyphens are allowed');
    });

    it('should reject names starting with hyphen', () => {
      expect(validateProjectName('-myproject')).toBe('Only lowercase letters, numbers, and hyphens are allowed');
    });

    it('should reject names ending with hyphen', () => {
      expect(validateProjectName('myproject-')).toBe('Only lowercase letters, numbers, and hyphens are allowed');
    });

    it('should reject names with consecutive hyphens', () => {
      expect(validateProjectName('my--project')).toBe('Only lowercase letters, numbers, and hyphens are allowed');
    });
  });
});
