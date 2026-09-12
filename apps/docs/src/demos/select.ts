import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { planItems } from "./data/select";

/*
 * Both halves of the page, from one newly published contract.
 *
 * The plans they offer are the same list, written once in `data/select.ts`.
 */

/** The enhanced Select: item markup, a positioned listbox and a value-change event. */
export const selectTree = (t: Translate): UsageTree => ({
  contract: "select",
  signature: "Select",
  options: { name: "plan", value: "starter" },
  slots: { label: t("demo.select.label"), items: planItems },
});

/*
 * The native control, wrapped in a FormField.
 *
 * A visible label is the FORM FIELD's job, not the select's: a `<select>` host cannot contain its own
 * label, and FormField already owns the id wiring that ties the two together. The authored version
 * hand-rolled that as a Stack plus a matching `for`/`id` pair: two things to keep in sync by hand,
 * which is the class of bug this whole port exists to remove.
 */
export const selectNativeTree = (t: Translate): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  slots: { label: t("demo.select.label") },
  children: {
    contract: "select",
    signature: "Select.native",
    options: { name: "plan" },
    slots: { items: planItems },
  },
});

/*
 * THE ANATOMY SPECIMEN: frozen open markup. Select's listbox is anchored out of flow; a live machine
 * dismisses on the first pointer press in an inert frame. No mount attributes. Select's content is
 * open unless `[data-state="closed"]`, so omitting closed (and marking the trigger open for the
 * chevron) is what keeps the panel painted.
 *
 * Structure matches `emitMarkup` on `selectTree`, minus mounts and the visually-hidden native
 * `<select>` (form participation, not a labelled part).
 */
const selectAnatomySpecimen = (t: Translate): string => `<div class="sk-select" aria-label="${t("selectPage.anatomyLabel")}">
  <div class="sk-select__control">
    <label class="sk-select__label">${t("demo.select.label")}</label>
    <button class="sk-select__trigger sk-anchor sk-interactive" type="button" data-state="open" aria-expanded="true" tabindex="-1">
      <span class="sk-select__value">Starter</span>
      <span class="sk-select__indicator" aria-hidden="true">
        <span data-state="closed"><span data-sk-icon="chevron-down" data-sk-icon-size="md"></span></span>
        <span data-state="open"><span data-sk-icon="chevron-up" data-sk-icon-size="md"></span></span>
      </span>
    </button>
  </div>
  <div class="sk-select__positioner sk-anchored">
    <ul class="sk-select__content" role="listbox">
      <li class="sk-select__item sk-interactive" role="option" data-state="checked" aria-selected="true">
        <span class="sk-select__item-text">Starter</span>
        <span class="sk-select__item-indicator"><span data-sk-icon="check" data-sk-icon-size="md"></span></span>
      </li>
      <li class="sk-select__item sk-interactive" role="option">
        <span class="sk-select__item-text">Pro</span>
        <span class="sk-select__item-indicator"><span data-sk-icon="check" data-sk-icon-size="md"></span></span>
      </li>
      <li class="sk-select__item sk-interactive" role="option">
        <span class="sk-select__item-text">Enterprise</span>
        <span class="sk-select__item-indicator"><span data-sk-icon="check" data-sk-icon-size="md"></span></span>
      </li>
    </ul>
  </div>
</div>`;

const label = (target: string, side: string, text: string, extra = ""): string =>
  `<span class="sk-annotation" data-for="${target}" data-side="${side}" data-match="first"${extra} tabindex="0">${text}</span>`;

export const selectAnatomyHtml = (t: Translate): string => `<div
  class="sk-annotated"
  data-sk-annotated
  aria-label="${t("selectPage.anatomyLabel")}"
  data-ring-placement="inset"
  data-ring-distance="2"
  role="group"
>
  <div class="sk-annotated__subject" inert>
    ${selectAnatomySpecimen(t)}
  </div>
  ${label(".sk-select", "inline-start", "sk-select")}
  ${label(".sk-select__label", "inline-start", "sk-select__label")}
  ${label(".sk-select__trigger", "inline-start", "sk-select__trigger")}
  ${label(".sk-select__value", "inline-end", "sk-select__value", ' data-ring-placement="offset" data-ring-distance="4"')}
  ${label(".sk-select__indicator", "inline-end", "sk-select__indicator")}
  ${label(".sk-select__positioner", "inline-start", "sk-select__positioner")}
  ${label(".sk-select__content", "inline-start", "sk-select__content")}
  ${label(".sk-select__item", "inline-end", "sk-select__item", ' data-ring-placement="offset" data-ring-distance="3"')}
  <svg class="sk-annotated__leaders" aria-hidden="true" focusable="false"></svg>
</div>`;

export const selectAnatomyCss = `.sk-annotated {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject > .sk-select {
  display: inline-grid;
  justify-items: stretch;
  gap: var(--space-stack-md);
  inline-size: min(100%, 14rem);
}

.sk-annotated__subject > .sk-select > .sk-select__positioner {
  position: static;
  inline-size: 100%;
}

.sk-annotated .sk-select__content {
  min-inline-size: 100%;
  max-block-size: none;
}

.sk-annotated__subject {
  text-align: center;
}`;
