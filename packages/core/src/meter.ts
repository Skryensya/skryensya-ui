import type { ComponentContract } from "./contract.js";

/*
 * METER, a measurement within a known range — never a task's completion.
 *
 * The distinction from `Progress` is the whole reason this is a separate contract rather than an
 * option on that one: a progress bar reports how much of a KNOWN-LENGTH TASK has finished (uploads,
 * installs — always starting at 0, sometimes indeterminate), a meter reports a MEASUREMENT that
 * already has a value right now (disk usage, battery level, a rating out of five) and is never
 * indeterminate. WAI-ARIA gives them different roles (`meter` vs `progressbar`) for exactly this
 * reason, and conflating them under one component would make "0%" ambiguous between "just started"
 * and "measured as empty".
 *
 * `role="meter"` on a styled `<div>`, the same choice `Progress` already made over the native
 * `<progress>` element: native `<meter>` carries the same cross-browser styling limitations (its
 * `::-webkit-meter-*` pseudo-elements are as inconsistent as `<progress>`'s own), so this stays
 * consistent with the sibling component rather than introducing a second, native-only pattern for
 * the same kind of "a value painted as a bar" primitive.
 *
 * PAINTED DIFFERENTLY FROM PROGRESS, on purpose: the two used to be visually identical (same track,
 * same fill), which is right for the CSS anatomy but wrong for a reader scanning the page — nothing
 * told them apart. The industry precedent (Adobe Spectrum's `<sp-meter>`, the closest sibling to this
 * contract's own ARIA-driven `meter`-vs-`progressbar` split) always shows a visible label and value
 * next to the bar; a progress bar's label is optional and contextual instead. So `Meter` grows a
 * header row — `label` and `valueText` painted, not just announced — while `Progress` stays a bare
 * bar. `label`/`valueText` remain real ARIA attributes on the track too (`textFromOption` only adds a
 * SECOND, visible rendering of the same string; it does not replace `aria-label`/`aria-valuetext`),
 * so a screen reader's own reading of the widget never depends on the sighted layout beside it.
 */
export const meterParts = {
  root: "sk-meter-group",
  header: "sk-meter-group__header",
  label: "sk-meter-group__label",
  value: "sk-meter-group__value",
  track: "sk-meter",
  bar: "sk-meter__bar",
} as const;

export type MeterPart = keyof typeof meterParts;
export type MeterPartClass = (typeof meterParts)[MeterPart];

export type MeterTone = "accent" | "success" | "warning" | "danger";

/** Filled fraction (0–1) for a value within [min, max]. Guards an empty or inverted range. Unlike
 *  `progressFraction`, `min` is a real, commonly non-zero parameter here — a progress bar's task
 *  always starts at 0, a measurement's scale (temperature, a rating) very often does not. */
export function meterFraction(value: number, min: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || max <= min) return 0;
  return Math.min(Math.max((value - min) / (max - min), 0), 1);
}

export const meterContract = {
  id: "meter",
  css: "@skryensya/core/components/meter.css",
  parts: meterParts,

  options: {
    value: { type: "number", default: 0, attr: "aria-valuenow" },
    min: { type: "number", default: 0, attr: "aria-valuemin" },
    max: { type: "number", default: 100, attr: "aria-valuemax" },
    /** For when the raw number alone is not user-friendly: "50% (6 hours) remaining". Optional —
     *  WAI lists it as recommended, not required. */
    valueText: { type: "string", attr: "aria-valuetext" },
    tone: {
      type: "enum",
      values: ["accent", "success", "warning", "danger"],
      default: "accent",
      attr: "data-tone",
    },
    /** The accessible name. A meter with no name announces a number about nothing. */
    label: { type: "string", attr: "aria-label" },
  },

  signatures: {
    Meter: {
      intent: ["measurement-in-a-range", "disk-usage", "battery-level", "rating-out-of-a-scale"],
      host: { element: "div" },
      options: ["value", "min", "max", "valueText", "tone", "label"],
      requires: ["label"],
      slots: {},
      template: {
        element: "div",
        part: "root",
        children: [
          {
            /*
             * Decorative: this row is PAINTED, and the track below carries its own `aria-label`/
             * `aria-valuetext` independently (the file banner above says so explicitly). Without
             * `aria-hidden`, a screen reader read the same name and value TWICE, once from this
             * row's own text and once from the track's ARIA — and read them differently besides,
             * since the two bindings do not agree on whitespace between the label and value spans.
             * Hiding the row is what makes that inconsistency moot rather than a divergence to chase.
             */
            element: "div",
            part: "header",
            attrs: { "aria-hidden": "true" },
            children: [
              { element: "span", part: "label", textFromOption: "label" },
              // Only when the author gave one: `valueText` is recommended, not required (WAI), and
              // a bare number ("68%") next to an unlabelled bar is less legible than no number at all.
              { element: "span", part: "value", whenGiven: "valueText", textFromOption: "valueText" },
            ],
          },
          {
            element: "div",
            part: "track",
            host: true,
            attrs: { role: "meter" },
            // No static `style` entry here, unlike `Progress`/`Slider`'s own `percentOf` shortcut —
            // that primitive computes `value/max` and has no way to subtract `min`, which is fine for
            // `Progress` (`min` is always 0 there) but would be WRONG more often than not for a meter,
            // where a non-zero `min` (temperature, a 1–5 rating) is a normal case, not an edge one. The
            // real bindings (React/vanilla) compute the fill correctly via `meterFraction`; the
            // fallback in `meter.css` covers the brief static-markup window before either runs.
            children: [{ element: "div", part: "bar" }],
          },
        ],
      },
      mount: "data-sk-meter",
      react: { from: "@skryensya/react/meter", name: "Meter" },
    },
  },
} as const satisfies ComponentContract;
