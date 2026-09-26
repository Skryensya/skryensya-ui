import type { ComponentContract, OptionsOf } from "./contract.js";

/*
 * CLIPBOARD, copying a value with one click, on `@zag-js/clipboard` (the SAME machine in both
 * bindings, through `@skryensya/core/machines`, ADR-0010).
 *
 * Two signatures, one machine:
 *   - `CopyButton` is the button alone. The value is either given (`value`) or read, at the moment of
 *     the click, from another element on the page (`target`): a code block, a token, a command.
 *   - `Clipboard` is Zag's full anatomy: a label, a read-only field showing the value, and the same
 *     button beside it. For a value the reader should SEE before copying: a share link, an API key.
 *
 * WHAT IS OURS AND NOT ZAG'S: the write itself. Zag's `COPY` event writes with
 * `navigator.clipboard.writeText` and drops the promise, so a write the browser refuses (no
 * permission, an insecure context) still reads "Copied". Both bindings write with `writeClipboard`
 * below instead and tell the machine with `INPUT.COPY`, Zag's own event for "the value was copied by
 * something other than the trigger" (it is what the field's native Ctrl+C sends). Zag still owns the
 * copied/idle state, its timer, the ids and the ARIA; a refused write adds `data-error` on top for
 * as long as the copied state lasts, and the button says so.
 *
 * WHY THIS REVERSES DECISION 33. `CopyButton` was a contract once and was withdrawn so a consumer
 * composed `StateButton` and called `writeClipboard` itself. That left copying as the one common
 * control in the kit with no component: every consumer rebuilt the same timer, the same live region
 * and the same failure path. A Zag machine now owns the part that was worth sharing.
 */

export const clipboardParts = {
  /** `Clipboard` only: holds the label and the control. */
  root: "sk-clipboard",
  label: "sk-clipboard__label",
  /** The field and the button, side by side. */
  control: "sk-clipboard__control",
  input: "sk-clipboard__input",
  /** The button. The ROOT of `CopyButton`, the last part of `Clipboard`'s control. */
  trigger: "sk-copy-button",
  /** The two glyphs; `data-face` says which. The Icon Toggle pattern crossfades them. */
  face: "sk-copy-button__icon",
  /** Visually hidden, polite: says "Copied" or "Copy failed" once. */
  status: "sk-copy-button__label",
  /** The small flag beside the button, anchored to it. Decorative: `status` is what is announced. */
  feedback: "sk-copy-button__feedback",
} as const;

export type ClipboardPart = keyof typeof clipboardParts;

export const clipboardAttrs = {
  /** Mount point of both signatures: on `Clipboard`'s root, and on `CopyButton`'s button. */
  root: "data-sk-clipboard",
  trigger: "data-sk-clipboard-trigger",
  input: "data-sk-clipboard-input",
  status: "data-sk-clipboard-status",
  feedback: "data-sk-clipboard-feedback",
  /** On each of the flag's two sentences: which result it is. */
  feedbackText: "data-sk-clipboard-feedback-text",
  /** Written by both bindings on the trigger while a refused write is being reported. */
  error: "data-error",
} as const;

export const clipboardEvents = {
  /** On the root, bubbling, on every change. Detail: `{ status: "copied" | "error" | "idle" }`. */
  statusChange: "sk:clipboardstatuschange",
} as const;

export type ClipboardStatus = "idle" | "copied" | "error";

/*
 * The default reset time. Shorter than Zag's 3000: the flag is feedback on a click the reader just
 * made, and three seconds of "Copied" outlasts the moment it answers.
 */
export const CLIPBOARD_DEFAULT_TIMEOUT = 2000;

/*
 * Zag's event for "copied by other means": moves `idle` to `copied`, starts the timer and calls
 * `onStatusChange`, WITHOUT writing. Named once so both bindings send the same string.
 */
export const CLIPBOARD_COPIED_EVENT = { type: "INPUT.COPY" } as const;

