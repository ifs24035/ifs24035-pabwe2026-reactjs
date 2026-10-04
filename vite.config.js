import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: Number(env.APP_PORT) || 3000,
    },
    define: {
      DELCOM_BASEURL: JSON.stringify(
        env.DELCOM_BASEURL || 'https://open-api.delcom.org/api/v1',
      ),
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.js',
      css: false,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        include: ['src/**/*.{js,jsx}'],
        exclude: [
          'src/main.jsx',
          'src/setupTests.js',
          'src/test-utils.jsx',
          'src/**/*.test.{js,jsx}',
        ],
        thresholds: {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
      },
    },
  };
});