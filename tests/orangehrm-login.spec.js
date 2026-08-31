import { test } from '@playwright/test';
import { Impl } from '../implementation/impl.js';

test.describe('OrangeHRM login flow', () => {
  let impl;

  test.beforeEach(async ({ page }) => {
    impl = new Impl(page);
  });

  test('log in with valid Admin credentials and lands on dashboard', async () => {
    await impl.openLoginPage();
    await impl.verifyLoginPage();
    await impl.loginWithValidCredentials();
    await impl.verifyDashboard();
  });
});
