import { test, expect } from '@playwright/test';
import { STAGING_PASSWORD, STAGING_PHONE } from '../utils/credentials';
import { collectPageErrors } from '../utils/pageErrors';

// A message that isn't actionable: empty, or a raw technical artifact leaking to the user.
const isActionableMessage = (message: string) => {
  const trimmed = message.trim();
  if (!trimmed) return false;
  return !/^(undefined|null|\[object Object\]|error)$/i.test(trimmed);
};

test.describe('Login', () => {
  test('happy path: valid credentials land on the chat screen', async ({ page }) => {
    const errors = collectPageErrors(page);

    await page.goto('/login');
    await page.locator('input[type="tel"]').fill(STAGING_PHONE);
    await page.locator('input[type="password"]').fill(STAGING_PASSWORD);
    await page.getByTestId('SubmitButton').click();

    await expect(page.getByText('Chats', { exact: false }).first()).toBeVisible({ timeout: 20_000 });
    expect(errors, `unexpected console/page errors: ${errors.join('; ')}`).toHaveLength(0);
  });

  test('wrong password surfaces an actionable error and keeps the user on the login page', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="tel"]').fill(STAGING_PHONE);
    await page.locator('input[type="password"]').fill('this-is-definitely-wrong');
    await page.getByTestId('SubmitButton').click();

    const errorMessage = page.getByTestId('authErrorMessage');
    await expect(errorMessage).toBeVisible({ timeout: 15_000 });
    const text = (await errorMessage.textContent()) ?? '';
    expect(isActionableMessage(text), `error message was not actionable: "${text}"`).toBeTruthy();
    await expect(page).toHaveURL(/\/login/);
  });

  test('unknown phone number surfaces an actionable error', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="tel"]').fill('919999999999');
    await page.locator('input[type="password"]').fill(STAGING_PASSWORD);
    await page.getByTestId('SubmitButton').click();

    const errorMessage = page.getByTestId('authErrorMessage');
    await expect(errorMessage).toBeVisible({ timeout: 15_000 });
    const text = (await errorMessage.textContent()) ?? '';
    expect(isActionableMessage(text), `error message was not actionable: "${text}"`).toBeTruthy();
  });

  test('submitting an empty form shows required-field validation without calling the backend', async ({ page }) => {
    let sessionRequestFired = false;
    page.on('request', (request) => {
      if (request.url().includes('/v1/session')) sessionRequestFired = true;
    });

    await page.goto('/login');
    await page.getByTestId('SubmitButton').click();

    await expect(page.getByText('Input required').first()).toBeVisible();
    expect(sessionRequestFired, 'form submitted to the backend despite empty required fields').toBeFalsy();
  });

  test('script-injection payload in the password field is treated as plain text, not executed', async ({ page }) => {
    let dialogAppeared = false;
    page.on('dialog', async (dialog) => {
      dialogAppeared = true;
      await dialog.dismiss();
    });
    const errors = collectPageErrors(page);

    await page.goto('/login');
    await page.locator('input[type="tel"]').fill(STAGING_PHONE);
    await page.locator('input[type="password"]').fill('<script>alert(1)</script>');
    await page.getByTestId('SubmitButton').click();

    const errorMessage = page.getByTestId('authErrorMessage');
    await expect(errorMessage).toBeVisible({ timeout: 15_000 });
    expect(dialogAppeared, 'a script payload triggered a browser dialog (possible XSS)').toBeFalsy();
    expect(errors, `unexpected console/page errors: ${errors.join('; ')}`).toHaveLength(0);
  });

  test('an extremely long password does not crash the login form', async ({ page }) => {
    const errors = collectPageErrors(page);

    await page.goto('/login');
    await page.locator('input[type="tel"]').fill(STAGING_PHONE);
    await page.locator('input[type="password"]').fill('a'.repeat(5000));
    await page.getByTestId('SubmitButton').click();

    // Either an actionable error appears, or the page simply stays put — either is
    // acceptable, but the app must not hard-crash (blank page / unhandled exception).
    await expect(page.getByTestId('AuthContainer')).toBeVisible({ timeout: 15_000 });
    expect(errors, `unexpected console/page errors: ${errors.join('; ')}`).toHaveLength(0);
  });
});
