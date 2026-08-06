import { test as setup, expect } from '@playwright/test';
import { STAGING_PASSWORD, STAGING_PHONE } from './utils/credentials';

const STORAGE_STATE = 'playwright/.auth/user.json';

setup('authenticate against staging', async ({ page }) => {
  await page.goto('/login');
  await page.locator('input[type="tel"]').fill(STAGING_PHONE);
  await page.locator('input[type="password"]').fill(STAGING_PASSWORD);
  await page.getByTestId('SubmitButton').click();

  await expect(page.getByText('Chats', { exact: false }).first()).toBeVisible({ timeout: 20_000 });

  await page.context().storageState({ path: STORAGE_STATE });
});
