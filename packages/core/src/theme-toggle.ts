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
