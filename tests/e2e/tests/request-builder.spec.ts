import { test, expect } from '@playwright/test';

test.describe('NUVRO API Studio - Request Builder UI Flow', () => {
  test('allows configuring methods, url, params, headers, body, and auth settings', async ({ page }) => {
    const timestamp = Date.now();
    const email = `rb-test-${timestamp}@nuvro.dev`;
    const username = `rbuser_${timestamp}`;
    const password = 'SecurePassword123!';

    // 1. Register & Navigate to Studio
    await page.goto('/register');
    await page.fill('input[type="email"]', email);
    await page.fill('input[placeholder="dev_user"]', username);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Create account")');

    // Verify Studio page loaded successfully
    await expect(page.getByTestId('authenticated-user')).toBeVisible();
    await expect(page.getByTestId('authenticated-user')).toContainText(username);

    // 2. Verify Send button is disabled when URL is empty
    const sendButton = page.locator('button:has-text("Send")');
    await expect(sendButton).toBeDisabled();

    // 3. Verify Method selector contains and allows selecting all methods
    const methodSelector = page.locator('#method-selector');
    await expect(methodSelector).toBeVisible();
    
    const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    for (const method of methods) {
      await methodSelector.selectOption(method);
      await expect(methodSelector).toHaveValue(method);
    }
    // Set back to GET
    await methodSelector.selectOption('GET');

    // 4. Verify URL can be entered and Send button is enabled
    const urlInput = page.locator('input[placeholder*="Enter request URL"]');
    await expect(urlInput).toBeVisible();
    await urlInput.fill('http://127.0.0.1:4000/api/v1/health');
    await expect(sendButton).toBeEnabled();

    // 5. Verify Params tab works
    await page.click('button:has-text("Params")');
    await expect(page.locator('text=Query Parameters')).toBeVisible();

    // 6. Verify Headers tab works and row addition/removal functions
    await page.click('button:has-text("Headers")');
    const addHeaderButton = page.locator('button:has-text("Add Header")');
    await expect(addHeaderButton).toBeVisible();
    
    // Add header row
    await addHeaderButton.click();
    const headerKeyInput = page.locator('input[placeholder="Header Key"]').first();
    const headerValInput = page.locator('input[placeholder="Value"]').first();
    await expect(headerKeyInput).toBeVisible();
    await headerKeyInput.fill('Content-Type');
    await headerValInput.fill('application/json');

    // Remove header row
    const deleteHeaderButton = page.locator('button[aria-label="Remove row"]').first();
    await expect(deleteHeaderButton).toBeVisible();
    await deleteHeaderButton.click();
    await expect(headerKeyInput).toHaveValue('');

    // 7. Verify Body tab works and body type selection works
    await page.click('button:has-text("Body")');
    const bodyTypeSelect = page.locator('#body-type-select');
    await expect(bodyTypeSelect).toBeVisible();
    await bodyTypeSelect.selectOption('JSON');
    await expect(bodyTypeSelect).toHaveValue('JSON');

    // 8. Verify Authorization tab works and auth type selection works
    await page.click('button:has-text("Authorization")');
    const authTypeSelect = page.locator('#auth-type-select');
    await expect(authTypeSelect).toBeVisible();
    await authTypeSelect.selectOption('BEARER');
    await expect(authTypeSelect).toHaveValue('BEARER');

    // 9. Logout
    await page.click('button:has-text("Logout")');
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  });
});
