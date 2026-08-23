import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, ".astro/**", "dist/**"],
    environment: "node",
  },
});
