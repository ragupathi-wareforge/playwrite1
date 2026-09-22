const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:4200';

test.describe('Forgot Password Flow', () => {
  test.setTimeout(60000);

  test('Forgot password validation and OTP verification', async ({
    page,
  }, testInfo) => {
    // =========================================
    // 1. OPEN LOGIN PAGE
    // =========================================

    await page.goto(`${BASE_URL}/user/login`);

    const emailInput = page.locator(
      'input[placeholder="Email"]'
    );

    await expect(emailInput).toBeVisible({
      timeout: 10000,
    });

    await page.screenshot({
      path: testInfo.outputPath('01-login-page.png'),
      fullPage: true,
    });

    // =========================================
    // 2. OPEN FORGOT PASSWORD FORM
    // =========================================

    await page.getByText('Forgot Password?', {
      exact: true,
    }).click();

    await expect(
      page.getByRole('heading', {
        name: 'Reset Your Password!',
      })
    ).toBeVisible({
      timeout: 10000,
    });

    const resetEmailInput = page.locator(
      'input[placeholder="Email"]'
    );

    const submitButton = page.locator(
      'button.submit-btn'
    );

    // =========================================
    // 3. EMPTY EMAIL VALIDATION
    // =========================================

    await resetEmailInput.fill('');
    await submitButton.click();

    await expect(
      page.getByText('Email is required.', {
        exact: true,
      })
    ).toBeVisible({
      timeout: 5000,
    });

    console.log('1. Empty email validation passed');

    await page.screenshot({
      path: testInfo.outputPath('02-empty-email.png'),
      fullPage: true,
    });

    // =========================================
    // 4. INVALID EMAIL FORMAT
    // =========================================

    await resetEmailInput.fill('invalid-email');
    await submitButton.click();

    await expect(
      page.getByText('Enter a valid email.', {
        exact: true,
      })
    ).toBeVisible({
      timeout: 5000,
    });

    console.log('2. Invalid email validation passed');

    await page.screenshot({
      path: testInfo.outputPath('03-invalid-email.png'),
      fullPage: true,
    });

    // =========================================
    // 5. USER NOT FOUND
    // =========================================

    await resetEmailInput.fill('wrong@email.com');

    const notFoundResponsePromise = page.waitForResponse(
      response =>
        response.request().method() === 'POST' &&
        response.url().includes('/api/users/resend-otp'),
      {
        timeout: 20000,
      }
    );

    await submitButton.click();

    const notFoundResponse = await notFoundResponsePromise;
    const notFoundBody = await notFoundResponse.text();

    console.log(
      'User not found status:',
      notFoundResponse.status()
    );

    console.log(
      'User not found response:',
      notFoundBody
    );

    expect(notFoundResponse.status()).toBe(404);

    await expect(
      page.getByText('User not found', {
        exact: true,
      })
    ).toBeVisible({
      timeout: 10000,
    });

    console.log('3. User not found validation passed');

    // =========================================
    // 6. VALID REGISTERED EMAIL
    // =========================================

    // This email must exist in the database.
    const validEmail = 'ragupathi1050969@gmail.com';

    await resetEmailInput.fill(validEmail);

    const resendResponsePromise = page.waitForResponse(
      response =>
        response.request().method() === 'POST' &&
        response.url().includes('/api/users/resend-otp'),
      {
        timeout: 20000,
      }
    );

    await submitButton.click();

    const resendResponse = await resendResponsePromise;
    const resendBody = await resendResponse.text();

    console.log(
      'Valid email OTP status:',
      resendResponse.status()
    );

    console.log(
      'Valid email OTP response:',
      resendBody
    );

    expect(
      resendResponse.ok(),
      `Resend OTP failed: ${resendResponse.status()} - ${resendBody}`
    ).toBeTruthy();

    await expect(page).toHaveURL(
      /\/user\/forgot-password/,
      {
        timeout: 20000,
      }
    );

    await expect(
      page.getByRole('heading', {
        name: 'Verify Your Email To Get Started!',
      })
    ).toBeVisible({
      timeout: 10000,
    });

    console.log('4. OTP page opened');

    await page.screenshot({
      path: testInfo.outputPath('04-otp-page.png'),
      fullPage: true,
    });

    // =========================================
    // 7. OTP LOCATORS
    // =========================================

    const otpInputs = page.locator(
      '.otp-input-container input'
    );

    await expect(otpInputs).toHaveCount(6);

    const fillOtp = async otp => {
      if (!/^\d{6}$/.test(otp)) {
        throw new Error(
          'OTP must contain exactly 6 digits'
        );
      }

      for (let index = 0; index < 6; index++) {
        await otpInputs
          .nth(index)
          .fill(otp[index]);
      }
    };

    const verifyButton = page.getByRole('button', {
      name: 'Verify & Continue',
    });

    // =========================================
    // 8. LESS THAN 6-DIGIT OTP
    // =========================================

    await fillOtp('123000');

    await otpInputs.nth(3).fill('');
    await otpInputs.nth(4).fill('');
    await otpInputs.nth(5).fill('');

    await verifyButton.click();

    await expect(
      page.getByText('Enter 6-digit OTP', {
        exact: true,
      })
    ).toBeVisible({
      timeout: 5000,
    });

    console.log('5. OTP length validation passed');

    await page.screenshot({
      path: testInfo.outputPath('05-invalid-otp-length.png'),
      fullPage: true,
    });

    // =========================================
    // 9. WRONG OTP
    // =========================================

    await fillOtp('111111');

    const wrongOtpResponsePromise = page.waitForResponse(
      response =>
        response.request().method() === 'POST' &&
        response.url().includes('/api/users/verify-otp'),
      {
        timeout: 20000,
      }
    );

    await verifyButton.click();

    const wrongOtpResponse = await wrongOtpResponsePromise;
    const wrongOtpBody = await wrongOtpResponse.text();

    console.log(
      'Wrong OTP status:',
      wrongOtpResponse.status()
    );

    console.log(
      'Wrong OTP response:',
      wrongOtpBody
    );

    expect(wrongOtpResponse.ok()).toBeFalsy();

    await expect(
      page.getByText('Invalid code, please try again', {
        exact: true,
      })
    ).toBeVisible({
      timeout: 10000,
    });

    console.log('6. Wrong OTP validation passed');

    await page.screenshot({
      path: testInfo.outputPath('06-wrong-otp.png'),
      fullPage: true,
    });

    // =========================================
    // 10. RESEND OTP
    // =========================================

    // const resendAgainResponsePromise = page.waitForResponse(
    //   response =>
    //     response.request().method() === 'POST' &&
    //     response.url().includes('/api/users/resend-otp'),
    //   {
    //     timeout: 20000,
    //   }
    // );

    // await page.getByText('Resend OTP', {
    //   exact: true,
    // }).click();

    // const resendAgainResponse =
    //   await resendAgainResponsePromise;

    // const resendAgainBody =
    //   await resendAgainResponse.text();

    // console.log(
    //   'Resend again status:',
    //   resendAgainResponse.status()
    // );

    // console.log(
    //   'Resend again response:',
    //   resendAgainBody
    // );

    // expect(
    //   resendAgainResponse.ok(),
    //   `Resend OTP failed: ${resendAgainResponse.status()} - ${resendAgainBody}`
    // ).toBeTruthy();

    // console.log('7. OTP resent successfully');

    // await page.screenshot({
    //   path: testInfo.outputPath('07-resend-otp.png'),
    //   fullPage: true,
    // });

    // // =========================================
    // // 11. VERIFY CORRECT OTP
    // // =========================================

    // const correctOtp = process.env.FORGOT_PASSWORD_OTP;

    // if (!correctOtp) {
    //   throw new Error(
    //     'Set FORGOT_PASSWORD_OTP to the OTP received by email'
    //   );
    // }

    // await fillOtp(correctOtp);

    // const verifyResponsePromise = page.waitForResponse(
    //   response =>
    //     response.request().method() === 'POST' &&
    //     response.url().includes('/api/users/verify-otp'),
    //   {
    //     timeout: 20000,
    //   }
    // );

    // await verifyButton.click();

    // const verifyResponse = await verifyResponsePromise;
    // const verifyBody = await verifyResponse.text();

    // console.log(
    //   'Correct OTP status:',
    //   verifyResponse.status()
    // );

    // console.log(
    //   'Correct OTP response:',
    //   verifyBody
    // );

    // expect(
    //   verifyResponse.ok(),
    //   `OTP verification failed: ${verifyResponse.status()} - ${verifyBody}`
    // ).toBeTruthy();

    // await expect(page).toHaveURL(
    //   /\/user\/reset-password\?resetSuccess=true/,
    //   {
    //     timeout: 20000,
    //   }
    // );

    // console.log('8. Forgot password flow completed successfully');

    // await page.screenshot({
    //   path: testInfo.outputPath('08-success.png'),
    //   fullPage: true,
    // });
  });
});