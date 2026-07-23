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
  root: "ds-accordion",
} as const;

export const accordionEvents = {
  valueChange: "ds:accordionvaluechange",
} as const;
