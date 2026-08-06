import type { Page } from '@playwright/test';

/**
 * Attaches listeners that record uncaught exceptions and console errors so a
 * spec can assert the app never entered a broken/crashed state.
 */
export const collectPageErrors = (page: Page): string[] => {
  const errors: string[] = [];

  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  return errors;
};
