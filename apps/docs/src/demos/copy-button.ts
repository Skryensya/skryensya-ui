import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * The same command, copied by two buttons at two sizes.
 *
 * The `<code>` beside them is the TARGET: the button copies whatever that element holds at click
 * time, found by id, which is why the id is the option and the text is not. Passing the string would
 * let the button copy something the reader is not looking at.
 *
 * The command itself stays written — `pnpm add @skryensya/core` is the same in every language.
 */
export const copyButtonTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "md", inlineAlign: "center" },
  children: [
    {
      contract: "typography",
      signature: "Output",
      attrs: { id: "install-command" },
      children: "pnpm add @skryensya/core",
    },
    {
      contract: "copy-button",
      signature: "CopyButton",
      options: { target: "install-command", variant: "ghost", iconOnly: true },
      attrs: { "aria-label": t("demo.copyButton.label") },
      children: t("demo.copyButton.idle"),
    },
    {
      contract: "copy-button",
      signature: "CopyButton",
      options: { target: "install-command", variant: "ghost", size: "sm", iconOnly: true },
      attrs: { "aria-label": t("demo.copyButton.label") },
      children: t("demo.copyButton.idle"),
    },
  ],
});
