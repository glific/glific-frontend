import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';
import fs from 'fs';
import inject from '@rollup/plugin-inject';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode, ssrBuild }) => {
  if (command === 'serve') {
    return {
      // dev specific config
      plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
      build: {
        outDir: 'build',
        rollupOptions: {
          plugins: [inject({ Buffer: ['buffer', 'Buffer'], process: 'process' })],
        },
      },
      server: {
        open: true,
        https: {
          key: fs.readFileSync('../glific/priv/cert/glific.test+1-key.pem'),
          cert: fs.readFileSync('../glific/priv/cert/glific.test+1.pem'),
        },
      },
      define: {
        global: {},
      },
    };
  } else {
    // command === 'build'
    return {
      // build specific config
      plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
      build: {
        outDir: 'build',
        rollupOptions: {
          plugins: [inject({ Buffer: ['buffer', 'Buffer'], process: 'process' })],
        },
      },
      define: {
        global: {},
      },
    };
  }
});
