const { test, expect } = require('@playwright/test');

test('Super Admin Analytics Tab Test', async ({ page }) => {
  // 1. Login
  await page.goto('http://localhost:4200/user/login');

  await page.locator('input[placeholder="Email"]').fill(
    'ragupathi1050969@gmail.com'
  );

  await page.locator('input[placeholder="Password"]').fill(
    'Ragupathi@2002'
  );

  await page.getByRole('button', { name: 'Login' }).click();

  await page.waitForURL(
    '**/super-admin-analytics/analytics-page',
    { timeout: 20000 }
  );

  console.log('1. Login successful');
  console.log('Current URL:', page.url());

  // 2. Page load
  const salesReturnTab = page
    .locator('.toggle-item')
    .filter({ hasText: 'Sales & Returns' });

  const operationsTab = page
    .locator('.toggle-item')
    .filter({ hasText: 'Operations & Inventory Flow' });

  await expect(salesReturnTab).toBeVisible({ timeout: 20000 });
  await expect(operationsTab).toBeVisible({ timeout: 20000 });

  console.log('2. Page loaded');

  // 3. Sales & Returns
  await salesReturnTab.click();

  await expect(
    page.locator('app-super-admin-sales-returns')
  ).toBeVisible({ timeout: 20000 });

  console.log('3. Sales & Returns component displayed');

  // 4. Operations & Inventory Flow
  await operationsTab.click();

  await expect(
    page.locator('app-super-admin-operations-inventory-flow')
  ).toBeVisible({ timeout: 20000 });

  console.log('4. Operations & Inventory Flow component displayed');

  // 5. Switch back to Sales & Returns
  await salesReturnTab.click();

  await expect(
    page.locator('app-super-admin-sales-returns')
  ).toBeVisible({ timeout: 20000 });

  console.log('5. Successfully switched back to Sales & Returns');
});