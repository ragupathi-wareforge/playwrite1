// const { test, expect } = require('@playwright/test');

// const BASE_URL = 'http://localhost:4200';
// const INVENTORY_ID = '1';

// test.describe('Branch Admin Reserved Quantity Update', () => {
//   test.setTimeout(60000);

//   test('Increase Reserved Quantity by 5 and save', async ({ page }) => {
//     // =========================================
//     // 1. LOGIN
//     // =========================================

//     await page.goto(`${BASE_URL}/user/login`);

//     await page
//       .locator('input[placeholder="Email"]')
//       .fill('ragupathic45@gmail.com');

//     await page
//       .locator('input[placeholder="Password"]')
//       .fill('Ragupathi@2002');

//     await page.getByRole('button', { name: 'Login' }).click();

//     await expect
//       .poll(
//         () =>
//           page.evaluate(() =>
//             localStorage.getItem('token')
//           ),
//         {
//           timeout: 20000,
//           message: 'Login token was not stored',
//         }
//       )
//       .toBeTruthy();

//     const token = await page.evaluate(() =>
//       localStorage.getItem('token')
//     );

//     expect(token).toBeTruthy();

//     const user = await page.evaluate(() =>
//       JSON.parse(localStorage.getItem('user') || '{}')
//     );

//     expect(user.role).toBe('BRANCH_ADMIN');

//     console.log('1. Branch Admin login successful');
//     console.log('2. Token found');

//     // =========================================
//     // 2. ADD AUTHORIZATION HEADER
//     // =========================================

//     await page.route('**/api/**', async route => {
//       await route.continue({
//         headers: {
//           ...route.request().headers(),
//           authorization: `Bearer ${token}`,
//         },
//       });
//     });

//     console.log('3. Authorization header configured');

//     // =========================================
//     // 3. OPEN INVENTORY DETAILS
//     // =========================================

//     await page.goto(
//       `${BASE_URL}/branch-admin-stock/view-stock-details/${INVENTORY_ID}`
//     );

//     await expect(page).toHaveURL(
//       /\/branch-admin-stock\/view-stock-details\/\d+/,
//       { timeout: 20000 }
//     );

//     await expect(
//       page.getByText('Stock & Pricing Overview', {
//         exact: true,
//       })
//     ).toBeVisible({
//       timeout: 20000,
//     });

//     console.log('4. Inventory details page opened');

//     // =========================================
//     // 4. READ CURRENT RESERVED QUANTITY
//     // =========================================

//     const reservedQuantityText = page
//       .locator('.stock-field')
//       .filter({
//         hasText: 'Reserved Quantity',
//       })
//       .locator('.field-value')
//       .first();

//     await expect(reservedQuantityText).toBeVisible({
//       timeout: 10000,
//     });

//     const currentReservedText =
//       await reservedQuantityText.innerText();

//     const currentReservedQuantity = Number(
//       currentReservedText.replace(/[^\d.-]/g, '')
//     );

//     expect(Number.isFinite(currentReservedQuantity)).toBeTruthy();

//     const expectedReservedQuantity =
//       currentReservedQuantity + 5;

//     console.log(
//       'Current Reserved Quantity:',
//       currentReservedQuantity
//     );

//     console.log(
//       'Expected Reserved Quantity:',
//       expectedReservedQuantity
//     );

//     // =========================================
//     // 5. OPEN RESERVED QUANTITY ACTION
//     // =========================================

//     const addReservedButton = page.getByRole('button', {
//       name: 'Add reserved quantity',
//     });

//     await expect(addReservedButton).toBeVisible({
//       timeout: 10000,
//     });

//     await addReservedButton.click();

//     await expect(
//       page.getByRole('heading', {
//         name: 'Update Reserved Stock',
//       })
//     ).toBeVisible({
//       timeout: 10000,
//     });

//     console.log('5. Reserved Quantity action opened');

//     // =========================================
//     // 6. ENTER CURRENT QUANTITY + 5
//     // =========================================

//     const reservedInput = page.locator(
//       '#reserved-quantity'
//     );

//     await expect(reservedInput).toBeVisible({
//       timeout: 10000,
//     });

//     await reservedInput.fill(
//       String(expectedReservedQuantity)
//     );

//     await expect(reservedInput).toHaveValue(
//       String(expectedReservedQuantity)
//     );

//     console.log(
//       '6. Reserved Quantity +5 value entered'
//     );

//     // =========================================
//     // 7. SAVE RESERVED QUANTITY
//     // =========================================

//     const saveReservedButton = page.locator(
//       'button.reserved-save-btn'
//     );

//     await expect(saveReservedButton).toBeVisible({
//       timeout: 10000,
//     });

//     await expect(saveReservedButton).toBeEnabled({
//       timeout: 10000,
//     });

//     const reserveResponsePromise = page.waitForResponse(
//       response =>
//         response.request().method() === 'PATCH' &&
//         response.url().includes(
//           '/api/inventory/reserve-stock'
//         ),
//       {
//         timeout: 30000,
//       }
//     );

//     await saveReservedButton.click();

//     console.log('7. Reserved Quantity Save clicked');

//     const reserveResponse =
//       await reserveResponsePromise;

//     const responseBody =
//       await reserveResponse.text();

//     console.log(
//       'Reserve API status:',
//       reserveResponse.status()
//     );

//     console.log(
//       'Reserve API response:',
//       responseBody
//     );

