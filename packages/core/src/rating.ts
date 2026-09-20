import type { ComponentContract } from "./contract.js";
import { clampedFraction } from "./fraction.js";

/*
 * RATING, the same measurement in two directions: one a person sets, one a page reports.
 *
 * TWO SIGNATURES AND NOT TWO CONTRACTS, because they are one promise seen from both ends. A review
 * form collects "how many stars" and the product page beside it shows the average of what everyone
 * collected: the scale, the symbol and the reading are identical, and splitting them would be two
 * stylesheets and two vocabularies for one idea. It is the same cut `input` already makes across
 * `Input`/`Textarea`/`NativeInput`: one appearance, several controls.
 *
 * WHAT MOVED OUT OF METER. `meter.ts` used to claim `rating-out-of-a-scale` in its own intent, and
 * it was right until this existed: a rating IS a measurement in a known range, which is exactly
 * what a meter is. What it is not is a BAR. That intent now lives here, and Meter keeps the
 * readings that are genuinely bar-shaped (disk, battery). Two contracts answering one intent is how
 * the catalogue starts routing an agent to the wrong one.
 *
 * THE SYMBOL IS CSS, NOT AN ICON, and that is a deliberate departure from how the rest of the kit
 * draws things. The icon vocabulary names ROLES ("delete", "close"): things a set draws its own way.
 * A rating symbol is not one of those. It is a unit of a scale, closer to a Progress bar's fill than
 * to an action, and the vocabulary cannot express it anyway: `attrs` on an icon set is per SET, not
 * per icon (`scripts/emit-icon-set.ts`), so "filled star" and "empty star" cannot be two roles
 * without one published set being degenerate. Lucide has no filled star; Material's star cannot
 * become an outline. So the glyph is a mask behind `--sk-rating-symbol`, identical in every set,
 * and swapping it for a heart or a thumb is one custom property rather than a change to the
 * vocabulary that all three icon packages would have to follow.
 */
export const ratingParts = {
  root: "sk-rating",
  /** Zag puts the radiogroup here, not on the root, so this is what carries the accessible name. */
  control: "sk-rating__control",
  /** The display's whole strip: one element, one repeated mask. See `ratingFillPercent`. */
  symbols: "sk-rating__symbols",
  /** The input's radio, one per step. */
  item: "sk-rating__item",
  /** The glyph inside a radio. Decorative in both signatures. */
  symbol: "sk-rating__symbol",
  /** The form participant. Hidden, and present in both bindings so a plain submit carries the value. */
  input: "sk-rating__input",
  value: "sk-rating__value",
  count: "sk-rating__count",
} as const;

export type RatingPart = keyof typeof ratingParts;
export type RatingPartClass = (typeof ratingParts)[RatingPart];

export const ratingAttrs = {
  root: "data-sk-rating",
  control: "data-sk-rating-control",
  item: "data-sk-rating-item",
  input: "data-sk-rating-input",
} as const;

export type RatingValueChangeDetails = { value: number };

/** The DOM event the input dispatches, `sk:<family><event>` like every other family. */
export const ratingEvents = {
  /** Detail: `{ value: number }`. */
  valueChange: "sk:ratingvaluechange",
} as const;

/** Five, because that is what a rating out of anything else has to explain. */
export const ratingDefaultMax = 5;

/**
 * How much of the strip is filled, as a percentage, for `value` out of `max`.
 *
 * ONE NUMBER FOR THE WHOLE ROW rather than one per symbol, and that is what makes a fractional
 * rating exact instead of rounded. The stylesheet repeats the symbol mask `max` times across the
 * strip and paints underneath it with a hard colour stop at this percentage, so 4.3 of 5 stops the
 * fill 86% across: four whole symbols and three tenths of the fifth. Nothing rounds, and no element
 * has to exist per symbol for the display to be honest about its own average.
 *
 * Clamped through `clampedFraction`, so a value outside the scale paints the end of it rather than
 * overflowing the strip.
 */
export function ratingFillPercent(value: number, max: number = ratingDefaultMax): number {
  return clampedFraction(value, 0, max) * 100;
}

/**
 * Snaps to the nearest half.
 *
 * Not applied anywhere by default, and offered because "4.3 stars" is a number a lot of products
 * would rather show as 4.5 than as the literal 86% this contract paints. That is a product
 * decision, so it is a function a consumer calls on the way in, never a rounding this contract does
 * to a value it was handed.
 */
export function ratingRoundToHalf(value: number): number {
  return Math.round(value * 2) / 2;
}

