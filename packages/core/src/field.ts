export type FieldOptions = {
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
};

/*
 * The chrome around any control, label, hint, error. Deliberately independent of `input`: a
 * field wraps a select, a group of checkboxes or a textarea just as readily, and naming it for
 * the control it most often holds would make the name a lie the first time it holds another.
 */
export const fieldParts = {
  root: "ds-field",
  label: "ds-field__label",
  hint: "ds-field__hint",
  error: "ds-field__error",
  requiredIndicator: "ds-field__required",
} as const;

export type FieldPart = keyof typeof fieldParts;
export type FieldPartClass = (typeof fieldParts)[FieldPart];
