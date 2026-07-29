import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
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
