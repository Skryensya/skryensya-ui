/** One slider/color input in a `HookPlayground`, and the custom property it writes. */
export type HookControl = {
  /** The custom property this control writes, e.g. `"--sk-loader-size"`. */
  hook: string;
  label: string;
  type: "range" | "color";
  /** Appended to the slider's numeric value (`"px"`, `"s"`). Ignored for `type: "color"`. */
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  /** Starting value, exactly as written to the property (no unit for `"range"`; a hex string for `"color"`). */
  default: string;
};
