import type { ComponentContract } from "./contract.js";

/*
 * KBD, the contract.
 *
 * A single keyboard key. Static, like Badge: the class and part are ours and permanent; there is no
 * state and no machine, so there is no vanilla enhancer and nothing here but the part name.
 */
export const kbdParts = {
  root: "sk-kbd",
} as const;

export type KbdPart = keyof typeof kbdParts;
export type KbdPartClass = (typeof kbdParts)[KbdPart];

/** Named by ROLE, same as Badge: `accent` is the brand, never a hue. */
export type KbdTone = "neutral" | "accent";

/*
 * A key, on the `<kbd>` element the platform already has for it. One option: whether the key is a
 * physical legend (the default) or an accent-toned label. The element is still the meaning; the
 * tone is only paint.
 */
export const kbdContract = {
  id: "kbd",
  css: "@skryensya/core/components/kbd.css",
  parts: kbdParts,
  options: {
    tone: {
      type: "enum",
      values: ["neutral", "accent"],
      default: "neutral",
      attr: "data-tone",
    },
  },

  signatures: {
    Kbd: {
      intent: ["keyboard-key", "shortcut", "key-combination"],
      host: { element: "kbd" },
      options: ["tone"],
      slots: { children: { accepts: "text", required: true } },
      template: { element: "kbd", part: "root", host: true, slot: "children" },
      react: { from: "@skryensya/react/kbd", name: "Kbd" },
    },
  },
} as const satisfies ComponentContract;
