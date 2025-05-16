/// <reference types="vitest" />
/// <reference types="vite-plugin-svgr/client" />
import { defineConfig, ConfigEnv, UserConfigExport, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// import eslint from 'vite-plugin-eslint';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import checker from 'vite-plugin-checker';
import svgr from 'vite-plugin-svgr';

import fs from 'fs';
import { sentryVitePlugin } from '@sentry/vite-plugin';

// https://vitejs.dev/config/
export default ({ command, mode }: ConfigEnv): UserConfigExport => {
  const env = loadEnv(mode, process.cwd(), '');

  const plugins = [
    react(),
    viteTsconfigPaths(),
    svgr(),
    sentryVitePlugin({
      authToken: env.VITE_SENTRY_AUTH_TOKEN || '',
      org: 'project-tech4dev',
      project: 'glific-frontend',
    }),
  ];

  const esbuildOptions = {
    // Node.js global to browser globalThis
    define: {
      global: 'globalThis',
    },
  };

  // dev in test mode config
  if (mode === 'test' && command === 'serve') {
    return defineConfig({
      // dev specific config
      build: {
        sourcemap: true, // Source map generation must be turned on
      },
      plugins: plugins,
      optimizeDeps: {
        esbuildOptions: esbuildOptions,
      },
    });
  }

  // dev specific config
  if (command === 'serve') {
    return defineConfig({
      plugins: plugins.concat([checker({ typescript: true })]),
      // dev specific config
      build: {
        sourcemap: true, // Source map generation must be turned on
      },
      optimizeDeps: {
        esbuildOptions: esbuildOptions,
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
    });
  }

  // command === 'build'
  return defineConfig({
    optimizeDeps: {
      esbuildOptions: esbuildOptions,
    },
    plugins: plugins,
    build: {
      outDir: 'build',
      sourcemap: true,
    },
  });
};
