/*
 * ICON TOGGLE, the stacked-face morph that Icon State Button (`icon-state-button.ts`, decision 33)
 * composes.
 *
 * An icon-only button whose faces occupy one cell and cross-fade. The PATTERN owns the stack
 * and the morph (`patterns/icon-toggle.css`); which face is current is the component's. Faces
 * are marked `data-face`. The current one carries `data-active`, or a FOUC rule sets
 * `--sk-icon-toggle-on: 1` on the matching face so paint and runtime stay aligned.
 *
 * It is a pattern and not a component for the same reason as Anclaje (decision 8): a second
 * control already needs this exact structure. Until decision 33 that was two components
 * (ThemeToggle, CopyButton) each hand-writing the same anatomy; now it is the one signature built
 * on it, and whatever a consumer composes on top.
 *
 * Flat class, composed the way `sk-interactive` composes with `sk-button`:
 * `class="sk-button sk-interactive sk-icon-toggle sk-icon-state-button"`.
 */

export const iconToggleParts = {
  root: "sk-icon-toggle",
} as const;

export type IconTogglePart = keyof typeof iconToggleParts;
export type IconTogglePartClass = (typeof iconToggleParts)[IconTogglePart];

export const iconToggleAttrs = {
  /** Face marker on each stacked icon. The value is the component's state name. */
  face: "data-face",
  /** Generic "this face is current". FOUC mappings may light a face without it. */
  active: "data-active",
} as const;

export type IconToggleAttr = keyof typeof iconToggleAttrs;
export type IconToggleAttrName = (typeof iconToggleAttrs)[IconToggleAttr];

export const iconToggleHooks = {
  /** 0 rest / 1 current. FOUC rules set this on the matching `[data-face]`. */
  on: "--sk-icon-toggle-on",
  restScale: "--sk-icon-toggle-rest-scale",
  restBlur: "--sk-icon-toggle-rest-blur",
  duration: "--sk-icon-toggle-transition-duration",
  easing: "--sk-icon-toggle-transition-easing",
} as const;
