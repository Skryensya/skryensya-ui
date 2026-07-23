/*
 * KBD, the contract.
 *
 * A single keyboard key. Static, like Badge: the class and part are ours and permanent; there is no
 * state and no machine, so there is no vanilla enhancer and nothing here but the part name.
 */
export const kbdParts = {
  root: "ds-kbd",
} as const;

export type KbdPart = keyof typeof kbdParts;
export type KbdPartClass = (typeof kbdParts)[KbdPart];
