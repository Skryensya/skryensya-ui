export type CheckedState = boolean | "indeterminate";

export type CheckedChangeDetails = {
  checked: CheckedState;
};

export type RadioValueChangeDetails = {
  value: string | null;
};

export type RadioGroupOrientation = "horizontal" | "vertical";

export const selectionParts = {
  checkbox: "sk-checkbox",
  checkboxInput: "sk-checkbox__input",
  checkboxControl: "sk-checkbox__control",
  checkboxIndicator: "sk-checkbox__indicator",
  checkboxLabel: "sk-checkbox__label",
  radioGroup: "sk-radio-group",
  radio: "sk-radio",
  radioInput: "sk-radio__input",
  radioControl: "sk-radio__control",
  radioIndicator: "sk-radio__indicator",
  radioLabel: "sk-radio__label",
  switch: "sk-switch",
  switchInput: "sk-switch__input",
  switchControl: "sk-switch__control",
  switchThumb: "sk-switch__thumb",
  switchLabel: "sk-switch__label",
} as const;

export type SelectionPart = keyof typeof selectionParts;
export type SelectionPartClass = (typeof selectionParts)[SelectionPart];
