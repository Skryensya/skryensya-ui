import { defineConfig } from "vitest/config";

/*
 * Node, not jsdom: what is tested here is the PURE half of the contract, the functions both bindings
 * call and neither owns.
 *
 * The DOM-touching helpers beside them are a different matter, and the honest version is narrower
 * than this comment used to claim. `readStore` is genuinely covered, here and in
 * @skryensya/vanilla. `bindAnchor` is covered only indirectly: no test names it, but Menu, Select
 * and Tooltip call it and those have vanilla tests. `applyColorMode` is covered by NOTHING: its
 * only callers are the docs site and the eval viewer, and neither runs a test over them. Four more
 * helpers reach globals with no seam at all (`copy-button`'s clipboard path, `hotkey`'s
 * `detectMac`, `stat`'s `requestAnimationFrame` and `matchMedia`), which makes them untestable in
 * this runner by construction rather than by neglect.
 */
export default defineConfig({
  test: { include: ["src/**/*.test.ts"] },
});
