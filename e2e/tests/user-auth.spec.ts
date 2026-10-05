import { test, expect } from "@playwright/test";
import { createUserViaApi } from "../helpers/api";
import { generateUser } from "../helpers/test-data";

// These flows start as a guest, so skip the saved login session.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Registration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sign up");
  });

  test("new user can sign up and is logged in", async ({ page }) => {
    const user = generateUser();

    await page.getByPlaceholder("Username").fill(user.username);
    await page.getByPlaceholder("Email").fill(user.email);
    await page.getByPlaceholder("Password").fill(user.password);
    await page.locator("form").getByRole("button").click();

    await expect(page).toHaveURL("/");
    const nav = page.locator("nav.navbar");
    await expect(nav.locator(`a[href="/profile/${user.username}"]`)).toHaveText(
      user.username,
    );
    await expect(nav.getByRole("link", { name: "New Article" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Settings" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Sign in" })).toBeHidden();
    await expect(nav.getByRole("link", { name: "Sign up" })).toBeHidden();
    const token = await page.evaluate(() => localStorage.getItem("jwtToken"));
    expect(token).toBeTruthy();
  });

  test("shows an error when the email is already taken", async ({
    page,
    request,
  }) => {
    const existing = await createUserViaApi(request, generateUser());

    await page.getByPlaceholder("Username").fill(generateUser().username);
    await page.getByPlaceholder("Email").fill(existing.email);
    await page.getByPlaceholder("Password").fill(existing.password);
    await page.locator("form").getByRole("button").click();

    await expect(page.locator("ul.error-messages li")).toHaveText([
      "email has already been taken",
    ]);
    await expect(page).toHaveURL("/register");
    await expect(
      page.locator("nav.navbar").getByRole("link", { name: "Sign in" }),
    ).toBeVisible();
  });

  test("shows an error when the username is already taken", async ({
    page,
    request,
  }) => {
    const existing = await createUserViaApi(request, generateUser());

    await page.getByPlaceholder("Username").fill(existing.username);
    await page.getByPlaceholder("Email").fill(generateUser().email);
    await page.getByPlaceholder("Password").fill(existing.password);
    await page.locator("form").getByRole("button").click();

    await expect(page.locator("ul.error-messages li")).toHaveText([
      "username has already been taken",
    ]);
    await expect(page).toHaveURL("/register");
    await expect(
      page.locator("nav.navbar").getByRole("link", { name: "Sign in" }),
    ).toBeVisible();
  });

  test("Sign up button is disabled until all fields are filled", async ({
    page,
  }) => {
    const user = generateUser();
    const signUpButton = page.locator("form").getByRole("button");

    await expect(signUpButton).toBeDisabled();
    await page.getByPlaceholder("Username").fill(user.username);
    await expect(signUpButton).toBeDisabled();
    await page.getByPlaceholder("Email").fill(user.email);
    await expect(signUpButton).toBeDisabled();
    await page.getByPlaceholder("Password").fill(user.password);
    await expect(signUpButton).toBeEnabled();
  });

  test('"Have an account?" link navigates to login', async ({ page }) => {
    await page.getByRole("link", { name: "Have an account?" }).click();

    await expect(page).toHaveURL("/login");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sign in");
    await expect(page.getByPlaceholder("Username")).toBeHidden();
  });
});

test.describe("Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sign in");
  });

  test("registered user can sign in", async ({ page, request }) => {
    const user = await createUserViaApi(request, generateUser());

    await page.getByPlaceholder("Email").fill(user.email);
    await page.getByPlaceholder("Password").fill(user.password);
    await page.locator("form").getByRole("button").click();

    await expect(page).toHaveURL("/");
    const nav = page.locator("nav.navbar");
    await expect(nav.locator(`a[href="/profile/${user.username}"]`)).toHaveText(
      user.username,
    );
    await expect(nav.getByRole("link", { name: "Settings" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Sign in" })).toBeHidden();
  });

  test("shows an error for a wrong password", async ({ page, request }) => {
    const user = await createUserViaApi(request, generateUser());

    await page.getByPlaceholder("Email").fill(user.email);
    await page.getByPlaceholder("Password").fill("wrong-password");
    await page.locator("form").getByRole("button").click();

    await expect(page.locator("ul.error-messages li")).toHaveText([
      "email or password is invalid",
    ]);
    await expect(page).toHaveURL("/login");
    await expect(
      page.locator("nav.navbar").getByRole("link", { name: "Sign in" }),
    ).toBeVisible();
  });

  test("shows an error for an unregistered email", async ({ page }) => {
    const user = generateUser();

    await page.getByPlaceholder("Email").fill(user.email);
    await page.getByPlaceholder("Password").fill(user.password);
    await page.locator("form").getByRole("button").click();

    await expect(page.locator("ul.error-messages li")).toHaveText([
      "email or password is invalid",
    ]);
    await expect(page).toHaveURL("/login");
    await expect(
      page.locator("nav.navbar").getByRole("link", { name: "Sign in" }),
    ).toBeVisible();
  });

  test("Sign in button is disabled until email and password are filled", async ({
    page,
  }) => {
    const user = generateUser();
    const emailInput = page.getByPlaceholder("Email");
    const signInButton = page.locator("form").getByRole("button");

    await expect(signInButton).toBeDisabled();
    await emailInput.fill(user.email);
    await expect(signInButton).toBeDisabled();
    await emailInput.clear();
    await page.getByPlaceholder("Password").fill(user.password);
    await expect(signInButton).toBeDisabled();
    await emailInput.fill(user.email);
    await expect(signInButton).toBeEnabled();
  });

  test('"Need an account?" link navigates to register', async ({ page }) => {
    await page.getByRole("link", { name: "Need an account?" }).click();

    await expect(page).toHaveURL("/register");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sign up");
    await expect(page.getByPlaceholder("Username")).toBeVisible();
  });

  test("session persists after a page reload", async ({ page, request }) => {
    const user = await createUserViaApi(request, generateUser());
    const profileLink = page
      .locator("nav.navbar")
      .locator(`a[href="/profile/${user.username}"]`);

    await page.getByPlaceholder("Email").fill(user.email);
    await page.getByPlaceholder("Password").fill(user.password);
    await page.locator("form").getByRole("button").click();
    await expect(profileLink).toHaveText(user.username);

    await page.reload();

    await expect(profileLink).toHaveText(user.username);
  });
});
