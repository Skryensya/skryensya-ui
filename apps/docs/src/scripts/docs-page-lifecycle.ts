import { initComponents } from "@skryensya/vanilla/auto";
import { mountCodePreview } from "@skryensya/vanilla/code-preview";
import { mountComponentPreview } from "@skryensya/vanilla/component-preview";
import { mountIcons } from "@skryensya/vanilla/icon";
import { destroyMount } from "@skryensya/vanilla/runtime";
import { siteIcons } from "../icons";
import { initCopyButtons } from "./copy-button";
import { initDocsBinding } from "./docs-binding";
import { initSearchTrigger } from "./search-trigger";
import { initThemeToggle, initThemeTogglePersistence, initThemeToggleSync } from "./theme-toggle";

let bound = false;

const rootStateAttrs = [
  "data-js",
  "data-scheme",
  "data-contrast",
  "data-icon-set",
  "data-radius",
  "data-sk-component-preview-pref",
  "data-sk-component-preview-screen-pref",
] as const;

type AstroBeforeSwapEvent = Event & {
  newDocument: Document;
};

function mirrorRootState(event: Event): void {
  const source = document.documentElement;
  const target = (event as AstroBeforeSwapEvent).newDocument?.documentElement;
  if (!target) return;

  for (const attr of rootStateAttrs) {
    const value = source.getAttribute(attr);
    if (value === null) target.removeAttribute(attr);
    else target.setAttribute(attr, value);
  }

  target.style.cssText = source.style.cssText;
}


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
  initSearchTrigger();

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
}

function cleanupRouteDocument(): void {
  for (const dialog of document.querySelectorAll<HTMLDialogElement>("dialog[open]")) {
    dialog.close();
  }
  for (const root of document.querySelectorAll<HTMLElement>("[data-sk-ready]")) {
    destroyMount(root);
  }
}

export function initDocsPageLifecycle(): void {
  if (bound) return;
  bound = true;

  void initRouteDocument();
  document.addEventListener("astro:page-load", () => {
    void initRouteDocument();
  });
  document.addEventListener("astro:before-swap", mirrorRootState);
  document.addEventListener("astro:before-swap", cleanupRouteDocument);
}
