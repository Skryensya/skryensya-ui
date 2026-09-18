import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { radioGroupItems, tileRadioGroupItems } from "./data/radio-group";
import { namePart } from "./annotation-parts";

/* Native and tile radio groups share one authored choice model: see `data/radio-group.ts`. */


/** Group, option, input, control, indicator and label: one exclusive choice named at rest. */
export const radioGroupAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("radioGroupPage.anatomyLabel"), inert: true },
  slots: {
    subject: {
      contract: "radio-group",
      signature: "RadioGroup",
      options: {
        name: "plan-anatomy",
        value: "pro",
        orientation: "vertical",
        label: t("demo.radioGroup.label"),
      },
      slots: { items: radioGroupItems },
    },
    items: [
      namePart(".sk-radio-group", "block-start"),
      namePart(".sk-radio", "inline-start"),
      namePart(".sk-radio__input", "inline-start"),
      namePart(".sk-radio__control", "inline-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-radio__indicator", "inline-end"),
      namePart(".sk-radio__label", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});

/** An exclusive choice between three plans. */
export const radioGroupTree = (t: Translate): UsageTree => ({
  contract: "radio-group",
  signature: "RadioGroup",
  options: {
    name: "plan",
    value: "pro",
    orientation: "vertical",
    label: t("demo.radioGroup.label"),
  },
  slots: { items: radioGroupItems },
});

export const tileRadioGroupTree = (t: Translate): UsageTree => ({
  contract: "tile",
  signature: "TileRadioGroup",
  options: { name: "plan-tile", defaultValue: "pro", orientation: "horizontal" },
  /*
   * `class` rides through to the root untouched by the contract (see `attrs`'s own doc). Without
   * it the root is a bare, unstyled `div`: its items are `label`s with no layout declared for
   * their PARENT, so they stack as plain blocks flush against each other. `sk-inline` (flex row)
   * looks like the fix but is not: `.sk-tile--interactive:where(label){inline-size:100%}` makes
   * every item claim the FULL flex line, so a row of them still stacks one per line. `sk-tile-grid`
   * is tile.css's own gutter utility for exactly this. A grid track bounds each item's 100% to its
   * own column instead of the whole row, which is what actually puts them side by side with a gap.
   */
  attrs: { "aria-label": t("demo.radioGroup.label"), class: "sk-tile-grid" },
  slots: { items: tileRadioGroupItems(t) },
});

/*
 * A LIKERT SCALE IS A COMPOSITION, NOT A COMPONENT. There is no `sk-likert`: a scale is this
 * contract's own radio group laid across a Box, with the two ends named under it. Four points on
 * purpose, so a reader with an opinion has to lean instead of parking on a middle; three, five or
 * seven work the same way.
 */
const likertPoint = (value: string, label: string) => ({ options: { value }, slots: { label } });

export const radioGroupLikertTree = (t: Translate): UsageTree => ({
  /* A Wrapper, so the scale has a width to spread across: the preview stage sizes a demo to its content. */
  contract: "wrapper",
  signature: "Wrapper",
  options: { wrapperSize: "sm" },
  children: [
    {
      contract: "box",
      signature: "Box",
      options: { border: "subtle", padding: "sm" },
      children: [
        {
          contract: "layout",
          signature: "Stack",
          options: { gap: "xs" },
          children: [
            {
              contract: "radio-group",
              signature: "RadioGroup",
              options: {
                name: "likert-clarity",
                orientation: "horizontal",
                /* Equal steps, whatever each label weighs: what makes it read as a scale. */
                spread: true,
                label: t("radioGroupPage.likertLabel"),
              },
              slots: {
                items: [
                  likertPoint("1", t("demo.likert.one")),
                  likertPoint("2", t("demo.likert.two")),
                  likertPoint("3", t("demo.likert.three")),
                  likertPoint("4", t("demo.likert.four")),
                ],
              },
            },
            {
              contract: "layout",
              signature: "Inline",
              options: { justify: "between", gap: "md" },
              children: [
                { contract: "typography", signature: "Text", options: { size: "caption", tone: "secondary" }, children: t("demo.likert.min") },
                { contract: "typography", signature: "Text", options: { size: "caption", tone: "secondary" }, children: t("demo.likert.max") },
              ],
            },
          ],
        },
      ],
    },
  ],
});

/*
 * THE MATRIX: SEVERAL QUESTIONS, ONE SCALE. Every row is a question and every column a point, so the
 * scale is named once in the head instead of repeated under every row. Each cell holds a single
 * `Radio` whose `name` is its ROW: radios sharing a name are one group to the browser wherever they
 * sit in the DOM, which is what makes a table of them behave like one question per row. The cell's
 * radio carries no visible label, because the row header and the column header already name it.
 *
 * Four points, again on purpose: no middle to park on. Any count works, the head just grows.
 */
const matrixPoints = (t: Translate) => [
  { value: "1", label: t("demo.likert.one") },
  { value: "2", label: t("demo.likert.two") },
  { value: "3", label: t("demo.likert.three") },
  { value: "4", label: t("demo.likert.four") },
];

const matrixRow = (t: Translate, name: string, statement: string): UsageTree => ({
  contract: "table",
  signature: "TableRow",
  children: [
    {
      contract: "table",
      signature: "TableHeader",
      options: { scope: "row" },
      children: statement,
    },
    ...matrixPoints(t).map((point) => ({
      contract: "table",
      signature: "TableCell",
      children: [
        {
          contract: "radio-group",
          signature: "Radio",
          options: { name, value: point.value },
          /* Named by its row and its column: the statement plus the point, so a screen reader hears
             "Es fácil de usar, 3" instead of a bare radio in a grid of them. */
          attrs: { "aria-label": `${statement}: ${point.label}` },
        },
      ],
    })),
  ],
});

export const radioGroupMatrixTree = (t: Translate): UsageTree => ({
  contract: "table",
  signature: "Table",
  children: [
    { contract: "table", signature: "TableCaption", children: t("radioGroupPage.matrixCaption") },
    {
      contract: "table",
      signature: "TableHead",
      children: [
        {
          contract: "table",
          signature: "TableRow",
          children: [
            { contract: "table", signature: "TableHeader", children: t("radioGroupPage.matrixStatement") },
            ...matrixPoints(t).map((point) => ({
              contract: "table",
              signature: "TableHeader",
              children: point.label,
            })),
          ],
        },
      ],
    },
    {
      contract: "table",
      signature: "TableBody",
      children: [
        matrixRow(t, "matrix-easy", t("demo.matrix.easy")),
        matrixRow(t, "matrix-fast", t("demo.matrix.fast")),
        matrixRow(t, "matrix-recommend", t("demo.matrix.recommend")),
      ],
    },
  ],
});
