/*
 * THEME TOGGLE, cycles the color-mode dimension: system → light → dark → system.
 *
 * Appearance is CSS (stacked faces on an icon-only button). Applying the mode flips
 * `color-scheme` on a root element so `light-dark()` re-themes; `data-scheme` mirrors the
 * preference for glyph paint and FOUC. WHERE it persists is still the app's call (a cookie, a user
 * record on a server); `colorModePreference` below is the declaration for the localStorage case, so
 * an app that takes the default does not hand-roll the slot name and the guard.
 */
import { definePreference, oneOf } from "./storage.js";

export type ColorMode = "system" | "light" | "dark";

export const colorModes = ["system", "light", "dark"] as const;

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

export const themeToggleParts = {
  root: "sk-theme-toggle",
} as const;

export type ThemeTogglePart = keyof typeof themeToggleParts;
export type ThemeTogglePartClass = (typeof themeToggleParts)[ThemeTogglePart];

export const themeToggleAttrs = {
  root: "data-sk-theme-toggle",
  /** Face marker on each stacked icon: `system` | `light` | `dark`. */
  icon: "data-sk-theme-toggle-icon",
  labelSystem: "data-sk-theme-toggle-label-system",
  labelLight: "data-sk-theme-toggle-label-light",
  labelDark: "data-sk-theme-toggle-label-dark",
} as const;

export type ThemeToggleAttr = keyof typeof themeToggleAttrs;
export type ThemeToggleAttrName = (typeof themeToggleAttrs)[ThemeToggleAttr];

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

export function nextColorMode(current: ColorMode): ColorMode {
  return colorModes[(colorModes.indexOf(current) + 1) % colorModes.length]!;
}

/**
 * Paint the color-mode preference on a root (usually `<html>`): `data-scheme` for chrome
 * glyphs / FOUC, and `style.colorScheme` so `light-dark()` follows.
 */
export function applyColorMode(root: HTMLElement, mode: ColorMode): void {
  root.setAttribute("data-scheme", mode);
  root.style.colorScheme = mode === "system" ? "light dark" : mode;
}

/** Read the preference from a root; missing or unknown → `system`. */
export function readColorMode(root: HTMLElement): ColorMode {
  const value = root.getAttribute("data-scheme");
  return isColorMode(value) ? value : "system";
}

export type ThemeToggleChangeDetail = { value: ColorMode };
