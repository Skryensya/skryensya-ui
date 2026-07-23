export type InputSize = "sm" | "md" | "lg";

export type InputOptions = {
  size?: InputSize;
  invalid?: boolean;
  disabled?: boolean;
};

/*
 * One appearance contract for every native text control: `ds-input` goes on `<input>`,
 * `<textarea>` and any other native text entry element. A second class per element would be a
 * second set of hooks to keep in sync for what is, visually, the same control.
 */
export const inputParts = {
  root: "ds-input",
} as const;

export type InputPart = keyof typeof inputParts;
export type InputPartClass = (typeof inputParts)[InputPart];
