import { test, expect } from '@playwright/test';

test.describe('NUVRO API Studio - Workspace Members & Collaboration E2E Flow', () => {
  test('allows managing workspace members and roles', async ({ page, context }) => {
    // 1. Register User B (Target member) first so they exist in the DB
    await page.goto('/register');
    const userBName = `userb_${Math.random().toString(36).substring(7)}`;
    const userBEmail = `${userBName}@nuvro.dev`.toLowerCase();

    await page.fill('input[type="email"]', userBEmail);
    await page.fill('input[placeholder="dev_user"]', userBName);
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Create account")');
    await expect(page.locator('[data-testid="authenticated-user"]')).toBeVisible({ timeout: 15000 });

    // Logout User B and close page to avoid any autofill issues
    await page.click('button[aria-label="Logout button"]');
    await expect(page.locator('button:has-text("Sign in")')).toBeVisible();
    await page.close();

    // 2. Open a new clean page and Register User A (Owner of workspace)
    const pageA = await context.newPage();
    const userAName = `usera_${Math.random().toString(36).substring(7)}`;
    const userAEmail = `${userAName}@nuvro.dev`.toLowerCase();

    await pageA.goto('/register');
    await pageA.fill('input[type="email"]', userAEmail);
    await pageA.fill('input[placeholder="dev_user"]', userAName);
    await pageA.fill('input[type="password"]', 'password123');
    await pageA.click('button:has-text("Create account")');
    await expect(pageA.locator('[data-testid="authenticated-user"]')).toBeVisible({ timeout: 15000 });

    // 3. Open Workspace Settings modal
    const settingsBtn = pageA.locator('[data-testid="workspace-settings-btn"]');
    await expect(settingsBtn).toBeVisible();
    await settingsBtn.click();

    // 4. Navigate to Members tab
    const settingsModal = pageA.locator('[data-testid="workspace-settings-modal"]');
    await expect(settingsModal).toBeVisible();

    const membersTab = pageA.locator('[data-testid="workspace-members-tab"]');
    await expect(membersTab).toBeVisible();
    await membersTab.click();

    // 5. Verify invite form exists and invite User B
    const inviteEmailInput = pageA.locator('[data-testid="invite-email-input"]');
    await expect(inviteEmailInput).toBeVisible();
    await inviteEmailInput.fill(userBEmail);

    const inviteRoleSelect = pageA.locator('[data-testid="invite-role-select"]');
    await inviteRoleSelect.selectOption('MEMBER');

    const inviteBtn = pageA.locator('[data-testid="invite-member-btn"]');
    await inviteBtn.click();

    // 6. Verify User B appears in current members list
    const memberRow = pageA.locator(`[data-testid="member-row-${userBEmail}"]`);
    await expect(memberRow).toBeVisible();
    await expect(memberRow).toContainText(userBName);

    // 7. Verify role selector is displayed for User B
    const roleSelect = pageA.locator(`[data-testid="member-role-select-${userBEmail}"]`);
    await expect(roleSelect).toBeVisible();
    await expect(roleSelect).toHaveValue('MEMBER');

    // 8. Modify role to ADMIN
    await roleSelect.selectOption('ADMIN');
    await expect(roleSelect).toHaveValue('ADMIN');

    // 9. Remove member User B
    const removeBtn = pageA.locator(`[data-testid="remove-member-btn-${userBEmail}"]`);
    await expect(removeBtn).toBeVisible();

    // Handle confirm dialog
    pageA.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await removeBtn.click();

    // 10. Verify User B is removed
    await expect(memberRow).not.toBeVisible();
  });
});
