import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * A confirmation, composed the way `command-palette` solved the same problem: the tree emits the
 * trigger AND the dialog under one marker, and the script supplies the one thing a composition
 * cannot — the CALL that opens it.
 *
 * `NOT-PUBLISHED.md` filed this page as "the demo IS the interaction" and that was half right. The
 * interaction is `showModal()`, which is a call and never markup; everything around it — the button,
 * the dialog, its header, its body, the two closing actions — is composition, and was being written
 * twice for nothing.
 *
 * The footer is a `<form method="dialog">` in the contract, which is what makes the two buttons
 * close and report WHICH one did it through `returnValue`, with no handler each.
 */
export const dialogConfirmTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  children: [
    {
      contract: "button",
      signature: "Button.action",
      options: { variant: "danger" },
      attrs: { "data-dialog-demo-open": "" },
      children: t("demo.dialog.open"),
    },
    {
      contract: "dialog",
      signature: "Dialog",
      attrs: { id: "demo-confirm" },
      slots: {
        title: t("demo.dialog.title"),
        children: t("demo.dialog.body"),
        footer: [
          {
            contract: "button",
            signature: "Button.action",
            options: { variant: "ghost" },
            attrs: { type: "submit", value: "cancel", autofocus: "" },
            children: t("demo.dialog.cancel"),
          },
          {
            contract: "button",
            signature: "Button.action",
            options: { variant: "danger" },
            attrs: { type: "submit", value: "confirm" },
            children: t("demo.dialog.confirm"),
          },
        ],
      },
    },
  ],
});

/*
 * The dialog is found by its authored id: `Dialog` (React) takes named props and does not forward
 * unknown ones onto its host, so a marker attribute would survive in one binding and vanish in the
 * other — the same reason the command palette's script reaches for `paletteId`.
 */
export const dialogConfirmScript = `
const trigger = document.querySelector("[data-dialog-demo-open]");
const dialog = document.getElementById("demo-confirm");
trigger?.addEventListener("click", () => {
  if (dialog instanceof HTMLDialogElement) dialog.showModal();
});
`;
