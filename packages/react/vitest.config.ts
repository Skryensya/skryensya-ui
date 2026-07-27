import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, "dist/**"],
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
  },
});
