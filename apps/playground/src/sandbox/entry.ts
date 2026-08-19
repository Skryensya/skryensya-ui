/*
 * WHAT THE SANDBOX'S VANILLA EXAMPLES IMPORT.
 *
 * A re-export and nothing else: the sandbox's script tag makes the same two calls a no-build
 * consumer makes (`initComponents()`, then `mountIcons(root, set)`), so the example teaches the real
 * API rather than a convenience wrapper invented for it.
 *
 * The icon SET travels with them, and that is why this file lives here in the site rather than in
 * `@skryensya/vanilla`: choosing a set is an install decision the kit refuses to make for anyone
 * (decision 15), so the consumer has to be the one exporting it. It briefly did live in the package,
 * and that package's own type check is what said so — it could not resolve an icon set it has no
 * business depending on.
 *
 * Bundled by `scripts/build-sandbox-bundles.mjs` into the file the sandbox imports.
 */
export { initComponents } from "@skryensya/vanilla/auto";
export { mountIcons, remountIcons } from "@skryensya/vanilla/icon";
export { destroyMount } from "@skryensya/vanilla/runtime";
export { phosphorIcons } from "@skryensya/icons-phosphor";
