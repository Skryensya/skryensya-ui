/*
 * USER SELECT, the pieces shared between the React and Vanilla bindings of a people-picker composed
 * entirely from Select, Combobox and Avatar's own primitives (see each binding for the composition
 * itself: `@skryensya/react/user-select`, `packages/vanilla/src/components/UserSelect.svelte`).
 *
 * Nothing here is a new visual part. The trigger, its control, the positioner, the content box and
 * every item row stay `@skryensya/core/select`'s own `selectAttrs`/`selectParts`; search and item
 * description styling stay `@skryensya/core/combobox`'s. `userSelectAttrs` names only the handful of
 * mount points genuinely new to this composition: the root (its own, so mounting it can never collide
 * with a plain `Select` on the same page), the search field, the list wrapper `composite: false` needs
 * around the rows, and the optional "N selected · Clear all" footer.
 */

export const userSelectAttrs = {
  root: "data-sk-user-select",
  search: "data-sk-user-select-search",
  list: "data-sk-user-select-list",
  empty: "data-sk-user-select-empty",
  status: "data-sk-user-select-status",
  footer: "data-sk-user-select-footer",
  count: "data-sk-user-select-count",
  clear: "data-sk-user-select-clear",
} as const;

export type UserSelectPart = keyof typeof userSelectAttrs;
export type UserSelectAttr = (typeof userSelectAttrs)[UserSelectPart];

export const userSelectEvents = {
  valueChange: "sk:userselectvaluechange",
} as const;

const combiningMarks = /\p{M}+/gu;

/**
 * Diacritic-insensitive fold: "mar" and "María" match in either binding. One function so the two
 * bindings' search never quietly disagree on what counts as a match.
 */
export function userSelectSearchKey(value: string): string {
  return value.normalize("NFD").replace(combiningMarks, "").toLocaleLowerCase();
}
