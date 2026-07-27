export type ComboboxItem = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

export const comboboxParts = {
  root: "sk-combobox",
  label: "sk-combobox__label",
  control: "sk-combobox__control",
  value: "sk-combobox__value",
  selectedItems: "sk-combobox__selected-items",
  selectedItem: "sk-combobox__selected-item",
  selectedItemLabel: "sk-combobox__selected-item-label",
  removeTrigger: "sk-combobox__remove-trigger",
  input: "sk-combobox__input",
  trigger: "sk-combobox__trigger",
  clear: "sk-combobox__clear",
  positioner: "sk-combobox__positioner",
  content: "sk-combobox__content",
  item: "sk-combobox__item",
  itemCopy: "sk-combobox__item-copy",
  itemLabel: "sk-combobox__item-label",
  itemIndicator: "sk-combobox__item-indicator",
  itemDescription: "sk-combobox__item-description",
  empty: "sk-combobox__empty",
  status: "sk-combobox__status",
} as const;

export const comboboxAttrs = {
  root: "data-sk-combobox",
  label: "data-sk-combobox-label",
  control: "data-sk-combobox-control",
  input: "data-sk-combobox-input",
  value: "data-sk-combobox-value",
  selectedItems: "data-sk-combobox-selected-items",
  removeTrigger: "data-sk-combobox-remove-trigger",
  trigger: "data-sk-combobox-trigger",
  clear: "data-sk-combobox-clear",
  positioner: "data-sk-combobox-positioner",
  content: "data-sk-combobox-content",
  item: "data-sk-combobox-item",
  empty: "data-sk-combobox-empty",
  itemText: "data-sk-combobox-item-text",
  itemIndicator: "data-sk-combobox-item-indicator",
  status: "data-sk-combobox-status",
  hint: "data-sk-combobox-hint",
  error: "data-sk-combobox-error",
} as const;

export type ComboboxValueChangeDetails = { value: string[] };
export type ComboboxInputChangeDetails = { inputValue: string };
