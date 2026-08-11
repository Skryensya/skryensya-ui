/*
 * Accent-reach controls share one state model but not one interaction shape.
 *
 *   [data-docs-accent-toggle] is the compact header button. It cycles all → links → action because
 *                              chrome has room for one action, persists the preference, and keeps
 *                              its current reach in the accessible name.
 *   [data-docs-accent-choice] is the visible three-card radio group on /acento. It writes only the
 *                              specimen it names; teaching the distinction earns direct access to
 *                              every option.
 *
 * The TileRadioGroup enhancer owns its value once mounted, so it receives the restored initial
 * value before `initComponents()` runs. The header button has no enhancer: its state remains the
 * root attribute, making the control's icon, label, and persisted preference one update.
 */

import { setPreference } from "@skryensya/vanilla/storage";
import { accentReachPreference } from "../lib/preferences";

type AccentReach = "1" | "2" | "3";

const isLevel = (value: string | null | undefined): value is AccentReach =>
  value === "1" || value === "2" || value === "3";

/** An element's level. Unset or nonsense reads as the baseline, which is what level 3 means. */
function levelOf(element: Element | null): AccentReach {
  const value = element?.getAttribute("data-accent");
  return isLevel(value) ? value : "3";
}

/** Write the reach once, keeping persistence and preview notifications in the site-only path. */
function writeReach(target: HTMLElement, value: AccentReach, persist: boolean): void {
  target.setAttribute("data-accent", value);
  if (!persist) return;

  setPreference(accentReachPreference, value);
  /* `used-values` re-reads computed values, and previews mirror the root attributes on their own. */
  document.dispatchEvent(new CustomEvent("sk:dimensions-changed"));
}

function syncCycle(toggle: HTMLElement, root: HTMLElement | null): void {
  const value = levelOf(root);
  toggle.dataset.level = value;

  const label = toggle.getAttribute(`data-label-${value}`);
  if (!label) return;
  toggle.setAttribute("aria-label", label);
  toggle.setAttribute("title", label);
}

function bindCycle(toggle: HTMLElement, root: () => HTMLElement | null, persist: boolean): void {
  syncCycle(toggle, root());

  toggle.addEventListener("click", () => {
    const target = root();
    if (!target) return;

    const current = levelOf(target);
    const next = current === "3" ? "2" : current === "2" ? "1" : "3";
    writeReach(target, next, persist);
    syncCycle(toggle, root());
  });
}

function bindTileRadioGroup(group: HTMLElement, root: () => HTMLElement | null, persist: boolean): void {
  /* The starting value lands before the enhancer reads it. */
  group.setAttribute("data-default-value", levelOf(root()));

  group.addEventListener("sk:valuechange", (event) => {
    const value = (event as CustomEvent<{ value: string | null }>).detail?.value;
    const target = root();
    if (!isLevel(value) || !target) return;
    writeReach(target, value, persist);
  });
}

export function initAccentReach(): void {
  const siteControl = document.querySelector<HTMLElement>("[data-docs-accent-toggle]");
  if (siteControl) bindCycle(siteControl, () => document.documentElement, true);

  for (const scoped of document.querySelectorAll<HTMLElement>("[data-docs-accent-choice]")) {
    const target = scoped.getAttribute("aria-controls");
    if (!target) continue;

    bindTileRadioGroup(
      scoped,
      () => {
        const element = document.getElementById(target);
        /* An iframe's level belongs on its document root, not on the frame element. */
        return element instanceof HTMLIFrameElement
          ? element.contentDocument?.documentElement ?? null
          : element;
      },
      false,
    );
  }
}
