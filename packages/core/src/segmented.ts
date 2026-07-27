/*
 * SEGMENTED CONTROL, a single choice from a small, fixed set, shown all at once.
 *
 * It is a radio group wearing a button-bar's clothes: exactly one option is selected, the options
 * are few and mutually exclusive, and the whole set is visible. For navigation between panels use
 * Tabs; for many options or free text use Select.
 */
export type SegmentedOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export const segmentedParts = {
  root: "sk-segmented",
  option: "sk-segmented__option",
  indicator: "sk-segmented__indicator",
} as const;

export type SegmentedPart = keyof typeof segmentedParts;
export type SegmentedPartClass = (typeof segmentedParts)[SegmentedPart];
