import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E config.
 *
 * The tests drive the real built UI but mock the GraphQL/REST network at the
 * Playwright layer, so they run offline without a backend or Kaapi. Point
 * PLAYWRIGHT_BASE_URL at a running dev server (default: the local vite host).
 *
 * Run:  yarn dev   (in one terminal)
 *       yarn test:e2e
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'https://glific.test:3000',
    // local dev server uses a mkcert self-signed cert
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
