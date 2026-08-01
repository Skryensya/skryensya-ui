import type { ComponentContract } from "./contract.js";
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

/*
 * CODE PREVIEW, the contract — a block of code with a window over it.
 *
 * The enhancer shipped with no React counterpart, so this could not be a contract: one binding is
 * not a contract, it is a script. Writing the missing half is what made it publishable, the same as
 * `copy-button`, `dialog` and `command-palette`.
 *
 * HIGHLIGHTING IS NOT THIS COMPONENT'S JOB. Shiki runs at build or on the server and never in the
 * browser, so the code arrives already marked up and `children` is whatever the author produced.
 * What this owns is the chrome: the label row, the disclosure, and the LINE COUNTS that turn
 * "show 40 more lines" into a real number. Those counts are machine input in the strict sense —
 * they are measured where the code is highlighted and authored markup has no other channel for them.
 *
 * ONE SIGNATURE, NOT TWO, for now. The docs' own `CodeBlock` also renders a DENSITY variant: two
 * panels, condensed and full, with a switch between them. That is a second signature with its own
 * anatomy and its own required pair of slots, and it is deliberately not guessed at here.
 */
export const codePreviewContract = {
  id: "code-preview",
  css: "@skryensya/core/components/code-preview.css",
  parts: codePreviewParts,

  options: {
    /** The panel is taller than its window, so it gets a disclosure control. */
    collapsible: { type: "boolean", default: false, attr: codePreviewAttrs.collapsible, trueValue: "", machineInput: true },
    /** Total lines, and how many the collapsed window shows. Counted where the code is made. */
    lines: { type: "string", attr: codePreviewAttrs.lines, machineInput: true },
    previewLines: { type: "string", attr: codePreviewAttrs.previewLines, machineInput: true },
    /** What the disclosure says while collapsed, and once open. */
    moreLabel: { type: "string", default: "Ver todo", attr: "data-more-label", machineInput: true },
    lessLabel: { type: "string", default: "Ver menos", attr: codePreviewAttrs.expandedLabel, machineInput: true },
    /**
     * What the density switch announces. An option, not a slot: it lands on `aria-label`, and a
     * slot would need a way to copy its text onto an attribute of a node it does not render.
     * It says what the switch DOES, because the words at each end are out of a screen reader's reach.
     */
    switchLabel: { type: "string", default: "Mostrar la versión completa", attr: "aria-label" },
  },

  signatures: {
    CodePreview: {
      intent: ["code-block", "show-a-snippet", "long-code-with-a-window"],
      host: { element: "div" },
      mount: codePreviewAttrs.root,
      options: ["collapsible", "lines", "previewLines", "moreLabel", "lessLabel"],
      slots: {
        /** The code itself, already highlighted. */
        children: { accepts: "node", required: true },
        /** What this snippet is: a filename, a language, a step. */
        label: { accepts: "text" },
        /** A second line beside the label — a caveat, a version. */
        note: { accepts: "text" },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          {
            element: "div",
            part: "label",
            whenGiven: ["label", "note"],
            children: [
              {
                element: "span",
                part: "meta",
                children: [
                  { element: "span", slot: "label", whenGiven: "label" },
                  { element: "span", slot: "note", whenGiven: "note" },
                ],
              },
            ],
          },
          {
            element: "div",
            part: "preview",
            children: [{ element: "div", part: "viewport", slot: "children" }],
          },
          {
            element: "div",
            part: "more",
            mount: codePreviewAttrs.more,
            whenGiven: "collapsible",
            children: [
              {
                element: "button",
                part: "toggle",
                also: ["sk-button", "sk-interactive"],
                mount: codePreviewAttrs.toggle,
                attrs: {
                  type: "button",
                  "aria-expanded": "false",
                  "data-size": "sm",
                  "data-variant": "ghost",
                },
                children: [
                  { element: "span", mount: codePreviewAttrs.toggleLabel, textFromOption: "moreLabel" },
                  /* Filled by the enhancer once there is a layout to measure. */
                  { element: "span", part: "toggleCount" },
                  {
                    element: "span",
                    part: "toggleIcon",
                    children: [
                      { element: "span", attrs: { "data-sk-icon": "chevron-down", "data-sk-icon-size": "sm" } },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/code-preview", name: "CodePreview" },
    },

    /*
     * THE DENSITY VARIANT — two panels and a switch between them.
     *
     * A second signature rather than an option on the first, because the anatomy genuinely differs:
     * one panel becomes two, each addressable, and a control appears that has no meaning without
     * them. `CodePreview` with a `density` flag would have carried two slots that are required when
     * the flag is set and forbidden when it is not, which is a signature wearing a disguise.
     *
     * The switch is a real `sk-switch`, not a pair of buttons: one binary choice with two named
     * ends. The ends are labels BESIDE it, not its accessible name — the name says what the switch
     * does, which is what a screen reader needs when the words beside it are out of reach.
     */
    "CodePreview.density": {
      intent: ["condensed-and-full-code", "two-levels-of-detail", "code-with-a-density-switch"],
      host: { element: "div" },
      mount: codePreviewAttrs.root,
      options: ["collapsible", "lines", "previewLines", "moreLabel", "lessLabel", "switchLabel"],
      slots: {
        /** The short version, shown first. */
        condensed: { accepts: "node", required: true },
        /** Everything, behind the switch. */
        full: { accepts: "node", required: true },
        label: { accepts: "text" },
        /** What each end of the switch is called, and what the switch itself announces. */
        condensedLabel: { accepts: "text", required: true },
        fullLabel: { accepts: "text", required: true },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        attrs: { "data-sk-code-preview-density": "condensed" },
        children: [
          {
            element: "div",
            part: "label",
            children: [
              {
                element: "span",
                part: "meta",
                children: [{ element: "span", slot: "label", whenGiven: "label" }],
              },
              {
                element: "div",
                part: "density",
                children: [
                  {
                    element: "span",
                    part: "densityEdge",
                    attrs: { "data-density": "condensed" },
                    slot: "condensedLabel",
                  },
                  {
                    element: "label",
                    also: ["sk-switch"],
                    children: [
                      {
                        element: "input",
                        also: ["sk-switch__input"],
                        mount: codePreviewAttrs.densityInput,
                        attrs: { type: "checkbox", role: "switch" },
                        options: ["switchLabel"],
                      },
                      {
                        element: "span",
                        also: ["sk-switch__control"],
                        attrs: { "aria-hidden": "true" },
                        children: [{ element: "span", also: ["sk-switch__thumb"] }],
                      },
                    ],
                  },
                  {
                    element: "span",
                    part: "densityEdge",
                    attrs: { "data-density": "full" },
                    slot: "fullLabel",
                  },
                ],
              },
            ],
          },
          {
            element: "div",
            part: "preview",
            children: [
              {
                element: "div",
                part: "viewport",
                attrs: { "data-sk-code-preview-density-panel": "condensed" },
                slot: "condensed",
              },
              {
                element: "div",
                part: "viewport",
                attrs: { "data-sk-code-preview-density-panel": "full" },
                slot: "full",
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/code-preview", name: "CodePreviewDensity" },
    },

  },
} as const satisfies ComponentContract;
