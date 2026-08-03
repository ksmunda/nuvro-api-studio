import { test, expect } from '@playwright/test';

test.describe('NUVRO API Studio - Environments & Variables E2E Flow', () => {
  test('allows managing environments, adding variables, previewing variable resolution, and sending requests', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER PAGE ERROR:', err.message));

    const timestamp = Date.now();
    const email = `env-test-${timestamp}@nuvro.dev`;
    const username = `envuser_${timestamp}`;
    const password = 'SecurePassword123!';

    // 1. Visit registration form & login
    await page.goto('/register');
    await page.fill('input[type="email"]', email);
    await page.fill('input[placeholder="dev_user"]', username);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Create account")');

    // 2. Wait for redirect to Studio page
    await expect(page.locator('text=Logged in as')).toBeVisible({ timeout: 10000 });

    // 3. Open environment manager
    await page.click('#env-selector-btn');
    await page.click('text=Manage Environments');

    // 4. Create a new environment
    await page.click('text=+ New');
    await page.fill('input[placeholder*="e.g. Production"]', 'LocalDev');
    await page.click('form button:has-text("Create")');

    // 5. Add a variable
    const addRow1 = page.locator('table tbody tr').last();
    const keyInput1 = addRow1.locator('input[placeholder="NEW_VARIABLE"]');
    const valInput1 = addRow1.locator('input[placeholder="value"]');
    await keyInput1.fill('BASE_URL');
    await page.waitForTimeout(200);
    await expect(keyInput1).toHaveValue('BASE_URL');
    await valInput1.fill('http://localhost:4000/api/v1');
    await page.waitForTimeout(200);
    await expect(valInput1).toHaveValue('http://localhost:4000/api/v1');
    await addRow1.locator('button:has-text("+ Add")').click();

    // Wait for the first variable to be added and rendered
    await expect(page.locator('input[value="BASE_URL"]')).toBeVisible();

    // Add a second variable (e.g. USER_ID)
    const addRow2 = page.locator('table tbody tr').last();
    const keyInput2 = addRow2.locator('input[placeholder="NEW_VARIABLE"]');
    const valInput2 = addRow2.locator('input[placeholder="value"]');
    
    // Ensure inputs are reset before filling
    await expect(keyInput2).toHaveValue('');
    await expect(valInput2).toHaveValue('');
    
    await keyInput2.fill('USER_ID');
    await page.waitForTimeout(200);
    await expect(keyInput2).toHaveValue('USER_ID');
    await valInput2.fill('123');
    await page.waitForTimeout(200);
    await expect(valInput2).toHaveValue('123');
    await addRow2.locator('button:has-text("+ Add")').click();

    // Wait for the second variable to be added
    await expect(page.locator('input[value="USER_ID"]')).toBeVisible();

    // Close Modal
    await page.click('button:has-text("Close")');

    // 6. Select the environment
    await page.click('#env-selector-btn');
    await page.click('text=LocalDev');

    // 7. Enter templated URL and check preview
    await page.fill('input[placeholder*="Enter request URL"]', '{{BASE_URL}}/health');
    await expect(page.locator('text=Resolved URL Preview:')).toBeVisible();
    await expect(page.locator('text=http://localhost:4000/api/v1/health')).toBeVisible();

    // 8. Execute request
    await page.click('button:has-text("Send")');

    // Wait for the status indicator 200 OK to appear
    await expect(page.locator('text=200 OK')).toBeVisible();
    
    const responseBodyContainer = page.locator('pre');
    await expect(responseBodyContainer).toContainText('"status": "ok"');
  });
});
