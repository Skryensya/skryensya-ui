import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * The color picker four ways: full, compact, with presets, and native. The native one has its own
 * signature (`ColorPicker.native`) for the reason `DatePicker.native` has one: choosing between
 * them is choosing WHO OWNS the behaviour, the browser or an enhancer, and no flag should be able
 * to stand in for that decision.
 */

/*
 * THE ANATOMY SPECIMEN is authored as MARKUP, same reason Menu's is: the panel parts only exist
 * while the picker is open, and a live machine cannot be held open under an inert specimen (the
 * first pointer press reaches Zag's dismiss layer and closes it with no way back). Mount attributes
 * are gone so `initComponents` never sees this tree; what stays are the part classes and
 * `data-state="open"` the stylesheet reads. Thumbs are omitted on purpose: the densest useful
 * labels are the area, content, channels, preset row and eyedropper, not every rail handle.
 */
const colorPickerAnatomySpecimen = (t: Translate): string => `<div
  class="sk-color-picker"
  data-anatomy="full"
  style="--value: #3366ff"
>
  <label class="sk-color-picker__label">${t("demo.colorPicker.label")}</label>
  <div class="sk-color-picker__control sk-anchor">
    <button class="sk-color-picker__trigger sk-button sk-interactive" type="button" data-icon-only="" aria-label="${t("demo.colorPicker.label")}" aria-expanded="true">
      <span class="sk-color-picker__swatch"></span>
    </button>
  </div>
  <div class="sk-color-picker__positioner sk-anchored">
    <div class="sk-color-picker__content" data-state="open">
      <div class="sk-color-picker__area">
        <div class="sk-color-picker__area-background"></div>
      </div>
      <div class="sk-color-picker__hue-slider">
        <div class="sk-color-picker__hue-track"></div>
      </div>
      <div class="sk-color-picker__channels">
        <div class="sk-color-picker__channel-row" style="--sk-color-picker-channel-count: 1">
          <span class="sk-color-picker__channel-label">Hex</span>
          <input class="sk-color-picker__channel-input" value="#3366ff" readonly />
        </div>
      </div>
      <div class="sk-color-picker__swatch-group">
        <button class="sk-color-picker__swatch-trigger" type="button" data-state="checked">
          <span class="sk-color-picker__swatch-swatch" style="--value: #3366ff"></span>
        </button>
        <button class="sk-color-picker__swatch-trigger" type="button">
          <span class="sk-color-picker__swatch-swatch" style="--value: #ef4444"></span>
        </button>
        <button class="sk-color-picker__swatch-trigger" type="button">
          <span class="sk-color-picker__swatch-swatch" style="--value: #22c55e"></span>
        </button>
      </div>
      <button class="sk-color-picker__eyedropper sk-button sk-interactive" type="button" data-size="sm" data-variant="ghost" data-icon-only="" aria-label="Eyedropper">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="m2 22 1-4 9.5-9.5" />
          <path d="M12.5 8.5 16 5" />
          <path d="M14.5 3.5 20.5 9.5 17.5 12.5 11.5 6.5Z" />
        </svg>
      </button>
    </div>
  </div>
</div>`;

const label = (target: string, side: string, text: string, extra = ""): string =>
  `<span class="sk-annotation" data-for="${target}" data-side="${side}" data-match="first"${extra} tabindex="0">${text}</span>`;

/** Open panel frozen in flow: trigger, content, area, channels, presets, eyedropper. */
export const colorPickerAnatomyHtml = (t: Translate): string => `<div
  class="sk-annotated"
  data-sk-annotated
  aria-label="${t("colorPicker.anatomyLabel")}"
  data-ring-placement="inset"
  data-ring-distance="2"
  role="group"
>
  <div class="sk-annotated__subject" inert>
    ${colorPickerAnatomySpecimen(t)}
  </div>
  ${label(".sk-color-picker", "block-start", "sk-color-picker")}
  ${label(".sk-color-picker__label", "inline-start", "sk-color-picker__label", ' data-ring-placement="offset" data-ring-distance="2"')}
  ${label(".sk-color-picker__trigger", "inline-start", "sk-color-picker__trigger")}
  ${label(".sk-color-picker__swatch", "inline-start", "sk-color-picker__swatch", ' data-ring-placement="offset" data-ring-distance="2"')}
  ${label(".sk-color-picker__content", "inline-end", "sk-color-picker__content")}
  ${label(".sk-color-picker__area", "inline-end", "sk-color-picker__area")}
  ${label(".sk-color-picker__channels", "inline-end", "sk-color-picker__channels", ' data-ring-placement="offset" data-ring-distance="2"')}
  ${label(".sk-color-picker__swatch-group", "block-end", "sk-color-picker__swatch-group")}
  ${label(".sk-color-picker__eyedropper", "block-end", "sk-color-picker__eyedropper")}
  <svg class="sk-annotated__leaders" aria-hidden="true" focusable="false"></svg>
</div>`;

/*
 * Put the floating panel back in flow under the trigger, same move Menu's anatomy CSS makes: out of
 * flow the frame sizes to the trigger alone and the panel lands on top of the labels naming it.
 */
export const colorPickerAnatomyCss = `.sk-annotated {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject > .sk-color-picker {
  display: grid;
  justify-items: start;
  gap: var(--space-stack-md);
}

.sk-annotated .sk-color-picker__positioner {
  position: static;
  inline-size: max-content;
}

.sk-annotated .sk-color-picker__content {
  display: grid;
  gap: var(--sk-color-picker-content-gap, var(--space-stack-xs));
}

.sk-annotated .sk-color-picker__area {
  background: linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, #3366ff);
}

.sk-annotated .sk-color-picker__hue-track {
  block-size: 0.75rem;
  border-radius: var(--radius-pill);
  background: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00);
}`;

export const colorPickerTree = (t: Translate): UsageTree => ({
  contract: "color-picker",
  signature: "ColorPicker",
  options: { name: "brand", value: "#3366ff" },
  slots: { label: t("demo.colorPicker.label") },
});

export const compactColorPickerTree = (t: Translate): UsageTree => ({
  contract: "color-picker",
  signature: "ColorPicker.compact",
  options: { name: "accent", value: "#22aabb" },
  slots: { label: t("demo.colorPicker.compactLabel") },
});

export const presetsColorPickerTree = (t: Translate): UsageTree => ({
  contract: "color-picker",
  signature: "ColorPicker",
  options: {
    name: "brand",
    value: "#3366ff",
    swatches: "#ef4444 #22c55e #3366ff #f59e0b #111111 #ffffff",
  },
  slots: { label: t("demo.colorPicker.presetsLabel") },
});

export const disabledColorPickerTree = (t: Translate): UsageTree => ({
  contract: "color-picker",
  signature: "ColorPicker",
  options: { value: "#3366ff", disabled: true },
  slots: { label: t("demo.colorPicker.label") },
});

/** The layer that works with no script at all: a real `<input type="color">` in the same chrome. */
export const nativeColorPickerTree = (t: Translate): UsageTree => ({
  contract: "color-picker",
  signature: "ColorPicker.native",
  options: { name: "bg", value: "#ffffff" },
  slots: { label: t("demo.colorPicker.nativeLabel") },
});
