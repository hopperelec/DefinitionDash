import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:4173/");
});

test("has title", async ({ page }) => {
  await expect(page.getByText("Definition Dash")).toBeVisible();
});

test("GSI rendered", async ({ page }) => {
  await expect(
    page
      .frameLocator('iframe[title="Sign in with Google Button"]')
      .getByLabel("Continue with Google"),
  ).toBeVisible();
});

test("GSI button navigates", async ({ page }) => {
  test.fixme();
  await page
    .frameLocator('iframe[title="Sign in with Google Button"]')
    .getByLabel("Continue with Google")
    .click();
  await page.waitForURL(
    /https:\/\/accounts.google.com\/v3\/signin\/identifier\?.+/,
  );
  await page.waitForResponse((response) => response.status() === 200);
});
