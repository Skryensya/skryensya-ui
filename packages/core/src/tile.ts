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
    /* The choice's identity in a form. Machine input: the enhancer reads them off the root, React
       passes props, and Zag never writes them back. */
    name: { type: "string", attr: "data-name", machineInput: true },
    value: { type: "string", attr: "data-value", machineInput: true },
    defaultChecked: { type: "boolean", default: false, attr: "data-default-checked", machineInput: true },
    required: { type: "boolean", default: false, attr: "data-required", trueValue: "", machineInput: true },
    defaultValue: { type: "string", attr: "data-default-value", machineInput: true },
    orientation: { type: "enum", values: ["horizontal", "vertical"], attr: "data-orientation", machineInput: true },
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

    TileContent: {
      intent: ["tile-copy", "tile-title-and-description"],
      host: { element: "span" },
      /*
       * `Accordion.Trigger` belongs here because it IS an ExpandableTileTrigger: React's
       * `AccordionTrigger` renders one directly (`packages/react/src/components/accordion.tsx`), and
       * the authored markup on the accordion page puts `sk-tile__content` inside the trigger button
       * exactly as this emits it. Omitting it made the validator reject a title-over-description in
       * an accordion item — the composition all three accordion demos are built on.
       */
      parents: [
        "TileLink",
        "TileButton",
        "TileCheckbox",
        "TileSwitch",
        "ExpandableTileTrigger",
        "Accordion.Trigger",
      ],
      options: [],
      slots: {
        title: { accepts: "node", required: true },
        description: { accepts: "node" },
      },
      template: {
        element: "span",
        part: "content",
        host: true,
        attrs: { "data-part": "content" },
        children: [
          { element: "span", part: "title", slot: "title" },
          { element: "span", part: "description", whenGiven: "description", slot: "description" },
        ],
      },
      react: { from: "@skryensya/react/tile", name: "TileContent" },
    },

    /*
     * THE DISCLOSURE MARK, which was a declared part no template painted.
     *
     * `sk-tile__chevron` has had CSS since the expandable tile shipped — rules that hide one child
     * and show the other off the trigger's `data-state` — but no signature emitted it, so every
     * accordion demo hand-wrote the same nine lines twice, once as an HTML string and once as JSX.
     * They had already drifted: the authored HTML carried `data-part="chevron"` and the React half
     * did not, which is the exact failure a shared tree exists to make impossible.
     *
     * BOTH children are always emitted, and the stylesheet picks one. The mark cannot be a single
     * icon swapped at runtime, because on the authored path there is no runtime — the enhancer only
     * toggles `data-state` on the trigger, and CSS does the rest. That is also why it is purely
     * decorative: the trigger's own `aria-expanded` is what announces the state, so an announced
     * chevron would say it twice.
     */
    TileChevron: {
      intent: ["disclosure-mark", "expand-collapse-affordance", "accordion-chevron"],
      host: { element: "span" },
      parents: ["ExpandableTileTrigger", "Accordion.Trigger"],
      options: [],
      slots: {},
      template: {
        element: "span",
        part: "chevron",
        host: true,
        attrs: { "data-part": "chevron", "aria-hidden": "true" },
        children: [
          {
            element: "span",
            attrs: { "data-state": "closed" },
            children: [
              { element: "span", attrs: { "data-sk-icon": "chevron-down", "data-sk-icon-size": "md" } },
            ],
          },
          {
            element: "span",
            attrs: { "data-state": "open" },
            children: [
              { element: "span", attrs: { "data-sk-icon": "chevron-up", "data-sk-icon-size": "md" } },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/tile", name: "TileChevron" },
    },

    /*
     * The expandable tile is three signatures, not one with slots, because the trigger and the
     * content are composed in the author's own order and can each carry arbitrary markup. The
     * machine pairs them; the contract only fixes that both are there.
     */
    /*
     * The three that WRAP a real control. The input is the tile's own, visually hidden and never
     * replaced: it is what carries the choice into a form, what a screen reader announces, and what
     * the keyboard reaches. Wrapping IS the association — no `for`, no `id` — and the paint beside
     * it is `aria-hidden`, so the choice is announced once rather than twice.
     */
    TileCheckbox: {
      intent: ["selectable-card", "multi-select-tile", "card-with-a-checkbox", "pick-several"],
      host: { element: "label" },
      options: ["name", "value", "defaultChecked", "disabled", "required", "padding"],
      slots: { children: { accepts: "node", required: true } },
      mount: "data-sk-tile-checkbox",
      template: {
        element: "label",
        part: "root",
        host: true,
        also: ["sk-tile--interactive", "sk-interactive"],
        attrs: { "data-scope": "tile" },
        children: [
          { element: "input", attrs: { type: "checkbox", "data-part": "input" } },
          { element: "span", part: "content", attrs: { "data-part": "content" }, slot: "children" },
          {
            element: "span",
            also: ["sk-checkbox__control", "sk-interactive"],
            attrs: { "aria-hidden": "true", "data-part": "indicator" },
            children: [
              {
                element: "span",
                also: ["sk-checkbox__indicator"],
                attrs: { "data-state": "checked" },
                children: [{ element: "span", attrs: { "data-sk-icon": "check", "data-sk-icon-size": "sm" } }],
              },
              {
                element: "span",
                also: ["sk-checkbox__indicator"],
                attrs: { "data-state": "indeterminate" },
                children: [{ element: "span", attrs: { "data-sk-icon": "remove", "data-sk-icon-size": "sm" } }],
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/tile", name: "TileCheckbox" },
    },

    TileSwitch: {
      intent: ["toggle-card", "setting-tile", "card-with-a-switch", "turn-on-or-off"],
      host: { element: "label" },
      options: ["name", "value", "defaultChecked", "disabled", "required", "padding"],
      slots: { children: { accepts: "node", required: true } },
      mount: "data-sk-tile-switch",
      template: {
        element: "label",
        part: "root",
        host: true,
        also: ["sk-tile--interactive", "sk-interactive"],
        attrs: { "data-scope": "tile" },
        children: [
          // A checkbox wearing `role="switch"`: the state is on/off rather than checked, and there
          // is no native element for it. Same machine, different announcement.
          { element: "input", attrs: { type: "checkbox", role: "switch", "data-part": "input" } },
          { element: "span", part: "content", attrs: { "data-part": "content" }, slot: "children" },
          {
            element: "span",
            also: ["sk-switch__control"],
            attrs: { "aria-hidden": "true", "data-part": "indicator" },
            children: [{ element: "span", also: ["sk-switch__thumb"] }],
          },
        ],
      },
      react: { from: "@skryensya/react/tile", name: "TileSwitch" },
    },

    TileRadioGroup: {
      intent: ["pick-one-card", "plan-picker", "single-select-tiles", "choose-one"],
      host: { element: "div" },
      options: ["name", "defaultValue", "orientation", "disabled", "required", "padding"],
      requires: ["name"],
      slots: {
        items: {
          accepts: "items",
          required: true,
          item: {
            options: {
              value: { type: "string", attr: "value" },
              disabled: { type: "boolean", default: false, attr: "disabled", trueValue: "" },
            },
            // The binding calls it `children`; the contract keys every entry's content by name.
            slots: { label: { accepts: "node", prop: "children", required: true } },
            key: "value",
          },
        },
      },
      mount: "data-sk-tile-radio-group",
      template: {
        /*
         * No part class on the root: the group is a box the machine wires, and the tile paint
         * belongs to each OPTION. React writes nothing here either, and a class the stylesheet does
         * not select would be a divergence standing in for nothing.
         */
        element: "div",
        host: true,
        attrs: { "data-scope": "tile" },
        children: [
          {
            element: "label",
            part: "root",
            also: ["sk-tile--interactive", "sk-interactive"],
            attrs: { "data-scope": "tile", "data-part": "item" },
            // Padding is the OPTION's, not the group's: each tile is the surface being padded.
            options: ["padding"],
            repeat: "items",
            children: [
              {
                element: "input",
                attrs: { type: "radio", "data-part": "input" },
                itemOptions: ["value", "disabled"],
              },
              { element: "span", part: "content", attrs: { "data-part": "content" }, itemSlot: "label" },
              {
                element: "span",
                part: "selectionIndicator",
                attrs: { "aria-hidden": "true", "data-part": "indicator" },
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/tile", name: "TileRadioGroup" },
    },

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
