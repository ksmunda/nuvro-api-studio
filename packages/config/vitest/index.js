import { defineConfig } from 'vitest/config';

/**
 * Shared Vitest base configuration.
 * Individual packages extend this via createVitestConfig().
 * @param {import('vitest/config').UserConfig} [overrides]
 * @returns {import('vitest/config').UserConfig}
 */
export function createVitestConfig(overrides = {}) {
  return defineConfig({
    test: {
      globals: true,
      environment: 'node',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: ['node_modules', 'dist', '**/*.d.ts', '**/*.config.*', '**/index.ts'],
      },
      ...overrides?.test,
    },
    ...overrides,
  });
}
