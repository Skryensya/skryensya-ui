import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Local runs only: the shared-page fixtures (fixtures.ts) already collapse most of the resource
  // cost, so this just keeps a hard ceiling on concurrent Chromium processes on a dev machine.
  // CI keeps Playwright's own default (unset here), untouched deliberately, for now.
  workers: process.env.CI ? undefined : 4,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://localhost:4180", trace: "retain-on-failure" },
  webServer: {
    command: "vite",
    url: "http://localhost:4180",
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
  },
});
