import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

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
