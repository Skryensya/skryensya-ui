/** Stable anatomy for the declarative CopyButton enhancer. */
export const copyButtonParts = {
  root: "sk-copy-button",
  icon: "sk-copy-button__icon",
  label: "sk-copy-button__label",
} as const;

export type CopyButtonPart = keyof typeof copyButtonParts;
export type CopyButtonPartClass = (typeof copyButtonParts)[CopyButtonPart];

export const copyButtonAttrs = {
  root: "data-sk-copy-button",
  target: "data-sk-copy-button-target",
  state: "data-sk-copy-button-state",
  icon: "data-sk-copy-button-icon",
  label: "data-sk-copy-button-label",
  successLabel: "data-sk-copy-button-success-label",
  errorLabel: "data-sk-copy-button-error-label",
  successAriaLabel: "data-sk-copy-button-success-aria-label",
  errorAriaLabel: "data-sk-copy-button-error-aria-label",
} as const;

export type CopyButtonAttr = keyof typeof copyButtonAttrs;
export type CopyButtonAttrName = (typeof copyButtonAttrs)[CopyButtonAttr];
