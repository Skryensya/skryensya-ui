import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/* Segmented and native time controls share the page's locale-owned field name. */

/** A departure time, already set. Locale and field name are owned by the page. */
export const timeFieldTree = (
  t: Translate,
  opts: { locale: string; name: string },
): UsageTree => ({
  contract: "time-field",
  signature: "TimeField",
  options: {
    locale: opts.locale,
    value: "09:30",
    name: opts.name,
  },
  slots: { label: t("demo.timeField.label") },
});

/*
 * THE ANATOMY SPECIMEN: frozen open markup. TimeField's preset list is a Select positioner
 * (anchored out of flow); a live machine dismisses on the first pointer press in an inert frame.
 * No `data-sk-*` mount attributes. Select's content is open unless `[data-state="closed"]`, so
 * omitting closed keeps the panel painted. Structure matches the bindings' own control + trailing
 * picker (TimeField.svelte / time-field.tsx), minus mounts and the hidden wire input.
 */
const timeFieldAnatomySpecimen = (t: Translate): string => `<div class="sk-time-field" aria-label="${t("timeFieldPage.anatomyLabel")}">
  <span class="sk-time-field__label">${t("demo.timeField.label")}</span>
  <div class="sk-time-field__control sk-anchor" role="group">
    <div class="sk-time-field__segment" role="spinbutton" tabindex="-1">09</div>
    <span aria-hidden="true" class="sk-time-field__literal">:</span>
    <div class="sk-time-field__segment" role="spinbutton" tabindex="-1">30</div>
    <button class="sk-time-field__clear sk-button sk-interactive" type="button" data-icon-only data-size="sm" data-variant="ghost" tabindex="-1">
      <span data-sk-icon="close" data-sk-icon-size="sm"></span>
    </button>
    <span class="sk-time-field__trailing">
      <button class="sk-button sk-interactive sk-time-field__options-trigger" type="button" data-icon-only data-size="sm" data-variant="ghost" data-state="open" aria-expanded="true" tabindex="-1">
        <span data-sk-icon="clock" data-sk-icon-size="sm"></span>
      </button>
    </span>
  </div>
  <div class="sk-select__positioner sk-anchored sk-time-field__options-positioner" data-sk-placement="block-end">
    <ul class="sk-select__content sk-scrollbar" role="listbox" aria-label="${t("demo.timeField.optionsLabel")}">
      <li class="sk-select__item sk-interactive" role="option">
        <span class="sk-select__item-text">09:00</span>
        <span class="sk-select__item-indicator"><span data-sk-icon="check" data-sk-icon-size="md"></span></span>
      </li>
      <li class="sk-select__item sk-interactive" role="option" data-state="checked" aria-selected="true">
        <span class="sk-select__item-text">09:30</span>
        <span class="sk-select__item-indicator"><span data-sk-icon="check" data-sk-icon-size="md"></span></span>
      </li>
      <li class="sk-select__item sk-interactive" role="option">
        <span class="sk-select__item-text">10:00</span>
        <span class="sk-select__item-indicator"><span data-sk-icon="check" data-sk-icon-size="md"></span></span>
      </li>
    </ul>
  </div>
</div>`;

const label = (target: string, side: string, text: string, extra = ""): string =>
  `<span class="sk-annotation" data-for="${target}" data-side="${side}" data-match="first"${extra} tabindex="0">${text}</span>`;

export const timeFieldAnatomyHtml = (t: Translate): string => `<div
  class="sk-annotated"
  data-sk-annotated
  aria-label="${t("timeFieldPage.anatomyLabel")}"
  data-ring-placement="inset"
  data-ring-distance="2"
  role="group"
>
  <div class="sk-annotated__subject" inert>
    ${timeFieldAnatomySpecimen(t)}
  </div>
  ${label(".sk-time-field", "block-start", "sk-time-field", ' data-ring-placement="offset" data-ring-distance="8"')}
  ${label(".sk-time-field__label", "inline-start", "sk-time-field__label")}
  ${label(".sk-time-field__control", "inline-start", "sk-time-field__control")}
  ${label(".sk-time-field__segment", "inline-end", "sk-time-field__segment", ' data-ring-placement="offset" data-ring-distance="4"')}
  ${label(".sk-time-field__literal", "inline-end", "sk-time-field__literal")}
  ${label(".sk-time-field__clear", "inline-end", "sk-time-field__clear")}
  ${label(".sk-time-field__options-trigger", "inline-end", "sk-time-field__options-trigger")}
  ${label(".sk-time-field__options-positioner", "inline-start", "sk-time-field__options-positioner")}
  ${label(".sk-select__content", "inline-start", "sk-select__content")}
  ${label(".sk-select__item", "inline-end", "sk-select__item", ' data-ring-placement="offset" data-ring-distance="3"')}
  <svg class="sk-annotated__leaders" aria-hidden="true" focusable="false"></svg>
</div>`;

/*
 * Put the preset listbox back in flow: the positioner is `position: fixed` / anchored, which is
 * right for a live field and useless for a diagram. Static under the control, same move Select and
 * Combobox anatomy CSS make. Cap the list so three rows name the part without a tall scroll region.
 */
export const timeFieldAnatomyCss = `.sk-annotated {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject > .sk-time-field {
  display: inline-grid;
  justify-items: stretch;
  gap: var(--space-stack-md);
  inline-size: min(100%, 16rem);
}

.sk-annotated__subject > .sk-time-field > .sk-time-field__options-positioner {
  position: static;
  inline-size: 100%;
}

.sk-annotated .sk-time-field__options-positioner .sk-select__content {
  min-inline-size: 100%;
  max-block-size: none;
}

.sk-annotated__subject {
  text-align: center;
}`;

/**
 * A 24-hour field, GUARANTEED: `hourCycle: "h24"` overrides whatever the locale's own `Intl`
 * guess would otherwise resolve to. That guess is unreliable enough to demonstrate directly: the
 * SAME locale string ("es"/"es-AR") resolves to opposite cycles across Node's own ICU build and a
 * real Chromium (`resolveHourCycle`'s own doc, `@skryensya/core/time-field`). A consumer that
 * needs a guaranteed 24-hour field (a scheduling form, an ops dashboard) cannot depend on that
 * guess landing the same way in every browser.
 */
export const timeFieldForced24Tree = (
  t: Translate,
  opts: { locale: string; name: string },
): UsageTree => ({
  contract: "time-field",
  signature: "TimeField",
  options: {
    locale: opts.locale,
    hourCycle: "h24",
    value: "22:15",
    name: opts.name,
  },
  slots: { label: t("demo.timeField.forced24Label") },
});

/**
 * `optionsStep` (contract option, `@skryensya/core/time-field`) shown at a tighter grain than the
 * default 30 minutes. 96 rows instead of 48, still short enough to arrow-key through without a
 * search box.
 */
export const timeFieldQuarterHourTree = (
  t: Translate,
  opts: { locale: string; name: string },
): UsageTree => ({
  contract: "time-field",
  signature: "TimeField",
  options: {
    locale: opts.locale,
    value: "09:30",
    name: opts.name,
    optionsStep: 15,
  },
  slots: { label: t("demo.timeField.label") },
});

export const timeFieldNativeTree = (
  t: Translate,
  opts: { name: string },
): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  slots: { label: t("demo.timeField.label") },
  children: {
    contract: "input",
    signature: "NativeInput",
    options: { type: "time", name: opts.name },
  },
});
