// delegation.property.test.ts — Property-based test: project name always appears in delegation args
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { resolveConfig, type PromptAnswers } from '../../src/core/resolver.js';

describe('Delegation Args - Property-Based Tests', () => {
  // Feature: create-app-cli, Property 3: Project name appears in delegation args
  // **Validates: Requirements 3.5**
  it('Property 3: Project name always in delegation args - all frontend configs include projectName in args', () => {
    // Generator for valid project names (lowercase, numbers, hyphens)
    const validProjectNameArbitrary = fc.array(
      fc.stringOf(
        fc.oneof(
          fc.integer({ min: 97, max: 122 }).map(code => String.fromCharCode(code)), // a-z
          fc.integer({ min: 48, max: 57 }).map(code => String.fromCharCode(code))   // 0-9
        ),
        { minLength: 1, maxLength: 10 }
      ),
      { minLength: 1, maxLength: 5 }
    ).map(segments => segments.join('-'));

    // Generator for package managers
    const packageManagerArbitrary = fc.constantFrom('npm', 'yarn', 'pnpm') as fc.Arbitrary<'npm' | 'yarn' | 'pnpm'>;

    // Generator for frontend frameworks
    const frontendFrameworkArbitrary = fc.constantFrom('react-vite', 'nextjs') as fc.Arbitrary<'react-vite' | 'nextjs'>;

    // Generator for languages
    const languageArbitrary = fc.constantFrom('typescript', 'javascript') as fc.Arbitrary<'typescript' | 'javascript'>;

    // Combine all generators to create PromptAnswers for frontend projects
    const frontendAnswersArbitrary = fc.record({
      projectType: fc.constant('frontend' as const),
      framework: frontendFrameworkArbitrary,
      language: languageArbitrary,
      database: fc.constant('mongodb' as const),
      projectName: validProjectNameArbitrary,
      packageManager: packageManagerArbitrary,
      targetPath: validProjectNameArbitrary.map(name => `/test/${name}`),
    });

    fc.assert(
      fc.property(frontendAnswersArbitrary, (answers: PromptAnswers) => {
        const config = resolveConfig(answers);
        
        // Assert that this is a delegation config
        expect(config.type).toBe('delegate');
        
        if (config.type === 'delegate') {
          // Assert that args array exists and contains the project name
          expect(config.args).toBeDefined();
          expect(Array.isArray(config.args)).toBe(true);
          
          const projectNameInArgs = config.args.some(arg => arg === answers.projectName);
          expect(projectNameInArgs).toBe(true);
        }
      }),
      { numRuns: 20 }
    );
  });
});
