
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
          lines: 80,
          functions: 80,
          branches: 70,
          statements: 80
        },
        'src/hooks/**': {
          lines: 60,
          functions: 60,
          branches: 50,
          statements: 60
        },
        'src/core/**': {
          lines: 70,
          functions: 70,
          branches: 60,
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
