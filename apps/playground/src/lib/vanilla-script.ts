/**
 * The Vanilla script, one file of its own beside the document.
 *
 * The same two calls for every example, so it is a constant rather than something emitted: mount
 * every authored [data-sk-*] root, then bind an icon set. Which set is the consumer's choice, which is
 * why it is passed and not assumed. A file and not an inline `<script>` so the editor shows the
 * example the way a no-build consumer would lay it out: the markup in one tab, the JavaScript in the
 * next.
 *
 * IT IMPORTS WHAT AN APPLICATION IMPORTS. These three specifiers are the ones a consumer writes in
 * their own project, and they are the ones the installation page teaches. The sandbox used to import
 * `./skryensya-vanilla.js`, a file that exists only here: code that could not be copied out, in a
 * tool whose whole claim is that this code runs. The React side already made this trade (the kit is
 * mounted under `/node_modules/@skryensya/react/`, see `reactPackageFiles`), and this is the same
 * decision on the other binding, taken the way a no-build page has to take it: an import map.
 */
export const vanillaScriptPath = "/main.js";
export const vanillaScriptSource = `import { initComponents } from "@skryensya/vanilla/auto";
import { mountIcons } from "@skryensya/vanilla/icon";
import { phosphorIcons } from "@skryensya/icons-phosphor";

await initComponents();
mountIcons(document, phosphorIcons);
`;

/**
 * The kit's real specifiers, resolved for a page with no bundler.
 *
 * An import map is the platform's own answer to "this bare specifier lives at this URL", and it is a
 * real answer for a real consumer too: a no-build page can ship exactly this and import
 * `@skryensya/vanilla/auto` in a plain `<script type="module">`. So the alias is not a sandbox trick
 * that has to be explained away; it is the no-build install, written out.
 *
 * THREE SPECIFIERS, ONE FILE, because the sandbox is handed ONE bundle: `src/sandbox/entry.ts`
 * re-exports all three (`initComponents`, `mountIcons`, `phosphorIcons`) and
 * `build-sandbox-bundles.mjs` inlines it into a single module, for the reason that file gives (the
 * registry's dynamic imports would otherwise become sixty sibling chunks nothing can fetch). The
 * browser loads that module once and every specifier resolves into the same instance.
 */
export const vanillaBundlePath = "/skryensya-vanilla.js";
export const vanillaImportMap = {
  imports: {
    "@skryensya/vanilla": `.${vanillaBundlePath}`,
    "@skryensya/vanilla/auto": `.${vanillaBundlePath}`,
    "@skryensya/vanilla/icon": `.${vanillaBundlePath}`,
    "@skryensya/vanilla/runtime": `.${vanillaBundlePath}`,
    "@skryensya/icons-phosphor": `.${vanillaBundlePath}`,
  },
} as const;
