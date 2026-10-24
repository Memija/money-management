import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('recharts')) {
            return 'recharts'
          }
          if (
            id.includes('react/') ||
            id.includes('react-dom') ||
            id.includes('zustand') ||
            id.includes('react-virtuoso')
          ) {
            return 'react-vendor'
          }
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
    testTimeout: 15000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        'dist/**',
        'src/test/**',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'scripts/**',
      ],
    },
  },
})
