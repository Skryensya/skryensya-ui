import type { Space } from "./layout.js";

export type TileElement = "div" | "article" | "section" | "li";

export type TileCheckedState = boolean | "indeterminate";
export type TileSurfaceOptions = {
  padding?: Space;
};


export type TileCheckboxChangeDetails = {
  checked: TileCheckedState;
};

export type TileCheckboxOptions = TileSurfaceOptions & {
  id?: string;
  name?: string;
  value?: string;
  checked?: TileCheckedState;
  defaultChecked?: TileCheckedState;
  indeterminate?: boolean;
  disabled?: boolean;
  required?: boolean;
  onCheck?: (details: TileCheckboxChangeDetails) => void;
};

export type TileRadioValueChangeDetails = {
  value: string | null;
};

export type TileRadioGroupOptions = TileSurfaceOptions & {
  id?: string;
  name: string;
  value?: string | null;
  defaultValue?: string | null;
  disabled?: boolean;
  required?: boolean;
  orientation?: "horizontal" | "vertical";
  onValueChange?: (details: TileRadioValueChangeDetails) => void;
};

export type ExpandableTileOpenChangeDetails = {
  open: boolean;
};

export type ExpandableTileOptions = TileSurfaceOptions & {
  id?: string;
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  onOpenChange?: (details: ExpandableTileOpenChangeDetails) => void;
};

export const tileParts = {
  root: "ds-tile",
  interactive: "ds-tile--interactive",
  expandable: "ds-tile--expandable",
  content: "ds-tile__content",
  title: "ds-tile__title",
  description: "ds-tile__description",
  selectionIndicator: "ds-tile__selection-indicator",
  trigger: "ds-tile__trigger",
  chevron: "ds-tile__chevron",
  expandableContent: "ds-tile__expandable-content",
  grid: "ds-tile-grid",
} as const;

export type TilePart = keyof typeof tileParts;
export type TilePartClass = (typeof tileParts)[TilePart];

export const tileScope = "tile";

export const tileDataParts = {
  root: "root",
  content: "content",
  input: "input",
  indicator: "indicator",
  trigger: "trigger",
  chevron: "chevron",
  expandableContent: "content",
  radioItem: "item",
  radioLabel: "label",
} as const;

export const tileEvents = {
  checkedChange: "ds:checkedchange",
  valueChange: "ds:valuechange",
  openChange: "ds:openchange",
} as const;
