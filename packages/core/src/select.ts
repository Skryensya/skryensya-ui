export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectValueChangeDetails = {
  value: string[];
};

export type SelectOptions = {
  id?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  value?: string[];
  defaultValue?: string[];
  placeholder?: string;
  options?: readonly SelectOption[];
  onValueChange?: (details: SelectValueChangeDetails) => void;
};

export const selectEvents = {
  valueChange: "sk-value-change",
} as const;

export const selectParts = {
  native: "sk-select-native",
  root: "sk-select",
  control: "sk-select__control",
  label: "sk-select__label",
  trigger: "sk-select__trigger",
  value: "sk-select__value",
  indicator: "sk-select__indicator",
  positioner: "sk-select__positioner",
  content: "sk-select__content",
  item: "sk-select__item",
  itemText: "sk-select__item-text",
  itemIndicator: "sk-select__item-indicator",
} as const;

export type SelectPart = keyof typeof selectParts;
export type SelectPartClass = (typeof selectParts)[SelectPart];
