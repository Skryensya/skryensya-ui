import { defineConfig } from "vitest/config";

/*
 * Node, not jsdom: what is tested here is the PURE half of the contract, the functions both bindings
 * call and neither owns. The DOM-touching helpers beside them (`bindAnchor`, `applyColorMode`,
 * `readStore`) are exercised where they run, in @skryensya/react and @skryensya/vanilla.
 */
export default defineConfig({
  test: { include: ["src/**/*.test.ts"] },
});
