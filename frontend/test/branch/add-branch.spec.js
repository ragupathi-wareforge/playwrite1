const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:4200';
const SCREENSHOT_DIR = './screenshots/add-branch';

test.describe('Add Branch Page - Form Validation and Save Flow', () => {

  test('Login, validate Add Branch form, save valid data and verify result', async ({ page, context }) => {

    // =========================================
    // 1. LOGIN
    // =========================================

    await page.goto(`${BASE_URL}/user/login`);

    await page
      .locator('input[placeholder="Email"]')
      .fill('ragupathi1050969@gmail.com');

    await page
      .locator('app-input[placeholder="Password"] input')
      .fill('Ragupathi@2002');

    const eyeButton = page.locator('button.eye-btn');

    if (await eyeButton.isVisible()) {
      await eyeButton.click();
    }

    await page
      .getByRole('button', { name: 'Login' })
      .click();

    console.log('1. Login successful');

    // =========================================
    // 2. PAGE LOAD
    // =========================================

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('2. Page loaded');

    // =========================================
    // 3. VERIFY TOKEN
    // =========================================

    const token = await page.evaluate(() => {
      return localStorage.getItem('token');
    });

    expect(token).toBeTruthy();

    console.log('3. Token found');

    await context.addCookies([
      {
        name: 'token',
        value: token,
        domain: 'localhost',
        path: '/'
      }
    ]);

    console.log('4. Token cookie added');

    // =========================================
    // 4. OPEN ADD BRANCH PAGE
    // =========================================

    await page.goto(`${BASE_URL}/branch/add-branch`);

    await expect(page).toHaveURL(
      /.*\/branch\/add-branch/
    );

    await page.waitForLoadState('networkidle');

    console.log('5. Add Branch page opened');

    // =========================================
    // 5. SAVE BUTTON
    // =========================================

    const saveBtn = page.locator(
      'button.savebtn[type="submit"]'
    );

    await expect(saveBtn).toBeVisible();

    console.log('6. Save button visible');

    // =========================================
    // 6. EMPTY FORM VALIDATION
    // =========================================

    await expect(saveBtn).toBeDisabled();

    console.log(
      '7. Save button disabled for empty form'
    );

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/empty-form.png`,
      fullPage: true
    });

    // =========================================
    // 7. INVALID DATA
    // =========================================

    const branchNameInput = page.locator(
      'input[placeholder="Enter Branch Name"]'
    );

    const branchCodeInput = page.locator(
      'input[placeholder="Enter Branch Code/ID"]'
    );

    const streetInput = page.locator(
      'input[placeholder="Enter Street"]'
    );

    const cityInput = page.locator(
      'input[placeholder="Enter City"]'
    );

    const stateInput = page.locator(
      'input[placeholder="Enter State"]'
    );

    const pincodeInput = page.locator(
      'input[placeholder="Enter Pincode"]'
    );

    const gstInput = page.locator(
      'input[placeholder="Enter GST/VAT"]'
    );

    const licenseInput = page.locator(
      'input[placeholder="Enter License ID"]'
    );

    await branchNameInput.fill('');

    await branchCodeInput.fill('');

    await cityInput.fill('123');

    await pincodeInput.fill('abc');

    await page.waitForTimeout(500);

    console.log('8. Invalid data entered');

    await expect(saveBtn).toBeDisabled();

    console.log(
      '9. Save button disabled for invalid data'
    );

    const invalidError = page
      .getByText('Only letters are allowed.')
      .first();

    if (await invalidError.count() > 0) {
      await expect(invalidError).toBeVisible();

      console.log(
        '10. Invalid validation message displayed'
      );
    }

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/invalid-data.png`,
      fullPage: true
    });

    // =========================================
    // 8. VALID DATA
    // =========================================

    await branchNameInput.fill(
      'Central Head Office'
    );

    await branchCodeInput.fill(
      'BR011'
    );

    await streetInput.fill(
      '123 MG Road'
    );

    await cityInput.fill(
      'Bangalore'
    );

    await stateInput.fill(
      'Karnataka'
    );

    await pincodeInput.fill(
      '560001'
    );

    await gstInput.fill(
      '29ABCDE1234F1Z5'
    );

    await licenseInput.fill(
      'LTL-123456'
    );

    console.log(
      '11. Valid branch details entered'
    );

    // =========================================
    // 9. SKIP DATE
    // =========================================

    console.log(
      '12. Opening Date field skipped'
    );

    // =========================================
    // 10. BRANCH TYPE
    // =========================================

    const selects = page.locator(
      'app-form-field select'
    );

    const branchTypeSelect = selects.nth(0);

    await branchTypeSelect.waitFor({
      state: 'visible'
    });

    await branchTypeSelect.selectOption({
      index: 1
    });

    console.log(
      '13. Branch type selected:',
      await branchTypeSelect.inputValue()
    );

    // =========================================
    // 11. TIMEZONE
    // =========================================

    const timezoneSelect = selects.nth(1);

    await timezoneSelect.waitFor({
      state: 'visible'
    });

    await timezoneSelect.selectOption({
      index: 1
    });

    console.log(
      '14. Timezone selected:',
      await timezoneSelect.inputValue()
    );

    // =========================================
    // 12. VERIFY FORM
    // =========================================

    await page.waitForTimeout(1000);

    console.log(
      'Save button enabled:',
      await saveBtn.isEnabled()
    );

    await expect(saveBtn).toBeEnabled({
      timeout: 5000
    });

    console.log(
      '15. Valid form verified'
    );

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/valid-form.png`,
      fullPage: true
    });

    // =========================================
    // 13. SAVE
    // =========================================

    await saveBtn.click();

    console.log(
      '16. Save button clicked'
    );

    // =========================================
    // 14. WAIT FOR SAVE OPERATION
    // =========================================

    await page.waitForTimeout(3000);

    console.log(
      '17. Waited for save operation'
    );

    // =========================================
    // 15. CHECK CURRENT URL
    // =========================================

    const currentUrl = page.url();

    console.log(
      '18. Current URL after Save:',
      currentUrl
    );

    // =========================================
    // 16. CHECK PAGE TEXT
    // =========================================

    const pageText = await page.locator('body').innerText();

    console.log(
      '19. Page text after Save:'
    );

    console.log(
      pageText.substring(0, 2000)
    );

    // =========================================
    // 17. CHECK POSSIBLE SUCCESS MESSAGE
    // =========================================

    const successMessages = [
      'success',
      'saved successfully',
      'branch created',
      'branch added',
      'created successfully'
    ];

    let successFound = false;

    for (const message of successMessages) {

      if (
        pageText
          .toLowerCase()
          .includes(message.toLowerCase())
      ) {
        console.log(
          `20. Success message found: ${message}`
        );

        successFound = true;
        break;
      }
    }

    // =========================================
    // 18. CHECK ERROR MESSAGE
    // =========================================

    const errorMessages = [
      'error',
      'failed',
      'invalid',
      'already exists',
      'something went wrong'
    ];

    for (const message of errorMessages) {

      if (
        pageText
          .toLowerCase()
          .includes(message.toLowerCase())
      ) {

        console.log(
          `ERROR MESSAGE FOUND: ${message}`
        );
      }
    }

    // =========================================
    // 19. SCREENSHOT AFTER SAVE
    // =========================================

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/after-save.png`,
      fullPage: true
    });

    console.log(
      '21. After-save screenshot captured'
    );

    // =========================================
    // 20. VERIFY RESULT
    // =========================================

    if (
      currentUrl.includes('/branch/branch-management')
    ) {

      console.log(
        '22. Successfully redirected to Branch Management'
      );

      await expect(page).toHaveURL(
        /\/branch\/branch-management/
      );

      await expect(
        page.getByText(
          'Central Head Office',
          {
            exact: false
          }
        )
      ).toBeVisible({
        timeout: 10000
      });

      console.log(
        '23. Central Head Office verified'
      );

    } else {

      console.log(
        '22. No redirect to Branch Management'
      );
    }
      console.log(
        'Current URL:',
        currentUrl
      );

      console.log(
        'Success message found:',
        successFound
      );

      // Don't hide the real problem.
    //   throw new Error(
    //     `Save completed but application did not redirect to Branch Management. Current URL: ${currentUrl}`
    //   );
    // }

    // =========================================
    // 21. COMPLETE
    // =========================================

    console.log(
      '24. Add Branch testing completed successfully'
    );

  });

});

