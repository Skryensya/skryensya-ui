import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Locale, Translate } from "../i18n";
import { countries, slug } from "./data/countries";

/*
 * One combobox over the whole country list, from the contract published for it.
 *
 * The list is filtered client-side by both bindings, so "every country" costs no more markup logic
 * than the four rows this demo used to ship, only more entries. That is the point of the demo: a
 * combobox earns its place exactly when the list is too long to scan.
 *
 * The names come from `./data/countries` rather than from `demo.*` keys: 194 keys pairing two proper
 * nouns would be a dictionary pretending to be a translation table.
 */
export const comboboxTree = (t: Translate, locale: Locale): UsageTree => ({
  contract: "combobox",
  signature: "Combobox",
  options: { name: "country", placeholder: t("demo.combobox.placeholder") },
  slots: {
    label: t("demo.combobox.label"),
    hint: t("demo.combobox.hint"),
    items: countries[locale].map((name) => ({
      options: { value: slug(name) },
      slots: { label: name },
    })),
  },
});

/*
 * THE ANATOMY SPECIMEN: frozen open markup, same reason Menu uses one. A combobox's listbox is
 * `position: fixed` / anchored out of flow; a live machine dismisses on the first pointer press in
 * an inert frame. No mount attributes, so `initComponents` never sees it. `data-state="open"` is
 * what combobox.css reads to paint the panel.
 *
 * Structure matches `emitMarkup` on `comboboxTree`, minus `data-sk-*` mounts. Two short items stand
 * in for the country list: enough to name a row without filling the diagram.
 */
const comboboxAnatomySpecimen = (t: Translate): string => `<div class="sk-combobox sk-form-field" aria-label="${t("combobox.anatomyLabel")}">
  <label class="sk-combobox__label sk-form-field__label">${t("demo.combobox.label")}</label>
  <div class="sk-form-field__hint">${t("demo.combobox.hint")}</div>
  <div class="sk-combobox__control sk-anchor">
    <div class="sk-combobox__value">
      <input class="sk-combobox__input" type="text" placeholder="${t("demo.combobox.placeholder")}" value="" readonly tabindex="-1">
    </div>
    <button class="sk-combobox__clear sk-button sk-interactive" type="button" data-icon-only data-size="sm" data-variant="ghost" tabindex="-1">
      <span data-sk-icon="close" data-sk-icon-size="sm"></span>
    </button>
    <span class="sk-combobox__trigger" data-state="open" aria-hidden="true">
      <span data-state="closed"><span data-sk-icon="chevron-down" data-sk-icon-size="md"></span></span>
      <span data-state="open"><span data-sk-icon="chevron-up" data-sk-icon-size="md"></span></span>
    </span>
  </div>
  <div class="sk-combobox__positioner sk-anchored">
    <div class="sk-combobox__content sk-scrollbar" data-state="open" role="listbox">
      <div class="sk-combobox__item sk-interactive" role="option">
        <span class="sk-combobox__item-copy">
          <span class="sk-combobox__item-label">${t("demo.combobox.anatomy.item1")}</span>
        </span>
        <span class="sk-combobox__item-indicator">✓</span>
      </div>
      <div class="sk-combobox__item sk-interactive" role="option">
        <span class="sk-combobox__item-copy">
          <span class="sk-combobox__item-label">${t("demo.combobox.anatomy.item2")}</span>
        </span>
        <span class="sk-combobox__item-indicator">✓</span>
      </div>
    </div>
  </div>
</div>`;

const label = (target: string, side: string, text: string, extra = ""): string =>
  `<span class="sk-annotation" data-for="${target}" data-side="${side}" data-match="first"${extra} tabindex="0">${text}</span>`;

export const comboboxAnatomyHtml = (t: Translate): string => `<div
  class="sk-annotated"
  data-sk-annotated
  aria-label="${t("combobox.anatomyLabel")}"
  data-ring-placement="inset"
  data-ring-distance="2"
  role="group"
>
  <div class="sk-annotated__subject" inert>
    ${comboboxAnatomySpecimen(t)}
  </div>
  ${label(".sk-combobox", "inline-start", "sk-combobox")}
  ${label(".sk-combobox__label", "inline-start", "sk-combobox__label")}
  ${label(".sk-combobox__control", "inline-start", "sk-combobox__control")}
  ${label(".sk-combobox__input", "inline-end", "sk-combobox__input", ' data-ring-placement="offset" data-ring-distance="4"')}
  ${label(".sk-combobox__clear", "inline-end", "sk-combobox__clear")}
  ${label(".sk-combobox__trigger", "inline-end", "sk-combobox__trigger")}
  ${label(".sk-combobox__positioner", "inline-start", "sk-combobox__positioner")}
  ${label(".sk-combobox__content", "inline-start", "sk-combobox__content")}
  ${label(".sk-combobox__item", "inline-end", "sk-combobox__item", ' data-ring-placement="offset" data-ring-distance="3"')}
  <svg class="sk-annotated__leaders" aria-hidden="true" focusable="false"></svg>
</div>`;

/*
 * Put the listbox back in flow: `.sk-combobox__positioner` is `position: fixed` / anchored, which
 * is right for a live field and useless for a diagram (the panel contributes nothing to the box
 * Annotated measures). Static under the control, same move Menu's anatomy CSS makes.
 */
export const comboboxAnatomyCss = `.sk-annotated {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject > .sk-combobox {
  display: inline-grid;
  justify-items: stretch;
  gap: var(--space-stack-md);
  inline-size: min(100%, 16rem);
}

.sk-annotated__subject > .sk-combobox > .sk-combobox__positioner {
  position: static;
  inline-size: 100%;
}

.sk-annotated .sk-combobox__content {
  inline-size: 100%;
  min-inline-size: 0;
  max-block-size: none;
}

.sk-annotated__subject {
  text-align: center;
}`;
