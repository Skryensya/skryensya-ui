/*
 * The five rungs, as DATA: the level token, the name the swatch prints, and the custom property it
 * resolves to. Lives here rather than in either page because it is not prose. `level` is a
 * `data-level` value, `name` is the rung's name in the scale and `token` is a CSS custom property,
 * and all three are the same string in every language.
 *
 * What each page still owns is the NOTE beside it in the table: one sentence of prose per rung,
 * which is the only part of that table a translation changes.
 */
export const elevationLevels = [
  { level: "sunken", name: "Sunken", token: "--elevation-sunken" },
  { level: "flat", name: "Flat", token: "--elevation-flat" },
  { level: "raised", name: "Raised", token: "--elevation-raised" },
  { level: "overlay", name: "Overlay", token: "--elevation-overlay" },
  { level: "modal", name: "Modal", token: "--elevation-modal" },
] as const;
