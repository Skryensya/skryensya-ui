import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/*
 * THE CLIPBOARD EXAMPLES, AS USAGE TREES, so both stages come from one source. Every label goes
 * through `t()`: the flag and the announcement read these strings, and a Spanish page that said
 * "Copied" would be the exact mismatch the contract's two labels exist to prevent.
 */

const labels = (t: Translate) => ({
  copiedLabel: t("clipboard.demoCopied"),
  errorLabel: t("clipboard.demoError"),
});

/** 1. The button beside the thing it copies, read from the page at the moment of the click. */
export const clipboardTargetTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm", inlineAlign: "center" },
  children: [
    {
      contract: "typography",
      signature: "Code",
      attrs: { id: "clipboard-demo-install" },
      children: "pnpm add @skryensya/core @skryensya/vanilla",
    },
    {
      contract: "clipboard",
      signature: "CopyButton",
      options: { target: "clipboard-demo-install", label: t("clipboard.demoCopyCommand"), ...labels(t) },
    },
  ],
});

/** 2. A value the reader should see before copying it, in a read-only field. */
export const clipboardFieldTree = (t: Translate): UsageTree => ({
  contract: "clipboard",
  signature: "Clipboard",
  options: { value: "https://ui.skryensya.dev/s/7f3a9c", label: t("clipboard.demoCopyLink"), ...labels(t) },
  attrs: { style: "inline-size: 24rem; max-inline-size: 100%;" },
  slots: { fieldLabel: t("clipboard.demoShareLink") },
});

/** 3. The three sizes, and the quieter variant for a button that sits on a busy surface. */
export const clipboardSizesTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "md", inlineAlign: "center" },
  children: (
    [
      ["xs", "soft"],
      ["sm", "soft"],
      ["md", "soft"],
      ["sm", "ghost"],
    ] as const
  ).map(([size, variant]) => ({
    contract: "clipboard",
    signature: "CopyButton",
    options: { value: `${size} · ${variant}`, size, variant, label: t("clipboard.demoCopy"), ...labels(t) },
  })),
});

/*
 * The field form, which has every part the short form has plus its own three. What is not drawn,
 * and why: the second icon (the check) and the feedback bubble only show after a copy, and the
 * button's visible label is empty on an icon-only button.
 */
export const clipboardAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("clipboard.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "clipboard",
      signature: "Clipboard",
      options: { value: "https://ui.skryensya.dev/s/7f3a9c", label: t("clipboard.demoCopyLink"), ...labels(t) },
      attrs: { style: "inline-size: 22rem; max-inline-size: 100%;" },
      slots: { fieldLabel: t("clipboard.demoShareLink") },
    },
    items: [
      namePart(".sk-clipboard", "inline-start", { mark: "bracket" }),
      namePart(".sk-clipboard__label", "block-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-clipboard__control", "inline-start", { mark: "bracket" }),
      namePart(".sk-clipboard__input", "block-end"),
      namePart(".sk-copy-button", "inline-end"),
      namePart(".sk-copy-button__icon", "block-start", { match: "first" }),
    ],
  },
});

/* The label is a block the width of the field, so its ring would sit over empty space to the right
   of the words. Shrunk to its text, which it already looks like, the ring lands on the words. */
export const clipboardAnatomyCss = `.sk-annotated-figure {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject .sk-clipboard__label {
  inline-size: fit-content;
}`;
