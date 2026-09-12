import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * The date picker three ways: native, enhanced, and disabled.
 *
 * The native one has its own signature now (`DatePicker.native`) for the reason `Select.native`
 * has one: choosing between them is choosing WHO OWNS the behaviour, the browser or an enhancer, and
 * no flag should be able to stand in for that decision.
 *
 * `timeZone` is a real IANA zone and stays written: it is the same string in every language.
 */

export const datePickerTree = (t: Translate): UsageTree => ({
  contract: "date-picker",
  signature: "DatePicker",
  options: {
    locale: t("demo.datePicker.locale"),
    name: "checkin",
    placeholder: t("demo.datePicker.placeholder"),
    clearLabel: t("demo.datePicker.clear"),
    timeZone: "America/Santo_Domingo",
  },
  slots: { label: t("demo.datePicker.label") },
});

export const datePickerDisabledTree = (t: Translate): UsageTree => ({
  contract: "date-picker",
  signature: "DatePicker",
  options: {
    locale: t("demo.datePicker.locale"),
    placeholder: t("demo.datePicker.placeholder"),
    clearLabel: t("demo.datePicker.clear"),
    disabled: true,
  },
  slots: { label: t("demo.datePicker.label") },
});

/** The layer that works with no script at all: a real `<input type="date">` in the same chrome. */
export const nativeDatePickerTree = (t: Translate): UsageTree => ({
  contract: "date-picker",
  signature: "DatePicker.native",
  options: { name: "arrival", locale: t("demo.datePicker.locale") },
  slots: { label: t("demo.datePicker.label") },
});

/*
 * THE ANATOMY SPECIMEN: frozen open markup. The static contract template only emits the field; the
 * positioner and content are runtime (React portal / Vanilla enhancer). A live popover is anchored
 * out of flow and dismisses on the first pointer press in an inert frame, so the diagram authors
 * the open shell by hand: no mount attributes, `data-state="open"` on content, and a compact
 * calendar stub inside (Calendar owns the grid's own anatomy; this page only names DatePicker's
 * parts).
 */
