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

    // 4. Switch back to the first tab by clicking its tab button
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

  test('verifies tab persistence, workspace isolation, and secret scrubbing on reload', async ({ page }) => {
    const timestamp = Date.now();
    const email = `pers-test-${timestamp}@nuvro.dev`;
    const username = `persuser_${timestamp}`;
    const password = 'SecurePassword123!';

    // 1. Register & Login
    await page.goto('/register');
    await page.fill('input[type="email"]', email);
    await page.fill('input[placeholder="dev_user"]', username);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Create account")');

    // Verify Studio page loaded
    await expect(page.getByTestId('authenticated-user')).toBeVisible();

    // Fill URL and add secret headers/queryParams in the default tab
    await page.fill('input[placeholder*="Enter request URL"]', 'http://127.0.0.1:4000/api/v1/auth/me');
    
    // Switch to Headers tab and add auth header
    await page.click('button:has-text("Headers")');
    await page.fill('input[placeholder="Header Key"] >> nth=0', 'Authorization');
    await page.fill('input[placeholder="Value"] >> nth=0', 'Bearer secret_token_1234');

    // Open a second tab
    await page.click('#new-request-tab-btn');
    await page.fill('input[placeholder*="Enter request URL"]', 'http://127.0.0.1:4000/api/v1/health');

    // Switch back to Tab 1
    const firstTabBtn = page.locator('[data-testid="request-tab-bar"] >> div.flex >> nth=0');
    await firstTabBtn.click();

    // Verify localStorage has the persisted state
    const storageState = await page.evaluate(() => localStorage.getItem('nuvro:request-tabs-session'));
    expect(storageState).not.toBeNull();
    // Validate sensitive authorization values are scrubbed
    expect(storageState).not.toContain('secret_token_1234');
    expect(storageState).toContain('••••••••');

    // 2. Reload page to verify session recovery
    await page.reload();
    await expect(page.getByTestId('authenticated-user')).toBeVisible();

    // The tabs are restored
    const tab1 = page.locator('[data-testid="request-tab-bar"] >> div.flex >> nth=0');
    const tab2 = page.locator('[data-testid="request-tab-bar"] >> div.flex >> nth=1');
    await expect(tab1).toBeVisible();
    await expect(tab2).toBeVisible();

    // Active tab (Tab 1) state is restored
    const urlInput = page.locator('input[placeholder*="Enter request URL"]');
    await expect(urlInput).toHaveValue('http://127.0.0.1:4000/api/v1/auth/me');

    // 3. Switch workspace and verify isolation
    const workspaceSelector = page.locator('[data-testid="workspace-selector-btn"]');
    await workspaceSelector.click();
    await page.locator('[data-testid="create-workspace-btn"]').click();
    
    const wsName = 'Acme Corp';
    const wsSlug = `acme-corp-${Math.random().toString(36).substring(7)}`;
    await page.fill('[data-testid="workspace-name-input"]', wsName);
    await page.fill('[data-testid="workspace-slug-input"]', wsSlug);
    await page.click('[data-testid="submit-workspace-btn"]');

    // New workspace has its own default "New Request" tab
    await expect(workspaceSelector).toContainText(wsName);
    await expect(page.locator('[data-testid="request-tab-bar"] >> div.flex >> nth=0')).toContainText('New Request');
    await expect(page.locator('[data-testid="request-tab-bar"] >> div.flex >> nth=1')).not.toBeVisible();

    // Switch back to original workspace
    await workspaceSelector.click();
    await page.locator(`[data-testid="workspace-item-${username}-workspace"]`).click();

    // Verify original workspace tabs are recovered
    await expect(page.locator('[data-testid="request-tab-bar"] >> div.flex >> nth=0')).toBeVisible();
    await expect(page.locator('[data-testid="request-tab-bar"] >> div.flex >> nth=1')).toBeVisible();
  });
});
