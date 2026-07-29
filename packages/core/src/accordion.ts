import type { ComponentContract } from "./contract.js";

export type AccordionType = "single" | "multiple";

export type AccordionValue = string | readonly string[] | null;

export type AccordionValueChangeDetails = {
  value: AccordionValue;
};

export type AccordionOptions = {
  type?: AccordionType;
  value?: AccordionValue;
  defaultValue?: AccordionValue;
  collapsible?: boolean;
  disabled?: boolean;
  onValueChange?: (details: AccordionValueChangeDetails) => void;
};


export const accordionDataParts = {
  root: "root",
  item: "item",
  trigger: "trigger",
  content: "content",
} as const;

export const accordionScope = "accordion";

/** Class on the coordinating root, joins expandable Tiles into one framed stack. */
export const accordionParts = {
  root: "sk-accordion",
} as const;

export const accordionEvents = {
  valueChange: "sk:accordionvaluechange",
} as const;

/**
 * A stack of expandable tiles that agree on how many can be open.
 *
 * The coordination is the whole component: each item runs its own collapsible machine (ADR-24 — one
 * accordion machine hid the content the moment it closed, killing the animation), and what the root
 * owns is the RULE — single or multiple, and whether the open one may close again.
 *
 * Its items are ExpandableTiles wearing a different `data-part`. That is not a shortcut: an
 * accordion section IS an expandable surface, and giving it its own anatomy would mean two
 * stylesheets that must be kept looking identical forever.
 */
export const accordionContract = {
  id: "accordion",
  css: "@skryensya/core/components/accordion.css",
  parts: { ...accordionParts, item: "sk-tile", trigger: "sk-tile__trigger", content: "sk-tile__expandable-content" },

  options: {
    /** How many sections may be open. `single` is the default because it is what keeps a page short. */
    type: { type: "enum", values: ["single", "multiple"], default: "single", attr: "data-type" },
    /** Whether the open section may be closed again. Only meaningful when `type` is `single`. */
    collapsible: { type: "boolean", default: true, attr: "data-collapsible", machineInput: true },
    disabled: { type: "boolean", default: false, attr: "data-disabled", trueValue: "", machineInput: true },
    /** Which section this one is, so the root can say which is open. Required: the rule needs a name. */
    value: { type: "string", attr: "data-value" },
    /** Starts expanded. Read once; after that the machine owns it. */
    defaultOpen: { type: "boolean", default: false, attr: "data-default-open", trueValue: "", machineInput: true },
  },

  signatures: {
    Accordion: {
      intent: ["accordion", "faq", "collapsible-sections", "one-open-at-a-time"],
      host: { element: "div" },
      options: ["type", "collapsible", "disabled"],
      slots: {
        children: { accepts: "signature", of: ["Accordion.Item"], required: true },
      },
      mount: "data-sk-accordion",
      template: {
        element: "div",
        part: "root",
        host: true,
        attrs: { "data-scope": "accordion", "data-part": "root" },
        slot: "children",
      },
      react: { from: "@skryensya/react/accordion", name: "Accordion" },
    },

    "Accordion.Item": {
      intent: ["accordion-section", "faq-entry"],
      host: { element: "section" },
      parents: ["Accordion"],
      options: ["value", "defaultOpen", "disabled"],
      requires: ["value"],
      slots: {
        children: {
          accepts: "signature",
          of: ["Accordion.Trigger", "Accordion.Content"],
          required: true,
          ordered: true,
          cardinality: { "Accordion.Trigger": "one", "Accordion.Content": "one" },
        },
      },
      template: {
        element: "section",
        part: "item",
        host: true,
        also: ["sk-tile--interactive", "sk-tile--expandable", "sk-interactive"],
        // `item`, not `root`: the coordinator finds its sections by this, and the tile paint is the same.
        attrs: { "data-scope": "tile", "data-part": "item" },
        slot: "children",
      },
      react: { from: "@skryensya/react/accordion", name: "Accordion.Item" },
    },

    "Accordion.Trigger": {
      intent: ["accordion-header", "section-toggle"],
      host: { element: "button" },
      parents: ["Accordion.Item"],
      options: [],
      slots: { children: { accepts: "node", required: true } },
      template: {
        element: "button",
        part: "trigger",
        host: true,
        attrs: { type: "button", "data-scope": "tile", "data-part": "trigger" },
        slot: "children",
      },
      react: { from: "@skryensya/react/accordion", name: "Accordion.Trigger" },
    },

    "Accordion.Content": {
      intent: ["accordion-body", "the-answer"],
      host: { element: "div" },
      parents: ["Accordion.Item"],
      options: [],
      slots: { children: { accepts: "node", required: true } },
      template: {
        element: "div",
        part: "content",
        host: true,
        attrs: { "data-scope": "tile", "data-part": "content" },
        slot: "children",
      },
      react: { from: "@skryensya/react/accordion", name: "Accordion.Content" },
    },
  },
} as const satisfies ComponentContract;
