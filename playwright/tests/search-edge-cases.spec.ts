import { test, expect } from '@playwright/test';
import { collectPageErrors } from '../utils/pageErrors';

// Adversarial inputs aimed at breaking the flow-search box: script injection, SQL-injection-
// shaped strings, very long input, and non-Latin/emoji text. None of these should crash the
// page, pop a dialog (reflected XSS), or get silently swallowed without any user feedback.
const ADVERSARIAL_QUERIES = [
  { name: 'script tag', value: '<script>alert(1)</script>' },
  { name: 'sql-injection-shaped string', value: "' OR 1=1 --" },
  { name: 'very long string', value: 'x'.repeat(1000) },
  { name: 'emoji and unicode', value: '🚀日本語مرحبا' },
];

test.describe('Flow search box handles adversarial input', () => {
  for (const query of ADVERSARIAL_QUERIES) {
    test(`survives: ${query.name}`, async ({ page }) => {
      let dialogAppeared = false;
      page.on('dialog', async (dialog) => {
        dialogAppeared = true;
        await dialog.dismiss();
      });
      const errors = collectPageErrors(page);

      await page.goto('/flow');
      const searchInput = page.locator('[data-testid="searchInput"] [name="searchInput"]');
      await searchInput.click();
      await searchInput.fill(query.value);
      await searchInput.press('Enter');

      // The input should render the raw text back (proof it was treated as data, not markup).
      await expect(searchInput).toHaveValue(query.value);
      expect(dialogAppeared, `"${query.name}" triggered a browser dialog (possible XSS)`).toBeFalsy();

      // The list settles into either matching rows or a visible empty state — never a blank screen.
      const tableBody = page.getByTestId('tableBody');
      const noResults = page.getByText(/no .*found/i);
      await expect(tableBody.or(noResults).first()).toBeVisible({ timeout: 15_000 });

      expect(errors, `unexpected console/page errors for "${query.name}": ${errors.join('; ')}`).toHaveLength(0);
    });
  }
});
