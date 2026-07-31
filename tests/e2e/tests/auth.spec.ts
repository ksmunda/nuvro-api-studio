import { test, expect } from '@playwright/test';

test.describe('Developer Authentication flow', () => {
  test('allows registering a user, persisting session, and logging out', async ({ page }) => {
    // Generate distinct dev account to prevent duplicate keys in tests
    const timestamp = Date.now();
    const email = `test-${timestamp}@nuvro.dev`;
    const username = `testuser_${timestamp}`;
    const password = 'SecurePassword123!';

    // 1. Visit registration form
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();

    // 2. Register
    await page.fill('input[type="email"]', email);
    await page.fill('input[placeholder="dev_user"]', username);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Create account")');

    // 3. Verify redirected to root dashboard
    await expect(page.getByRole('heading', { name: 'NUVRO API Studio' })).toBeVisible();
    await expect(page.locator('text=Logged in as')).toContainText(username);

    // 4. Verify session persistence on page refresh
    await page.reload();
    await expect(page.getByRole('heading', { name: 'NUVRO API Studio' })).toBeVisible();
    await expect(page.locator('text=Logged in as')).toContainText(username);

    // 5. Logout
    await page.click('button:has-text("Logout")');

    // 6. Verify back to login page
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  });
});
