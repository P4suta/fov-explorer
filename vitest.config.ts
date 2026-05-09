import { defineConfig } from 'vitest/config';

// Vitest config kept separate from vite.config.ts so the bundled
// `vitest>vite` and the project's own `vite` don't collide on Plugin<any>
// identity under exactOptionalPropertyTypes.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    coverage: {
      // Istanbul instead of v8 because Bun's runtime does not implement the
      // Node V8 inspector coverage API that @vitest/coverage-v8 depends on.
      provider: 'istanbul',
      reporter: ['text', 'html', 'json-summary'],
      include: ['src/lib/**/*.ts'],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
