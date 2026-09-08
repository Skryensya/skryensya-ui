import { svelte } from "@sveltejs/vite-plugin-svelte";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  // The plugin compiles the `.svelte` files (the machine-backed enhancers) in the tests, the same way
  // Vite will on the site. The machine-less enhancers are still pure `.ts`.
  plugins: [svelte()],
  // In test, resolve Svelte to its browser build: without the `browser` condition, `mount()` falls back
  // to the server build and throws `lifecycle_function_unavailable`. Only under VITEST, so the rest of
  // the resolution is not altered.
  resolve: process.env.VITEST ? { conditions: ["browser"] } : undefined,
  test: {
    exclude: [...configDefaults.exclude, "dist/**"],
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    /*
     * The same as in `packages/react/vitest.config.ts`, and for the same reason: the full reasoning with
     * the measurements is there. This package's enhancers drive the SAME Zag machines (shared from
     * `core/machines`) behind the same `raf` + `raf` + `setTimeout(0)` chains, so they run exactly the
     * same risk.
     *
     * It is set here even though this package has not failed yet: it is not that it is immune, it is
     * that the run where React fell over happened to hit it at a less loaded moment. Waiting for it to
     * happen before fixing it is waiting for the red to show up at a worse time.
     */
    testTimeout: 15_000,
  },
});
