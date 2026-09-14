/*
 * EVERYTHING THE CHROME NEEDS AT RUNTIME, which is less than it looks.
 *
 * NO `initComponents()`. The docs shell mounts every `[data-sk-*]` in the DOCUMENT, which is right
 * for a site whose pages are authored markup, and is a hazard here: this page's body is one React
 * island, and a vanilla enhancer reaching into a subtree React owns is how a preview goes silently
 * blank. The chrome below is a link, a link and a button, so there is no enhancer to run at all -
 * the one piece of behaviour it has is the theme toggle, which is docs-local logic (decision 33: no
 * published contract owns that markup any more) and binds itself by attribute.
 *
 * The icons ARE mounted, and only inside the header: `mountIcons` fills the `[data-sk-icon]`
 * placeholders the markup writes, which is the no-build path this kit documents. Scoped to the
 * element rather than the document for the same reason as above - the island draws its own icons,
 * with its own set, and nothing out here should be walking into it.
 */
import { mountIcons } from "@skryensya/vanilla/icon";
import {
  initThemeToggle,
  initThemeTogglePersistence,
  initThemeToggleSync,
} from "../../../docs/src/scripts/theme-toggle";
import { toolIcons } from "../icons";

export function initToolChrome(): void {
  const chrome = document.querySelector<HTMLElement>("[data-playground-chrome]");
  if (!chrome) return;

  mountIcons(chrome, toolIcons);

  /*
   * Cycle on click, remember the choice, and follow a change made in another tab. The third is not
   * decoration here: the reader arrives from the docs in another tab, and a tool that keeps showing
   * light while the site beside it went dark reads as a different product.
   */
  initThemeToggle();
  initThemeTogglePersistence();
  initThemeToggleSync();
}
