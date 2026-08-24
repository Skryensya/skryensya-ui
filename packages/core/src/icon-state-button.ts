import type { ComponentContract } from "./contract.js";
import { stableIconNames, type StableIconName } from "./icon.js";
import { iconToggleAttrs, iconToggleParts } from "./icon-toggle.js";

/*
 * ICON STATE BUTTON, decision 33 reversed: this is the public signature now, not a primitive
 * underneath two others. An icon-only button whose faces are author-supplied. A `faces` items
 * slot, one `{ name, icon }` entry per state, because the set of states is different every time
 * it is used (idle/copied for a copy action, system/light/dark for a color mode) and a fixed enum
 * baked into one contract cannot say that.
 *
 * WHICH FACE IS CURRENT is `current`, a plain string option compared against each entry's own
 * `name`: the same pairing RadioGroup already does between its `value` option and each item's
 * `value` (`selection.ts`), reused here via `selectedBy` against Icon Toggle's own `data-active`
 * marker instead of a component-specific state attribute. Because `selectedBy` resolves at EMIT
 * TIME, the correct face already carries `data-active` in the first paint: no JS, no FOUC gap,
 * the same property CopyButton and ThemeToggle used to buy with their own hand-written CSS.
 *
 * WHAT THIS CONTRACT DOES NOT DO is decide when `current` changes, or what a click does at all: no
 * `mount`, no vanilla enhancer, no behavior. A button that shows one of N icons and does nothing on
 * click is not useful on its own; a consumer supplies the click handling, the timer, the clipboard
 * write, the cross-instance broadcast. Whatever the actual feature needs, and updates `current`
 * (or the DOM `data-active`) itself. `setIconState`/`getIconState` below are for exactly that: a
 * small, optional imperative helper, not part of the contract.
 */

export type IconStateFace = {
  readonly name: string;
  readonly icon: StableIconName;
};

export const iconStateButtonParts = {
  root: "sk-icon-state-button",
} as const;

export type IconStateButtonPart = keyof typeof iconStateButtonParts;
export type IconStateButtonPartClass = (typeof iconStateButtonParts)[IconStateButtonPart];

export const iconStateButtonAttrs = {
  root: "data-sk-icon-state-button",
  current: "data-current",
  face: "data-face",
} as const;

export type IconStateButtonAttr = keyof typeof iconStateButtonAttrs;
export type IconStateButtonAttrName = (typeof iconStateButtonAttrs)[IconStateButtonAttr];

/**
 * Imperative set/read of a state attribute plus, when given, the accessible name. For a
 * consumer's own behavior script to call after its own click/cycle logic decides the next state.
 * Not wired to `current` above automatically: this contract has no enhancer to do that wiring.
 */
export function setIconState(root: HTMLElement, attr: string, value: string | undefined, ariaLabel?: string): void {
  if (value === undefined) root.removeAttribute(attr);
  else root.setAttribute(attr, value);
  if (ariaLabel !== undefined) root.setAttribute("aria-label", ariaLabel);
}

export function getIconState(root: HTMLElement, attr: string): string | null {
  return root.getAttribute(attr);
}

export const iconStateButtonContract = {
  id: "icon-state-button",
  css: "@skryensya/core/components/icon-state-button.css",
  parts: iconStateButtonParts,

  options: {
    /** Which face's `name` is current. Absent means no face carries `data-active` at all. */
    current: { type: "string", attr: iconStateButtonAttrs.current },
  },

  signatures: {
    IconStateButton: {
      intent: ["icon-button-with-states", "multi-state-icon-button"],
      host: { element: "button" },
      options: ["current"],
      slots: {
        /** One entry per state. `name` is what `current` is compared against; `icon` is the glyph. */
        faces: {
          accepts: "items",
          required: true,
          item: {
            key: "name",
            options: {
              name: { type: "string", attr: iconStateButtonAttrs.face },
              icon: { type: "enum", values: stableIconNames, attr: "data-sk-icon" },
            },
            slots: {},
          },
        },
      },
      template: {
        element: "button",
        part: "root",
        host: true,
        also: ["sk-button", "sk-interactive", iconToggleParts.root],
        attrs: { type: "button" },
        children: [
          {
            repeat: "faces",
            children: [
              {
                /* No `part`: a face IS the icon placeholder, nothing wraps it, and `sk-icon`
                   itself (written once the real set replaces this span) is already the only
                   class that means anything here. A second one with no rule to match would be
                   the divergence G2 exists to catch, not real anatomy. `data-sk-icon-size` is the
                   one attribute that IS load-bearing: it is how the icon-mounting enhancer knows
                   what size to render, read once and never copied to the final `<svg>`
                   (`controlAttrs` in `vanilla/src/icon.ts`). React's own `<Icon>` needs no
                   equivalent since its `size` prop already defaults to `"md"`. */
                element: "span",
                attrs: { "data-sk-icon-size": "md" },
                itemOptions: ["name", "icon"],
                selectedBy: { option: "current", attr: iconToggleAttrs.active },
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/icon-state-button", name: "IconStateButton" },
    },
  },
} as const satisfies ComponentContract;