function fallbackCopy(text: string): boolean {
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("aria-hidden", "true");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.append(field);
  field.select();
  const copied = typeof document.execCommand === "function" && document.execCommand("copy");
  field.remove();
  return copied;
}

/** Writes `text`, with the pre-`navigator.clipboard` path under it. Resolves to whether it worked. */
export async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return fallbackCopy(text);
  } catch {
    return fallbackCopy(text);
  }
}

/**
 * The text of the element `target` names, read at the moment of the click so a block edited or
 * re-rendered since still copies what is on screen. A `<template>` gives its content's text: the
 * way to copy something that is not shown. `null` when the element is not there.
 */
export function readClipboardTarget(doc: Document, target: string): string | null {
  const source = doc.getElementById(target);
  if (!source) return null;
  if (source instanceof HTMLTemplateElement) return source.content.textContent;
  return source.textContent;
}

const faces = [
  {
    element: "span",
    part: "face",
    attrs: { "data-face": "idle", "aria-hidden": "true" },
    children: [{ element: "span", attrs: { "data-sk-icon": "copy", "data-sk-icon-size": "md" } }],
  },
  {
    element: "span",
    part: "face",
    attrs: { "data-face": "copied", "aria-hidden": "true" },
    children: [{ element: "span", attrs: { "data-sk-icon": "check", "data-sk-icon-size": "md" } }],
  },
  {
    element: "span",
    part: "status",
    mount: clipboardAttrs.status,
    attrs: { "aria-live": "polite" },
  },
  /*
   * Both sentences are in the markup and the state picks one, the same way the two glyphs are. The
   * enhancer reads them back as the accessible names of the two results, so a translated flag and
   * the announcement can never say different things.
   */
  {
    element: "span",
    part: "feedback",
    also: ["sk-anchored"],
    mount: clipboardAttrs.feedback,
    attrs: { "data-sk-placement": "inline-start", "aria-hidden": "true" },
    children: [
      { element: "span", attrs: { [clipboardAttrs.feedbackText]: "copied" }, textFromOption: "copiedLabel" },
      { element: "span", attrs: { [clipboardAttrs.feedbackText]: "error" }, textFromOption: "errorLabel" },
      { element: "span", also: ["sk-anchored-arrow"], attrs: { "aria-hidden": "true" } },
    ],
  },
] as const;

const triggerAlso = ["sk-button", "sk-interactive", "sk-icon-toggle", "sk-anchor"] as const;

