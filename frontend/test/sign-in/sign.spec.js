
//signup testng 

// const { test } = require('@playwright/test');

// test('Signup test', async ({ page }) => {

//   await page.goto('http://localhost:4200/user/signup');
//   console.log('1. Signup page loaded');

//   await page.locator('input[placeholder="Name"]').fill('Ragupathi');
//   console.log('2. Name filled');

//   await page.locator('input[placeholder="Email"]').fill(
//     'ragupathi1050968@gmail.com'
//   );
//   console.log('3. Email filled');

//   await page.locator('input[placeholder="Mobile Number"]').fill(
//     '9876543210'
//   );
//   console.log('4. Mobile number filled');

//   await page.locator('input[placeholder="Password"]').fill(
//     'Ragupathi@2002'
//   );
//   console.log('5. Password filled');

//   await page.locator('input[placeholder="Confirm Password"]').fill(
//     'Ragupathi@2002'
//   );
//   console.log('6. Confirm password filled');

// });




//Checkbox testing 

// const { test, expect } = require('@playwright/test');

// test('Signup checkbox test', async ({ page }) => {

//   await page.goto('http://localhost:4200/user/signup');

//   console.log('1. Signup page loaded');

//   const checkbox = page.getByRole('checkbox');

//   await expect(checkbox).toBeVisible();
//   console.log('2. Checkbox is visible');

//   await expect(checkbox).not.toBeChecked();
//   console.log('3. Checkbox is initially unchecked');

//   await checkbox.check();
//   console.log('4. Checkbox checked');

//   await expect(checkbox).toBeChecked();
//   console.log('5. Checkbox is successfully checked');

// });




//Login Instead

const { test, expect } = require('@playwright/test');

test('Login instead link test', async ({ page }) => {

  await page.goto('http://localhost:4200/user/signup');

  console.log('1. Signup page loaded');

  const loginLink = page.getByText('Login instead', { exact: true });

  await expect(loginLink).toBeVisible();
  console.log('2. Login instead link is visible');

  await loginLink.click();
  console.log('3. Login instead link clicked');

  await expect(page).toHaveURL('http://localhost:4200/user/login');
  console.log('4. Successfully navigated to Login page');

});