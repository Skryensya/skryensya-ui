import type { ComponentContract, OptionValue } from "./contract.js";

export type TabsValueChangeDetails = {
  value: string;
};

export type TabsFocusChangeDetails = {
  focusedValue: string;
};

export const tabsParts = {
  root: "sk-tabs",
  list: "sk-tabs__list",
  trigger: "sk-tabs__trigger",
  content: "sk-tabs__content",
} as const;

export type TabsPart = keyof typeof tabsParts;
export type TabsPartClass = (typeof tabsParts)[TabsPart];

/*
 * The first machine-backed contract, and the one that made collections necessary.
 *
 * A tab is not a child of the tab list: its label sits in a trigger, its body sits in a panel that is
 * the trigger's uncle, and what pairs them is a key. Composed as children, an author would have to
 * write that pairing twice and keep it in step: the enhancer literally scans for `data-value` on
 * both sides and drops any trigger whose panel it cannot find. So a tab is an ENTRY, and the template
 * repeats over the collection from two places.
 *
 * The state a machine writes (`data-selected`, `aria-controls`, roving tabindex) is deliberately
 * absent here: parts are ours and state is the machine's. The contract describes what a consumer
 * authors, and the machine takes it from there.
 */
export const tabsContract = {
  id: "tabs",
  css: "@skryensya/core/components/tabs.css",
  parts: tabsParts,

  options: {
    orientation: {
      type: "enum",
      values: ["horizontal", "vertical"],
      default: "horizontal",
      attr: "data-orientation",
    },
    /** `automatic` selects on arrow, `manual` waits for Enter or Space. */
    activationMode: {
      type: "enum",
      values: ["automatic", "manual"],
      default: "automatic",
      attr: "data-activation-mode",
      machineInput: true,
    },
    /**
     * Which tab starts selected. Falls back to the first enabled one when it names none.
     * Markup: `data-value`. React: `defaultValue`. React's `value` is controlled, and a usage
     * tree has no change handler to feed it (same rename Slider and TimeField make).
     */
    value: { type: "string", attr: "data-value", prop: "defaultValue", machineInput: true },
    /**
     * Paint size for the trigger row: height, inline padding, label size. CSS-only, the same
     * axis Button's `size` is — not a machine input, the roving tabindex and selection behave
     * identically at every size. No `lg`: a bigger tab strip has not come up as a real need, and
     * an unused rung is one more thing the surface promises and nobody exercises.
     */
    size: {
      type: "enum",
      values: ["sm", "md"],
      default: "md",
      attr: "data-size",
    },
  },

  signatures: {
    Tabs: {
      intent: ["tabs", "switch-between-panels", "sections-in-one-region"],
      host: { element: "div" },
      options: ["orientation", "activationMode", "value", "size"],
      slots: {
        items: {
          accepts: "items",
          required: true,
          item: {
            key: "value",
            options: {
              value: { type: "string", attr: "data-value" },
              disabled: { type: "boolean", default: false, attr: "data-disabled", trueValue: "" },
            },
            slots: {
              label: { accepts: "node", required: true },
              children: { accepts: "node", required: true },
            },
          },
        },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        attrs: { "data-sk-tabs": "" },
        children: [
          {
            element: "div",
            part: "list",
            attrs: { "data-sk-tabs-list": "" },
            // The tablist is what carries the accessible name, not the box around it.
            attrsFor: ["aria-label", "aria-labelledby"],
            children: [
              {
                element: "button",
                part: "trigger",
                also: ["sk-interactive"],
                attrs: { "data-sk-tabs-trigger": "", type: "button" },
                repeat: "items",
                itemOptions: ["value", "disabled"],
                itemSlot: "label",
              },
            ],
          },
          // The panels are siblings of the LIST, not of the triggers. One entry, two elements, far
          // apart on purpose: a panel cannot live inside the tablist.
          {
            element: "div",
            part: "content",
            attrs: { "data-sk-tabs-content": "" },
            repeat: "items",
            itemOptions: ["value"],
            itemSlot: "children",
          },
        ],
      },
      react: { from: "@skryensya/react/tabs", name: "Tabs" },
    },
  },

  a11y: [
    {
      when: { orientation: "present" },
      requiresOneOf: ["aria-label", "aria-labelledby"],
      because: "The tab list is a named region; a page with two of them needs to tell them apart.",
    },
  ],
} as const satisfies ComponentContract;

export type TabsOrientation = OptionValue<typeof tabsContract.options.orientation>;
export type TabsSize = OptionValue<typeof tabsContract.options.size>;

/*
 * The machine's own inputs. Deliberately NOT derived from the contract: these are runtime wiring
 * (callbacks, controlled value, focus behaviour), and a contract describes what a consumer authors,
 * not what a machine is configured with. Overlap in name (`orientation`) is not overlap in kind.
 */
export type TabsOptions = {
  id?: string;
  value?: string | null;
  defaultValue?: string | null;
  orientation?: TabsOrientation;
  activationMode?: OptionValue<typeof tabsContract.options.activationMode>;
  loopFocus?: boolean;
  composite?: boolean;
  deselectable?: boolean;
  onValueChange?: (details: TabsValueChangeDetails) => void;
  onFocusChange?: (details: TabsFocusChangeDetails) => void;
};
