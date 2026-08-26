import { useEffect, useState } from "react";
import {
  applyColorMode,
  colorModePreference,
  nextColorMode,
  type ColorMode,
} from "@skryensya/core/theme-toggle";
import { getPreference, setPreference, subscribePreference } from "@skryensya/vanilla/storage";

/*
 * The chrome's own color mode, wired to the SAME primitive `IconStateButton`'s own semantic overlay
 * names for exactly this job (`icon-state-button.yaml`'s `avoidWhen`: "un ciclo de modo de color usa
 * las funciones de @skryensya/core/theme-toggle... no hay que reinventar esa parte"). This hook is
 * that wiring, nothing more: `applyColorMode`/`nextColorMode`/`colorModePreference` are the kit's own
 * pure functions, `getPreference`/`setPreference`/`subscribePreference` are `@skryensya/vanilla`'s
 * one sanctioned way to touch `localStorage` (guarded against Safari private mode, cross-tab aware).
 *
 * Importing `@skryensya/vanilla/storage` from a plain React app is not a layering violation: it is a
 * small, DOM-only utility module with no Svelte/enhancer coupling, and this app's own iframe entry
 * already depends on the rest of `@skryensya/vanilla` anyway (`frame/entry.tsx`'s vanilla binding).
 *
 * `index.html`'s inline PREPAINT script duplicates the FIRST read of this (before any module loads,
 * to avoid a one-frame flash of the OS's own scheme); this hook is the real, imported version that
 * takes over from there and keeps `<html>` in sync afterward.
 */
export function useColorMode(): [ColorMode, () => void] {
  const [mode, setMode] = useState<ColorMode>(() => getPreference(colorModePreference));

  useEffect(() => subscribePreference(colorModePreference, setMode), []);

  useEffect(() => {
    applyColorMode(document.documentElement, mode);
  }, [mode]);

  const cycle = () => setPreference(colorModePreference, nextColorMode(mode));

  return [mode, cycle];
}
