import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('renders the application heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'NUVRO API Studio' })).toBeVisible();
  });
});
