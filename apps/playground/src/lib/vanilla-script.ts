/**
 * The Vanilla script, one file of its own beside the document.
 *
 * The same two calls for every example, so it is a constant rather than something emitted: mount
 * every authored [data-sk-*] root, then bind an icon set. Which set is the consumer's choice, which is
 * why it is passed and not assumed. A file and not an inline `<script>` so the editor shows the
 * example the way a no-build consumer would lay it out: the markup in one tab, the JavaScript in the
 * next.
 */
export const vanillaScriptPath = "/main.js";
export const vanillaScriptSource = `import { initComponents, mountIcons, phosphorIcons } from "./skryensya-vanilla.js";

await initComponents();
mountIcons(document, phosphorIcons);
`;
