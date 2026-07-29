/*
 * THEME TOGGLE, cycles the color-mode dimension: system → light → dark → system.
 *
 * Appearance is CSS (stacked faces on an icon-only button). Applying the mode flips
 * `color-scheme` on a root element so `light-dark()` re-themes; `data-scheme` mirrors the
 * preference for glyph paint and FOUC. WHERE it persists is still the app's call (a cookie, a user
 * record on a server); `colorModePreference` below is the declaration for the localStorage case, so
 * an app that takes the default does not hand-roll the slot name and the guard.
 */
import type { ComponentContract } from "./contract.js";
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

/**
 * The color-mode control: one icon-only button that cycles system → light → dark.
 *
 * Three faces are always in the markup and CSS shows one, which is why they are template structure
 * rather than a slot: which face is lit follows `data-scheme`, and a binding that rendered only the
 * current one would have nothing to cross-fade between.
 *
 * `data-scheme` is state, not authorship. Whatever the author writes is read once as the initial
 * mode, and from then on both bindings read the value off `<html>` — so two toggles on one page
 * cannot disagree.
 */
export const themeToggleContract = {
  id: "theme-toggle",
  css: "@skryensya/core/components/theme-toggle.css",
  parts: themeToggleParts,

  options: {
    /**
     * The initial mode. Authored as `data-scheme` and read once by the enhancer; React takes it as
     * `defaultValue`. After the first paint both bindings overwrite this attribute with the live
     * mode, which is why it is machine input rather than a styling hook.
     */
    defaultValue: { type: "enum", values: ["system", "light", "dark"], attr: "data-scheme", machineInput: true },
    /** Same size axis as Button. Absent means the control's default size. */
    size: { type: "enum", values: ["sm", "md", "lg"], attr: "data-size" },
    /*
     * The three accessible names, one per mode, because the button's name changes as it cycles.
     * Authored markup carries one attribute each; React takes them as a single `labels` object —
     * different channels for one option, exactly what machine input means here too.
     */
    labelSystem: { type: "string", attr: "data-sk-theme-toggle-label-system", machineInput: true },
    labelLight: { type: "string", attr: "data-sk-theme-toggle-label-light", machineInput: true },
    labelDark: { type: "string", attr: "data-sk-theme-toggle-label-dark", machineInput: true },
  },

  signatures: {
    ThemeToggle: {
      intent: ["color-mode", "dark-mode-switch", "light-dark-toggle", "appearance"],
      host: { element: "button" },
      options: ["defaultValue", "size", "labelSystem", "labelLight", "labelDark"],
      slots: {},
      mount: "data-sk-theme-toggle",
      template: {
        element: "button",
        part: "root",
        host: true,
        also: ["sk-button", "sk-interactive"],
        /*
         * A name before the JavaScript runs. Both bindings replace it with the live mode's label on
         * their first paint, but an icon-only button that ships nameless is nameless for as long as
         * the script takes to arrive — and for anyone whose script never does.
         */
        attrs: {
          type: "button",
          "data-variant": "ghost",
          "data-icon-only": "",
          "aria-label": "Color mode: system",
        },
        children: [
          { element: "span", attrs: { "data-sk-icon": "mode-system", "data-sk-icon-size": "md", "data-sk-theme-toggle-icon": "system" } },
          { element: "span", attrs: { "data-sk-icon": "mode-light", "data-sk-icon-size": "md", "data-sk-theme-toggle-icon": "light" } },
          { element: "span", attrs: { "data-sk-icon": "mode-dark", "data-sk-icon-size": "md", "data-sk-theme-toggle-icon": "dark" } },
        ],
      },
      react: { from: "@skryensya/react/theme-toggle", name: "ThemeToggle" },
    },
  },
} as const satisfies ComponentContract;
