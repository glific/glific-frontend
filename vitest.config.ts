import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
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
  plugins: [tsconfigPaths(), svgr()],
});
