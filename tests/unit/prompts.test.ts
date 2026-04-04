import { describe, it, expect, vi, beforeEach } from 'vitest';
import inquirer from 'inquirer';
import { runMainPrompt } from '../../src/prompts/main.prompt.js';
import { runFrontendPrompts } from '../../src/prompts/frontend.prompt.js';
import { runBackendPrompts } from '../../src/prompts/backend.prompt.js';
import { runFullstackPrompts } from '../../src/prompts/fullstack.prompt.js';

// Mock inquirer
vi.mock('inquirer');

// Mock logger to avoid console output during tests
vi.mock('../../src/utils/logger.js', () => ({
  stepHeader: vi.fn(),
  logInfo: vi.fn(),
}));

describe('Prompt Modules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('main.prompt.ts', () => {
    it('should return frontend project type', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({ projectType: 'frontend' });

      const result = await runMainPrompt();

      expect(result).toEqual({ projectType: 'frontend' });
      expect(inquirer.prompt).toHaveBeenCalledTimes(1);
    });

    it('should return backend project type', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({ projectType: 'backend' });

      const result = await runMainPrompt();

      expect(result).toEqual({ projectType: 'backend' });
      expect(inquirer.prompt).toHaveBeenCalledTimes(1);
    });

    it('should return fullstack project type', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({ projectType: 'fullstack' });

      const result = await runMainPrompt();

      expect(result).toEqual({ projectType: 'fullstack' });
      expect(inquirer.prompt).toHaveBeenCalledTimes(1);
    });
  });

  describe('frontend.prompt.ts', () => {
    it('should return react-vite with typescript', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        framework: 'react-vite',
        language: 'typescript',
      });

      const result = await runFrontendPrompts();

      expect(result).toEqual({
        framework: 'react-vite',
        language: 'typescript',
      });
      expect(inquirer.prompt).toHaveBeenCalledTimes(1);
    });

    it('should return react-vite with javascript', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        framework: 'react-vite',
        language: 'javascript',
      });

      const result = await runFrontendPrompts();

      expect(result).toEqual({
        framework: 'react-vite',
        language: 'javascript',
      });
      expect(inquirer.prompt).toHaveBeenCalledTimes(1);
    });

    it('should return nextjs with typescript', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        framework: 'nextjs',
        language: 'typescript',
      });

      const result = await runFrontendPrompts();

      expect(result).toEqual({
        framework: 'nextjs',
        language: 'typescript',
      });
      expect(inquirer.prompt).toHaveBeenCalledTimes(1);
    });

    it('should return nextjs with javascript', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        framework: 'nextjs',
        language: 'javascript',
      });

      const result = await runFrontendPrompts();

      expect(result).toEqual({
        framework: 'nextjs',
        language: 'javascript',
      });
      expect(inquirer.prompt).toHaveBeenCalledTimes(1);
    });
  });

  describe('backend.prompt.ts', () => {
    it('should always return express framework with typescript', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        language: 'typescript',
      });

      const result = await runBackendPrompts();

      expect(result).toEqual({
        framework: 'express',
        language: 'typescript',
      });
      expect(inquirer.prompt).toHaveBeenCalledTimes(1);
    });

    it('should always return express framework with javascript', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        language: 'javascript',
      });

      const result = await runBackendPrompts();

      expect(result).toEqual({
        framework: 'express',
        language: 'javascript',
      });
      expect(inquirer.prompt).toHaveBeenCalledTimes(1);
    });
  });

  describe('fullstack.prompt.ts', () => {
    it('should return mern with typescript', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        framework: 'mern',
        language: 'typescript',
      });

      const result = await runFullstackPrompts();

      expect(result).toEqual({
        framework: 'mern',
        language: 'typescript',
      });
      expect(inquirer.prompt).toHaveBeenCalledTimes(1);
    });

    it('should return mern with javascript', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        framework: 'mern',
        language: 'javascript',
      });

      const result = await runFullstackPrompts();

      expect(result).toEqual({
        framework: 'mern',
        language: 'javascript',
      });
      expect(inquirer.prompt).toHaveBeenCalledTimes(1);
    });

    it('should return next-fullstack with typescript', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        framework: 'next-fullstack',
        language: 'typescript',
      });

      const result = await runFullstackPrompts();

      expect(result).toEqual({
        framework: 'next-fullstack',
        language: 'typescript',
      });
      expect(inquirer.prompt).toHaveBeenCalledTimes(1);
    });

    it('should return next-fullstack with javascript', async () => {
      vi.mocked(inquirer.prompt).mockResolvedValue({
        framework: 'next-fullstack',
        language: 'javascript',
      });

      const result = await runFullstackPrompts();

      expect(result).toEqual({
        framework: 'next-fullstack',
        language: 'javascript',
      });
      expect(inquirer.prompt).toHaveBeenCalledTimes(1);
    });
  });
});
