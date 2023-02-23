/// <reference types="vitest" />
/// <reference types="vite-plugin-svgr/client" />
import { defineConfig, ConfigEnv, UserConfigExport } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import checker from 'vite-plugin-checker';
import svgrPlugin from 'vite-plugin-svgr';
import fs from 'fs';
import inject from '@rollup/plugin-inject';

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
          reporter: ['lcov'],
          exclude: ['node_modules/'],
        },
        css: true,
      },
    });
  }
  if (command === 'serve') {
    return defineConfig({
      // dev specific config
      css: {
        modules: {
          generateScopedName: function (name, filename, css) {
            var path = require('path');
            var i = css.indexOf('.' + name);
            var line = css.substring(0, i).split(/[\r\n]/).length;
            var file = path.basename(filename, '.module.css');
            // instead of line will put hash
            return file + '_' + name + '_' + line;
          },
        },
      },
      plugins: [react(), viteTsconfigPaths(), svgrPlugin(), checker({ typescript: true })],
      build: {
        outDir: 'build',
        rollupOptions: {
          plugins: [inject({ Buffer: ['buffer', 'Buffer'], process: 'process' })],
        },
      },
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
      // build specific config
      plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
      build: {
        outDir: 'build',
        rollupOptions: {
          plugins: [inject({ Buffer: ['buffer', 'Buffer'], process: 'process' })],
        },
      },
      optimizeDeps: {
        esbuildOptions: {
          // Node.js global to browser globalThis
          define: {
            global: 'globalThis',
          },
        },
      },
      resolve: { alias: { util: 'util/' } },
    });
  }
};
