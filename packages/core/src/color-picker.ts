import type { ComponentContract } from "./contract.js";

/*
 * COLOR PICKER: the contract; half authored, half derived, the same split `date-picker.ts` makes.
 *
 * The CONTROL is markup: a label and the swatch button that opens the panel. The enhancer finds
 * those by their part classes and patches them. The PANEL (the 2D saturation/value area, the hue
 * and alpha rails, the channel-input rows, the presets row, the eyedropper) is not markup at all;
 * it is derived from `@zag-js/color-picker`'s own state, so both bindings generate it and neither
 * composition nor this template says anything about its internals  -  exactly as DatePicker's
 * calendar is derived from `@zag-js/date-picker` rather than templated here.
 *
 * `ColorPicker` and `ColorPicker.compact` share this same control chrome and this same option
 * set; only the PANEL each opens differs  -  full renders every channel-input row (hex, RGB, HSL,
 * OKLCH) plus the presets row and the eyedropper, compact renders only the area, the hue rail and
 * presets. That is a second SIGNATURE rather than a density flag for the reason
 * `CodePreview.density` (`code-preview.ts`) is one: the anatomy genuinely differs, whole rows
 * present or absent, not merely their spacing.
 *
 * Presets are the one piece of the panel that IS author data (`swatches`, a plain space-separated
 * option, see its own comment below) rather than derived state; both bindings' panel renderers
 * turn each entry into a real `getSwatchTriggerProps`/`getSwatchProps` pair at render time, so the
 * swatch row is still entirely Zag-driven markup, only the VALUES come from outside the machine.
 */

export const colorPickerParts = {
  root: "sk-color-picker",
  label: "sk-color-picker__label",
  control: "sk-color-picker__control",
  trigger: "sk-color-picker__trigger",
  swatch: "sk-color-picker__swatch",
  hiddenInput: "sk-color-picker__hidden-input",
  positioner: "sk-color-picker__positioner",
  content: "sk-color-picker__content",
} as const;

export const colorPickerAttrs = {
  root: "data-sk-color-picker",
  label: "data-sk-color-picker-label",
  control: "data-sk-color-picker-control",
  trigger: "data-sk-color-picker-trigger",
  hiddenInput: "data-sk-color-picker-hidden-input",
  positioner: "data-sk-color-picker-positioner",
  content: "data-sk-color-picker-content",
} as const;

/*
 * The PANEL's own parts  -  area, rails, channel-input rows, swatches, eyedropper  -  same role as
 * `calendarParts` plays for DatePicker's calendar grid: none of this is in `signatures.template`
 * above because none of it is authorable, it is entirely derived from `@zag-js/color-picker`'s
 * state. Unlike Calendar, there is no standalone signature for it (a picker panel makes no sense
 * outside a trigger that opens it), so these parts live here rather than in their own contract
 * file, and both bindings' derived-chrome renderers (`ColorPickerPanel.svelte` / React's
 * `ColorPickerPanel`) import them directly instead of re-deriving class names.
 */
export const colorPickerPanelParts = {
  area: "sk-color-picker__area",
  areaBackground: "sk-color-picker__area-background",
  areaThumb: "sk-color-picker__area-thumb",
  hueSlider: "sk-color-picker__hue-slider",
  hueTrack: "sk-color-picker__hue-track",
  hueThumb: "sk-color-picker__hue-thumb",
  alphaSlider: "sk-color-picker__alpha-slider",
  alphaTrack: "sk-color-picker__alpha-track",
  alphaThumb: "sk-color-picker__alpha-thumb",
  formatSwitch: "sk-color-picker__format-switch",
  formatOption: "sk-color-picker__format-option",
  channels: "sk-color-picker__channels",
  channelRow: "sk-color-picker__channel-row",
  channelLabel: "sk-color-picker__channel-label",
  channelInput: "sk-color-picker__channel-input",
  swatchGroup: "sk-color-picker__swatch-group",
  swatchTrigger: "sk-color-picker__swatch-trigger",
  swatchSwatch: "sk-color-picker__swatch-swatch",
  eyedropper: "sk-color-picker__eyedropper",
} as const;

export type ColorPickerValueChangeDetails = { value: string };

