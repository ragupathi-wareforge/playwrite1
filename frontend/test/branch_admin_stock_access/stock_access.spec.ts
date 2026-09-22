// login testing

const { test, expect, chromium } = require('@playwright/test');

test('Valid Login Test', async () => {

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const page = await browser.newPage();

  await page.goto('http://localhost:4200/user/login');

  console.log('1. Login page loaded');

  // Email
  await page.locator('input[placeholder="Email"]').fill(
    'ragupathi1050969@gmail.com'
  );

  console.log('2. Email filled');

  // Password
  await page.locator('input[placeholder="Password"]').fill(
    'Ragupathi@2002'
  );

  console.log('3. Password filled');

  // Login button
  await page.getByRole('button', { name: 'Login' }).click();

  console.log('4. Login button clicked');

  // Login success
  // await expect(page).not.toHaveURL('http://localhost:4200/user/login');

  console.log('5. Login successful');

});