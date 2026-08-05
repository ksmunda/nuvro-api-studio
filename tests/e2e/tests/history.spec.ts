import { test, expect } from '@playwright/test';

test.describe('NUVRO API Studio - Request History E2E Flow', () => {
  test('allows executing requests, viewing history, selecting history item to restore parameters, and clearing history', async ({ page }) => {
    const timestamp = Date.now();
    const email = `hist-test-${timestamp}@nuvro.dev`;
    const username = `histuser_${timestamp}`;
    const password = 'SecurePassword123!';

    // 1. Register & Login
    await page.goto('/register');
    await page.fill('input[type="email"]', email);
    await page.fill('input[placeholder="dev_user"]', username);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Create account")');

    // Verify Studio page loaded
    await expect(page.getByTestId('authenticated-user')).toBeVisible();

    // 2. Execute a GET request to the health endpoint
    await page.fill('input[placeholder*="Enter request URL"]', 'http://127.0.0.1:4000/api/v1/health');
    await page.click('button:has-text("Send")');

    // Wait for the status indicator 200 OK to appear
    await expect(page.locator('text=200 OK')).toBeVisible();

    // 3. Switch to History tab in the sidebar
    await page.click('button:has-text("History")');

    // 4. Verify request appears in history sidebar
    const historyItem = page.locator('aside >> text=http://127.0.0.1:4000/api/v1/health');
    await expect(historyItem).toBeVisible();

    // Verify method GET and status 200 are visible in history
    await expect(page.locator('aside >> text=GET').first()).toBeVisible();
    await expect(page.locator('aside >> text=200').first()).toBeVisible();

    // 5. Change the URL to another value
    await page.fill('input[placeholder*="Enter request URL"]', 'http://127.0.0.1:4000/api/v1/another-value');

    // 6. Click history item to restore the request URL
    await page.click('aside >> text=http://127.0.0.1:4000/api/v1/health');

    // Verify the URL input is restored to health URL
    const urlInput = page.locator('input[placeholder*="Enter request URL"]');
    await expect(urlInput).toHaveValue('http://127.0.0.1:4000/api/v1/health');

    // 7. Click "Clear All" in history header
    await page.click('#clear-history-btn');

    // Verify history empty message appears
    await expect(page.locator('text=No request history yet')).toBeVisible();
  });
});
