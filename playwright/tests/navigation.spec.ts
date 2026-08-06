import { test, expect } from '@playwright/test';
import { collectPageErrors } from '../utils/pageErrors';

// Curated set of core admin routes that don't require org-specific feature flags
// (WhatsApp Groups, AI assistants, etc. are opt-in per organization and are deliberately
// excluded so a disabled feature doesn't read as a broken route).
const CORE_ROUTES = [
  { path: '/chat', heading: 'Chats' },
  { path: '/flow', heading: 'Flows' },
  { path: '/template', heading: 'Templates' },
  { path: '/speed-send', heading: 'Speed sends' },
  { path: '/search', heading: 'Saved Searches' },
  { path: '/collection', heading: 'Collections' },
  { path: '/contact-management', heading: 'Contacts' },
  { path: '/settings', heading: 'Settings' },
  { path: '/myaccount', heading: 'My Account' },
];

test.describe('Core navigation', () => {
  for (const route of CORE_ROUTES) {
    test(`${route.path} loads without an error boundary or session bounce`, async ({ page }) => {
      const errors = collectPageErrors(page);

      await page.goto(route.path);

      await expect(page.getByTestId('errorMessage')).toHaveCount(0);
      await expect(page).not.toHaveURL(/\/login/);
      await expect(page.locator('body')).not.toBeEmpty();
      expect(errors, `unexpected console/page errors on ${route.path}: ${errors.join('; ')}`).toHaveLength(0);
    });
  }
});
