import { test, expect } from '@playwright/test';

test('Login Test', async ({ page }) => {

    // 1. Login page open
    await page.goto('http://localhost:4200/user/login');

    // 2. Username enter
    await page.locator('input[type="email"]').fill('ragupathic45@gmail.com');

    // 3. Password enter
    await page.locator('input[type="password"]').fill('Ragupathi@2002');

    // 4. Login button click
    await page.getByRole('button', { name: 'Login' }).click();

    // 5. Dashboard open aagudha check
    await expect(page).toHaveURL(/dashboard/);

});