import { test, expect } from '@playwright/test';

test.describe('NUVRO API Studio - Multi-Tab Request Workspace E2E Flow', () => {
  test('verifies multi-tab functionality, dirty checking, tab switching, and workspace isolation', async ({ page }) => {
    const timestamp = Date.now();
    const email = `tabs-test-${timestamp}@nuvro.dev`;
    const username = `tabsuser_${timestamp}`;
    const password = 'SecurePassword123!';

    // 1. Register & Login
    await page.goto('/register');
    await page.fill('input[type="email"]', email);
    await page.fill('input[placeholder="dev_user"]', username);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Create account")');

    // Verify Studio page loaded
    await expect(page.getByTestId('authenticated-user')).toBeVisible();

    // 2. Default tab exists
    const tabNewRequest = page.locator('[data-testid="request-tab-bar"] >> text=New Request');
    await expect(tabNewRequest).toBeVisible();

    // Edit the first tab's URL (makes it dirty)
    await page.fill('input[placeholder*="Enter request URL"]', 'http://127.0.0.1:4000/api/v1/health');

    // 3. Open a second tab using the "+" tab button
    await page.click('#new-request-tab-btn');

    // Second tab appears and is active
    const activeTab = page.locator('[data-testid="request-tab-bar"] >> div.bg-surface-900');
    await expect(activeTab).toContainText('New Request');

    // Second tab's input is empty (defaults to empty URL)
    const urlInput = page.locator('input[placeholder*="Enter request URL"]');
    await expect(urlInput).toHaveValue('');

    // Write a different URL in Tab 2
    await page.fill('input[placeholder*="Enter request URL"]', 'http://127.0.0.1:4000/api/v1/users');

    // 4. Switch back to the first tab by clicking its tab button (wait, both are titled "New Request" so let's find the first one by locator)
    const firstTabBtn = page.locator('[data-testid="request-tab-bar"] >> div.flex >> nth=0');
    await firstTabBtn.click();

    // First tab's URL is restored
    await expect(urlInput).toHaveValue('http://127.0.0.1:4000/api/v1/health');

    // Switch to the second tab
    const secondTabBtn = page.locator('[data-testid="request-tab-bar"] >> div.flex >> nth=1');
    await secondTabBtn.click();

    // Second tab's URL is restored
    await expect(urlInput).toHaveValue('http://127.0.0.1:4000/api/v1/users');

    // 5. Close a dirty tab (confirm dialog behavior)
    // Click close icon of Tab 2 (second tab)
    const closeTab2Btn = page.locator('[data-testid^="close-tab-"] >> nth=1');
    
    // Set up window dialog listener for confirm cancel
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('unsaved changes');
      await dialog.dismiss(); // Cancel close
    });
    await closeTab2Btn.click();

    // Tab 2 still exists
    await expect(page.locator('[data-testid="request-tab-bar"] >> div.flex >> nth=1')).toBeVisible();

    // Confirm close (dismisses/closes tab)
    page.once('dialog', async (dialog) => {
      await dialog.accept(); // Close without saving
    });
    await closeTab2Btn.click();

    // Tab 2 is gone, only Tab 1 remains
    await expect(page.locator('[data-testid="request-tab-bar"] >> div.flex >> nth=1')).not.toBeVisible();
    await expect(urlInput).toHaveValue('http://127.0.0.1:4000/api/v1/health');
  });
});
