
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
        'src/test/**',
        '**/*.d.ts',
        '**/*.test.tsx',
        '**/*.test.ts',
        'src/integrations/**',
        'src/components/ui/**',
        'src/mocks/**',
        'src/types/**',
      ],
      thresholds: {
        'src/services/**': {
          lines: 60,
          functions: 50,
          branches: 40,
          statements: 60
        },
        'src/hooks/**': {
          lines: 50,
          functions: 40,
          branches: 30,
          statements: 50
        },
        'src/core/**': {
          lines: 60,
          functions: 50,
          branches: 40,
          statements: 60
        },
        'src/utils/**': {
          lines: 70,
          functions: 60,
          branches: 50,
          statements: 70
        }
      }
    },




  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
