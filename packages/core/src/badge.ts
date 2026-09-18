import type { ComponentContract } from "./contract.js";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";
export type BadgeSize = "sm" | "md";

export const badgeParts = {
  root: "sk-badge",
  holder: "sk-badge-holder",
} as const;

export type BadgePart = keyof typeof badgeParts;
export type BadgePartClass = (typeof badgeParts)[BadgePart];

/*
 * A count or a status, and nothing else. Worth publishing because an agent reaching for a coloured
 * pill needs to be told that `tone` is a role (never a hue), that the Dot has no visible content of
 * its own, and that the Holder only exists to park a badge on another control's corner.
 *
 * Holder composition: one anchor (button or avatar) then one badge (pill or dot). Hit-testing is
 * part of the Holder's promise (`hitTesting.childrenNone`): the anchored badge does not receive
 * clicks so they reach the control underneath; badge.css realizes `pointer-events: none`.
 */
export const badgeContract = {
  id: "badge",
  category: "content",
  css: "@skryensya/core/components/badge.css",
  parts: badgeParts,
  hooks: [
    "--sk-badge-bg",
    "--sk-badge-border",
    "--sk-badge-dot-color",
    "--sk-badge-dot-ring-color",
    "--sk-badge-dot-ring-width",
    "--sk-badge-dot-size",
    "--sk-badge-fg",
    "--sk-badge-font-size",
    "--sk-badge-font-weight",
    "--sk-badge-line-height",
    "--sk-badge-padding-x",
    "--sk-badge-padding-y",
    "--sk-badge-radius",
  ],

  options: {
    /** Named by ROLE, never by hue: a brand may swap what colour `accent` is and the name stays true. */
    tone: {
      type: "enum",
      values: ["neutral", "accent", "success", "warning", "danger"],
      default: "neutral",
      attr: "data-tone",
    },
    size: { type: "enum", values: ["sm", "md"], default: "md", attr: "data-size" },
    pulse: { type: "boolean", default: false, attr: "data-pulse", trueValue: "" },
    /** What the dot means ("Unread", "Online"). Its only accessible content, see `BadgeDot`'s own doc. */
    label: { type: "string", attr: "aria-label" },
  },

  signatures: {
    Badge: {
      intent: ["count", "status", "status-pill", "count-label"],
      host: { element: "span" },
      options: ["tone", "size"],
      slots: { children: { accepts: "text", required: true } },
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
      options: ["tone", "label", "pulse"],
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
      intent: ["badge-anchored-to-control", "presence-on-avatar", "unread-on-button", "count-on-control"],
      host: { element: "span" },
      options: [],
      slots: {
        children: {
          accepts: "signature",
          /*
           * Anchor signatures first, badge signatures last. `ordered` keeps the badge after the
           * control so the absolute corner styles in badge.css match DOM order. Each name is
           * at most one, and `groupCardinality` below holds the pair.
           */
          of: [
            "Button.action",
            "Button.navigation",
            "Avatar.initials",
            "Avatar.image",
            "Badge",
            "BadgeDot",
          ],
          required: true,
          ordered: true,
          cardinality: {
            "Button.action": "optional",
            "Button.navigation": "optional",
            "Avatar.initials": "optional",
            "Avatar.image": "optional",
            Badge: "optional",
            BadgeDot: "optional",
          },
          /* Exactly one anchor AND exactly one badge: a lone anchor has nothing to decorate, a lone
             badge has nothing to sit on, and two anchors of different kinds used to slip through. */
          groupCardinality: [
            { of: ["Button.action", "Button.navigation", "Avatar.initials", "Avatar.image"], count: "one" },
            { of: ["Badge", "BadgeDot"], count: "one" },
          ],
        },
      },
      /*
       * Corner badge never intercepts the anchor: stylesheet sets `pointer-events: none` on
       * `.sk-badge-holder > .sk-badge`. Declared so the manifest carries the promise.
       */
      hitTesting: { childrenNone: ["Badge", "BadgeDot"] },
      template: { element: "span", part: "holder", host: true, slot: "children" },
      react: { from: "@skryensya/react/badge", name: "BadgeHolder" },
    },
  },
} as const satisfies ComponentContract;
