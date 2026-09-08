import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * A button and a dialog, composed under one marker the way `tabsAdvancedTree` composes tabs and a
 * status line: the same escape hatch, applied to the case `contracts/NOT-PUBLISHED.md` names for
 * `command-palette`: the tree can emit the trigger AND the dialog, it just cannot emit the CALL that
 * opens one. `commandPaletteDemoScript` supplies exactly that call, nothing else.
 */
export const commandPaletteDemoTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  children: [
    {
      contract: "button",
      signature: "Button.action",
      /* `solid` (the default emphasis), not `secondary`: the Button contract has never published
         such a value, so this demo emitted `data-variant="secondary"`, matched no rule in
         button.css and fell back to looking like the default anyway. Caught by running the demo
         tree through the validator, which is exactly what hand-written markup does not get. */
      options: { variant: "solid" },
      attrs: { "data-cmdk-demo-open": "" },
      children: [
        { contract: "icon", signature: "Icon", options: { name: "search", size: "sm" } },
        t("demo.commandPalette.open"),
      ],
    },
    {
      contract: "command-palette",
      signature: "CommandPalette",
      options: {
        label: t("demo.commandPalette.label"),
        paletteId: "demo-cmdk-tree",
        entries: JSON.stringify([
          { label: t("demo.commandPalette.button"), href: "/components/button", section: t("demo.commandPalette.section") },
          { label: t("demo.commandPalette.dialog"), href: "/components/dialog", section: t("demo.commandPalette.section") },
          { label: t("demo.commandPalette.toc"), href: "/components/toc", section: t("demo.commandPalette.section") },
        ]),
      },
    },
  ],
});

/*
 * The dialog is found by `paletteId` rather than a marker attribute: `CommandPalette` (React) takes
 * named props and does not forward unknown ones onto its host, unlike `Button`/`Stack`, which do:
 * the id is the one identifier the contract already guarantees lands on the element either way.
 */
export { default as commandPaletteDemoScript } from "./scripts/command-palette-open.ts?raw";
