
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/setup.ts',
        '**/*.d.ts',
        '**/*.test.tsx',
        '**/*.test.ts',
        'src/integrations/**',
        'src/components/ui/**',
        'src/mocks/**',
        'src/types/**',
      ],
      thresholds: {
        lines: 25,
        functions: 20,
        branches: 20,
        statements: 25
      }
    },


  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
