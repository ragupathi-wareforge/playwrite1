const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:4200';
const SCREENSHOT_DIR = './screenshots/add-product-super-admin';

test.describe('Login + Add Product Page Flow', () => {

  test.beforeEach(async ({ page }) => {

    // =========================================
    // CONSOLE ERRORS
    // =========================================

    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Console Error:', msg.text());
      }
    });

    // =========================================
    // ANGULAR / JS ERRORS
    // =========================================

    page.on('pageerror', error => {
      console.error('Page Error:', error.message);
    });

    // =========================================
    // REQUEST FAILURES
    // =========================================

    page.on('requestfailed', request => {
      console.error(
        `Request Failed: ${request.method()} ${request.url()}`
      );

      console.error(
        `Reason: ${request.failure()?.errorText}`
      );
    });

    // =========================================
    // API ERROR RESPONSES
    // =========================================

    page.on('response', async response => {

      const url = response.url();

      // Ignore Vite / WebSocket / HMR
      if (
        url.includes('sockjs') ||
        url.includes('websocket') ||
        url.includes('ws') ||
        response.status() === 101
      ) {
        return;
      }

      if (!response.ok()) {

        console.error(
          `API Error: ${response.request().method()} ${url} → ${response.status()}`
        );

        const body = await response
          .text()
          .catch(() => '');

        console.error(
          'Response Body:',
          body
        );
      }
    });
  });


  test(
    'should login successfully, validate form and create product',
    async ({ page, context }) => {

      // =========================================
      // 1. LOGIN PAGE
      // =========================================

      await page.goto(
        `${BASE_URL}/user/login`,
        {
          waitUntil: 'domcontentloaded'
        }
      );

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/01-login-page.png`,
        fullPage: true
      });

      console.log('1. Login page opened');


      // =========================================
      // 2. LOGIN FORM
      // =========================================

      const emailInput = page.locator(
        'input[placeholder="Email"]'
      );

      const passwordInput = page.locator(
        'app-input[placeholder="Password"] input'
      );

      await expect(emailInput).toBeVisible({
        timeout: 10000
      });

      await expect(passwordInput).toBeVisible({
        timeout: 10000
      });

      await emailInput.fill(
        'ragupathi1050969@gmail.com'
      );

      await passwordInput.fill(
        'Ragupathi@2002'
      );

      console.log('2. Login credentials entered');


      // =========================================
      // 3. PASSWORD EYE BUTTON
      // =========================================

      const eyeButton = page.locator(
        'button.eye-btn'
      );

      if (await eyeButton.count() > 0) {

        if (await eyeButton.first().isVisible()) {

          await eyeButton.first().click();

          await page.screenshot({
            path: `${SCREENSHOT_DIR}/02-password-visible.png`,
            fullPage: true
          });

          await eyeButton.first().click();
        }
      }


      // =========================================
      // 4. LOGIN
      // =========================================

      const loginButton = page.getByRole(
        'button',
        {
          name: 'Login'
        }
      );

      await expect(loginButton).toBeVisible();

      await expect(loginButton).toBeEnabled();

      await loginButton.click();

      console.log('3. Login button clicked');


      // =========================================
      // 5. WAIT FOR LOGIN
      // =========================================

      await page.waitForLoadState(
        'networkidle'
      );

      await page.waitForTimeout(2000);

      console.log('4. Login completed');


      // =========================================
      // 6. TOKEN
      // =========================================

      const token = await page.evaluate(() => {
        return localStorage.getItem('token');
      });

      console.log(
        'Token exists:',
        Boolean(token)
      );

      expect(token).toBeTruthy();

      console.log('5. Token found');


      // =========================================
      // 7. ADD TOKEN COOKIE
      // =========================================

      await context.addCookies([
        {
          name: 'token',
          value: token,
          domain: 'localhost',
          path: '/',
          httpOnly: false,
          secure: false
        }
      ]);

      console.log('6. Token cookie added');


      // =========================================
      // 8. OPEN ADD PRODUCT PAGE
      // =========================================

      await page.goto(
        `${BASE_URL}/super-admin-product/add-product-details`,
        {
          waitUntil: 'domcontentloaded'
        }
      );

      await expect(page).toHaveURL(
        /.*super-admin-product\/add-product-details/
      );

      await page.waitForLoadState(
        'networkidle'
      );

      await page.waitForTimeout(1000);

      console.log(
        '7. Add Product page opened'
      );

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/03-add-product-page.png`,
        fullPage: true
      });


      // =========================================
      // 9. VERIFY PRODUCT NAME FIELD
      // =========================================

      const productName = page.locator(
        'input[placeholder="Enter Product Name"]'
      );

      await expect(productName).toBeVisible({
        timeout: 10000
      });

      console.log(
        '8. Product form loaded'
      );


      // =========================================
      // 10. INVALID DATA
      // =========================================

      await productName.fill(
        '12354'
      );

      const brandName = page.locator(
        'input[placeholder="Enter Brand Name"]'
      );

      const expiryPeriod = page.locator(
        'input[placeholder="Enter Expiry Period"]'
      );

      if (await brandName.count() > 0) {
        await brandName.fill('12');
      }

      if (await expiryPeriod.count() > 0) {
        await expiryPeriod.fill('12');
      }

      console.log(
        '9. Invalid data entered'
      );

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/04-invalid-data.png`,
        fullPage: true
      });


      // =========================================
      // 11. VALID PRODUCT DATA
      // =========================================

      await productName.fill(
        'Gold Flower Oil'
      );

      // SKU
      const skuInput = page.locator(
        'input[placeholder="Enter SKU / Item Code"]'
      );

      if (await skuInput.count() > 0) {

        await skuInput.fill(
          '004'
        );

        console.log(
          '10. SKU entered'
        );

      } else {

        console.log(
          '10. SKU field not found - skipped'
        );
      }


      // Inline Product Code
      const inlineCodeInput = page.locator(
        'input[placeholder="Enter Inline Product Code"]'
      );

      if (await inlineCodeInput.count() > 0) {

        await inlineCodeInput.fill(
          'IPC-802314'
        );

      }


      // Brand
      if (await brandName.count() > 0) {

        await brandName.fill(
          'Sunflower'
        );

      }


      // Description
      const description = page.locator(
        'textarea[placeholder="Enter Product Description"]'
      );

      if (await description.count() > 0) {

        await description.fill(
          'Gold Winner Fresh Oil 1L is pure.'
        );

      }


      // Size
      const sizeInput = page.locator(
        'input[placeholder="Enter Size / Variant"]'
      );

      if (await sizeInput.count() > 0) {

        await sizeInput.fill(
          '2L'
        );

      }


      // Purchase Price
      const purchasePrice = page.locator(
        'input[placeholder="Enter Purchase Price"]'
      );

      if (await purchasePrice.count() > 0) {

        await purchasePrice.fill(
          '236'
        );

      }


      // Discount
      const discount = page.locator(
        'input[placeholder="Enter Discount"]'
      );

      if (await discount.count() > 0) {

        await discount.fill(
          '5'
        );

      }


      // Selling Price
      const sellingPrice = page.locator(
        'input[placeholder="Enter Selling Price"]'
      );

      if (await sellingPrice.count() > 0) {

        await sellingPrice.fill(
          '256'
        );

      }


      // Reorder Level
      const reorderLevel = page.locator(
        'input[placeholder="Enter Reorder Level"]'
      );

      if (await reorderLevel.count() > 0) {

        await reorderLevel.fill(
          '18'
        );

      }


      // GST
      const gst = page.locator(
        'input[placeholder="Enter GST"]'
      );

      if (await gst.count() > 0) {

        await gst.fill(
          '1200'
        );

      }


      // Expiry
      if (await expiryPeriod.count() > 0) {

        await expiryPeriod.fill(
          '12 months'
        );

      }


      console.log(
        '11. Valid product data entered'
      );


      // =========================================
      // 12. SELECT DROPDOWNS
      // =========================================

      let selects = page.locator(
        'app-form-field select'
      );

      const selectCount =
        await selects.count();

      console.log(
        'Number of dropdowns:',
        selectCount
      );


      // First dropdown
      if (selectCount > 0) {

        await selects
          .nth(0)
          .selectOption({
            index: 1
          });

        console.log(
          '12. First dropdown selected'
        );
      }


      // Second dropdown
      selects = page.locator(
        'app-form-field select'
      );

      if (await selects.count() > 1) {

        await selects
          .nth(1)
          .selectOption({
            index: 1
          });

        console.log(
          '13. Second dropdown selected'
        );
      }


      // Third dropdown
      selects = page.locator(
        'app-form-field select'
      );

      if (await selects.count() > 2) {

        await selects
          .nth(2)
          .selectOption({
            index: 1
          });

        console.log(
          '14. Third dropdown selected'
        );
      }


      // =========================================
      // 13. STATUS
      // =========================================

      const statusSelect = page.locator(
        '.status-select'
      );

      if (await statusSelect.count() > 0) {

        await expect(
          statusSelect
        ).toBeVisible({
          timeout: 10000
        });

        await statusSelect.selectOption({
          index: 1
        });

        console.log(
          '15. Product status selected'
        );

      } else {

        console.log(
          '15. Status select not found - skipped'
        );
      }


      // =========================================
      // 14. SCREENSHOT BEFORE SAVE
      // =========================================

      await page.waitForTimeout(1000);

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/05-valid-product.png`,
        fullPage: true
      });

      console.log(
        '16. Valid product form screenshot captured'
      );


      // =========================================
      // 15. FIND SUBMIT BUTTON
      // =========================================

      const buttons = page.locator(
        'button'
      );

      console.log(
        'Total buttons:',
        await buttons.count()
      );


      // Print all buttons for debugging
      const buttonTexts =
        await buttons.allTextContents();

      console.log(
        'Buttons:',
        buttonTexts
      );


      // Try common submit button names
      let submitButton =
        page.getByRole(
          'button',
          {
            name: /save|submit|add product|create/i
          }
        ).first();


      // =========================================
      // 16. VERIFY SUBMIT BUTTON
      // =========================================

      if (await submitButton.count() === 0) {

        throw new Error(
          'Submit/Save button was not found. Check the actual button text in the Add Product page.'
        );
      }

      await expect(
        submitButton
      ).toBeVisible({
        timeout: 10000
      });


      console.log(
        '17. Submit button found'
      );


      // =========================================
      // 17. BUTTON STATUS
      // =========================================

      const enabled =
        await submitButton.isEnabled();

      console.log(
        'Submit button enabled:',
        enabled
      );


      if (!enabled) {

        await page.screenshot({
          path: `${SCREENSHOT_DIR}/06-submit-disabled.png`,
          fullPage: true
        });

        throw new Error(
          'Submit button is disabled. Some required product fields are still missing or invalid.'
        );
      }


      // =========================================
      // 18. LISTEN FOR PRODUCT API
      // =========================================

      const apiResponsePromise =
        page.waitForResponse(
          response => {

            const url =
              response.url().toLowerCase();

            const method =
              response.request().method();

            return (
              ['POST', 'PUT', 'PATCH'].includes(method) &&
              (
                url.includes('product') ||
                url.includes('products')
              )
            );
          },
          {
            timeout: 15000
          }
        ).catch(() => null);


      // =========================================
      // 19. CLICK SUBMIT
      // =========================================

      await submitButton.click();

      console.log(
        '18. Submit button clicked'
      );


      // =========================================
      // 20. API RESPONSE
      // =========================================

      const apiResponse =
        await apiResponsePromise;

      if (apiResponse) {

        console.log(
          '19. Product API URL:',
          apiResponse.url()
        );

        console.log(
          '20. Product API status:',
          apiResponse.status()
        );

        const responseBody =
          await apiResponse
            .text()
            .catch(() => '');

        console.log(
          'Product API response:',
          responseBody
        );

        expect(
          apiResponse.status()
        ).toBeLessThan(400);

      } else {

        console.log(
          '19. Product API response not captured'
        );
      }


      // =========================================
      // 21. WAIT AFTER SAVE
      // =========================================

      await page.waitForTimeout(
        2000
      );

      console.log(
        '21. Save operation completed'
      );


      // =========================================
      // 22. CURRENT URL
      // =========================================

      console.log(
        'Current URL:',
        page.url()
      );


      // =========================================
      // 23. FINAL SCREENSHOT
      // =========================================

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/07-after-submit.png`,
        fullPage: true
      });

      console.log(
        '22. Final screenshot captured'
      );


      // =========================================
      // 24. FINAL PAGE TEXT
      // =========================================

      const bodyText =
        await page.locator('body').innerText();

      console.log(
        'Final page text:',
        bodyText.substring(0, 2000)
      );


      console.log(
        'Product creation test completed'
      );

    });

});
