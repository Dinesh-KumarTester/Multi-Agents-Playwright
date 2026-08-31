import { expect, test } from '@playwright/test';
import { LoginPage } from '../Pages/LoginPage.js';
import { DashboardPage } from '../Pages/DashboardPage.js';
import testdata from '../Data/locators_testdata.json' with { type: 'json' };

export class Impl {
  constructor(page) {
    this.page = page;
    this.loginPage = new LoginPage(page);
    this.dashboardPage = new DashboardPage(page);
  }

  async openLoginPage() {
    await test.step('Open the OrangeHRM login page', async () => {
      await this.page.goto(testdata.URLs.LoginURL);
      await expect(this.page).toHaveURL(testdata.URLs.LoginURL);
      await expect(this.page).toHaveTitle(testdata.Titles.LoginTitle);
    });
  }

  async verifyLoginPage() {
    await test.step('Verify login page elements are visible and ready', async () => {
      await expect(this.loginPage.companyBrandingLogo).toBeVisible();
      await expect(this.loginPage.loginButton).toBeVisible();
      await expect(this.loginPage.loginButton).toBeEnabled();
    });
  }

  async loginWithValidCredentials() {
    await test.step('Log in with the verified Admin credentials', async () => {
      await this.loginPage.usernameInput.fill(testdata.TestData.ValidUsername);
      await this.loginPage.passwordInput.fill(testdata.TestData.ValidPassword);
      await this.loginPage.loginButton.click();
    });
  }

  async verifyDashboard() {
    await test.step('Verify the dashboard loads after a successful login', async () => {
      await this.page.waitForURL(testdata.URLs.DashboardURL);
      await expect(this.page).toHaveURL(testdata.URLs.DashboardURL);
      await expect(this.dashboardPage.userDropdownName).toBeVisible();
      await expect(this.dashboardPage.userDropdownName).toContainText(new RegExp(testdata.Messages.LoggedInUserPattern));
    });
  }
}
