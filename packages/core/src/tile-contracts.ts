export const tileSharedStateContract = {
  checkbox: {
    initial: { checked: false, dataState: "unchecked" },
    changed: { checked: true, dataState: "checked" },
  },
  radioGroup: {
    initial: { selectedValue: "basic", selectedState: "checked", unselectedState: "unchecked" },
    changed: { selectedValue: "pro", selectedState: "checked", unselectedState: "unchecked" },
  },
  expandable: {
    initial: { dataState: "closed", expanded: "false", contentHidden: true },
    changed: { dataState: "open", expanded: "true", contentHidden: false },
  },
} as const;

export type TileSharedStateBehavior = keyof typeof tileSharedStateContract;

export const tileSharedAccessibilityContract = {
  link: { role: "link" },
  button: { role: "button", disabled: true },
  checkbox: { role: "checkbox", formAssociated: true },
  radioGroup: { role: "radiogroup", orientation: "vertical", formAssociated: true },
  expandable: { triggerRole: "button", expanded: "false", contentHidden: true },
} as const;

export type TileSharedAccessibilityBehavior = keyof typeof tileSharedAccessibilityContract;

export const tileBehaviorContract = {
  state: tileSharedStateContract,
  accessibility: tileSharedAccessibilityContract,
} as const;

export const tileAccessibilityContract = tileSharedAccessibilityContract;