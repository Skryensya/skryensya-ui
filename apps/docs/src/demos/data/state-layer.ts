import type { Translate } from "../../i18n";

/*
 * The six states the tiles demonstrate, as DATA.
 *
 * Only the first one is a word: the other five are the state names the system itself uses
 * (`hover`, `focus`, `pressed`, `selected`, `disabled`), which is the vocabulary the page teaches
 * and is the same token in every language. `peek` is how the demo FORCES a state that would
 * otherwise need a real pointer or a real focus to see.
 */
export const stateLabels = (t: Translate) =>
  [
    { label: t("demo.stateLayer.interactive") },
    { label: "Hover", peek: "hover" },
    { label: "Focus", peek: "focus" },
    { label: "Pressed", peek: "pressed" },
    { label: "Selected", selected: "true" },
    { label: "Disabled", disabled: "true" },
  ] as const;

type StateItem = ReturnType<typeof stateLabels>[number];

/** The attributes one tile needs, with only the ones that state actually uses written out. */
export const stateAttrs = (baseClass: string, item: StateItem): Record<string, string> => ({
  class: baseClass,
  ...("peek" in item && item.peek ? { "data-peek": item.peek } : {}),
  ...("selected" in item && item.selected ? { "aria-selected": item.selected } : {}),
  ...("disabled" in item && item.disabled ? { "aria-disabled": item.disabled } : {}),
});