const datePickerAnatomySpecimen = (t: Translate): string => `<div class="sk-date-picker" aria-label="${t("datePicker.anatomyLabel")}">
  <label class="sk-date-picker__label">${t("demo.datePicker.label")}</label>
  <div class="sk-date-picker__control sk-anchor">
    <input class="sk-date-picker__input" type="text" placeholder="${t("demo.datePicker.placeholder")}" readonly tabindex="-1">
    <button
      class="sk-date-picker__clear sk-button sk-interactive"
      type="button"
      aria-label="${t("demo.datePicker.clear")}"
      data-icon-only
      data-size="sm"
      data-variant="ghost"
      tabindex="-1"
    >
      <span data-sk-icon="close" data-sk-icon-size="sm"></span>
    </button>
    <button
      class="sk-date-picker__trigger sk-button sk-interactive"
      type="button"
      data-icon-only
      data-size="sm"
      data-variant="ghost"
      data-state="open"
      aria-expanded="true"
      tabindex="-1"
    >
      <span data-sk-icon="calendar" data-sk-icon-size="sm"></span>
    </button>
  </div>
  <div class="sk-date-picker__positioner sk-anchored">
    <div class="sk-date-picker__content sk-calendar" data-state="open" role="dialog">
      <div class="sk-calendar__header">
        <button class="sk-calendar__previous sk-button sk-interactive" type="button" data-icon-only data-size="sm" data-variant="ghost" tabindex="-1">
          <span data-sk-icon="chevron-left" data-sk-icon-size="sm"></span>
        </button>
        <button class="sk-calendar__view-trigger sk-button sk-interactive" type="button" data-size="sm" data-variant="ghost" tabindex="-1">${t("demo.datePicker.anatomy.month")}</button>
        <button class="sk-calendar__next sk-button sk-interactive" type="button" data-icon-only data-size="sm" data-variant="ghost" tabindex="-1">
          <span data-sk-icon="chevron-right" data-sk-icon-size="sm"></span>
        </button>
      </div>
      <table class="sk-calendar__table">
        <thead class="sk-calendar__table-header">
          <tr>
            <th scope="col">${t("demo.datePicker.anatomy.dow1")}</th>
            <th scope="col">${t("demo.datePicker.anatomy.dow2")}</th>
            <th scope="col">${t("demo.datePicker.anatomy.dow3")}</th>
            <th scope="col">${t("demo.datePicker.anatomy.dow4")}</th>
            <th scope="col">${t("demo.datePicker.anatomy.dow5")}</th>
            <th scope="col">${t("demo.datePicker.anatomy.dow6")}</th>
            <th scope="col">${t("demo.datePicker.anatomy.dow7")}</th>
          </tr>
        </thead>
        <tbody class="sk-calendar__table-body">
          <tr>
            <td class="sk-calendar__cell"><button class="sk-calendar__cell-trigger sk-button sk-interactive" type="button" data-size="sm" data-variant="ghost" tabindex="-1">1</button></td>
            <td class="sk-calendar__cell"><button class="sk-calendar__cell-trigger sk-button sk-interactive" type="button" data-size="sm" data-variant="ghost" tabindex="-1">2</button></td>
            <td class="sk-calendar__cell"><button class="sk-calendar__cell-trigger sk-button sk-interactive" type="button" data-size="sm" data-variant="ghost" data-selected tabindex="-1">3</button></td>
            <td class="sk-calendar__cell"><button class="sk-calendar__cell-trigger sk-button sk-interactive" type="button" data-size="sm" data-variant="ghost" tabindex="-1">4</button></td>
            <td class="sk-calendar__cell"><button class="sk-calendar__cell-trigger sk-button sk-interactive" type="button" data-size="sm" data-variant="ghost" tabindex="-1">5</button></td>
            <td class="sk-calendar__cell"><button class="sk-calendar__cell-trigger sk-button sk-interactive" type="button" data-size="sm" data-variant="ghost" tabindex="-1">6</button></td>
            <td class="sk-calendar__cell"><button class="sk-calendar__cell-trigger sk-button sk-interactive" type="button" data-size="sm" data-variant="ghost" tabindex="-1">7</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>`;

const label = (target: string, side: string, text: string, extra = ""): string =>
  `<span class="sk-annotation" data-for="${target}" data-side="${side}" data-match="first"${extra} tabindex="0">${text}</span>`;

export const datePickerAnatomyHtml = (t: Translate): string => `<div
  class="sk-annotated"
  data-sk-annotated
  aria-label="${t("datePicker.anatomyLabel")}"
  data-ring-placement="inset"
  data-ring-distance="2"
  role="group"
>
  <div class="sk-annotated__subject" inert>
    ${datePickerAnatomySpecimen(t)}
  </div>
  ${label(".sk-date-picker", "inline-start", "sk-date-picker")}
  ${label(".sk-date-picker__label", "inline-start", "sk-date-picker__label")}
  ${label(".sk-date-picker__control", "inline-start", "sk-date-picker__control")}
  ${label(".sk-date-picker__input", "inline-end", "sk-date-picker__input", ' data-ring-placement="offset" data-ring-distance="4"')}
  ${label(".sk-date-picker__clear", "inline-end", "sk-date-picker__clear")}
  ${label(".sk-date-picker__trigger", "inline-end", "sk-date-picker__trigger")}
  ${label(".sk-date-picker__positioner", "inline-start", "sk-date-picker__positioner")}
  ${label(".sk-date-picker__content", "inline-start", "sk-date-picker__content")}
  <svg class="sk-annotated__leaders" aria-hidden="true" focusable="false"></svg>
</div>`;

export const datePickerAnatomyCss = `.sk-annotated {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject > .sk-date-picker {
  display: inline-grid;
  justify-items: stretch;
  gap: var(--space-stack-md);
  inline-size: min(100%, 18rem);
}

.sk-annotated__subject > .sk-date-picker > .sk-date-picker__positioner {
  position: static;
  inline-size: 100%;
  display: block;
}

.sk-annotated .sk-date-picker__content {
  inline-size: 100%;
}

.sk-annotated__subject {
  text-align: center;
}`;
