import { defineConfig, devices } from "@playwright/test";

/**
 * E2E tests run against the hosted Conduit app by default.
 * Override with BASE_URL (e.g. http://localhost:4200 while `npm start` is running).
 */
export default defineConfig({
  testDir: "./e2e/tests",
  fullyParallel: true,
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 2 : 0,
  workers: process.env["CI"] ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env["BASE_URL"] ?? "https://conduit.bondaracademy.com",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    // Logs in once and saves the session to playwright/.auth/user.json.
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Every test starts signed in; specs that need a guest override this.
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
});
