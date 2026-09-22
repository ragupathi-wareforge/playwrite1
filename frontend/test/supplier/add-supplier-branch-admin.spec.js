const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:4200';
const SCREENSHOT_DIR = './screenshots/add-supplier-branch-admin';

test.describe('Login + Add Supplier Page Flow', () => {

  test('should login successfully, validate form, and create supplier', async ({
    page,
    context
  }) => {

    // =========================================================
    // TEST DATA
    // =========================================================

    const LOGIN_EMAIL = 'ragupathi1050969@gmail.com';
    const LOGIN_PASSWORD = 'Ragupathi@2002';

    const ACCESS_TOKEN = 'mocked-access-token';
    const REFRESH_TOKEN = 'mocked-refresh-token';

    const SUPPLIER_NAME = 'Playwright Supplier';
    const SUPPLIER_EMAIL = 'playwright@supplier.com';
    const PRIMARY_CONTACT = '9876543210';
    const ALTERNATE_CONTACT = '6382933135';
    const GSTIN = '29ABCDE1234F1Z2';
    const SUPPLIER_ID = 'SUP102';

    // =========================================================
    // 1. BROWSER CONSOLE LOG
    // =========================================================

    page.on('console', msg => {
      console.log(
        `BROWSER ${msg.type().toUpperCase()}:`,
        msg.text()
      );
    });

    // =========================================================
    // 2. API REQUEST LOG
    // =========================================================

    page.on('request', request => {

      if (request.url().includes('/api/')) {

        console.log(
          'API REQUEST:',
          request.method(),
          request.url()
        );
      }
    });

    // =========================================================
    // 3. API RESPONSE LOG
    // =========================================================

    page.on('response', response => {

      if (response.url().includes('/api/')) {

        console.log(
          'API RESPONSE:',
          response.status(),
          response.url()
        );
      }
    });

    // =========================================================
    // 4. MOCK LOGIN API
    // =========================================================

    await page.route(
      '**/api/users/login',
      async route => {

        console.log(
          'MOCK: Login API'
        );

        await route.fulfill({

          status: 200,

          contentType: 'application/json',

          body: JSON.stringify({

            status: 'success',

            message: 'Login successful',

            data: {

              sessionID: 'mock-session-id',

              user: {

                user: {

                  id: 2,

                  name: 'Sathish',

                  email: LOGIN_EMAIL,

                  role: 'BRANCH_ADMIN'
                },

                accessToken: ACCESS_TOKEN,

                refreshToken: REFRESH_TOKEN,

                refreshTokenExpiry:
                  '2099-12-31T23:59:59.999Z'
              }
            }
          })
        });
      }
    );

    // =========================================================
    // 5. MOCK REFRESH TOKEN API
    // =========================================================

    await page.route(
      '**/api/users/refresh-token',
      async route => {

        let body = {};

        try {

          body =
            route.request().postDataJSON();

        } catch (error) {

          console.log(
            'Unable to parse refresh token body'
          );
        }

        console.log(
          'Refresh token body:',
          body
        );

        const validTokens = [
          REFRESH_TOKEN,
          'new-mocked-refresh-token'
        ];

        if (
          validTokens.includes(
            body && body.refreshToken
          )
        ) {

          await route.fulfill({

            status: 200,

            contentType: 'application/json',

            body: JSON.stringify({

              status: 'success',

              message:
                'Token refreshed successfully',

              data: {

                accessToken:
                  'new-mocked-access-token',

                refreshToken:
                  'new-mocked-refresh-token'
              }
            })
          });

        } else {

          await route.fulfill({

            status: 401,

            contentType: 'application/json',

            body: JSON.stringify({

              status: 'error',

              message:
                'Invalid refresh token'
            })
          });
        }
      }
    );

    // =========================================================
    // 6. MOCK BRANCH ADMIN DETAILS API
    // =========================================================

    await page.route(
      '**/api/branch-admin/view-single-branch-admin-details/**',
      async route => {

        console.log(
          'MOCK: Branch admin details API'
        );

        await route.fulfill({

          status: 200,

          contentType: 'application/json',

          body: JSON.stringify({

            status: 'success',

            data: {

              id: 2,

              name: 'Test Branch Admin',

              email: 'branchadmin@example.com',

              role: 'BRANCH_ADMIN',

              branch: {

                id: 1,

                name: 'Main Branch'
              }
            }
          })
        });
      }
    );

    // =========================================================
    // 7. MOCK GET ALL BRANCHES API
    // =========================================================

    await page.route(
      '**/api/branches/get-all-branches-details',
      async route => {

        console.log(
          'MOCK: Get all branches API'
        );

        await route.fulfill({

          status: 200,

          contentType: 'application/json',

          body: JSON.stringify({

            status: 'success',

            data: [

              {
                id: 1,
                name: 'Main Branch'
              },

              {
                id: 2,
                name: 'Secondary Branch'
              }
            ]
          })
        });
      }
    );

    // =========================================================
    // 8. MOCK CREATE SUPPLIER API
    // =========================================================

    let supplierRequestPayload = null;

    await page.route(
      '**/api/suppliers/create-supplier-details',
      async route => {

        console.log(
          'MOCK: Create supplier API'
        );

        try {

          supplierRequestPayload =
            route.request().postDataJSON();

          console.log(
            'Supplier request payload:',
            JSON.stringify(
              supplierRequestPayload,
              null,
              2
            )
          );

        } catch (error) {

          console.log(
            'Unable to parse supplier request'
          );
        }

        await route.fulfill({

          status: 201,

          contentType: 'application/json',

          body: JSON.stringify({

            status: 'success',

            message:
              'Supplier created successfully',

            data: {

              id: 1,

              branch_id: 2,

              supplier_name:
                SUPPLIER_NAME,

              supplier_code:
                SUPPLIER_ID,

              gstin_tax_id:
                GSTIN,

              business_type:
                'SOLE_PROPRIETORSHIP',

              category:
                'Textiles',

              status:
                'ACTIVE',

              in_charge_person:
                'Sathish',

              contact_number_primary:
                PRIMARY_CONTACT,

              contact_number_alternative:
                ALTERNATE_CONTACT,

              email_address:
                SUPPLIER_EMAIL,

              street_name:
                'KNR',

              city:
                'Tenkasi',

              state:
                'Tamil Nadu',

              pincode:
                '627811',

              country:
                'India',

              bank_name:
                'HDFC',

              payment_method:
                'BANK_TRANSFER',

              upi_id:
                'abd@upi',

              account_number_or_iban:
                '12345678904321',

              ifsc_or_swift_code:
                'HDFC0004321',

              notes:
                'Playwright test supplier',

              createdAt:
                '2026-08-26T07:00:00.000Z',

              updatedAt:
                '2026-08-26T07:00:00.000Z',

              branch: {

                id: 2,

                branch_name:
                  'Central Head Office',

                branch_code:
                  'BR001',

                city:
                  'Bangalore',

                state:
                  'Karnataka',

                status:
                  'ACTIVE'
              },

              branch_admins: [

                {

                  admin_id: 4,

                  admin_name:
                    'Perison',

                  email:
                    'sneka1703@gmail.com',

                  contact_number:
                    PRIMARY_CONTACT
                }
              ]
            }
          })
        });
      }
    );

    // =========================================================
    // 9. LOGIN PAGE
    // =========================================================

    await page.goto(
      `${BASE_URL}/user/login`,
      {
        waitUntil: 'networkidle'
      }
    );

    await page.screenshot({

      path:
        `${SCREENSHOT_DIR}/01-login-page.png`,

      fullPage: true
    });

    console.log(
      '1. Login page opened'
    );

    // =========================================================
    // 10. LOGIN LOCATORS
    // =========================================================

    const loginEmailInput =
      page.locator(
        'input[placeholder="Email"]'
      );

    const loginPasswordInput =
      page.locator(
        'app-input[placeholder="Password"] input'
      );

    const eyeButton =
      page.locator(
        'button.eye-btn'
      );

    const loginButton =
      page.getByRole(
        'button',
        {
          name: 'Login'
        }
      );

    // =========================================================
    // 11. VERIFY LOGIN FORM
    // =========================================================

    await expect(
      loginEmailInput
    ).toBeVisible({
      timeout: 10000
    });

    await expect(
      loginPasswordInput
    ).toBeVisible({
      timeout: 10000
    });

    // =========================================================
    // 12. FILL LOGIN
    // =========================================================

    await loginEmailInput.fill(
      LOGIN_EMAIL
    );

    await loginPasswordInput.fill(
      LOGIN_PASSWORD
    );

    if (
      await eyeButton.isVisible()
    ) {

      await eyeButton.click();
    }

    await page.screenshot({

      path:
        `${SCREENSHOT_DIR}/02-login-filled.png`,

      fullPage: true
    });

    console.log(
      '2. Login details entered'
    );

    // =========================================================
    // 13. LOGIN API RESPONSE
    // =========================================================

    const loginResponsePromise =
      page.waitForResponse(

        response =>

          response.url().includes(
            '/api/users/login'
          ) &&

          response.request().method() ===
            'POST',

        {
          timeout: 20000
        }
      );

    await loginButton.click();

    const loginResponse =
      await loginResponsePromise;

    expect(
      loginResponse.status()
    ).toBe(200);

    const loginData =
      await loginResponse.json();

    console.log(
      'Login response:',
      loginData
    );

    // =========================================================
    // 14. GET ACCESS TOKEN
    // =========================================================

    const token =
      loginData.data &&
      loginData.data.user &&
      loginData.data.user.accessToken;

    const refreshToken =
      loginData.data &&
      loginData.data.user &&
      loginData.data.user.refreshToken;

    expect(token).toBeTruthy();

    expect(refreshToken).toBeTruthy();

    console.log(
      '3. Access token received'
    );

    // =========================================================
    // 15. STORE TOKEN IN LOCAL STORAGE
    // =========================================================

    await page.evaluate(
      ({ token, refreshToken }) => {

        localStorage.setItem(
          'accessToken',
          token
        );

        localStorage.setItem(
          'refreshToken',
          refreshToken
        );

        // Some applications use token
        localStorage.setItem(
          'token',
          token
        );
      },
      {
        token,
        refreshToken
      }
    );

    console.log(
      '4. Tokens stored in localStorage'
    );

    // =========================================================
    // 16. ADD TOKEN COOKIE
    // =========================================================

    await context.addCookies([

      {

        name: 'token',

        value: token,

        domain: 'localhost',

        path: '/'
      }

    ]);

    console.log(
      '5. Token cookie added'
    );

    // =========================================================
    // 17. VERIFY LOCAL STORAGE
    // =========================================================

    const storedTokens =
      await page.evaluate(() => {

        return {

          accessToken:
            localStorage.getItem(
              'accessToken'
            ),

          refreshToken:
            localStorage.getItem(
              'refreshToken'
            ),

          token:
            localStorage.getItem(
              'token'
            )
        };
      });

    console.log(
      'Stored tokens:',
      storedTokens
    );

    expect(
      storedTokens.accessToken
    ).toBeTruthy();

    // =========================================================
    // 18. OPEN ADD SUPPLIER PAGE
    // =========================================================

    await page.goto(

      `${BASE_URL}/branch-admin-supplier/add-supplier-details`,

      {
        waitUntil: 'networkidle'
      }
    );

    await expect(
      page
    ).toHaveURL(
      /branch-admin-supplier\/add-supplier-details/
    );

    console.log(
      '6. Add Supplier page opened'
    );

    await page.screenshot({

      path:
        `${SCREENSHOT_DIR}/03-add-supplier-page.png`,

      fullPage: true
    });

    // =========================================================
    // 19. SUPPLIER FORM LOCATORS
    // =========================================================

    const supplierNameInput =
      page.locator(
        'input[placeholder="Enter Supplier Name"]'
      );

    const supplierEmailInput =
      page.locator(
        'input[placeholder="Enter email"]'
      );

    const primaryContactInput =
      page.locator(
        'input[placeholder="Enter Primary Contact Number"]'
      );

    const gstinInput =
      page.locator(
        'input[placeholder="Enter GSTIN / Tax ID"]'
      );

    const supplierIdInput =
      page.locator(
        'input[placeholder="Enter Supplier ID"]'
      );

    const cityInput =
      page.locator(
        'input[placeholder="Enter City"]'
      );

    const stateInput =
      page.locator(
        'input[placeholder="Enter State"]'
      );

    const countryInput =
      page.locator(
        'input[placeholder="Enter Country"]'
      );

    const pincodeInput =
      page.locator(
        'input[placeholder="Enter Pincode"]'
      );

    const inChargeInput =
      page.locator(
        'input[placeholder="Enter In-Charge Person Name"]'
      );

    const streetInput =
      page.locator(
        'input[placeholder="Enter Street Name"]'
      );

    const alternateContactInput =
      page.locator(
        'input[placeholder="Enter Alternate Contact Number"]'
      );

    const bankNameInput =
      page.locator(
        'input[placeholder="Enter Bank Name"]'
      );

    const upiInput =
      page.locator(
        'input[placeholder="Enter UPI ID"]'
      );

    const accountNumberInput =
      page.locator(
        'input[placeholder="Enter Account Number / IBAN"]'
      );

    const ifscInput =
      page.locator(
        'input[placeholder="Enter IFSC / SWIFT Code"]'
      );

    const selects =
      page.locator(
        'app-form-field select'
      );

    const statusSelect =
      page.locator(
        '.status-select'
      );

    // =========================================================
    // 20. SUBMIT BUTTON
    // =========================================================

    const submitButton =
      page.getByRole(
        'button',
        {
          name: /create supplier|add supplier|save|submit/i
        }
      ).first();

    // =========================================================
    // 21. VERIFY SUPPLIER FORM
    // =========================================================

    await expect(
      supplierNameInput
    ).toBeVisible({
      timeout: 10000
    });

    await expect(
      supplierEmailInput
    ).toBeVisible({
      timeout: 10000
    });

    console.log(
      '7. Supplier form loaded'
    );

    // =========================================================
    // 22. EMPTY FORM VALIDATION
    // =========================================================

    await supplierNameInput.fill('');

    await supplierEmailInput.fill('');

    await primaryContactInput.fill('');

    await gstinInput.fill('');

    console.log(
      '8. Empty form prepared'
    );

    if (
      await submitButton.isVisible()
    ) {

      const disabled =
        await submitButton.isDisabled();

      console.log(
        'Submit button disabled:',
        disabled
      );
    }

    await page.screenshot({

      path:
        `${SCREENSHOT_DIR}/04-empty-form.png`,

      fullPage: true
    });

    // =========================================================
    // 23. FILL SUPPLIER BASIC DETAILS
    // =========================================================

    await supplierNameInput.fill(
      SUPPLIER_NAME
    );

    await supplierEmailInput.fill(
      SUPPLIER_EMAIL
    );

    await primaryContactInput.fill(
      PRIMARY_CONTACT
    );

    await gstinInput.fill(
      GSTIN
    );

    console.log(
      '9. Basic supplier details entered'
    );

    // =========================================================
    // 24. SELECT DROPDOWNS
    // =========================================================

    await page.waitForSelector(
      'app-form-field select',
      {
        state: 'visible',
        timeout: 10000
      }
    );

    const totalSelects =
      await selects.count();

    console.log(
      `Found ${totalSelects} select elements`
    );

    for (
      let i = 0;
      i < totalSelects;
      i++
    ) {

      const select =
        selects.nth(i);

      const optionCount =
        await select.locator(
          'option'
        ).count();

      console.log(
        `Dropdown ${i + 1}: ${optionCount} options`
      );

      if (
        optionCount > 1
      ) {

        await select.selectOption({
          index: 1
        });

        console.log(
          `Dropdown ${i + 1} selected`
        );
      }
    }

    // =========================================================
    // 25. STATUS SELECT
    // =========================================================

    if (
      await statusSelect.count() > 0
    ) {

      if (
        await statusSelect.isVisible()
      ) {

        const statusOptions =
          await statusSelect
            .locator('option')
            .count();

        if (
          statusOptions > 1
        ) {

          await statusSelect.selectOption({
            index: 1
          });

          console.log(
            '10. Status selected'
          );
        }
      }
    }

    // =========================================================
    // 26. FILL REMAINING DETAILS
    // =========================================================

    await supplierIdInput.fill(
      SUPPLIER_ID
    );

    await cityInput.fill(
      'Tenkasi'
    );

    await stateInput.fill(
      'Tamil Nadu'
    );

    await countryInput.fill(
      'India'
    );

    await pincodeInput.fill(
      '627811'
    );

    await inChargeInput.fill(
      'ragu'
    );

    await streetInput.fill(
      'KNR'
    );

    await alternateContactInput.fill(
      ALTERNATE_CONTACT
    );

    await bankNameInput.fill(
      'HDFC'
    );

    await upiInput.fill(
      'abd@upi'
    );

    await accountNumberInput.fill(
      '12345678904321'
    );

    await ifscInput.fill(
      'HDFC0004321'
    );

    console.log(
      '11. Complete supplier data entered'
    );

    await page.screenshot({

      path:
        `${SCREENSHOT_DIR}/05-supplier-filled.png`,

      fullPage: true
    });

    // =========================================================
    // 27. WAIT FOR FORM VALIDATION
    // =========================================================

    await page.waitForTimeout(500);

    // =========================================================
    // 28. VERIFY SUBMIT BUTTON
    // =========================================================

    await expect(
      submitButton
    ).toBeVisible({
      timeout: 10000
    });

    const enabled =
      await submitButton.isEnabled();

    console.log(
      'Submit button enabled:',
      enabled
    );

    await expect(
      submitButton
    ).toBeEnabled({
      timeout: 5000
    });

    console.log(
      '12. Valid supplier form verified'
    );

    // =========================================================
    // 29. WAIT FOR SUPPLIER POST
    // =========================================================

    const supplierRequestPromise =
      page.waitForRequest(

        request =>

          request.url().includes(
            '/api/suppliers/create-supplier-details'
          ) &&

          request.method() === 'POST',

        {
          timeout: 30000
        }
      );

    // =========================================================
    // 30. SUBMIT SUPPLIER
    // =========================================================

    await submitButton.click();

    console.log(
      '13. Create Supplier button clicked'
    );

    // =========================================================
    // 31. WAIT FOR POST REQUEST
    // =========================================================

    const supplierRequest =
      await supplierRequestPromise;

    console.log(
      '14. Supplier POST request detected'
    );

    expect(
      supplierRequest.method()
    ).toBe('POST');

    // =========================================================
    // 32. VERIFY REQUEST PAYLOAD
    // =========================================================

    try {

      supplierRequestPayload =
        supplierRequest.postDataJSON();

      console.log(
        'Supplier POST payload:',
        JSON.stringify(
          supplierRequestPayload,
          null,
          2
        )
      );

    } catch (error) {

      console.log(
        'Supplier POST body is not JSON'
      );
    }

    // =========================================================
    // 33. PAYLOAD ASSERTIONS
    // =========================================================

    if (
      supplierRequestPayload
    ) {

      if (
        supplierRequestPayload.supplier_name !==
        undefined
      ) {

        expect(
          supplierRequestPayload.supplier_name
        ).toBe(
          SUPPLIER_NAME
        );
      }

      if (
        supplierRequestPayload.email_address !==
        undefined
      ) {

        expect(
          supplierRequestPayload.email_address
        ).toBe(
          SUPPLIER_EMAIL
        );
      }

      if (
        supplierRequestPayload.contact_number_primary !==
        undefined
      ) {

        expect(
          supplierRequestPayload.contact_number_primary
        ).toBe(
          PRIMARY_CONTACT
        );
      }

      if (
        supplierRequestPayload.gstin_tax_id !==
        undefined
      ) {

        expect(
          supplierRequestPayload.gstin_tax_id
        ).toBe(
          GSTIN
        );
      }
    }

    // =========================================================
    // 34. WAIT FOR UI RESPONSE
    // =========================================================

    await page.waitForTimeout(1000);

    const bodyText =
      await page.locator(
        'body'
      ).innerText();

    console.log(
      'Current page text:',
      bodyText.substring(
        0,
        1500
      )
    );

    // =========================================================
    // 35. CHECK SUCCESS MESSAGE
    // =========================================================

    const successMessages = [

      'Supplier created successfully',

      'Supplier added successfully',

      'created successfully',

      'successfully'
    ];

    const successFound =
      successMessages.some(
        message =>
          bodyText
            .toLowerCase()
            .includes(
              message.toLowerCase()
            )
      );

    console.log(
      'Success message found:',
      successFound
    );

    // =========================================================
    // 36. AFTER SUBMIT SCREENSHOT
    // =========================================================

    await page.screenshot({

      path:
        `${SCREENSHOT_DIR}/06-after-submit.png`,

      fullPage: true
    });

    // =========================================================
    // 37. CURRENT URL
    // =========================================================

    console.log(
      'Current URL:',
      page.url()
    );

    // =========================================================
    // 38. FINAL ASSERTIONS
    // =========================================================

    expect(
      supplierRequestPayload
    ).toBeTruthy();

    expect(
      supplierRequest.url()
    ).toContain(
      '/api/suppliers/create-supplier-details'
    );

    console.log(
      '=========================================='
    );

    console.log(
      'SUCCESS: Supplier creation test completed'
    );

    console.log(
      '=========================================='
    );
  });
});
