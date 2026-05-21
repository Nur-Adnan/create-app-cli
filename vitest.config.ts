// vitest.config.ts — Test runner configuration with coverage thresholds
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts'],
      thresholds: {
        branches: 85,
        functions: 85,
        lines: 85,
        statements: 85,
      },
    },
  },
});
