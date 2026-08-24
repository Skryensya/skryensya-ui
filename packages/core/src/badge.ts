import type { ComponentContract } from "./contract.js";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";

export const badgeParts = {
  root: "sk-badge",
  holder: "sk-badge-holder",
} as const;

export type BadgePart = keyof typeof badgeParts;
export type BadgePartClass = (typeof badgeParts)[BadgePart];

/*
 * A count or a status, and nothing else. One part, one option: the simplest shape a contract takes,
 * and worth publishing precisely because an agent reaching for a coloured pill needs to be told that
 * `tone` is the only knob and that the tones are roles, never hues.
 */
export const badgeContract = {
  id: "badge",
  css: "@skryensya/core/components/badge.css",
  parts: badgeParts,

  options: {
    /** Named by ROLE, never by hue: a brand may swap what colour `accent` is and the name stays true. */
    tone: {
      type: "enum",
      values: ["neutral", "accent", "success", "warning", "danger"],
      default: "neutral",
      attr: "data-tone",
    },
    /** What the dot means ("Unread", "Online"). Its only accessible content, see `BadgeDot`'s own doc. */
    label: { type: "string", attr: "aria-label" },
  },

  signatures: {
    Badge: {
      intent: ["count", "status", "label-on-something", "unread-indicator"],
      host: { element: "span" },
      options: ["tone"],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "span", part: "root", host: true, slot: "children" },
      react: { from: "@skryensya/react/badge", name: "Badge" },
    },

    /*
     * `label` is required, not optional: unlike `Avatar.initials` (which has visible fallback text
     * too) a dot has NO content of its own: no `label`, no accessible name at all, an unread/online
     * signal only a sighted user gets. `role="status"`, unconditional: what the dot means changes
     * over time (unread → read, online → away), the same reasoning every real usage of this
     * signature had already reached by hand before this option existed.
     */
    BadgeDot: {
      intent: ["unread-dot", "presence-dot", "status-dot"],
      host: { element: "span" },
      options: ["tone", "label"],
      requires: ["label"],
      slots: {},
      template: {
        element: "span",
        part: "root",
        host: true,
        attrs: { "data-dot": "", role: "status" },
      },
      react: { from: "@skryensya/react/badge", name: "BadgeDot" },
    },

    BadgeHolder: {
      intent: ["badge-anchored-to-control", "presence-on-avatar", "unread-on-button"],
      host: { element: "span" },
      options: [],
      slots: {
        children: {
          accepts: "signature",
          of: ["Button.action", "Button.navigation", "Avatar.initials", "BadgeDot"],
          required: true,
        },
      },
      template: { element: "span", part: "holder", host: true, slot: "children" },
      react: { from: "@skryensya/react/badge", name: "BadgeHolder" },
    },
  },
} as const satisfies ComponentContract;
