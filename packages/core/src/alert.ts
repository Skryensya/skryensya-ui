import type { ComponentContract } from "./contract.js";

/*
 * ALERT, a persistent, inline message tied to a region of the page.
 *
 * Distinct from Toast: Toast is transient and floats in a live region the app mounts and dismisses;
 * Alert stays in the layout as long as its condition holds. Both share the tone → live-region mapping
 * so a screen reader announces danger assertively and everything else politely.
 */
/** `neutral` is the plain message, no semantic color. The rest paint status. */
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
  root: "sk-alert",
  icon: "sk-alert__icon",
  content: "sk-alert__content",
  title: "sk-alert__title",
  description: "sk-alert__description",
  actions: "sk-alert__actions",
  dismiss: "sk-alert__dismiss",
} as const;

export type AlertPart = keyof typeof alertParts;
export type AlertPartClass = (typeof alertParts)[AlertPart];

/*
 * A message about something that happened, and the one place a tone changes the ACCESSIBILITY rather
 * than just the colour: `danger` becomes an assertive live region, everything else stays polite.
 * That is what `getAlertLiveRegion` decides, and it is why tone is not merely paint here.
 */
export const alertContract = {
  id: "alert",
  css: "@skryensya/core/components/alert.css",
  parts: alertParts,

  options: {
    tone: {
      type: "enum",
      values: ["neutral", "info", "success", "warning", "danger"],
      default: "neutral",
      attr: "data-tone",
    },
    presentation: {
      type: "enum",
      values: ["banner", "accent", "inline"],
      default: "banner",
      attr: "data-presentation",
    },
  },

  signatures: {
    Alert: {
      intent: ["message", "something-went-wrong", "confirmation", "warning-notice"],
      host: { element: "div" },
      options: ["tone", "presentation"],
      slots: {
        icon: { accepts: "signature", of: ["Icon"] },
        title: { accepts: "text" },
        children: { accepts: "node", required: true },
        actions: { accepts: "signature", of: ["Button.action", "Button.navigation"] },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        /*
         * Tone decides the accessibility here, not just the paint: danger is assertive because it
         * interrupts, everything else is polite because it can wait.
         */
        attrsWhen: [
          { option: "tone", equals: "danger", attrs: { role: "alert", "aria-live": "assertive" } },
          { option: "tone", notEquals: "danger", attrs: { role: "status", "aria-live": "polite" } },
        ],
        children: [
          { element: "span", part: "icon", whenGiven: "icon", attrs: { "aria-hidden": "true" }, slot: "icon" },
          {
            element: "div",
            part: "content",
            children: [
              { element: "p", part: "title", whenGiven: "title", slot: "title" },
              { element: "div", part: "description", slot: "children" },
            ],
          },
          { element: "div", part: "actions", whenGiven: "actions", slot: "actions" },
        ],
      },
      react: { from: "@skryensya/react/alert", name: "Alert" },
    },
  },
} as const satisfies ComponentContract;
