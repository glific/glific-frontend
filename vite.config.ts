/// <reference types="vitest" />
/// <reference types="vite-plugin-svgr/client" />
import { defineConfig, ConfigEnv, UserConfigExport } from 'vite';
import react from '@vitejs/plugin-react';
// import eslint from 'vite-plugin-eslint';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import checker from 'vite-plugin-checker';
import svgrPlugin from 'vite-plugin-svgr';
import fs from 'fs';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default ({ command, mode }: ConfigEnv): UserConfigExport => {
  const nodePolyfillsOptions = {
    globals: {
      Buffer: true,
      global: true,
      process: true,
    },
  };

  const plugins = [react(), viteTsconfigPaths(), svgrPlugin(), nodePolyfills(nodePolyfillsOptions)];

  const esbuildOptions = {
    // Node.js global to browser globalThis
    define: {
      global: 'globalThis',
    },
  };

  // dev in test mode config
  if (mode === 'test' && command === 'serve') {
    return defineConfig({
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
      optimizeDeps: {
        esbuildOptions: esbuildOptions,
      },
      server: {
        open: true,
        port: 3000,
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
    },
  });
};
