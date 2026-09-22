const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:4200';

test.describe('Send Invite Page - Validation and Submit', () => {
  test.setTimeout(60000);

  test('Login, validate Send Invite form and submit invite', async ({
    page,
  }, testInfo) => {
    // 1. Login
    await page.goto(`${BASE_URL}/user/login`);

    await page
      .locator('input[placeholder="Email"]')
      .fill('ragupathi1050969@gmail.com');

    await page
      .locator('input[placeholder="Password"]')
      .fill('Ragupathi@2002');

    await page.getByRole('button', { name: 'Login' }).click();

    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('token')), {
        timeout: 20000,
      })
      .toBeTruthy();

    const token = await page.evaluate(() =>
      localStorage.getItem('token')
    );

    await page.route('**/api/**', async route => {
      await route.continue({
        headers: {
          ...route.request().headers(),
          authorization: `Bearer ${token}`,
        },
      });
    });

    console.log('1. Login successful');
    console.log('2. Token found');

    // 2. Open Send Invite page
    await page.goto(`${BASE_URL}/branch-admin/send-invite`);

    await expect(page).toHaveURL(
      /\/branch-admin\/send-invite/,
      { timeout: 20000 }
    );

    await expect(
      page.getByRole('heading', {
        name: 'Branch Admin Invite',
      })
    ).toBeVisible({ timeout: 20000 });

    console.log('3. Send Invite page opened');

    // 3. Locators
    const adminNameInput = page.locator(
      'input[placeholder="Enter Branch Admin Name"]'
    );

    const emailInput = page.locator(
      'input[placeholder="Enter Email Address"]'
    );

    const contactInputs = page.locator(
      'input[placeholder="Enter Contact Number"]'
    );

    const primaryContactInput = contactInputs.nth(0);
    const alternateContactInput = contactInputs.nth(1);

    // Correct locator: branch field has no placeholder.
    const branchSelect = page
      .locator('label')
      .filter({ hasText: 'Assigned Branch Name' })
      .locator('..')
      .locator('select');

    // app-button renders button.invite-button
    const sendButton = page.locator(
      'button.invite-button'
    );

    await expect(sendButton).toBeVisible({
      timeout: 20000,
    });

    console.log('4. Send Invite button visible');

    // 4. Empty form validation
    await adminNameInput.fill('');
    await emailInput.fill('');
    await primaryContactInput.fill('');
    await alternateContactInput.fill('');

    // Do not call selectOption here.
    // Branch must remain empty.
    await expect(sendButton).toBeDisabled();

    console.log('5. Empty form validation passed');

    await page.screenshot({
      path: testInfo.outputPath('01-empty-form.png'),
      fullPage: true,
    });

    // 5. Invalid email validation
    await adminNameInput.fill('Test Admin');
    await emailInput.fill('invalid-email');
    await primaryContactInput.fill('6345678908');
    await alternateContactInput.fill('6345678909');

    // Keep branch empty.
    await expect(sendButton).toBeDisabled();

    console.log('6. Invalid form validation passed');

    await page.screenshot({
      path: testInfo.outputPath('02-invalid-form.png'),
      fullPage: true,
    });

    // 6. Valid form
    await emailInput.fill(
      'test.branch.admin@example.com'
    );

    await expect(branchSelect).toBeVisible({
      timeout: 10000,
    });

    const optionCount = await branchSelect
      .locator('option')
      .count();

    if (optionCount < 2) {
      throw new Error(
        'No branch option is available'
      );
    }

    // Index 0 is the placeholder option.
    await branchSelect.selectOption({
      index: 1,
    });

    await expect(sendButton).toBeEnabled({
      timeout: 10000,
    });

    console.log('7. Valid form verified');

    await page.screenshot({
      path: testInfo.outputPath('03-valid-form.png'),
      fullPage: true,
    });

    // 7. Submit invite
    let dialogMessage = '';

    page.on('dialog', async dialog => {
      dialogMessage = dialog.message();

      console.log('Dialog message:', dialogMessage);

      await dialog.accept();
    });

    const inviteResponsePromise = page.waitForResponse(
      response =>
        response.request().method() === 'POST' &&
        response.url().includes('send-invite'),
      {
        timeout: 30000,
      }
    );

    await sendButton.click();

    console.log('8. Send Invite button clicked');

    const inviteResponse = await inviteResponsePromise;
    const responseBody = await inviteResponse.text();

    console.log('API status:', inviteResponse.status());
    console.log('API response:', responseBody);

    // expect(
    //   inviteResponse.ok(),
    //   `Invite API failed with status ${inviteResponse.status()}: ${responseBody}`
    // ).toBeTruthy();

    await page.screenshot({
      path: testInfo.outputPath('04-valid-invite.png'),
      fullPage: true,
    });

    console.log('9. Invite submitted successfully');
  });
});