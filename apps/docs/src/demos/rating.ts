import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { namePart } from "./annotation-parts";

/*
 * The two directions of one contract, in the order the page argues them: the reading first, because
 * it is what a visitor sees on a product page, then the control that produces it.
 */

/** The display: an average, its number and what it is an average of. */
export const ratingDisplayTree = (t: Translate): UsageTree => ({
  contract: "rating",
  signature: "RatingDisplay",
  options: { value: 4.3, label: t("demo.rating.displayLabel") },
  slots: { valueText: "4,3", count: t("demo.rating.count") },
});

/** The input: five steps, nothing chosen yet. */
export const ratingInputTree = (t: Translate): UsageTree => ({
  contract: "rating",
  signature: "Rating",
  options: { label: t("demo.rating.inputLabel"), name: "score" },
});

/*
 * THE FRACTION, shown three times rather than described once. A rating that rounds 4.3 to 4 and 3.8
 * to 4 draws the same picture for two different products, which is the whole argument for painting
 * the exact percentage.
 */
export const ratingFractionsTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  children: [
    {
      contract: "rating",
      signature: "RatingDisplay",
      options: { value: 3.8, label: t("demo.rating.fraction38") },
      slots: { valueText: "3,8" },
    },
    {
      contract: "rating",
      signature: "RatingDisplay",
      options: { value: 4.3, label: t("demo.rating.fraction43") },
      slots: { valueText: "4,3" },
    },
    {
      contract: "rating",
      signature: "RatingDisplay",
      options: { value: 5, label: t("demo.rating.fraction50") },
      slots: { valueText: "5,0" },
    },
  ],
});

/** A read-only input is still a control a reader can move through; a display is not. */
export const ratingSizesTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  children: [
    {
      contract: "rating",
      signature: "RatingDisplay",
      options: { value: 4, label: t("demo.rating.sizeSm"), symbolSize: "sm" },
    },
    {
      contract: "rating",
      signature: "RatingDisplay",
      options: { value: 4, label: t("demo.rating.sizeMd") },
    },
    {
      contract: "rating",
      signature: "RatingDisplay",
      options: { value: 4, label: t("demo.rating.sizeLg"), symbolSize: "lg" },
    },
  ],
});

/*
 * ONE LABEL, because the contract publishes one symbol and what matters is that BOTH signatures
 * wear it: the strip the display paints and the glyph inside a radio are the same mask, which is
 * why swapping `--sk-rating-symbol` changes both at once.
 */
export const ratingAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("ratingPage.anatomyLabel"), inert: true },
  slots: {
    subject: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [
        {
          contract: "rating",
          signature: "RatingDisplay",
          options: { value: 4.3, label: t("demo.rating.displayLabel") },
          slots: { valueText: "4,3" },
        },
        {
          contract: "rating",
          signature: "Rating",
          options: { label: t("demo.rating.inputLabel"), name: "anatomy", defaultValue: 3 },
        },
      ],
    },
    items: [
      namePart(".sk-rating__symbols", "inline-end"),
      namePart(".sk-rating__item", "block-end", { match: "all" }),
    ],
  },
});
