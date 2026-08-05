import { test, expect } from '@playwright/test';

test.describe('NUVRO API Studio - Collections & Request Persistence E2E Flow', () => {
  test('allows creating collections, saving requests, modifying them, reloading for persistence, and deleting requests', async ({ page }) => {
    const timestamp = Date.now();
    const email = `col-test-${timestamp}@nuvro.dev`;
    const username = `coluser_${timestamp}`;
    const password = 'SecurePassword123!';

    // 1. Register & Login
    await page.goto('/register');
    await page.fill('input[type="email"]', email);
    await page.fill('input[placeholder="dev_user"]', username);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Create account")');

    // Verify Studio page loaded
    await expect(page.getByTestId('authenticated-user')).toBeVisible();
    await expect(page.getByTestId('authenticated-user')).toContainText(username);

    // 2. Create Collection
    await page.click('button:has-text("Create Collection")');
    await page.fill('input[placeholder="e.g. Users API"]', 'Test Collection');
    await page.click('div.fixed button:has-text("Create")');

    // Verify Collection is listed in the sidebar
    await expect(page.locator('text=Test Collection')).toBeVisible();

    // 3. Save a request to the collection
    await page.fill('input[placeholder*="Enter request URL"]', 'http://127.0.0.1:4000/api/v1/health');
    await page.click('#save-request-btn');

    // Save request modal pops up
    await page.fill('input[placeholder="e.g. Get Users"]', 'Get Health');
    await page.click('div.fixed button:has-text("Save")');

    // 4. Verify request appears in the sidebar under the collection
    const requestItem = page.locator('aside >> text=Get Health');
    await expect(requestItem).toBeVisible();

    // 5. Modify URL and save changes
    await page.fill('input[placeholder*="Enter request URL"]', 'http://127.0.0.1:4000/api/v1/health-modified');
    const saveResponsePromise = page.waitForResponse(response => 
      response.url().includes('/api/v1/requests/') && response.request().method() === 'PATCH'
    );
    await page.click('#save-request-btn');
    await saveResponsePromise;

    // 6. Reload page to verify persistence
    await page.reload();
    await expect(page.getByTestId('authenticated-user')).toBeVisible();
    await expect(page.locator('text=Test Collection')).toBeVisible();

    // Click request in sidebar to load it
    await page.click('aside >> text=Get Health');

    // Verify modified URL is loaded into the Request Builder input
    const urlInput = page.locator('input[placeholder*="Enter request URL"]');
    await expect(urlInput).toHaveValue('http://127.0.0.1:4000/api/v1/health-modified');

    // 7. Right click on the request to show the context menu and select Delete
    // (Playwright context click triggers right-click contextmenu event)
    await page.click('aside >> text=Get Health', { button: 'right' });
    
    // Select delete in the custom context menu
    await page.click('button:has-text("Delete")');

    // Confirmation modal appears, click confirm
    await page.click('div.fixed button:has-text("Delete")');

    // Verify request is removed from the sidebar
    await expect(page.locator('aside >> text=Get Health')).not.toBeVisible();
  });
});
