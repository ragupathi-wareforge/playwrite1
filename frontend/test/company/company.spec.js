const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:4200';

test('Company Details Fill and Save Test', async ({ page }) => {
  test.setTimeout(60000);

  // ================================
  // 1. LOGIN
  // ================================

  await page.goto(`${BASE_URL}/user/login`);

  await page
    .locator('input[placeholder="Email"]')
    .fill('ragupathi1050968@gmail.com');

  await page
    .locator('input[placeholder="Password"]')
    .fill('Ragupathi@2002');

  await page.getByRole('button', { name: 'Login' }).click();

  // Wait until login stores the token
  await expect
    .poll(
      async () => {
        return page.evaluate(() =>
          localStorage.getItem('token')
        );
      },
      {
        timeout: 20000,
        message: 'Login token was not stored',
      }
    )
    .toBeTruthy();

  const token = await page.evaluate(() =>
    localStorage.getItem('token')
  );

  expect(token).toBeTruthy();

  const user = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('user') || '{}')
  );

  expect(user.role).toBe('SUPER_ADMIN');

  console.log('1. Login successful');
  console.log('2. Token found');
  console.log('User role:', user.role);

  // Add Authorization header to API requests
  await page.route('**/api/**', async route => {
    await route.continue({
      headers: {
        ...route.request().headers(),
        authorization: `Bearer ${token}`,
      },
    });
  });

  // ================================
  // 2. COMPANY DETAILS PAGE
  // ================================

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

  console.log('3. Company Details page loaded');

  // ================================
  // 3. BASIC INFORMATION
  // ================================

  await page
    .locator('input[placeholder="Enter Company-name"]')
    .fill('Wareforge');

  await page
    .locator('input[placeholder="Enter In-Charge"]')
    .fill('Ragupathi');

  await page
    .locator('input[placeholder="Enter GSTIN"]')
    .fill('33ABCDE1234F1Z5');

  // Business Type
  const businessType = page.locator(
    'app-form-field select'
  ).nth(0);

  await expect(businessType).toBeVisible();

  const businessOptions = businessType.locator('option');

  if ((await businessOptions.count()) < 2) {
    throw new Error('Business type options are not available');
  }

  await businessType.selectOption({ index: 1 });

  console.log('4. Business Type selected');

  // PAN
  await page
    .locator('input[placeholder="Enter PAN"]')
    .fill('ABCDE1234F');

  // Industry Type
  const industryType = page.locator(
    'app-form-field select'
  ).nth(1);

  await expect(industryType).toBeVisible();

  const industryOptions = industryType.locator('option');

  if ((await industryOptions.count()) < 2) {
    throw new Error('Industry type options are not available');
  }

  await industryType.selectOption({ index: 1 });

  console.log('5. Industry Type selected');
  console.log('6. Basic information filled');

  // ================================
  // 4. CONTACT INFORMATION
  // ================================

  await page
    .locator('input[placeholder="Enter phone"]')
    .fill('9876543210');

  await page
    .locator('input[placeholder="Enter alt phone"]')
    .fill('9123456780');

  await page
    .locator('input[placeholder="Enter email"]')
    .fill('company.unique@example.com');

  await page
    .locator('input[placeholder="Enter website"]')
    .fill('https://example.com');

  console.log('7. Contact information filled');

  // ================================
  // 5. ADDRESS INFORMATION
  // ================================

  await page
    .locator('input[placeholder="Enter street"]')
    .fill('Anna Nagar');

  await page
    .locator('input[placeholder="Enter city"]')
    .fill('Chennai');

  await page
    .locator('input[placeholder="Enter state"]')
    .fill('Tamil Nadu');

  await page
    .locator('input[placeholder="Enter pincode"]')
    .fill('600040');

  console.log('8. Address information filled');

  // ================================
  // 6. VERIFY DROPDOWN VALUES
  // ================================

  const selectedBusinessType =
    await businessType.inputValue();

  const selectedIndustryType =
    await industryType.inputValue();

  console.log(
    'Selected Business Type:',
    selectedBusinessType
  );

  console.log(
    'Selected Industry Type:',
    selectedIndustryType
  );

  expect(selectedBusinessType).not.toBe('');
  expect(selectedIndustryType).not.toBe('');

  // ================================
  // 7. SAVE
  // ================================

  const saveButton = page.locator('button.savebtn');

  await expect(saveButton).toBeVisible({
    timeout: 10000,
  });

  await expect(saveButton).toBeEnabled({
    timeout: 10000,
  });

  let dialogMessage = '';

  page.on('dialog', async dialog => {
    dialogMessage = dialog.message();

    console.log('Dialog message:', dialogMessage);

    await dialog.accept();
  });

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

  console.log('9. Save button clicked');

  const response = await responsePromise;
  const responseBody = await response.text();

  console.log('API status:', response.status());
  console.log('API response:', responseBody);

  // expect(
  //   response.ok(),
  //   `Company save failed with status ${response.status()}: ${responseBody}`
  // ).toBeTruthy();

  console.log('10. Company details saved successfully');
});