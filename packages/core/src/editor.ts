import type { ComponentContract } from "./contract.js";

/*
 * EDITOR: the contract; the same half-authored/half-derived split ColorPicker/DatePicker make.
 *
 * The TOOLBAR and CONTENT surface are markup shells only: an empty container div for each, found
 * by their part classes and filled by the binding. Nothing about which buttons exist or what a
 * selection currently has active is templated here — that is derived from ProseMirror's own
 * `EditorState`, exactly as ColorPicker's popover panel is derived from a Zag machine's state
 * rather than templated in `color-picker.ts`. Initial content is a plain STRING option
 * (`defaultValue`, HTML markup), the same shape ColorPicker's own `value` option already uses for
 * its own string-shaped initial state, not a slotted subtree: there is no live JS-diffed child
 * reconciliation happening here the way there is for an ordinary `children` slot, and a
 * controlled contenteditable surface fights its own DOM mutations every render (the same reason
 * ColorPicker's `value` maps to React's `defaultValue`, not a controlled `value`).
 *
 * `Editor` bakes the toolbar in — the only signature. There is deliberately no toolbar-less
 * surface-only escape hatch: every Editor instance ships with its own formatting bar.
 */

/**
 * The command set a toolbar button can address, and the ONLY place it is spelled — @skryensya/
 * editor's own `editorCommands` table imports this same array, so the contract's button set and
 * the engine's implementation table can never drift silently out of sync.
 */
export const editorCommandNames = [
  "toggleBold",
  "toggleItalic",
  "toggleUnderline",
  "toggleCode",
  "heading1",
  "heading2",
  "heading3",
  "toggleBulletList",
  "toggleOrderedList",
  "toggleBlockquote",
  "toggleCodeBlock",
  "undo",
  "redo",
  "toggleLink",
] as const;

export type EditorCommandName = (typeof editorCommandNames)[number];

export const editorParts = {
  root: "sk-editor",
  /* The toolbar container itself uses Toolbar's OWN part class (`sk-toolbar`, via `also` on
   * `toolbarTemplate` below), not one of these — this is only the button's own CSS hook, dynamic
   * content that has no Toolbar-contract equivalent to borrow. */
  toolbarButton: "sk-editor__toolbar-button",
  content: "sk-editor__content",
  hiddenInput: "sk-editor__hidden-input",
} as const;

export const editorAttrs = {
  root: "data-sk-editor",
  content: "data-sk-editor-content",
  hiddenInput: "data-sk-editor-hidden-input",
  /** The toolbar-button click target. Read off `event.target.closest(...)` by the Vanilla binding. */
  command: "data-sk-editor-command",
} as const;

/** Same visually-hidden recipe as ColorPicker's own `hiddenInput` node — real, but never seen. */
const hiddenInputStyle =
  "border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px;white-space:nowrap;word-wrap:normal;";

/** Shared by both signatures — the hidden form-submit node and the empty content shell ProseMirror
 *  mounts into. Written twice (once per signature's own `template` literal) rather than factored
 *  into a shared function: `as const satisfies ComponentContract` needs each signature's template
 *  to stay one literal object for its exact shape to survive, and a conditionally-built object
 *  widens `attrs`/`children` into a union `tsc` then rejects against `ContractTemplate`. */
const hiddenInputTemplate = {
  element: "textarea",
  part: "hiddenInput",
  mount: editorAttrs.hiddenInput,
  attrs: { "aria-hidden": "true", tabindex: "-1", style: hiddenInputStyle },
  options: ["name"],
  optionAttrs: { name: "name" },
} as const;

const contentTemplate = {
  element: "div",
  part: "content",
  /* Composes the shared field-chrome pattern (`input.ts`/`input.css`) so this surface reads as
   * the SAME box as Textarea — border, radius, padding, focus ring, invalid/disabled states, all
   * for free from `.sk-input`'s own custom properties. A consumer imports `input.css` alongside
   * `editor.css`, same as ColorPicker importing `button.css` for its own `also: ["sk-button"]`. */
  also: ["sk-input"],
  mount: editorAttrs.content,
  attrs: { role: "textbox", "aria-multiline": "true", tabindex: "0" },
  options: ["label"],
} as const;

/* The toolbar container reuses `Toolbar`'s OWN class and mount point (`toolbarAttrs.root`,
 * `"data-sk-toolbar"`) rather than inventing a second bar-of-controls pattern: authored/vanilla
 * markup gets Toolbar's real roving-tabindex enhancer for free (it mounts on ANY matching
 * `[data-sk-toolbar]`, this one included), and the React binding renders the real `<Toolbar>`
 * component here, so both bindings produce the identical class/role/aria shape this template
 * describes. A consumer imports `toolbar.css` alongside `editor.css` for the same reason noted
 * on `contentTemplate` above. */
const toolbarTemplate = {
  element: "div",
  part: "toolbar",
  also: ["sk-toolbar"],
  mount: "data-sk-toolbar",
  options: ["toolbarLabel"],
  optionAttrs: { toolbarLabel: "aria-label" },
  attrs: { role: "toolbar" },
} as const;

export const editorContract = {
  id: "editor",
  css: "@skryensya/core/components/editor.css",
  parts: editorParts,

  options: {
    name: { type: "string", attr: "data-name", machineInput: true },
    defaultValue: { type: "string", attr: "data-default-value", machineInput: true },
    placeholder: { type: "string", attr: "data-placeholder", machineInput: true },
    readOnly: { type: "boolean", default: false, attr: "data-readonly", trueValue: "", machineInput: true },
    disabled: { type: "boolean", default: false, attr: "data-disabled", trueValue: "", machineInput: true },
    autofocus: { type: "boolean", default: false, attr: "data-autofocus", trueValue: "", machineInput: true },
    /** Names the content surface for a reader, when nothing external (a FormField's own label) already does. */
    label: { type: "string", attr: "aria-label" },
    /** Names the internal toolbar. Same reasoning as Toolbar's own required `label`: a page with
     *  more than one bar needs each told apart. Defaults to generic microcopy, the same shape
     *  ColorPicker's `triggerLabel` default already uses. */
    toolbarLabel: { type: "string", default: "Formato de texto", attr: "aria-label" },
    /**
     * A smaller toolbar: tighter padding and gaps, not a different button set. An OPTION rather
     * than a second signature — `ColorPicker.compact` earns its own signature because whole
     * channel-input ROWS are present or absent, "the anatomy genuinely differs, not merely their
     * spacing" (`color-picker.ts`'s own comment); this changes only the spacing, so it takes that
     * comment's own "density flag" shape instead, the same way `CodePreview.density` does.
     */
    toolbarCompact: {
      type: "boolean",
      default: false,
      attr: "data-toolbar-compact",
      trueValue: "",
      prop: "compact",
    },
  },

  signatures: {
    Editor: {
      intent: ["rich-text-field", "wysiwyg-editor", "formatted-content", "editor-with-toolbar"],
      host: { element: "div" },
      mount: editorAttrs.root,
      options: [
        "name",
        "defaultValue",
        "placeholder",
        "readOnly",
        "disabled",
        "autofocus",
        "label",
        "toolbarLabel",
        "toolbarCompact",
      ],
      slots: {},
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [toolbarTemplate, hiddenInputTemplate, contentTemplate],
      },
      react: { from: "@skryensya/react/editor", name: "Editor" },
    },
  },
} as const satisfies ComponentContract;
