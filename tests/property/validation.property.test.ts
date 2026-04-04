import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateProjectName } from '../../src/prompts/validators.js';

describe('Project Name Validation - Property-Based Tests', () => {
  // Feature: create-app-cli, Property 1: Valid project names pass validation
  // **Validates: Requirements 2.1, 2.2, 2.3**
  it('Property 1: Valid names accepted - all names matching /^[a-z0-9]+(-[a-z0-9]+)*$/ pass validation', () => {
    // Generator for valid project names
    // Pattern: lowercase letters/numbers, optionally followed by hyphen + lowercase/numbers segments
    const validNameArbitrary = fc.array(
      fc.stringOf(
        fc.oneof(
          fc.integer({ min: 97, max: 122 }).map(code => String.fromCharCode(code)), // a-z
          fc.integer({ min: 48, max: 57 }).map(code => String.fromCharCode(code))   // 0-9
        ),
        { minLength: 1, maxLength: 10 }
      ),
      { minLength: 1, maxLength: 5 }
    ).map(segments => segments.join('-'));

    fc.assert(
      fc.property(validNameArbitrary, (name) => {
        const result = validateProjectName(name);
        expect(result).toBe(true);
      }),
      { numRuns: 20 }
    );
  });

  // Feature: create-app-cli, Property 2: Invalid project names are rejected
  // **Validates: Requirements 2.1, 2.2, 2.3**
  it('Property 2: Invalid names rejected - names with spaces, uppercase, or special chars are rejected', () => {
    // Generator for invalid project names
    const invalidNameArbitrary = fc.oneof(
      // Names with spaces
      fc.tuple(
        fc.stringOf(fc.char(), { minLength: 1, maxLength: 5 }),
        fc.stringOf(fc.char(), { minLength: 1, maxLength: 5 })
      ).map(([part1, part2]) => `${part1} ${part2}`),
      
      // Names with uppercase letters
      fc.stringOf(
        fc.oneof(
          fc.integer({ min: 65, max: 90 }).map(code => String.fromCharCode(code)), // A-Z
          fc.integer({ min: 97, max: 122 }).map(code => String.fromCharCode(code)) // a-z
        ),
        { minLength: 1, maxLength: 10 }
      ).filter(s => /[A-Z]/.test(s)), // Ensure at least one uppercase
      
      // Names with special characters (not hyphen)
      fc.stringOf(
        fc.oneof(
          fc.constantFrom('_', '.', '@', '!', '#', '$', '%', '^', '&', '*', '(', ')', '+', '=', '[', ']', '{', '}', '|', '\\', '/', '?', '<', '>', ',', ';', ':', '\'', '"', '~', '`'),
          fc.integer({ min: 97, max: 122 }).map(code => String.fromCharCode(code))
        ),
        { minLength: 1, maxLength: 10 }
      ).filter(s => /[^a-z0-9-]/.test(s) && !/\s/.test(s)) // Has special char but not space
    );

    fc.assert(
      fc.property(invalidNameArbitrary, (name) => {
        const result = validateProjectName(name);
        expect(result).not.toBe(true);
        expect(typeof result).toBe('string'); // Should return error message
      }),
      { numRuns: 20 }
    );
  });
});
