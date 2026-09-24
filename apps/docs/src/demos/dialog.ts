import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/*
 * A confirmation, composed the way `command-palette` solved the same problem: the tree emits the
 * trigger AND the dialog under one marker, and the script supplies the one thing a composition
 * cannot: the CALL that opens it.
 *
 * `NOT-PUBLISHED.md` filed this page as "the demo IS the interaction" and that was half right. The
 * interaction is `showModal()`, which is a call and never markup; everything around it (the button,
 * the dialog, its header, its body, the two closing actions) is composition, and was being written
 * twice for nothing.
 *
 * The footer is a `<form method="dialog">` in the contract, which is what makes the two buttons
 * close and report WHICH one did it through `returnValue`, with no handler each.
 */

/*
 * `open` renders the dialog NON-modally already showing: the platform attribute the contract
 * exposes for authored markup. The live demos below still call `showModal()`; this specimen only
 * needs every part on screen to be named.
 */
export const dialogAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("dialog.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "dialog",
      signature: "Dialog",
      options: { open: true, closeLabel: t("kit.close") },
      slots: {
        title: t("demo.dialog.title"),
        children: t("demo.dialog.body"),
        footer: [
          {
            contract: "button",
            signature: "Button.action",
            options: { variant: "ghost", type: "submit" },
            attrs: { value: "cancel" },
            children: t("demo.dialog.cancel"),
          },
          {
            contract: "button",
            signature: "Button.action",
            options: { variant: "solid", tone: "danger", type: "submit" },
            attrs: { value: "confirm" },
            children: t("demo.dialog.confirm"),
          },
        ],
      },
    },
    items: [
      namePart(".sk-dialog", "block-start", { mark: "bracket" }),
      namePart(".sk-dialog__header", "block-start"),
      namePart(".sk-dialog__title", "inline-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-dialog__close", "inline-end"),
      namePart(".sk-dialog__body", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-dialog__footer", "block-end"),
    ],
  },
});

/*
 * A native `<dialog open>` still centres itself; for the diagram, keep it in the subject's flow so
 * Annotated measures the whole panel. Narrower than the live modal so class-name gutters fit.
 */
export const dialogAnatomyCss = `.sk-annotated-figure {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject > .sk-dialog {
  position: static;
  inset: auto;
  display: grid;
  inline-size: min(100%, 22rem);
  margin: 0;
  max-inline-size: none;
  opacity: 1;
  scale: 1;
  translate: none;
  filter: blur(0);
}

.sk-annotated__subject > .sk-dialog::backdrop {
  display: none;
}

.sk-annotated__subject {
  text-align: center;
}`;

export const dialogConfirmTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  children: [
    {
      contract: "button",
      signature: "Button.action",
      options: { variant: "soft", tone: "danger" },
      attrs: { "data-dialog-demo-open": "" },
      children: t("demo.dialog.open"),
    },
    {
      contract: "dialog",
      signature: "Dialog",
      options: { closeLabel: t("kit.close") },
      attrs: { id: "demo-confirm" },
      slots: {
        title: t("demo.dialog.title"),
        children: t("demo.dialog.body"),
        footer: [
          {
            contract: "button",
            signature: "Button.action",
            options: { variant: "ghost", type: "submit" },
            attrs: { value: "cancel", autofocus: "" },
            children: t("demo.dialog.cancel"),
          },
          {
            contract: "button",
            signature: "Button.action",
            options: { variant: "solid", tone: "danger", type: "submit" },
            attrs: { value: "confirm" },
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
 * other: the same reason the command palette's script reaches for `paletteId`.
 */
export { default as dialogConfirmScript } from "./scripts/dialog-confirm.ts?raw";

/*
 * The same trick, for the second demo on this page: `NOT-PUBLISHED.md` filed "Dialog Vaul" as
 * blocked on a contract that did not name the integration at all, and `vaul` (`packages/core/src/
 * dialog.ts`) is that missing piece: a boolean, because the pattern only ever slides from
 * `block-end`. Once the option exists, this demo is composition again: a trigger, a `Dialog` with
 * `vaul: true`, and the same `showModal()` call `dialogConfirmScript` already needed.
 *
 * The footer buttons are `type="submit"`, not `data-sk-dialog-vaul-close`: the contract already
 * wraps `footer` in a `<form method="dialog">`, so a native submit closes the panel with no script
 * at all, before the Vanilla enhancer (which is what teaches drag-to-dismiss and light-dismiss)
 * has even loaded.
 */
export const dialogVaulTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  children: [
    {
      contract: "button",
      signature: "Button.action",
      attrs: { "data-dialog-vaul-demo-open": "" },
      children: t("demo.dialogVaul.open"),
    },
    {
      contract: "dialog",
      signature: "Dialog",
      options: { vaul: true, closeLabel: t("kit.close") },
      attrs: { id: "demo-dialog-vaul" },
      slots: {
        title: t("demo.dialogVaul.title"),
        children: [
          {
            contract: "typography",
            signature: "Text",
            children: t("demo.dialogVaul.body"),
          },
          {
            contract: "list",
            signature: "List",
            options: { density: "compact" },
            attrs: { "aria-label": t("demo.dialogVaul.whatChanges") },
            children: [
              {
                contract: "list",
                signature: "ListItem",
                slots: {
                  leading: { contract: "icon", signature: "Icon", options: { name: "check" } },
                  title: t("demo.dialogVaul.edgeTitle"),
                  description: t("demo.dialogVaul.edgeBody"),
                },
              },
              {
                contract: "list",
                signature: "ListItem",
                slots: {
                  leading: { contract: "icon", signature: "Icon", options: { name: "check" } },
                  title: t("demo.dialogVaul.dragTitle"),
                  description: t("demo.dialogVaul.dragBody"),
                },
              },
              {
                contract: "list",
                signature: "ListItem",
                slots: {
                  leading: { contract: "icon", signature: "Icon", options: { name: "check" } },
                  title: t("demo.dialogVaul.sameTitle"),
                  description: t("demo.dialogVaul.sameBody"),
                },
              },
            ],
          },
        ],
        footer: [
          {
            contract: "button",
            signature: "Button.action",
            options: { variant: "ghost", type: "submit" },
            attrs: { value: "cancel" },
            children: t("demo.dialogVaul.later"),
          },
          {
            contract: "button",
            signature: "Button.action",
            options: { type: "submit" },
            attrs: { value: "confirm" },
            children: t("demo.dialogVaul.understood"),
          },
        ],
      },
    },
  ],
});

export { default as dialogVaulScript } from "./scripts/dialog-vaul.ts?raw";
