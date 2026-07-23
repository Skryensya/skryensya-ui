/*
 * ALERT, a persistent, inline message tied to a region of the page.
 *
 * Distinct from Toast: Toast is transient and floats in a live region the app mounts and dismisses;
 * Alert stays in the layout as long as its condition holds. Both share the tone → live-region mapping
 * so a screen reader announces danger assertively and everything else politely.
 */
/** `neutral` is the plain message, no semantic colour. The rest paint status. */
export type AlertTone = "neutral" | "info" | "success" | "warning" | "danger";
export type AlertPresentation = "banner" | "accent" | "inline";

export type AlertLiveRegion = "polite" | "assertive";

export const alertLiveRegions = {
  polite: { ariaLive: "polite", role: "status" },
  assertive: { ariaLive: "assertive", role: "alert" },
} as const;

/** Danger interrupts; everything else waits for a pause. Mirrors Toast (see content.ts). */
export function getAlertLiveRegion(tone: AlertTone): AlertLiveRegion {
  return tone === "danger" ? "assertive" : "polite";
}

export const alertParts = {
  root: "ds-alert",
  icon: "ds-alert__icon",
  content: "ds-alert__content",
  title: "ds-alert__title",
  description: "ds-alert__description",
  actions: "ds-alert__actions",
  dismiss: "ds-alert__dismiss",
} as const;

export type AlertPart = keyof typeof alertParts;
export type AlertPartClass = (typeof alertParts)[AlertPart];
