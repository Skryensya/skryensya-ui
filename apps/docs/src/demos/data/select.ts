import type { ItemInput } from "@skryensya/core/usage-tree";

/*
 * THE PLANS BOTH SELECT DEMOS OFFER. One list, used by the enhanced control and by the native one,
 * so the page cannot end up showing two different products depending on which binding is open.
 *
 * A constant rather than a function of `t`, unlike most demo data: plan names are product nouns and
 * stay written in every locale, so there is nothing here to translate.
 */
export const planItems: readonly ItemInput[] = [
  { options: { value: "starter" }, slots: { label: "Starter" } },
  { options: { value: "pro" }, slots: { label: "Pro" } },
  { options: { value: "enterprise" }, slots: { label: "Enterprise" } },
];