export const clipboardContract = {
  id: "clipboard",
  category: "actions",
  css: "@skryensya/core/components/clipboard.css",
  parts: clipboardParts,
  /* The rows the enhancer fills or toggles; a composition never authors their state. */
  systemOwned: ["status"],
  hooks: [
    "--sk-clipboard-gap",
    "--sk-clipboard-label-fg",
    "--sk-clipboard-label-font-size",
    "--sk-copy-button-error-fg",
    "--sk-copy-button-feedback-bg",
    "--sk-copy-button-feedback-border-color",
    "--sk-copy-button-feedback-fg",
    "--sk-copy-button-feedback-font-size",
    "--sk-copy-button-feedback-padding",
    "--sk-copy-button-feedback-radius",
    "--sk-copy-button-feedback-shadow",
    "--sk-copy-button-feedback-wash",
  ],
  /* The button and its flag are painted by `copy-button.css`; the flag's placement is the Anchoring
     pattern's. Neither is discoverable from `also` alone. */
  hookSheets: ["@skryensya/core/components/copy-button.css"],
  events: clipboardEvents,
  eventDetails: {
    statusChange: {
      detail: { status: "ClipboardStatus" },
      reactProp: "onStatusChange",
      reactDetail: "ClipboardStatus",
      source: "root",
      trigger: "trigger",
    },
  },

  options: {
    /**
     * What is copied. On `Clipboard` it is also what the field shows. The platform's own `value`
     * attribute on both hosts (a `<button>` has one too), so the field reads right with no script.
     */
    value: { type: "string", attr: "value", machineInput: true },
    /**
     * `CopyButton` only: the id of the element whose text is copied, read at click time. Wins over
     * `value`. A `<template>` copies its content, for text that is not on screen.
     */
    target: { type: "string", attr: "data-target", machineInput: true },
    /** The button's accessible name at rest. It says what is copied when the page has several. */
    label: { type: "string", default: "Copy", attr: "aria-label" },
    /** Said and flagged after a successful copy. */
    copiedLabel: { type: "string", default: "Copied" },
    /** Said and flagged when the browser refused the write. */
    errorLabel: { type: "string", default: "Copy failed" },
    /** How long, in ms, the copied (or failed) state lasts before the button rests again. */
    timeout: {
      type: "number",
      min: 0,
      default: CLIPBOARD_DEFAULT_TIMEOUT,
      attr: "data-timeout",
      machineInput: true,
    },
    /** The button's size. `Clipboard` sizes it to the field beside it, so it is `CopyButton`'s only. */
    size: { type: "enum", values: ["xs", "sm", "md"], default: "sm", attr: "data-size" },
    /** The button's variant, Button's own values minus `solid`: copying is never the primary action. */
    variant: { type: "enum", values: ["soft", "ghost"], default: "soft", attr: "data-variant" },
  },

  signatures: {
    CopyButton: {
      intent: ["copy-to-clipboard", "copy-code", "copy-a-value"],
      host: { element: "button" },
      mount: clipboardAttrs.root,
      options: ["value", "target", "label", "copiedLabel", "errorLabel", "timeout", "size", "variant"],
      requires: ["label"],
      forward: ["id", "aria-*"],
      compose: [
        { of: "button", sheets: ["@skryensya/core/components/button.css"], systemOwned: true },
        { of: "icon", systemOwned: true },
      ],
      slots: {},
      template: {
        element: "button",
        part: "trigger",
        host: true,
        also: [...triggerAlso],
        mount: clipboardAttrs.trigger,
        attrs: { type: "button", "data-icon-only": "" },
        children: [...faces],
      },
      react: { from: "@skryensya/react/clipboard", name: "CopyButton" },
    },

    Clipboard: {
      intent: ["copy-a-link", "share-link", "copy-api-key", "read-only-value-with-copy"],
      host: { element: "div" },
      mount: clipboardAttrs.root,
      options: ["value", "label", "copiedLabel", "errorLabel", "timeout"],
      requires: ["value", "label"],
      forward: ["id", "aria-*"],
      compose: [
        { of: "button", sheets: ["@skryensya/core/components/button.css"], systemOwned: true },
        { of: "input", sheets: ["@skryensya/core/components/input.css"], systemOwned: true },
        { of: "icon", systemOwned: true },
      ],
      slots: {
        /** What the value is ("Share link"). Visible, and the field's name. */
        fieldLabel: { accepts: "text", required: true },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          { element: "label", part: "label", slot: "fieldLabel" },
          {
            element: "div",
            part: "control",
            children: [
              {
                element: "input",
                part: "input",
                also: ["sk-input"],
                mount: clipboardAttrs.input,
                attrs: { type: "text", readonly: "", spellcheck: "false" },
                options: ["value"],
              },
              {
                element: "button",
                part: "trigger",
                also: [...triggerAlso],
                mount: clipboardAttrs.trigger,
                /* The field's height, so the pair reads as one control. */
                attrs: { type: "button", "data-icon-only": "", "data-variant": "soft", "data-size": "md" },
                options: ["label"],
                children: [...faces],
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/clipboard", name: "Clipboard" },
    },
  },
} as const satisfies ComponentContract;

/** Derived, never restated. */
export type ClipboardOptions = OptionsOf<typeof clipboardContract>;
