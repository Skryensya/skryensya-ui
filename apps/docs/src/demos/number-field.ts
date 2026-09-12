import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { namePart } from "./annotation-parts";

/** Label, control, both steppers and the input: the spinbutton's own parts at rest. */
export const numberFieldAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("numberFieldPage.anatomyLabel"), inert: true },
  slots: {
    subject: {
      contract: "number-field",
      signature: "NumberField",
      options: {
        defaultValue: "5",
        decrementLabel: t("demo.numberField.decrement"),
        incrementLabel: t("demo.numberField.increment"),
        max: 20,
        min: 0,
        name: "quantity-anatomy",
        step: 1,
      },
      slots: { label: t("demo.numberField.label") },
    },
    items: [
      namePart(".sk-number-field", "block-start"),
      namePart(".sk-number-field__label", "inline-start"),
      namePart(".sk-number-field__control", "block-end"),
      namePart(".sk-number-field__decrement", "inline-start"),
      namePart(".sk-number-field__input", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-number-field__increment", "inline-end"),
    ],
  },
});

/** A bounded quantity with explicit names for both icon-only steppers. */
export const numberFieldTree = (t: Translate): UsageTree => ({
  contract: "number-field",
  signature: "NumberField",
  options: {
    defaultValue: "5",
    decrementLabel: t("demo.numberField.decrement"),
    incrementLabel: t("demo.numberField.increment"),
    max: 20,
    min: 0,
    name: "quantity",
    step: 1,
  },
  slots: { label: t("demo.numberField.label") },
});
