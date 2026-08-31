import { test } from '@playwright/test';
import { Impl } from '../implementation/impl.js';

test.describe('OrangeHRM login flow', () => {
  let impl;

  test.beforeEach(async ({ page }) => {
    impl = new Impl(page);
  });

  test('logs in with valid Admin credentials and lands on dashboard', async () => {

    impl = new Impl(page);
    await impl.openLoginPage();
    await impl.verifyLoginPage();
    await impl.loginWithValidCredentials();
    await impl.verifyDashboard();
  });
});
