import { test, expect } from '@playwright/test';

test.describe('Developer Authentication flow', () => {
  test('allows registering a user, persisting session, and logging out', async ({ page }) => {
    // Add temporary Playwright diagnostics
    page.on('console', msg => {
      console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
    });

    page.on('pageerror', error => {
      console.log(`[Browser Error] ${error.message}`);
    });

    page.on('requestfailed', request => {
      console.log(`[Request Failed] ${request.method()} ${request.url()}`);
    });

    page.on('response', async response => {
      if (response.status() >= 400) {
        console.log(`[HTTP ${response.status()}] ${response.request().method()} ${response.url()}`);
      }
    });

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

    // Wait a brief moment for any redirection/network activity to settle
    await page.waitForTimeout(1000);

    // Diagnostics: Inspect Cookies & Storage
    const rawCookies = await page.context().cookies();
    const sanitizedCookies = rawCookies.map(c => ({
      name: c.name,
      domain: c.domain,
      path: c.path,
      secure: c.secure,
      sameSite: c.sameSite,
      expires: c.expires
    }));
    console.log('Cookies:', sanitizedCookies);

    console.log(
      'LocalStorage:',
      await page.evaluate(() => ({ ...localStorage }))
    );

    console.log(
      'SessionStorage:',
      await page.evaluate(() => ({ ...sessionStorage }))
    );

    // Diagnostics: Verify the DOM
    console.log('URL:', page.url());

    console.log(
      'authenticated-user count:',
      await page.getByTestId('authenticated-user').count()
    );

    console.log(
      'BODY TEXT:',
      await page.locator('body').innerText()
    );

    console.log(
      'authenticated-user DOM count:',
      await page.locator('[data-testid="authenticated-user"]').count()
    );

    // 3. Verify redirected to root dashboard
    await expect(page.getByTestId('authenticated-user')).toBeVisible();
    await expect(page.getByTestId('authenticated-user')).toContainText(username);

    // 4. Verify session persistence on page refresh
    await page.reload();
    await expect(page.getByTestId('authenticated-user')).toBeVisible();
    await expect(page.getByTestId('authenticated-user')).toContainText(username);

    // 5. Logout
    await page.click('button:has-text("Logout")');

    // 6. Verify back to login page
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  });
});
