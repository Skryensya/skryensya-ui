/**
 * The Vanilla script, one file of its own beside the document.
 *
 * The same program for every example, so it is a constant rather than something emitted: pull in the
 * kit's stylesheet, then mount every authored [data-sk-*] root with an icon set bound. Which set is
 * the consumer's choice, which is why it is passed and not assumed. A file and not an inline
 * `<script>` so the editor shows the example the way a consumer lays it out: the markup in one tab,
 * the JavaScript in the next.
 *
 * IT IS WHAT AN APPLICATION WRITES, resolved the way an application resolves it. The installation
 * page says the kit is installed with a package manager and consumed through a bundler, and this runs
 * in Sandpack's bundler against the kit mounted under `/node_modules/@skryensya/*`, the same trade the
 * React side makes (see `packageFiles` in `Playground.tsx`). No import map, no file that only exists
 * here: every line can be copied into a Vite project with the kit installed.
 *
 * `mountComponentsWithIcons` rather than `initComponents` + `mountIcons` with a top-level await: it
 * is the kit's own sequence for booting a page (including the second icon pass a Svelte enhancer's
 * late commit needs), and the sandbox compiles to CommonJS, where top-level await does not exist.
 */
export const vanillaScriptPath = "/main.js";
export const vanillaScriptSource = `import "@skryensya/core/skryensya.css";
import { mountComponentsWithIcons } from "@skryensya/vanilla/auto";
import { lucideIcons } from "@skryensya/icons-lucide";

// The page's own scrolling element wears the kit's scrollbar, the same line the documentation's
// shell writes on its <html>. Opt-in by class, which is what the pattern publishes.
document.documentElement.classList.add("sk-scrollbar");

mountComponentsWithIcons(document, lucideIcons);
`;