export const colorPickerContract = {
  id: "color-picker",
  css: "@skryensya/core/components/color-picker.css",
  parts: colorPickerParts,

  options: {
    /** Submitted under this name. */
    name: { type: "string", attr: "data-name", machineInput: true },
    /** The starting color, any CSS color string. React spells it `defaultValue`; `value` there is CONTROLLED. */
    value: { type: "string", attr: "data-value", prop: "defaultValue", machineInput: true },
    disabled: { type: "boolean", default: false, attr: "data-disabled", trueValue: "", machineInput: true },
    readOnly: { type: "boolean", default: false, attr: "data-readonly", trueValue: "", machineInput: true },
    required: { type: "boolean", default: false, attr: "data-required", trueValue: "", machineInput: true },
    invalid: { type: "boolean", default: false, attr: "data-invalid", trueValue: "", machineInput: true },
    /**
     * Names the swatch button. Required in practice, not in the type: the trigger is icon-only
     * (a color swatch, no text), so it is the one control on this component that a screen reader
     * cannot otherwise name. The default is generic on purpose ("Elegir color"/"Choose color");
     * a consumer editing a specific field ("Color de marca") should say what the color is FOR.
     */
    triggerLabel: { type: "string", default: "Elegir color", attr: "aria-label" },
    /**
     * Preset swatches for the panel's own presets row, any CSS color string each, space-separated
     *  -  the same "one plain-string attribute, split downstream" shape `DatePicker`'s own `value`
     * uses for a date range, not an `items` slot: an entry here has exactly one field (the color),
     * so there is nothing an items collection's per-entry markup would buy that a split string
     * does not. React's prop takes this same space-separated string OR a `string[]` (same
     * precedent as `DatePickerProps.value`'s own `readonly (DateValue | string)[] | string`):
     * there is no array/list option type in this contract model, so the string is the only shape
     * the compiler can emit as valid JSX, and the array is accepted for the more ergonomic
     * hand-authored case.
     */
    swatches: { type: "string", attr: "data-swatches", prop: "swatches" },
  },

  signatures: {
    ColorPicker: {
      intent: ["pick-a-color", "color-field", "swatch-behind-a-trigger"],
      host: { element: "div" },
      mount: colorPickerAttrs.root,
      options: ["name", "value", "disabled", "readOnly", "required", "invalid", "triggerLabel", "swatches"],
      /*
       * UNDECLARED UNTIL NOW, and the gap was silent because nothing had ever compared this
       * signature's two bindings: `ColorPicker` had zero canonical-tree coverage before
       * `ai-gates/src/trees.ts` gained one, and the first real comparison (G2, symmetry.spec.ts)
       * failed on both this and `.compact` for the reason `Tooltip`'s own comment on this field
       * states - the React binding already portals (`<Portal container={container}>`,
       * `react/components/color-picker.tsx`), but with no `portals: true` here `render-tree.tsx`
       * never hands it a scoped `container`, so every ColorPicker instance on a page with more than
       * one (this stage has two: `ColorPicker` and `.compact`) portals into the SAME
       * `document.body`, and the gate cannot tell which instance's floating content belongs to
       * which case. `ColorPicker.native` (below) has no popover and correctly has none of this.
       */
      portals: true,
      slots: {
        /** Names the field. */
        label: { accepts: "text" },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        attrs: { "data-anatomy": "full" },
        children: [
          { element: "label", part: "label", slot: "label", whenGiven: "label" },
          /*
           * The hidden native control, so the value reaches a form submission  -  same reasoning
           * and shape as Select's own hidden `<select>` (`select.ts`): the trigger is a button,
           * not a form control, so nothing else in this template can carry `name`/the current
           * value into a submit. Vanilla only ADOPTS an authored one (optional, like Select's);
           * `value` is left to the machine (`getHiddenInputProps`) rather than written here,
           * for the same reason DatePicker's visible input starts empty pre-hydration: a
           * JS-required signature has no working no-JS story beyond its own `.native` sibling.
           */
          {
            element: "input",
            part: "hiddenInput",
            mount: colorPickerAttrs.hiddenInput,
            attrs: {
              "aria-hidden": "true",
              tabindex: "-1",
              style:
                "border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px;white-space:nowrap;word-wrap:normal;",
            },
            options: ["name"],
            optionAttrs: { name: "name" },
          },
          {
            /* The anchor is the whole control (just the trigger here, but named the same as
               DatePicker's for the same reason: a consumer's own CSS targets one hook regardless
               of how many children the control ends up with). */
            element: "div",
            part: "control",
            also: ["sk-anchor"],
            children: [
              {
                element: "button",
                part: "trigger",
                also: ["sk-button", "sk-interactive"],
                options: ["triggerLabel"],
                attrs: { type: "button", "data-icon-only": "" },
                children: [{ element: "span", part: "swatch" }],
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/color-picker", name: "ColorPicker" },
    },

    "ColorPicker.compact": {
      intent: ["pick-a-color-compact", "color-field-minimal", "toolbar-color-swatch"],
      host: { element: "div" },
      mount: colorPickerAttrs.root,
      options: ["name", "value", "disabled", "readOnly", "required", "invalid", "triggerLabel", "swatches"],
      /*
       * UNDECLARED UNTIL NOW, and the gap was silent because nothing had ever compared this
       * signature's two bindings: `ColorPicker` had zero canonical-tree coverage before
       * `ai-gates/src/trees.ts` gained one, and the first real comparison (G2, symmetry.spec.ts)
       * failed on both this and `.compact` for the reason `Tooltip`'s own comment on this field
       * states - the React binding already portals (`<Portal container={container}>`,
       * `react/components/color-picker.tsx`), but with no `portals: true` here `render-tree.tsx`
       * never hands it a scoped `container`, so every ColorPicker instance on a page with more than
       * one (this stage has two: `ColorPicker` and `.compact`) portals into the SAME
       * `document.body`, and the gate cannot tell which instance's floating content belongs to
       * which case. `ColorPicker.native` (below) has no popover and correctly has none of this.
       */
      portals: true,
      slots: {
        label: { accepts: "text" },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        attrs: { "data-anatomy": "compact" },
        children: [
          { element: "label", part: "label", slot: "label", whenGiven: "label" },
          {
            element: "input",
            part: "hiddenInput",
            mount: colorPickerAttrs.hiddenInput,
            attrs: {
              "aria-hidden": "true",
              tabindex: "-1",
              style:
                "border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px;white-space:nowrap;word-wrap:normal;",
            },
            options: ["name"],
            optionAttrs: { name: "name" },
          },
          {
            element: "div",
            part: "control",
            also: ["sk-anchor"],
            children: [
              {
                element: "button",
                part: "trigger",
                also: ["sk-button", "sk-interactive"],
                options: ["triggerLabel"],
                attrs: { type: "button", "data-icon-only": "" },
                children: [{ element: "span", part: "swatch" }],
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/color-picker", name: "CompactColorPicker" },
    },

    /*
     * THE NATIVE COLOR FIELD: the layer that works with no script at all.
     *
     * A real `<input type="color">` inside the same field chrome, so the enhanced control and
     * this one read as the SAME field rather than two designs. The browser owns the picker (its
     * own OS-level swatch/eyedropper UI), the keyboard and form submission; the system
     * contributes the label wiring and the box. No RGB/HSL/OKLCH rows, no presets, no anatomy
     * choice: `type="color"` is one flat sRGB hex value, always.
     *
     * Its own signature rather than an option, for the reason `Select.native` and
     * `DatePicker.native` are: choosing between them is choosing who owns the behaviour, and no
     * flag should be able to stand in for that decision.
     */
    "ColorPicker.native": {
      intent: ["a-standard-color-field", "form-field", "no-javascript"],
      host: { element: "div" },
      options: ["name", "value"],
      slots: {
        /** Names the field. Required: a bare color input announces only its swatch. */
        label: { accepts: "text", required: true },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          { element: "label", part: "label", slot: "label" },
          {
            element: "div",
            part: "control",
            children: [
              {
                element: "input",
                part: "trigger",
                attrs: { type: "color" },
                options: ["name", "value"],
                optionAttrs: { name: "name", value: "value" },
                /*
                 * NAMED BY `aria-labelledby`, not `for`, for the same reason DatePicker.native's
                 * own comment gives: `for`/`id` needs an AUTHORED id, and both bindings render
                 * into one document in the symmetry gate, so a literal id collides across them.
                 */
                labelledBySlot: "label",
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/color-picker", name: "NativeColorPicker" },
    },
  },
} as const satisfies ComponentContract;
