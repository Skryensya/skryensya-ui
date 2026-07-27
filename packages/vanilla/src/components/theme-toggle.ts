import {
  applyColorMode,
  colorModeLabel,
  isColorMode,
  nextColorMode,
  readColorMode,
  themeToggleAttrs,
  themeToggleEvents,
  type ColorMode,
  type ThemeToggleChangeDetail,
} from "@skryensya/core/theme-toggle";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

const rootSelector = `[${themeToggleAttrs.root}]`;

type Cleanup = () => void;

function labelsFrom(root: HTMLElement): Partial<Record<ColorMode, string>> {
  return {
    system: root.getAttribute(themeToggleAttrs.labelSystem) ?? undefined,
    light: root.getAttribute(themeToggleAttrs.labelLight) ?? undefined,
    dark: root.getAttribute(themeToggleAttrs.labelDark) ?? undefined,
  };
}

function paintToggle(root: HTMLButtonElement, mode: ColorMode): void {
  root.setAttribute("data-scheme", mode);
  root.setAttribute("aria-label", colorModeLabel(mode, labelsFrom(root)));
}

/** Binds one authored ThemeToggle: cycles color mode on `<html>` and paints the button. */
export function connectThemeToggle(root: HTMLElement): Cleanup {
  if (!(root instanceof HTMLButtonElement)) {
    throw new Error(`ThemeToggle root [${themeToggleAttrs.root}] must be a <button>.`);
  }

  const target = document.documentElement;
  const sync = () => paintToggle(root, readColorMode(target));

  const authored = root.getAttribute("data-scheme");
  if (isColorMode(authored) && !target.hasAttribute("data-scheme")) {
    applyColorMode(target, authored);
  }
  sync();

  const onClick = () => {
    // Always read from `<html>` so peers that already advanced the mode cycle from there.
    const next = nextColorMode(readColorMode(target));
    applyColorMode(target, next);
    root.dispatchEvent(
      new CustomEvent<ThemeToggleChangeDetail>(themeToggleEvents.change, {
        bubbles: true,
        detail: { value: next },
      }),
    );
  };

  // Every instance re-paints from the document when any toggle (including this one) cycles.
  const onChange = () => sync();
  document.addEventListener(themeToggleEvents.change, onChange);

  root.addEventListener("click", onClick);
  return () => {
    root.removeEventListener("click", onClick);
    document.removeEventListener(themeToggleEvents.change, onChange);
  };
}

export const mountThemeToggle = createConnectMount({
  key: "theme-toggle",
  rootSelector,
  connect: connectThemeToggle,
});
