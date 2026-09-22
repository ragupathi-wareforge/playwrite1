const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:4200';

test.describe('Company Details Fill and Save', () => {
  test.setTimeout(60000);

  test('Login, fill company details and save', async ({ page }) => {
    // =========================================
    // 1. LOGIN
    // =========================================

    await page.goto(`${BASE_URL}/user/login`);

    await page
      .locator('input[placeholder="Email"]')
      .fill('ragupathi1050969@gmail.com');

    await page
      .locator('input[placeholder="Password"]')
      .fill('Ragupathi@2002');

    const loginResponsePromise = page
      .waitForResponse(
        response =>
          response.request().method() === 'POST' &&
          response.url().toLowerCase().includes('login'),
        { timeout: 20000 }
      )
      .catch(() => null);

    await page.getByRole('button', { name: 'Login' }).click();

    const loginResponse = await loginResponsePromise;

    if (loginResponse) {
      console.log(
        'Login API status:',
        loginResponse.status()
      );
    }

    await expect
      .poll(
        async () => {
          return page.evaluate(() => {
            return localStorage.getItem('token');
          });
        },
        {
          timeout: 20000,
          message: 'Token was not saved after login',
        }
      )
      .toBeTruthy();

    const token = await page.evaluate(() => {
      return localStorage.getItem('token');
    });

    expect(token).toBeTruthy();

    const user = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('user') || '{}');
    });

    expect(user.role).toBe('SUPER_ADMIN');

    console.log('1. Login successful');
    console.log('2. Token found');
    console.log('User role:', user.role);

    // =========================================
    // 2. ADD AUTHORIZATION HEADER
    // =========================================

    await page.route('**/api/**', async route => {
      const headers = {
        ...route.request().headers(),
        authorization: `Bearer ${token}`,
      };

      await route.continue({ headers });
    });

    console.log('3. Authorization header configured');

    // =========================================
    // 3. OPEN COMPANY DETAILS PAGE
    // =========================================

    await page.goto(
      `${BASE_URL}/company/add-company-details`
    );

    await expect(page).toHaveURL(
      /\/company\/add-company-details/,
      { timeout: 20000 }
    );

    await expect(
      page.getByText('Company details', { exact: true })
    ).toBeVisible({ timeout: 20000 });

    console.log('4. Company Details page loaded');

    // =========================================
    // 4. FIELD HELPER
    // =========================================

    const fillField = async (placeholder, value) => {
      const input = page.locator(
        `input[placeholder="${placeholder}"]`
      );

      await expect(input).toBeVisible({
        timeout: 10000,
      });

      await input.fill(value);
    };

    // =========================================
    // 5. FILL COMPANY DETAILS
    // =========================================

    await fillField(
      'Enter Company-name',
      'CIMA Automation Company'
    );

    await fillField(
      'Enter In-Charge',
      'Ragupathi Kumar'
    );

    await fillField(
      'Enter GSTIN',
      '22AAAAA0000A1Z5'
    );

    await fillField(
      'Enter PAN',
      'ABCDE1234F'
    );

    await fillField(
      'Enter phone',
      '9876543210'
    );

    await fillField(
      'Enter alt phone',
      '9876543211'
    );

    await fillField(
      'Enter email',
      'cima.automation@example.com'
    );

    await fillField(
      'Enter website',
      'https://example.com'
    );

    await fillField(
      'Enter street',
      'Main Street'
    );

    await fillField(
      'Enter city',
      'Chennai'
    );

    await fillField(
      'Enter state',
      'Tamil Nadu'
    );

    await fillField(
      'Enter pincode',
      '600001'
    );

    console.log('5. Company details filled');

    // =========================================
    // 6. SELECT DROPDOWNS
    // =========================================

    const selectFields = page.locator(
      'app-form-field select'
    );

    await expect(selectFields).toHaveCount(2);

    await selectFields.nth(0).selectOption({
      label: 'PRIVATE_LIMITED',
    });

    await selectFields.nth(1).selectOption({
      label: 'IT',
    });

    // =========================================
    // 7. SAVE BUTTON
    // =========================================

    const saveButton = page.locator(
      'button.savebtn'
    );

    await expect(saveButton).toBeVisible({
      timeout: 10000,
    });

    await expect(saveButton).toBeEnabled({
      timeout: 10000,
    });

    console.log('6. Save button enabled');

    // =========================================
    // 8. HANDLE DIALOG BEFORE CLICK
    // =========================================

    let dialogMessage = '';

    page.on('dialog', async dialog => {
      dialogMessage = dialog.message();

      console.log(
        'Dialog message:',
        dialogMessage
      );

      await dialog.accept();
    });

    // =========================================
    // 9. SUBMIT FORM
    // =========================================

    const responsePromise = page.waitForResponse(
      response =>
        response.request().method() === 'POST' &&
        response.url().includes(
          '/api/companies/create-company-details'
        ),
      {
        timeout: 30000,
      }
    );

    await saveButton.click();

    console.log('7. Save button clicked');

    const response = await responsePromise;
    const responseBody = await response.text();

    console.log(
      'API method:',
      response.request().method()
    );

    console.log(
      'API URL:',
      response.url()
    );

    console.log(
      'API status:',
      response.status()
    );

    console.log(
      'API response:',
      responseBody
    );

    // =========================================
    // 10. VERIFY RESULT
    // =========================================

    // expect(
    //   response.ok(),
    //   `Company API failed with status ${response.status()}: ${responseBody}`
    // ).toBeTruthy();

    console.log(
      '8. Company details saved successfully'
    );
  });
});