//     expect(
//       reserveResponse.ok(),
//       `Reserved stock update failed: ${reserveResponse.status()} - ${responseBody}`
//     ).toBeTruthy();

//     // =========================================
//     // 8. VERIFY SUCCESS MESSAGE
//     // =========================================

//     await expect(
//       page.getByText(
//         'Reserved stock updated successfully.',
//         { exact: true }
//       )
//     ).toBeVisible({
//       timeout: 10000,
//     });

//     console.log(
//       '8. Reserved stock success message displayed'
//     );

//     // =========================================
//     // 9. VERIFY UPDATED VALUE
//     // =========================================

//     await expect
//       .poll(
//         async () => {
//           const updatedText =
//             await reservedQuantityText.innerText();

//           return Number(
//             updatedText.replace(/[^\d.-]/g, '')
//           );
//         },
//         {
//           timeout: 15000,
//           message:
//             'Reserved Quantity was not updated to current value + 5',
//         }
//       )
//       .toBe(expectedReservedQuantity);

//     console.log(
//       '9. Reserved Quantity updated successfully:',
//       expectedReservedQuantity
//     );
//   });
// });


const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:4200';

const INVENTORY_ID = process.env.INVENTORY_ID || '5';

test.describe('Branch Admin Reserved Quantity Update', () => {
  test.setTimeout(60000);

  test('Increase Reserved Quantity by 5 and save', async ({ page }) => {
    // 1. Login
    await page.goto(`${BASE_URL}/user/login`);

    await page.locator('input[placeholder="Email"]').fill(
      'ragupathic45@gmail.com'
    );

    await page.locator('input[placeholder="Password"]').fill(
      'Ragupathi@2002'
    );

    await page.getByRole('button', { name: 'Login' }).click();

    await expect
      .poll(
        () => page.evaluate(() => localStorage.getItem('token')),
        { timeout: 20000 }
      )
      .toBeTruthy();

    const token = await page.evaluate(() =>
      localStorage.getItem('token')
    );

    const user = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('user') || '{}')
    );

    expect(user.role).toBe('BRANCH_ADMIN');

    console.log('1. Branch Admin login successful');

    // 2. Add Authorization header
    await page.route('**/api/**', async route => {
      await route.continue({
        headers: {
          ...route.request().headers(),
          authorization: `Bearer ${token}`,
        },
      });
    });

    // 3. Open inventory details
    await page.goto(
      `${BASE_URL}/branch-admin-stock/view-stock-details/${INVENTORY_ID}`
    );

    await expect(
      page.getByText('Stock & Pricing Overview', { exact: true })
    ).toBeVisible({ timeout: 20000 });

    console.log('2. Inventory details page opened');

    // 4. Read current values
    const currentStockValue = page
      .locator('.stock-field')
      .filter({ hasText: 'Current Stock' })
      .locator('.field-value')
      .first();

    const reservedValue = page
      .locator('.stock-field')
      .filter({ hasText: 'Reserved Quantity' })
      .locator('.field-value')
      .first();

    const currentStock = Number(
      (await currentStockValue.innerText()).replace(/[^\d.-]/g, '')
    );

    const currentReserved = Number(
      (await reservedValue.innerText()).replace(/[^\d.-]/g, '')
    );

    const totalStock = currentStock + currentReserved;
    const expectedReserved = currentReserved + 5;

    console.log('Current stock:', currentStock);
    console.log('Current reserved:', currentReserved);
    console.log('Total stock:', totalStock);
    console.log('Expected reserved:', expectedReserved);

    if (totalStock < expectedReserved) {
      throw new Error(
        `Inventory ${INVENTORY_ID} has only ${totalStock} total stock. ` +
        `At least ${expectedReserved} total stock is required to reserve +5.`
      );
    }

    // 5. Open Reserved Quantity action
    await page.getByRole('button', {
      name: 'Add reserved quantity',
    }).click();

    await expect(
      page.getByRole('heading', {
        name: 'Update Reserved Stock',
      })
    ).toBeVisible();

    // 6. Enter current reserved + 5
    const reservedInput = page.locator(
      '#reserved-quantity'
    );

    await reservedInput.fill(
      String(expectedReserved)
    );

    await expect(reservedInput).toHaveValue(
      String(expectedReserved)
    );

    // 7. Save
    const saveButton = page.locator(
      'button.reserved-save-btn'
    );

    const reserveResponsePromise = page.waitForResponse(
      response =>
        response.request().method() === 'PATCH' &&
        response.url().includes('/api/inventory/reserve-stock'),
      { timeout: 30000 }
    );

    await saveButton.click();

    const response = await reserveResponsePromise;
    const responseBody = await response.text();

    console.log('Reserve API status:', response.status());
    console.log('Reserve API response:', responseBody);

    expect(
      response.ok(),
      `Reserve update failed: ${response.status()} - ${responseBody}`
    ).toBeTruthy();

    await expect(
      page.getByText(
        'Reserved stock updated successfully.',
        { exact: true }
      )
    ).toBeVisible({ timeout: 10000 });

    // 8. Verify updated quantity
    await expect
      .poll(
        async () => {
          const text = await reservedValue.innerText();
          return Number(text.replace(/[^\d.-]/g, ''));
        },
        { timeout: 15000 }
      )
      .toBe(expectedReserved);

    console.log(
      `Reserved Quantity updated from ${currentReserved} to ${expectedReserved}`
    );
  });
});