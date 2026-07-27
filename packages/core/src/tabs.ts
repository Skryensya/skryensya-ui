export type TabsValueChangeDetails = {
  value: string;
};

export type TabsFocusChangeDetails = {
  focusedValue: string;
};

export type TabsOptions = {
  id?: string;
  value?: string | null;
  defaultValue?: string | null;
  orientation?: "horizontal" | "vertical";
  activationMode?: "manual" | "automatic";
  loopFocus?: boolean;
  composite?: boolean;
  deselectable?: boolean;
  onValueChange?: (details: TabsValueChangeDetails) => void;
  onFocusChange?: (details: TabsFocusChangeDetails) => void;
};


export const tabsParts = {
  root: "sk-tabs",
  list: "sk-tabs__list",
  trigger: "sk-tabs__trigger",
  content: "sk-tabs__content",
  indicator: "sk-tabs__indicator",
} as const;

export type TabsPart = keyof typeof tabsParts;
export type TabsPartClass = (typeof tabsParts)[TabsPart];

