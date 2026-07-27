/*
 * Persists the ThemeToggle color-mode preference for the docs site.
 *
 * Cycling and applying `color-scheme` / `data-scheme` belong to `@skryensya/vanilla/theme-toggle`
 * (via `initComponents`). This script only stores the choice and notifies the rest of the chrome
 * (`sk:dimensions-changed`) so Opciones / previews stay in sync. The slot, the JSON and the try/catch
 * are the storage primitive's now; the declaration is in `lib/preferences`.
 */

import { isColorMode, themeToggleEvents, type ColorMode } from "@skryensya/core/theme-toggle";
import { setPreference } from "@skryensya/vanilla/storage";
import { colorModePreference } from "../lib/preferences";

export function initThemeTogglePersistence(): void {
  document.addEventListener(themeToggleEvents.change, ((event: CustomEvent<{ value: ColorMode }>) => {
    const value = event.detail?.value;
    if (!isColorMode(value)) return;
    setPreference(colorModePreference, value);
    document.dispatchEvent(new CustomEvent("sk:dimensions-changed"));
  }) as EventListener);
}
