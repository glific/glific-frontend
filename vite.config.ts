/// <reference types="vitest" />
/// <reference types="vite-plugin-svgr/client" />
import { defineConfig, ConfigEnv, UserConfigExport } from 'vite';
import react from '@vitejs/plugin-react';
// import eslint from 'vite-plugin-eslint';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import checker from 'vite-plugin-checker';
import svgrPlugin from 'vite-plugin-svgr';
import fs from 'fs';
import nodePolyfills from 'rollup-plugin-polyfill-node';

// https://vitejs.dev/config/
export default ({ command, mode }: ConfigEnv): UserConfigExport => {
  if (mode === 'test' && command === 'serve') {
    return defineConfig({
      // dev specific config
      plugins: [react(), viteTsconfigPaths(), svgrPlugin()],

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
          reporter: ['text', 'html', 'lcov'],
          // choosing istanbul for now because of this https://github.com/vitest-dev/vitest/issues/1252
          provider: 'istanbul', // or 'c8'
          exclude: ['node_modules/', '**/*.test.tsx'],
        },
        css: true,
      },
    });
  }
  if (command === 'serve') {
    return defineConfig({
      // dev specific config
      plugins: [react(), viteTsconfigPaths(), svgrPlugin(), checker({ typescript: true })],
      optimizeDeps: {
        esbuildOptions: {
          // Node.js global to browser globalThis
          define: {
            global: 'globalThis',
          },
        },
      },
      server: {
        open: true,
        port: 3000,
        https: {
          key: fs.readFileSync('../glific/priv/cert/glific.test+1-key.pem'),
          cert: fs.readFileSync('../glific/priv/cert/glific.test+1.pem'),
        },
      },
      resolve: { alias: { util: 'util/' } },
    });
  } else {
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
      plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
      build: {
        // this is needed because of this https://github.com/vitejs/vite/issues/2139#issuecomment-1405624744
        commonjsOptions: {
          defaultIsModuleExports(id) {
            try {
              const module = require(id);
              if (module?.default) {
                return false;
              }
              return 'auto';
            } catch (error) {
              return 'auto';
            }
          },
          transformMixedEsModules: true,
        },
        outDir: 'build',
        rollupOptions: {
          plugins: [nodePolyfills('buffer', 'process')],
        },
      },
    });
  }
};