export const ratingContract = {
  id: "rating",
  category: "forms",
  css: "@skryensya/core/components/rating.css",
  parts: ratingParts,
  events: ratingEvents,
  eventDetails: {
    valueChange: { detail: { value: "number" }, reactProp: "onValueChange", source: "root", trigger: "item" },
  },
  hooks: [
    "--sk-rating-fill",
    "--sk-rating-gap",
    "--sk-rating-max",
    "--sk-rating-off-color",
    "--sk-rating-on-color",
    "--sk-rating-size",
    "--sk-rating-symbol",
    "--sk-rating-tile",
  ],

  options: {
    /**
     * The measurement, for the display. Fractional on purpose: an average of 4.3 is the number the
     * data actually holds, and painting it as 4 is the component lying about its own source.
     */
    value: { type: "number", default: 0, between: { max: "max" }, styleProperty: "--sk-rating-value" },
    /** The value the input starts on. Whole steps only; see `Rating`'s own note. */
    defaultValue: { type: "number", default: 0, integer: true, between: { max: "max" }, attr: "data-default-value", machineInput: true },
    /** How many steps the scale has. */
    max: { type: "number", default: ratingDefaultMax, min: 1, integer: true, styleProperty: "--sk-rating-max" },
    /**
     * The accessible name, and REQUIRED on both signatures for different reasons that land in the
     * same place: a row of symbols announces nothing on its own, and "4.3 out of 5" is a sentence
     * only the consumer can write in the reader's own language.
     */
    label: { type: "string", attr: "aria-label" },
    /* Machine inputs: authored markup has no channel but an attribute, and React hands them to the
       machine as props without writing them back. The symmetry gate normalizes the difference. */
    name: { type: "string", attr: "data-name", machineInput: true },
    disabled: { type: "boolean", default: false, attr: "data-disabled", trueValue: "" },
    /** Shows the value and refuses to change it. Not `disabled`: a read-only rating is still read. */
    readOnly: { type: "boolean", default: false, attr: "data-readonly", trueValue: "" },
    symbolSize: { type: "enum", values: ["sm", "md", "lg"], default: "md", attr: "data-size" },
    /**
     * Each step's own accessible name, with `{value}` standing for its number.
     *
     * A bare number by default, and that is the considered choice rather than laziness: the step
     * sits inside a radiogroup that already carries the name of the whole thing, and `aria-posinset`
     * / `aria-setsize` already say "3 of 5". "3 stars" would repeat the symbol the reader was never
     * told about, in a language the consumer did not choose.
     */
    itemLabel: { type: "string", default: "{value}", attr: "data-item-label", machineInput: true },
  },

  signatures: {
    /*
     * THE INPUT. A radio group, which is what WAI-ARIA has for "pick exactly one of a small ordered
     * set": one tab stop, arrows to move, and the group carrying the name. A slider was the other
     * candidate and loses on the thing this actually is: five discrete choices, not a continuum.
     *
     * WHOLE STEPS ONLY, while the display takes fractions. Asking someone to land a pointer on half
     * of a 20px symbol is a 10px target, and on a touch screen it is a coin toss; reporting half of
     * what a hundred people chose is just arithmetic. The asymmetry is the honest one.
     */
    Rating: {
      intent: ["rating-input", "star-rating", "rate-this", "review-score-input"],
      host: { element: "div" },
      options: ["defaultValue", "max", "label", "name", "disabled", "readOnly", "symbolSize", "itemLabel"],
      requires: ["label"],
      forward: ["id", "aria-*"],
      mount: ratingAttrs.root,
      slots: {},
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          {
            /*
             * THE GROUP IS HERE AND NOT ON THE ROOT, which is a fact about the machine rather than a
             * preference: `@zag-js/rating-group` puts `role="radiogroup"` on its control element, so
             * a name written on the root would name a box that is not the group. `display: contents`
             * in the stylesheet keeps it from adding a second box.
             */
            element: "div",
            part: "control",
            mount: ratingAttrs.control,
            options: ["label"],
            attrs: { role: "radiogroup" },
            children: [
          {
            /*
             * One radio per step. The window carries only the step's own number: which ones look
             * filled is not per-item data, it follows from which one is checked, and the stylesheet
             * reads that off the DOM with `:has(~ [aria-checked="true"])` rather than having the
             * emitter mark each one.
             */
            repeatComputed: { window: "rating-symbols", from: ["max"], key: "value" },
            element: "span",
            part: "item",
            also: ["sk-interactive"],
            mount: ratingAttrs.item,
            attrs: { role: "radio" },
            selectedBy: { option: "defaultValue", attr: "aria-checked", value: "true" },
            children: [
              { element: "span", part: "symbol", attrs: { "aria-hidden": "true" } },
            ],
          },
            ],
          },
          /*
           * THE FORM PARTICIPANT, authored rather than injected. The machine writes the current
           * value onto it in both bindings; having it in the markup is what lets an enhanced page
           * submit a rating through a plain `<form>` without the enhancer creating an element,
           * which no enhancer in this layer does.
           */
          {
            element: "input",
            part: "input",
            mount: ratingAttrs.input,
            attrs: { type: "text", hidden: "" },
          },
        ],
      },
      react: { from: "@skryensya/react/rating", name: "Rating" },
    },

    /*
     * THE DISPLAY. `role="img"` with the authored label, and every symbol `aria-hidden`: the reading
     * is one fact ("4.3 out of 5"), so it is announced once as one thing rather than as five
     * separate images a reader has to add up. Not `role="meter"`, which `Meter` already is: a meter
     * announces a live measurement being tracked, and an average review score is a static fact.
     */
    RatingDisplay: {
      intent: ["rating-display", "average-score", "review-score", "stars-out-of-five"],
      host: { element: "span" },
      options: ["value", "max", "label", "symbolSize"],
      requires: ["label"],
      forward: ["id", "aria-*"],
      slots: {
        /** The number, written out: "4,3" in one locale and "4.3" in another, so it is authored. */
        valueText: { accepts: "node" },
        /** How many ratings the average is of: "128 reviews". Authored, for the same reason. */
        count: { accepts: "node" },
      },
      template: {
        element: "span",
        part: "root",
        host: true,
        attrs: { role: "img" },
        children: [
          {
            element: "span",
            part: "symbols",
            attrs: { "aria-hidden": "true" },
            /* The whole strip in one number. See `ratingFillPercent`. */
            style: [{ property: "--sk-rating-fill", percentOf: ["value", "max"] }],
          },
          { element: "span", part: "value", name: "valueText", whenGiven: "valueText", slot: "valueText" },
          { element: "span", part: "count", name: "count", whenGiven: "count", slot: "count" },
        ],
      },
      react: { from: "@skryensya/react/rating", name: "RatingDisplay" },
    },
  },
} as const satisfies ComponentContract;

/** Derived, never restated: adding a size to the contract's enum is the only edit. */
export type RatingSymbolSize = NonNullable<
  (typeof ratingContract.options.symbolSize)["values"]
>[number];
