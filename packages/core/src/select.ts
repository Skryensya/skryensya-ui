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
  valueChange: "ds-value-change",
} as const;

export const selectParts = {
  native: "ds-select-native",
  root: "ds-select",
  control: "ds-select__control",
  label: "ds-select__label",
  trigger: "ds-select__trigger",
  value: "ds-select__value",
  indicator: "ds-select__indicator",
  positioner: "ds-select__positioner",
  content: "ds-select__content",
  item: "ds-select__item",
  itemText: "ds-select__item-text",
  itemIndicator: "ds-select__item-indicator",
} as const;

export type SelectPart = keyof typeof selectParts;
export type SelectPartClass = (typeof selectParts)[SelectPart];
