/// <reference types="vitest" />
/// <reference types="vite-plugin-svgr/client" />
import { defineConfig, ConfigEnv, UserConfigExport, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// import eslint from 'vite-plugin-eslint';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import checker from 'vite-plugin-checker';
import svgrPlugin from 'vite-plugin-svgr';
import fs from 'fs';
import { sentryVitePlugin } from '@sentry/vite-plugin';

// https://vitejs.dev/config/
export default ({ command, mode }: ConfigEnv): UserConfigExport => {
  const env = loadEnv(mode, process.cwd(), '');

  const plugins = [
    react(),
    viteTsconfigPaths(),
    svgrPlugin(),
    sentryVitePlugin({
      authToken: env.VITE_SENTRY_AUTH_TOKEN || '',
      org: 'project-tech4dev',
      project: 'glific-frontend',
    }),
  ];

  if (mode === 'test' && command === 'serve') {
    return defineConfig({
      // dev specific config
      build: {
        sourcemap: true, // Source map generation must be turned on
      },
      plugins: plugins,

      optimizeDeps: {
        esbuildOptions: {
          // Node.js global to browser globalThis
          define: {
            global: 'globalThis',
          },
        },
      },

      resolve: { alias: { util: 'util/' } },
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.ts',
        coverage: {
          reporter: ['lcov', 'text', 'html'],
          // choosing istanbul for now because of this https://github.com/vitest-dev/vitest/issues/1252
          provider: 'istanbul', // or 'c8',
          include: ['src/**/**'],
          exclude: ['node_modules/', '**/*.test.tsx', './src/assets/**'],
        },
        css: true,
      },
    });
  }
  if (command === 'serve') {
    return defineConfig({
      // dev specific config
      build: {
        sourcemap: true, // Source map generation must be turned on
      },
      plugins: [...plugins, checker({ typescript: true })],
      optimizeDeps: {
        esbuildOptions: {
          // Node.js global to browser globalThis
          define: {
            global: 'globalThis',
          },
        },
      },
      server: {
        host: 'glific.test',
        port: 3000,
        open: 'https://glific.test:3000/',
        https: {
          key: fs.readFileSync('../glific/priv/cert/glific.test+1-key.pem'),
          cert: fs.readFileSync('../glific/priv/cert/glific.test+1.pem'),
        },
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-XSS-Protection': '1; mode=block',
          'X-Frame-Options': 'deny',
          'Content-Security-Policy':
            "default-src * data:; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; script-src-elem 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://js.stripe.com ; frame-src 'self' https://js.stripe.com/ https://www.google.com https://www.gstatic.com data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; connect-src *;",
          'Strict-Transport-Security': 'max-age=63072000; includeSubdomains; preload',
        },
      },
      resolve: { alias: { util: 'util/', stream: 'stream-browserify' } }, // stream polyfill is needed by logflare
    });
  }
  // command === 'build'
  return defineConfig({
    optimizeDeps: {
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: 'globalThis',
        },
      },
    },
    // build specific config
    plugins: plugins,
    build: {
      outDir: 'build',
      sourcemap: true,
    },
    resolve: { alias: { util: 'util/', stream: 'stream-browserify' } },
  });
};
