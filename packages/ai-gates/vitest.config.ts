import { defineConfig } from "vitest/config";

/*
 * ONLY `*.test.ts`. This package holds two runners: Playwright over `*.spec.ts` (the browser
 * gates) and vitest over `*.test.ts` (the deterministic ones that need no browser). Vitest's
 * default `include` would collect the Playwright specs too and fail on their fixtures, so the two
 * patterns are split explicitly, here and in `playwright.config.ts`.
 */
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
