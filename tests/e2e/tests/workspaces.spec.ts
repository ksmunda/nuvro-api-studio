import { test, expect } from '@playwright/test';

test.describe('NUVRO API Studio - Workspaces & Organization E2E Flow', () => {
  test('allows viewing, creating, and switching workspaces', async ({ page }) => {
    // 1. Authenticate / Login
    await page.goto('/register');
    const randomUsername = `user_${Math.random().toString(36).substring(7)}`;
    const randomEmail = `${randomUsername}@nuvro.dev`;

    await page.fill('input[type="email"]', randomEmail);
    await page.fill('input[placeholder="dev_user"]', randomUsername);
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Create account")');

    // Wait until logged in and in the studio page
    await expect(page.locator('[data-testid="authenticated-user"]')).toBeVisible();

    // 2. Default workspace should be displayed
    const workspaceSelector = page.locator('[data-testid="workspace-selector-btn"]');
    await expect(workspaceSelector).toBeVisible();
    await expect(workspaceSelector).toContainText(`${randomUsername}'s Workspace`);

    // 3. Open dropdown and trigger "Create Workspace"
    await workspaceSelector.click();
    const createBtn = page.locator('[data-testid="create-workspace-btn"]');
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    // 4. Fill Create Workspace Modal
    const modal = page.locator('[data-testid="create-workspace-modal"]');
    await expect(modal).toBeVisible();

    const wsName = 'Acme Corp API Development';
    const wsSlug = `acme-corp-${Math.random().toString(36).substring(7)}`;
    const wsDesc = 'API Studio workspace for Acme team';

    await page.fill('[data-testid="workspace-name-input"]', wsName);
    await page.fill('[data-testid="workspace-slug-input"]', wsSlug);
    await page.fill('[data-testid="workspace-description-input"]', wsDesc);
    await page.click('[data-testid="submit-workspace-btn"]');

    // 5. Verify modal closed and new workspace active
    await expect(modal).not.toBeVisible();
    await expect(workspaceSelector).toContainText(wsName);

    // 6. Switch back to default workspace
    await workspaceSelector.click();
    const defaultWsItem = page.locator(`[data-testid="workspace-item-${randomUsername}-workspace"]`);
    await expect(defaultWsItem).toBeVisible();
    await defaultWsItem.click();

    // 7. Verify switcher successfully updated back
    await expect(workspaceSelector).toContainText(`${randomUsername}'s Workspace`);
  });
});
