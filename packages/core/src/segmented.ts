import type { ComponentContract } from "./contract.js";

/*
 * SEGMENTED CONTROL, a single choice from a small, fixed set, shown all at once.
 *
 * It is a radio group wearing a button-bar's clothes: exactly one option is selected, the options
 * are few and mutually exclusive, and the whole set is visible. For navigation between panels use
 * Tabs; for many options or free text use Select.
 */
export type SegmentedOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export const segmentedParts = {
  root: "sk-segmented",
  option: "sk-segmented__option",
  indicator: "sk-segmented__indicator",
} as const;

export type SegmentedPart = keyof typeof segmentedParts;
export type SegmentedPartClass = (typeof segmentedParts)[SegmentedPart];

/*
 * A small exclusive choice, shown as one bar. Radios by role (`radiogroup` of `radio`) rather than by
 * element, because the options are buttons, which is what gives them a shared indicator to slide.
 *
 * ONE tab stop: only the selected option is reachable, the arrows move between them. That roving
 * tabindex is why a Toolbar counts a Segmented as one stop and not N (decision 27).
 */
export const segmentedContract = {
  id: "segmented",
  css: "@skryensya/core/components/segmented.css",
  parts: segmentedParts,

  options: {
    /**
     * Which option is selected. A group property: exclusivity means only one can be.
     *
     * React spells it `defaultValue`. Emitting `value` there hands React its CONTROLLED prop with no
     * `onValueChange` beside it, which freezes the control: measured on /componentes/segmented,
     * clicking the second option moved the Vanilla stage and left React on the first. The markup's
     * `data-value` is a starting point the machine then owns: that is what `defaultValue` means.
     * Slider, Tabs, RadioGroup and TimeField all carry this line; Segmented never got it.
     */
    value: { type: "string", attr: "data-value", prop: "defaultValue" },
  },

  signatures: {
    Segmented: {
      intent: ["small-exclusive-choice", "view-switcher", "two-or-three-options"],
      host: { element: "div" },
      options: ["value"],
      requires: ["value"],
      slots: {
        items: {
          accepts: "items",
          prop: "options",
          required: true,
          item: {
            key: "value",
            options: {
              value: { type: "string", attr: "data-value" },
              disabled: { type: "boolean", default: false, attr: "disabled", trueValue: "" },
            },
            slots: { label: { accepts: "text", required: true } },
          },
        },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        attrs: { role: "radiogroup" },
        children: [
          // The sliding highlight. Decorative: the selected option already announces itself.
          { element: "span", part: "indicator", attrs: { "aria-hidden": "true" } },
          {
            element: "button",
            part: "option",
            also: ["sk-interactive"],
            attrs: { type: "button", role: "radio" },
            // The enhancer scans for these, so each option carries its own mount mark.
            mount: "data-sk-segmented-option",
            repeat: "items",
            itemOptions: ["value", "disabled"],
            selectedBy: { option: "value", attr: "aria-checked" },
            itemSlot: "label",
          },
        ],
      },
      // The export is `SegmentedControl`; the signature is `Segmented` because that is the concept.
      // Naming them apart is the point of a signature id being separate from an export name.
      react: { from: "@skryensya/react/segmented", name: "SegmentedControl" },
      mount: "data-sk-segmented",
    },
  },
} as const satisfies ComponentContract;
