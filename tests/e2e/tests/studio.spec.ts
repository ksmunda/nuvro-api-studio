import { test, expect } from '@playwright/test';

test.describe('NUVRO API Studio - Request Builder & Response E2E Flow', () => {
  test('logs in, configures a GET request to the health endpoint, executes, and displays response', async ({ page }) => {
    const timestamp = Date.now();
    const email = `studio-test-${timestamp}@nuvro.dev`;
    const username = `studiouser_${timestamp}`;
    const password = 'SecurePassword123!';

    // 1. Visit registration form
    await page.goto('/register');
    await page.fill('input[type="email"]', email);
    await page.fill('input[placeholder="dev_user"]', username);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Create account")');

    // 2. Wait for redirect to Studio page
    await expect(page.getByRole('heading', { name: 'NUVRO API Studio' })).toBeVisible();
    await expect(page.locator('text=Logged in as')).toContainText(username);

    // 3. Configure a GET request
    // Set the method selector (default is GET, but let's verify we can interact with it)
    await page.selectOption('#method-selector', 'GET');

    // Enter local backend health endpoint URL
    await page.fill('input[placeholder*="Enter request URL"]', 'http://localhost:4000/api/v1/health');

    // Click Send
    await page.click('button:has-text("Send")');

    // 4. Verify response is shown
    // Wait for the status indicator 200 OK to appear
    await expect(page.locator('text=200 OK')).toBeVisible();

    // Verify the response body contains the JSON health status
    const responseBodyContainer = page.locator('pre');
    await expect(responseBodyContainer).toContainText('"status": "ok"');

    // Switch to Response Headers tab
    await page.click('button:has-text("Headers (")');
    await expect(page.locator('text="content-type"')).toBeVisible();

    // 5. Test variable interpolation error handling (optional, nice-to-have)
    await page.fill('input[placeholder*="Enter request URL"]', 'http://{{MISSING_HOST}}/path');
    await page.click('button:has-text("Send")');
    await expect(page.locator('text=Request Execution Error')).toBeVisible();
    await expect(page.locator('text=Url interpolation failed')).toBeVisible();

    // 6. Logout
    await page.click('button:has-text("Logout")');
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  });
});
