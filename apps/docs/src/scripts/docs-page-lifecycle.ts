import { initComponents } from "@skryensya/vanilla/auto";
import { mountCodePreview } from "@skryensya/vanilla/code-preview";
import { mountComponentPreview } from "@skryensya/vanilla/component-preview";
import { mountIcons } from "@skryensya/vanilla/icon";
import { siteIcons } from "../icons";
import { initCopyButtons } from "./copy-button";
import { initDocsBinding } from "./docs-binding";
import { initLanguageMenu } from "./language-menu";
import { initPrefsSheet } from "./prefs-sheet";
import { initSearchTrigger } from "./search-trigger";
import { initThemeToggle, initThemeTogglePersistence, initThemeToggleSync } from "./theme-toggle";

let bound = false;

async function initRouteDocument(): Promise<void> {
  mountIcons(document, siteIcons);
  const mountedCount = await initComponents(document);
  if (import.meta.env.DEV) {
    window.__skDevtoolsComponentCount = mountedCount;
    window.dispatchEvent(new CustomEvent("sk:devtools-component-count", { detail: mountedCount }));
  }
  mountCodePreview(document);
  mountComponentPreview(document);
  initCopyButtons();
  initThemeToggle();
  initThemeTogglePersistence();
  initThemeToggleSync();
  initDocsBinding();
  initLanguageMenu();
  initSearchTrigger();
  initPrefsSheet();

  if (document.querySelector("[data-docs-copy-cells]")) {
    const { initCopyCells } = await import("./copy-cells");
    initCopyCells();
  }
  if (document.querySelector("[data-sk-hook-playground]")) {
    const { initHookPlayground } = await import("./hook-playground");
    initHookPlayground();
  }
  if (document.querySelector("[data-key], [data-hotkey]")) {
    const { initKeyEcho } = await import("./key-echo");
    initKeyEcho();
  }
  if (document.querySelector("[data-motion-group]")) {
    const { initMotionSpecimens } = await import("./motion-specimens");
    initMotionSpecimens();
  }
  if (document.querySelector("[data-token]")) {
    const { initUsedValues } = await import("./used-values");
    initUsedValues();
  }
  if (document.querySelector(".sk-fx-collapse-header")) {
    const { initCollapseHeaderFallback } = await import("./collapse-header-fallback");
    initCollapseHeaderFallback();
  }
}

/*
 * Every navigation is a plain, full document load now: `<ClientRouter />` was pulled from
 * `Base.astro`, the View Transitions swap felt broken in practice. That makes this a lot simpler
 * than it used to be: no `astro:page-load` re-bind, no `astro:before-swap` root-state mirror or
 * dialog cleanup, because a hard navigation already throws the whole document away and re-runs
 * every script fresh. One call, once, is the whole lifecycle.
 */
export function initDocsPageLifecycle(): void {
  if (bound) return;
  bound = true;

  void initRouteDocument();
}
