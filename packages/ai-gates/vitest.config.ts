import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

/*
 * ONLY `*.test.ts`. This package holds two runners: Playwright over `*.spec.ts` (the browser
 * gates) and vitest over `*.test.ts` (the deterministic ones that need no browser). Vitest's
 * default `include` would collect the Playwright specs too and fail on their fixtures, so the two
 * patterns are split explicitly, here and in `playwright.config.ts`.
 *
 * The Svelte plugin and the `browser` condition are here for the same reasons
 * `packages/vanilla/vitest.config.ts` gives: the machine-backed enhancers are `.svelte`, and
 * without the browser condition Svelte resolves to its server build and `mount()` throws
 * `lifecycle_function_unavailable`. `vanilla-conformance.test.ts` mounts real enhancers, so it
 * needs both.
 */
export default defineConfig({
  plugins: [svelte()],
  resolve: process.env.VITEST ? { conditions: ["browser"] } : undefined,
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
