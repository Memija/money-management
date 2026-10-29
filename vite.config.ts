import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
} as const

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 5173,
    headers: SECURITY_HEADERS,
  },
  preview: {
    port: 4173,
    strictPort: true,
    headers: SECURITY_HEADERS,
  },
  build: {
    target: 'baseline-widely-available',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 500,
    sourcemap: false,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules[\\/](?:react|react-dom|scheduler|zustand)[\\/]/,
              priority: 30,
            },
            {
              name: 'motion-vendor',
              test: /node_modules[\\/](?:framer-motion|motion-dom|motion-utils)[\\/]/,
              priority: 25,
            },
            {
              name: 'recharts',
              test: /node_modules[\\/](?:recharts|d3-|victory-vendor|internmap|decimal\.js-light|eventemitter3|tiny-invariant|clsx)[\\/]/,
              priority: 20,
            },
            {
              name: 'icons-vendor',
              test: /node_modules[\\/]react-icons[\\/]/,
              priority: 15,
            },
          ],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
    clearMocks: true,
    restoreMocks: true,
    testTimeout: 15000,
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'scripts/**/*.{test,spec}.{js,mjs}'],
    reporters: ['default', 'vitest-sonar-reporter'],
    outputFile: {
      'vitest-sonar-reporter': './coverage/sonar-report.xml',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 70,
      },
      exclude: [
        'node_modules/**',
        'dist/**',
        'src/test/**',
        'src/types/**',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'scripts/**',
        'src/main.tsx',
        'test-data/**',
        '**/*.d.ts',
      ],
    },
  },
})
