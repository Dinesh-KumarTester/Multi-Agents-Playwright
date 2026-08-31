export class LoginPage {
  constructor(page) {
    this.page = page;

    this.companyBrandingLogo = page.locator('img[alt="company-branding"]');
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }
}
