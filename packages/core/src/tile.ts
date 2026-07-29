import type { ComponentContract } from "./contract.js";
import type { Space } from "./layout.js";

export type TileElement = "div" | "article" | "section" | "li";

export type TileCheckedState = boolean | "indeterminate";
export type TileSurfaceOptions = {
  padding?: Space;
};


export type TileCheckboxChangeDetails = {
  checked: TileCheckedState;
};

export type TileCheckboxOptions = TileSurfaceOptions & {
  id?: string;
  name?: string;
  value?: string;
  checked?: TileCheckedState;
  defaultChecked?: TileCheckedState;
  indeterminate?: boolean;
  disabled?: boolean;
  required?: boolean;
  onCheck?: (details: TileCheckboxChangeDetails) => void;
};

export type TileSwitchChangeDetails = {
  checked: boolean;
};

export type TileSwitchOptions = TileSurfaceOptions & {
  id?: string;
  name?: string;
  value?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  required?: boolean;
  onCheck?: (details: TileSwitchChangeDetails) => void;
};

export type TileRadioValueChangeDetails = {
  value: string | null;
};

export type TileRadioGroupOptions = TileSurfaceOptions & {
  id?: string;
  name: string;
  value?: string | null;
  defaultValue?: string | null;
  disabled?: boolean;
  required?: boolean;
  orientation?: "horizontal" | "vertical";
  onValueChange?: (details: TileRadioValueChangeDetails) => void;
};

export type ExpandableTileOpenChangeDetails = {
  open: boolean;
};

export type ExpandableTileOptions = TileSurfaceOptions & {
  id?: string;
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  onOpenChange?: (details: ExpandableTileOpenChangeDetails) => void;
};

export const tileParts = {
  root: "sk-tile",
  interactive: "sk-tile--interactive",
  expandable: "sk-tile--expandable",
  content: "sk-tile__content",
  title: "sk-tile__title",
  description: "sk-tile__description",
  selectionIndicator: "sk-tile__selection-indicator",
  trigger: "sk-tile__trigger",
  chevron: "sk-tile__chevron",
  expandableContent: "sk-tile__expandable-content",
  grid: "sk-tile-grid",
} as const;

export type TilePart = keyof typeof tileParts;
export type TilePartClass = (typeof tileParts)[TilePart];

export const tileScope = "tile";

export const tileDataParts = {
  root: "root",
  content: "content",
  input: "input",
  indicator: "indicator",
  trigger: "trigger",
  chevron: "chevron",
  expandableContent: "content",
  radioItem: "item",
  radioLabel: "label",
} as const;

export const tileEvents = {
  checkedChange: "sk:checkedchange",
  valueChange: "sk:valuechange",
  openChange: "sk:openchange",
} as const;

/**
 * A tile is a SURFACE that is also one control.
 *
 * Not a card with a button inside — the whole rectangle is the target, which is why every signature
 * here is a different native element rather than a wrapper with a role bolted on. A tile that
 * navigates is an `<a>`, one that acts is a `<button>`, one that chooses wraps a real `<input>`, and
 * one that expands is a `<section>` with its own trigger. Choosing among them IS choosing what the
 * tile does, and no option can stand in for that.
 *
 * They share paint (`sk-tile`, `sk-tile--interactive`, `sk-interactive`) and nothing else.
 */
export const tileContract = {
  id: "tile",
  css: "@skryensya/core/components/tile.css",
  parts: tileParts,

  options: {
    /** Inner spacing, on the same scale Box uses. Absent means the stylesheet's own. */
    padding: { type: "enum", values: ["none", "xs", "sm", "md", "lg", "xl"], attr: "data-padding" },
    href: { type: "string", attr: "href" },
    disabled: { type: "boolean", default: false, attr: "disabled", trueValue: "" },
    /** Starts expanded. Read once as the initial state; after that the machine owns it. */
    defaultOpen: { type: "boolean", default: false, attr: "data-default-open", trueValue: "", machineInput: true },
  },

  signatures: {
    TileLink: {
      intent: ["clickable-card", "navigation-tile", "linked-surface", "card-that-goes-somewhere"],
      host: { element: "a" },
      options: ["href", "padding"],
      requires: ["href"],
      slots: { children: { accepts: "node", required: true } },
      template: {
        element: "a",
        part: "root",
        host: true,
        also: ["sk-tile--interactive", "sk-interactive"],
        attrs: { "data-scope": "tile", "data-part": "root" },
        slot: "children",
      },
      react: { from: "@skryensya/react/tile", name: "TileLink" },
    },

    TileButton: {
      intent: ["actionable-card", "selectable-surface", "card-that-does-something"],
      host: { element: "button" },
      options: ["disabled", "padding"],
      slots: { children: { accepts: "node", required: true } },
      template: {
        element: "button",
        part: "root",
        host: true,
        also: ["sk-tile--interactive", "sk-interactive"],
        attrs: { type: "button", "data-scope": "tile", "data-part": "root" },
        attrsWhen: [{ option: "disabled", equals: "true", attrs: { "data-disabled": "" } }],
        slot: "children",
      },
      react: { from: "@skryensya/react/tile", name: "TileButton" },
    },

    /*
     * The expandable tile is three signatures, not one with slots, because the trigger and the
     * content are composed in the author's own order and can each carry arbitrary markup. The
     * machine pairs them; the contract only fixes that both are there.
     */
    ExpandableTile: {
      intent: ["expandable-card", "show-more", "collapsible-surface", "disclosure"],
      host: { element: "section" },
      options: ["defaultOpen", "disabled", "padding"],
      slots: {
        children: {
          accepts: "signature",
          of: ["ExpandableTileTrigger", "ExpandableTileContent"],
          required: true,
          ordered: true,
          cardinality: { ExpandableTileTrigger: "one", ExpandableTileContent: "one" },
        },
      },
      mount: "data-sk-expandable-tile",
      template: {
        element: "section",
        part: "root",
        host: true,
        also: ["sk-tile--interactive", "sk-tile--expandable", "sk-interactive"],
        attrs: { "data-scope": "tile", "data-part": "root" },
        slot: "children",
      },
      react: { from: "@skryensya/react/tile", name: "ExpandableTile" },
    },

    ExpandableTileTrigger: {
      intent: ["expand-control", "disclosure-trigger", "show-more-button"],
      host: { element: "button" },
      parents: ["ExpandableTile"],
      options: [],
      slots: { children: { accepts: "node", required: true } },
      template: {
        element: "button",
        part: "trigger",
        host: true,
        // The enhancer finds the pair by `data-part`, so these are structure, not decoration.
        attrs: { type: "button", "data-scope": "tile", "data-part": "trigger" },
        slot: "children",
      },
      react: { from: "@skryensya/react/tile", name: "ExpandableTileTrigger" },
    },

    ExpandableTileContent: {
      intent: ["expandable-body", "disclosure-panel", "the-part-that-unfolds"],
      host: { element: "div" },
      parents: ["ExpandableTile"],
      options: [],
      slots: { children: { accepts: "node", required: true } },
      template: {
        element: "div",
        part: "expandableContent",
        host: true,
        attrs: { "data-scope": "tile", "data-part": "content" },
        slot: "children",
      },
      react: { from: "@skryensya/react/tile", name: "ExpandableTileContent" },
    },
  },
} as const satisfies ComponentContract;
