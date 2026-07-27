export type NumberFieldValueChangeDetails = {
  value: string;
  valueAsNumber: number;
};

export const numberFieldParts = {
  root: "sk-number-field",
  label: "sk-number-field__label",
  control: "sk-number-field__control",
  input: "sk-number-field__input",
  increment: "sk-number-field__increment",
  decrement: "sk-number-field__decrement",
  scrubber: "sk-number-field__scrubber",
  hint: "sk-number-field__hint",
} as const;

export const numberFieldAttrs = {
  root: "data-sk-number-field",
  label: "data-sk-number-field-label",
  control: "data-sk-number-field-control",
  input: "data-sk-number-field-input",
  increment: "data-sk-number-field-increment",
  decrement: "data-sk-number-field-decrement",
  scrubber: "data-sk-number-field-scrubber",
} as const;
