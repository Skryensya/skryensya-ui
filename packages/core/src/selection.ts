export type CheckedState = boolean | "indeterminate";

export type CheckedChangeDetails = {
  checked: CheckedState;
};

export type RadioValueChangeDetails = {
  value: string | null;
};

export type RadioGroupOrientation = "horizontal" | "vertical";

export const selectionParts = {
  checkbox: "ds-checkbox",
  checkboxInput: "ds-checkbox__input",
  checkboxControl: "ds-checkbox__control",
  checkboxIndicator: "ds-checkbox__indicator",
  checkboxLabel: "ds-checkbox__label",
  radioGroup: "ds-radio-group",
  radio: "ds-radio",
  radioInput: "ds-radio__input",
  radioControl: "ds-radio__control",
  radioIndicator: "ds-radio__indicator",
  radioLabel: "ds-radio__label",
  switch: "ds-switch",
  switchInput: "ds-switch__input",
  switchControl: "ds-switch__control",
  switchThumb: "ds-switch__thumb",
  switchLabel: "ds-switch__label",
} as const;

export type SelectionPart = keyof typeof selectionParts;
export type SelectionPartClass = (typeof selectionParts)[SelectionPart];
