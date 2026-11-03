# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: standard-navigation.spec.js >> Standard.com account navigation >> Navigate from the home page through login to account creation
- Location: tests\standard-navigation.spec.js:5:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(page).toHaveTitle(expected) failed

Expected: "The Standard"
Received: ""
Timeout:  15000ms

Call log:
  - Expect "toHaveTitle" with timeout 15000ms
    12 × locator resolved to <html>…</html>
       - unexpected value ""

```

```yaml
- iframe: "Request unsuccessful. Incapsula incident ID: 935000410161021416-100672332672469614"
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | import { StandardHomePage } from '../Pages/StandardHomePage.js';
  3  | import { StandardLoginPage } from '../Pages/StandardLoginPage.js';
  4  | import { StandardCreateAccountPage } from '../Pages/StandardCreateAccountPage.js';
  5  | import { StandardCommon } from '../helpers/standard-common.js';
  6  | import testdata from '../Data/standard-testdata.json' with { type: 'json' };
  7  | 
  8  | export class StandardImpl {
  9  |   constructor(page) {
  10 |     this.page = page;
  11 |     this.homePage = new StandardHomePage(page);
  12 |     this.loginBrowserPage = null;
  13 |     this.loginPage = null;
  14 |     this.createAccountPage = null;
  15 |     this.common = new StandardCommon();
  16 |   }
  17 | 
  18 |   async openHomePage() {
  19 |     await test.step('Open The Standard home page', async () => {
  20 |       await this.page.goto(testdata.urls.home, {
  21 |         waitUntil: 'domcontentloaded',
  22 |         timeout: testdata.timeouts.navigationMs,
  23 |       });
  24 |       await this.common.waitForDocumentReady(this.page);
  25 |       await expect(this.page).toHaveURL(testdata.urls.home, {
  26 |         timeout: testdata.timeouts.assertionMs,
  27 |       });
> 28 |       await expect(this.page).toHaveTitle(testdata.titles.home, {
     |                               ^ Error: expect(page).toHaveTitle(expected) failed
  29 |         timeout: testdata.timeouts.assertionMs,
  30 |       });
  31 |     });
  32 |   }
  33 | 
  34 |   async openLoginPageInNewTab() {
  35 |     await test.step('Open the login page from the home-page header', async () => {
  36 |       await expect(this.homePage.loginLink).toBeVisible({
  37 |         timeout: testdata.timeouts.assertionMs,
  38 |       });
  39 | 
  40 |       const loginPageOpened = this.page.context().waitForEvent('page', {
  41 |         timeout: testdata.timeouts.navigationMs,
  42 |       });
  43 |       await this.homePage.loginLink.click({
  44 |         timeout: testdata.timeouts.assertionMs,
  45 |       });
  46 |       this.loginBrowserPage = await loginPageOpened;
  47 |       this.loginPage = new StandardLoginPage(this.loginBrowserPage);
  48 | 
  49 |       await this.common.waitForDocumentReady(this.loginBrowserPage);
  50 |       await expect(this.loginBrowserPage).toHaveURL(testdata.urls.login, {
  51 |         timeout: testdata.timeouts.assertionMs,
  52 |       });
  53 |       await expect(this.loginBrowserPage).toHaveTitle(testdata.titles.login, {
  54 |         timeout: testdata.timeouts.assertionMs,
  55 |       });
  56 |     });
  57 |   }
  58 | 
  59 |   async openCreateAccountPage() {
  60 |     await test.step('Follow the login page link to account creation', async () => {
  61 |       await expect(this.loginPage.createAccountLink).toBeVisible({
  62 |         timeout: testdata.timeouts.assertionMs,
  63 |       });
  64 | 
  65 |       this.createAccountPage = new StandardCreateAccountPage(this.loginBrowserPage);
  66 |       await Promise.all([
  67 |         this.loginBrowserPage.waitForURL(testdata.urls.createAccount, {
  68 |           waitUntil: 'domcontentloaded',
  69 |           timeout: testdata.timeouts.navigationMs,
  70 |         }),
  71 |         this.loginPage.createAccountLink.click({
  72 |           timeout: testdata.timeouts.assertionMs,
  73 |         }),
  74 |       ]);
  75 | 
  76 |       await this.common.waitForDocumentReady(this.loginBrowserPage);
  77 |       await expect(this.loginBrowserPage).toHaveURL(testdata.urls.createAccount, {
  78 |         timeout: testdata.timeouts.assertionMs,
  79 |       });
  80 |       await expect(this.loginBrowserPage).toHaveTitle(testdata.titles.createAccount, {
  81 |         timeout: testdata.timeouts.assertionMs,
  82 |       });
  83 |       await expect(this.createAccountPage.heading).toContainText(
  84 |         testdata.headings.createAccount,
  85 |         { timeout: testdata.timeouts.assertionMs },
  86 |       );
  87 |     });
  88 |   }
  89 | }
  90 | 
```