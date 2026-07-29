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

/*
 * A key, on the `<kbd>` element the platform already has for it. No options at all: the element IS
 * the meaning, and a contract with nothing to configure is still worth publishing — it tells an agent
 * that a keyboard shortcut has a semantic element rather than a styled span.
 */
export const kbdContract = {
  id: "kbd",
  css: "@skryensya/core/components/kbd.css",
  parts: kbdParts,
  options: {},

  signatures: {
    Kbd: {
      intent: ["keyboard-key", "shortcut", "key-combination"],
      host: { element: "kbd" },
      options: [],
      slots: { children: { accepts: "text", required: true } },
      template: { element: "kbd", part: "root", host: true, slot: "children" },
      react: { from: "@skryensya/react/kbd", name: "Kbd" },
    },
  },
} as const satisfies ComponentContract;
