import { test, expect } from "@playwright/test";

// Uses the session saved by auth.setup.ts — no login steps needed.
test.describe("Logged-in session", () => {
  test("user lands on the app already signed in", async ({ page }) => {
    await page.goto("/");

    const nav = page.locator("nav.navbar");
    await expect(nav.getByRole("link", { name: "Settings" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "New Article" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Sign in" })).toBeHidden();
  });

  test("protected Settings page opens directly", async ({ page }) => {
    await page.goto("/settings");

    await expect(page).toHaveURL("/settings");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Your Settings",
    );
  });
});
