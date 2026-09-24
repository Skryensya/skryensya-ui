import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyFigureHtml } from "./annotation-parts";

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
        closeLabel: t("kit.close"),
        placeholder: t("kit.search"),
        emptyLabel: t("kit.noResults"),
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

/*
 * THE ANATOMY SPECIMEN: an open dialog with the parts a live palette only fills after `open()`.
 * Dialog's own anatomy can use `open: true` on a UsageTree; CommandPalette's list stays empty in
 * the template until the enhancer/React half renders options. Footer is an optional slot on the
 * contract (`whenGiven`). Frozen HTML names search, input, close, list, option, empty and footer
 * in one frame. No mount attributes; the platform `open` attribute paints the dialog non-modally.
 */
const commandPaletteAnatomySpecimen = (t: Translate): string => `<dialog
  class="sk-command-palette sk-dialog"
  open
  aria-label="${t("demo.commandPalette.label")}"
>
  <div class="sk-command-palette__search">
    <span data-sk-icon="search" data-sk-icon-size="md"></span>
    <input
      class="sk-command-palette__input"
      type="text"
      role="combobox"
      autocomplete="off"
      spellcheck="false"
      aria-expanded="true"
      aria-autocomplete="list"
      aria-controls="sk-command-palette-anatomy-listbox"
      placeholder="${t("demo.commandPalette.placeholder")}"
      readonly
      tabindex="-1"
    >
    <form method="dialog">
      <button
        class="sk-command-palette__close sk-button sk-dialog__close sk-interactive"
        type="submit"
        value="cancel"
        aria-label="${t("demo.commandPalette.close")}"
        data-icon-only
        data-size="sm"
        data-variant="ghost"
        tabindex="-1"
      >
        <span data-sk-icon="close" data-sk-icon-size="md"></span>
      </button>
    </form>
  </div>
  <ul
    class="sk-command-palette__list sk-scrollbar"
    role="listbox"
    aria-label="${t("demo.commandPalette.results")}"
    id="sk-command-palette-anatomy-listbox"
  >
    <li class="sk-command-palette__option" role="option" aria-selected="true">
      <span class="sk-command-palette__option-label">${t("demo.commandPalette.button")}</span>
      <span class="sk-command-palette__option-context">${t("demo.commandPalette.section")}</span>
    </li>
    <li class="sk-command-palette__option" role="option" aria-selected="false">
      <span class="sk-command-palette__option-label">${t("demo.commandPalette.dialog")}</span>
      <span class="sk-command-palette__option-context">${t("demo.commandPalette.section")}</span>
    </li>
  </ul>
  <p class="sk-command-palette__empty">${t("demo.commandPalette.empty")}</p>
  <footer class="sk-command-palette__footer"><span>${t("demo.commandPalette.footer")}</span></footer>
</dialog>`;


export const commandPaletteAnatomyHtml = (t: Translate): string => anatomyFigureHtml(t, {
  label: t("commandPalette.anatomyLabel"),
  specimen: commandPaletteAnatomySpecimen(t),
  parts: [
    { for: ".sk-command-palette", side: "block-start", mark: "bracket" },
    { for: ".sk-command-palette__search", side: "block-start", ringPlacement: "offset", ringDistance: 2 },
    { for: ".sk-command-palette__input", side: "inline-start", ringPlacement: "offset", ringDistance: 2 },
    { for: ".sk-command-palette__close", side: "inline-end" },
    { for: ".sk-command-palette__list", side: "inline-start" },
    { for: ".sk-command-palette__option", side: "inline-end", ringPlacement: "offset", ringDistance: 3 },
    { for: ".sk-command-palette__empty", side: "inline-end" },
    { for: ".sk-command-palette__footer", side: "block-end" },
  ],
});

/*
 * A native `<dialog open>` still centres itself; for the diagram, keep it in the subject's flow so
 * Annotated measures the whole palette. Narrower than the live overlay so class-name gutters fit.
 */
export const commandPaletteAnatomyCss = `.sk-annotated-figure {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject > .sk-command-palette {
  position: static;
  inset: auto;
  display: grid;
  inline-size: min(100%, 22rem);
  margin: 0;
  max-inline-size: none;
}

.sk-annotated__subject {
  text-align: center;
}`;
