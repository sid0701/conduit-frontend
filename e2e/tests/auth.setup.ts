import { test as setup, expect } from "@playwright/test";
import { createUserViaApi } from "../helpers/api";
import { generateUser } from "../helpers/test-data";

// Must match `storageState` in playwright.config.ts.
const AUTH_FILE = "playwright/.auth/user.json";

/**
 * Logs in once through the UI and saves the browser state (incl. the
 * localStorage "jwtToken") so other tests start already signed in.
 *
 * Uses TEST_USER_EMAIL / TEST_USER_PASSWORD when set; otherwise creates a
 * fresh user through the API.
 */
setup("authenticate", async ({ page, request }) => {
  const email = process.env["TEST_USER_EMAIL"];
  const password = process.env["TEST_USER_PASSWORD"];
  const user =
    email && password
      ? { email, password }
      : await createUserViaApi(request, generateUser());

  await page.goto("/login");
  await page.getByPlaceholder("Email").fill(user.email);
  await page.getByPlaceholder("Password").fill(user.password);
  await page.locator("form").getByRole("button").click();

  await expect(page).toHaveURL("/");
  await expect(
    page.locator("nav.navbar").getByRole("link", { name: "Settings" }),
  ).toBeVisible();

  await page.context().storageState({ path: AUTH_FILE });
});
