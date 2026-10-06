import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Menyisipkan CSS hasil build langsung ke index.html agar tidak memblokir render
function inlineCss() {
  return {
    name: 'inline-css',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html;

        let result = html;
        Object.entries(ctx.bundle).forEach(([fileName, asset]) => {
          if (asset.type !== 'asset' || !fileName.endsWith('.css')) return;

          const escaped = fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const linkTag = new RegExp(`<link[^>]*href="[^"]*${escaped}"[^>]*>`);
          if (!linkTag.test(result)) return;

          const css =
            typeof asset.source === 'string'
              ? asset.source
              : Buffer.from(asset.source).toString('utf8');
          result = result.replace(linkTag, () => `<style>${css}</style>`);
        });

        return result;
      },
    },
  };
}

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss(), inlineCss()],
    resolve: {
      // Preact hanya dipakai pada build produksi; dev dan tes tetap memakai React
      alias:
        command === 'build'
          ? [
              { find: /^react-dom\/client$/, replacement: 'preact/compat/client' },
              { find: /^react-dom$/, replacement: 'preact/compat' },
              { find: /^react\/jsx-runtime$/, replacement: 'preact/jsx-runtime' },
              { find: /^react\/jsx-dev-runtime$/, replacement: 'preact/jsx-runtime' },
              { find: /^react$/, replacement: 'preact/compat' },
            ]
          : [],
    },
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
        reporter: ['text', 'html', 'lcov'],
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