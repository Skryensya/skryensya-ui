import { configDefaults, defineConfig } from "vitest/config";

// The pure decisions (geometry.ts) take no DOM input and read no global: plain Node is enough,
// no jsdom needed (unlike charts' own config, which also renders React through its tests).
export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, "dist/**"],
    environment: "node",
  },
});
