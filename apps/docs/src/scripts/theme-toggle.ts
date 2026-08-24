/*
 * Behavior for `ThemeToggle.astro`'s non-scoped header instance (docs-local markup, decision 33:
 * no published contract owns this any more). `initThemeToggle` mirrors what
 * `@skryensya/vanilla`'s deleted `connectThemeToggle` used to do — cycle `<html>`'s color mode on
 * click, keep every instance in sync via `themeToggleEvents.change`. The scoped/appearance preview
 * on the landing page has always been its own separate hand-rolled logic (LandingPage.astro) and is
 * untouched by this.
 *
 * `initThemeTogglePersistence` only stores the choice and notifies the rest of the chrome
 * (`sk:dimensions-changed`) so Opciones / previews stay in sync. The slot, the JSON and the try/catch
 * are the storage primitive's, the declaration is in `lib/preferences`.
 */
import { setIconState } from "@skryensya/core/icon-state-button";
import {
  applyColorMode,
  colorModeLabel,
  isColorMode,
  nextColorMode,
  readColorMode,
  themeToggleEvents,
  type ColorMode,
  type ThemeToggleChangeDetail,
} from "@skryensya/core/theme-toggle";
import { getPreference, setPreference, subscribePreference } from "@skryensya/vanilla/storage";
import { colorModePreference } from "../lib/preferences";

const rootAttr = "data-sk-theme-toggle";
const labelAttrs = {
  system: "data-sk-theme-toggle-label-system",
  light: "data-sk-theme-toggle-label-light",
  dark: "data-sk-theme-toggle-label-dark",
};

function labelsFrom(root: HTMLElement): Partial<Record<ColorMode, string>> {
  return {
    system: root.getAttribute(labelAttrs.system) ?? undefined,
    light: root.getAttribute(labelAttrs.light) ?? undefined,
    dark: root.getAttribute(labelAttrs.dark) ?? undefined,
  };
}

/*
 * `data-scheme` is what `components/theme-toggle.css` still keys its `[data-face]` selection off
 * (this markup predates IconStateButton's `data-active` mechanism and was left as-is rather than
 * migrated, since it already worked and this fix is scoped to restoring behavior, not re-authoring
 * the anatomy).
 */
function paint(root: HTMLButtonElement, mode: ColorMode): void {
  setIconState(root, "data-scheme", mode, colorModeLabel(mode, labelsFrom(root)));
}

function connect(root: HTMLButtonElement): () => void {
  const target = document.documentElement;
  const sync = () => paint(root, readColorMode(target));

  sync();

  const onClick = () => {
    const next = nextColorMode(readColorMode(target));
    applyColorMode(target, next);
    root.dispatchEvent(
      new CustomEvent<ThemeToggleChangeDetail>(themeToggleEvents.change, { bubbles: true, detail: { value: next } }),
    );
  };

  const onChange = () => sync();
  document.addEventListener(themeToggleEvents.change, onChange);
  root.addEventListener("click", onClick);

  return () => {
    root.removeEventListener("click", onClick);
    document.removeEventListener(themeToggleEvents.change, onChange);
  };
}

export function initThemeToggle(): void {
  document
    .querySelectorAll<HTMLButtonElement>(`[${rootAttr}]:not([data-theme-toggle-bound])`)
    .forEach((root) => {
      root.setAttribute("data-theme-toggle-bound", "");
      connect(root);
    });
}

export function initThemeTogglePersistence(): void {
  document.addEventListener(themeToggleEvents.change, ((event: CustomEvent<{ value: ColorMode }>) => {
    const value = event.detail?.value;
    if (!isColorMode(value)) return;
    setPreference(colorModePreference, value);
    document.dispatchEvent(new CustomEvent("sk:dimensions-changed"));
  }) as EventListener);
}

/*
 * Mirrors a color-mode change made in ANOTHER tab into this one. `subscribePreference` fires on the
 * native `storage` event, so this repaints `<html data-scheme>` and every toggle instance directly
 * rather than routing through `themeToggleEvents.change` + `initThemeTogglePersistence`, which would
 * just write the same value back to storage it was just read from.
 *
 * The `storage` event alone is not enough: Chrome and Safari both defer delivering it to a
 * BACKGROUNDED tab, so a tab you switch away from and back to can sit stale until something else
 * repaints it. `visibilitychange`/`pageshow` (the latter for a bfcache restore, which fires no
 * `storage` events at all while frozen) re-read storage the moment the tab becomes visible again, so
 * switching tabs is never worse than a reload — and the `storage` listener still wins when the tab
 * was never backgrounded, or the browser delivers it live anyway.
 */
export function initThemeToggleSync(): void {
  const target = document.documentElement;
  const applyIfChanged = (mode: ColorMode) => {
    if (readColorMode(target) === mode) return;
    applyColorMode(target, mode);
    document
      .querySelectorAll<HTMLButtonElement>(`[${rootAttr}]`)
      .forEach((root) => paint(root, mode));
    document.dispatchEvent(new CustomEvent("sk:dimensions-changed"));
  };

  subscribePreference(colorModePreference, applyIfChanged);

  const resync = () => applyIfChanged(getPreference(colorModePreference));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") resync();
  });
  window.addEventListener("pageshow", resync);
}
