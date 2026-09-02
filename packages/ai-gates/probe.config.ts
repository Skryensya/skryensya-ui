import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./probe",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: { baseURL: "https://ui.allison.sh", trace: "off" },
});
