export type CodePreviewDensity = "condensed" | "full";

/**
 * Stable anatomy for a Shiki-rendered code preview.
 *
 * Core owns only the authored DOM contract. Highlighting stays at build/SSR time; the opt-in
 * Vanilla enhancer binds the density and disclosure controls without importing Shiki in the browser.
 */
export const codePreviewParts = {
  root: "sk-code-preview",
  label: "sk-code-preview__label",
  meta: "sk-code-preview__meta",
  density: "sk-code-preview__density",
  densityEdge: "sk-code-preview__density-edge",
  preview: "sk-code-preview__preview",
  viewport: "sk-code-preview__viewport",
  more: "sk-code-preview__more",
  toggle: "sk-code-preview__toggle",
  toggleCount: "sk-code-preview__toggle-count",
  toggleIcon: "sk-code-preview__toggle-icon",
} as const;

export type CodePreviewPart = keyof typeof codePreviewParts;
export type CodePreviewPartClass = (typeof codePreviewParts)[CodePreviewPart];

/** Data attributes consumed by the opt-in Vanilla enhancer. */
export const codePreviewAttrs = {
  root: "data-sk-code-preview",
  density: "data-sk-code-preview-density",
  densityInput: "data-sk-code-preview-density-input",
  densityPanel: "data-sk-code-preview-density-panel",
  collapsible: "data-sk-code-preview-collapsible",
  /** Present when the Condensed panel itself is long enough to disclose (not only Full). */
  condensedCollapsible: "data-sk-code-preview-condensed-collapsible",
  expanded: "data-sk-code-preview-expanded",
  lines: "data-sk-code-preview-lines",
  condensedLines: "data-sk-code-preview-condensed-lines",
  previewLines: "data-sk-code-preview-preview-lines",
  more: "data-sk-code-preview-more",
  toggle: "data-sk-code-preview-toggle",
  toggleLabel: "data-sk-code-preview-toggle-label",
  expandedLabel: "data-sk-code-preview-expanded-label",
  expandedAriaLabel: "data-sk-code-preview-expanded-aria-label",
} as const;

export type CodePreviewAttr = keyof typeof codePreviewAttrs;
export type CodePreviewAttrName = (typeof codePreviewAttrs)[CodePreviewAttr];
