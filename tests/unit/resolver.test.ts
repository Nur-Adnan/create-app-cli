import { describe, it, expect } from 'vitest';
import { resolveConfig, PromptAnswers } from '../../src/core/resolver.js';
import path from 'path';
import { vi } from 'vitest';

vi.mock('../../src/utils/install.js', () => ({
  resolveAvailablePackageManager: vi.fn((pm) => pm),
}));

describe('resolveConfig', () => {
  describe('Frontend - React Vite', () => {
    it('should resolve React Vite with TypeScript to delegate with react-ts template', () => {
      const answers: PromptAnswers = {
        projectType: 'frontend',
        framework: 'react-vite',
        language: 'typescript',
        projectName: 'my-app',
        packageManager: 'npm',
      };

      const config = resolveConfig(answers);

      expect(config.type).toBe('delegate');
      expect(config.projectName).toBe('my-app');
      expect(config.packageManager).toBe('npm');
      expect(config.framework).toBe('react-vite');
      expect(config.command).toBe('npm');
      expect(config.args).toEqual([
        'create',
        'vite@latest',
        'my-app',
        '--yes',
        '--',
        '--template',
        'react-ts',
      ]);
    });

    it('should resolve React Vite with JavaScript to delegate with react template', () => {
      const answers: PromptAnswers = {
        projectType: 'frontend',
        framework: 'react-vite',
        language: 'javascript',
        projectName: 'my-app',
        packageManager: 'npm',
      };

      const config = resolveConfig(answers);

      expect(config.type).toBe('delegate');
      expect(config.projectName).toBe('my-app');
      expect(config.packageManager).toBe('npm');
      expect(config.framework).toBe('react-vite');
      expect(config.command).toBe('npm');
      expect(config.args).toEqual([
        'create',
        'vite@latest',
        'my-app',
        '--yes',
        '--',
        '--template',
        'react',
      ]);
    });
  });

  describe('Frontend - Next.js', () => {
    it('should resolve Next.js with TypeScript and npm', () => {
      const answers: PromptAnswers = {
        projectType: 'frontend',
        framework: 'nextjs',
        language: 'typescript',
        projectName: 'my-next-app',
        packageManager: 'npm',
      };

      const config = resolveConfig(answers);

      expect(config.type).toBe('delegate');
      expect(config.projectName).toBe('my-next-app');
      expect(config.packageManager).toBe('npm');
      expect(config.framework).toBe('nextjs');
      expect(config.command).toBe('npx');
      expect(config.args).toContain('create-next-app@latest');
      expect(config.args).toContain('my-next-app');
      expect(config.args).toContain('--typescript');
      expect(config.args).toContain('--eslint');
      expect(config.args).toContain('--no-git');
      expect(config.args).toContain('--use-npm');
    });

    it('should resolve Next.js with JavaScript and npm', () => {
      const answers: PromptAnswers = {
        projectType: 'frontend',
        framework: 'nextjs',
        language: 'javascript',
        projectName: 'my-next-app',
        packageManager: 'npm',
      };

      const config = resolveConfig(answers);

      expect(config.type).toBe('delegate');
      expect(config.command).toBe('npx');
      expect(config.args).toContain('--no-typescript');
      expect(config.args).toContain('--eslint');
      expect(config.args).toContain('--no-git');
      expect(config.args).toContain('--use-npm');
    });

    it('should resolve Next.js with TypeScript and pnpm with correct flags', () => {
      const answers: PromptAnswers = {
        projectType: 'frontend',
        framework: 'nextjs',
        language: 'typescript',
        projectName: 'pnpm-app',
        packageManager: 'pnpm',
      };

      const config = resolveConfig(answers);

      expect(config.type).toBe('delegate');
      expect(config.packageManager).toBe('pnpm');
      expect(config.command).toBe('npx');
      expect(config.args).toContain('--use-pnpm');
      expect(config.args).toContain('--no-git');
      expect(config.args).not.toContain('--use-npm');
      expect(config.args).not.toContain('--use-yarn');
    });

    it('should resolve Next.js with yarn package manager', () => {
      const answers: PromptAnswers = {
        projectType: 'frontend',
        framework: 'nextjs',
        language: 'typescript',
        projectName: 'yarn-app',
        packageManager: 'yarn',
      };

      const config = resolveConfig(answers);

      expect(config.type).toBe('delegate');
      expect(config.packageManager).toBe('yarn');
      expect(config.args).toContain('--use-yarn');
      expect(config.args).not.toContain('--use-npm');
      expect(config.args).not.toContain('--use-pnpm');
    });
  });

  describe('Backend - Express', () => {
    it('should resolve Express with TypeScript to template', () => {
      const answers: PromptAnswers = {
        projectType: 'backend',
        framework: 'express',
        language: 'typescript',
        projectName: 'express-api',
        packageManager: 'npm',
      };

      const config = resolveConfig(answers);

      expect(config.type).toBe('template');
      expect(config.projectName).toBe('express-api');
      expect(config.packageManager).toBe('npm');
      expect(config.framework).toBe('express');
      expect(config.templateName).toBe('express-ts');
      expect(config.templatePath).toBeDefined();
      expect(config.templatePath).toContain('templates');
      expect(config.templatePath).toContain('express-ts');
      expect(config.command).toBeUndefined();
      expect(config.args).toBeUndefined();
    });

    it('should resolve Express with JavaScript to template', () => {
      const answers: PromptAnswers = {
        projectType: 'backend',
        framework: 'express',
        language: 'javascript',
        projectName: 'express-api',
        packageManager: 'npm',
      };

      const config = resolveConfig(answers);

      expect(config.type).toBe('template');
      expect(config.templateName).toBe('express-js');
      expect(config.templatePath).toContain('express-js');
    });
  });

  describe('Fullstack - MERN', () => {
    it('should resolve MERN with TypeScript to template', () => {
      const answers: PromptAnswers = {
        projectType: 'fullstack',
        framework: 'mern',
        language: 'typescript',
        projectName: 'mern-app',
        packageManager: 'npm',
      };

      const config = resolveConfig(answers);

      expect(config.type).toBe('template');
      expect(config.projectName).toBe('mern-app');
      expect(config.packageManager).toBe('npm');
      expect(config.framework).toBe('mern');
      expect(config.templateName).toBe('mern-ts');
      expect(config.templatePath).toContain('mern-ts');
      expect(config.command).toBeUndefined();
      expect(config.args).toBeUndefined();
    });

    it('should resolve MERN with JavaScript to template', () => {
      const answers: PromptAnswers = {
        projectType: 'fullstack',
        framework: 'mern',
        language: 'javascript',
        projectName: 'mern-app',
        packageManager: 'npm',
      };

      const config = resolveConfig(answers);

      expect(config.type).toBe('template');
      expect(config.templateName).toBe('mern-js');
      expect(config.templatePath).toContain('mern-js');
    });
  });

  describe('Fullstack - Next.js Full Stack', () => {
    it('should resolve Next.js Full Stack with TypeScript to template', () => {
      const answers: PromptAnswers = {
        projectType: 'fullstack',
        framework: 'next-fullstack',
        language: 'typescript',
        projectName: 'next-fullstack-app',
        packageManager: 'npm',
      };

      const config = resolveConfig(answers);

      expect(config.type).toBe('template');
      expect(config.projectName).toBe('next-fullstack-app');
      expect(config.packageManager).toBe('npm');
      expect(config.framework).toBe('next-fullstack');
      expect(config.templateName).toBe('next-fullstack-ts');
      expect(config.templatePath).toContain('next-fullstack-ts');
    });

    it('should resolve Next.js Full Stack with JavaScript to template', () => {
      const answers: PromptAnswers = {
        projectType: 'fullstack',
        framework: 'next-fullstack',
        language: 'javascript',
        projectName: 'next-fullstack-app',
        packageManager: 'npm',
      };

      const config = resolveConfig(answers);

      expect(config.type).toBe('template');
      expect(config.templateName).toBe('next-fullstack-js');
      expect(config.templatePath).toContain('next-fullstack-js');
    });
  });

  describe('Template path resolution', () => {
    it('should resolve template paths correctly', () => {
      const answers: PromptAnswers = {
        projectType: 'backend',
        framework: 'express',
        language: 'typescript',
        projectName: 'test-app',
        packageManager: 'npm',
      };

      const config = resolveConfig(answers);

      // Template path should be constructed using path.join and contain the template name
      expect(config.templatePath).toBeDefined();
      expect(config.templatePath).toContain('templates');
      expect(config.templatePath).toContain('express-ts');
    });
  });

  describe('Error handling', () => {
    it('should throw error for unsupported configuration', () => {
      const answers: PromptAnswers = {
        projectType: 'frontend',
        framework: 'unsupported-framework' as any,
        language: 'typescript',
        projectName: 'test-app',
        packageManager: 'npm',
      };

      expect(() => resolveConfig(answers)).toThrow('Unsupported configuration');
    });
  });
});
