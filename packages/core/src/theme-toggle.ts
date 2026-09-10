/*
 * COLOR MODE, the pure dimension: system → light → dark → system.
 *
 * No contract lives here any more (decision 33, reversed): `ThemeToggle` used to be a signature
 * built on these functions plus Icon Toggle faces; now a consumer composes `IconStateButton`
 * itself and calls into this module for the part that IS generic across any app that wants a
 * color-mode control. Reading/writing `data-scheme`, cycling the value, resolving `system`
 * against the OS. WHERE the choice persists is still the app's call (a cookie, a user record on a
 * server); `colorModePreference` below is the declaration for the localStorage case, so an app
 * that takes the default does not hand-roll the slot name and the guard.
 */
import { definePreference, oneOf } from "./storage.js";

export type ColorMode = "system" | "light" | "dark";
/** Light or dark as painted, after resolving `system` against the OS. */
export type Appearance = "light" | "dark";

export const colorModes = ["system", "light", "dark"] as const;
export const appearances = ["light", "dark"] as const;

/**
 * The color mode as a stored preference.
 *
 * `system` is the fallback AND a real value: it means "follow the OS", which is different from "no
 * preference stored", even though the two paint identically. Clearing beats storing `system` when the
 * reader has never chosen.
 */
export const colorModePreference = definePreference<ColorMode>({
  slot: "scheme",
  fallback: "system",
  parse: oneOf(colorModes),
});

export const themeToggleEvents = {
  /** Bubbles from the button after a cycle. `detail.value` is the new ColorMode. */
  change: "sk-theme-toggle-change",
} as const;

/** Default English accessible names; apps override via label attrs or the `labels` React prop. */
export const colorModeLabels: Record<ColorMode, string> = {
  system: "Color mode: system",
  light: "Color mode: light",
  dark: "Color mode: dark",
};

export function colorModeLabel(mode: ColorMode, labels?: Partial<Record<ColorMode, string>>): string {
  return labels?.[mode] ?? colorModeLabels[mode];
}

export function isColorMode(value: string | null | undefined): value is ColorMode {
  return value === "system" || value === "light" || value === "dark";
}

export function isAppearance(value: string | null | undefined): value is Appearance {
  return value === "light" || value === "dark";
}

export function nextColorMode(current: ColorMode): ColorMode {
  return colorModes[(colorModes.indexOf(current) + 1) % colorModes.length]!;
}

export function nextAppearance(current: Appearance): Appearance {
  return current === "light" ? "dark" : "light";
}

/**
 * Collapse a color-mode preference to what actually paints. `light` and `dark` pass through;
 * `system` follows `prefersDark` (pass `matchMedia("(prefers-color-scheme: dark)").matches`).
 */
export function resolveAppearance(mode: ColorMode, prefersDark: boolean): Appearance {
  if (mode === "light" || mode === "dark") return mode;
  return prefersDark ? "dark" : "light";
}

/**
 * Paint the color-mode preference on a root (usually `<html>`): `data-scheme` for chrome
 * glyphs / FOUC, and `style.colorScheme` so `light-dark()` follows.
 */
export function applyColorMode(root: HTMLElement, mode: ColorMode): void {
  root.setAttribute("data-scheme", mode);
  root.style.colorScheme = mode === "system" ? "light dark" : mode;
}

/** Paint light or dark on a root: never `system`. */
export function applyAppearance(root: HTMLElement, mode: Appearance): void {
  root.setAttribute("data-scheme", mode);
  root.style.colorScheme = mode;
}

/** Read light or dark from a root; `system` and missing values resolve against the OS. */
export function readAppearance(root: HTMLElement, prefersDark: boolean): Appearance {
  const value = root.getAttribute("data-scheme");
  if (isAppearance(value)) return value;
  return resolveAppearance(isColorMode(value) ? value : "system", prefersDark);
}

/** Read the preference from a root; missing or unknown → `system`. */
export function readColorMode(root: HTMLElement): ColorMode {
  const value = root.getAttribute("data-scheme");
  return isColorMode(value) ? value : "system";
}

export type ThemeToggleChangeDetail = { value: ColorMode };

/**
 * Call `onChange` whenever the appearance a root actually PAINTS flips, and hand back the
 * unsubscribe.
 *
 * For anything CSS can express this is not needed: `light-dark()` re-resolves on its own and no
 * component has to be told. It exists for the few values a BINDING resolves and writes into the DOM
 * as a literal - `Folder`'s ground is the one in the kit today (`folderGroundFrom`: no rule can ask
 * what colour is behind an element, so the binding samples it). A literal sampled under one scheme
 * is simply wrong under the other, and nothing else would ever come back to fix it: the folder's
 * boxes did not move, so its `ResizeObserver` never fires, and the stale colour sits there until
 * something unrelated resizes the page.
 *
 * BOTH WAYS IN, because a scheme has two sources and either alone leaves a real case broken. The OS
 * preference moves without anything on the page changing (`system`, the default), and an in-page
 * control moves `data-scheme` and `style.color-scheme` without the OS having an opinion at all.
 *
 * DEDUPED ON THE RESOLVED VALUE, which is what makes watching `style` affordable: a root's inline
 * style is shared with everything else an app writes there (this repo's own docs keep `--sk-density`
 * and a brand's bundle on `<html>`), so firing per mutation would redraw every folder on the page
 * for a change no folder can see. Only a flip between light and dark gets through.
 */
export function observeAppearance(root: HTMLElement, onChange: (appearance: Appearance) => void): () => void {
  const view = root.ownerDocument.defaultView;
  /* No DOM to observe with: a server render, or a document detached from any window. Nothing will
     ever change, so the honest subscription is one that costs nothing and unsubscribes cleanly. */
  if (!view) return () => {};

  const media = view.matchMedia?.("(prefers-color-scheme: dark)");
  let current = readAppearance(root, media?.matches ?? false);

  const check = (): void => {
    const next = readAppearance(root, media?.matches ?? false);
    if (next === current) return;
    current = next;
    onChange(next);
  };

  const observer = new view.MutationObserver(check);
  observer.observe(root, { attributes: true, attributeFilter: ["data-scheme", "style"] });
  media?.addEventListener("change", check);

  return () => {
    observer.disconnect();
    media?.removeEventListener("change", check);
  };
}
