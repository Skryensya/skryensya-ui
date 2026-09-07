import { configDefaults, defineConfig } from "vitest/config";

/*
 * jsdom, not node: `serialize.ts` takes a `Document` as a parameter rather than reading a global
 * (see its own header comment), so its tests construct one from jsdom explicitly. `schema.ts`/
 * `commands.ts`/`keymap.ts` never touch the DOM at all and would pass under either environment.
 */
export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, "dist/**"],
    environment: "jsdom",
  },
});
