import { defineConfig, devices } from '@playwright/test';

const STAGING_BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'https://staging.glific.com';
const STORAGE_STATE = 'playwright/.auth/user.json';

export default defineConfig({
  testDir: './playwright',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: STAGING_BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Escape hatch for environments with a pre-installed browser that doesn't match the
    // revision @playwright/test expects (e.g. a sandboxed dev container) — unset in CI.
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined },
  },
  projects: [
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },
    {
      name: 'guest',
      testMatch: /auth\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'authenticated',
      testMatch: /.*\.spec\.ts/,
      testIgnore: /auth\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
    },
  ],
});
